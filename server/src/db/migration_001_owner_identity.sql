-- =============================================================================
-- Migration: ShilpSaathi — mobile identity & product ownership hardening
-- Safe, idempotent. Does NOT drop tables, does NOT delete data.
-- Apply in Supabase Dashboard -> SQL Editor -> paste -> Run
-- =============================================================================

BEGIN;

-- 1. Ensure artisans.phone is unique (canonical identity per mobile number).
--    The base schema already declares phone VARCHAR(20) UNIQUE NOT NULL, but
--    this makes the guarantee explicit on existing databases created before
--    the unique constraint was added.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'UNIQUE'
      AND table_name = 'artisans'
      AND constraint_name = 'artisans_phone_key'
  ) THEN
    ALTER TABLE artisans ADD CONSTRAINT artisans_phone_key UNIQUE (phone);
  END IF;
END $$;

-- 2. Normalize existing stored mobile numbers to E.164 (+91XXXXXXXXXX) so that
--    lookups by the normalized value match legacy rows. Only plain 10-digit
--    Indian numbers (leading 6-9) and 11-digit (0-prefixed) and 12-digit
--    (91-prefixed) forms are converted. Device handles (g-xyz) and already
--    E.164 numbers are left untouched. Each update is collision-guarded so it
--    never produces a duplicate phone (which would violate the UNIQUE above).
WITH targets AS (
    SELECT
    id,
    phone AS old_phone,
    CASE
      WHEN phone ~ '^[6-9]\d{9}$'              THEN '+91' || phone
      WHEN phone ~ '^0[6-9]\d{9}$'             THEN '+91' || substr(phone, 2)
      WHEN phone ~ '^91[6-9]\d{9}$'            THEN '+91' || substr(phone, 3)
      ELSE NULL
    END AS new_phone
  FROM artisans
  WHERE phone IS NOT NULL
    AND phone ~ '^(\+91)?0?\d{10}$'
    AND phone NOT LIKE '+91%'
)
UPDATE artisans a
SET phone = t.new_phone
FROM targets t
WHERE a.id = t.id
  AND t.new_phone IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM artisans a2
    WHERE a2.phone = t.new_phone AND a2.id <> t.id
  );

-- 3. Foreign key: products.artisan_id must reference a real artisans.id.
--    (Declared in schema.sql; this is idempotent for DBs created without it.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_name = 'products'
      AND constraint_name = 'products_artisan_id_fkey'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_artisan_id_fkey
      FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Index supporting "this artisan's published products" query.
CREATE INDEX IF NOT EXISTS idx_products_artisan_published
  ON products(artisan_id) WHERE status = 'published';

-- 5. Data-integrity CHECKs (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK'
      AND table_name = 'products'
      AND constraint_name = 'products_final_price_nonnegative'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_final_price_nonnegative
      CHECK (final_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK'
      AND table_name = 'products'
      AND constraint_name = 'products_status_valid'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_status_valid
      CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

COMMIT;
