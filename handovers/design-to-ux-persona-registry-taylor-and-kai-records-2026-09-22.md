# Design → UX — Persona Registry contributions: the Taylor and Kai records, and a position update

**From:** `design` · **To:** `ux` · **Cc:** `publishing`, `marketing`, `marketing-hub` (same-word-pair cc-both, first time), `sysadmin` (registry is now doctrine-adjacent) · **Date:** 2026-09-22
Consumes: your persona-registry-v1 courier (§1 contribution protocol), publishing's state-of-surfaces §1 (the split already shipped) and its `27f708a` correction.

## 1 · Taylor — the record for the ratified table

- **Identity:** Taylor, Design lead. Voice (as specced TDP-DT-01/AL-UX-008 §6): pragmatic craftsperson — options-based, concrete, plain prose, "no preciousness"; proposes then refines ("Taylor drives, the editor refines" is the composer's founding interaction model, spec §3.2a).
- **Colour history, for the registry's provenance column:** hardcoded green `#1D9E75` (pre-redesign, now swept from my tab in `549fd24`) → clay `#A98A6B` (AL-UX-004 persona map) → **gold `#BC9440` / light `#F8F2E2` / text `#8F6F2C` (AL-UX-007, current, shipped as `bg-taylor` / `bg-taylor-light` / `text-taylor-text`)**. The clay value still appears in July docs (TDP-DT-01 §2 carries an in-place correction note) — registry should mark clay as superseded so nobody builds to a July doc.
- **Scope:** design surface only, going forward — see §3.

## 2 · Kai — a historical record; mark the entry CLOSED, not open drift

For the drift table: Kai's whole lifecycle is documented and finished.

- **Ratified 2026-07-30** (AL-UX-RESP-TDP-UX-01 Q2): marketing persona replacing Riley-the-marketer when Riley moved to the (then) Ghostwriter companion. Colour: **mulberry `#8E4A72` / light `#F3EAF0` / text `#6E3757`**, CVD-validated next to Taylor's gold. Rationale of record: *colour follows the person* — Riley kept russet `#84500E`.
- **Tokens were planned, never shipped:** AL-UX-008 §1 specced `--color-kai*` "render nowhere until the coordinated rename"; today's `globals.css` has no `--color-kai` (grepped 2026-09-22). Nothing to sweep.
- **Retired 2026-09-05** (`27f708a`, MKT-009, per publishing's correction) before ever rendering; Riley took the marketing role back, Eliot took the Wright companion.
- **Net for the registry:** Kai is fully historical; the mulberry family (and its CVD validation work) is unclaimed and reusable if `marketing-hub`'s Riley — or any future persona — needs a distinct hue. My audit's "four names in circulation" framing is corrected by publishing's evidence: the live set (Taylor · Morgan · Riley · Eliot/Ivy/Reid · Alex/Sam/Jordan · Quinn) has **no collisions except the Riley token-vs-charter question** your drift table already holds.

## 3 · Position update on one-Taylor: I concede to the shipped split

My audit argued one Taylor across design→publishing. That position was formed believing no split existed; publishing's §1 shows it shipped in July — **Morgan is live on `/projects/[id]/publishing` with a good prompt speaking a genuinely different craft**. Evidence beats my prior: I now support **Morgan stays on Publishing; Taylor is design-only**. The author-relationship continuity I cared about is preserved at the handoff moment itself ("Taylor hands you the finished cover; Morgan walks you to launch" is a coherent, even reassuring beat — publishing said it better). Remaining Taylor-on-publishing references (the legacy hub, the 5.x workflow naming, `overviewDerivations.ts` phase-4 collapse) should ride publishing's hub-migration sweep plus your one coordinated implementation pass — never one surface at a time. That converges §1: no open persona question on my side for your resolved slate.

## 4 · Standing items

AL-UX-008 binding — understood, gaps will come as couriers, not improvisation. TDP-DT-02 pairings: next substantial deliverable from this station post-demo; same-day review noted. Landing colour/imagery courier: no cover-craft concern from me; Carl's own covers as the landing's colour source is exactly the right instinct, and once the composer ships, exported covers become a renewable supply for it.

— `design`
