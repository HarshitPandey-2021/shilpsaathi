import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadSingleAudio, handleUploadError } from '../middleware/upload.js';
import {
  enhanceImage,
  processVoice,
  calculatePrice,
  transcribe,
  generateCatalog,
  pricing,
  enhance,
} from '../controllers/aiController.js';

const router = Router();

router.post('/enhance-image', asyncHandler(enhanceImage));
router.post('/process-voice', uploadSingleAudio, handleUploadError, asyncHandler(processVoice));
router.post('/calculate-price', asyncHandler(calculatePrice));
router.post('/products/:id/transcribe', uploadSingleAudio, handleUploadError, asyncHandler(transcribe));
router.post('/products/:id/generate-catalog', asyncHandler(generateCatalog));
router.post('/products/:id/pricing', asyncHandler(pricing));
router.post('/products/:id/enhance', asyncHandler(enhance));

export default router;

