/**
 * Authentication controller: backend-managed phone OTP via TextBee.
 *
 *   - POST /api/auth/send-otp   -> generate OTP, store hash, send via TextBee
 *   - POST /api/auth/verify-otp -> verify hash, issue application JWT
 *   - GET  /api/auth/me         -> current authenticated artisan profile
 *   - POST /api/auth/sync       -> ensure artisan row for verified session
 *
 * Supabase Auth OTP phone methods and the Send SMS Hook are
 * intentionally no longer used. Supabase PostgreSQL/Storage remain the
 * data layer.
 */

import { supabase } from '../config/index.js';
import { normalizeIndianMobile } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  issueOtp,
  clearOtpState,
  verifyStoredOtp,
  buildOtpMessage,
  sendTextBeeSms,
} from '../services/appOtpAuth.js';
import { signAppToken } from '../services/appToken.js';

/**
 * Returns the authenticated artisan's profile.
 * Requires valid Bearer token (enforced by authenticate middleware).
 */
export async function getMe(req, res, next) {
  try {
    return successResponse(res, {
      artisan: req.artisan,
      user: {
        id: req.artisan?.id || null,
        phone: req.artisan?.phone || req.appUser?.phone || null,
        email: null,
      },
    }, 'Authenticated identity retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Ensures an artisan row exists for the authenticated session's phone.
 * Auto-creates the artisan if it does not exist yet.
 */
export async function syncArtisan(req, res, next) {
  try {
    if (!supabase) {
      return errorResponse(res, 'Database not configured.', 503);
    }

    const phone = req.artisan?.phone || req.appUser?.phone;
    if (!phone) {
      return errorResponse(res, 'No verified phone on this account.', 400);
    }

    const { data: existing } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      return successResponse(res, { artisan: existing, created: false }, 'Artisan profile synced');
    }

    const name = req.body?.name?.trim() || 'Artisan';
    const preferredLanguage = req.body?.preferred_language || 'hi';
    const location = req.body?.location || null;

    const { data: created, error } = await supabase
      .from('artisans')
      .insert({ name, phone, preferred_language: preferredLanguage, location })
      .select('id, name, phone, preferred_language, location, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: raced } = await supabase
          .from('artisans')
          .select('id, name, phone, preferred_language, location, created_at')
          .eq('phone', phone)
          .single();
        if (raced) {
          return successResponse(res, { artisan: raced, created: false }, 'Artisan profile synced');
        }
      }
      console.error('[Auth] Failed to create artisan:', error.message);
      return errorResponse(res, 'Failed to create artisan profile.', 500);
    }

    return successResponse(res, { artisan: created, created: true }, 'Artisan profile created');
  } catch (err) {
    next(err);
  }
}

/**
 * Backend-managed OTP send: generate OTP, store hash, deliver via TextBee.
 * Plaintext OTP is never stored or logged.
 */
export async function sendOtp(req, res, next) {
  let phone = null;
  try {
    const rawPhone = String(req.body?.phone || '').trim();
    const mobile = normalizeIndianMobile(rawPhone);

    if (!mobile.valid) {
      return errorResponse(res, mobile.error, 400);
    }
    phone = mobile.normalized;

    const otp = issueOtp(phone);
    try {
      await sendTextBeeSms({ phone, message: buildOtpMessage(otp) });
    } catch (err) {
      clearOtpState(phone);
      const status = err.statusCode || 502;
      if (status === 500) {
        return errorResponse(res, 'SMS provider is not configured.', 500);
      }
      console.error('[Auth] send-otp delivery failed.');
      return errorResponse(res, 'Failed to send verification code. Please try again.', 502);
    }

    return successResponse(res, {
      phone,
      message: 'Verification code sent. Please check your SMS.',
    }, 'OTP sent successfully');
  } catch (err) {
    if (phone) clearOtpState(phone);
    next(err);
  }
}

/**
 * Backend-managed OTP verification: checks hash, issues application JWT.
 * OTP is single-use; artisan is resolved/created server-side by phone.
 */
export async function verifyOtp(req, res, next) {
  try {
    if (!supabase) {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }

    const rawPhone = String(req.body?.phone || '').trim();
    const token = String(req.body?.token || '').trim();
    const mobile = normalizeIndianMobile(rawPhone);

    if (!mobile.valid) {
      return errorResponse(res, mobile.error, 400);
    }

    if (!token || token.length < 4) {
      return errorResponse(res, 'Verification code is required.', 400);
    }

    const check = verifyStoredOtp(mobile.normalized, token);
    if (!check.ok) {
      if (check.reason === 'locked') {
        return errorResponse(res, 'Too many failed attempts. Please try again later.', 429);
      }
      return errorResponse(res, 'Invalid or expired verification code.', 401);
    }

    // Lookup artisan by verified phone; reuse existing row, else create once.
    const { data: existingArtisan } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at')
      .eq('phone', mobile.normalized)
      .maybeSingle();

    let artisan = existingArtisan;
    let created = false;

    if (!artisan) {
      const name = req.body?.name?.trim() || 'Artisan';
      const preferredLanguage = req.body?.preferred_language || 'hi';
      const location = req.body?.location || null;

      const { data: newArtisan, error: createError } = await supabase
        .from('artisans')
        .insert({
          name,
          phone: mobile.normalized,
          preferred_language: preferredLanguage,
          location,
        })
        .select('id, name, phone, preferred_language, location, created_at')
        .single();

      if (createError) {
        if (createError.code === '23505') {
          const { data: raced } = await supabase
            .from('artisans')
            .select('id, name, phone, preferred_language, location, created_at')
            .eq('phone', mobile.normalized)
            .single();
          if (raced) {
            artisan = raced;
          } else {
            console.error('[Auth] Failed to create artisan.');
            return errorResponse(res, 'Failed to create artisan profile.', 500);
          }
        } else {
          console.error('[Auth] Failed to create artisan.');
          return errorResponse(res, 'Failed to create artisan profile.', 500);
        }
      } else {
        artisan = newArtisan;
        created = true;
      }
    }

    let accessToken;
    try {
      accessToken = signAppToken({ artisanId: artisan.id, phone: artisan.phone });
    } catch (err) {
      return errorResponse(res, 'Authentication is not configured.', err.statusCode || 503);
    }

    return successResponse(res, {
      access_token: accessToken,
      token_type: 'Bearer',
      user: { id: artisan.id, phone: artisan.phone },
      artisan: artisan || null,
      created,
      needs_onboarding: !artisan,
    }, 'Phone verified successfully');
  } catch (err) {
    next(err);
  }
}
