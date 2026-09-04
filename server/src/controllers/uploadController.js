import * as storageService from '../services/storageService.js';
import { isSupabaseConfigured } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function uploadProductImage(req, res, next) {
  try {
    if (!isSupabaseConfigured()) {
      return errorResponse(res, 'Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }

    if (!req.file) {
      return errorResponse(res, 'No image file provided. Use field name "image".', 400);
    }

    const result = await storageService.uploadImage(req.file);
    return successResponse(res, {
      filePath: result.filePath,
      publicUrl: result.publicUrl,
    }, 'Image uploaded successfully', 201);
  } catch (err) {
    if (err.message?.includes('Storage bucket')) {
      return errorResponse(res, err.message, 500);
    }
    next(err);
  }
}
