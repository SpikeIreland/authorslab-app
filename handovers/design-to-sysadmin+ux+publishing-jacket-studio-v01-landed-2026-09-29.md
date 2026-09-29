# Design → SysAdmin + UX + Publishing — The Jacket Studio: commissioned, specced, v0.1 landed

**From:** `design` · **To:** `sysadmin`, `ux`, `publishing` · **Cc:** `paul` (FYI — his commission, executed same-day) · **Date:** 2026-09-29

Paul commissioned the composer build today with three requirements: (1) front + back + spine accounting for book thickness and the fold-under edges an observer never sees, (2) Canva-like movable layout items, (3) upload from outside. All three map onto TDP-DT-01's approved architecture; requirement 1 upgrades it from front-cover-first to **jacket-first**, specced as **TDP-DT-03** (`docs/sis/design/TDP-DT-03-jacket-studio-spec-addendum-2026-09-29.md`).

## v0.1, landed this turn (tsc clean; signed-out 307/401 verified on dev)

- `src/lib/jacket.ts` — jacket geometry: trim presets, spine = pages × paper factor (KDP-published values) + binding allowance, bleed, casewrap fold wraps, zone rectangles.
- `/projects/[id]/design/studio` — the flat-jacket canvas: [fold][back][spine][front][fold] with shaded folds-under + bleed guides; artwork layer (wraparound maps zone-to-zone, portrait covers the front); draggable zone-anchored text layers (title/subtitle/author/**publisher**/rotated spine text/back description) with size/family/weight/colour controls; live spine re-flow from trim/paper/binding/pages; debounced autosave to `cover_drafts` (first writer that table has ever had).
- `design/draft` route (GET/PUT, RLS) and `design/upload` route — author-side upload per pathway 2: `<manuscript>/upload-<uuid>.<ext>` namespace (contract V1's planned revision, now real), MIME allowlist, 20MB, `rights_confirmed` required, `kind='uploaded'` rows. **Publisher upload remains I&B-gated and unbuilt**, unchanged from the 09-24 courier.
- Design tab gains "Open the studio →".

## Asks

- **`publishing` — the page-count seam is now real on my side.** The studio estimates pages as ⌈words/280⌉ with an editable override, labelled as an estimate. When 6.1's output can state a page count for a manuscript (your PDF-branch fix), courier me the field/shape and the estimate becomes a reading. No urgency; the override keeps v0.1 honest meanwhile.
- **`ux` — v0.1 is functional scaffolding in interim styling**; the AL-UX-008 visual pass (Manuscript Room language, canvas-on-desk, named-style font cards, working states) is v0.2's headline, and the brief remains binding. Two spec deltas to fold into the registry of record: a `publisher` text role joins the seeded set, and the document is now the full jacket. Gaps I hit will come as couriers per your standing instruction.
- **`sysadmin`** — no schema, no n8n, no shell touched; `cover_drafts` gets its first production writes. FYI only. (Access-week note: the studio ships behind the same author auth as the rest of the tab; nothing here changes Oliver's Monday surface unless Paul chooses to show it.)

v0.2 (versions + export at the KDP-recommended 1600×2560, Taylor pre-placement + edit_ops wiring, visual pass) starts next turn unless Paul re-prioritises.

— `design`
