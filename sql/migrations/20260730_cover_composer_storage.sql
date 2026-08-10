-- ============================================================================
-- 20260730_cover_composer_storage.sql
-- Storage policies for the `cover-assets` bucket (TDP-DT-01, follow-on to
-- 20260730_cover_composer.sql).
--
-- Prerequisite: the `cover-assets` bucket must already exist (private,
-- created via Supabase dashboard). This script only creates policies on
-- storage.objects for that bucket — it does NOT create the bucket, because
-- CREATE BUCKET is not consistently exposed via SQL in Supabase-hosted PG.
--
-- Policy model — mirrors the table RLS in the sibling migration:
--   SELECT   : authenticated users where the object's manuscript is in the
--              user's shared space (or user is admin)
--   INSERT   : same predicate; storage writes are gated (workflow bypasses
--              via service_role, which is expected)
--   UPDATE   : same
--   DELETE   : same — author (via helper) may delete their images
--
-- Path convention (enforced by app; not by policies):
--   <manuscript_id>/<asset_id>.<ext>                        — intake images
--   <manuscript_id>/versions/<version_id>.png               — full-res export
--   <manuscript_id>/versions/<version_id>-thumb.png         — thumbnail
--
-- The manuscript_id is the first path segment in every case, so
-- split_part(name, '/', 1)::uuid recovers it deterministically. That is what
-- these policies key off, so any prospective upload path that doesn't lead
-- with a manuscript_id UUID will fail the check.
--
-- Idempotent — safe to re-run.
-- ============================================================================

-- --- SELECT ----------------------------------------------------------------
DROP POLICY IF EXISTS "cover-assets: authenticated select"
  ON storage.objects;
CREATE POLICY "cover-assets: authenticated select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'cover-assets'
    AND public.can_access_manuscript_shared_space(
          (split_part(name, '/', 1))::uuid
        )
  );

-- --- INSERT ----------------------------------------------------------------
DROP POLICY IF EXISTS "cover-assets: authenticated insert"
  ON storage.objects;
CREATE POLICY "cover-assets: authenticated insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cover-assets'
    AND public.can_access_manuscript_shared_space(
          (split_part(name, '/', 1))::uuid
        )
  );

-- --- UPDATE ---------------------------------------------------------------
DROP POLICY IF EXISTS "cover-assets: authenticated update"
  ON storage.objects;
CREATE POLICY "cover-assets: authenticated update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'cover-assets'
    AND public.can_access_manuscript_shared_space(
          (split_part(name, '/', 1))::uuid
        )
  )
  WITH CHECK (
    bucket_id = 'cover-assets'
    AND public.can_access_manuscript_shared_space(
          (split_part(name, '/', 1))::uuid
        )
  );

-- --- DELETE ---------------------------------------------------------------
DROP POLICY IF EXISTS "cover-assets: authenticated delete"
  ON storage.objects;
CREATE POLICY "cover-assets: authenticated delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'cover-assets'
    AND public.can_access_manuscript_shared_space(
          (split_part(name, '/', 1))::uuid
        )
  );
