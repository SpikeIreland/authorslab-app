-- ============================================================================
-- 20260730_cover_composer.sql
-- Schema for the layered cover composer (TDP-DT-01).
--
-- Introduces the sacred/shared enforcement helper
-- `can_access_manuscript_shared_space(uuid)`, three cover tables
-- (`cover_assets`, `cover_drafts`, `cover_versions`), and a selection column
-- on `manuscripts`. RLS enabled everywhere; INSERT policies pin `created_by`
-- to `auth.uid()`; `cover_versions` has no DELETE policy (immutable via RLS).
--
-- Idempotent — safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper function — the single enforcement point for the sacred/shared
-- boundary across every current and future Design/Publishing/Marketing table.
-- Author-only today; the commented block lights up when project_collaborators
-- lands (a separate, later request).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_access_manuscript_shared_space(m_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin()
      OR EXISTS (
           SELECT 1
             FROM public.manuscripts m
             JOIN public.author_profiles ap ON ap.id = m.author_id
            WHERE m.id = m_id
              AND ap.auth_user_id = auth.uid()
         )
      -- OR EXISTS (  -- uncomment when project_collaborators lands
      --      SELECT 1 FROM public.project_collaborators pc
      --       WHERE pc.manuscript_id = m_id
      --         AND pc.user_id = auth.uid()
      --         AND pc.status = 'accepted'
      --    )
$$;

COMMENT ON FUNCTION public.can_access_manuscript_shared_space(uuid) IS
  'Enforcement point for the sacred/shared boundary. Author (via author_profiles) + admin today; add invited collaborators when project_collaborators lands. Every Design/Publishing/Marketing table should gate its RLS on this function.';

-- ---------------------------------------------------------------------------
-- cover_assets — every image that can appear on a cover
--   kind=generated: from 5.2 Taylor Generate Covers (via DALL-E 3)
--   kind=uploaded : from the author's device (rights_confirmed becomes true)
-- source jsonb holds provenance:
--   generated: { prompt, execution_id, model, cost_usd, cost_input, cost_output }
--   uploaded:  { original_filename, mime, size_bytes }
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cover_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('generated', 'uploaded')),
  storage_path text NOT NULL,
  width int,
  height int,
  source jsonb,
  rights_confirmed boolean,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cover_assets_manuscript_idx
  ON public.cover_assets (manuscript_id, created_at DESC);

COMMENT ON TABLE public.cover_assets IS
  'Cover imagery per manuscript. Generated images come from 5.2 Taylor Generate Covers; uploaded images come from the author. Typography is NEVER on these images — 5.2 prompts for text-free art, and uploads are art-only from the author. Title/subtitle/author are composited as text layers by the composer at export time.';

-- ---------------------------------------------------------------------------
-- cover_drafts — the single working composer document per manuscript.
--   doc is the ordered layer list (background, art, scrim, title, subtitle,
--   author, spot). Coordinates in the logical 500x800 unit space.
--   Autosaved by the composer; UNIQUE(manuscript_id) — one working doc.
--   Versions (immutable) are the history, not this row.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cover_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL UNIQUE REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  doc jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cover_drafts IS
  'The single working composer document per manuscript. Ordered layer list in doc jsonb. UNIQUE per manuscript — versions carry the history, not this table.';

-- ---------------------------------------------------------------------------
-- cover_versions — immutable snapshots ("Save as version").
--   Paul's decision 2026-07-30: keep every version, no cap, no pruning.
--   thumbnail_path: 200x320 PNG for the version tray.
--   export_path:    1600x2560 PNG generated at export time.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cover_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  doc jsonb NOT NULL,
  thumbnail_path text,
  export_path text,
  label text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cover_versions_manuscript_idx
  ON public.cover_versions (manuscript_id, created_at DESC);

COMMENT ON TABLE public.cover_versions IS
  'Immutable snapshots of the composer draft. No UPDATE, no DELETE via RLS. export_path populated when the version is rendered at print resolution. manuscripts.selected_cover_version_id points here.';

-- ---------------------------------------------------------------------------
-- Selection: which version is the "current cover" for this manuscript.
-- When set, the app also writes the corresponding cover_versions.export_path
-- to publishing_progress.selected_cover_url so Library/Overview render it.
-- ---------------------------------------------------------------------------
ALTER TABLE public.manuscripts
  ADD COLUMN IF NOT EXISTS selected_cover_version_id uuid
  REFERENCES public.cover_versions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.manuscripts.selected_cover_version_id IS
  'The cover_versions row currently designated as this manuscript''s cover. Downstream: publishing_progress.selected_cover_url is set from the linked version''s export_path.';

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE public.cover_assets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_drafts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_versions ENABLE ROW LEVEL SECURITY;

-- --- cover_assets ----------------------------------------------------------

DROP POLICY IF EXISTS "cover_assets: authenticated select" ON public.cover_assets;
CREATE POLICY "cover_assets: authenticated select"
  ON public.cover_assets FOR SELECT TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id));

DROP POLICY IF EXISTS "cover_assets: authenticated insert" ON public.cover_assets;
CREATE POLICY "cover_assets: authenticated insert"
  ON public.cover_assets FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_manuscript_shared_space(manuscript_id)
    AND created_by = auth.uid()
  );

-- No UPDATE policy: assets are effectively immutable after insert (their
-- provenance and bytes shouldn't change). If a rethink of a generated image
-- is wanted, the workflow inserts a new asset.

DROP POLICY IF EXISTS "cover_assets: author delete" ON public.cover_assets;
CREATE POLICY "cover_assets: author delete"
  ON public.cover_assets FOR DELETE TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id));

-- --- cover_drafts ----------------------------------------------------------

DROP POLICY IF EXISTS "cover_drafts: authenticated select" ON public.cover_drafts;
CREATE POLICY "cover_drafts: authenticated select"
  ON public.cover_drafts FOR SELECT TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id));

DROP POLICY IF EXISTS "cover_drafts: authenticated insert" ON public.cover_drafts;
CREATE POLICY "cover_drafts: authenticated insert"
  ON public.cover_drafts FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_manuscript_shared_space(manuscript_id)
    AND updated_by = auth.uid()
  );

DROP POLICY IF EXISTS "cover_drafts: authenticated update" ON public.cover_drafts;
CREATE POLICY "cover_drafts: authenticated update"
  ON public.cover_drafts FOR UPDATE TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id))
  WITH CHECK (
    public.can_access_manuscript_shared_space(manuscript_id)
    AND updated_by = auth.uid()
  );

DROP POLICY IF EXISTS "cover_drafts: author delete" ON public.cover_drafts;
CREATE POLICY "cover_drafts: author delete"
  ON public.cover_drafts FOR DELETE TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id));

-- --- cover_versions --------------------------------------------------------

DROP POLICY IF EXISTS "cover_versions: authenticated select" ON public.cover_versions;
CREATE POLICY "cover_versions: authenticated select"
  ON public.cover_versions FOR SELECT TO authenticated
  USING (public.can_access_manuscript_shared_space(manuscript_id));

DROP POLICY IF EXISTS "cover_versions: authenticated insert" ON public.cover_versions;
CREATE POLICY "cover_versions: authenticated insert"
  ON public.cover_versions FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_manuscript_shared_space(manuscript_id)
    AND created_by = auth.uid()
  );

-- Deliberately no UPDATE or DELETE policies — versions are immutable snapshots.
-- Note: pg_dump and service_role writes bypass RLS. If hard immutability is
-- needed (e.g. for legal chain-of-custody claims), add a per-row trigger.
