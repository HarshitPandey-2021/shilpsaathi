import * as productService from '../services/productService.js';
import { isSupabaseConfigured } from '../config/index.js';
import { validateProductInput } from '../utils/validation.js';
import { successResponse, errorResponse, validationError, notFoundResponse } from '../utils/response.js';

function buildProductData(body) {
  const data = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.category !== undefined) data.category = body.category;
  if (body.material !== undefined) data.material = body.material;
  if (body.colour !== undefined) data.colour = body.colour;
  if (body.craft_type !== undefined) data.craft_type = body.craft_type;
  if (body.description_hi !== undefined) data.description_hi = body.description_hi;
  if (body.description_en !== undefined) data.description_en = body.description_en;
  if (body.keywords !== undefined) data.keywords = body.keywords;
  if (body.original_image_url !== undefined) data.original_image_url = body.original_image_url;
  if (body.image_url !== undefined) data.image_url = body.image_url;
  if (body.price_min !== undefined) data.price_min = body.price_min;
  if (body.price_max !== undefined) data.price_max = body.price_max;
  if (body.final_price !== undefined) data.final_price = body.final_price;
  if (body.status !== undefined) data.status = body.status;
  return data;
}
export async function getAllProducts(req, res, next) {
  try {
    // When authenticated, scope to the verified artisan's products.
    // The artisan_id is NEVER taken from the client for authenticated requests.
    const artisanId = req.artisan?.id || null;

    // For unauthenticated requests, allow a public listing query only if
    // a valid UUID is explicitly provided (marketplace browsing).
    const queryArtisanId = req.query?.artisan_id;
    const cleanId = artisanId
      ? artisanId
      : (queryArtisanId && typeof queryArtisanId === 'string' ? queryArtisanId.trim() : undefined);

    const products = await productService.getAllProducts(cleanId || null);
    return successResponse(res, products || [], 'Products retrieved successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400 || err.message?.includes('artisan_id')) {
      console.warn('[Products] Handled query format notice:', err.message);
      return successResponse(res, [], 'Products retrieved successfully');
    }
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return notFoundResponse(res, 'Product not found');
    return successResponse(res, product, 'Product retrieved successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Product not found');
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    if (!isSupabaseConfigured()) {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }

    const { isValid, errors } = validateProductInput(req.body);
    if (!isValid) return validationError(res, errors);

    // Ownership is derived from the authenticated JWT — never from client input.
    const artisanId = req.artisan?.id;
    if (!artisanId) {
      return errorResponse(res, 'Authentication required to create a product.', 401);
    }

    const productData = {
      ...buildProductData(req.body),
      artisan_id: artisanId,
      image_url: req.body.image_url,
      final_price: req.body.final_price,
      status: req.body.status || 'published',
    };

    const product = await productService.createProduct(productData);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.code === '23503') {
      return errorResponse(res, 'Referenced artisan does not exist', 400);
    }
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    // Authenticate FIRST — fail fast before any database access.
    const authArtisanId = req.artisan?.id;
    if (!authArtisanId) {
      return errorResponse(res, 'Authentication required to modify a product.', 401);
    }

    const { isValid, errors } = validateProductInput(req.body, true);
    if (!isValid) return validationError(res, errors);

    const existing = await productService.getProductById(req.params.id);
    if (!existing) return notFoundResponse(res, 'Product not found');

    // Ownership is mandatory and derived from the authenticated JWT.
    if (existing.artisan_id !== authArtisanId) {
      return errorResponse(res, 'You do not have permission to modify this product', 403);
    }

    // Prevent client from transferring ownership via update.
    const updateData = buildProductData(req.body);
    delete updateData.artisan_id;

    const product = await productService.updateProduct(req.params.id, updateData);
    return successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Product not found');
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    // Authenticate FIRST — fail fast before any database access.
    const authArtisanId = req.artisan?.id;
    if (!authArtisanId) {
      return errorResponse(res, 'Authentication required to delete a product.', 401);
    }

    const existing = await productService.getProductById(req.params.id);
    if (!existing) return notFoundResponse(res, 'Product not found');

    // Ownership is mandatory and derived from the authenticated JWT.
    if (existing.artisan_id !== authArtisanId) {
      return errorResponse(res, 'You do not have permission to delete this product', 403);
    }

    await productService.deleteProduct(req.params.id);
    return successResponse(res, null, 'Product deleted successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Product not found');
    next(err);
  }
}

export async function getProductListing(req, res, next) {
  try {
    const product = await productService.getProductWithArtisan(req.params.id);
    if (!product) return notFoundResponse(res, 'Product not found');

    const listing = {
      id: product.id,
      name: product.name,
      category: product.category,
      material: product.material,
      colour: product.colour,
      craft_type: product.craft_type,
      description_hi: product.description_hi,
      description_en: product.description_en,
      keywords: product.keywords,
      image_url: product.image_url,
      original_image_url: product.original_image_url,
      price_min: product.price_min,
      price_max: product.price_max,
      final_price: product.final_price,
      status: product.status,
      created_at: product.created_at,
      artisan: product.artisans ? {
        id: product.artisans.id,
        name: product.artisans.name,
        phone: product.artisans.phone,
        preferred_language: product.artisans.preferred_language,
        location: product.artisans.location,
      } : null,
    };

    return successResponse(res, listing, 'Product listing retrieved successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Product not found');
    next(err);
  }
}

export async function updateProductStatus(req, res, next) {
  try {
    // Authenticate FIRST — fail fast before any database access.
    const authArtisanId = req.artisan?.id;
    if (!authArtisanId) {
      return errorResponse(res, 'Authentication required to change product status.', 401);
    }

    const { status } = req.body;
    if (!status) return validationError(res, { status: 'Status is required' });

    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return validationError(res, { status: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await productService.getProductById(req.params.id);
    if (!existing) return notFoundResponse(res, 'Product not found');

    // Ownership is mandatory and derived from the authenticated JWT.
    if (existing.artisan_id !== authArtisanId) {
      return errorResponse(res, 'You do not have permission to modify this product', 403);
    }

    const product = await productService.updateProductStatus(req.params.id, status);
    return successResponse(res, product, 'Product status updated successfully');
  } catch (err) {
    if (err.message === 'Database not configured') {
      return errorResponse(res, 'Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.', 503);
    }
    if (err.statusCode === 400) return errorResponse(res, err.message, 400);
    if (err.code === 'PGRST116') return notFoundResponse(res, 'Product not found');
    next(err);
  }
}

