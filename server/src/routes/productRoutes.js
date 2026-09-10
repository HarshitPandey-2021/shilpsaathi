import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductListing,
  updateProductStatus,
} from '../controllers/productController.js';

const router = Router();

// Public routes.
router.get('/', optionalAuth, asyncHandler(getAllProducts));
router.get('/:id', asyncHandler(getProductById));
router.get('/:id/listing', asyncHandler(getProductListing));

// Authenticated routes — ownership derived from verified JWT, never from client.
router.post('/', authenticate, asyncHandler(createProduct));
router.put('/:id', authenticate, asyncHandler(updateProduct));
router.delete('/:id', authenticate, asyncHandler(deleteProduct));
router.patch('/:id/status', authenticate, asyncHandler(updateProductStatus));

export default router;
