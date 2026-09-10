import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { supabase } from '../config/index.js';
import { isValidUUID, normalizeIndianMobile } from '../utils/validation.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
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
 * PUBLIC — onboarding ke liye zaruri, auth nahi chahiye.
 * Phone number response mein nahi bhejta (PII protection).
 */
router.post('/resolve', asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  const handle = String(req.body?.handle || '').trim();
  if (!handle || handle.length > 20) {
    return res.status(422).json({ success: false, message: 'handle is required (max 20 chars)' });
  }

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

/**
 * Link phone to artisan — AUTHENTICATED.
 * Ab client artisan_id nahi bhejta, server JWT se derive karta hai.
 */
router.post('/link-phone', authenticate, asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database not configured' });
  }

  // JWT se artisan identity already verified hai.
  const id = req.artisan?.id;
  const phone = String(req.body?.phone || '').trim();

  if (!id) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const mobile = normalizeIndianMobile(phone);
  if (!mobile.valid) {
    return res.status(400).json({ success: false, message: mobile.error });
  }

  // Kisi aur ka phone toh nahi?
  const { data: taken } = await supabase
    .from('artisans').select('id').eq('phone', mobile.normalized).maybeSingle();

  if (taken) {
    if (taken.id === id) {
      const { data: updated, error } = await supabase
        .from('artisans').update({ phone: mobile.normalized }).eq('id', id).select().single();
      if (error) return res.status(500).json({ success: false, message: error.message });
      return res.json({ success: true, message: 'Phone linked', data: updated });
    }
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

/**
 * GET / — AUTHENTICATED. Sirf authenticated artisan ki info deta hai.
 * Pehle sabka data leke aata tha (PII leak).
 */
router.get('/', authenticate, asyncHandler(getAllArtisans));

/**
 * GET /:id — PUBLIC lekin phone number strip karta hai (PII).
 */
router.get('/:id', asyncHandler(getArtisanById));

/**
 * POST / — AUTHENTICATED. Naya artisan authenticated user ke liye create karo.
 */
router.post('/', authenticate, asyncHandler(createArtisan));

/**
 * PUT /:id — AUTHENTICATED + OWNER ONLY.
 */
router.put('/:id', authenticate, asyncHandler(updateArtisan));

/**
 * DELETE /:id — AUTHENTICATED + OWNER ONLY.
 */
router.delete('/:id', authenticate, asyncHandler(deleteArtisan));

export default router;
