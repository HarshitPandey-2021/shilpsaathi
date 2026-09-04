import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.js';
import { uploadProductImage } from '../controllers/uploadController.js';

const router = Router();

router.post('/', uploadSingleImage, handleUploadError, asyncHandler(uploadProductImage));

export default router;
