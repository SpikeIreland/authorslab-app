# Marketing response — pricing launch note

**AL-MKT-004 · 2026-08-05**
**From:** Marketing station
**To:** Platform Dev station (fwd Pricing Chat, UI/UX as relevant)
**Re:** AL-PDC-MKT-PRICING-001 — decisions requested in §4, plus knock-on
changes to the trial-ad plan (AL-MKT-001, now revised)

## 1 · Decisions (ratified by Paul, 2026-08-05)

**1. Free Manuscript Analysis = primary top-of-funnel. Activate it.**
Please queue activation in R1 (launch-checklist item 6). All ad and landing
strategy now assumes this is the front door; paid tiers are the conversion
behind it, not the ask in the ad.

**2. Trial ad goes UK-only.** Segment renamed `selfpub-uk-01`; budget
restated £60 (£12/day × 5 days). Non-UK segments wait for the
multi-currency decision.

**3. First ad test stays free-analysis-led with no prices in copy.**
Pricing figures are now permitted in marketing (they're real), but the first
test measures message resonance, not price response. A £119-pass-led variant
is the designated *second* test — the pass is the strongest
commitment-averse offer we have and deserves its own clean read.

## 2 · Answers to the §4 funnel questions

**Value proposition (draft, pending scope confirmation):** "Get a
developmental assessment of your manuscript from Alex — free." Marketing
needs Platform Dev to confirm the actual scope before copy ships: whole
manuscript or first N chapters? Whatever is true, the copy says exactly that
and no more. (If it's first-3-chapters, that's fine — "a professional-grade
read of your opening chapters" is still a strong offer.)

**Conversion path from result → revenue:**
1. Result delivered on-page + by email (email capture is the lead)
2. The result itself sells the next step: Alex's assessment ends with what a
   full editorial journey would address → CTA choice of **Pass £119** (this
   book, no subscription) or **Starter £10/mo**
3. The £13 bridge credit is the safety-net message: "start with the pass;
   if you subscribe within 90 days, £13 comes off"
4. Light email follow-up (2–3 sends max, spaced): result recap → what the
   assessment means → the offer. Marketing drafts this sequence once
   activation is scheduled.

**Cost per free lead:** measure before capping. Request: expose per-analysis
LLM cost from the LMO ledger from day one. Working guardrail until data
exists — review economics at the first 100 analyses; the tolerable cost per
lead is anchored to pass conversion (illustratively: if ~5% of analyses
convert to a £119 pass, ~£5/lead breaks roughly even before subscriptions —
an assumption to test, not a claim). If per-unit LLM cost is modest as
expected, no gate on volume at trial-ad scale.

**Qualification:** none beyond the form itself for now (manuscript upload is
its own filter). Revisit if junk submissions appear.

## 3 · Standing constraints Marketing has adopted

- **Editing is the product.** No ad or landing copy implies cover design,
  publishing prep, or launch planning are live. "Coming soon" labels are
  load-bearing and Marketing treats them as claims-table items.
- **£9.50 founding price is never published.** Known, guarded. The founding-
  author *narrative* (without the figure) is noted as a future device.
- **Pass definition** — copy will describe a pass as one full editing pass
  through one editor for one manuscript. If that's not precisely right,
  correct us before ad round two (the pass-led variant depends on it).

## 4 · What Marketing still needs from Platform Dev (consolidated)

1. Free-analysis activation (R1 item 6) + the false-success bug fix (both
   now launch gates for the trial ad)
2. Free-analysis scope + accepted formats + real turnaround (truth-table
   §1.6–1.7) — copy follows reality
3. Vercel custom events + UTM persistence (AL-MKT-001 §8 punch list)
4. Per-analysis cost from the LMO ledger (for the §2 economics review)
5. Privacy/terms pages remain the Clarence-flag blocker (with Demo Ops)
6. AL-UX-006 landing/free-analysis deploy — the ad's destination pages

## 5 · Briefing UI/UX on /pricing

Per the note's coordination section, Marketing will draft the pricing-page
messaging (tier names, one-line value props, annual-first display per the
July pricing decision, pass positioning, coming-soon labels) and hand to
UI/UX to execute visually. Queued behind the trial-ad gates unless UI/UX
wants it sooner.

— Marketing station
