-- ============================================================
-- UNIC Accommodation Office — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Accommodations table
CREATE TABLE IF NOT EXISTS accommodations (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  property_type       TEXT NOT NULL DEFAULT 'apartment',
  bedrooms            INTEGER,
  price               NUMERIC(10,2) NOT NULL,
  address             TEXT NOT NULL,
  availability_date   DATE,
  availability_status TEXT NOT NULL DEFAULT 'available',
  target_audience     TEXT NOT NULL DEFAULT 'both',
  furnishing_status   TEXT,
  walking_distance    BOOLEAN NOT NULL DEFAULT false,
  description         TEXT,
  created_by_id       UUID,
  created_by_name     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Images table (foreign key cascades on delete)
CREATE TABLE IF NOT EXISTS accommodation_images (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  accommodation_id  BIGINT NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
  storage_path      TEXT NOT NULL,
  public_url        TEXT NOT NULL,
  original_name     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_accommodations_updated_at ON accommodations;
CREATE TRIGGER trg_accommodations_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Disable RLS (internal admin tool — all access via service role key)
ALTER TABLE accommodations       DISABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_images DISABLE ROW LEVEL SECURITY;

-- 5. Flatmate requests table
CREATE TABLE IF NOT EXISTS flatmate_requests (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  year_of_study     TEXT,
  gender            TEXT NOT NULL DEFAULT 'prefer_not_to_say',
  has_flat          BOOLEAN NOT NULL DEFAULT false,
  notes             TEXT,
  created_by_id     UUID,
  created_by_name   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE flatmate_requests DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_flatmate_requests_updated_at ON flatmate_requests;
CREATE TRIGGER trg_flatmate_requests_updated_at
  BEFORE UPDATE ON flatmate_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORAGE — run these AFTER creating the bucket in the dashboard
-- Supabase Dashboard → Storage → New Bucket
--   Name : acc-images
--   Public: YES (toggle on)
-- ============================================================

-- Allow anyone to view public images
DROP POLICY IF EXISTS "Public image read" ON storage.objects;
CREATE POLICY "Public image read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'acc-images');

-- Allow service role to delete images (API functions use service role)
DROP POLICY IF EXISTS "Service role delete" ON storage.objects;
CREATE POLICY "Service role delete"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'service_role');

-- Allow anon users to upload (browser direct upload with anon key)
DROP POLICY IF EXISTS "Anon upload" ON storage.objects;
CREATE POLICY "Anon upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'acc-images');
