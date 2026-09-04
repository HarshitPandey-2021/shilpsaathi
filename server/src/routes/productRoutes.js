import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
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

router.get('/', asyncHandler(getAllProducts));
router.post('/', asyncHandler(createProduct));
router.get('/:id', asyncHandler(getProductById));
router.put('/:id', asyncHandler(updateProduct));
router.delete('/:id', asyncHandler(deleteProduct));
router.get('/:id/listing', asyncHandler(getProductListing));
router.patch('/:id/status', asyncHandler(updateProductStatus));

export default router;
