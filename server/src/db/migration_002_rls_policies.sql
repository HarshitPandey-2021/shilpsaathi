-- =============================================================================
-- Migration: ShilpSaathi — Row Level Security (RLS) Policies (CORRECTED)
-- Database-level second security boundary. Backend auth (Express middleware)
-- is primary; RLS is the safety net for direct client access.
--
-- IMPORTANT: The Express backend uses the Supabase SERVICE ROLE KEY which
-- BYPASSES RLS by default. These policies only apply to direct client access
-- (anon key or authenticated JWT from frontend).
--
-- IDENTITY CHAIN:
--   auth.users.id (JWT subject, auth.uid())
--     → artisans.auth_uid (mapping column, added by migration_003)
--     → artisans.id (independent UUID, PRIMARY KEY)
--     → products.artisan_id (FK references artisans.id)
--
-- PREREQUISITE: Run migration_003_artisan_auth_link.sql FIRST to add the
-- artisans.auth_uid column. These policies depend on that column existing.
--
-- Run in Supabase Dashboard → SQL Editor → paste → Run.
-- All statements are idempotent (DROP IF EXISTS before CREATE).
-- =============================================================================

-- =============================================================================
-- STEP 1: Enable RLS on all tables
-- =============================================================================
ALTER TABLE IF EXISTS artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processing_logs') THEN
    ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Drop existing policies (safe re-run)
-- =============================================================================
DROP POLICY IF EXISTS artisans_public_read ON artisans;
DROP POLICY IF EXISTS artisans_owner_update ON artisans;
DROP POLICY IF EXISTS artisans_owner_delete ON artisans;
DROP POLICY IF EXISTS artisans_authenticated_insert ON artisans;
DROP POLICY IF EXISTS artisans_owner_select ON artisans;

DROP POLICY IF EXISTS products_public_read_published ON products;
DROP POLICY IF EXISTS products_owner_read_own ON products;
DROP POLICY IF EXISTS products_owner_insert ON products;
DROP POLICY IF EXISTS products_owner_update ON products;
DROP POLICY IF EXISTS products_owner_delete ON products;

DROP POLICY IF EXISTS processing_logs_owner_select ON processing_logs;
DROP POLICY IF EXISTS processing_logs_authenticated_insert ON processing_logs;
DROP POLICY IF EXISTS processing_logs_owner_update ON processing_logs;

-- =============================================================================
-- STEP 3: Artisans table policies
-- Link: auth.uid() = artisans.auth_uid
-- No public access — phone number is PII.
-- =============================================================================

CREATE POLICY artisans_owner_select
  ON artisans FOR SELECT
  USING (auth_uid = auth.uid());

CREATE POLICY artisans_owner_insert
  ON artisans FOR INSERT
  WITH CHECK (auth_uid = auth.uid());

CREATE POLICY artisans_owner_update
  ON artisans FOR UPDATE
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

CREATE POLICY artisans_owner_delete
  ON artisans FOR DELETE
  USING (auth_uid = auth.uid());

-- =============================================================================
-- STEP 4: Products table policies
-- Link: auth.uid() → artisans.auth_uid → artisans.id → products.artisan_id
-- Owner-only access. No public read.
-- =============================================================================

CREATE POLICY products_owner_select
  ON products FOR SELECT
  USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));

CREATE POLICY products_owner_insert
  ON products FOR INSERT
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));

CREATE POLICY products_owner_update
  ON products FOR UPDATE
  USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()))
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));

CREATE POLICY products_owner_delete
  ON products FOR DELETE
  USING (artisan_id IN (SELECT id FROM artisans WHERE auth_uid = auth.uid()));

-- =============================================================================
-- STEP 5: Processing logs policies (if table exists)
-- Access follows product ownership chain.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processing_logs') THEN
    CREATE POLICY processing_logs_owner_select
      ON processing_logs FOR SELECT
      USING (
        product_id IN (
          SELECT id FROM products WHERE artisan_id IN (
            SELECT id FROM artisans WHERE auth_uid = auth.uid()
          )
        )
      );

    CREATE POLICY processing_logs_authenticated_insert
      ON processing_logs FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY processing_logs_owner_update
      ON processing_logs FOR UPDATE
      USING (
        product_id IN (
          SELECT id FROM products WHERE artisan_id IN (
            SELECT id FROM artisans WHERE auth_uid = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. artisans.auth_uid MUST be populated (run migration_003 first).
-- 2. Existing artisan rows without auth_uid will be invisible to RLS until
--    linked. Run the backfill UPDATE in migration_003.
-- 3. The Express backend (service role key) BYPASSES these policies — no
--    impact on backend functionality.
-- 4. To test after applying:
--    - SET ROLE anon; SELECT * FROM products; → should return nothing
--    - SET ROLE authenticated; (as owner) SELECT * FROM products; → own only
-- 5. If you need PUBLIC product listing, add:
--    CREATE POLICY products_public_read_published
--      ON products FOR SELECT USING (status = 'published');
--    But this exposes product data to anyone with the anon key.
-- =============================================================================
