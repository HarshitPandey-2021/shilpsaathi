import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

function positiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeUrl(url, fallback) {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed.replace(/\/+$/, '')}`;
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
    serviceUrl: normalizeUrl(process.env.AI_IMAGE_SERVICE_URL, 'http://localhost:8000'),
    timeout: parseInt(process.env.AI_ENHANCE_TIMEOUT || '180000', 10),
  },
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || '').trim(),
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    enabled: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().length > 0 : false,
  },
  groq: {
    apiKey: (process.env.GROQ_API_KEY || '').trim(),
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    enabled: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim().length > 0 : false,
    timeoutMs: parseInt(process.env.GROQ_TIMEOUT_MS || '30000', 10),
  },
  openrouter: {
    apiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
    llmModel: process.env.OPENROUTER_LLM_MODEL || 'openai/gpt-4o-mini',
    sttModel: process.env.OPENROUTER_STT_MODEL || 'openai/whisper-large-v3',
    enabled: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.trim().length > 0 : false,
    referer: process.env.OPENROUTER_REFERER || 'http://localhost:5000',
    title: process.env.OPENROUTER_TITLE || 'ShilpSaathi',
    timeoutMs: parseInt(process.env.OPENROUTER_TIMEOUT_MS || '45000', 10),
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    globalWindowMs: positiveInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 15 * 60 * 1000),
    globalMax: positiveInt(process.env.RATE_LIMIT_GLOBAL_MAX, 600),
    strictWindowMs: positiveInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS, 10 * 60 * 1000),
    strictMax: positiveInt(process.env.RATE_LIMIT_STRICT_MAX, 20),
  },
  otp: {
    resendCooldownMs: positiveInt(process.env.OTP_RESEND_COOLDOWN_MS, 60 * 1000),
    maxSendsPerWindow: positiveInt(process.env.OTP_MAX_SENDS_PER_WINDOW, 5),
    sendWindowMs: positiveInt(process.env.OTP_SEND_WINDOW_MS, 15 * 60 * 1000),
    maxSendsPerDay: positiveInt(process.env.OTP_MAX_SENDS_PER_DAY, 10),
    maxFailedAttempts: positiveInt(process.env.OTP_MAX_FAILED_ATTEMPTS, 5),
    lockDurationMs: positiveInt(process.env.OTP_LOCK_DURATION_MS, 15 * 60 * 1000),
  },
  brevo: {
    apiKey: (process.env.BREVO_API_KEY || '').trim(),
    smsSender: (process.env.BREVO_SMS_SENDER || '').trim(),
  },
  smsHook: {
    secret: (process.env.SUPABASE_SMS_HOOK_SECRET || '').trim(),
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
