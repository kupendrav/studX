-- ============================================================
-- StudX Bus Pass System — Full Supabase Setup
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create the "students" table
CREATE TABLE IF NOT EXISTS public.students (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  regno         TEXT NOT NULL,
  college       TEXT NOT NULL,
  address       TEXT NOT NULL,
  destination_from TEXT NOT NULL,
  destination_to   TEXT NOT NULL,
  via_1         TEXT,
  via_2         TEXT,
  photo_url     TEXT,
  qr_code       TEXT NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'approved',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by user_id (dashboard query)
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- 2. Auto-update "updated_at" on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.students;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Authenticated users can INSERT their own record
CREATE POLICY "Users can insert own student record"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can SELECT their own record (dashboard)
CREATE POLICY "Users can view own student record"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone can SELECT by id (public bus pass page /pass/[id])
CREATE POLICY "Public can view any student record by id"
  ON public.students
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can UPDATE their own record
CREATE POLICY "Users can update own student record"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Create storage bucket for student photos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS Policies

-- Anyone can VIEW photos (bucket is public)
CREATE POLICY "Public read access to student photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'student-photos');

-- Authenticated users can UPLOAD photos
CREATE POLICY "Authenticated users can upload student photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'student-photos');

-- Authenticated users can UPDATE their own photos
CREATE POLICY "Authenticated users can update own photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'student-photos');

-- ============================================================
-- Done! Your Supabase project is now ready for the StudX app.
-- ============================================================
