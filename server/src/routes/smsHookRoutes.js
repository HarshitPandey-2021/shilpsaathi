import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleSendSmsHook } from '../services/brevoSmsHook.js';

const router = Router();

// Supabase Auth → Send SMS Hook (HTTP). Supabase authenticates with
// `Authorization: Bearer <SUPABASE_SMS_HOOK_SECRET>`; the handler verifies it.
// Not part of the public frontend API and intentionally NOT rate-limited with
// the OTP abuse middleware (Supabase itself is the only caller).
router.post('/send-sms', asyncHandler(handleSendSmsHook));

export default router;
