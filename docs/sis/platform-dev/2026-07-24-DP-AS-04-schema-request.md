# DP-AS-04 · Schema request to SysAdmin

**AL-PDC-DP04-SR · 2026-07-24 · Platform Developer station**
**Requester station:** Platform Developer
**For SysAdmin's queue** (route via Paul)
**Dispatch consuming this:** AL-DSP-001 · DP-AS-04 (UCO minimum — acknowledgment + completion notices)

## Context

The dispatch DP-AS-04 references "the existing `notifications` table" as the single source of truth for user-facing messages (in-app bell + optional email as two lenses over the same row). Verified via grep of `src/` and `sql/migrations/`: **the table does not currently exist in this codebase**. Requesting SysAdmin apply the machinery below so DP-AS-04's app-side work can wire against it.

If a `notifications` table exists elsewhere (a wider AuthorsLab estate migration, or a Clarence-pattern shared substrate) and I've simply missed it — please point me at where and disregard this schema request; I'll adapt the app-side to whatever's already there.

## Proposed table shape

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.author_profiles(id) ON DELETE CASCADE,
  -- Optional link back to the journey that triggered this notification.
  -- Null for notifications not tied to a journey (future: system messages,
  -- imprint updates, etc.).
  journey_id uuid REFERENCES public.as_journeys(id) ON DELETE SET NULL,
  -- Deterministic template identifier. All copy lives in the app (or a DB
  -- template table if SysAdmin prefers). No LLM-generated content — DP-AS-04
  -- E3 requires zero notification content produced by an AI.
  template_id text NOT NULL,
  -- Deterministic rendered strings; kept on the row so a future template
  -- change doesn't retroactively rewrite history.
  title text NOT NULL,
  body text NOT NULL,
  -- The kind of thing this is — informs UI grouping and bell colour.
  kind text NOT NULL DEFAULT 'info'
    CHECK (kind IN ('info', 'success', 'warning', 'error')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- E2 requires "exactly one notice row" per terminal state. This is the
  -- dedupe key: a unique constraint on (journey_id, template_id) prevents
  -- duplicate notifications for the same journey terminal even if a trigger
  -- fires twice.
  UNIQUE (journey_id, template_id)
);

CREATE INDEX IF NOT EXISTS notifications_author_unread_idx
  ON public.notifications (author_id, created_at DESC)
  WHERE read_at IS NULL;
```

## Proposed RLS

Author sees own notifications; author marks own read; INSERT limited to service role and to DB triggers (both bypass RLS naturally). Authenticated INSERT policy is deliberately omitted — the app inserts via a Supabase Edge Function or a service-role-signed request, OR the DB trigger below is the sole INSERT path.

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (is_admin() OR author_id IN (
    SELECT id FROM public.author_profiles WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Authors mark own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (author_id IN (
    SELECT id FROM public.author_profiles WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (author_id IN (
    SELECT id FROM public.author_profiles WHERE auth_user_id = auth.uid()
  ));
-- INSERT: no authenticated policy. Only service role and DB triggers.
```

## Proposed DB triggers on as_journeys

DP-AS-04's dispatch says the terminal notices are "state-driven, from the journey row transition." The most robust design (UCO C1 pattern) is DB triggers on `as_journeys` so notifications land regardless of whether any client is watching the transition. Two triggers:

```sql
-- On J1 INSERT (submitted): instant deterministic ack notification.
-- (Non-J1 types are excluded — dispatch scopes UCO to full_analysis only.
-- Extensible later per register discipline.)
CREATE OR REPLACE FUNCTION public.notify_j1_submit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  aid uuid;
  wc integer;
  is_large boolean;
BEGIN
  IF NEW.journey_type = 'full_analysis' THEN
    SELECT author_id INTO aid FROM public.manuscripts WHERE id = NEW.manuscript_id;
    SELECT current_word_count INTO wc FROM public.manuscripts WHERE id = NEW.manuscript_id;
    is_large := coalesce(wc, 0) > 80000;

    INSERT INTO public.notifications (author_id, journey_id, template_id, title, body, kind)
    VALUES (
      aid, NEW.id,
      CASE WHEN is_large THEN 'j1_submit_large' ELSE 'j1_submit' END,
      CASE WHEN is_large
           THEN 'Careful processing — this is a big book'
           ELSE 'Reading started' END,
      CASE WHEN is_large
           THEN 'Your editor has started reading. This is a big manuscript, so it will take longer than usual — we''ll let you know when it''s done.'
           ELSE 'Your editor has started reading — we''ll let you know when the read is done.' END,
      'info'
    )
    ON CONFLICT (journey_id, template_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS as_journeys_notify_submit ON public.as_journeys;
CREATE TRIGGER as_journeys_notify_submit
  AFTER INSERT ON public.as_journeys
  FOR EACH ROW EXECUTE FUNCTION public.notify_j1_submit();

-- On J1 UPDATE to terminal: completion / failure / reaped notification.
CREATE OR REPLACE FUNCTION public.notify_j1_terminal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  aid uuid;
  terminal_status text;
BEGIN
  IF NEW.journey_type = 'full_analysis'
     AND NEW.status IN ('ready', 'failed', 'reaped')
     AND OLD.status NOT IN ('ready', 'failed', 'reaped') THEN
    terminal_status := NEW.status;
    SELECT author_id INTO aid FROM public.manuscripts WHERE id = NEW.manuscript_id;

    INSERT INTO public.notifications (author_id, journey_id, template_id, title, body, kind)
    VALUES (
      aid, NEW.id,
      'j1_' || terminal_status,
      CASE terminal_status
        WHEN 'ready'  THEN 'Reading complete'
        WHEN 'failed' THEN 'Reading hit a snag'
        WHEN 'reaped' THEN 'Reading took longer than expected'
      END,
      CASE terminal_status
        WHEN 'ready'  THEN 'Your editor has finished reading — head to the studio when you''re ready to start editing.'
        WHEN 'failed' THEN 'Something went wrong during the reading. It''s been logged and we''re on it.'
        WHEN 'reaped' THEN 'The reading did not complete in the expected time. It''s been logged and we''re looking into it — please try again in a moment.'
      END,
      CASE terminal_status WHEN 'ready' THEN 'success' ELSE 'warning' END
    )
    ON CONFLICT (journey_id, template_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS as_journeys_notify_terminal ON public.as_journeys;
CREATE TRIGGER as_journeys_notify_terminal
  AFTER UPDATE ON public.as_journeys
  FOR EACH ROW EXECUTE FUNCTION public.notify_j1_terminal();
```

**Why DB triggers, not app-side:** if a writer submits a full-manuscript analysis and then closes the tab, the notification must still land when the terminal state transitions — which will happen either from the n8n workflow (writing back to `as_journeys`) or from the reaper. Neither of those touches an active client. The DB trigger is the only place the transition can be observed regardless of client state. UCO C1's "one truth" property depends on this.

The `ON CONFLICT (journey_id, template_id) DO NOTHING` guarantee is what makes E2 ("exactly one notice row") mechanically enforced rather than assumed.

## Proposed sensor

```sql
CREATE OR REPLACE VIEW production_control.inv_13_orphan_terminals AS
SELECT j.id AS journey_id, j.status, j.completed_at
FROM public.as_journeys j
LEFT JOIN public.notifications n
  ON n.journey_id = j.id AND n.template_id LIKE 'j1_%'
WHERE j.journey_type = 'full_analysis'
  AND j.status IN ('ready', 'failed', 'reaped')
  AND j.completed_at > '2026-07-24T00:00:00Z'
  AND n.id IS NULL;
```

Watches for J1 terminals that did not produce a notification — the direct sensor for DP-AS-04 E2. Register at your discretion (INV-13 suggested but Paul's SysAdmin allocates numbers, not me).

## What I'll build app-side once this lands

1. `src/lib/notifications.ts` — reader helpers only. INSERT is DB-trigger territory per this design. Helpers: `listUnreadForCurrentUser`, `markRead(notification_id)`, `markAllRead()`.
2. `src/components/NotificationBell.tsx` — small bell in the Author Studio header. Realtime subscription to `notifications` filtered by author_id. Shows unread count; clicking opens a small panel with recent items and a "mark all read" action.
3. Mount the bell inside the legacy `/author-studio/page.tsx` header (existing header, minimal edit — I've done small edits there safely twice now).
4. Do NOT touch the notification INSERT surface app-side. All INSERTs come from the DB trigger, per UCO C1's single-source-of-truth property.

## What's not in DP-AS-04's scope

- Chapter analysis (J2), chat (J3), phase transition (J5) notifications — DP-AS-04 scopes to J1 per the dispatch text ("On J1 submit… On J1 terminal…"). Extensible per register discipline when SysAdmin issues future dispatches.
- Email lens (Clarence C1 optional per dispatch) — deferred; when built, it'll be one send per notifications row via a supabase edge function or n8n reader, never a second source of truth.
- Notification preferences (mute categories, etc.) — future.

## Verification method I'll use once the migration lands

- **E1 (submit → ack row within 5s, visible in-app):** trigger a J1 in the dev app, watch `select * from public.notifications where journey_id = <that>` return a row within 5 seconds; the bell shows unread count.
- **E2 (exactly one notice per terminal):** trigger a J1, wait for the workflow (or the reaper) to write terminal state. Assert `select count(*) from notifications where journey_id = <that>` returns exactly 2 rows (1 submit + 1 terminal). Force a second UPDATE to terminal to prove the `ON CONFLICT` guarantee blocks duplicates.
- **E3 (zero LLM-generated content):** code review of the two trigger functions + the app-side helpers → all strings are inline SQL literals or JS constants, no LLM API calls in the write path.

## What I'm asking SysAdmin to do

1. Confirm whether the `notifications` table exists elsewhere in the estate (if yes, point me at it and disregard the schema request).
2. If not, apply the migration above (table + triggers + sensor + health_check registration), tuned to SysAdmin's conventions.
3. Once applied, drop a note in `docs/sis/platform-dev/` (or route via Paul) confirming so I can execute the app-side work.

Standing by. Meanwhile I'll pre-build `src/lib/notifications.ts` and `NotificationBell.tsx` in a side branch that won't ship — that way when SysAdmin's migration lands, the wiring is a small final pass, not a full build session.
