import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

function positiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  },
  storage: {
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'product-images',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  ai: {
    serviceUrl: process.env.AI_IMAGE_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_ENHANCE_TIMEOUT || '180000', 10),
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    globalWindowMs: positiveInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 15 * 60 * 1000),
    globalMax: positiveInt(process.env.RATE_LIMIT_GLOBAL_MAX, 600),
    strictWindowMs: positiveInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS, 10 * 60 * 1000),
    strictMax: positiveInt(process.env.RATE_LIMIT_STRICT_MAX, 20),
  },
};

export function isSupabaseConfigured() {
  return Boolean(config.supabase.url && config.supabase.key);
}

export let supabase = null;

if (isSupabaseConfigured()) {
  supabase = createClient(config.supabase.url, config.supabase.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
