# AL-UX PERSONA REGISTRY — V1 (2026-09-22)

**Owner:** `ux` (this registry parallels the slug registry: `sysadmin` owns who the CHATS are; this owns who the PERSONAS are). Every chat builds copy, tokens, and UI against this file. Changes land here first, by courier to `ux`; a rename ships only as ONE coordinated sweep across every surface that renders the name (the C2 lesson — never rename in one surface only).

**Format per entry:** name · station/surface · role as the author meets it · colour token (where ratified) · voice in one line · status.

## Ratified entries

| Persona | Station | Role (author-facing) | Colour | Voice, one line | Status |
|---|---|---|---|---|---|
| **Eliot** | wright (intake) | Greets every new project; runs the five-question intake; introduces the Project Partner | — (no owned token yet) | Warm concierge — makes the blank page feel staffed | Ratified (renamed Eden → Riley → Eliot; name current as of wright audit 2026-09-22) |
| **Ivy** | wright (workshop) | Project Partner option A — picks up IN the same transcript after Eliot's match | — | TBD by wright design proposal | Ratified as name + handoff pattern |
| **Reid** | wright (workshop) | Project Partner option B — same pattern as Ivy | — | TBD by wright design proposal | Ratified as name + handoff pattern |
| **Alex** | astudio | Developmental Editor (Phase 1) | `#4A8340` (+ -light/-text) | Structural, big-picture, encouraging | Ratified; CVD-validated quintet |
| **Sam** | astudio | Line Editor (Phase 2) | `#D08A4F` (+ variants) | Sentence-level craft, precise | Ratified; CVD-validated quintet |
| **Jordan** | astudio | Copy Editor (Phase 3) | `#0B7A5C` (+ variants) | Meticulous, rule-grounded | Ratified; CVD-validated quintet |
| **Taylor** | design ONLY | Cover design craft; hands the finished cover to Morgan at the design→publishing seam ("Taylor hands you the finished cover; Morgan walks you to launch") | `#BC9440` / light `#F8F2E2` / text `#8F6F2C` (provenance: `#1D9E75` → clay `#A98A6B` SUPERSEDED, still in July docs — never build to it → gold, AL-UX-007) | Pragmatic craftsperson — options-based, concrete, no preciousness; proposes then refines | Ratified; design-only scope settled 2026-09-22 (design conceded to the shipped July split) |
| **Morgan** | publishing | Launch prep — metadata, ISBN, pricing, platforms, launch; picks up from Taylor at the seam | mulberry `#8E4A72` / light `#F3EAF0` / text `#6E3757` (reallocated by ux 2026-09-23 from publishing's lifted `#BA7517`, which made three warm ambers beside Taylor/Riley; mulberry was CVD-validated for this slot in July and unclaimed since Kai closed — mulberry is now CLAIMED) | Warm, practical, direct; plain prose, no markdown (publishing's record) | Ratified; token settled 2026-09-23 |
| **Riley** | marketing-hub | Author-book marketing — campaign design for the author's individual book (phase 5) | UNRECONCILED: shipped quintet token `--color-riley` `#84500E` (russet) vs `#D85A30` (orange) live on the marketing-hub surface; mulberry declined by marketing-hub until after Blair (now claimed by Morgan anyway) | Per marketing-hub's charter | Name RATIFIED (marketing-hub ruling 2026-09-23, ends the token-vs-charter drift); COLOUR reconciliation is the registry's single open item, queued post-Blair with the naming-spine sweep |

## Standing language rules (already doctrine, recorded here so they travel with the personas)

- **"Project Partner", never "ghostwriter"** — anywhere an author can read.
- **Identity ≠ state:** persona colour marks WHO; state is marked by the grammar (✓ complete / ● live+halo / pending / "Not needed") — never colour alone, never strikethrough.
- **Copy asserts observed state, never phase implication** (truthful-state voice; formal audit is ux post-demo item B).

## OPEN — name drift, resolution owed (do NOT build new surfaces against these until ruled)

| Name in the wild | Where it renders | The conflict |
|---|---|---|

| **Kai** — CLOSED (historical) | nowhere (never rendered) | Ratified 2026-07-30, tokens specced but NEVER shipped (no `--color-kai` in globals.css, grepped 2026-09-22), retired 2026-09-05 in `27f708a`. Mulberry family `#8E4A72`/`#F3EAF0`/`#6E3757` was released to the pool at closure and CLAIMED by Morgan 2026-09-23 |
| **Quinn** — RETIRED (2026-08-10, MKT-007: retired names must not appear anywhere public) | Codebase debris only: `phase-transition/page.tsx`, `phase-complete/page.tsx` ('Start Phase 5 with Quinn →' card), old `author-studio` monolith (clickable, routes to legacy hub) — plus `manuscripts.quinn_report_pdf_url` column | Same class as Kai: CLOSED persona. Sweep status 2026-09-23/24: phase pages swept (astudio `9101bbd`); /marketing-hub surface swept (marketing-hub); `editing_phases` phase-5 backfill DONE (migration `20260923044346`, 12 rows Quinn→Riley; full roster verified 1 Alex / 2 Sam / 3 Jordan / 4 Morgan / 5 Riley, 12 each — astudio quoted 2026-09-24). Remaining Quinn debris: old author-studio monolith strings only (post-demo sweep). 'Live in the codebase' ≠ 'live persona' |

**Resolution path:** all persona NAMES are now settled. The single open item is Riley's colour reconciliation (#84500E token vs #D85A30 surface), queued post-Blair. `publishing` couriers the full Morgan record; `marketing-hub` + `marketing` state persona needs under the V1.2 split; `ux` drafts the resolved slate; Paul ratifies; ONE sweep implements — that sweep also carries the leftover Taylor-on-publishing references (legacy hub, 5.x workflow naming, `overviewDerivations.ts` phase-4 collapse) riding publishing's hub migration.

## Changelog
- V1.4.1 (2026-09-24): Quinn data backfill confirmed done (astudio quote); debris now monolith-only.
- V1.4 (2026-09-24): Riley RATIFIED for marketing-hub (their 2026-09-23 ruling) — last name-drift item closed; colour reconciliation recorded as the sole open item; Quinn sweep status updated (surfaces swept, data backfill unblocked).
- V1.3 (2026-09-23): Morgan's full record landed (publishing) and token settled — mulberry family reallocated from the lifted #BA7517 (three-warm-ambers CVD failure); mulberry now claimed.
- V1.2 (2026-09-22, same day): Quinn reclassified RETIRED per marketing's MKT-007 correction (was mislabelled as possibly-live drift); debris locations recorded; open drift is Riley only.
- V1.1 (2026-09-22, same day): design's records folded in (`design-to-ux-persona-registry-taylor-and-kai-records-2026-09-22.md`) — Taylor full record + design-only scope (one-Taylor position withdrawn against shipped evidence), Morgan ratified-by-evidence, Kai closed historical with mulberry family released. Open drift now: Riley token-vs-charter, Quinn.
- V1 (2026-09-22): stood up at design's request (`design-to-sysadmin-design-tab-audit-and-demo-readiness-2026-09-22.md` §5), seconded by publishing. Ratified rows = July records + wright audit; drift table = recorded, unresolved.
