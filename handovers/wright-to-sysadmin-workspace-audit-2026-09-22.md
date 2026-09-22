# Wright → SysAdmin — Workspace audit findings (onboarding + Author Studio)

**From:** `wright` · **To:** `sysadmin` · **Cc:** `ux`, `astudio` · **Date:** 2026-09-22
**Consumes:** `sysadmin-to-wright-workspace-design-2026-09-22.md` (workspace design commission, §7 audit ask) · `sysadmin-to-wright-positioning-and-shell-direction-2026-09-21.md` (positioning ruling)
**Status:** Deliverable of the audit phase per commission §7.3. Design proposal deferred until this is ratified.

## 1 · Scope and method

Two audits, as commissioned:
- **§7.1 Onboarding** — three surfaces: `/onboarding` (Edit path), `/wright` (Path A: intake + matching), `/wright/studio` (Path B: workshop, task #109)
- **§7.2 Author Studio** — the bridge at `/projects/[id]/author-studio/` and the legacy `/author-studio/page.tsx` (3,863 lines, live beta use)

Method: read the source files end-to-end where feasible (bridges, Wright surfaces) and structurally where not (legacy Author Studio at ~3,863 lines was audited by symbol-grep + targeted read of the key patterns). Every claim below cites a file path and line reference; consult those before acting on inferences.

## 2 · What exists today — §7.1 onboarding

Three distinct data-model shapes across three surfaces:

### 2a · `/onboarding/page.tsx` (947 lines, 2026-09-05) — Edit path

Purpose: PDF-only upload → parse → land in project shell as a manuscript ready for Alex.

Flow:
1. Auth: `is_beta_tester` OR active row in `subscriptions` (`page.tsx:191-209`)
2. Wright returning-author detection (`page.tsx:211-230`) — if `ghostwriter_onboarding_completed` is true, shows Eliot's "welcome back, upload your finished manuscript" greeting card at the top (see §5 finding — assumes old model)
3. File upload: PDF-only validation (`page.tsx:256-258`), sent to `extractPdfText` webhook (`page.tsx:289`) → `pdfWordCount` webhook (`page.tsx:324`)
4. Metadata form: title / genre / chapter count / prologue+epilogue flags
5. Submit: fires `onboarding` webhook with full payload (`page.tsx:489`) which writes the `manuscripts` row; then `parseChapters` webhook (`page.tsx:538`) which populates `chapters`
6. Polls `chapters` table up to 10s awaiting parse completion (`page.tsx:561-577`)
7. Sets `author_profiles.authorslab_onboarding_completed{,_at}` (`page.tsx:597-606`)
8. Redirects to `/projects/${savedManuscriptId}` — project shell Overview (`page.tsx:613`)

Writes: `manuscripts` (via webhook), `chapters` (via webhook), `author_profiles`. Also writes profile image to `author-profiles` storage bucket if provided.

### 2b · `/wright/page.tsx` (694 lines, 2026-09-05) — Path A: intake

Purpose: Eliot's five-question intake → match to Ivy or Reid → hand off to Wright Studio.

Flow (largely unchanged from March; persona display renamed Eden → Riley → Eliot):
1. Auth: `has_ghostwriter_access` OR `is_beta_tester` (`page.tsx:186-190`) — note the different gate than `/onboarding`
2. Q1–Q5 sequence with hardcoded copy and bridge responses (`page.tsx:222-325`); refs, not state, to avoid stale closures
3. `runEliotMatch()` (`page.tsx:330-432`): POSTs full payload to `eliotMatch` webhook; graceful local fallback if the webhook fails
4. Reveal: Eliot's reflection → assigned-agent introduction → ghost's opening line displayed in same transcript
5. Persistence (`saveAndCreateSession`, `page.tsx:436-465`): writes `author_profiles.ghostwriter_agent/completed_at/book_title` and inserts one `ghostwriter_sessions` row (`ghost_writer`, `phase: 1`, `phase_name: 'excavation'`, `book_brief` jsonb, `status: 'active'`)
6. Hard redirect to `/wright/studio` after 2500ms (`page.tsx:431`)

Writes: `author_profiles`, `ghostwriter_sessions`, `ghostwriter-uploads` storage bucket (Q3 upload if present).

### 2c · `/wright/studio/page.tsx` (1,398 lines, 2026-09-05) — Path B: workshop

Purpose: post-match workshop where Ivy or Reid drafts sections with the author.

Significantly expanded since July (was 657 lines) — task #109 Path B build-out added: sortable section list (DnD-kit), inline editor pane with autosave, `draftInsert` protocol (ghost replies can carry draft text that gets written into the selected section's `draft_content`), "Insert here" affordance when a draft arrives before a section is selected, per-message metadata tracking (`insertedInto`, `pendingInsert`).

Chat routing: `session.ghost_writer === 'ivy' ? ivyChat : reidChat` — one webhook per persona.

Session load pattern (`page.tsx:423`): `.from('ghostwriter_sessions').eq('author_id', profile.id).eq('status', 'active').order('created_at', desc).limit(1)` — hides the multi-session pile-up (I flagged 8 stragglers in July; not re-checked today).

Writes: `ghostwriter_sessions`, `ghostwriter_sections`, `ghostwriter_chat`. Grep confirmed **14 hits against those three tables and zero writes to `chapters` or `manuscripts`**.

### 2d · `/projects/[id]/wright/page.tsx` (13 lines) — placeholder

Still the `PlaceholderTab` component redirecting to `/wright`. Task #117 has not yet touched this — the shell integration is entirely pending.

## 3 · What exists today — §7.2 Author Studio

### 3a · The bridge — `/projects/[id]/author-studio/page.tsx` (331 lines) + `/api/projects/[id]/author-studio/state/route.ts`

Clean pattern, worth studying because Wright will need its equivalent when task #117 lands.

Bridge: server-side auth via RLS (`author_profiles.auth_user_id`, `state/route.ts:42-55`), typed `AuthorStudioState` response shape mirrored on both sides (`page.tsx:32-41`, `state/route.ts:5-29`). Reads `manuscripts`, `editing_phases`, `chapters` (with `phase_N_approved_at` for the tri-state D/L/C), `manuscript_issues` counts.

UI: editor pills (Alex/Sam/Jordan with active/complete/pending states), three progress cards, chapter table with per-chapter D/L/C dots and `Open →` links back out to `/author-studio?manuscriptId=X&chapterId=Y`. Explicitly a *summary + navigation* surface, not the editor. The footnote at `page.tsx:234-236` acknowledges: "The full editing experience opens in your existing Author Studio. We're integrating it into the project shell in a future pass; for now this is the bridge."

### 3b · The legacy — `/author-studio/page.tsx` (3,863 lines, 2026-09-05)

Comprehensive editor. Key mechanisms:

- **Autosave / save-before-switch** (`page.tsx:1820-1837`): if `hasUnsavedChanges` and `pendingContentRef.current`, write `chapters.content` before loading the next chapter. Fresh-fetch on switch (`page.tsx:1845-1849`).
- **Chapter insertion** (`page.tsx:1871+`): `insertChapterAt(position)` prompts for title, calculates new `chapter_number`, shifts subsequent chapters. Reserved slots: prologue = 0, epilogue = 999.
- **Chat routing per phase** (`page.tsx:2105-2107`): `activePhase.phase_number` switch → `WEBHOOKS.samChat | jordanChat | alexChat`. Messages persist to `editor_chat_messages` (writes at `page.tsx:812, 1932, 2081`).
- **Journey wiring** (`page.tsx:33`): imports `startJourney`, `pollJourney`, `terminalUserMessage` from `@/lib/as_journeys` — DP-AS-02 landed and Wright inherits this library for free.
- **Notification bell** in header (`page.tsx:13`): DP-AS-04 UCO minimum shipped.
- **`chapters.content` is the ground truth for prose.** Every prose edit writes here.
- **Editor personas enum** (`src/types/database.ts:64`): `editor_chat_messages.editor_name` currently supports `'Alex' | 'Sam' | 'Jordan' | 'Publishing Agent' | 'Marketing Agent'`. **Ivy and Reid are not in the enum.**

Tables written by the legacy: `chapters`, `manuscripts`, `manuscript_issues`, `editor_chat_messages`, `editing_phases`. Reads from all of these plus `author_profiles`. n8n calls: 11 editor-scoped webhooks (`page.tsx:294-304`) plus `generateManuscriptVersion` (`page.tsx:3383`).

## 4 · The load-bearing finding

**Wright Studio (Path B) writes to a parallel schema and cannot satisfy the workspace design commission's §4 invariant without substantive rework.**

Evidence:
- Grep of `/wright/studio/page.tsx` for `from\('chapters'\) | from\('manuscripts'\) | from\('ghostwriter_`: 14 hits, all against `ghostwriter_sessions | ghostwriter_sections | ghostwriter_chat`. Zero writes to `chapters` or `manuscripts`.
- The invariant §4 requires: *"Wright and Author Studio share a data model. Ivy and Reid write directly to `chapters`. No parallel drafts table, no export format, no adapter layer. Every chapter Wright creates is a real chapter."*
- The `draftInsert` mechanism (`page.tsx:898-935`) — Path B's central affordance for the direct-with-veto model — currently targets `ghostwriter_sections.draft_content`.

This is not a minor rewire. The section-list, autosave, DnD sorting, draftInsert protocol, insert-here UI, per-message metadata — the affordances are all correct in spirit and should be reused, but every DB touch-point needs to be redirected. `ghostwriter_sections` retires or is repurposed for session-scoped state that isn't chapter-shaped.

The `sectionUpdate` protocol I described in the July verification-delta is now actively populating rows (that was the "0 sections" bug in July). So the surfacing itself works — it just points at the wrong table.

## 5 · A second finding — the returning-author flow assumes the old model

`/onboarding/page.tsx:211-230` contains Eliot's returning-Wright-author greeting card: *"Oh, ${firstName}, look at you — you came in here not knowing where to start, and now you've got a book. […] Let me introduce you to Alex."* — followed by the same PDF upload form as any other Edit-path user.

Under the new invariant there is nothing to upload. A Wright graduate's chapters already exist in `chapters`; the transition to Alex is a `manuscripts.status` state flip, not a re-upload. This whole code path either disappears or repurposes into a different transition surface (a "graduate to Author Studio" ceremony inside the project shell, per §6.5 of the commission).

## 6 · What we can reuse

Per pattern:

- **The bridge pattern (§3a)** — Wright's future `/projects/[id]/wright/page.tsx` can mirror the Author Studio bridge almost verbatim: server-side load, compact `WrightState` interface, panel render with `Open →` into the workshop. Different summary content, identical discipline.
- **Save-before-switch autosave** (`author-studio/page.tsx:1820-1869`) — port to Wright's editor pane once it targets `chapters.content`.
- **`insertChapterAt(position)`** (`author-studio/page.tsx:1871+`) — port for Ivy/Reid to add chapters as they emerge from conversation, and for the "add me a new opening chapter" returning-author case.
- **Chat routing switch on session state** (`author-studio/page.tsx:2105-2107`) — Wright's equivalent is a switch on `session.ghost_writer` → `ivyChat | reidChat`, already how Path B works. Keep.
- **Journey wiring** (`author-studio/page.tsx:33`) — `startJourney/pollJourney/terminalUserMessage` from `@/lib/as_journeys`. Wright's Ivy/Reid chat and any draft-generation call should adopt this. New `journey_type` values need SysAdmin migration per the register discipline established in July.
- **NotificationBell** — mount in Wright's header once the shell integration lands.
- **Path B affordances** — section list, DnD sort, editor pane, `draftInsert` protocol, "Insert here" UI, per-message metadata. Correct affordances, wrong table. Reuse the components, redirect the writes.
- **Eliot's five-question intake** — reuse verbatim per this brief's intent (§6.1 asks us to design the intake conversation; the current implementation is a defensible starting point). Voice may need refinement to elicit the calibration question ("How would you like to work — you write and I react, or I draft from our conversation, or somewhere in between?").

## 7 · What we need to build

The reshape:

- **Rewire every `ghostwriter_sections.draft_content` write to `chapters.content`** (largest single change, touches `wright/studio/page.tsx:565-585, 612-614, 675-706, 815+`)
- **Rewire the `draftInsert` protocol** to target `chapters.content` at the current chapter selection
- **Retire `ghostwriter_sections` as the drafts table**; repurpose (or drop) — decision needed on whether any session-scoped, non-chapter-shaped state stays
- **Session keying migrates from `author_id + status='active'` to `manuscript_id`** — depends on Task #113 (pre-manuscript status enum value) so a `manuscripts` row exists before Wright starts
- **Retire the returning-Wright-author upload flow at `/onboarding/page.tsx:211-230`** and design its replacement — the "graduate to Author Studio" ceremony (§6.5)
- **Wright's own project-shell integration** — replace the `PlaceholderTab` at `/projects/[id]/wright/page.tsx` with the workshop (task #117)
- **Wright's post-manuscript context-awareness** — port Alex chat's manuscript-loading pattern into Wright's system prompt so Ivy/Reid know the current book when invoked on an existing manuscript (task #120)

## 8 · One cross-surface question for peer input

**`editor_chat_messages.editor_name` enum decision — one chat log per project or two?**

The enum currently supports `'Alex' | 'Sam' | 'Jordan' | 'Publishing Agent' | 'Marketing Agent'` (`src/types/database.ts:64`). If Wright's chat migrates to share this table (one AI-author dialogue log per project across the whole journey), the enum needs extending to include `'Ivy'` and `'Reid'` — a SysAdmin migration requiring Paul's explicit acceptance per House Rules ("Enum changes to `manuscripts.status` and similar constrained columns require Paul's explicit acceptance in the migration courier").

Two options:

- **(a) Share the table.** Single source of truth for AI-author dialogue across the whole project lifecycle. Feeds naturally into the activity-log idea from the 2026-07-30 memo — Riley/Eliot's post-manuscript context awareness gets a coherent history to draw on. Cost: schema migration + retiring `ghostwriter_chat`.
- **(b) Keep them separate.** `ghostwriter_chat` for Wright, `editor_chat_messages` for Author Studio. Simpler, no schema touch. Cost: no cross-stage memory without an aggregation step; risks the pattern I flagged in July — columns added later that no one writes to.

Recommend (a) on grounds of coherence and the activity-log alignment, but this touches astudio's schema and the shell's overall data-model shape — SysAdmin and astudio's call jointly. Not a decision for Wright to make alone. Flagging in this courier so it can be routed to whichever peer conversation resolves it.

## 9 · Dependencies and blockers

Unchanged from the commission §8:
- **Task #113** — `manuscripts.status` enum extension (SysAdmin lane). Blocks Wright's pre-manuscript entry, and by extension the `manuscript_id` scoping migration for `ghostwriter_sessions`.
- **Task #117** — Wright inside project shell. Blocked on the design proposal that follows this audit's ratification.
- **Task #120** — Wright context-awareness. Pattern port from Alex chat; blocked on #117 landing first.
- **UX landing routing** — coordinate at the point of "click a new project → land in Wright" (`sysadmin-to-ux-landing-routing-and-language-2026-09-21.md` is the sibling brief).

## 10 · Next moves

1. This audit is filed. Awaiting SysAdmin + astudio + ux review of findings, particularly the cross-surface question in §8.
2. On sign-off, Wright produces the design proposal covering §6.1 (intake flow), §6.2 (upload embedding vs redirect), §6.4 (content shaping mode), §6.5 (migration event). §6.3 (chapter authorship model) is ratified — designing affordances only, not re-opening the model.
3. Wright will not stage code against these findings until the design proposal is ratified. No `-A`/`.` stages, no ceremony violations. When code work starts, Push Ceremony V1 discipline binds.

## 11 · House-keeping

- Wright inbox at time of filing: contains the workspace design commission pointer (retained per its §11 step 5 instruction — deletable now that this audit is filed).
- Push Ceremony V1 acceptance stands: read and adopted; no code staged this turn (documents-only courier).
- Standing memory-save limitation on this Cowork surface still applies — Convention V1.1 memory line cannot be written from here.

— `wright`
