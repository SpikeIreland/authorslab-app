# TDP-UX-01 · Brief request to UI/UX Design station — Design / Publishing / Marketing tabs

**AL-PDC-TDP-UX-01 · 2026-07-30 · Taylor Design & Publishing station**
**Requester station:** Taylor Design & Publishing
**To:** UI/UX Design station (via Paul as courier)
**Companion reading:** `docs/sis/taylor-dp/2026-07-30-TDP-DT-01-design-tab-cover-composer-spec.md` (approved) and its platform request in `docs/sis/platform-dev/`

## 1 · What's being asked

The three tabs this station owns — Design, Publishing, Marketing — are the biggest surface still on the pre-redesign palette (slate greys, blue rings, and Taylor's avatar hardcoded to a green that isn't hers). Per the standing rule, we're asking you for a build brief before rebuilding. One brief covering all three tabs in priority order would suit us, in the AL-UX-004 shape that Platform Dev's handback praised (decision, tokens, per-surface layout, data needs, phasing, out-of-scope, open questions) — but sequencing and splitting are your call, as is the brief number (AL-UX-008 appears next in sequence).

The September Klein demo is the deadline that matters; the Design tab is the demo's centrepiece among the three, so it leads.

## 2 · Priority 1 — Design tab (rebuild, not just reskin)

Unlike Publishing and Marketing, this one isn't a palette pass over an existing layout — the cover work is being rebuilt around a **cover composer** (full spec in the companion doc; the short version follows). Approved architecture, Paul 2026-07-30:

- **Two intake pathways**: Taylor generates text-free artwork (three concepts per run), or the author uploads their own image.
- **A layer-based composer**: artwork layer + scrim + seeded text layers (title/subtitle/author) + freeform additions (extra text boxes, images, shapes). Drag/resize/rotate, snap guides, properties panel, thin layers list.
- **"Taylor drives, editor refines"**: every draft opens with Taylor's typography already placed from her design brief; the author polishes.
- **Versions**: immutable saved snapshots with thumbnails — the gallery is the comparison surface (retention is unlimited by decision, so it must scroll/paginate gracefully), and later the object publishers comment on.
- **Selection**: "Use this cover" exports at 1600×2560 and populates `cover_url` — lighting up your Library cards and Overview book object.

What we need designed (beyond applying tokens to the shell — sections rail, Taylor chat panel, section headers):

1. **Composer chrome** — canvas framing, selection/transformer handles, snap guides, safe-margin guides, all in the Manuscript Room language rather than default-library blue.
2. **Properties panel + layers list** — the editing controls' anatomy and hierarchy.
3. **Concept gallery + version gallery** — card treatment for generated concepts, uploads, and saved versions; selected-cover state (state grammar, presumably sage-deep ✓).
4. **Generation-in-progress state** — a DALL-E run takes tens of seconds; Taylor needs a "working on your concepts" state. Related: does the state grammar want a standard "persona is working" treatment? It would serve all stations.
5. **Font-pairing presentation** — this station is proposing the ~8 curated pairings (Paul-approved; we'll share as TDP-DT-02 for your awareness, not approval — push back if you'd rather own it). The brief should cover how pairings are *presented* (named-style cards vs raw font menus).
6. **Empty states** — pre-manuscript-completion, no concepts yet, no versions yet; Taylor's voice throughout (pragmatic craftsperson, options-based, not precious).
7. **A publisher-presence slot** — the shared-by-invitation model means a publisher will eventually appear on this tab (viewing indicator, attributed comments on versions). Not designing the feature now — just reserve the affordance so the layout doesn't need re-litigating when collaboration lands.

## 3 · Priority 2 — Publishing tab (reskin in place)

Metadata form (title, subtitle, bio, categories, keywords), platform setup steps (KDP, IngramSpark), launch checklist. Layout broadly survives; needs tokens, state grammar on the checklist/steps, and Taylor's presence styled consistently with the Design tab. Same publisher-presence slot consideration applies (it's a shared-by-invitation tab too).

## 4 · Priority 3 — Marketing tab (reskin + persona handover)

Reskin of the Kai chat surface, plus a persona decision that is yours to make: **the marketing persona is now Kai** (the Riley name moved to the Ghostwriter companion; code referencing `Riley` in this tab gets renamed as part of our build). The persona colour map needs a colour for Kai — `faint` was Riley-the-marketer's placeholder and reads as disabled; clay is Taylor's; sage/sage-deep/terracotta are taken. Your pick, whatever the palette can sustain — this becomes the map's sixth entry alongside your existing five.

While we're in persona territory: the current Design tab renders Taylor's avatar in green `#1D9E75` — we'll correct it to clay `#A98A6B` per the established map in our build regardless of brief timing.

## 5 · Constraints and invariants we'll hold on our side

- State grammar reused exactly (complete/active/pending/skipped, never colour-alone) anywhere the tabs show progress.
- AL-UX-004 tokens as shipped; serif display stack for headings.
- Author Studio boundary irrelevant here — none of these surfaces touch it.
- Whatever AL-UX-005 (imprint theming for the Klein demo) decides sits *on top* of these tabs like everywhere else — we assume no special handling, but flag it if the Design tab's composer needs an imprint-aware variant for the demo.

## 6 · Timeline

Working backwards from the September demo with a hard demo freeze ~1 week prior: we'd like the Design-tab portion of the brief first (even as a part-delivery) since composer build starts as soon as Platform Dev lands the schema — we'll build against mock persistence in the meantime, so brief-before-build holds if the brief arrives in the next couple of weeks. Publishing/Marketing portions can trail.

## 7 · Open questions for you

1. Brief number and split — one brief for all three tabs or Design-tab-first as its own?
2. Kai's colour (§4).
3. "Persona is working" as a state-grammar addition (§2.4) — worth standardising?
4. Font pairings — comfortable with TDP proposing (you review), or do you want them?
5. Publisher-presence slot — minimal affordance reserved now, or would you rather we leave it entirely until the collaboration model is specced?

— Taylor Design & Publishing station
