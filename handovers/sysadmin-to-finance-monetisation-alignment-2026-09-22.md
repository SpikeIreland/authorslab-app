# SysAdmin → Finance — Monetisation alignment (state disclosure request)

**From:** `sysadmin` (via Paul) · **To:** `finance` · **cc:** `identity-billing` · **Date:** 2026-09-22 · **Status:** alignment request. Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1` (V1.1), `PUSH-CEREMONY-V1` first if you haven't.

## Why

Two things happened in the last 48 hours that raise the salience of monetisation:

1. **Publisher becomes a first-class audience** — the Publisher's Journey chat was chartered 2026-09-21; the Blair Partnership meeting on Wednesday is our first live conversation with a real publisher. Paul's talking point on publisher pricing will be *"we're shaping it around each partner's model, happy to walk through what a Blair-shaped deal might look like"* — deliberately no number in the room. But post-meeting, we'll need one.
2. **Identity-Billing (I&B) chat was chartered 2026-09-22** to own identity, Stripe integration, plan gating, and billing ops. Clean line with you: **you decide *what* to charge and *why*; I&B decides *how* to charge and enforce.** I&B needs your model to implement against.

Paul flagged directly in this turn: *"I don't think it's very clear how we monetise the platform right now."* That's the ask underneath this courier.

## What we need from you

A **state-of-monetisation** courier back to `sysadmin`, cc'd to `identity-billing`, covering:

1. **Author pricing today (ratified vs draft):**
   - What did DP-STRIPE-01 (tasks #87-88) actually ship into production? £10/month subscription and £119 single-project pass — confirmed live? Any other price points wired?
   - What's the exact ratified position on the £13 credit toward first month for a pass buyer who subscribes within 90 days?
   - Any pricing not in the code but sitting in a draft doc that you consider ratified in principle?

2. **Publisher pricing thinking:**
   - Anything on paper? Ballpark ranges, deal shapes, revenue-share models, per-writer/per-imprint/per-seat concepts?
   - If nothing yet: when should we develop it? The clock is *between Blair-meeting and follow-up conversation*, not urgent this week.
   - Any historical precedent to draw on (Clarence's publisher billing, market comps)?

3. **Financial model state:**
   - Current unit economics — what does an author cost us at each stage (Wright, Alex, Sam, Jordan, Design, Publishing, Marketing)? What does a paying author yield?
   - Cash runway sanity — this is Paul-facing, not customer-facing, but worth naming.
   - Anything that's changed since MKT-004 (the pricing simplification memo — `docs/sis/marketing/2026-08-10-AL-MKT-008-pricing-simplification-memo.md`)?

4. **The Finance / I&B line, from your side:**
   - Do you agree with the split as I've framed it (you=WHAT+WHY, I&B=HOW+ENFORCE)?
   - Any edge cases where the line blurs (e.g., dunning strategy, price-experiment plumbing, refund policy)?
   - Ownership of the `/pricing` marketing page copy — that's `marketing`'s, but they need someone to review pricing accuracy; propose who owns that.

## Constraints

- **Not demo-blocking.** Paul isn't disclosing publisher pricing at Blair.
- **Not asking for a full model rewrite** — a state-of-play summary is what unblocks the next round. Iterate from there.
- **Timeframe:** a first-take back within the next 2-3 turns of the Finance chat's own cadence. If you need more from anywhere (sysadmin, marketing, historical docs) to answer, name it as a follow-on pointer rather than blocking.

## Coordination

Per Courier Convention V1.1: your reply is a canonical courier back to `sysadmin`, cc pointer to `identity-billing/`. If any specific number requires Paul's ratification before being said out loud, that goes as a pointer to `handovers/inbox/paul/`.

## First-turn instructions (from your inbox)

1. Read this brief.
2. Assemble the state-of-monetisation reply as a canonical courier. File it, drop pointers to `sysadmin` and `identity-billing` inboxes.
3. Delete this pointer when the reply is filed.

— `sysadmin`
