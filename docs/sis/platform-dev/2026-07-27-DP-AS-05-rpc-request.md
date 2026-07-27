# DP-AS-05 · RPC request to SysAdmin

**AL-PDC-DP05-RR · 2026-07-27 · Platform Developer station**
**Requester station:** Platform Developer
**For SysAdmin's queue** (route via Paul)
**Dispatch consuming this:** AL-DSP-001 · DP-AS-05 (phase-exit gates first-class + reject surface)
**Prior plan:** `docs/sis/platform-dev/2026-07-24-DP-AS-05-plan.md`
**Paul-confirmed decision:** §7 Q1 option C — Supabase RPC (SECURITY DEFINER function) that runs the gate atomically at the DB layer.

---

## Context

DP-AS-05 promotes the current soft `areAllChaptersApproved()` check into a first-class phase-exit gate with pass criteria (approved count == chapter count · every approval carries `approved_by` · snapshot row created · next phase activated) and a reject surface returning the named list of unapproved chapters.

The gate needs to write a J5 terminal (`complete` or `rejected`) to `as_journeys`. That table's RLS on UPDATE is worker/service-role only per the D-AS-03 migration — authenticated app users can't write the terminal. Options A (extend RLS), B (edge function), C (SECURITY DEFINER RPC), D (skip and let reaper reap) were laid out in the plan §7. Paul chose C — cleanest, makes the whole gate atomic at the DB layer, keeps the reject-path deterministic.

Requesting SysAdmin apply the RPC below.

---

## Proposed RPC

```sql
-- ============================================================================
-- Phase-exit gate for the Author Studio line (DP-AS-05 · G-AS-P1..3)
-- SECURITY DEFINER — bypasses RLS on as_journeys terminal write.
-- Authenticated app users invoke; the function verifies ownership internally.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_and_advance_phase(
  p_manuscript_id uuid,
  p_from_phase integer,
  p_editor_name text,
  p_journey_id uuid   -- created app-side via startJourney before this call
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_profile uuid;
  v_owner uuid;
  v_total_chapters int;
  v_approved_chapters int;
  v_unapproved jsonb;
  v_anonymous_approvals jsonb;
  v_snapshot_id uuid;
  v_collated text;
  v_word_count int;
  v_next_phase int;
  v_next_started_at timestamptz;
BEGIN
  -- 1 · Authenticate + resolve caller's author_profiles.id
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  END IF;

  SELECT id INTO v_caller_profile
  FROM public.author_profiles
  WHERE auth_user_id = auth.uid();

  IF v_caller_profile IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_profile');
  END IF;

  -- 2 · Verify caller owns the manuscript
  SELECT author_id INTO v_owner
  FROM public.manuscripts
  WHERE id = p_manuscript_id;

  IF v_owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'manuscript_not_found');
  END IF;
  IF v_owner <> v_caller_profile THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_owner');
  END IF;

  -- 3 · Verify the journey_id exists and belongs to this manuscript
  IF NOT EXISTS (
    SELECT 1 FROM public.as_journeys
    WHERE id = p_journey_id
      AND manuscript_id = p_manuscript_id
      AND journey_type = 'phase_transition'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_journey');
  END IF;

  -- 4 · Pre-check (a): approved count == chapter count
  --     Return the NAMED unapproved list, not just a count (RDP §3 rule).
  SELECT count(*) INTO v_total_chapters
  FROM public.chapters WHERE manuscript_id = p_manuscript_id;

  EXECUTE format(
    'SELECT count(*) FROM public.chapters WHERE manuscript_id = $1 AND phase_%s_approved_at IS NOT NULL',
    p_from_phase
  )
  INTO v_approved_chapters USING p_manuscript_id;

  IF v_approved_chapters < v_total_chapters THEN
    EXECUTE format(
      'SELECT coalesce(jsonb_agg(jsonb_build_object(''id'', id, ''chapter_number'', chapter_number, ''title'', title) ORDER BY chapter_number), ''[]''::jsonb) '
      'FROM public.chapters WHERE manuscript_id = $1 AND phase_%s_approved_at IS NULL',
      p_from_phase
    )
    INTO v_unapproved USING p_manuscript_id;

    -- Write J5 rejected terminal
    UPDATE public.as_journeys
    SET status = 'rejected',
        terminal_reason = 'unapproved_chapters: ' || (v_total_chapters - v_approved_chapters)::text,
        completed_at = NOW()
    WHERE id = p_journey_id;

    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'unapproved_chapters',
      'unapproved', v_unapproved,
      'total', v_total_chapters,
      'approved', v_approved_chapters
    );
  END IF;

  -- 5 · Pre-check (b): every post-epoch approval carries approved_by
  EXECUTE format(
    'SELECT coalesce(jsonb_agg(jsonb_build_object(''id'', id, ''chapter_number'', chapter_number, ''phase'', %s, ''approved_at'', phase_%s_approved_at) ORDER BY chapter_number), ''[]''::jsonb) '
    'FROM public.chapters WHERE manuscript_id = $1 '
    'AND phase_%s_approved_at IS NOT NULL '
    'AND phase_%s_approved_at >= ''2026-07-24T00:00:00Z'' '
    'AND phase_%s_approved_by IS NULL',
    p_from_phase, p_from_phase, p_from_phase, p_from_phase, p_from_phase
  )
  INTO v_anonymous_approvals USING p_manuscript_id;

  IF v_anonymous_approvals <> '[]'::jsonb THEN
    UPDATE public.as_journeys
    SET status = 'rejected',
        terminal_reason = 'missing_approval_actors',
        completed_at = NOW()
    WHERE id = p_journey_id;

    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'missing_approval_actors',
      'anonymous', v_anonymous_approvals
    );
  END IF;

  -- 6 · Advance (c): create the approved snapshot (collated content)
  SELECT string_agg(
    '# ' || CASE WHEN chapter_number = 0 THEN 'Prologue' ELSE 'Chapter ' || chapter_number END
    || ': ' || title || E'\n\n' || content,
    E'\n\n---\n\n'
    ORDER BY chapter_number
  ) INTO v_collated
  FROM public.chapters WHERE manuscript_id = p_manuscript_id;

  v_word_count := array_length(regexp_split_to_array(coalesce(v_collated, ''), '\s+'), 1);

  INSERT INTO public.manuscript_versions (
    manuscript_id, phase_number, version_type, content, word_count,
    created_by_editor, notes
  ) VALUES (
    p_manuscript_id, p_from_phase, 'approved_snapshot', v_collated, v_word_count,
    p_editor_name, p_editor_name || ' phase complete - all chapters approved (gate v2)'
  )
  RETURNING id INTO v_snapshot_id;

  -- 7 · Advance (d): mark current phase complete + activate next
  UPDATE public.editing_phases
  SET phase_status = 'complete',
      completed_at = NOW(),
      chapters_approved = v_total_chapters,
      updated_at = NOW()
  WHERE manuscript_id = p_manuscript_id AND phase_number = p_from_phase;

  v_next_phase := p_from_phase + 1;
  v_next_started_at := NOW();

  UPDATE public.editing_phases
  SET phase_status = 'active',
      started_at = v_next_started_at,
      updated_at = NOW()
  WHERE manuscript_id = p_manuscript_id AND phase_number = v_next_phase;

  UPDATE public.manuscripts
  SET current_phase_number = v_next_phase,
      updated_at = NOW()
  WHERE id = p_manuscript_id;

  -- 8 · Write J5 complete terminal
  UPDATE public.as_journeys
  SET status = 'complete',
      completed_at = NOW()
  WHERE id = p_journey_id;

  RETURN jsonb_build_object(
    'ok', true,
    'approved_count', v_total_chapters,
    'snapshot_id', v_snapshot_id,
    'next_phase_number', v_next_phase,
    'next_phase_started_at', v_next_started_at
  );
END;
$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION public.check_and_advance_phase(uuid, integer, text, uuid)
  TO authenticated;
```

---

## Notes on the design

- **Atomic transaction.** The whole gate (pre-checks → snapshot → phase-swap → journey terminal) runs in one function call. Either everything advances and the journey is `complete`, or nothing advances and the journey is `rejected`. No half-transitioned state.
- **Ownership check inline.** The RPC resolves the caller's `author_profiles.id` from `auth.uid()`, then verifies the manuscript belongs to them. SECURITY DEFINER bypasses RLS but ownership is manually enforced — the app can't request a transition on someone else's manuscript by construction.
- **Named list, not counts.** For the `unapproved_chapters` reject, the return payload includes the full `id + chapter_number + title` for each unapproved chapter. The app's reject surface renders these as "Open Chapter N" buttons. RDP §3's "no silent partial state" rule is honoured on both sides.
- **Journey terminal writes at the RPC layer.** RLS is bypassed by SECURITY DEFINER for these two UPDATEs (rejected on reject, complete on pass). The app never writes to `as_journeys` directly for these terminals — one truth, RPC owned.
- **`p_editor_name` accepts any string** for `manuscript_versions.created_by_editor` since that column matches an existing pattern in `createApprovedSnapshot()`. Not constrained to `alex/sam/jordan` at the DB level — the app passes the correct value.
- **The `editing_phases.chapters_approved` column** is set to `v_total_chapters` in step 7, matching the existing `transitionToNextPhase()` behaviour.

## Sensors / health_check

No new sensor requested — `inv_11_anonymous_approvals` already watches the actor coverage (pre-check b), and the pass path is verifiable via `as_journeys.status = 'complete'` for J5 rows. If SysAdmin wants a `inv_14_rejected_transitions_by_reason` view for register-level monitoring of reject reasons over time, that's their call.

## Verification method I'll use once the RPC is applied

- **E1 (unapproved chapter → reject, named list, no state change):** in dev, create a test manuscript with 3 chapters, approve 2. Call the RPC. Verify: response returns `ok=false, reason='unapproved_chapters', unapproved=[{...}]` with the unapproved chapter named. Verify: `editing_phases` and `manuscripts.current_phase_number` unchanged. Verify: `as_journeys` shows the J5 row as `rejected` with `terminal_reason` containing the count.
- **E2 (pass path, all four criteria machine-checked):** approve the third chapter. Call the RPC. Verify: response returns `ok=true` with `snapshot_id` and `next_phase_started_at`. Verify: `manuscript_versions` has the new snapshot row. Verify: `editing_phases` shows the from-phase complete and to-phase active with `started_at`. Verify: `manuscripts.current_phase_number` incremented. Verify: `as_journeys` shows the J5 row as `complete`.
- **E3 (approveChapter writes approved_by explicitly):** app-side code change, unrelated to this RPC. Verified by code review + a fresh approval test where the `phase_N_approved_by` column shows the actor from an authenticated write, distinct from a service-role write that would go through the DB trigger fallback only.

## What I'll build app-side once the RPC lands

1. `src/lib/phase_gate.ts` — thin TypeScript wrapper around `supabase.rpc('check_and_advance_phase', {...})`. Types matching the RPC's return jsonb. Called from the two transition surfaces.
2. Update `src/lib/supabase/helpers.ts:approveChapter` — write `approved_by` explicitly per §4 of the plan (E3 defence-in-depth).
3. Deprecate `src/lib/supabase/helpers.ts:transitionToNextPhase` — the old soft-check pattern. Callers migrate to `checkAndAdvancePhase`.
4. Refactor `src/app/phase-transition/page.tsx:handlePhaseTransition` — replace the inline four-step transition with the RPC call; render reject panel on `ok=false` per §3.
5. Refactor `src/app/author-studio/page.tsx completePhase` — replace `transitionToNextPhase` call with the RPC call; render inline chat reject message on `ok=false` per §3 Q2 option A (Paul-confirmed).

## What I'm asking SysAdmin to do

1. Review the RPC signature and semantics.
2. If good, apply as migration `d_as_05_phase_gate` (or SysAdmin's preferred naming).
3. Confirm apply via a response doc in `docs/sis/platform-dev/`.
4. Optional: add a `inv_14_rejected_transitions_by_reason` sensor if useful at the register level.

Standing by. Meanwhile I'll pre-build the `phase_gate.ts` wrapper and the app-side reject surfaces in a side branch that won't ship — when the RPC lands, wiring becomes a small final pass.
