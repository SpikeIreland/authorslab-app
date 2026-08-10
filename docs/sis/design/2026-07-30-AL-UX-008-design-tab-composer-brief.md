# Build brief — Design tab & cover composer, Manuscript Room language

**AL-UX-008 · 2026-07-30**
**From:** UI/UX Design station (via Paul as courier)
**To:** Taylor Design & Publishing station (build), Platform Dev (tokens + schema per TDP-DT-01 §12)
**Constrained by:** `docs/sis/taylor-dp/2026-07-30-TDP-DT-01-design-tab-cover-composer-spec.md` (IA, data, staging — approved). This brief owns the visual language, component anatomy, and states.
**Prior agreements:** AL-UX-RESP-TDP-UX-01 (all five answers + corrections stand).

---

## 1 · Token additions

Extend the `@theme` block (Platform Dev, alongside the TDP-DT-01 schema change):

```css
/* Kai — sixth persona, marketing (CVD-validated in the phase row) */
--color-kai: #8E4A72;
--color-kai-light: #F3EAF0;
--color-kai-text: #6E3757;

/* Composer desk — the surface the cover "sits on" */
--color-desk: #EDE9E1;
```

Everything else uses shipped tokens. Composer semantics (no new tokens needed):
**selection & handles** `sage`; **snap guides** `terracotta`; **safe-margin
guides** `faint` dashed; **advisory hints** `amber-bg` + `status-warn` text.
Kai's tokens ship now but render nowhere until the coordinated rename (C2) —
they simply exist so TDP's build never hardcodes.

## 2 · Tab shell (token pass — start immediately)

Three-region layout survives: sections rail / main / Taylor chat.

- **Sections rail:** Cover as the active entry (state grammar: sage dot when
  work is in progress, sage-deep ✓ once a cover is selected); Front matter /
  Back matter / Interior format keep "Soon" small-caps chips (`line-soft` /
  `muted`) — never italics.
- **Taylor chat panel:** header block `bg-taylor` with white name + role line
  (mirrors the studio's chat header anatomy); Taylor bubbles `taylor-light`
  with `border-taylor/25`; author bubbles `paper-warm` + `line`; system notes
  `amber-bg` dashed. Avatar = solid `taylor` disc, white serif "T". The
  hardcoded green `#1D9E75` dies here.
- Section headers serif; kickers via the global `.kicker`.

## 3 · Cover section — the five states

**3.1 Intake (no concepts yet).** Two pathway cards side by side on `paper`:
"Ask Taylor for concepts" (primary — Taylor disc + one line of her voice +
`sage-deep` button) and "Bring your own" (dashed-border card, upload affordance,
the rights-confirmation line as a quiet checkbox row, resolution note in
`faint`). Below, Taylor's design-brief summary (genre / tone / imagery
direction from `5.1`) as a `paper-warm` strip — the author should see *why*
her concepts will look the way they look.

**3.2 Generation in progress — the "persona is working" standard (defined
here for the whole product):**

> Persona disc (their colour) + a soft halo pulsing `sage-bg → transparent`
> (~2s ease cycle) + a voiced label with animated ellipsis, staged where the
> work has stages: "Reading your design brief…" → "Painting three
> concepts — this can take a minute…". Progress meter (`sage` on `line-soft`)
> only when duration is genuinely estimable; otherwise no bar — never a fake
> one. `prefers-reduced-motion`: halo becomes static `sage-bg` ring, ellipsis
> stops animating, label stays. The label ALWAYS carries the state — motion
> and colour are reinforcement, per the state grammar's never-colour-alone
> rule. Maps to `as_journeys` states; every station reuses this anatomy.

**3.3 Concept gallery.** 5:8 thumbnails on `paper` cards, subtle lift on
hover (existing card shadow vocabulary), grouped by run with Taylor's
one-line note per set ("Three directions — one quiet, one bold, one
between."). Card actions: "Open in composer →" (primary), regenerate link in
`muted`. Uploaded assets appear in the same gallery with an "Uploaded" chip
(`line-soft`/`muted`) — one gallery, two provenances, per the spec's
one-path principle.

**3.4 The composer.** Anatomy, left to right inside the main region:

- **Layers list** (thin, ~176px): rows of eye-toggle · type glyph · name;
  seeded roles named Title / Subtitle / Author with a tiny `taylor-light`
  "set by Taylor" dot-chip until first edited; drag to reorder; delete on
  hover (status-high on the icon only). Artwork row pinned at bottom.
- **Canvas** on the `desk` surface, centred, with the book-object shadow the
  Library established (`14px 18px 40px rgba(44,44,42,.30)`) — the cover
  reads as a physical object on a work table, which is the whole Manuscript
  Room thesis in one image. Selection: 1.5px `sage` border, 8px square white
  handles with `sage` border, rotation stem above. Snap guides: 1px
  `terracotta`, flashing only while snapped. Safe margins: dashed `faint`,
  toggleable, on by default. Contrast nudge: small `amber-bg` chip anchored
  to the offending layer — "Hard to read against the art — try a scrim" with
  an inline apply-scrim action. Advisory, dismissible, never blocking.
- **Properties panel** (~256px): contextual to selection. Text layer order:
  font pairing (named-style card control — §5), size, colour (the 6 artwork
  swatches first, full picker behind a "More…" affordance), weight, letter
  spacing, line height, alignment, rotation. Scrim: style / colour /
  opacity / region. Artwork: replace ("Swap the art, keep your typography" —
  the spec's decoupling made visible), crop, scale. Panel headers kicker
  style; controls on `paper`; nothing dark.
- **Top bar of the composer:** back-to-gallery link, draft title (serif),
  autosave whisper in `faint` ("Saved just now" — no spinners for
  autosave), then right-aligned: "Save as version" (ghost) and "Use this
  cover" (primary `sage-deep`).

Keyboard: arrows nudge 1 unit (shift = 10), Delete removes selected freeform
layer (seeded roles get a confirm), Esc deselects, double-click text edits
inline. Build-discretion on details; the principle is that the mouse is
never the only way.

**3.5 Version gallery.** 5:8 thumbnails, optional label (serif when
present), date, and an attribution line ("Saved by you" / future
collaborator name — `created_by` surfaces here from day one). Selected
version: `sage-deep` ring + ✓ chip reading **"Your cover"** (state grammar's
complete treatment). Unlimited retention → paginate with a quiet "Show
earlier versions" control; newest first; no infinite-scroll jank on the
demo path. **Reserved affordances (build nothing):** a 24px footer strip on
each card (future comment anchor) and one 32px slot in the tab header's
right cluster (future presence indicator).

## 4 · "Use this cover" moment

This is a demo beat — give it its due without confetti: on selection, the
version card's ✓ chip appears, and a single quiet confirmation line in
Taylor's voice ("It's on the book. Your Library shows it now.") links to the
Overview. No modal, no animation longer than ~400ms. The reward is seeing
the book object wear it.

## 5 · Font pairings — presentation

Named-style cards, never font menus: each of TDP-DT-02's ~8 pairings renders
as a card with the pairing's **name**, a one-line **character note**
("Classical, assured — for books that mean it"), and a **live specimen** (the
project's actual title set in the display face, support face beneath). Cards
in a 2-up popover grid from the properties panel. Current pairing carries the
state grammar's active dot. Review loop per RESP Q4: TDP proposes, this
station reviews against brand coherence before build bakes them in.

## 6 · Empty states (Taylor's voice — pragmatic craftsperson, options, no preciousness)

- **Manuscript not yet through the studio:** "Covers come last for a reason —
  the best ones grow out of finished books. When your manuscript's through
  the studio, we'll start. Want to talk direction in the meantime?"
  (Chat remains open; intake buttons hidden, not disabled-grey.)
- **No concepts yet:** the intake state itself (§3.1) — an invitation, not an
  absence.
- **No versions yet:** "Save a version when a draft feels worth keeping —
  versions are how we'll compare directions later." (`muted`, no card
  skeleton theatre.)

## 7 · Data needs

Nothing beyond TDP-DT-01 §8. From this brief specifically: the 6-swatch
palette extraction feeds the colour control; `created_by` feeds gallery
attribution; `as_journeys` (or the generation run state) feeds §3.2. Quota
UI ("generations remaining") is **post-pricing** — build the counter per the
spec, render nothing until tiers land (recommendation per open question 1).

## 8 · Phasing (aligned to TDP-DT-01 §6)

Shell token pass + chat panel + intake + working-state (§2, 3.1, 3.2) ride
Stage 1 from day one; composer chrome + properties + versions (§3.4–3.5,
§4) complete Stage 1; layers list full behaviour + freeform additions polish
in Stage 2. Nothing here blocks their schema-dependent start; everything
visual is buildable against mock persistence.

## 9 · Out of scope

Publishing + Marketing tabs (AL-UX-009, trailing — includes the coordinated
Riley→Kai sweep per C2); publisher-collaboration UI beyond the two reserved
affordances; print wrap; imprint variants (per RESP C3); font escape hatch.

## 10 · Open questions

1. Quota affordance timing — recommendation above (§7): counter now, UI
   post-pricing. Confirm or override, Paul.
2. TDP-DT-02 pairings — send when ready; review turnaround from this station
   will be same-day. If any pairing needs a licensed webfont (vs system
   serif stacks), flag it early — licensing is a Paul decision.

— UI/UX Design station
