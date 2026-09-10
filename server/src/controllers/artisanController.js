import * as artisanService from '../services/artisanService.js';
import { validateArtisanInput } from '../utils/validation.js';
import { successResponse, errorResponse, validationError, notFoundResponse } from '../utils/response.js';

/**
 * GET /api/artisans
 * AUTHENTICATED — sirf authenticated artisan ki hi info return karta hai.
 */
export async function getAllArtisans(req, res, next) {
  try {
    const artisanId = req.artisan?.id;
    if (!artisanId) {
      return errorResponse(res, 'Authentication required', 401);
    }
    const artisan = await artisanService.getArtisanById(artisanId);
    if (!artisan) return notFoundResponse(res, 'Artisan not found');
    return successResponse(res, [artisan], 'Artisan retrieved successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    next(err);
  }
}

/**
 * GET /api/artisans/:id
 * PUBLIC lekin phone number strip karta hai (PII protection).
 */
export async function getArtisanById(req, res, next) {
  try {
    const artisan = await artisanService.getArtisanById(req.params.id);
    if (!artisan) return notFoundResponse(res, 'Artisan not found');

    // Phone number public response mein nahi bhejna chahiye.
    const publicArtisan = {
      id: artisan.id,
      name: artisan.name,
      preferred_language: artisan.preferred_language,
      location: artisan.location,
      created_at: artisan.created_at,
    };
    return successResponse(res, publicArtisan, 'Artisan retrieved successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Artisan not found');
    next(err);
  }
}

/**
 * POST /api/artisans
 * AUTHENTICATED — authenticated user ke liye artisan create karo.
 */
export async function createArtisan(req, res, next) {
  try {
    const { isValid, errors } = validateArtisanInput(req.body);
    if (!isValid) return validationError(res, errors);

    const artisan = await artisanService.createArtisan({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      preferred_language: req.body.preferred_language || 'hi',
      location: req.body.location || null,
    });
    return successResponse(res, artisan, 'Artisan created successfully', 201);
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.code === '23505') {
      return errorResponse(res, 'An artisan with this phone number already exists', 409);
    }
    next(err);
  }
}

/**
 * PUT /api/artisans/:id
 * AUTHENTICATED + OWNER ONLY.
 */
export async function updateArtisan(req, res, next) {
  try {
    const authArtisanId = req.artisan?.id;
    if (!authArtisanId) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // Owner check — sirf apna hi artisan update kar sakta hai.
    if (req.params.id !== authArtisanId) {
      return errorResponse(res, 'You do not have permission to modify this artisan', 403);
    }

    const { isValid, errors } = validateArtisanInput(req.body, true);
    if (!isValid) return validationError(res, errors);

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name.trim();
    if (req.body.phone !== undefined) updateData.phone = req.body.phone.trim();
    if (req.body.preferred_language !== undefined) updateData.preferred_language = req.body.preferred_language;
    if (req.body.location !== undefined) updateData.location = req.body.location;

    const artisan = await artisanService.updateArtisan(req.params.id, updateData);
    if (!artisan) return notFoundResponse(res, 'Artisan not found');
    return successResponse(res, artisan, 'Artisan updated successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Artisan not found');
    if (err.code === '23505') {
      return errorResponse(res, 'An artisan with this phone number already exists', 409);
    }
    next(err);
  }
}

/**
 * DELETE /api/artisans/:id
 * AUTHENTICATED + OWNER ONLY.
 */
export async function deleteArtisan(req, res, next) {
  try {
    const authArtisanId = req.artisan?.id;
    if (!authArtisanId) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // Owner check — sirf apna hi artisan delete kar sakta hai.
    if (req.params.id !== authArtisanId) {
      return errorResponse(res, 'You do not have permission to delete this artisan', 403);
    }

    const artisan = await artisanService.deleteArtisan(req.params.id);
    if (!artisan) return notFoundResponse(res, 'Artisan not found');
    return successResponse(res, null, 'Artisan deleted successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Artisan not found');
    next(err);
  }
}
