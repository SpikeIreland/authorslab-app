# AuthorsLab Pricing — Products & Staged-Release Decision Note V1

**AL-PC-DN-001 · 2026-07-31 · AL Pricing Chat · Decided by: Paul · Courier: Paul**
Responds to AL-PDC-FM-NOTE-001 (Platform Dev delta note) and the staged-release
decision of 2026-07-30 (editing-only MVP; Ghostwriter, Design, Publishing,
Marketing as staggered product releases). Extends AL-PC-DR-001 (PD-1–PD-6, all
of which stand). Live pricing page verified by direct fetch 2026-07-31 —
it correctly implements PD-1/PD-2/PD-4 (£7/£13/£27 annual-first, £10/£19/£39
monthly, 1/4/10 passes, £119 pass with 90-day credit).

## Confirmation: editing-only pricing holds

The decided tier prices work for the editing-only MVP. The tier value unit —
a full-manuscript pass through a three-editor team — has no direct competitor
equivalent at any price (nearest: ProWritingAid's single-report Chapter
Critique at $10–12/mo annual-effective; human editing $2k–$10k/book). On
cost, an editing-only pass is three stations rather than five (~£2.20
placeholder vs £3.00), and first lmo_ledger readings (n=3, indicative)
suggest even that is conservative. Editing-only Author runs ~60–65% gross
margin on placeholders before caching. **No price change needed for MVP
launch.**

## New decisions

**PD-7 · Staged-release pricing policy — DECIDED.** Products land *inside*
the existing three tiers as delivered value; no new tiers per release.
At each product release: existing subscribers keep their current price
permanently (the Founding pattern, repeated), and the new-customer price
list may step up. Narrative: "the platform grows, the price grows, early
believers are locked in." Step magnitudes are set per release in the
financial model (placeholder +10% at Design, +10% at Marketing release —
ASSUMPTION, revisit per release with Van Westendorp/live data). Exception
to "everything in every tier": Ghostwriter (PD-10).

**PD-8 · Cover-generation quotas — DECIDED (initial values).** Per
manuscript (not per month): Starter 3 / Author 10 / Pro 25 generation runs.
At ~$0.12/run (3 DALL-E images) this is abuse control, not economics — even
25 runs is ~$3 one-off per manuscript. Quota anxiety must not shape the
composer UX; iterating on captured artwork stays unlimited. Top-up packs
possible later if demand shows. Revisable with cover_assets data.

**PD-9 · Riley cost envelope — DECIDED (formula).** Riley's ambient LLM
cost caps at ~10% of blended tier revenue: **£0.60 / £1.20 / £2.00 per
user-month** for Starter / Author / Pro. Ghostwriter Station scopes her
proactive check-in frequency to that envelope (with Haiku for ambient turns
and prompt caching, the envelope buys a lot of presence). Envelope revisits
when the ledger measures her real burn in beta.

**PD-10 · Ghostwriter metering — DECIDED (principle).** Ghostwriter does
NOT fold silently into tier subscriptions: full-draft generation is an
order of magnitude more output tokens than an editing pass (plausibly
$5–20 per draft cycle vs ~$1–2 per editing pass) and would eat the Author
tier's margin alone. It gets its own meter — ghostwriter passes counted
like editorial passes, or an add-on — with the specific shape decided at
its release using measured ledger cost. The financial model carries a slot
from now.

## Per-chat items (courier: hand each chat its section)

### → Taylor Design & Publishing
- PD-8 quotas above unblock 5.2 gating: 3 / 10 / 25 runs per manuscript by
  tier. Generous by design; composer iteration on captured artwork is
  unmetered.
- Imprint/publisher SKU: PD-6 posture unchanged (decide shape with Jacky
  Klein in September). New sizing input received — "Jacky = 20–50 authors"
  — pricing chat is modelling a base + per-author contract shape
  (~£250–500 base + £8–12/author/mo, landing £500–1,000/mo at her scale
  against Consonance's £600/mo comparable). Do not commit numbers to her
  before the September conversation.

### → Ghostwriter Station
- PD-9 Riley envelope: £0.60 / £1.20 / £2.00 per user-month by tier
  (~10% of blended revenue). Scope check-in frequency to it; prefer Haiku +
  caching for ambient turns.
- PD-10: plan Ghostwriter as metered from day one of its release; the meter
  shape (passes vs add-on) is decided at release with ledger data.

### → Marketing chat
- Pricing page truth fix needed BEFORE the trial ad runs: the live Author
  tier copy promises cover design, publishing prep and launch planning —
  products now deliberately held back post-MVP. Add "coming soon" labels or
  narrow the copy (route via UI/UX). "Never faster than truth" is the
  station's own principle.
- Free Manuscript Analysis workflow is currently INACTIVE in production
  (per Platform Dev note §7). It is the funnel's top — it must be live
  before paid traffic lands, or the ad buys clicks with no conversion path.
- Deck/CAC coordination: pricing chat holds tier prices, LTV and GM
  figures; reconcile numbers before the September demo — same story, same
  numbers.

### → Platform Dev
- Enable prompt caching on the Craft Call Cell. First ledger readings show
  zero cache usage; manuscript context repeats across calls, and cache
  reads price at 10% of input — the single biggest COGS lever currently
  visible. Pricing chat will re-read the ledger after a month of real
  traffic to set PD-3 allowance numbers.
- Note for any cost quoted after August: lmo_model_pricing shows Sonnet 5
  intro pricing ($2/$10 per Mtok) ends 2026-08-31, standard ($3/$15) from
  2026-09-01 — September investor figures must use standard rates.
- No schema or code changes requested. Stripe price-step mechanics (PD-7)
  are configuration when the first post-MVP release approaches.

### → Demo & Content Ops
- Investor-ready pricing materials live in the financial model V0.3
  (docs/sis/pricing/): per-user COGS and gross margin at 100 / 1,000 /
  10,000 writers, per tier and blended; LTV/CAC on the Metrics tab.
- The pricing narrative for September: decided three-tier structure live on
  site; COGS metered per AI call (lmo_ledger — few pre-seed platforms can
  show this); staged releases each raise new-customer prices while early
  subscribers keep theirs.

## Standing caveats

First ledger readings are n=3 over ~48 hours of dev/minimal-prod traffic —
directional only; every INSTRUMENT line in the model remains PENDING until
a month of real traffic. Price-step magnitudes in PD-7 are placeholders.
All new figures live in AL-Financial-Model-V0.3.xlsx with basis tags.
