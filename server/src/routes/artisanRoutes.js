import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../config/index.js';
import { isValidUUID, normalizeIndianMobile } from '../utils/validation.js';
import {
  getAllArtisans,
  getArtisanById,
  createArtisan,
  updateArtisan,
  deleteArtisan,
} from '../controllers/artisanController.js';

const router = Router();

/**
 * Resolve (or lazily create) an artisan identity.
 *
 * Accepts a `handle` that is either:
 *   - a 10-digit Indian mobile number (validated & normalized to E.164), or
 *   - a legacy device handle (`g-...`) for deferred identity (kept for
 *     frontend compatibility).
 *
 * The mobile number is the canonical identity: the SAME number must always
 * resolve to the SAME artisan row (no duplicates).
 */
router.post('/resolve', asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  const handle = String(req.body?.handle || '').trim();
  if (!handle || handle.length > 20) {
    return res.status(422).json({ success: false, message: 'handle is required (max 20 chars)' });
  }

  // --- Mobile-number path (preferred) ---
  const mobile = normalizeIndianMobile(handle);
  if (mobile.valid) {
    const { data: existing } = await supabase
      .from('artisans').select('*').eq('phone', mobile.normalized).maybeSingle();
    if (existing) {
      return res.json({ success: true, message: 'Artisan resolved', data: existing });
    }
    const { data: created, error } = await supabase
      .from('artisans')
      .insert({
        name: req.body?.name?.trim() || 'Artisan',
        phone: mobile.normalized,
        preferred_language: req.body?.preferred_language || 'hi',
      })
      .select().single();
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    return res.status(201).json({ success: true, message: 'Artisan created', data: created });
  }

    // --- Legacy device-handle fallback (deferred identity) ---
  // The frontend only ever generates device handles of the form "g-<hex>"
  // (see getDeviceHandle()). Anything that is not a valid Indian mobile and
  // does not match that device-handle format is rejected with 400 so we never
  // persist garbage phone values.
  if (handle.startsWith('g-')) {
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
  }

  return res.status(400).json({
    success: false,
    message: mobile.error || 'Invalid handle. Provide a valid 10-digit Indian mobile number.',
  });
}));

// Link a real phone number to an existing artisan (by UUID).
// Rejects invalid numbers and refuses to steal a number already owned by another artisan.
router.post('/link-phone', asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  const id = String(req.body?.artisan_id || '').trim();
  const phone = String(req.body?.phone || '').trim();

  if (!isValidUUID(id)) {
    return res.status(400).json({ success: false, message: 'Valid artisan_id (UUID) is required' });
  }

  const mobile = normalizeIndianMobile(phone);
  if (!mobile.valid) {
    return res.status(400).json({ success: false, message: mobile.error });
  }

  // Is this phone already attached to an artisan?
  const { data: taken } = await supabase
    .from('artisans').select('id').eq('phone', mobile.normalized).maybeSingle();

  if (taken) {
    if (taken.id === id) {
      // Already linked to this very artisan — no-op update.
      const { data: updated, error } = await supabase
        .from('artisans').update({ phone: mobile.normalized }).eq('id', id).select().single();
      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.json({ success: true, message: 'Phone linked', data: updated });
    }
    // Belongs to another artisan — do NOT return an id (would mis-identify the caller).
    return res.status(409).json({
      success: false,
      message: 'This phone number is already in use by another shop',
      data: null,
    });
  }

  const { data, error } = await supabase
    .from('artisans').update({ phone: mobile.normalized }).eq('id', id).select().single();

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json({ success: true, message: 'Phone linked', data });
}));  

router.get('/', asyncHandler(getAllArtisans));
router.get('/:id', asyncHandler(getArtisanById));
router.post('/', asyncHandler(createArtisan));
router.put('/:id', asyncHandler(updateArtisan));
router.delete('/:id', asyncHandler(deleteArtisan));

export default router;
