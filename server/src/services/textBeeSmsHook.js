/**
 * Supabase Send SMS Hook → TextBee SMS delivery.
 *
 * Architecture (unchanged auth flow):
 *   POST /api/auth/send-otp → otpProtection → supabase.auth.signInWithOtp()
 *     → Supabase invokes THIS hook with { user: { phone }, sms: { otp } }
 *     → this handler delivers the Supabase-generated OTP via TextBee only.
 *
 * Verification stays untouched: POST /api/auth/verify-otp →
 * supabase.auth.verifyOtp() → JWT/artisan flow.
 *
 * This module NEVER generates, stores, or verifies OTPs. The OTP value is
 * used only in-memory to build the TextBee request body and is never logged.
 */

import { config } from '../config/index.js';
import { normalizeIndianMobile } from '../utils/validation.js';

const TEXTBEE_SEND_URL = 'https://api.textbee.dev/api/v1/gateway/send-sms';

function safeEqual(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  if (!x || !y || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i += 1) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

/**
 * Extract { phone, otp } from the Supabase Send SMS Hook payload.
 * Official shape: { user: { phone }, sms: { otp } }.
 * Never logs the payload (it contains the OTP).
 */
export function extractSmsHookPayload(body) {
  const rawPhone = body?.user?.phone;
  const rawOtp = body?.sms?.otp;
  const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
  const otp = typeof rawOtp === 'string' ? rawOtp.trim() : '';
  if (!phone) return { valid: false, error: 'Missing user.phone in hook payload.' };
  const mobile = normalizeIndianMobile(phone);
  if (!mobile.valid) return { valid: false, error: 'Invalid phone in hook payload.' };
  // Supabase SMS OTPs are short numeric codes; enforce a conservative shape.
  if (!/^\d{4,10}$/.test(otp)) return { valid: false, error: 'Invalid OTP in hook payload.' };
  return { valid: true, phone: mobile.normalized, otp };
}

export function buildTextBeeSmsRequest({ phone, otp }) {
  return {
    url: TEXTBEE_SEND_URL,
    headers: { 'content-type': 'application/json', 'x-api-key': config.textbee?.apiKey || '' },
    body: {
      recipients: [phone],
      message: `Your ShilpSaathi verification code is: ${otp}. It expires soon.`,
    },
  };
}

/**
 * Express handler for the Supabase Send SMS Hook.
 * Supabase calls this with `Authorization: Bearer <SUPABASE_SMS_HOOK_SECRET>`.
 */
export async function handleSendSmsHook(req, res) {
  const expected = config.smsHook?.secret || '';
  const header = req.headers?.authorization || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!expected || !safeEqual(provided, expected)) {
    return res.status(401).json({ success: false, message: 'Unauthorized hook request.' });
  }

  const extracted = extractSmsHookPayload(req.body);
  if (!extracted.valid) {
    return res.status(400).json({ success: false, message: extracted.error });
  }

  const apiKey = (config.textbee?.apiKey || '').trim();
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'SMS provider is not configured.' });
  }

  const request = buildTextBeeSmsRequest(extracted);

  try {
    const textBeeRes = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body),
    });
    if (!textBeeRes.ok) {
      return res.status(502).json({ success: false, message: 'Failed to deliver verification SMS.' });
    }
    // Supabase treats empty 200 as hook success.
    return res.status(200).json({});
  } catch {
    return res.status(502).json({ success: false, message: 'Failed to deliver verification SMS.' });
  }
}
