/**
 * Authentication & artisan-identity middleware for ShilpSaathi.
 *
 * Backend-managed JWT model (TextBee OTP):
 *   POST /api/auth/send-otp -> backend OTP via TextBee
 *   POST /api/auth/verify-otp -> backend verifies hash, issues app JWT
 *   Authorization: Bearer <app JWT> -> verified here with APP_JWT_SECRET.
 *
 * Artisan identity is resolved server-side by verified JWT claims and the
 * artisans table. Routes NEVER trust client-supplied artisan_id.
 */

import { supabase } from '../config/index.js';
import { verifyAppToken } from '../services/appToken.js';

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
 * Verifies the backend application JWT and resolves artisan server-side.
 *
 * On success: attaches req.artisan and req.appUser, calls next().
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
    // Verify the backend application JWT (HS256, server secret).
    const claims = verifyAppToken(token);

    if (!claims) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please sign in again.',
      });
    }

    // JWT identity: server-resolved artisan id + verified phone.
    const artisanId = String(claims.sub || '').trim();
    const phone = String(claims.phone || '').trim();
    if (!artisanId || !phone) {
      return res.status(403).json({
        success: false,
        message: 'Your account has no verified phone number.',
      });
    }

    // Resolve artisan by id AND phone (prevents id substitution).
    const { data: artisan, error: artisanError } = await supabase
      .from('artisans')
      .select('id, name, phone, preferred_language, location, created_at')
      .eq('id', artisanId)
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
    req.appUser = { artisanId: artisan.id, phone: artisan.phone };
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
    const claims = verifyAppToken(token);
    if (claims?.sub && claims?.phone) {
      const { data: artisan } = await supabase
        .from('artisans')
        .select('id, name, phone, preferred_language, location, created_at')
        .eq('id', String(claims.sub))
        .eq('phone', String(claims.phone))
        .maybeSingle();

      if (artisan) {
        req.artisan = artisan;
        req.appUser = { artisanId: artisan.id, phone: artisan.phone };
        req.authToken = token;
      }
    }
  } catch {
    // Silently ignore — optional auth failure should not block the request.
  }
  next();
}
