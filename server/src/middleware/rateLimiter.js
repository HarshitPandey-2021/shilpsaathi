/**
 * Minimal in-memory fixed-window rate limiter for the ShilpSaathi API.
 *
 * No external dependencies; window sizes and request limits are configured in
 * config/index.js and can be overridden via environment variables. Suitable
 * for single-instance deployments. For multi-instance/high-availability
 * deployments, replace the in-memory store with a shared store (e.g. Redis)
 * while keeping the same middleware signature. When behind a reverse proxy,
 * the server should be configured with `trust proxy` so `req.ip` reflects the
 * real client address.
 */

const SWEEP_MS = 60 * 1000;

/**
 * Create a fixed-window rate limiter middleware.
 *
 * @param {object} opts
 * @param {number} opts.windowMs - window length in milliseconds.
 * @param {number} opts.max - maximum number of requests allowed per window.
 * @param {string} opts.message - message returned when the limit is exceeded.
 */
export function rateLimit({ windowMs = 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) {
  // Each limiter instance keeps its own store so multiple limiters mounted on
  // the same path (e.g. global + strict) never interfere with each other.
  const store = new Map();

  // Periodically purge expired windows so the store does not grow unboundedly.
  const sweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart >= entry.windowMs) {
        store.delete(key);
      }
    }
  }, SWEEP_MS);

  if (sweepTimer.unref) sweepTimer.unref();

  return function rateLimiter(req, res, next) {
    // Never block CORS preflight requests.
    if (req.method === 'OPTIONS') return next();

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = store.get(ip);
    if (!entry || now - entry.windowStart >= entry.windowMs) {
      store.set(ip, { windowStart: now, count: 1, windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.windowStart + entry.windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
}