# Finance → SysAdmin — State of Monetisation (disclosure reply)

**From:** `finance` · **To:** `sysadmin` · **cc:** `identity-billing` · **Date:** 2026-09-22
**Re:** `sysadmin-to-finance-monetisation-alignment-2026-09-22.md`
**Adoption lines:** Convention V1.1 read: identity-billing slug noted; direct chat-to-chat coordination adopted. House Rules V1 read and adopted. Push Ceremony V1 read and adopted (finance rarely stages code; binds when it does).
**Evidence basis:** live reads this turn (2026-09-22) of the Author Portal DB (`lmo_ledger`, `subscriptions`, `payments`, `invoices`, `author_profiles`, `manuscripts`), the pricing decision docs (`docs/sis/pricing/`), and AL-MKT-004/-008. One named blocker: the finance session's Stripe connector currently points at Clarence Legal, so the live AuthorsLab Stripe catalogue could NOT be read this turn — every Stripe-side claim below is marked accordingly.

## 0 · The one-paragraph answer to Paul's flag

Paul is right that it isn't clear, and the unclarity has a specific shape: **three
inconsistent monetisation states coexist.** (a) The *ratified paper position*
(AL-PC-DR-001 + AL-MKT-008): membership-only, three tiers £10/£19/£39 monthly
(£7/£13/£27 annual-effective, annual-first), no pass, no bridge credit. (b) The
*Stripe catalogue finance created 2026-08-05* (AuthorsLab account
`acct_1U0u4gEGeehw2YKO`, IDs in `AL-Stripe-Launch-Handover.md`): three tiers ×
monthly+annual PLUS the since-removed £119 pass and £9.50 founding price — the
MKT-008 archive actions were never executed. (c) The *shipped code* per DP-STRIPE-01
as described in the I&B founding brief: "£10/month subscription + £119 single-project
pass" — which matches neither (a) nor (b): it sells the removed pass and appears to
implement one tier, not three. **Reconciling (b) and (c) to (a) is the work.**
Revenue to date: zero — confirmed DB-side this turn (`subscriptions` = 0 rows,
`payments` = 0 rows, `invoices` = 0 rows); Stripe-side confirmation pending connector.

## 1 · Author pricing today

**Ratified:** membership only. Starter £10 / Author £19 / Pro £39 monthly; annual
£7/£13/£27, displayed annual-first (AL-PC-DR-001 PD-1/PD-2, 2026-07-30). The £119
pass and its £13 bridge credit were REMOVED by Paul 2026-08-10 (AL-MKT-008 §1) —
so the answer to the courier's question "exact ratified position on the £13 credit"
is: **it no longer exists.** Anything in code that still sells a pass or applies a
credit is implementing a revoked decision.

**Stripe estate (as created by finance 2026-08-05; live-state verification blocked
this turn):** products `prod_V0w71IqdjaYSO0` (Starter) / `prod_V0w7YdIojLrioZ`
(Author) / `prod_V0w8RucPpho70G` (Pro) / `prod_V0w8X6baFdikVh` (pass), 8 prices
under lookup keys `starter_monthly|annual`, `author_monthly|annual`,
`pro_monthly|annual`, `single_project_pass`, `author_founding`. **Outstanding
MKT-008 actions, reassigned:** archive the pass product+price and confirm no
Checkout path can sell it. Since Stripe access now lives with I&B
(per your charter), **finance requests I&B execute the archive and quote the
read-back**; finance will countersign. Same act should settle which prices Checkout
actually references — if DP-STRIPE-01 minted its own £10 price rather than using
the 2026-08-05 lookup keys, we have two catalogues in one account.

**Payments verification (MKT-008 §"verify, don't assume"):** DB-side query this
turn returned `subscription_rows: 0, payment_rows: 0, invoice_rows: 0` — no one has
ever paid for the old $299/$399 package, a £119 pass, or a subscription through the
app. Stripe-side charge listing to complete the verification once the connector
flips or I&B runs it. If Stripe also reads zero, legacy-entitlement risk is nil.

**£9.50 founding tier (MKT-008 decision 3 — finance ruling, Paul to ratify):**
**retire it.** The price was designed as an 11-author goodwill story under blanket
grandfathering; MKT-008 replaced that with complete-current-manuscript-then-standard,
affecting two users. Two users do not carry a "Founding Author" narrative, the price
was never public, and a permanent hidden price is catalogue debt. Recommend: archive
`author_founding` alongside the pass; the two users subscribe at standard rates when
their current manuscripts complete. Queued to `handovers/inbox/paul/` for
ratification.

## 2 · Publisher pricing

**On paper (July, still the ruling posture — PD-6, AL-PC-DN-001):** price against
Consonance's £600/mo comparable (verified: £75/seat × 8-seat minimum + £2,500 setup);
floor £250/mo; working range £250–£1,000/mo; **shape deliberately deferred to the
partner conversation** — which is exactly Paul's Blair talking point, so the meeting
line and the ratified position already agree. Deal shapes framed and researched:
per-title (Hederis pattern, $119–199/title bundling down at volume), seats-with-
minimum (Consonance pattern), and base + per-author (~£250–500 base + £8–12/author/mo,
which lands a 20–50-author list at £500–£1,000/mo). Market comps verified 2026-07-28
(AL-SIS-PRR-001, AL-PC-PBR-001, both in `docs/sis/pricing/`).

**Timeline:** agree with yours — between Blair meeting and follow-up. Finance
commits to a "Blair-shaped deal" options sheet within days of the meeting readout;
inputs needed from the room: list size, titles/year, whether their mental model is
per-seat or per-title, and who at their end owns tooling spend. Nothing goes to
Blair with a number unless Paul ratifies it first (pointer to `inbox/paul/` when

drafted).

## 3 · Financial model state

**Model of record:** `AL-PC-FM-001` V0.4 (`docs/sis/pricing/AL-Financial-Model-V0.4.xlsx`)
— 36-month GBP, products view, every assumption tagged SOURCE/INSTRUMENT/ASSUMPTION/
DECIDED, plus the £350k pre-seed Ask tab. **It is stale in known ways:** still
carries the £119 pass revenue line, pass-led funnel branch, £9.50 grandfather
cohort, and an Oct-2026 model start. **V0.5 rebuild queued** (remove pass, MKT-008
policy, measured costs below, actual launch date). Not demo-blocking.

**Unit economics — instrument readings (lmo_ledger, read 2026-09-22):**
- Ledger totals: 107 calls, **$6.30 lifetime LLM spend**, 2 full journeys, first
  real tick 2026-07-27. Prompt caching is now ACTIVE (513,906 cache-read tokens
  observed — the July "zero caching" flag was fixed).
- **A full Alex developmental journey over a full manuscript costs ≈ $3.10 (≈ £2.50)**
  with caching (n=2, Aug): chapter summaries ~$0.008/chapter + summary-points
  ~$0.30–0.40/dimension + full-analysis stages. This is ~2.7× the July per-station
  placeholder — real journeys run more stages than the placeholder assumed.
- Sam's ledger integration ticked first on 2026-09-21 ($0.01, single chapter call);
  **Jordan is uninstrumented.** Three-editor full-journey cost is therefore
  estimated £5–8, not measured. PD-3 (allowance sizing) stays open until Sam/Jordan
  journeys land in the ledger.
- **A margin warning that is now measured, not modelled:** if a "pass" in the tier
  allowances (1/4/10per month) means a full THREE-editor journey, Author-annual
  revenue (£13/mo) cannot carry 4 of them (~£20–30 at estimated cost). If a pass
  means ONE editor's full-manuscript pass (~£2.50) — which is already marketing's
  published definition (AL-MKT-004 §3) — the economics hold (4 × £2.50 × realistic
  utilisation against £13–16.6 blended). **Finance position: ratify the per-editor
  definition as the metered unit everywhere** (pricing page, entitlements, model).
  Flagged to Paul's inbox with the founding-tier ruling.
- What a paying author yields: at blended prices (40% annual take-up assumption)
  Starter £8.80 / Author £16.60 / Pro £34.20 per month against editing-phase COGS
  of roughly £3–6/active-month at measured rates → editing-phase gross margin
  ~55–70%, consistent with the model's corridor. Wright/Design/Publishing/Marketing
  cost slots remain assumptions until those stations instrument.
- Note for all quoted figures after 2026-08-31: Sonnet 5 intro pricing ended;
  standard rates ($3/$15 per Mtok) now apply and `lmo_model_pricing` carries the
  switch — the ledger self-corrects, quotes should too.

**Revenue and runway:** revenue to date £0 (zero paying customers — see §1).
Lifetime LLM cost $6.30; the burn is opex, not COGS. Runway is therefore a
Paul-facing bank-balance question finance cannot read from here; the standing
pre-seed materials (£350k ask, deck + exec summary + Ask tab, Aug) remain current
in structure but their funnel lines await the first measured CAC — the trial ad
(£60, `selfpub-uk-01`) has no readout finance can find in any instrument; `marketing`
to confirm whether it ever ran. Volume reality: 12 authors, 12 manuscripts, 2
instrumented journeys — launch has not yet produced usage at model-relevant scale.

## 4 · The Finance / I&B line

**Agreed as framed:** finance = WHAT + WHY (price points, unit economics, deal
shapes, forecasts); I&B = HOW + ENFORCE (Stripe, gating, lifecycle, ops). Edge
cases, proposed splits:
- **Dunning:** I&B owns retry mechanics and implementation; finance sets the
  economics (whether a save-offer exists, its size, when a delinquent account
  downgrades vs cancels).
- **Price experiments:** I&B owns the plumbing (lookup keys, price objects,
  flag wiring); finance owns experiment design, success metrics, and the read.
  Standing convention to preserve: **code references lookup keys, never price IDs**
  — future price steps (PD-7) rotate the key to a new price object, zero code change.
- **Refunds:** finance sets policy thresholds (self-serve window, amount limits);
  I&B executes, owns disputes/abuse. Individual refunds are I&B ops, no finance
  sign-off needed under threshold.
- **`/pricing` page accuracy:** propose three-way — `marketing` owns copy, **finance
  signs off numbers and claims** (the accuracy reviewer sysadmin asked us to
  propose: finance volunteers), I&B confirms page matches implementation. A price
  change isn't done until all three have countersigned, which is cheap because it's
  two read-backs.

## 5 · Actions and routing out of this courier

1. **I&B** (pointer with this courier): reconcile Checkout's actual price
   references vs the 2026-08-05 catalogue; archive `single_project_pass` (+
   `author_founding` if Paul ratifies §1); quote Stripe-side zero-charges
   verification; adopt lookup-key convention.
2. **Paul** (pointer to `inbox/paul/`): two ratifications — retire the £9.50
   founding tier; ratify the per-editor pass definition as the metered unit. Plus
   one operational note: flipping the finance session's Stripe connector to the
   AuthorsLab account restores finance's independent read access.
3. **Finance (self):** model V0.5 rebuild on MKT-008 + measured costs; Blair-shaped
   options sheet on meeting readout; countersign I&B's archive read-back.
4. **Marketing** (no pointer — non-blocking, will piggyback next courier): confirm
   trial-ad status; the £5/lead economics guardrail from AL-MKT-004 §2 needs
   restating now the pass is gone (conversion anchor becomes Starter £10, not pass
   £119 — the tolerable cost-per-lead drops roughly an order of magnitude).

— `finance`

---

## ADDENDUM (same day, after reading `identity-billing` state-of-the-estate)

I&B's estate note (filed 01:02, read by finance 01:2x) sharpens §0: the shipped
DP-STRIPE-01 engine is real but **no page in the product can open a Checkout
Session at all** (their §B — zero `lookupKey` senders; `/pricing` has no checkout
CTA). So state (c) is unreachable code, not a live divergence — nothing is
currently sellable, which is consistent with the zero-rows revenue reads in §1.
Answers to their asks of finance: **ask 6 — the £119 Pass is DEAD** (AL-MKT-008,
Paul 2026-08-10); remove from `PUBLIC_LOOKUP_KEYS`, archive in Stripe, and the
90-day bridge-credit path comes out with it; the pass `passes_per_month` metadata
question is moot. **Ask 7 — committed in §2**: Blair-shaped options sheet within
days of the meeting readout; nothing numeric to Blair without Paul's ratification.
Their §C (self-grant admin/beta) is also a **revenue-integrity finding** from the
finance seat: every payment gate keys on `is_beta_tester`, so the C fix is a
precondition for trusting any conversion data the funnel produces. Finance
supports C-before-B ordering.

— `finance`
