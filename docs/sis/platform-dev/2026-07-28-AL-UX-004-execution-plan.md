# AL-UX-004 · execution plan

**AL-PDC-UX004-P · 2026-07-28**
**From:** Platform Developer station
**Responds to:** `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md`
**Status:** PLAN. Brief is executable; four open questions answered below; awaiting Paul's greenlight on §5 decisions before touching code.

## 1 · Verified current state (spot-checks against brief assumptions)

- ✅ **`layout.tsx` title tag really does say "AuthorLab.ai"** — confirmed at line 6. Also has leftover AI-generated `// ← ADD THIS` comments to clean up while I'm in there.
- ✅ **`alert()` on Home's Make-this-a-project CTA** — confirmed at `src/app/home/page.tsx:410`.
- ✅ **BetaBanner is a real component** at `src/components/BetaBanner.tsx`, currently mounted in `layout.tsx` so it appears on every authenticated page.
- ✅ **NewProjectModal exists** at `src/app/lobby/_components/NewProjectModal.tsx` — Library's Begin-a-new-book card will fork into it as the brief specifies.
- ✅ **Tailwind CSS v4** — uses the new `@import "tailwindcss"` + `@theme` CSS-first config in `globals.css`. No `tailwind.config.js` file exists (Tailwind v4 prefers `@theme` in CSS). All design tokens will land as `@theme { --color-...; --font-...; ... }` blocks.
- ✅ **`/projects/[id]/`** exists as the project shell root.

Nothing in the brief is fictional. Ready to execute.

## 2 · Answers to §9 open questions (Paul overrides if wrong)

**Q1 — BetaBanner on redesigned authenticated surfaces: drop it?**

Recommendation: **drop it from every authenticated surface** (Library, project shell, Overview, Author Studio wrapper). Reason: the new chrome IS the framing — the header wordmark + serif treatment reads "considered product", and a "beta banner" strip on top of that undercuts the very tone the redesign is establishing for the Blair Partnership demo. If you want an "invited beta" signal at all, it belongs on the marketing/public site, not inside the app.

Concretely: remove the `<BetaBanner />` mount from `layout.tsx`. If you want to keep it as an option for public pages (`/pricing`, `/how-it-works`, etc.), I'll leave the component in place but only mount it via a public-route layout, not the root.

**Q2 — Chapter count "Ch. X of Y" — stored today or derived?**

Two paths, both cheap:
- **Derived**: `SELECT COUNT(*) FROM chapters WHERE manuscript_id = $1` — trivial, one extra field on the project payload. This is what I'll use for Phase 1.
- If a per-project payload endpoint doesn't already exist, I'll wire it into whatever loader `/projects/[id]` uses.

No schema change needed.

**Q3 — Assessment/line-note PDFs per-project queryable today?**

Yes — three sources cover everything the "On your shelf" panel needs:
- `manuscripts.report_pdf_url` — Alex's developmental analysis PDF (Phase 1)
- `editing_phases.report_pdf_url` — Sam's line-editing report (Phase 2), Jordan's copy-editing report (Phase 3)
- `manuscript_versions.file_url` — phase-snapshot PDFs written by workflow 1.5 on each phase completion

All three keyed on `manuscript_id`. One SQL join gives the whole shelf. No schema change needed.

**Q4 — Procedural typeset covers OK until Taylor's cover flow lands?**

Yes. Cover generation is a real thing that belongs downstream; procedural covers made of typography + palette are already in the mockup and look intentional (not "placeholder"). I'll use the same charcoal/sage-deep/terracotta rotation you specified, keyed off `manuscript.id % 3` or similar so covers stay consistent per book across renders. `cover_url` on `manuscripts` (if present, or when Taylor's flow adds it) supersedes the procedural cover in a one-line swap.

## 3 · Sequencing (matches brief §7, minor refinement)

I'll execute in the same four phases the brief prescribes, with one small addition (a "Phase 0"):

**Phase 0 — Tokens + chrome infrastructure** (one commit, foundational):
- Add `@theme` block to `globals.css` with the full palette + typography from brief §1
- Build `src/components/chrome/Header.tsx` (charcoal 56px, wordmark, project title slot, notification bell mount, ProfileChip)
- Build `src/components/chrome/LeftRail.tsx` (charcoal 64px, Home + Projects only, active-item chip with sage edge)
- Build `src/components/chrome/ProfileChip.tsx` (avatar initial + first name + chevron dropdown for account/billing/sign-out)
- Build `src/components/chrome/AppShell.tsx` (composes Header + LeftRail + content area, receives project title as optional prop)
- **Trivial demo-visible fixes ride here**: title-tag `AuthorLab.ai → AuthorsLab`, `alert()` removal from home CTA, BetaBanner unmount (per Q1)

**Phase 1 — Mount chrome on existing surfaces** (verifies Phase 0):
- Wire `AppShell` around `/home`, `/lobby`, `/projects/[id]/*`
- Old headers on those surfaces get replaced or removed
- No content changes to the pages themselves — just the wrapper

**Phase 2 — The Library** (re-skin `/lobby`):
- New `BookCard` component (typeset cover + mini journey spine + next-line)
- `BeginNewBookCard` component (dashed, forks into NewProjectModal)
- `LaunchedBooksSection` (styled ✓ state when a book has launched)
- Reuse existing `deriveStageStates` / `nextActionFor` / `editorForPhase` derivations verbatim

**Phase 3 — Project Overview tab** (new default landing):
- Add `Overview` tab as first tab in project shell
- Change `/projects/[id]/page.tsx` to render Overview instead of the current redirect-to-phase-tab logic
- New `BookObject` component (large typeset cover, metadata, shelf list)
- New `EditorGreeting` component (persona avatar, kicker, headline, template message, primary + secondary CTA)
- New `JourneyStepper` component (5 steps in state grammar, per-step copy, live step with progress meter, next step with gate hint)

**Phase 4 — Tab strip restyle** (small):
- Apply state grammar to `TabStrip` component
- Remove strikethrough/italic from skipped Ghostwriter, replace with "Not needed" tooltip pattern
- Keep the journey/tools divider and Script "Soon" chip

**Phases 0-3 are the demo-credibility core** (matches brief §7 verbatim). Phase 4 could theoretically ride along or be a separate small commit — my call would be to bundle it with Phase 3 since both touch the tab strip.

## 4 · Estimated scope

- Phase 0: ~6 new components (~400-600 LoC total) + `@theme` block + 3 trivial fixes
- Phase 1: layout wiring across 3 surfaces (~50 LoC)
- Phase 2: ~3 new components + rework of `/lobby/page.tsx` (~500-700 LoC)
- Phase 3: ~4 new components + rework of `/projects/[id]/page.tsx` (~700-1000 LoC)
- Phase 4: ~1 component edit + tab strip restyle (~100 LoC)

Total: 14 components, ~2000 LoC. All on the `redesign` branch. Each phase is a discrete commit with a Vercel preview refresh — you can review at every step and course-correct.

## 5 · Two things to decide before I start

**D1 — Branch strategy.** Continue on the current `redesign` branch (pushes visible to your Vercel preview), or spin a nested feature branch for this work? Recommend: continue on `redesign`. It's the branch designated for exactly this kind of work.

**D2 — Review cadence.** Do you want me to pause at the end of each phase for your review, or run through Phases 0-4 in one continuous push and hand you a fully-migrated Vercel preview at the end? Recommend: pause after Phase 0 (chrome only, easiest to spot palette or typography objections), then run Phases 1-4 together and hand you the finished redesigned surfaces.

## 6 · What's not in this plan

- **AL-UX-005** (Jewish-imprint brand adaptation for the September demo) — the design brief flagged this as a separate memo. I'll wait until that memo lands before doing anything brand-specific.
- **Author Studio interior** — untouched. This is the standing boundary from AL-UX-HANDOVER-001 §4.
- **Ghostwriter surfaces** — brief §8 says "unify chrome only" for these. Chrome unification happens automatically once the new `AppShell` mounts.
- **Activity feed / generated greetings / real covers** — brief §7 lists these as post-demo. Not in scope.

## 7 · Ready when Paul greenlights

Answers to D1 + D2 and I start with Phase 0. Anything I got wrong on Q1-Q4, correct me and I adjust before writing code.

— Platform Developer station
