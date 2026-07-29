# AL-UX-004 Phase 4 · Project tab strip restyle — completion

**AL-PDC-UX004-C4 · 2026-07-28**
**From:** Platform Developer station
**Status:** COMPLETE on the `redesign` branch. This closes AL-UX-004 (Phases 1–4).

## 1 · What shipped

Single-file restyle of `src/app/projects/[id]/_components/ProjectTabStrip.tsx` into the Manuscript Room palette.

### Background & chrome
- Strip background: `paper-warm` (was `slate-50`).
- Bottom border: `line` (was `slate-200`).
- Vertical dividers between tab groups: `line` at 1px × 20px (was `slate-300`).

### Overview tab (first)
- Small book-spine glyph (4×12 charcoal bar) before the label to signal "this is the book itself", not another journey step.
- Colour: `muted` at rest → `ink` on hover / when current.
- Weight bumps to 600 when current.
- Divider after Overview before the journey block.

### Journey tabs — state grammar per brief §1
- **Current**: no leading marker, label in `ink` semibold, 2px `ink` underline pinned to the strip bottom.
- **Complete**: sage-deep ✓ inside a small sage-bg circle, label in `sage-deep` medium.
- **Active**: filled sage dot inside sage-bg halo, label in `ink` semibold.
- **Pending**: hollow ring in `line`, label in `muted`.
- **Skipped** (Ghostwriter on upload-path projects): hollow dashed ring + a dashed "Not needed" chip in `faint`. **No strikethrough, no italic** — the brief was explicit on this being what read as "broken" in the old strip.

### Tool tabs (Research, Script)
- Preserved: the divider before the tool group.
- Research: `muted` → `ink` on hover / when current.
- Script: `faint` at rest with a `Soon` pill (small-caps chip in `amber-bg`, letter-spacing 0.1em, weight 500). **No italics** — the brief called this out too.

## 2 · What was removed

- `text-slate-*`, `text-emerald-*`, `text-blue-*` classes across the strip
- `italic line-through` on the skipped-Ghostwriter path
- `italic` on Script

## 3 · Verification

- ✅ TypeScript compiles clean (`tsc --noEmit --skipLibCheck` returns no errors)
- ✅ ESLint clean on the touched file
- ✅ Behaviour unchanged: `deriveTabState` derivation logic identical (same states, same fallback rules); tab targets identical.

## 4 · What to check on the Vercel preview

Open any project (`/projects/{id}`) and check:

1. **Overview** is first, with the small book-spine glyph, underlined when current.
2. **Journey block** (after divider):
   - Active tab (Author Studio for a mid-edit book, Ghostwriter for a write-path, Publishing/Marketing for later phases): filled sage dot in a halo, ink label.
   - Any complete tab: sage-deep ✓ chip, sage-deep label.
   - Pending tabs: hollow ring, muted label.
   - Ghostwriter on upload-path projects: dashed ring + `NOT NEEDED` chip in faint. **No strikethrough. No italic.**
3. **Tool block** (after second divider): Research clean, Script showing `SOON` in an amber-bg chip. **No italic on Script.**
4. **Current tab underline** is a 2px charcoal bar pinned to the strip bottom, spanning the tab label.
5. **Strip background** is warm off-white (paper-warm), not the cool slate-50 from before.
6. **Navigation** unchanged — clicking any tab routes as it did before.

## 5 · AL-UX-004 closeout

All four phases shipped:

- Phase 0/1 — design tokens + global chrome (header, left rail, ProfileChip, AppShell wrap, title + alert() + BetaBanner cleanup)
- Phase 2 — The Library re-skin of `/lobby` (book cards, mini journey spines, Begin card)
- Phase 3 — Project Overview tab (new default landing: cover + shelf + editor greeting + vertical stepper)
- Phase 4 — Project tab strip restyle (state grammar, warm palette, no strikethrough/italic)

The Manuscript Room direction is now the app-wide identity for authenticated surfaces. Author Studio's interior (unchanged per boundary) inherits the warm chrome around it via AppShell + the new tab strip.

**Next natural moves** (post-AL-UX-004):
- AL-UX-005 — Jewish-imprint brand adaptation for the September Klein demo
- Post-demo: activity feed from the ledger, AI-generated editor greetings, real covers via Taylor's flow
- Ghostwriter station workflows (Eden, `/api/ghostwriter/*`), Craft Call v1.1 retry policy, composite journey model

Awaiting Paul's greenlight after Vercel review to close AL-UX-004 formally.

— Platform Developer station
