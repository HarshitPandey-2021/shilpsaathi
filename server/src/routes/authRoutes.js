import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { otpSendProtection, otpVerifyProtection } from '../middleware/otpProtection.js';
import {
  getMe,
  syncArtisan,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';

const router = Router();

// Public onboarding endpoints (no auth required).
// OTP abuse protection guards both the send and verify paths to prevent
// SMS-credit exhaustion and brute-force attacks. OTPs are backend-managed
// (TextBee delivery); no Supabase Auth OTP is used.
router.post('/send-otp', otpSendProtection, asyncHandler(sendOtp));
router.post('/verify-otp', otpVerifyProtection, asyncHandler(verifyOtp));

// Authenticated endpoints (require valid Bearer token).
router.get('/me', authenticate, asyncHandler(getMe));
router.post('/sync', authenticate, asyncHandler(syncArtisan));

export default router;
