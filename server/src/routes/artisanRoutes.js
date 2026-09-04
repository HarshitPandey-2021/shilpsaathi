import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllArtisans,
  getArtisanById,
  createArtisan,
  updateArtisan,
  deleteArtisan,
} from '../controllers/artisanController.js';

const router = Router();

router.get('/', asyncHandler(getAllArtisans));
router.get('/:id', asyncHandler(getArtisanById));
router.post('/', asyncHandler(createArtisan));
router.put('/:id', asyncHandler(updateArtisan));
router.delete('/:id', asyncHandler(deleteArtisan));

export default router;
