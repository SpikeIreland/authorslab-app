-- ============================================================================
-- D-AS-03 (+ DB substrate of D-AS-02) · Journey records + reaper
-- AL-RDP-001 dispatches 2/3 · SysAdmin-side · APPLY AFTER the D-AS-01 file.
-- Implements: scan on arrival (P4) · polls stay pure reads (P5) · corpse on
-- every path (law 4) — the fix for finding F-013.
-- App/n8n writeback wiring is DP-AS-02 (platform chat); this file gives it
-- the machinery to write to.
-- ============================================================================

-- 1 · The journey table (new table ⇒ ships WITH policies — standing law)
CREATE TABLE IF NOT EXISTS public.as_journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_type text NOT NULL CHECK (journey_type IN
    ('full_analysis','chapter_analysis','editor_chat','phase_transition')),
  manuscript_id uuid NOT NULL REFERENCES public.manuscripts(id),
  chapter_id uuid REFERENCES public.chapters(id),
  editor_name text CHECK (editor_name IN ('alex','sam','jordan') OR editor_name IS NULL),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN
    ('submitted','received','processing','persisted','ready','replied',
     'complete','rejected','failed','reaped')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz,
  completed_at timestamptz,
  timeout_at timestamptz NOT NULL,
  terminal_reason text,
  created_by uuid REFERENCES public.author_profiles(id)
);
CREATE INDEX IF NOT EXISTS as_journeys_open_idx
  ON public.as_journeys (timeout_at)
  WHERE status NOT IN ('ready','replied','complete','rejected','failed','reaped');

ALTER TABLE public.as_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own journeys"
  ON public.as_journeys FOR SELECT TO authenticated
  USING (is_admin() OR manuscript_id IN (
    SELECT m.id FROM public.manuscripts m
    JOIN public.author_profiles ap ON m.author_id = ap.id
    WHERE ap.auth_user_id = auth.uid()));
CREATE POLICY "Members can submit journeys for own manuscripts"
  ON public.as_journeys FOR INSERT TO authenticated
  WITH CHECK (manuscript_id IN (
    SELECT m.id FROM public.manuscripts m
    JOIN public.author_profiles ap ON m.author_id = ap.id
    WHERE ap.auth_user_id = auth.uid()));
-- No UPDATE policy for authenticated: status transitions are worker-written
-- (service role) or reaper-written. The poll is a pure read by construction.

-- 2 · The reaper (remediation is a deliberate act — but reaping IS the
--     observation of abandonment, so it lives beside the sensors)
CREATE OR REPLACE FUNCTION production_control.reap_stalled_journeys()
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE n integer;
BEGIN
  UPDATE public.as_journeys
  SET status = 'reaped',
      terminal_reason = 'timeout: no worker completion before timeout_at',
      completed_at = now()
  WHERE status NOT IN ('ready','replied','complete','rejected','failed','reaped')
    AND timeout_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
SELECT cron.schedule('as-journeys-reaper', '*/5 * * * *',
                     $$SELECT production_control.reap_stalled_journeys()$$);

-- 3 · Sensor inv_12 — journeys the reaper should have reaped but didn't
CREATE OR REPLACE VIEW production_control.inv_12_unreaped_journeys AS
SELECT id, journey_type, manuscript_id, status, submitted_at, timeout_at
FROM public.as_journeys
WHERE status NOT IN ('ready','replied','complete','rejected','failed','reaped')
  AND timeout_at < now() - interval '10 minutes';

-- 4 · Cumulative health_check(): registers inv_11 and inv_12
--     (supersedes the 2026-07-22 version; inv_01..inv_10 unchanged)
CREATE OR REPLACE FUNCTION production_control.health_check()
RETURNS TABLE (invariant text, severity text, violations bigint, status text, description text)
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  WITH readings AS (
    SELECT 'inv_01_rls_disabled_public' AS invariant, 'RED' AS severity,
           (SELECT count(*) FROM production_control.inv_01_rls_disabled_public) AS violations,
           'exposed public tables without RLS (meta-sensor)' AS description
    UNION ALL
    SELECT 'inv_04_phase_timestamp_sanity', 'RED',
           (SELECT count(*) FROM production_control.inv_04_phase_timestamp_sanity),
           'editing_phases rows whose status contradicts their timestamps'
    UNION ALL
    SELECT 'inv_03_multi_active_phase', 'AMBER',
           (SELECT count(*) FROM production_control.inv_03_multi_active_phase),
           'manuscripts with more than one active editing phase'
    UNION ALL
    SELECT 'inv_05_phase_number_drift', 'AMBER',
           (SELECT count(*) FROM production_control.inv_05_phase_number_drift),
           'manuscripts.current_phase_number disagrees with the single active phase'
    UNION ALL
    SELECT 'inv_06_stalled_analyzing', 'AMBER',
           (SELECT count(*) FROM production_control.inv_06_stalled_analyzing),
           'manuscripts in transient state analyzing for over 7 days'
    UNION ALL
    SELECT 'inv_08_orphan_text_analyses', 'AMBER',
           (SELECT count(*) FROM production_control.inv_08_orphan_text_analyses),
           'text-keyed analysis rows pointing at no manuscript'
    UNION ALL
    SELECT 'inv_09_orphan_manuscript_children', 'AMBER',
           (SELECT count(*) FROM production_control.inv_09_orphan_manuscript_children),
           'FK-less manuscript children pointing at no manuscript'
    UNION ALL
    SELECT 'inv_11_anonymous_approvals', 'AMBER',
           (SELECT count(*) FROM production_control.inv_11_anonymous_approvals),
           'chapter approvals after 2026-07-24 with no recorded actor (D10)'
    UNION ALL
    SELECT 'inv_12_unreaped_journeys', 'AMBER',
           (SELECT count(*) FROM production_control.inv_12_unreaped_journeys),
           'journeys past timeout that the reaper failed to close'
    UNION ALL
    SELECT 'inv_02_rls_no_policies', 'WATCH',
           (SELECT count(*) FROM production_control.inv_02_rls_no_policies),
           'tables locked shut: RLS on, zero policies'
    UNION ALL
    SELECT 'inv_07_stalled_ghostwriter', 'WATCH',
           (SELECT count(*) FROM production_control.inv_07_stalled_ghostwriter),
           'ghostwriter sessions active but untouched for 14+ days'
    UNION ALL
    SELECT 'inv_10_workflow_executions_rows', 'WATCH',
           (SELECT count(*) FROM production_control.inv_10_workflow_executions_rows),
           'rows arriving in uncommissioned telemetry table (retire when as_journeys supersedes)'
  )
  SELECT invariant, severity, violations,
         CASE WHEN violations = 0 THEN 'GREEN' ELSE severity END AS status,
         description
  FROM readings
  ORDER BY CASE severity WHEN 'RED' THEN 1 WHEN 'AMBER' THEN 2 ELSE 3 END,
           violations DESC, invariant;
$$;

-- VERIFICATION (run after apply):
--   INSERT INTO as_journeys (journey_type, manuscript_id, timeout_at, status)
--     VALUES ('editor_chat', '<test ms id>', now() - interval '1 minute', 'submitted');
--   SELECT production_control.reap_stalled_journeys();          -- ≥ 1
--   SELECT status, terminal_reason FROM as_journeys ORDER BY submitted_at DESC LIMIT 1;  -- reaped
--   SELECT * FROM production_control.health_check();            -- inv_11, inv_12 present
--   SELECT jobname FROM cron.job;                               -- as-journeys-reaper listed
--   DELETE the test row afterwards (deliberate act, recorded here).
