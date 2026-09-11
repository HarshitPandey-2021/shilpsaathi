/**
 * OTP Abuse Protection Middleware
 *
 * Application-level protection for Supabase OTP endpoints
 * (/api/auth/send-otp and /api/auth/verify-otp). This wraps the
 * existing Supabase Auth OTP flow with additional abuse-detection
 * so SMS credits are not exhausted by automated scripts and 6-digit
 * codes cannot be brute-forced.
 *
 * This does NOT replace Supabase Auth — it complements it.
 * This does NOT generate, store, or hash OTP values — it only tracks
 * send/verify attempt counts keyed by phone number.
 *
 * Suitable for single-instance deployments.
 * For multi-instance / HA, replace the in-memory store with a shared
 * store (e.g. Redis) while keeping the same middleware signature.
 * For production behind a reverse proxy, ensure Express `trust proxy`
 * is set so req.ip reflects the real client address.
 */

import { normalizeIndianMobile } from '../utils/validation.js';
import { config } from '../config/index.js';
import { errorResponse } from '../utils/response.js';

// --- Configuration ---

const SWEEP_INTERVAL_MS = 60 * 1000;
const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_MAX_SENDS = 10;

// Allow tests to mock time so cooldown/window/lock durations can be
// tested without real delays. In production _mockNow stays null.
let _mockNow = null;
function getNow() {
  return _mockNow !== null ? _mockNow : Date.now();
}


function getOtpConfig() {
  const o = config.otp || {};
  return {
    resendCooldownMs: o.resendCooldownMs ?? 60 * 1000,
    maxSendsPerWindow: o.maxSendsPerWindow ?? 5,
    sendWindowMs: o.sendWindowMs ?? 15 * 60 * 1000,
    maxSendsPerDay: o.maxSendsPerDay ?? 10,
    maxFailedAttempts: o.maxFailedAttempts ?? 5,
    lockDurationMs: o.lockDurationMs ?? 15 * 60 * 1000,
  };
}

// --- In-memory state store ---

const phoneStates = new Map();
const ipStates = new Map();

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getPhoneState(phone) {
  let s = phoneStates.get(phone);
  if (!s) {
    s = { lastSendAt: 0, sendTimestamps: [], sendsToday: 0, dayDate: todayDate(), failedAttempts: 0, lockedUntil: 0 };
    phoneStates.set(phone, s);
  }
  return s;
}

function getIpState(ip) {
  let s = ipStates.get(ip);
  if (!s) {
    s = { sendTimestamps: [] };
    ipStates.set(ip, s);
  }
  return s;
}

function setRetryAfter(res, seconds) {
  res.setHeader('Retry-After', String(Math.max(1, Math.ceil(seconds))));
}

function sweep() {
  const now = getNow();
  const cfg = getOtpConfig();
  for (const [phone, s] of phoneStates) {
    if (s.sendTimestamps.length) {
      s.sendTimestamps = s.sendTimestamps.filter((t) => now - t < cfg.sendWindowMs);
    }
    if (s.dayDate !== todayDate()) {
      s.sendsToday = 0;
      s.dayDate = todayDate();
    }
    const hasRecentSends = s.sendTimestamps.length > 0;
    const isLocked = s.lockedUntil > now;
    const hasFailedAttempts = s.failedAttempts > 0;
    if (!hasRecentSends && !isLocked && !hasFailedAttempts) {
      phoneStates.delete(phone);
    }
  }
  for (const [ip, s] of ipStates) {
    if (s.sendTimestamps.length) {
      s.sendTimestamps = s.sendTimestamps.filter((t) => now - t < IP_WINDOW_MS);
    }
    if (s.sendTimestamps.length === 0) {
      ipStates.delete(ip);
    }
  }
}

// --- Test helpers ---
/** Set a fixed "now" for testing (ms timestamp). Pass null to restore real time. */
export function _testSetNow(ts) { _mockNow = ts != null ? Number(ts) : null; }
/** Reset to real time. */
export function _testResetNow() { _mockNow = null; }

const sweepTimer = setInterval(sweep, SWEEP_INTERVAL_MS);
if (sweepTimer.unref) sweepTimer.unref();

// --- Send-otp protection middleware ---

/**
 * Middleware: protect /api/auth/send-otp.
 * Checks: phone lock, resend cooldown, per-phone window limit,
 * per-phone daily cap, per-IP limit.
 * If phone normalization fails, the request is passed through so
 * the controller can return the appropriate 400 error.
 */
export function otpSendProtection(req, res, next) {
  const rawPhone = String(req.body?.phone || '').trim();
  const mobile = normalizeIndianMobile(rawPhone);

  if (!mobile.valid) {
    return next();
  }

  const phone = mobile.normalized;
  const ip = getClientIp(req);
  const now = getNow();
  const cfg = getOtpConfig();

  // 1. Phone is locked from brute-force — block sends too.
  const ps = getPhoneState(phone);
  if (ps.lockedUntil > now) {
    setRetryAfter(res, (ps.lockedUntil - now) / 1000);
    return errorResponse(res, 'Too many requests. Please try again later.', 429);
  }

  // 2. Resend cooldown
  if (ps.lastSendAt > 0 && now - ps.lastSendAt < cfg.resendCooldownMs) {
    setRetryAfter(res, (cfg.resendCooldownMs - (now - ps.lastSendAt)) / 1000);
    return errorResponse(res, 'Please wait before requesting another verification code.', 429);
  }

  // 3. Per-phone window limit
  ps.sendTimestamps = ps.sendTimestamps.filter((t) => now - t < cfg.sendWindowMs);
  if (ps.sendTimestamps.length >= cfg.maxSendsPerWindow) {
    const oldest = ps.sendTimestamps[0];
    setRetryAfter(res, (cfg.sendWindowMs - (now - oldest)) / 1000);
    return errorResponse(res, 'Too many verification codes sent. Please try again later.', 429);
  }

  // 4. Per-phone daily limit
  if (ps.dayDate !== todayDate()) {
    ps.sendsToday = 0;
    ps.dayDate = todayDate();
  }
  if (ps.sendsToday >= cfg.maxSendsPerDay) {
    const msUntilMidnight = new Date(todayDate() + 'T24:00:00.000+00:00').getTime() - now;
    setRetryAfter(res, msUntilMidnight / 1000);
    return errorResponse(res, 'Daily limit reached. Please try again tomorrow.', 429);
  }

  // 5. Per-IP limit
  const ips = getIpState(ip);
  ips.sendTimestamps = ips.sendTimestamps.filter((t) => now - t < IP_WINDOW_MS);
  if (ips.sendTimestamps.length >= IP_MAX_SENDS) {
    const oldest = ips.sendTimestamps[0];
    setRetryAfter(res, (IP_WINDOW_MS - (now - oldest)) / 1000);
    return errorResponse(res, 'Too many requests. Please try again later.', 429);
  }

  // Record the send attempt
  ps.lastSendAt = now;
  ps.sendTimestamps.push(now);
  ps.sendsToday += 1;
  ips.sendTimestamps.push(now);

  next();
}

// --- Verify-otp protection middleware ---

/**
 * Middleware: protect /api/auth/verify-otp.
 * Pre-check: phone is not currently locked.
 * Wraps res.json to intercept the controller response:
 * - HTTP 200 success -> clear failed attempts and lock.
 * - HTTP 401 failure -> increment failed attempts; lock after threshold.
 * If phone normalization fails, the request is passed through so
 * the controller can return the appropriate 400 error.
 */
export function otpVerifyProtection(req, res, next) {
  const rawPhone = String(req.body?.phone || '').trim();
  const mobile = normalizeIndianMobile(rawPhone);

  if (!mobile.valid) {
    return next();
  }

  const phone = mobile.normalized;
  const now = getNow();
  const cfg = getOtpConfig();

  const ps = getPhoneState(phone);

  // Pre-check: locked?
  if (ps.lockedUntil > now) {
    setRetryAfter(res, (ps.lockedUntil - now) / 1000);
    return errorResponse(res, 'Too many failed attempts. Please try again later.', 429);
  }

  // Intercept the response to update state based on the outcome.
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const statusCode = res.statusCode || 200;

    if (statusCode === 200 && body && body.success === true) {
      ps.failedAttempts = 0;
      ps.lockedUntil = 0;
    } else if (statusCode === 401) {
      ps.failedAttempts += 1;
      if (ps.failedAttempts >= cfg.maxFailedAttempts) {
        ps.lockedUntil = now + cfg.lockDurationMs;
        ps.failedAttempts = 0;
      }
    }

    return originalJson(body);
  };

  next();
}

// --- Internal helpers (for tests) ---

/** Clear all OTP state (for test isolation). */
export function resetOtpState() {
  phoneStates.clear();
  ipStates.clear();
}

/** Inspect internal state for testing purposes. Returns shallow copies. */
export function _inspectOtpState() {
  const phones = {};
  for (const [k, v] of phoneStates.entries()) {
    phones[k] = { ...v, sendTimestamps: [...v.sendTimestamps] };
  }
  const ips = {};
  for (const [k, v] of ipStates.entries()) {
    ips[k] = { sendTimestamps: [...v.sendTimestamps] };
  }
  return { phones, ips };
}
