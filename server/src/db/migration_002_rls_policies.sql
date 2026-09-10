-- =============================================================================
-- Migration: ShilpSaathi — Row Level Security (RLS) Policies
-- Database-level second security boundary. Backend auth is primary;
-- RLS is the safety net. Run in Supabase Dashboard -> SQL Editor -> paste -> Run.
-- =============================================================================

-- =============================================================================
-- STEP 1: Enable RLS on all tables
-- =============================================================================
ALTER TABLE IF EXISTS artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
-- processing_logs table may or may not exist; guard with DO block.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processing_logs') THEN
    ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Artisans table policies
-- Identity link: artisans.id maps to auth.users.id via the JWT subject.
-- The authenticate middleware resolves artisan by phone; RLS adds a second
-- check using the Supabase auth.uid() when available.
-- =============================================================================

-- Public can read limited artisan info (for marketplace listings).
-- Phone number is hidden via application layer; RLS still allows read.
CREATE POLICY "artisans_public_read"
  ON artisans FOR SELECT
  USING (true);

-- Authenticated users can only update their own artisan row.
CREATE POLICY "artisans_owner_update"
  ON artisans FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uuid());

-- Authenticated users can only delete their own artisan row.
CREATE POLICY "artisans_owner_delete"
  ON artisans FOR DELETE
  USING (id = auth.uid());

-- Insert is allowed for authenticated users (onboarding via sync endpoint).
CREATE POLICY "artisans_authenticated_insert"
  ON artisans FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- STEP 3: Products table policies
-- Public can read published products (marketplace browsing).
-- Only the owner can insert, update, or delete their products.
-- =============================================================================

-- Public read for published products only.
CREATE POLICY "products_public_read_published"
  ON products FOR SELECT
  USING (status = 'published');

-- Owner can read all their own products (including drafts).
CREATE POLICY "products_owner_read_own"
  ON products FOR SELECT
  USING (artisan_id = auth.uid());

-- Owner can insert their own products.
CREATE POLICY "products_owner_insert"
  ON products FOR INSERT
  WITH CHECK (artisan_id = auth.uid());

-- Owner can update their own products.
CREATE POLICY "products_owner_update"
  ON products FOR UPDATE
  USING (artisan_id = auth.uid())
  WITH CHECK (artisan_id = auth.uid());

-- Owner can delete their own products.
CREATE POLICY "products_owner_delete"
  ON products FOR DELETE
  USING (artisan_id = auth.uid());

-- =============================================================================
-- STEP 4: Processing logs policies (if table exists)
-- Only the product owner can read their logs.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processing_logs') THEN
    -- Owner can select their logs.
    CREATE POLICY "processing_logs_owner_select"
      ON processing_logs FOR SELECT
      USING (
        product_id IN (SELECT id FROM products WHERE artisan_id = auth.uid())
      );

    -- Service/backend can insert logs.
    CREATE POLICY "processing_logs_authenticated_insert"
      ON processing_logs FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');

    -- Owner can update their logs.
    CREATE POLICY "processing_logs_owner_update"
      ON processing_logs FOR UPDATE
      USING (
        product_id IN (SELECT id FROM products WHERE artisan_id = auth.uid())
      );
  END IF;
END $$;

-- =============================================================================
-- IMPORTANT NOTES
-- =============================================================================
-- 1. These policies assume products.artisan_id and artisans.id map to the
--    Supabase auth.users.id (the JWT subject). If your artisan rows were
--    created independently of Supabase Auth, you need a mapping column
--    (e.g., artisans.auth_uid UUID REFERENCES auth.users(id)) and adjust
--    the policies to use that column instead of artisans.id.
--
-- 2. The service_role key (used in the Express backend) BYPASSES RLS by
--    default. This means the backend can still do ownership checks in
--    application code. RLS is the second boundary for direct client access
--    (e.g., if you expose Supabase anon key to the frontend).
--
-- 3. To apply artisan_id as owner instead of auth.uid(), add a column:
--    ALTER TABLE artisans ADD COLUMN auth_uid UUID REFERENCES auth.users(id);
--    Then change policies to: USING (artisan_id IN
--      (SELECT id FROM artisans WHERE auth_uid = auth.uid()));
--
-- 4. Test after applying:
--    - SELECT * FROM products; (anon) should return only published
--    - SELECT * FROM products; (authenticated as owner) should return own
--    - UPDATE products SET name='x' WHERE id = 'other-owners-uuid'; -> blocked
-- =============================================================================
