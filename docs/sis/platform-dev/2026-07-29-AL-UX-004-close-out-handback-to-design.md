# AL-UX-004 close-out + handback to Design station

**AL-PDC-HANDBACK-001 · 2026-07-29**
**From:** Platform Developer station
**To:** UI/UX Design station (via Paul as courier)

## 1 · Status: AL-UX-004 shipped to production

All four phases landed on `redesign`, merged to `main`, and are live on the production Vercel deploy as of today.

- **Phase 0/1** — design tokens + global chrome (AppShell, Header, LeftRail, ProfileChip). Warm Manuscript Room palette (`ivory` / `paper` / `charcoal` / `sage` / `sage-deep` / `terracotta`) plus serif display stack are now the app-wide identity via `@theme` blocks in `globals.css`. Every authenticated page inherits chrome via `<AppShell>`.
- **Phase 2** — The Library (`/lobby`). Serif greeting + summary line, book cards with typeset covers + mini journey spines + persona-avatared Next line, `Begin a new book` card that forks upload/ghostwriter, launched section styled in the state grammar.
- **Phase 3** — Project Overview tab (`/projects/[id]`). New default landing inside a project; two-column with the book object (large cover + meta + "On your shelf" document list) on the left, editor greeting card + vertical journey stepper on the right. Templated greeting per phase/status; live stage carries "Chapter X of Y" progress meter and mini-CTA.
- **Phase 4** — Project tab strip restyle. Full state grammar applied (sage-deep ✓ complete, sage-dot-in-halo active, hollow-ring pending, hollow-dashed + "Not needed" skipped). Strikethrough and italic-on-Script removed. Overview added as first tab with a small book-spine glyph.

## 2 · Standing invariants (unchanged)

- **Author Studio interior** — untouched, per AL-UX-HANDOVER-001 §4. AL-UX-004 wrapped chrome around it (AppShell + new tab strip); the interior of `/projects/[id]/author-studio` is the same as before.
- **State grammar** — one convention across every surface that shows journey state (Library card mini spine, Overview vertical stepper, project tab strip). Any new surface showing progress should reuse the same visual language.
- **Persona colour map** — Alex + Eden `sage`, Sam + Ivy `terracotta`, Jordan + Reid `sage-deep`, Taylor `#A98A6B` (clay), Riley `faint`. Never colour-alone; always paired with an initial, name, or icon.

## 3 · Deliberate omissions from AL-UX-004 (Platform Dev to pick up when scope demands)

- **"Chapter X of Y" live progress detail on Library mini spines** — deferred to Overview stepper where there's more room. Small read endpoint needed if we ever want it back on the Library cards.
- **Real book covers via Taylor's flow** — Library and Overview both render procedural typeset covers today (stable-hash palette rotation on `manuscript.id`). `cover_url` slots in automatically when present.
- **AI-generated editor greeting** on the Overview card — currently templated per phase/status. Swap to Craft Call generation is a small follow-up when we want it.
- **Activity feed / resolved-points count** on Overview — noted in AL-UX-004 §6 as "nice-to-have — cut freely."

## 4 · Untouched by AL-UX-004 — Design station's next backlog

- **Public-facing routes** — `/` (landing), `/pricing`, `/faq`, `/how-it-works`, `/editors`, `/free-analysis`, and the auth cluster (`/login`, `/signup`, `/forgot-password`, `/update-password`). Still on the pre-redesign palette. Visually orphaned from the Manuscript Room work. Suggested brief number: **AL-UX-006** (naming Design station's call).
- **Jewish-imprint brand adaptation** for the September Klein demo. Separate track — a themed variant on top of the Manuscript Room base, not a replacement. Was flagged in AL-UX-004 §8 as **AL-UX-005**.
- **Ghostwriter station personas** (Eden intake, Ivy/Reid chats) — chrome now inherits from AppShell, but the persona surfaces themselves haven't been designed in the Manuscript Room language.

## 5 · Two open questions for Design station

1. **AL-UX-005 sequencing** — Klein demo is September. Should AL-UX-005 (Jewish imprint) be produced first (demo-critical), or run in parallel with AL-UX-006 (public pages)? Platform Dev has bandwidth for either, no dependency between them.
2. **Public-page scope** — does the AL-UX-006 brief cover the marketing site as-is (same content, restyled), or is this an opportunity to also revisit copy / IA / lead-gen flow? If content is in scope, the brief will need input from whoever owns marketing copy.

## 6 · What Design station can rely on

Everything in AL-UX-004's `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md` is now production reality. Design tokens, state grammar, chrome anatomy, persona colours — all shipped as-specified. The four phase-completion docs (`docs/sis/platform-dev/2026-07-28-AL-UX-004-phase-{1,2,3,4}-completion.md`) capture exactly what landed and any deltas from the brief.

For AL-UX-005 and AL-UX-006, briefs of the same shape as AL-UX-004 (decision, tokens, per-surface layout, data needs, phasing, out-of-scope, open questions) work best for Platform Dev — that structure translated 1:1 into an execution plan.

— Platform Developer station
