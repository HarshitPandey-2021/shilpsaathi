import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

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
