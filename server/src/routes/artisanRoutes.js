import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../config/index.js';
import {
  getAllArtisans,
  getArtisanById,
  createArtisan,
  updateArtisan,
  deleteArtisan,
} from '../controllers/artisanController.js';

const router = Router();
// Deferred identity: resolve (or lazily create) an artisan from a phone or device id.
router.post('/resolve', asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  const handle = String(req.body?.handle || '').trim();
  if (!handle || handle.length > 20) {
    return res.status(422).json({ success: false, message: 'handle is required (max 20 chars)' });
  }

  const { data: existing } = await supabase
    .from('artisans').select('*').eq('phone', handle).maybeSingle();

  if (existing) {
    return res.json({ success: true, message: 'Artisan resolved', data: existing });
  }

  const { data: created, error } = await supabase
    .from('artisans')
    .insert({
      name: req.body?.name?.trim() || 'Artisan',
      phone: handle,
      preferred_language: req.body?.preferred_language || 'hi',
    })
    .select().single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  return res.status(201).json({ success: true, message: 'Artisan created', data: created });
}));

// Link a real phone number to an existing device-based artisan.
router.post('/link-phone', asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  const id = String(req.body?.artisan_id || '').trim();
  const phone = String(req.body?.phone || '').trim();
  if (!/^\d{10}$/.test(phone)) {
    return res.status(422).json({ success: false, message: 'phone must be 10 digits' });
  }

  const { data: taken } = await supabase
    .from('artisans').select('id').eq('phone', phone).maybeSingle();
  if (taken && taken.id !== id) {
    return res.json({ success: true, message: 'Existing shop found', data: taken });
  }

  const { data, error } = await supabase
    .from('artisans').update({ phone }).eq('id', id).select().single();

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true, message: 'Phone linked', data });
}));  

router.get('/', asyncHandler(getAllArtisans));
router.get('/:id', asyncHandler(getArtisanById));
router.post('/', asyncHandler(createArtisan));
router.put('/:id', asyncHandler(updateArtisan));
router.delete('/:id', asyncHandler(deleteArtisan));

export default router;
