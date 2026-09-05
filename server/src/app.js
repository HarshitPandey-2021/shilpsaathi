import express from 'express';
import cors from 'cors';
import { config, isSupabaseConfigured } from './config/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import artisanRoutes from './routes/artisanRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

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

app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', aiRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
