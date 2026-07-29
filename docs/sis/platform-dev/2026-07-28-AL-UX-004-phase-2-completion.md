# AL-UX-004 Phase 2 · The Library — completion

**AL-PDC-UX004-C2 · 2026-07-28**
**From:** Platform Developer station
**Status:** COMPLETE on the `redesign` branch. Awaiting Paul's Vercel-preview review before Phase 3.

## 1 · What shipped

### New components in `src/app/lobby/_components/`

- **`derivations.ts`** — shared lib. Moved `LobbyProject`, `StageKey`, `StageState`, `deriveStageStates`, `editorForPhase`, `nextActionFor`, `openHrefFor`, `relativeTime` out of `page.tsx` verbatim (behaviour preserved per brief §3). Added new helpers: `activePersonaFor` (returns Eden/Alex/Sam/Jordan/Taylor/Riley for the current stage), `greetingFor` (time-of-day-aware greeting), `personaColourFor` (persona → palette token map), `coverPaletteFor` (stable hash → cover palette, so the same book always gets the same cover).
- **`BookCover.tsx`** — procedural typeset cover. Two sizes: `small` (92×134, Library) and `large` (225×330, ready for Phase 3). Renders `cover_url` if present; else typeset title (serif) + optional author kicker on the palette-rotated background.
- **`PersonaAvatar.tsx`** — coloured circle with persona initial. Uses the established colour map (Alex+Eden sage, Sam+Ivy terracotta, Jordan+Reid sage-deep, Taylor clay, Riley faint).
- **`MiniJourneySpine.tsx`** — compact 5-dot row (Ghostwriter → Marketing) with the state grammar: complete = sage-deep ✓ in sage-bg chip; active = filled sage dot inside sage-bg halo; pending = hollow ring; **skipped = hollow dashed ring** (no strikethrough, no italic, per brief §1). Below the row, the live stage's detail line (e.g. "Line edit · Sam") — omitted when no stage is live.
- **`BookCard.tsx`** — the whole card. Composition per brief §3.2: small typeset cover + title + genre/wordcount/updated + MiniJourneySpine + Next line (PersonaAvatar + sentence + "Open →"). Entire card is a Link to `/projects/[id]` — the "Open →" is a visual cue with a subtle group-hover translate, not a separate target.
- **`BeginNewBookCard.tsx`** — dashed card per brief §3.3. Cover-shaped `+` placeholder on the left (hints at "another book on the shelf"), serif "Begin a new book" heading, subhead names both paths ("Upload a manuscript you've already drafted, or start from scratch with a Ghostwriter."), "Start →" affordance on the right. Opens the existing `NewProjectModal` fork.

### Reworked `src/app/lobby/page.tsx`

- Serif greeting ("Good morning, {name}.") + one-line summary ("Three books in the making · one launched") using `greetingFor` + count formatting (numbers under 10 rendered as words in the serif sentence — "three books" reads better than "3 books" in this typography).
- Book card list uses `BookCard`; the old `ProjectCard`/`StagePill` in-file components are gone.
- `BeginNewBookCard` replaces the previous plain dashed `+ Start a new project` button.
- Launched section keeps the split (kicker label "Launched", then cards with `launched` prop that shows "✓ Launched" in sage-deep instead of the "Updated ..." timestamp).
- Loading, error, and empty states re-themed to the palette (no more `bg-rose-50`/`text-slate-*`).
- Old imports pruned (`Link`, in-file derivation functions all moved).

### Preserved from prior implementation
Every derivation function — `deriveStageStates`, `editorForPhase`, `nextActionFor`, `openHrefFor`, `relativeTime` — is byte-for-byte identical. No behavioural change; only presentation.

## 2 · Verification

- ✅ TypeScript compiles clean (`tsc --noEmit --skipLibCheck` returns no errors)
- ✅ ESLint passes on all Library files with zero warnings
- ✅ `_components/` folder cleanly extended alongside the existing `NewProjectModal.tsx`

## 3 · What to check on the Vercel preview

Visit `/lobby` and check:

1. **Greeting** — should show "Good morning/afternoon/evening, {name}." in the serif, with a one-line summary underneath.
2. **Book cards** — each of your three in-progress manuscripts should render with:
   - A typeset cover on the left (charcoal / sage-deep / terracotta rotation, stable per book)
   - Serif title, genre + word count metadata
   - A 5-dot mini spine showing the journey stages
   - The active stage's detail line under the spine (e.g. "Developmental · Alex" or "Drafting with Eden")
   - Persona avatar + Next sentence + "Open →" affordance at the bottom
   - Whole card is clickable — routes to `/projects/[id]`
3. **Begin a new book** card — dashed placeholder cover, subhead names both paths, "Start →" opens the NewProjectModal fork.
4. **Launched section** (if any launched books) — kicker "Launched", cards show ✓ Launched in sage-deep.
5. **Hover states** — cards should have a subtle "Open →" translate on hover; the Begin card should warm slightly (paper-warm bg, faint border).

## 4 · Known deliberate omissions

- **"Chapter X of Y" live progress detail** on the mini spine — brief §6 flagged this as needing a small read endpoint. Deferred to Phase 3 where the Overview tab's Journey stepper has real screen real estate for it. Current active-detail line uses static per-phase labels (Developmental / Line edit / Copy edit / Design / Marketing).
- **Real covers via Taylor's flow** — procedural typeset covers used per Q4 answer. `cover_url` slots in verbatim when present (BookCover handles both cases).

## 5 · What's next

Awaiting your greenlight after Vercel review, then Phase 3 (Project Overview tab — the new default landing inside a project shell).

If anything on the Library — palette choice, typography weight, cover proportions, spine dot sizing — needs revising, we do it in the tokens or the component and every other surface that inherits picks it up.

— Platform Developer station
