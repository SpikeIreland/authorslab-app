# Marketing chat — pricing launch note

**AL-PDC-MKT-PRICING-001 · 2026-08-05**
**From:** Platform Developer station
**To:** Marketing station chat (via Paul as courier)
**Re:** New Stripe catalogue is live — pricing is now decided and concrete. Copy, ads, and landing-page work can proceed against real numbers.

## 1 · What changed

Pricing Chat has published the final tier structure and created the corresponding Stripe products/prices on a brand-new dedicated `AuthorsLab` account (replacing the old Spike Island account). Everything is verified live as of 2026-08-05.

Full details in `docs/sis/pricing/AL-Stripe-Launch-Handover.md`. This memo pulls out only what Marketing needs.

## 2 · The tier structure Marketing writes against

All prices in **£ GBP**. UK-oriented (see §5 for expansion considerations).

| Tier | Monthly | Annual (effective /mo) | Passes/mo | Projects |
|---|---|---|---|---|
| **Starter** | £10 | £84/yr (£7) | 1 | 1 |
| **Author** | £19 | £156/yr (£13) | 4 | unlimited |
| **Pro** | £39 | £324/yr (£27) | 10 | unlimited |
| **Single-Project Pass** | £119 one-time | — | 1 (this project) | 1 |

**Plus a special not-public price:** `author_founding` £9.50/mo — reserved for 11 beta authors as a founding-supporter recognition. **Never publish this. Do not reference in ads.** It exists as a private tier; Marketing should be aware it exists (so no one accidentally advertises "everyone gets £9.50") but never surface it.

## 3 · Marketing implications

**Positioning wins now possible:**

- **A "pass" pricing model exists** — for authors who want to try before subscribing. £119 buys one full journey on one project. This is a genuine low-commitment entry point. Worth leading with in ads targeting authors who might be scared of a subscription commitment. ("Try AuthorsLab on one book — £119, no monthly fees.")
- **Pass-to-subscription bridge (£13 credit within 90 days)** — this is a *sequential purchase mechanic* that Marketing can use in messaging. Pass first, subscribe later with credit. Reduces the "did I make the right choice" friction.
- **Annual pricing is meaningfully cheaper** — Author monthly is £19 but annual is £13/mo equivalent (32% saving). Worth leading with in copy that's targeting committed authors.
- **Starter as an intro tier** — £10 gets you in with 1 pass/mo on 1 project. Good ad-target for "just poking around" authors.
- **Pro for prolific writers** — 10 passes, unlimited projects, £39/mo. Marketing narrative: "if you write more than four books a year, this pays for itself."

**Positioning constraints:**

- **1 "pass" = 1 editing pass** through an editor (Alex full-manuscript analysis, Sam pass, or Jordan pass). Pass consumption is derived from the LMO ledger. Marketing needs to be clear about what a pass IS (a full journey through one editor for one manuscript, roughly) so authors can self-select the right tier.
- **Coming-soon labels are load-bearing.** The Pricing Chat's launch checklist item 7 explicitly says: "Pricing page truth fix: 'coming soon' labels on cover design / publishing prep / launch planning (held-back products)." **Ads and landing copy must NOT imply cover design, publishing, marketing tools are live yet.** The MVP is editing. Say editing. Roadmap the rest.
- **£ pricing = UK primary market first.** Ad targeting, currency in ad copy, and landing page pricing display should all be UK-first. Non-UK visitors get UK prices for now (multi-currency is a later decision).

## 4 · The Free Manuscript Analysis funnel — decision needed

The lead-gen path (a stranger submits a manuscript, gets a free assessment from Alex) is currently INACTIVE per prior notes. The Pricing Chat's launch checklist item 6 says: **activate it for MVP launch as the funnel top.**

**Marketing needs to decide:**
- Is this the primary top-of-funnel? (My default assumption: yes — huge conversion advantage over cold ads)
- What's the qualification/value proposition? ("Get a professional AI developmental assessment on the first 3 chapters, free")
- What's the conversion path from free-analysis result to Starter/Pass purchase?
- What's the cost per free lead we're willing to absorb? (Free analyses burn LLM credits — modest per unit but real at scale)

If yes to activation, Platform Dev queues it up in the R1 work.

## 5 · Open pricing/marketing questions

Not urgent for MVP launch but worth flagging for Marketing to think about:

- **Multi-currency support** — when do we introduce USD, EUR? What's the trigger?
- **Educational / student pricing** — many authors are hobbyists or students, is there a discount tier worth building?
- **Referral / affiliate mechanic** — no infrastructure for this yet, but the pass-to-subscription bridge model would extend naturally to referral credits
- **Publisher tier** — a separate revenue axis (Jacky imprint = 20-50 authors kind of contract) — Financial Model chat's territory but Marketing may want to think about the messaging when that surfaces
- **Founding Author narrative** — the £9.50 secret price exists as a founding-supporter recognition. Marketing might use this as a *narrative device* in future ("here's what our earliest supporters got — and we're building for you next") without ever publishing the price. Not a Day 1 concern, but worth remembering the mechanic exists.

## 6 · Coordination

- **Platform Dev** — Stripe wiring in progress; will confirm when Checkout, webhooks, and entitlement display are live. Provides real per-tier cost data from LMO ledger when Marketing needs it for ROI messaging.
- **UI/UX Design** — `/pricing` page copy needs update to reflect the new tier structure. Marketing should brief UI/UX on the messaging and let UI/UX execute the visuals.
- **Pricing Chat** — source of truth for pricing decisions. Any change proposal (a promo, a discount code, a temporary offer) coordinates through them.
- **Demo & Content Ops** — needs to know pricing for the Jacky demo (a publisher will absolutely ask about author pricing during any conversation about a publisher deal).

## 7 · Reference

- `docs/sis/pricing/AL-Stripe-Launch-Handover.md` — the source doc from Pricing Chat, with lookup keys, price IDs, and all launch items
- `docs/sis/platform-dev/2026-07-30-R1-mvp-launch-checklist.md` §3 — how the pricing decision folds into the R1 launch checklist
- `docs/sis/platform-dev/2026-07-30-marketing-chat-seed.md` — original seed for this chat

— Platform Developer station
