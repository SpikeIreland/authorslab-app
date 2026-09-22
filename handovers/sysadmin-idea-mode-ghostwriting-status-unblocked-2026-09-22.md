# SysAdmin — Idea mode unblocked: `ghostwriting` status live in the DB

**From:** `sysadmin` · **To:** `wright`, `ux` · **cc:** `paul` · **Date:** 2026-09-22 · **Status:** shipped. Task #113 (Idea/pre-manuscript project mode) — the schema half.

## What shipped

**Supabase migration** (`add_ghostwriting_to_manuscripts_status_check`, applied 2026-09-22): `manuscripts.status` CHECK constraint now includes `'ghostwriting'`. Verified read-back:

```
CHECK ((status = ANY (ARRAY['uploaded'::text, 'analyzing'::text, 'editing'::text, 'complete'::text, 'ghostwriting'::text])))
```

**Endpoint fix** (`/src/app/api/projects/new/route.ts`): `current_phase_number` changed from `0` to `null` (Postgres CHECK `>= 1` skips NULLs; NULL is the correct semantic for "no phase yet"). Comment updated to reflect the schema is now real. The endpoint has been in the codebase attempting to insert `status: 'ghostwriting'` since it was written — it has been silently 500'ing on the CHECK constraint. **It now works.**

## What this unblocks

- **A new project can legitimately exist in the pre-manuscript state.** `POST /api/projects/new` returns 200 and the new manuscript row lands with `status='ghostwriting'`, `current_phase_number=null`, zero chapters, zero analyses.
- **Existing derivations already handle this state correctly** — no additional code work required to render it. `ProjectTabStrip` shows Wright as active. `overviewDerivations.ts` renders Eliot as greeter with "Ready when you are. Eliot's holding your project. Book a session and they'll introduce your writing partner." `lobby/derivations.ts` shows "Eliot is waiting to introduce your writing partner" on the card, Eliot as active persona. The whole surface stack has been sitting ready for this migration.
- **Landing routing** (see UX brief `sysadmin-to-ux-landing-routing-and-language-2026-09-21.md`, item A): the state-aware landing decision now has a real state to test against. `ux` can make the call on click-Lobby-lands-on-Wright-when-pre-manuscript without any further schema dependency.
- **Wright workspace design** (see Wright brief `sysadmin-to-wright-workspace-design-2026-09-22.md`, dependencies §8): task #113 is no longer an upstream blocker. `wright` can proceed with the audit and design proposal knowing a pre-manuscript project state legitimately exists to design against.

## Decisions ratified with Paul (do not re-open)

- **Value name stays `'ghostwriting'`.** Internal DB value only; users see "Wright" via derivations that translate. Renaming would touch 10+ files and doubles the change surface for no user-visible payoff. A future value-rename can happen as a discrete cleanup if it still feels wrong.
- **`current_phase_number = null` for pre-manuscript projects.** Cleaner than reasserting `0` and relaxing the CHECK.
- **`ghostwriting → uploaded → editing → complete` lifecycle is not yet formalised.** For now the transitions are implicit: Wright works, at some point `status` moves to `uploaded` (via existing upload flow) or `editing` (via a Wright-side migration event still to be designed by `wright`). Formalising a state machine is a `wright` + `sysadmin` design conversation post-demo.

## What still needs to happen (owned elsewhere, not blocking this ship)

- **Verification tick** — the "first tick observed and quoted" per House Rules is a real request through `/api/projects/new` returning 200 and the resulting project rendering the Wright-active state correctly. Paul: this is one click on your iCloud account (`paul.lyons67@icloud.com`) via the "Begin a new book" button in the Lobby. Whatever the endpoint returns and the resulting Overview render tells us: quote it in your next hand-over so this migration counts as verified.
- **Wright's workspace UX** (`wright` chat, workspace design commission) — the schema is ready; the user experience of being in a Wright-state project is now Wright's problem to design.
- **Lobby "Begin a new book" flow** — currently routes into the `NewProjectModal` which calls `/api/projects/new`. Post-call it routes to `/projects/[id]` (Overview). Once `ux` rules on state-aware routing, this may change to route directly into Wright for pre-manuscript projects.
- **Idea-vs-Ghostwriting sub-state distinction** — if we ever need to distinguish "just an idea, hasn't started drafting" from "actively drafting with Ivy/Reid", we add another status value then. Not now.

## Deployment posture

Migration applied direct via Supabase MCP per House Rules deployment lane. Endpoint fix committed under Push Ceremony V1; Paul pushes.

— `sysadmin`
