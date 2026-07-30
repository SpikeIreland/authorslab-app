# Founding Brief — AL Pricing Chat

**From:** SIS – System Admin · **Authorised:** Paul · 2026-07-28
**Coordinator:** AL – System Admin · **Read with:** `AL-Pricing-Research-Report-V1.md` (same folder)

## 1 · Your mission

Take AuthorsLab from a one-time $299 package to a subscription model, producing
the same investment chain the Clarence pricing chat produced: **financial
model → pricing stress test → pitch deck → executive summary** — in time for
the September 2026 investment push and the Jacky Klein imprint demo. You own
the commercial model; you do not own the platform build (platform-dev chat),
the database (SysAdmin), or the method (SIS).

## 2 · Verified facts you start with (checked against machinery, not memory)

1. **Current model (site, fetched 2026-07-28):** free full-manuscript
   analysis + "$299 Complete Journey" one-time; anchor message "Traditional
   editing costs $2,000–$10,000+"; five-phase journey advertised; multi-project
   value absent from the page.
2. **Schema is subscription-ready:** tiers `free/basic/pro/enterprise` with
   `manuscripts_allowed` exist in the type system, unbuilt; access today is a
   one-time package + admin/beta flags. `has_ghostwriter_access` becomes a
   tier check (design decisions doc).
3. **Entity model decided (D7):** an account is a person OR an imprint;
   members hold roles. Person-vs-imprint is your natural SKU boundary —
   architecture and pricing agree. Tier-3 agency views deferred (D5).
4. **The value metric is already the unit of work:** projects (manuscripts).
   Multi-project reality is the subscription rationale — and
   `manuscripts_allowed` is sitting in the schema waiting to be your tier key.
5. **COGS will be measured, not assumed:** `lmo_ledger` (live 2026-07-27)
   records model, tokens, and cost per AI call per station per author, filling
   as the Craft Call rolls out. Your financial model's cost lines become
   instrument readings within weeks — few pre-seed platforms can show
   investors metered per-user COGS. Build the model to consume it.
6. **Live base:** 11 authors, 8 manuscripts, 272 chapters — the transition
   cohort. Grandfather them deliberately (see the Cursor cautionary tale in
   the research report §4).
7. **September anchor:** Jacky Klein demo — tier-2 imprint, Blair-backed.
   The imprint SKU conversation prices against Consonance's £600/mo floor,
   not against writer tiers.

## 3 · The stress-test frame (from the research — yours to break)

Writer tiers ~£9–12 / ~£19–24 / ~£39–49 keyed to projects + analysis credits
(all features on every tier, Sudowrite pattern); separate imprint SKU
£250–£750/mo (per-title or seats-with-minimum); retain a one-time per-book
pass (~$149–299) as funnel. Paul's £19 instinct is validated as in-range for
the flagship tier — your job is to stress it: unit economics per tier against
lmo_ledger data as it arrives, Van Westendorp on the beta cohort and waiting
list, churn assumptions, the credit-allowance sizing, and the annual-billing
discount structure.

## 4 · First tasks (suggested order)

1. Close the research's named gap: panel-grade pricing for the prosumer
   bracket (ProWritingAid, Atticus, NovelCrafter, Scrivener, Grammarly) —
   the £19 point's nearest neighbours.
2. Build the financial model skeleton (CL pattern) with COGS lines wired to
   consume lmo_ledger aggregates (SysAdmin can provide views on request).
3. Price-architecture options paper → Paul decides tier count/points.
4. Website messaging delta: what changes on authorslab.ai (keep the
   $2k–$10k anchor, reframe one-time → per-project capacity, surface
   multi-project value, keep free analysis as funnel).
5. Deck + exec summary once the model stands.

## 5 · Protocol

Self-contained briefs via Paul; decisions that touch platform architecture
(tier enforcement, billing tables, Stripe) route to AL – System Admin for
dispatch to the platform chat; schema requests go to SysAdmin; anything
method-level flows back to SIS via the findings register. Evidence, not
claims — your numbers carry sources or instrument readings, and the
financial model states which is which on every line.

*The Clarence pricing chat had to build its model on assumptions. You get a
plant with a cost meter. Use it.*
