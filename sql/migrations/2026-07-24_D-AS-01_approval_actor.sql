-- ============================================================================
-- D-AS-01 · Approvals carry the actor (Decision D10, finding F-012)
-- AL-RDP-001 dispatch 1 · SysAdmin-side · APPLY BEFORE D-AS-03 file.
-- Commissioning epoch for the new rule: 2026-07-24 (pre-epoch approvals are
-- not retroactively guilty).
-- Mechanism sits at the deepest layer that can hold it (P9): a trigger
-- captures auth.uid() at write time, so the actor is recorded even before
-- any frontend change ships. Service-role writes without an actor are what
-- the sensor watches.
-- ============================================================================

-- 1 · Columns
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS phase_1_approved_by uuid REFERENCES public.author_profiles(id),
  ADD COLUMN IF NOT EXISTS phase_2_approved_by uuid REFERENCES public.author_profiles(id),
  ADD COLUMN IF NOT EXISTS phase_3_approved_by uuid REFERENCES public.author_profiles(id);

-- 2 · Actor-capture trigger
CREATE OR REPLACE FUNCTION public.set_chapter_approval_actor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE actor uuid;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    SELECT id INTO actor FROM public.author_profiles WHERE auth_user_id = auth.uid();
  END IF;

  IF NEW.phase_1_approved_at IS NOT NULL AND OLD.phase_1_approved_at IS NULL
     AND NEW.phase_1_approved_by IS NULL THEN
    NEW.phase_1_approved_by := actor;
  END IF;
  IF NEW.phase_2_approved_at IS NOT NULL AND OLD.phase_2_approved_at IS NULL
     AND NEW.phase_2_approved_by IS NULL THEN
    NEW.phase_2_approved_by := actor;
  END IF;
  IF NEW.phase_3_approved_at IS NOT NULL AND OLD.phase_3_approved_at IS NULL
     AND NEW.phase_3_approved_by IS NULL THEN
    NEW.phase_3_approved_by := actor;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chapters_approval_actor ON public.chapters;
CREATE TRIGGER chapters_approval_actor
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.set_chapter_approval_actor();

-- 3 · Sensor inv_11 — anonymous approvals after the epoch (allocated by SysAdmin)
CREATE OR REPLACE VIEW production_control.inv_11_anonymous_approvals AS
SELECT id AS chapter_id, manuscript_id, 1 AS phase, phase_1_approved_at AS approved_at
FROM public.chapters
WHERE phase_1_approved_at >= '2026-07-24T00:00:00Z' AND phase_1_approved_by IS NULL
UNION ALL
SELECT id, manuscript_id, 2, phase_2_approved_at
FROM public.chapters
WHERE phase_2_approved_at >= '2026-07-24T00:00:00Z' AND phase_2_approved_by IS NULL
UNION ALL
SELECT id, manuscript_id, 3, phase_3_approved_at
FROM public.chapters
WHERE phase_3_approved_at >= '2026-07-24T00:00:00Z' AND phase_3_approved_by IS NULL;

-- health_check() registration happens cumulatively in the D-AS-03 file
-- (a view is not a sensor until registered — apply both files together).

-- VERIFICATION (run after apply):
--   BEGIN;
--     SET LOCAL ROLE authenticated;
--     SET LOCAL request.jwt.claims = '{"sub":"<a real auth_user_id>","role":"authenticated"}';
--     UPDATE chapters SET phase_1_approved_at = now() WHERE id = '<a test chapter of that author>';
--     SELECT phase_1_approved_by FROM chapters WHERE id = '<same>';  -- must be that author's profile id
--   ROLLBACK;
--   SELECT count(*) FROM production_control.inv_11_anonymous_approvals;  -- 0
-- LADDER NOTE: once the frontend also writes approved_by explicitly and n8n
-- paths are confirmed actor-bearing, promote to impossible with:
--   ALTER TABLE chapters ADD CONSTRAINT approvals_carry_actor CHECK (...per-phase epoch check...);
