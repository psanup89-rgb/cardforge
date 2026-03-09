-- ============================================================
-- CardForge — Supabase Database Migrations
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Profiles table (auto-populated via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Business cards table
CREATE TABLE IF NOT EXISTS public.business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  full_name text NOT NULL,
  designation text,
  company_name text,
  company_logo_url text,
  email text,
  phone text,
  website text,
  location text,
  social_links jsonb DEFAULT '{}',
  template_id text DEFAULT 'black-elegance',
  accent_color text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- Owners can do everything
CREATE POLICY "Users manage own cards"
  ON public.business_cards
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read published cards (for public /card/[slug] page)
CREATE POLICY "Anyone reads published cards"
  ON public.business_cards FOR SELECT
  USING (status = 'published');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Storage bucket + policies
-- Run this block in the SQL Editor (NOT the Storage dashboard UI)

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT DO NOTHING;

-- Anyone can read logos (bucket is public, but policy needed for RLS)
CREATE POLICY "Public logo read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Authenticated users can upload into their own folder (path: {user_id}/...)
CREATE POLICY "Authenticated logo upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own logo files
CREATE POLICY "Users update own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own logo files
CREATE POLICY "Users delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
