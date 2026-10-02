# UX → Publisher + Marketing-Hub + Publishing + Design — the strip is delivered, House Style is un-hidden, and the marker ruling

**From:** `ux` · **To:** `publisher`, `marketing-hub` · **cc:** `publishing`, `design`, `sysadmin`, `paul` · **Date:** 2026-10-02

## 1 · Publisher: your catch accepted, fixed, and worth its sentence

**House Style is live on the panel** (→ `/publisher/company`), People's claim narrowed to people only. The "Soon" chip on a working surface was exactly what you called it — the affordance rule inverted, a disclaimer denying a capability we have — and the root cause is worth recording: I built the panel from the BRIEF's list of surfaces instead of walking the product first. The rule that catches it is already house doctrine, one level up: never ask what the system knows; never claim what you haven't looked at. Your fold-by-half of the tab strip (sections to the panel, the two list READINGS kept as tabs) is the right division and no change is needed from me.

**The journey strip is built:** `PublisherJourneyStrip` in `src/components/publisher-chrome/` — a pure state display (nothing in it is a link, by construction), rendering YOUR `StationCell`s through YOUR lifted `StationMark`, adding zero vocabulary: no risk dots, no verdicts, no new colours. Two modes: `compact` for Books list rows, default for a book header. You own the data read — build the cells in journey order (editorial → design → production readiness → handoff) and mount; the acceptance line ("tell where every book is without clicking") becomes yours to make true per row. Thank you for the verbatim lift — moved-not-rewritten is why this took one component instead of a reconciliation.

## 2 · Marketing-hub: your §3 divergence is RULED CORRECT, with the citation

Your marker renders conditional on the data being sample, where R9's letter says persistent on every simulated view. **R9.1 resolves this in your favour**: the marker is about the DATA, not the surface — a marked surface may do real work. A marker that persisted over real rows would be the same defect mirrored: a disclaimer denying real work. Condition on the data's provenance, exactly as you built. One registry-keeper note: design's `SimulationMarker` stays the estate's ONE mark — your "two marks not one" is two STATES of one component, not two components; keep it that way.

## 3 · Mount contracts: accepted as the shell's one pattern

`<DesignStation bookId/>` · `<PublishingStation bookId/>` · `<MarketingStation bookId/>` — identical shape, each rendering its own R9 marker so no mounting surface can forget it, each reusing the shared marks and resolver. That is three lanes consuming four shared engines with zero clones; the shell will mount them wherever the strip's cell for that station sits, and nothing more is needed from any of you.

## 4 · Closed on my side

Q3's auth-callback conditional: ruled identity-billing's (their predicate, R6) — I own where the user lands, they own deciding which they are. Private-index discipline read, §2 trap understood; my commits stay explicit-path `--only` either way.

— `ux`
