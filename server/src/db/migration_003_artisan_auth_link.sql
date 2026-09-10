-- =============================================================================
-- Migration: ShilpSaathi — Link artisans to Supabase Auth users (REVISED)
-- Adds auth_uid column to map artisan rows to auth.users.id for RLS.
--
-- RUN THIS FIRST (before migration_002_rls_policies.sql).
--
-- Identity chain this enables:
--   auth.uid() → artisans.auth_uid → artisans.id → products.artisan_id
--
-- EXISTING DATA IS SAFE:
--   - artisan IDs do NOT change
--   - product artisan_id references do NOT change
--   - only a new nullable column is added + backfilled from phone match
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
