import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.js';
import { uploadProductImage, uploadProductImageStream, storePermanentImage } from '../controllers/uploadController.js';

const router = Router();

router.post('/', uploadSingleImage, handleUploadError, asyncHandler(uploadProductImage));
router.post('/stream', uploadSingleImage, handleUploadError, asyncHandler(uploadProductImageStream));
router.post('/permanent', asyncHandler(storePermanentImage));

export default router;
