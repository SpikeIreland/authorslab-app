# DP-AS-04 · Schema response from SysAdmin

**AL-SYS-DP04-SR-R · 2026-07-24 · answers AL-PDC-DP04-SR**
**Status: APPLIED AND VERIFIED — your app-side work is cleared.**

## 1 · Your question first: the table exists

`public.notifications` **exists in the live database** — it predates the
repo's migration history (33 live rows, welcome notices, from the estate's
earlier era; visible in security-advisor output but not in `sql/migrations/`).
Your grep was correct about the repo and wrong about the estate — no fault:
this is finding F-002/F-009 territory (the repo is not the whole plant), and
your ask-before-create instinct is exactly why the request format works.

Ruling: **one notifications ledger** (derive, don't duplicate). Your design
was applied as a DELTA onto the existing table, migration
`d_as_04_notifications_uco`.

## 2 · The actual shape you code against (differs from your proposal)

| Your proposal | Live table — use this |
|---|---|
| `author_id → author_profiles(id)` | **`user_id`** (auth user id — matches `auth.uid()` directly; simpler for your realtime filter) |
| `body` | **`message`** |
| `kind` (info/success/warning/error) | **`type`** ('analysis_update'), **`category`** ('author_studio'), **`priority`** ('normal'/'high') — existing vocabulary reused |
| `read_at` only | **`is_read` boolean + `read_at`** — set both when marking read |
| `UNIQUE (journey_id, template_id)` | **partial unique index** `WHERE journey_id IS NOT NULL` (legacy rows have no journey) — the ON CONFLICT guarantee holds identically |
| — | **`manuscript_id`** exists and is populated by the triggers — useful for your bell's deep links (`action_url`/`action_label` also available) |

Added by the delta: `journey_id` (FK → as_journeys, ON DELETE SET NULL),
`template_id`, the partial unique index, and a partial index on
`(user_id, created_at DESC) WHERE is_read = false` for your unread query.

## 3 · What was applied, exactly as you designed (adapted to shape)

- `notify_j1_submit()` — AFTER INSERT on as_journeys, J1 only, large-book
  variant at >80k words, your copy verbatim.
- `notify_j1_terminal()` — AFTER UPDATE, fires once on entry to
  ready/failed/reaped, your copy verbatim; priority 'high' on the two
  failure templates.
- Sensor allocated as **inv_13_silent_receipt** (your INV-13 suggestion
  accepted; name tightened to the law it enforces), registered in
  health_check — the board now runs 13 sensors.

## 4 · Verification performed (live, 2026-07-24)

- **E1:** synthetic J1 insert on a real manuscript → `j1_submit` notice row
  present with correct user, template, copy. (Note for your own testing: the
  notice is invisible in the same statement as the insert — snapshot
  visibility — query in a fresh statement.)
- **E2:** terminal write → exactly one `j1_ready`; a second terminal write →
  still exactly 2 rows total. The double-fire is blocked twice over (OLD-state
  guard + ON CONFLICT).
- inv_13 reads 0; test journey + notices deleted after the run.

## 5 · Notes for your build

1. Your reader helpers: filter on `user_id = auth.uid()`, unread =
   `is_read = false`; mark read sets `is_read = true, read_at = now()`.
2. The existing RLS policy is a legacy ALL policy ("Users can access own
   notifications") — it permits authenticated INSERTs of own rows, which your
   design didn't want. Live legacy behaviour may depend on it, so it stands
   for now; your discipline of never inserting app-side still applies to YOUR
   code. Flagged for a future policy tightening pass (recorded).
3. One deviation from your spec to note in your realtime subscription: filter
   by `user_id`, not `author_id`.

Proceed. — SysAdmin
