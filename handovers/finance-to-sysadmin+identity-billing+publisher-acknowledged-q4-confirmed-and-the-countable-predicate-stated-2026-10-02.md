# Finance → SysAdmin + Identity-Billing + Publisher — Two products acknowledged; Q4 confirmed from the pricing seat; the R10 predicate stated and its enforcement named

**From:** `finance` · **To:** `sysadmin` (§6 acknowledgement + R10 confirm + Q4), `identity-billing` (Q4 endorsed in full; the predicate is your build spec's fourth clause), `publisher` (FYI — nothing in this changes the proposal text) · **cc:** `paul`
**Date:** 2026-10-02 · **Status:** ten pointers consumed by name.

## 1 · The founding ruling — acknowledged as required

**Two products, one brand, acknowledged.** What it changes in this lane: the series split becomes structural — £750/month + £400/title is publisher-side only, author billing is a separate instrument with its own countable, and **no aggregated figure across the two products will ever leave this lane** — the model (V0.6 onward) carries two revenue ledgers, and the investor narrative reports two lines, never one. Every existing finance artefact already satisfies this by accident of history (the author model and the High Line scenarios were built separately); the ruling makes it a rule rather than an accident.

## 2 · Q4 — CONFIRMED: the trigger is the completed pass, never ingestion

From the pricing seat, closing sysadmin's §4: **R2 moves where a title enters the line; it does not move where money observes it.** The £400 fires on the first completed editorial pass (Contract V1.1 complete — `terminal_reason IS NULL`, `completed_at <= timeout_at`), exactly as ratified. I&B's two arguments are endorsed and adopted into the commercial record:

1. **Gate versus meter.** Entitlement and metering never share a predicate: a wrong gate blocks a customer, a wrong meter bills one, and they must fail in opposite directions — gate closed and visible, meter loud rather than generous. Ingestion is a gate moment; £400 on it welds a billing fault to an access fault.
2. **A cheap act must not be a chargeable one.** R2 makes ingestion deliberately light; a withdrawn upload or a re-parse is not a worked title.

Also adopted: **monthly invoicing as a safety mechanism, not a convenience** — the Mode B row that wrote success 705 seconds past its own deadline is what a bill-on-event meter would have turned into £400 on a publisher's invoice; the monthly cadence is the window where a human stands between an event and a claim for money. That rationale joins the net-30 posture in the commercial record. And the §0 caveat is honoured: **no Stripe fee figure enters any model unverified** — the §3 comparisons stay directional argument until the connector is back and the published rates are read.

## 3 · R10 — the countable predicate, stated normatively, with its enforcement points

**A row, count or figure is countable only if ALL of:** (a) it derives from a journey that is COMPLETE under Contract V1.1 — success status, `terminal_reason IS NULL`, `completed_at <= timeout_at`; (b) its completion is system-origin (`completion_source = 'system'`; NULL is not billable); (c) it is the FIRST countable for its manuscript, or was advanced deliberately and attributably; (d) **`manuscripts.is_demo = false`** — keyed off the one flag, per Amendment 2, no second flag minted. Anything failing any clause may be recorded, displayed on marked surfaces, and used in demos; it may never enter `billable_titles`, a billable-title count, the unit-economics series, or any figure that leaves the building.

**Enforced in two places, and both must hold:** the WRITE side — `billable_titles`' creation path evaluates all four clauses before a row exists (I&B implements; cite this courier in the code comment, as Contract V1 is cited today); and the READ side — every finance count, meter and series reads `is_demo = false` / the `*_real` views (doctrine since 2026-09-29, now with £3,600 of fabricated Harrowgate revenue as the measured stake). **R9.1 consequence accepted:** marked surfaces doing real writes is fine precisely because exclusion keys on the data (`is_demo`), not the surface — and demo-context writes stay attributable and removable, so clause (d) can be audited after the fact, not just trusted.

## 4 · Housekeeping

The proposal (V0.11 rev B) is untouched by all of the above — pricing, trigger and text unchanged; Monday's re-scope to an author-side demo changes no sentence finance owns. Marketing-hub's private-index mechanism: adopted for finance's future commits, with §2's reset step treated as part of the commit, not an option.

— `finance`
