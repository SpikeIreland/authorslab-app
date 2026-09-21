# SysAdmin → UX — Landing routing + language audit (demo-blocking + post-demo)

**From:** `sysadmin` (via Paul) · **To:** `ux` · **Date:** 2026-09-21 · **Status:** in scope for Blair demo where marked (Wednesday 2026-09-24); the rest is post-demo. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1`, `PUSH-CEREMONY-V1` first.

## Context

Today's walk through the demo surface exposed a cluster of decisions that are UX-shaped, not shell-shaped: how the user *experiences* moving through the platform. Paul flagged them explicitly as "something not quite right with how the user experiences the platform" and asked they route to you. The shell can implement any routing/copy rules you rule on — but the rules themselves are your call.

## What's in scope

### A. Landing routing from the Lobby (POST-DEMO)

Currently: clicking a book card in `/lobby` always routes to `/projects/[id]` (Overview tab).

Should it? Alternatives worth judging:

- **State-aware:** pre-manuscript project → `/projects/[id]/wright`; in-edit → `/projects/[id]/author-studio`; complete → `/projects/[id]` (celebration + next-step view).
- **Overview always:** current behaviour. Overview tab is the "book at rest" view; the author decides where to enter.
- **Last-visited:** land where the user last was on that project.

Constraints from `sysadmin`: the derivation cost is fine (`manuscripts.status` + `current_phase_number` are already loaded for the Lobby). The bigger question is *what feels right for a working author*. Rule this and I'll wire it.

Dependency: task #113 (Idea mode) unlocks the pre-manuscript state legitimately; until then, `wright` as a landing target is architecturally impossible. Coordinate with `wright` and `sysadmin` on the ordering.

### B. Language audit across state-driven copy (POST-DEMO, but critical)

The current copy hard-codes assumptions about state that aren't always true:

- `/src/app/projects/[id]/_components/overview/overviewDerivations.ts` — line 72: *"Alex has read your manuscript"* fires for any project with `current_phase_number = 1`, regardless of whether an analysis exists or the manuscript has any chapters. Today's TBA book renders that line even though it has zero chapters and no analysis.
- `/src/app/lobby/_components/derivations.ts` — same pattern for card-level copy.
- `ProjectTabStrip` — Wright's `"Not needed"` chip on the tab (fires when a manuscript was uploaded). Reads as *"you missed something"* rather than *"this path was skipped by choice"*. Wording is up to you; the visual affordance is already restrained (dashed ring, no strike-through).

**Deeper ruling requested:** Is "Alex has read your manuscript" the right voice at all? It's phase-referring rather than task-referring. Would something like *"Ready when you are — Alex is set up on this manuscript"* land better? You own the voice; I'll implement.

### C. Wright's own page — workshop layout (POST-DEMO)

`wright` chat has been briefed on this (see `handovers/sysadmin-to-wright-positioning-and-shell-direction-2026-09-21.md`) but the *design* of the workshop belongs to you.

The direction Paul ratified today: Wright's page should open like a working studio, mirroring the Author Studio's split — workspace canvas on the left, transcript panel on the right. Eliot greets and runs the intake; Ivy or Reid pick up in the SAME transcript once the Project Partner is chosen — no reload, no new panel, just a persona change in the running thread. Careful wording throughout: "Project Partner", never "ghostwriter".

Please spec this UX. `wright` will implement.

### D. Overview page — is it earning its keep? (POST-DEMO)

The Project Overview tab (default landing today) is mostly summary. Once we have state-aware landing routing (item A), the case for a dedicated Overview page weakens — it may collapse into the top of the active station's page. Your call.

### E. Publisher landing page footer link — DEMO-ADJACENT

Task #118: Paul wants a link on the public landing page (`authorslab.ai/`) footer, pointing to the Publisher's Journey. Your remit: where in the footer, what the link says, whether the cold-click destination needs a splash / sign-in / marketing preview vs. dropping straight into the portal. Coordinate with the `publisher` chat (newly stood up today) on the destination side; you own the footer treatment.

## What is DEMO-BLOCKING vs POST-DEMO

**Demo-blocking (Wednesday):**
- **E only** — the publisher footer link, if we want the "publisher access point" narrative to work when Carl gestures at the public landing page. Small treatment call; coordinate with `publisher`.

**Post-demo (real product work):**
- **A** (landing routing), **B** (language audit), **C** (Wright workshop layout), **D** (Overview reassessment). Sequence them however you judge; land your rulings as couriers back to `sysadmin` and I'll implement.

## Coordination protocol

Per Courier Convention V1:
- Inbox at `handovers/inbox/ux/`. Check at turn start.
- Rulings back to `sysadmin` via canonical courier in `handovers/` + pointer.
- Language rulings that touch a specific station's copy → cc the owning chat (e.g., `astudio` for Alex copy; `wright` for Wright copy) with a pointer.
- Anything needing Paul's decision → pointer to `handovers/inbox/paul/`.

## First-turn instructions

1. Read the three founding docs and this brief.
2. Save memory: your slug (`ux`), your inbox path, your charter (broadly: information architecture, language voice, workshop layouts, cross-station experience).
3. Take the demo-blocking item (E) and file a proposal to `handovers/inbox/paul/` with your call on where in the footer / what it says / cold-click destination. Coordinate with `publisher` if needed (their inbox is at `handovers/inbox/publisher/`).
4. Sequence the post-demo items (A-D) at your own pace; a first-take triage courier back to `sysadmin` is welcome.
5. Delete this pointer when done.

— `sysadmin`
