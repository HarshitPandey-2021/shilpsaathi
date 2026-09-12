/**
 * Backend-managed phone OTP + application JWT session.
 * Replaces Supabase Auth OTP. Supabase PostgreSQL/Storage stay as data layer.
 * Plaintext OTP is never persisted or logged; only HMAC-SHA256 is stored.
 */

import crypto from 'node:crypto';
import { config } from '../config/index.js';

const TEXTBEE_SEND_URL = 'https://api.textbee.dev/api/v1/gateway/send-sms';

// phone -> { otpHash, createdAt, expiresAt, failedAttempts, lockedUntil, used }
const otpStore = new Map();
function now() { return Date.now(); }
function getJwtSecret() { return (config.appAuth?.jwtSecret || '').trim(); }
function getOtpPepper() { return (config.appAuth?.otpPepper || getJwtSecret()).trim(); }

export function otpConfig() {
  return {
    length: config.otp?.length || 6,
    ttlMs: config.otp?.ttlMs || 5 * 60 * 1000,
    maxFailedAttempts: config.otp?.maxFailedAttempts || 5,
    lockDurationMs: config.otp?.lockDurationMs || 15 * 60 * 1000,
  };
}

export function generateOtp(length = otpConfig().length) {
  const n = Math.max(4, Math.min(10, Number(length) || 6));
  let code = '';
  for (let i = 0; i < n; i += 1) code += String(crypto.randomInt(0, 10));
  return code;
}

export function hashOtp(otp, phone) {
  const pepper = getOtpPepper();
  return crypto.createHmac('sha256', pepper || 'shilpsaathi-otp-pepper-not-configured')
    .update(`${phone}:${otp}`).digest('hex');
}

export function buildOtpMessage(otp) {
  return `Your ShilpSaathi verification code is: ${otp}. It expires soon.`;
}

export function buildTextBeeRequest({ phone, message }) {
  return {
    url: TEXTBEE_SEND_URL,
    headers: { 'content-type': 'application/json', 'x-api-key': config.textbee?.apiKey || '' },
    body: { recipients: [phone], message },
  };
}

export async function sendTextBeeSms({ phone, message }, fetchImpl = fetch) {
  const apiKey = (config.textbee?.apiKey || '').trim();
  if (!apiKey) throw Object.assign(new Error('SMS provider is not configured.'), { statusCode: 500 });
  const request = buildTextBeeRequest({ phone, message });
  let res;
  try {
    res = await fetchImpl(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body) });
  } catch {
    throw Object.assign(new Error('Failed to deliver verification SMS.'), { statusCode: 502 });
  }
  if (!res.ok) {
    const err = new Error('Failed to deliver verification SMS.');
    err.statusCode = 502;
    err.providerStatus = res.status;
    throw err;
  }
  return true;
}

export function issueOtp(phone, { nowMs = now() } = {}) {
  const cfg = otpConfig();
  const otp = generateOtp(cfg.length);
  otpStore.set(phone, {
    otpHash: hashOtp(otp, phone),
    createdAt: nowMs,
    expiresAt: nowMs + cfg.ttlMs,
    failedAttempts: 0,
    lockedUntil: 0,
    used: false,
  });
  return otp;
}

export function peekOtpState(phone) { return otpStore.get(phone) || null; }
export function clearOtpState(phone) { otpStore.delete(phone); }
export function resetOtpStore() { otpStore.clear(); }

export function verifyStoredOtp(phone, otp, { nowMs = now() } = {}) {
  const cfg = otpConfig();
  const state = otpStore.get(phone);
  if (!state || state.used) return { ok: false, reason: 'not_found' };
  if (state.lockedUntil > nowMs) return { ok: false, reason: 'locked', lockedUntil: state.lockedUntil };
  if (state.expiresAt <= nowMs) { otpStore.delete(phone); return { ok: false, reason: 'expired' }; }
  const candidate = hashOtp(String(otp || '').trim(), phone);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(state.otpHash, 'hex');
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!match) {
    state.failedAttempts += 1;
    if (state.failedAttempts >= cfg.maxFailedAttempts) {
      state.lockedUntil = nowMs + cfg.lockDurationMs;
      state.failedAttempts = 0;
    }
    return { ok: false, reason: state.lockedUntil > nowMs ? 'locked' : 'mismatch', failedAttempts: state.failedAttempts };
  }
  otpStore.delete(phone);
  return { ok: true };
}
