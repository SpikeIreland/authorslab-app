# Verification Delta — Ghostwriter Line vs Live Code

**AL-GWC-VD-001 · 2026-07-24 · Ghostwriter Line station**
**Source under review:** `docs/tabs/ghostwriter/BRIEF.md` (chat brief, last modified 2026-05-06) plus my accumulated context from the prior reviews of `AuthorsLab Site/Ghostwriter/ghostwriter-handover-brief-3.md` (superseded product spec) and the two legacy Ghostwriter pages.
**Method:** each claim held in memory or written into the brief was checked against live source under `src/`, live migrations under `sql/migrations/`, the live Supabase schema in the Author Portal project (ref `itlkncjiifbgvmvuejgm`), and the sibling verification pass filed today by the Platform Developer station (`docs/sis/platform-dev/2026-07-24-verification-delta.md`). Evidence cited inline. This is the first act per Re-Founding Handover §9 — accumulated context re-baselined against machinery.

**Verdict summary:** the Ghostwriter code itself has not moved since April. Everything around it has. The project shell exists, the fork modal creates `status='ghostwriting'` manuscripts, and the shared `as_journeys` machinery is live but Ghostwriter journey types are not yet registered. My integration work into the project shell has **not started**. The user-reported "stops after being designated a ghostwriter" symptom is unchanged and unresolved: 0 sections in the live database across all 8 test sessions, chat table quiet since 2026-03-31 05:52.

---

## 1 · What has moved since the brief was written

### 1a · The project shell landed

`src/app/projects/[id]/layout.tsx` (created 2026-05-08) exists as the real project chrome: brand bar → project header → `ProjectTabStrip` → `{children}` tab slot. Server-side auth check, loads `manuscripts` by id + author, redirects to `/lobby` on miss. The shell renders around every tab page.

The tab strip (`src/app/projects/[id]/_components/ProjectTabStrip.tsx`) carries the seven-tab layout from `docs/DESIGN_DECISIONS.md`, with Ghostwriter as the first journey tab. State derivation: when `manuscripts.status === 'ghostwriting'`, Ghostwriter is `active` and the downstream tabs are `pending` (lines 38–41); when the manuscript is anything else, Ghostwriter renders as `skipped` with strikethrough (line 44).

The brief's open question "does the Ghostwriter tab need its own URL or live entirely inside a single SPA-style project view" is answered: it has its own URL, `/projects/[id]/ghostwriter`, and shares the project shell's chrome via Next.js layout inheritance.

### 1b · Write-path project creation is wired

`src/app/api/projects/new/route.ts` inserts a `manuscripts` row with `status='ghostwriting'`, `portal_phase: 0`, `current_phase_number: 0`, `title: 'Untitled project'` (2026-05-08). This is the row the Ghostwriter tab needs to attach its session to. The Write branch of the Lobby's new-project modal already routes to `/projects/[id]/ghostwriter` after this call.

**Consequence for the line:** the `manuscript_id` scoping the brief flagged as a needed migration is now half-solved. The `manuscripts` row exists at project creation; what's missing is a column on `ghostwriter_sessions` to link back. Per the coordination protocol this is a SysAdmin request, not a self-applied migration.

### 1c · New shared machinery: `as_journeys` and actor-capture

Migration `sql/migrations/2026-07-24_D-AS-03_journeys_and_reaper.sql` created `public.as_journeys` with RLS, a pg_cron reaper every 5 minutes, and sensor `inv_12_unreaped_journeys`. Table checked: `journey_type` is constrained to `('full_analysis', 'chapter_analysis', 'editor_chat', 'phase_transition')` and `editor_name` to `('alex', 'sam', 'jordan')`. Ghostwriter journey types (`eden_match`, `ghostwriter_chat`, `read_material`, `section_draft`) are **not yet registered** — they need to go through SysAdmin per register discipline (Re-Founding Handover §6).

Migration `sql/migrations/2026-07-24_D-AS-01_approval_actor.sql` added `chapters.phase_{1,2,3}_approved_by` with a trigger. Not directly relevant to my line today; the pattern binds the eventual D3 transfer-approval desk (see §3 below).

### 1d · The Ghostwriter code itself has not moved

- `src/app/ghostwriter/page.tsx` (673 lines) — last modified 2026-04-24
- `src/app/ghostwriter/studio/page.tsx` (657 lines) — last modified 2026-04-24
- `src/lib/n8n-config.ts` — last modified 2026-04-24

Neither the standalone onboarding nor the standalone studio has been touched in three months.

---

## 2 · What claims in the brief are no longer true

### 2a · "The project shell doesn't exist yet as a built component"

**False as of 2026-05-08.** The brief said: "coordinate with whoever is building the shell, or build a thin shell wrapper for testing the Ghostwriter tab in isolation." The shell is the Platform Developer's, it is live, and it is the surface my studio needs to slot into. Their verification-delta today (`docs/sis/platform-dev/2026-07-24-verification-delta.md` §3) confirms it is real, unchanged, and in use.

Coordination shape: I refactor `src/app/ghostwriter/studio/page.tsx` to receive `projectId`/`manuscriptId` and author context from props/parent, drop its own auth check and full-screen chrome; the Platform Developer swaps `src/app/projects/[id]/ghostwriter/page.tsx` from `PlaceholderTab` to render my studio. Neither side silently touches the other's files.

### 2b · "`has_ghostwriter_access` becomes a subscription-tier check"

**Framing superseded.** The brief said "don't build new paywall logic; check the flag for now and assume it'll be wired to subscription state later." That instruction still stands operationally, but the framing has hardened: entity ownership is D7 (person or imprint accounts), sign-off default is D9 (owner holds approval keys), and the tier-3 agency-view path is deleted (D5). The migration-cheap rule (Line Charter §4) binds any schema change that touches access.

Practical effect: when I strip `src/app/ghostwriter/page.tsx:186-189`'s `router.push('/checkout')` and `src/app/ghostwriter/studio/page.tsx:182-185`'s `router.push('/pricing')` from the pages during integration, I don't invent replacement gating — the project shell's layout already does auth + author-scoped manuscript loading (`src/app/projects/[id]/layout.tsx:26-42`), and access-tier enforcement is downstream of that.

### 2c · "A `manuscript_id` link on `ghostwriter_sessions` is needed — discuss with Paul because of existing beta data"

**Half-obsolete.** The `manuscripts` side is now clean — the fork creates the row at project-creation time. The `ghostwriter_sessions.manuscript_id` column still doesn't exist; the beta-data concern remains but is quantified below (§4c: 8 stale sessions, 1 author, 0 sections, no chat since March). This looks tractable — a straightforward migration that maps sessions to manuscripts and marks stragglers `abandoned`, per SysAdmin process.

### 2d · "The Ivy/Reid system prompts are written and ready" (carried through from the older repo-root brief the current brief cites for tone)

**Not evidenced.** No prompt files under `src/lib/ghostwriter/`, no prompt strings in either page other than the four hardcoded opening lines duplicated between `ghostwriter/page.tsx:407-419` and `ghostwriter/studio/page.tsx:249-275`. The system prompts live on the n8n side (workflows `ivy-chat`, `reid-chat`) and I do not currently have visibility into them from this station. If they exist and are good, we assume so; if not, they surface as a defect when the "AI-assisted, not AI-generated" posture audit runs.

### 2e · "The handoff from Ghostwriter to Author Studio: writer-triggered or system-suggested" (open question in the brief)

**Answered by D3 + D9 + D10 as a shape, not yet as machinery.** The brief flagged this as an open UX question. The plant answers it: the D3 transfer is an author-owned inspection desk, the project owner holds the key (D9), and the approval carries the actor (D10). Machinery is dashed on the drawing — my line owns building it when the RDP for Ghostwriter arrives.

---

## 3 · What exists in live code and DB that the brief doesn't mention

### 3a · Storage bucket with correct per-author RLS

`storage.buckets.ghostwriter-uploads` exists (created 2026-03-21 01:17), private, with four per-author-folder policies on `storage.objects` (insert / select / update / delete, each scoped via `(storage.foldername(name))[1] IN (SELECT author_profiles.id::text WHERE auth_user_id = auth.uid())`). The upload path at `ghostwriter/page.tsx:285-291` matches this scoping. Working as intended; the brief doesn't mention it.

### 3b · Schema drift on `ghostwriter_sessions`

The table has columns the frontend does not write, added at some point after the original build:
- `voice_profile jsonb` (default `{}`) — intended for D3 Phase 3 "voice calibration"; untouched
- `uploaded_file_path text`, `uploaded_file_name text`, `uploaded_file_type text`, `uploaded_file_text text` — the app instead stuffs the path into `book_brief.uploadedFilePath` (`ghostwriter/page.tsx:452`)
- `material_read_at timestamptz` — presumably a flag for the gap-analysis workflow to set on read completion; never set

Two paths: populate the columns from the frontend during the refactor (surface for n8n workflows to consume), or drop them via SysAdmin. Keeping both is a maintenance hazard and creates two silent sources of truth.

### 3c · `ghostwriter-gap-analysis` webhook imported but never called

`src/lib/n8n-config.ts:139` registers `ghostwriterGapAnalysis` under Phase 7, and `src/app/ghostwriter/studio/page.tsx:15` imports it into `GHOSTWRITER_WEBHOOKS.gapAnalysis`. Grep confirms zero call sites. The n8n workflow is registered as "Ghostwriter Read Material" (07.04) and is the most likely home for the initial section-map population from an upload — it is not currently invoked. See §5 for why this matters.

### 3d · Foreign-key hook for the D3 transfer already exists

`ghostwriter_sessions.handed_off_manuscript_id → manuscripts(id)` is present and constrained (verified via `information_schema.table_constraints`). Never written by any code path I can find. When the D3 desk machinery is built, the persistence side has the column ready; approval actor and timestamp would need adjacent fields (per D10 pattern, `approved_at` and `approved_by` columns via SysAdmin).

### 3e · Multi-session accumulation with no dedup logic

8 rows in `ghostwriter_sessions`, all `status='active'`, all for one `author_id`, all matched to Reid. Every re-run of the onboarding funnel creates a new row (`ghostwriter/page.tsx:445-455`). The studio then loads `.eq('status','active').order('created_at', desc).limit(1)` (`studio/page.tsx:196-199`), which hides the pile-up. This is not a data-loss problem yet, but it violates the "one project, one workpiece" grammar and will confuse the eventual `manuscript_id` scoping.

### 3f · Old-friend script wired at legacy entry, not project entry

`src/app/onboarding/page.tsx:180-226` reads the Ghostwriter completion flags and runs the Ivy/Reid old-friend intro. That page is the legacy standalone onboarding for Edit-path (uploaded-manuscript) authors. It is **not** part of the new Lobby → Project Shell path. When Write-path graduates into the Author Studio tab, the old-friend moment needs to move — its natural home is inside Author Studio's onboarding for a project whose creator arrived via Ghostwriter. Not urgent, but the current placement no longer maps to the journey.

---

## 4 · What state my integration work is in

### 4a · Project-shell integration: **not begun**

`src/app/projects/[id]/ghostwriter/page.tsx` (Platform Dev, 13 lines) renders `PlaceholderTab` with `legacyHref="/ghostwriter"`. My studio has not been refactored to render inside the shell. No `projectId`/`manuscriptId` prop plumbing exists yet on either side. This is the primary integration work on my desk.

### 4b · Legacy pages: **standing, unmodified, still the target of the placeholder link**

The two 2026-04 files are still what a Write-path user hits when they follow the "In progress · Open Ghostwriter (legacy)" button on the Ghostwriter tab. Any change I make to the legacy pages ships immediately to whichever beta path uses them — same discipline the Platform Developer applies to the legacy `/author-studio` page.

### 4c · Session and section state: **quiet since March**

- Sessions: 8 total, all `active`, 1 distinct author, latest created 2026-03-31 05:51:27
- Sections: **0 total, across all 8 sessions** — the specific symptom Paul reports
- Chat: 13 messages (4 author, 9 reid), latest 2026-03-31 05:52:13

The section-map surfacing failure diagnosed in the prior review has not moved: on the Ivy/Reid n8n side, either `data.sectionUpdate` is not being returned in the shape `studio/page.tsx:282-319` expects (`{ action: 'created' | 'update', section?, sectionId?, status? }`), or the "Ghostwriter Read Material" workflow that should populate the initial map from the upload is not being invoked. Both are outside this station's write authority (n8n deployment is Paul's) but this station owns describing what the app expects.

### 4d · Journey mechanism: **not yet applicable to my line**

The Ghostwriter equivalents of J1–J5 (Eden match, Ivy/Reid chat reply, Read Material gap analysis, Section draft, D3 transfer) are not registered as journey types on `as_journeys`. Adding them is a SysAdmin migration (register discipline). Wiring them into the studio is DP-GW-equivalent work that will land on this line's dispatch queue when the Ghostwriter I/O Schedule and RDP arrive from SIS.

Until then, the standing laws still apply to any code I write: no silent failure, no infinite spinner, deterministic gate at every AI-call boundary, entity-neutral copy, AI-assisted-not-generated posture.

### 4e · Copy-audit debt

Two entity-neutrality violations to fix in the studio during the refactor, per D7's migration-cheap rule:
- `studio/page.tsx:474` — "Your book is taking shape" → "Your project is taking shape"
- `ghostwriter/page.tsx:474` — button copy "Let's begin" is fine; the surrounding "Before you meet your writing partner, I'd like to ask you a few questions" is fine; but Eden's Ivy hello (`page.tsx:399`) and Reid hello (`page.tsx:401`) are "story" and "building" respectively — acceptable in a first-person warm register, worth confirming with Paul rather than editing on autopilot

Ivy's opening line "Let's find your story" and Reid's "Let's figure out what we're building" are voice choices, not entity violations — but I flag them for the audit rather than change unilaterally.

---

## 5 · The immediate substantive question

The user-reported failure (chat happens, section map stays empty, no draft ever forms) is the biggest thing standing between my line and any demonstrable work. Two ways forward, mutually exclusive at this station:

**A · Fix the legacy studio first, then integrate.** Diagnose why `sectionUpdate` never arrives, coordinate with Paul on the n8n side, get the section map surfacing, prove the flow end-to-end on the standalone page — then refactor a working thing into the project shell.

**B · Integrate first, then fix.** Refactor the studio into `/projects/[id]/ghostwriter/`, drop the standalone auth and routing, wire `projectId`/`manuscriptId`, add the `manuscript_id` migration request — then debug the n8n side against the new surface.

I lean **A**: the section-surfacing bug is the reason the studio feels dead, and diagnosing it against the current shape (which we understand and Paul has beta-tested) is cheaper than diagnosing it against a shape we're building. The refactor is mostly mechanical once the underlying flow proves out. But this is a sequencing call that touches Paul's n8n deployment schedule and the Platform Developer's dispatch queue — I'll surface it as a short brief in `docs/sis/ghostwriter/` when the Ghostwriter I/O Schedule arrives, and defer to Paul until then.

---

## 6 · Findings register-worthy observations

None from this pass rise to method-level. One near-miss worth naming so the SIS Methodology chat can decide:

**The schema-drift pattern in §3b — columns added to a table that the owning application doesn't write.** This is the same shape as the `workflow_executions` deadwood the Author Studio verification implied (columns without writers, or writers without gates). If it appears on a second line, it's a pattern; on a third, it's a discipline. I'll write it up in `docs/sis/findings/` if the equivalent appears on Design, Publishing, or Marketing lines during their verification passes.

---

## 7 · Next actions

1. This delta is filed as evidence.
2. Continuing to hold on further integration work until the Ghostwriter I/O Schedule and RDP arrive from SIS — until then the priority per Re-Founding Handover §9 last line ("continue whatever integration work you were on") is: nothing was in-flight; the pass is the work.
3. If Paul wants me to start on **A** (section-surfacing diagnosis) or **B** (project-shell integration) before the Ghostwriter RDP lands, either is doable — surface the choice and I'll produce a dispatch-shaped brief for the chosen path.
