# AuthorsLab Pricing — Decision Record V1

**AL-PC-DR-001 · 2026-07-30 · AL Pricing Chat · Decided by: Paul**
Decides all six questions in AL-PC-OPT-001 (options paper, 2026-07-28) as
recommended. This record is the single reference for downstream work; the
financial model (AL-PC-FM-001, now V0.2) carries matching `DECIDED` tags on
the affected assumption lines.

## Decisions

**PD-1 · Tier architecture — DECIDED: Option A.** Three writer tiers,
Starter £10 / Author £19 / Pro £39 monthly-billed; annual effective
£7 / £13 / £27 (~30% discount). Starter retained as the bimodal-market
entry. Option B's £24 anchor and a 45% discount depth go into the Van
Westendorp questionnaire as test cases, not as live prices.

**PD-2 · Billing display — DECIDED.** Annual price is the headline
everywhere: "£13/mo billed annually · £19 billed monthly" — never a bare
"£19". Discount depth stays ~30% pending Van Westendorp.

**PD-3 · Credit allowances — DECIDED (structure), OPEN (numbers).**
Tier capacity keyed to deep-analysis passes: provisional 1 / 4 / 10 per
month. Final numbers set after the first month of lmo_ledger aggregates,
sized so flagship gross margin clears 70% at measured cost. If a full
five-station pass proves expensive, metering moves to per-station passes.

**PD-4 · One-time pass — DECIDED.** Reprice $299 → **£119** (~$150). Pass
credits toward the first subscription month if the buyer upgrades within
90 days. Free full-manuscript analysis unchanged as top-of-funnel; the
$2k–$10k human-services anchor stays on the site.

**PD-5 · Grandfathering — DECIDED.** The 11 beta authors become **Founding
Authors**: Author tier at £9.50/mo for as long as their subscription stays
active, existing one-time entitlements honoured in full, announced *before*
any public pricing change.

**PD-6 · Imprint SKU — DECIDED (posture).** Decision on shape (per-title
vs seats-with-minimum vs list-based) is deliberately deferred to the
September Jacky Klein conversation. Negotiating posture: price against
Consonance's £600/mo, model placeholder £500/mo, floor £250/mo.

## Immediate implications

1. **Website messaging delta** (founding brief §4.4) is now unblocked:
   three-tier pricing page with annual-first display, one-time pass at
   £119 reframed as per-project entry, multi-project value surfaced, free
   analysis and the human-services anchor retained.
2. **Deck and exec summary** are unblocked on pricing content.
3. **Founding Author announcement** must be drafted and sent to the 11 beta
   authors before the site changes — sequencing is part of the decision.
4. **Van Westendorp instrument** should carry: £24 flagship anchor, 45%
   annual discount depth, and pass price sensitivity around £119.

## Routing (per founding brief §5)

- **To AL – System Admin → platform-dev chat:** tier enforcement mapping
  (`free/basic/pro/enterprise` schema tiers → Starter/Author/Pro;
  `manuscripts_allowed` per tier), Stripe catalogue (3 tiers × monthly +
  annual prices, £119 one-time pass SKU, Founding Author coupon at £9.50),
  pass-credit-on-upgrade mechanic (90-day window).
- **To SysAdmin:** the three lmo_ledger aggregate views listed on the
  model's lmo_ledger tab — now on the critical path for PD-3's allowance
  numbers.
- **No method-level findings** for SIS from this decision set.

*Nothing in this record changes model arithmetic — V0.1 placeholder values
already matched the recommendations. V0.2 changes provenance tags only.*
