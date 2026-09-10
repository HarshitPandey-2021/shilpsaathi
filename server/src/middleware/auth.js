/**
 * Authentication & artisan-identity middleware for ShilpSaathi.
 *
 * Phone-based JWT model:
 *   1. Frontend uses Supabase JS client SDK to perform phone OTP sign-in.
 *   2. Supabase issues a short-lived JWT (access_token).
 *   3. Frontend sends `Authorization: Bearer <token>` on every API call.
 *   4. This middleware verifies the token via Supabase, extracts the verified
 *      phone number, and resolves the corresponding artisan row server-side.
 *   5. The authenticated artisan is attached as req.artisan. Routes NEVER
 *      trust a client-supplied artisan_id for ownership decisions.
 *
 * Existing artisan migration:
 *   Artisans already have a canonical E.164 phone (+91XXXXXXXXXX). Supabase
 *   Auth also stores phone in E.164 after OTP verification, so a simple
 *   phone equality match links an authenticated user to their artisan record.
 */

import { supabase } from '../config/index.js';

/**
 * Extracts and validates a Bearer token from the Authorization header.
 */
function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Core authentication middleware.
 * Verifies the Supabase JWT and resolves the artisan identity server-side.
 *
 * On success: attaches req.artisan and req.supabaseUser, calls next().
 * On failure: returns 401/403 and does NOT call next().
 */
export async function authenticate(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      message: 'Authentication service not configured.',
    });
  }

  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Provide a Bearer token in the Authorization header.',
    });
  }

  try {
    // Verify the JWT via Supabase Auth.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please sign in again.',
      });
    }

    // The verified phone number is the canonical identity link.
    const phone = (user.phone || '').trim();
    if (!phone) {
      return res.status(403).json({
        success: false,
        message: 'Your account has no verified phone number.',
      });
    }

    // Resolve artisan by verified phone (E.164, unique).
    const { data: artisan, error: artisanError } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at')
      .eq('phone', phone)
      .maybeSingle();

    if (artisanError) {
      console.error('[Auth] Failed to resolve artisan:', artisanError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve artisan identity.',
      });
    }

    if (!artisan) {
      return res.status(403).json({
        success: false,
        message: 'No artisan profile found for this phone number. Please complete onboarding.',
      });
    }

    // Attach authenticated identity to the request.
    req.artisan = artisan;
    req.supabaseUser = user;
    req.authToken = token;
    next();
  } catch (err) {
    console.error('[Auth] Unexpected error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}

/**
 * Optional authentication — does not reject unauthenticated requests.
 * Attaches req.artisan if a valid token is present; otherwise leaves it undefined.
 * Used for endpoints that behave differently for authenticated vs anonymous users.
 */
export async function optionalAuth(req, res, next) {
  if (!supabase) return next();

  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user && user.phone) {
      const { data: artisan } = await supabase
        .from('artisans')
        .select('id, name, phone, preferred_language, location, created_at')
        .eq('phone', user.phone)
        .maybeSingle();

      if (artisan) {
        req.artisan = artisan;
        req.supabaseUser = user;
        req.authToken = token;
      }
    }
  } catch {
    // Silently ignore — optional auth failure should not block the request.
  }
  next();
}
