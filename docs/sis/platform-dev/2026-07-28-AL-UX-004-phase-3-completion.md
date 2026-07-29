# AL-UX-004 Phase 3 · Project Overview tab — completion

**AL-PDC-UX004-C3 · 2026-07-28**
**From:** Platform Developer station
**Status:** COMPLETE on the `redesign` branch. Awaiting Paul's Vercel-preview review before Phase 4.

## 1 · What shipped

### New API endpoint

**`src/app/api/projects/[id]/overview/route.ts`** — one-shot GET returning everything the Overview tab needs in a single call: manuscript basics, all five phases (padded from `editing_phases` with defaults so the stepper is always five long), current-phase chapter progress (approved / total), the document shelf (original upload, phase reports, approved-snapshot drafts, cover), and the cover URL. Ownership check on `author_id`; 401/404 shaped like the rest of the API. Types exported so client components can share the payload shape.

### New Overview components in `src/app/projects/[id]/_components/overview/`

- **`overviewDerivations.ts`** — templated greeting copy per phase/status (`greetingKicker`, `greetingMessage`, `greetingPersona`), primary/secondary CTA resolvers, and `stepperSteps` — the five-step layout copy with progress meter fill, gate hints, and mini-CTA targets. All hardcoded strings per brief §4 ("phase 1: template the message per phase/status") — the AI generator swap is a later iteration.
- **`ShelfDocuments.tsx`** — "On your shelf" list. Each row is a coloured spine + label + optional meta + hover "Open →". Kind → spine palette map (assessment sage, line-notes terracotta, copy-notes sage-deep, draft charcoal, cover clay) so the list reads as a small shelf of objects rather than a download list. Empty state: warm faint hint.
- **`BookObjectPanel.tsx`** — left column. Reuses `BookCover size="large"` (225×330 typeset cover, or real `cover_url` when Taylor's flow lands). Meta table below (words / chapters / genre / uploaded). Divider. Shelf.
- **`EditorGreetingCard.tsx`** — right column, top. Persona avatar + kicker ("Author Studio · Line edit") + serif headline + 1-2 sentence body + primary CTA (sage-deep filled button → phase-appropriate tab) + secondary "Read {editor}'s notes" text link (rendered only when a phase report PDF exists). Paper-warm background, line-soft border.
- **`JourneyStepper.tsx`** — right column, bottom. Five vertical steps with a hairline connector. State grammar per brief §1: complete = sage-deep ✓, active = numbered sage dot inside sage-bg halo + progress meter ("Chapter 4 of 12") + sage fill + mini-CTA, pending = hollow numbered ring, skipped = hollow dashed ring + "Not needed" chip (no strikethrough, no italic-only). The step immediately after the active step carries a gate hint ("Unlocks after your sign-off on Alex's developmental pass.").
- **`OverviewClient.tsx`** — client shell. Fetches `/api/projects/[id]/overview` on mount, composes the two-column layout (300px cover / flexible content, stacks on mobile), handles loading and error states in the palette.

### Reworked existing files

- **`src/app/projects/[id]/page.tsx`** — was: server component that computed a `defaultTab` from phase/status and `redirect`'d. Now: renders `<OverviewClient />` directly. Deliberate design change per brief §4 — authors land on their book, then step into the studio via the greeting card's primary CTA. The old redirect logic is subsumed by `primaryCta()` in overviewDerivations.
- **`src/app/projects/[id]/_components/ProjectTabStrip.tsx`** — added "Overview" as the first tab, before the vertical divider that separates it from the journey tabs. Minimal touch — the full Manuscript Room restyle of the strip (state-grammar dots, no strikethrough on skipped Ghostwriter, warm palette) is Phase 4. For Phase 3 we just need the tab entry so users can return here from any journey tab.

## 2 · Verification

- ✅ TypeScript compiles clean (`tsc --noEmit --skipLibCheck` returns no errors)
- ✅ ESLint passes on all seven Overview files, the API route, the rewritten page, and the tab strip with zero warnings
- ✅ Preserved: ownership check on `author_id`, existing derivation grammar (complete / active / pending / skipped), persona colour map, existing lobby BookCover and PersonaAvatar components (imported, not duplicated)

## 3 · What to check on the Vercel preview

Open any of your in-progress books from the Library (`/lobby`) and confirm:

1. **You land on Overview** (not the old author-studio auto-redirect). URL should be `/projects/{id}` and stay there.
2. **Tab strip** shows "Overview" as the first tab, with a divider before Ghostwriter, then the rest.
3. **Left column** — large typeset cover (procedural — Taylor's covers slot in when they exist), meta table under it (Words · Chapters · Genre · Uploaded), then "On your shelf" with any PDFs that exist for this project (Alex assessment, Sam line notes, drafts, cover).
4. **Right column top** — Editor Greeting Card:
   - Persona avatar for the phase's editor (sage circle for Alex, terracotta for Sam, sage-deep for Jordan, clay for Taylor, faint for Riley)
   - Kicker ("Author Studio · Developmental edit" or similar)
   - Serif headline + one-two sentence body
   - Sage-deep filled "Continue with {editor} →" button
   - "Read {editor}'s notes" text link (only if a report PDF exists for the current phase)
5. **Right column bottom** — Journey Stepper:
   - Five vertical steps: Developmental edit · Line edit · Copy edit · Publishing · Marketing
   - Active step has a numbered sage dot in a halo, a "Chapter X of Y" progress meter with sage fill, and an "Open with {editor} →" mini-CTA
   - Steps before the active one show a sage-deep ✓ + "Complete" label
   - The step right after the active one shows italic gate hint ("Unlocks after your sign-off on…")
   - Steps further out show hollow numbered rings with muted labels
   - If Ghostwriter was skipped (upload-path projects): dashed hollow ring + "Not needed" chip, no strikethrough

## 4 · Known deliberate omissions

- **Full tab strip restyle** — Phase 4 territory. For Phase 3 the strip still uses the old blue/emerald palette; only the Overview tab entry is added.
- **AI-generated editor greeting messages** — brief §4 explicitly defers this ("phase 1: template the message per phase/status; a future iteration can generate it via the existing AI infra — not required for the demo").
- **Activity feed / resolved-points count** — brief §6 marks this as "nice-to-have — cut freely if time is tight." Deferred.
- **Version download route** — shelf entries for approved-snapshot drafts point to `/api/projects/[id]/versions/[versionId]` which doesn't exist yet. Not a demo blocker (most demo projects won't have snapshots to download); we'll add it when it becomes visible.

## 5 · What's next

Awaiting your greenlight after Vercel review, then Phase 4 (project tab strip restyle — state grammar applied to the strip, Overview tab styled to match, skipped Ghostwriter loses the strikethrough, Script keeps the small-caps "Soon" pill).

— Platform Developer station
