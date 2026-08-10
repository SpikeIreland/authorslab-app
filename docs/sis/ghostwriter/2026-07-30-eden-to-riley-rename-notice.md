# Notice: Persona renames — Eden → Riley, Marketing Riley → Kai

**AL-GWC-N-004 · 2026-07-30**
**Authority:** Paul, via Platform Dev memo AL-PDC-GW-UPDATE-001 (`docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md`)
**Applies from:** this date forward.

## What changed

Two AuthorsLab personas were renamed on 2026-07-30:

- **Eden → Riley.** The Ghostwriter-companion / onboarding matcher persona (the "warm gatekeeper" who asks the five questions and matches the author to Ivy or Reid). Rationale: gender-neutral, warm, literary; "Eden" was reading as feminine to some users.
- **Marketing Riley → Kai.** The Marketing lead persona (phase 5, launch planning). Rationale: freed up the "Riley" name for the Ghostwriter role. Kai is short, crisp, gender-neutral.

Ivy and Reid (the two ghostwriters) are unchanged.

## Reading historical documents

Any document dated **before 2026-07-30** in this repository that mentions "Eden" refers to what is now Riley. Any document dated **before 2026-07-30** that mentions "Riley" in a marketing / phase-5 / launch-plan context refers to what is now Kai.

Documents dated on or after 2026-07-30 use the current names.

The Ghostwriter station has intentionally left historical documents unedited — per Platform Dev memo §1 discipline ("leave historical docs alone and note the rename in a top-line update"). This document is that top-line update.

## Current state of the code

Full inventory of what was and was not renamed today is in the companion coordination brief: `docs/sis/ghostwriter/2026-07-30-eden-to-riley-n8n-coordination.md`.

Short version:
- **In-app code:** fully renamed (Ghostwriter, project shell, overview, API system prompts, lobby derivations, onboarding).
- **Public marketing pages** (`src/app/{page,editors,how-it-works,pricing,faq}.tsx`): NOT renamed pending a Demo & Content Ops decision on when public copy shifts.
- **Legacy `/author-studio/page.tsx`:** NOT renamed — Platform Dev's territory, will be updated in their next dispatch that touches it.
- **CSS variables and Tailwind classes** (`--color-riley`, `bg-riley`, etc.): NOT renamed — flagged as a separate atomic cleanup dispatch.
- **n8n workflows:** deployment pending. Frontend calls `riley-match`; workflow still lives at `eden-match` until Paul updates it (falls through to graceful local fallback in the meantime).

## Sacred / shared implication

The re-founding memo §2 established that Riley belongs firmly in the sacred (author-private) space. Anything Riley knows or remembers about an author stays with the author — never leaks to publisher-visible surfaces (Design, Publishing, Marketing tabs) or to the future publisher-account dashboard. This binds all future Riley work and any activity-log context feeding Riley's system prompt.

Kai, being the Marketing persona, sits in the shared-by-invitation space — the author invites a publisher to see the Marketing tab, and Kai's output is visible to that publisher. Different discipline, different data guarantees.
