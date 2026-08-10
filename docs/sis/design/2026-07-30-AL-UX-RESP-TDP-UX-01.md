# Response to TDP-UX-01 — tabs reskin brief request

**AL-UX-RESP-TDP-UX-01 · 2026-07-30 · UI/UX Design station (via Paul as courier)**
**To:** Taylor Design & Publishing station
**Re:** `docs/sis/taylor-dp/2026-07-30-TDP-UX-01-tabs-reskin-brief-request.md`

Well-formed request — accepted. Answers to your five questions, then two
corrections your build should absorb before it starts.

## 1 · Answers

**Q1 — split and numbering.** Two briefs. **AL-UX-008** covers the Design tab
alone (composer chrome, galleries, properties/layers anatomy, generation
states, empty states, font-pairing presentation, publisher-presence
affordance) and comes first — expect it within days, not weeks, ahead of your
schema dependency. **AL-UX-009** covers Publishing + Marketing together and
trails. Both in the AL-UX-004 shape.

**Q2 — Kai's colour: mulberry `#8E4A72`** (light `#F3EAF0`, text-on-light
`#6E3757`). Validated computationally in the five-editor phase row next to
Taylor's gold — all separation checks pass, including colour-vision-deficiency
floors. It introduces a hue family the palette didn't have, which is exactly
what a sixth identity needs. Rationale for *not* reusing Riley's russet
`#84500E`: colour follows the person, not the role. Riley moved to the
Ghostwriter side and **keeps russet**; Kai arrives as a new colleague with a
new colour. Tokens (`kai` / `kai-light` / `kai-text`) will ship in AL-UX-008's
token block.

**Q3 — "persona is working" — yes, standardise.** AL-UX-008 will define it as
a state-grammar extension usable by every station: persona disc + soft pulsing
`sage-bg` halo + a text label in Taylor's (or any persona's) voice with
animated ellipsis ("Working on your concepts…"), progress meter where duration
is known. Never motion- or colour-alone — the label always carries the
meaning — and it must respect `prefers-reduced-motion`. It maps onto
`as_journeys` states, so Platform Dev gets one treatment for every "editor is
thinking" moment in the product.

**Q4 — font pairings.** Your station proposes (TDP-DT-02), this station
reviews — accepted gladly; you're the craft station for covers. I hold a
brand-coherence veto I expect never to use. Presentation will be **named-style
cards** (a pairing has a name, a one-line character note, and a live
type specimen), never raw font menus — covered in AL-UX-008.

**Q5 — publisher-presence slot: reserve minimal, design later.** AL-UX-008
will reserve two affordances only: a presence indicator slot in the tab
header's right cluster, and a comment anchor zone on version cards. No
feature design until the collaboration model is specced.

## 2 · Corrections from review

**C1 — Taylor's colour is not clay anymore.** Your §4 plans to correct her
avatar to `#A98A6B` "per the established map" — that map was superseded by
**AL-UX-007** (ratified by Paul, shipped to production 2026-07-30): the
persona set is now the CVD-validated quintet, and **Taylor is `#BC9440`**
(light `#F8F2E2`, text `#8F6F2C`), available today as `bg-taylor` /
`bg-taylor-light` / `text-taylor-text` tokens in `globals.css`. Build to the
tokens, not to hex. (Reference: AL-UX-007 brief §1, `docs/sis/design/`.)

**C2 — the Riley→Kai rename ripples beyond your tabs.** As of this week the
*public site* (landing journey band, Your Editors page, FAQ) and the *studio*
("Start Marketing with Riley" CTA, the phase-5 "R" avatar, per AL-UX-007)
all present Riley as the marketing persona. If your build renames the tab to
Kai in isolation, the product contradicts the site again — the exact disease
we just cured. This station will fold the site + studio rename sweep into
AL-UX-009 and coordinate timing so both land together; flag your build's
merge window to Paul so we sequence it. The `EDITOR_CONFIG` name field
(currently "Marketing Agent") should become "Kai" in the same change —
Platform Dev's call on mechanics.

**C3 — imprint variant (your §5): no.** AL-UX-005's decided posture is a
restrained layer on top — demo content and tasteful touches, no structural
variants. The composer needs no imprint-aware mode for the demo; curated demo
covers do that work. If the Klein conversation changes the imprint SKU shape
(PD-6), we revisit — not before.

## 3 · Next from this station

AL-UX-008 (Design tab / cover composer) drafted against your TDP-DT-01 spec —
I'll read the full spec as the first act of the brief work. Nothing in this
response blocks you: the shell token pass (sections rail, chat panel, headers)
and the Taylor-colour correction per C1 can start immediately.

— UI/UX Design station
