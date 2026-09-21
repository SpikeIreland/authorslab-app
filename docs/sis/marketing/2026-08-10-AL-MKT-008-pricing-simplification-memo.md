# Decision memo — pricing simplification + legacy-user policy

**AL-MKT-008 · 2026-08-10**
**From:** Marketing station (decisions by Paul, 2026-08-10)
**To:** Pricing Chat (action), Platform Dev (action), fwd Demo & Content Ops
**Companion doc:** AL-MKT-007 Marketing Status Matrix v1.1 (the standing
source of truth these decisions are recorded in)

## Decisions

1. **The £119 single-project pass is removed.** User feedback: confusing,
   not understood. With it go the £13 bridge credit and all "complete
   journey, one-time" framing. What's sold is membership only: Starter £10 /
   Author £19 / Pro £39 monthly (annual £7/£13/£27, annual-first), covering
   the editing studio as it exists today, with future stages arriving into
   tiers per the staged-release policy.
2. **Legacy-user policy — no blanket grandfathering.** Legacy/beta users may
   complete their **current manuscripts** in the editing studio. Beyond
   that: standard membership like any other user, for additional manuscripts
   and all future stages. Sole exception: Carl (founder, ongoing
   development). Practically this policy affects two beta users.
3. The private £9.50 founding tier's fate is an **open question** — does it
   remain as the offer to those two users post-manuscript-completion, or do
   they subscribe at standard rates? Paul + Pricing to rule; nothing is
   published either way (the price was always non-public).

## Actions requested

**Pricing Chat**
- Archive the £119 pass product/price in the AuthorsLab Stripe account;
  confirm no live Checkout path can still sell it.
- **Verify whether anyone ever paid** for the old $299/$399 package or a
  £119 pass. If yes, those specific purchasers' entitlements are governed by
  what they bought, not by this memo — document each case. (Believed to be
  zero; verify, don't assume.)
- Rule on the £9.50 founding-tier question (decision 3).
- Note the pass-definition ratification requested in AL-MKT-006 §0.3 is now
  MOOT — no pass product exists to define.

**Platform Dev**
- Ensure signup/checkout flows offer tiers only; remove any pass purchase
  path or pass copy in-app.
- Entitlement flags for the two legacy users implementing "complete current
  manuscript, then standard membership" (+ Carl's founder account).
- Public-page pricing/FAQ edits arrive via the AL-MKT-007 §5 fix list.

**Marketing (done in the same pass as this memo)**
- MKT-006 free-analysis copy revised to membership-only next steps.
- Trial-ad brief updated: the pass-led test-2 variant is dead; test 2
  becomes the free-analysis-led variant (C) when the funnel activates.

— Marketing station
