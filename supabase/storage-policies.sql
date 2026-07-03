-- =========================================================
-- STORAGE RLS POLICIES — gallery & avatars buckets
-- Run once in the Supabase SQL Editor (safe to re-run — uses
-- DROP POLICY IF EXISTS before each CREATE).
--
-- Why this is needed: `schema.sql` sketches these policies in a
-- commented-out block but never applies them. Without them, the
-- admin panel's in-browser gallery upload (components/admin/
-- GalleryManager.tsx, using the signed-in admin's own browser
-- session — not the service role key) fails with
-- "new row violates row-level security policy" on every upload,
-- even though the admin is genuinely an admin. Confirmed live on
-- this project on 2026-07-03 — uploads as the real admin account
-- were rejected until this file is run.
--
-- The `gallery` bucket's public=true flag already makes reads
-- work without a policy, so this file only adds INSERT/DELETE.
-- =========================================================

DROP POLICY IF EXISTS "gallery_public_read" ON storage.objects;
CREATE POLICY "gallery_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_admin_write" ON storage.objects;
CREATE POLICY "gallery_admin_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND is_admin());

DROP POLICY IF EXISTS "gallery_admin_update" ON storage.objects;
CREATE POLICY "gallery_admin_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND is_admin());

DROP POLICY IF EXISTS "gallery_admin_delete" ON storage.objects;
CREATE POLICY "gallery_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND is_admin());

DROP POLICY IF EXISTS "avatars_owner_read" ON storage.objects;
CREATE POLICY "avatars_owner_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "avatars_admin_read" ON storage.objects;
CREATE POLICY "avatars_admin_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND is_admin());

DROP POLICY IF EXISTS "avatars_owner_write" ON storage.objects;
CREATE POLICY "avatars_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
