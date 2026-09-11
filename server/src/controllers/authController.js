/**
 * Authentication controller for ShilpSaathi phone-based JWT model.
 *
 * The frontend performs the actual OTP flow using the Supabase JS client SDK
 * (signInWithOtp / verifyOtp). This controller provides server-side helpers:
 *
 *   - GET  /api/auth/me          -> current authenticated artisan profile
 *   - POST /api/auth/sync        -> ensure an artisan row exists for the
 *                                    verified phone (auto-creates if missing)
 *   - POST /api/auth/send-otp    -> server-initiated OTP (uses Supabase Admin)
 *   - POST /api/auth/verify-otp  -> server-initiated OTP verification
 */

import { supabase } from '../config/index.js';
import { normalizeIndianMobile } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Returns the authenticated artisan's profile.
 * Requires valid Bearer token (enforced by authenticate middleware).
 */
export async function getMe(req, res, next) {
  try {
    return successResponse(res, {
      artisan: req.artisan,
      user: {
        id: req.supabaseUser.id,
        phone: req.supabaseUser.phone,
        email: req.supabaseUser.email || null,
      },
    }, 'Authenticated identity retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Ensures an artisan row exists for the authenticated user's verified phone.
 * Auto-creates the artisan if it does not exist yet.
 */
export async function syncArtisan(req, res, next) {
  try {
    if (!supabase) {
      return errorResponse(res, 'Database not configured.', 503);
    }

    const phone = req.supabaseUser.phone;
    if (!phone) {
      return errorResponse(res, 'No verified phone on this account.', 400);
    }

    const authUserId = req.supabaseUser.id;

    const { data: existing } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at, auth_uid')
      .eq('phone', phone)
      .maybeSingle();

    if (existing) {
      // Link auth_uid if missing.
      if (existing.auth_uid !== authUserId) {
        const { data: linked } = await supabase
          .from('artisans')
          .update({ auth_uid: authUserId })
          .eq('id', existing.id)
          .select('id, name, phone, preferred_language, location, created_at')
          .single();
        if (linked) {
          return successResponse(res, { artisan: linked, created: false, linked: true }, 'Artisan profile synced');
        }
      }
      const { id, name: n, phone: p, preferred_language, location, created_at } = existing;
      return successResponse(res, { artisan: { id, name: n, phone: p, preferred_language, location, created_at }, created: false }, 'Artisan profile synced');
    }

    const name = req.body?.name?.trim() || 'Artisan';
    const preferredLanguage = req.body?.preferred_language || 'hi';
    const location = req.body?.location || null;

    const { data: created, error } = await supabase
      .from('artisans')
      .insert({ name, phone, preferred_language: preferredLanguage, location, auth_uid: authUserId })
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

    return successResponse(res, { artisan: created, created: true }, 'Artisan profile created', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Server-initiated OTP: sends a verification code to the given phone number.
 */
export async function sendOtp(req, res, next) {
  try {
    if (!supabase) {
      return errorResponse(res, 'Authentication service not configured.', 503);
    }

    const rawPhone = String(req.body?.phone || '').trim();
    const mobile = normalizeIndianMobile(rawPhone);

    if (!mobile.valid) {
      return errorResponse(res, mobile.error, 400);
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: mobile.normalized,
      options: { channel: 'sms' },
    });

    if (error) {
      console.error('[Auth] send-otp failed:', error.message);
      return errorResponse(res, 'Failed to send verification code. Please try again.', 500);
    }

    return successResponse(res, {
      phone: mobile.normalized,
      message: 'Verification code sent. Please check your SMS.',
    }, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Server-initiated OTP verification: verifies the code and returns the session.
 */
export async function verifyOtp(req, res, next) {
  try {
    if (!supabase) {
      return errorResponse(res, 'Authentication service not configured.', 503);
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

    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobile.normalized,
      token,
      type: 'sms',
    });

    if (error) {
      console.error('[Auth] verify-otp failed:', error.message);
      return errorResponse(res, 'Invalid or expired verification code.', 401);
    }

    if (!data.session || !data.user) {
      return errorResponse(res, 'Verification succeeded but no session returned.', 500);
    }

    const authUserId = data.user.id;

    // Lookup artisan by verified phone.
    const { data: existingArtisan } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at, auth_uid')
      .eq('phone', mobile.normalized)
      .maybeSingle();

    let artisan = existingArtisan;
    let created = false;
    let linked = false;

    if (artisan) {
      // Link auth_uid if not already set or if it changed.
      if (artisan.auth_uid !== authUserId) {
        const { data: linkedArtisan, error: linkError } = await supabase
          .from('artisans')
          .update({ auth_uid: authUserId })
          .eq('id', artisan.id)
          .select('id, name, phone, preferred_language, location, created_at')
          .single();
        if (!linkError && linkedArtisan) {
          artisan = linkedArtisan;
          linked = true;
        }
      }
    } else {
      // No artisan for this phone — create one linked to the auth user.
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
          auth_uid: authUserId,
        })
        .select('id, name, phone, preferred_language, location, created_at')
        .single();

      if (createError) {
        if (createError.code === '23505') {
          // Race: another request created the artisan. Re-link auth_uid.
          const { data: raced } = await supabase
            .from('artisans')
            .select('id, name, phone, preferred_language, location, created_at, auth_uid')
            .eq('phone', mobile.normalized)
            .single();
          if (raced && raced.auth_uid !== authUserId) {
            const { data: relinked } = await supabase
              .from('artisans')
              .update({ auth_uid: authUserId })
              .eq('id', raced.id)
              .select('id, name, phone, preferred_language, location, created_at')
              .single();
            if (relinked) { artisan = relinked; linked = true; }
          } else if (raced) {
            artisan = raced;
          }
        } else {
          console.error('[Auth] Failed to create artisan:', createError.message);
          return errorResponse(res, 'Failed to create artisan profile.', 500);
        }
      } else {
        artisan = newArtisan;
        created = true;
      }
    }

    return successResponse(res, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: 'Bearer',
      user: { id: authUserId, phone: data.user.phone },
      artisan: artisan || null,
      created,
      linked,
      needs_onboarding: !artisan,
    }, 'Phone verified successfully');
  } catch (err) {
    next(err);
  }
}
