-- =============================================================================
-- Migration: ShilpSaathi — Link artisans to Supabase Auth users
-- Adds auth_uid column to map artisan rows to auth.users for RLS.
-- Safe, idempotent. Run AFTER migration_002_rls_policies.sql if you want
-- RLS to use auth.uid() directly. Otherwise skip and use phone-based mapping.
-- =============================================================================

-- 1. Add auth_uid column (nullable — existing rows may not have auth yet).
ALTER TABLE artisans
  ADD COLUMN IF NOT EXISTS auth_uid UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Index for fast lookups.
CREATE INDEX IF NOT EXISTS idx_artisans_auth_uid ON artisans(auth_uid);

-- 3. Backfill auth_uid for artisans whose phone matches an auth user.
--    This links existing artisan rows to their Supabase Auth accounts.
UPDATE artisans a
SET auth_uid = u.id
FROM auth.users u
WHERE a.auth_uid IS NULL
  AND a.phone = u.phone;

-- =============================================================================
-- OPTIONAL: If you want RLS to use auth_uid instead of artisans.id,
-- replace the artisan policies in migration_002 with these:
--
-- CREATE POLICY "artisans_owner_update"
--   ON artisans FOR UPDATE
--   USING (auth_uid = auth.uid())
--   WITH CHECK (auth_uid = auth.uid());
--
-- CREATE POLICY "artisans_owner_delete"
--   ON artisans FOR DELETE
--   USING (auth_uid = auth.uid());
--
-- CREATE POLICY "artisans_authenticated_insert"
--   ON artisans FOR INSERT
--   WITH CHECK (auth_uid = auth.uid());
--
-- And for products:
-- CREATE POLICY "products_owner_select"
--   ON products FOR SELECT
--   USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));
--
-- CREATE POLICY "products_owner_insert"
--   ON products FOR INSERT
--   WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));
--
-- CREATE POLICY "products_owner_update"
--   ON products FOR UPDATE
--   USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()))
--   WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));
--
-- CREATE POLICY "products_owner_delete"
--   ON products FOR DELETE
--   USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));
-- =============================================================================
