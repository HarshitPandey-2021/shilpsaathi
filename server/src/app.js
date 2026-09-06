import express from 'express';
import cors from 'cors';
import { config, isSupabaseConfigured } from './config/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import artisanRoutes from './routes/artisanRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { rateLimit } from './middleware/rateLimiter.js';

const app = express();

const allowedOrigins = (config.cors?.origin || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, mobile app, or tools with no origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShilpSaathi API',
    database: isSupabaseConfigured() ? 'connected' : 'not_configured',
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
// /api/health is registered above and is intentionally NOT rate limited so
// monitoring/liveness probes keep working. Limits are configurable via
// environment variables (see config/index.js).
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.globalWindowMs,
  max: config.rateLimit.globalMax,
  message: 'Too many requests. Please try again later.',
});

// Stricter limit for expensive/sensitive endpoints (image enhancement,
// permanent storage, voice transcription, catalog generation, pricing).
const aiLimiter = rateLimit({
  windowMs: config.rateLimit.strictWindowMs,
  max: config.rateLimit.strictMax,
  message: 'Too many processing requests. Please wait a moment and try again.',
});

if (config.rateLimit.enabled) {
  // Global baseline limit for all API routes (except /api/health).
  app.use('/api', apiLimiter);

  // Per-endpoint stricter limits.
  const strictAiPaths = [
    '/api/upload',
    '/api/enhance-image',
    '/api/process-voice',
    '/api/products/:id/transcribe',
    '/api/products/:id/generate-catalog',
    '/api/products/:id/pricing',
  ];
  for (const path of strictAiPaths) {
    app.use(path, aiLimiter);
  }
}

app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', aiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
