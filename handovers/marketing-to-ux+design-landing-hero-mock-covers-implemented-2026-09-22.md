# Marketing → UX + Design — Landing hero: mock covers implemented, same-day review invited

**From:** `marketing` · **To:** `ux`, `design` · **Cc:** `sysadmin` · **Date:** 2026-09-22
**Supersedes** the direction in `marketing-to-ux-landing-imagery-ack-2026-09-22.md`: Paul revised the brief (real Flame covers → fictional mock books) and overruled the post-demo timing — the demo has slipped a couple of days, and he directed implementation today. This is the implemented proposal rather than a paper one; review invited before Paul pushes.

## 1 · What changed and why

- **Direction revision (Paul, 2026-09-22):** the hero shows three FICTIONAL mock books across genres, not Carl's Flame series. Rationale: three books by one author reads as a vanity site; three genres broadcast "open to every author." Also dissolves the real-author-claims burden entirely (guardrail 2 of your courier is moot for these). Carl's own ask was "different authors/book images" — this honours it.
- **"Too flat" (Paul):** procedural colour-block books replaced with rendered cover artwork — imagery, atmosphere, deeper shadows.

## 2 · The three mock books (title-safety checked against real listings today)

| Slot | Title | Author (fictional) | Genre signal | Palette family |
|---|---|---|---|---|
| Centre (was Veil) | The Ninth Lantern | T. M. Vale | Fantasy — moonlit ridge, lantern glow | Charcoal/indigo + amber |
| Left (was Signal) | The Orchard at Night | Mirren Ashe | Literary fiction — branches, fireflies | Sage-deep |
| Right (was Book III) | A Field Guide to Leaving | Theo Marchetti | Essays/memoir — banded horizon, birds, sun | Terracotta/cream |

No exact-title collisions found (nearest real works: "The Lantern", "The Orchard", "The Art of Leaving" — all clearly distinct). Authors invented, mixed gender, no known-author collisions.

## 3 · Implementation

- `public/covers/mock/*.png` — three covers, 880×1280 (2x), pure vector/CSS art in Manuscript-Room-compatible palettes, Pagella-class serif.
- `src/app/page.tsx` — `HeroBook` rewritten from procedural text-block to image-based (object-cover img, spine line kept, inner-edge highlight added, shadow deepened to 18/24/50 @ .35). Geometry, rotations and z-order unchanged from the AL-UX-006 layout. Collage container remains `aria-hidden` (decorative). esbuild parse clean.
- The hero code comment now records these as illustrative fictional books — nobody mistakes them for client claims later.

## 4 · Review asks

- `ux`: composition/tokens check against the design system — same-day if possible; Paul pushes after your look (or on his own call, demo timeline permitting). Happy to re-render any cover in minutes; sources are HTML/CSS.
- `design`: cover-craft eye on the three artworks; and the standing idea remains — when Taylor's composer ships, these three become their own dogfood story ("covers made in AuthorsLab") with a regeneration pass.

— `marketing`
