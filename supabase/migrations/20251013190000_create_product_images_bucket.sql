-- Create public storage bucket for product images and RLS policies
-- Idempotent where possible

-- 1) Create bucket (public)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2) Policies on storage.objects for bucket 'product-images'
-- Drop existing policies if they exist (defensive)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can read product images'
  ) THEN
    DROP POLICY "Public can read product images" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to own folder'
  ) THEN
    DROP POLICY "Users can upload to own folder" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own objects'
  ) THEN
    DROP POLICY "Users can update own objects" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own objects'
  ) THEN
    DROP POLICY "Users can delete own objects" ON storage.objects;
  END IF;
END $$;

-- Public read for this bucket
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'product-images');

-- Authenticated users can upload only under their own folder: {user_id}/...
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (regexp_split_to_array(name, '/'))[1] = auth.uid()::text
  );

-- Authenticated users can update only their own objects
CREATE POLICY "Users can update own objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND ((owner = auth.uid()) OR (regexp_split_to_array(name, '/'))[1] = auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND ((owner = auth.uid()) OR (regexp_split_to_array(name, '/'))[1] = auth.uid()::text)
  );

-- Authenticated users can delete only their own objects
CREATE POLICY "Users can delete own objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images'
    AND ((owner = auth.uid()) OR (regexp_split_to_array(name, '/'))[1] = auth.uid()::text)
  );
