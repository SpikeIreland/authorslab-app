# Verification Delta — Current Build State vs Live Code

**AL-PDC-VD-001 · 2026-07-24 · Platform Developer station**
**Source under review:** the "Current build state (as of July 2026)" section of `AuthorsLab Platform Priorities Brief.docx`.
**Method:** for each item in that section, verify against live source files under `src/`, live migrations under `sql/migrations/`, and the SIS pack in `docs/sis/`. Evidence cited inline (file path + line refs). This is the first act per Refounding Brief §5 — accumulated context re-baselined against machinery, not trusted from memory.

**Verdict summary:** the brief's per-item claims for the ten app surfaces are **all still true** as of today. What has moved is (a) two SysAdmin-applied migrations that added `as_journeys` and `chapters.phase_N_approved_by` (with sensors), and (b) the entire SIS methodology pack in `docs/sis/` which the brief anticipated as "framing pending" and which now supersedes several sections of the brief itself. Detail below.

---

## Per-item verification

### 1 · Home / Companion chat — brief claim: real, Anthropic-backed, persisted

**Still true.** Files present and unchanged since I wrote them:

- `src/app/home/page.tsx` — Clarence-pattern two-pane, working
- `src/app/api/home/chat/route.ts` — Anthropic direct, system prompt inline
- `src/app/api/home/conversations/route.ts` (GET/POST/PATCH/DELETE)
- `src/app/api/home/conversations/[id]/messages/route.ts` (GET)
- `sql/migrations/20260506_home_conversations.sql` — `home_conversations` + `home_messages` tables with RLS

### 2 · Lobby — brief claim: real, five-stage pill row, "+ Start a new project" opens fork modal

**Still true.**

- `src/app/lobby/page.tsx` present
- `src/app/lobby/_components/NewProjectModal.tsx` present
- `src/app/api/lobby/projects/route.ts` present
- Modal opens from `+ Start a new project` button; Write path calls `/api/projects/new`, Edit path routes to `/onboarding`

### 3 · Project shell (chrome + tab strip) — brief claim: real

**Still true.**

- `src/app/projects/[id]/layout.tsx` — brand bar, project header, tab strip, tab content slot
- `src/app/projects/[id]/page.tsx` — index redirect to default tab
- `src/app/projects/[id]/_components/ProjectTabStrip.tsx` — active-state semantics correct
- `src/app/projects/[id]/_components/PlaceholderTab.tsx` — shared placeholder component
- All seven tab pages present as routes: `ghostwriter/`, `author-studio/`, `design/`, `publishing/`, `marketing/`, `research/`, `script/`

### 4 · New-project fork modal — brief claim: real, Write path creates project with `status='ghostwriting'`

**Still true.** `src/app/api/projects/new/route.ts` inserts a manuscript row with `status: 'ghostwriting'`, `portal_phase: 0`, `current_phase_number: 0`; Write branch in the modal routes to `/projects/[id]/ghostwriter`; Edit branch routes to `/onboarding`.

### 5 · Ghostwriter tab — brief claim: placeholder, routes to legacy

**Still true.** `src/app/projects/[id]/ghostwriter/page.tsx` renders the `PlaceholderTab` component with `legacyHref="/ghostwriter"`. Legacy `/src/app/ghostwriter/page.tsx` and `/src/app/ghostwriter/studio/page.tsx` still present and unchanged. The Ghostwriter chat's integration work is not yet visible in this repo — coordinate via the handover I just placed at `docs/sis/ghostwriter/2026-07-24-refounding-handover.md`.

### 6 · Author Studio tab — brief claim: bridge view, editor sub-bar + chapter table + jump links, legacy still in use

**Still true.**

- `src/app/projects/[id]/author-studio/page.tsx` — bridge view with editor pills, three progress cards, chapter status table using D/L/C tri-state, per-chapter `Open →` link
- `src/app/api/projects/[id]/author-studio/state/route.ts` — aggregation endpoint
- Legacy `src/app/author-studio/page.tsx` — 3,706 lines, unchanged, still the target of the bridge's CTA and per-chapter links, still the editor used by beta testers

### 7 · Design tab — brief claim: partially real, Cover section mock+working, Taylor chat real, other sections placeholders

**Still true.**

- `src/app/projects/[id]/design/page.tsx` — four sections, Cover active, mock `COVER_CONCEPTS` constant with four colored concepts; selection persists to `publishing_progress.selected_cover_url` via `/api/projects/[id]/design/cover/route.ts`
- Taylor chat real: `src/app/api/projects/[id]/design/chat/route.ts` (Anthropic direct, teal #1D9E75 avatar, system prompt loads project title/genre + selected concept)
- Front matter / Back matter / Interior format sections show "coming soon" placeholders

### 8 · Publishing tab — brief claim: partially real, metadata form working with auto-save, Morgan chat real, other sections placeholders

**Still true.**

- `src/app/projects/[id]/publishing/page.tsx` — five sections, Metadata active with title/subtitle/description/categories/keywords form, auto-save on blur, "Refine with Morgan →" button
- Metadata persisted via `/api/projects/[id]/publishing/metadata/route.ts` to `publishing_progress.metadata` jsonb
- Morgan chat real: `src/app/api/projects/[id]/publishing/chat/route.ts` (amber #BA7517)
- ISBN / Pricing / Platforms / Launch sections show placeholders

### 9 · Marketing tab — brief claim: partially real, Launch plan timeline working, Riley chat real, other sections placeholders

**Still true.**

- `src/app/projects/[id]/marketing/page.tsx` — six sections, Launch plan active with date picker → template-driven timeline → checkable tasks
- Launch state persisted to `project_marketing` (`sql/migrations/20260508_project_marketing.sql`)
- Riley chat real: `src/app/api/projects/[id]/marketing/chat/route.ts` (coral #D85A30), system prompt includes launch date, countdown, outstanding tasks list
- Audience / Pitch / Content / Reviews / Performance sections show placeholders
- Shared template in `src/lib/marketing/launchTemplate.ts`

### 10 · Research tab — brief claim: real, single-conversation Companion with project context

**Still true.** `src/app/projects/[id]/research/page.tsx` — single-pane chat, three starter prompts on empty state; `src/app/api/projects/[id]/research/chat/route.ts` — system prompt injects manuscript title, genre, word count, `manuscript_summary`, `full_analysis_key_points`.

### 11 · Script tab — brief claim: placeholder, text-only

**Still true.** `src/app/projects/[id]/script/page.tsx` renders `PlaceholderTab` with `status="coming-soon"`, no legacy link, no API routes.

### 12 · Legacy `/author-studio` page — brief claim: 3,706 lines, in beta use, referenced by bridge and Ghostwriter placeholder

**Still true.** `src/app/author-studio/page.tsx` present at 3,706 lines. `src/lib/n8n-config.ts` last modified 2026-04-24 — unchanged since well before the SIS refactor.

---

## What has appeared that the brief does not mention

Two DB migrations applied by SIS SysAdmin on 2026-07-24, referenced in Refounding Brief §4:

### 12a · `chapters.phase_{1,2,3}_approved_by` + actor-capture trigger

**Migration file:** `sql/migrations/2026-07-24_D-AS-01_approval_actor.sql`.

Three new nullable uuid columns on `public.chapters`, referencing `public.author_profiles(id)`. A `BEFORE UPDATE` trigger `chapters_approval_actor` fires on any row update that sets a `phase_N_approved_at` timestamp for the first time; it resolves the signed-in user's `author_profiles.id` via `auth.uid()` and writes it into the matching `phase_N_approved_by` column. Watched by sensor `inv_11_anonymous_approvals` (AMBER; violation = an approval after 2026-07-24 with no recorded actor).

**App-side status:** `src/lib/supabase/helpers.ts:137 approveChapter()` writes `phase_N_approved_at` and `content` only — does not write `approved_by` explicitly. This is exactly the defence-in-depth I owe under **DP-AS-05 · E3** — will be added when that dispatch runs. Until then, the DB trigger covers the field for authenticated writes; service-role writes bypass the trigger's `auth.uid()` resolution and are what `inv_11` will catch if any n8n workflow approves chapters (worth confirming during DP-AS-06 that no n8n workflow does this).

### 12b · `public.as_journeys` table + `pg_cron` reaper + sensors

**Migration file:** `sql/migrations/2026-07-24_D-AS-03_journeys_and_reaper.sql`.

Table columns match the dispatch spec exactly (`id, journey_type, manuscript_id, chapter_id, editor_name, status, submitted_at, received_at, completed_at, timeout_at, terminal_reason, created_by`). RLS: authenticated members can INSERT for their own manuscripts and SELECT their own journeys; no authenticated UPDATE — status transitions are worker-written (service role) or reaper-written. `production_control.reap_stalled_journeys()` scheduled every 5 minutes via `cron.schedule('as-journeys-reaper', '*/5 * * * *', ...)`. Watched by sensor `inv_12_unreaped_journeys` (AMBER; violation = a journey past its `timeout_at + 10 minutes` still in a non-terminal state).

**App-side status:** zero references to `as_journeys` or `journey_id` anywhere in `src/` today (verified via grep). This is the exact scope of **DP-AS-02**, currently unwired.

---

## What has changed conceptually since the brief was written

Not code — framing. These affect how I read my own previous work.

- **The "stochastic/deterministic hybrid layer as a design consideration for each priority"** section of the brief said the framing was pending. It's now landed as the full SIS pack. Every reference in the brief to "when Paul shares the hybrid framing in full, this brief will be updated" is superseded by the seven governing docs in `docs/sis/`.
- **The brief's P1–P5 priority ranking** is preserved but re-cast: my Wave 1 dispatches (DP-AS-02, -04, -05, -06) are demo-hardening for the September anchor and take precedence over further tab-interior work. The brief's P1 (Ghostwriter integration) becomes a sibling chat's problem, not mine. My tab-work priorities from the brief still stand as second-order — but not before the Wave 1 Author Studio wiring is instrumented.
- **The brief's "positioning implications (imprint-in-a-box)"** section is now Decision D7, binding, with the migration-cheap rule as a standing law rather than guidance.
- **The brief's "customer-tier framing"** (indie / small imprint / agency) is reflected in the Line Charter §4 (person or imprint entities), with tier-3 agency views explicitly deferred as roadmap per D5's design law.

---

## Findings register-worthy observations

None discovered during this verification pass — the material state matches the SIS pack's assumptions and the brief. If I discover anything method-level during DP-AS-02 wiring, I'll drop it into `docs/sis/findings/` with a `FINDING:` prefix.

One observational note that isn't quite a finding: `sql/migrations/` currently mixes two filename conventions — the four May 2026 files use `20260506_snake.sql` and `20260508_snake.sql`, while the two July SysAdmin files use `2026-07-24_D-AS-NN_snake.sql`. Not a problem; noting it in case the SysAdmin prefers convergence to one convention going forward.

---

## Next actions (per Refounding Brief §5)

1. This delta is filed as evidence.
2. Ghostwriter chat re-founding handover is filed at `docs/sis/ghostwriter/2026-07-24-refounding-handover.md`.
3. Beginning **DP-AS-02** (journey wiring app-side) next. Coordinating with Paul before touching `src/lib/n8n-config.ts` if any webhook signature changes are needed to pass `journey_id`.
