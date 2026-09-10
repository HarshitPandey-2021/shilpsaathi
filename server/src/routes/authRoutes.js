import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getMe,
  syncArtisan,
  sendOtp,
  verifyOtp,
} from '../controllers/authController.js';

const router = Router();

// Public onboarding endpoints (no auth required).
router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));

// Authenticated endpoints (require valid Bearer token).
router.get('/me', authenticate, asyncHandler(getMe));
router.post('/sync', authenticate, asyncHandler(syncArtisan));

export default router;
