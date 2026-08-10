# AuthorsLab Stripe — Launch Handover

**AL-PC-SH-001 · 2026-08-05 · AL Pricing Chat → SysAdmin (for launch items)**
New dedicated Stripe account **AuthorsLab** (`acct_1U0u4gEGeehw2YKO`), created
2026-08-05, replacing the Spike Island account for all AuthorsLab commerce.
Catalogue below created and verified **live** 2026-08-05 via API. Integration
architecture per the accepted Stripe implementation plan (hosted Checkout,
flat-rate Billing, hosted Customer Portal, Smart Retries; Dashboard invoicing
reserved for future imprint contracts).

## 1 · Catalogue (live, verified)

| Product | Product ID | Price | Lookup key | Price ID |
|---|---|---|---|---|
| AuthorsLab Starter (tier=starter, 1 pass/mo, 1 project) | `prod_V0w71IqdjaYSO0` | £10/mo | `starter_monthly` | `price_1U0uFyEGeehw2YKOyKpoE6EI` |
| | | £84/yr (£7/mo) | `starter_annual` | `price_1U0uG3EGeehw2YKOwAa74lYg` |
| AuthorsLab Author (tier=author, 4 passes/mo, unlimited projects) | `prod_V0w7YdIojLrioZ` | £19/mo | `author_monthly` | `price_1U0uGBEGeehw2YKOG4feDwEz` |
| | | £156/yr (£13/mo) | `author_annual` | `price_1U0uGGEGeehw2YKO4levtGkA` |
| | | £9.50/mo — **not public** | `author_founding` | `price_1U0uGdEGeehw2YKOJOrETaRF` |
| AuthorsLab Pro (tier=pro, 10 passes/mo, unlimited projects) | `prod_V0w8RucPpho70G` | £39/mo | `pro_monthly` | `price_1U0uGMEGeehw2YKOy22NCeMN` |
| | | £324/yr (£27/mo) | `pro_annual` | `price_1U0uGREGeehw2YKOzRh0wZbF` |
| AuthorsLab Single-Project Pass (one-time) | `prod_V0w8X6baFdikVh` | £119 one-time | `single_project_pass` | `price_1U0uGXEGeehw2YKOdyx4xL4j` |

Conventions: **site code references lookup keys, never price IDs** — future
price steps (PD-7) create new prices and move the lookup key, zero code
change. Product metadata (`tier`, `passes_per_month`, `projects_allowed`)
is the machine-readable tier map for entitlement sync. `author_founding` is
the Founding Author price (PD-5): subscribe the 11 beta authors to it
directly; it must never appear on the public pricing page.

## 2 · Wiring (code-side — platform chat)

1. **Environment:** swap Stripe keys to the new account (dashboard →
   Developers → API keys). Old Spike Island keys stay valid for that
   account's history only.
2. **Checkout:** create Checkout Sessions in `subscription` mode with the
   price resolved by lookup key (`/v1/prices?lookup_keys[]=author_monthly`);
   `payment` mode for `single_project_pass`. Success/cancel URLs to the
   dashboard.
3. **Webhooks:** new endpoint registration + signing secret on the NEW
   account. Minimum events: `checkout.session.completed`,
   `customer.subscription.created/updated/deleted`,
   `invoice.payment_failed`. Handler syncs tier + status to Supabase
   `subscriptions` (tier from the price's product metadata).
4. **Pass credit mechanic (PD-4):** on subscription checkout within 90 days
   of a `single_project_pass` purchase, apply a one-off £13 credit
   (customer balance credit or single-use coupon at session creation).
   App-side lookup of the pass purchase date; Stripe just carries the credit.
5. **Entitlement display:** dashboard shows passes used vs
   `passes_per_month` (count from lmo_ledger) and projects vs
   `projects_allowed`. Launch-blocking per pricing chat: don't sell a
   metered plan without showing the meter.

## 3 · Dashboard settings (no-code — anyone with access)

- **Business profile / verification:** complete KYC + payout bank account
  FIRST — payouts blocked until verified; charges may also be limited.
- **Branding:** logo, brand colour (Manuscript Room palette), statement
  descriptor `AUTHORSLAB`, support email.
- **Customer Portal:** enable; allow cancel + plan switch among the six
  public prices (exclude `author_founding` from switch options).
- **Revenue recovery:** enable Smart Retries, automatic card updates,
  dunning emails.
- **Receipts:** enable email receipts for payments and refunds.
- **Payment methods:** cards + Link + Apple Pay + Google Pay.
- **Tax:** deferred deliberately — route UK VAT / overseas digital-services
  question to accountant; Stripe Tax can be enabled later without
  catalogue changes. (Flagged, not advice.)

## 4 · Spike Island account clean-up

Archive (do NOT delete) AuthorsLab-related products/prices in the Spike
Island account. Keep the account open: refunds on historical $299 purchases
must be issued from the account that took payment. No subscription
migration exists — Supabase `subscriptions`/`payments` are empty; the 11
beta authors were never on Stripe recurring billing.

## 5 · Launch checklist (pricing-chat view, for absorption into launch items)

1. ☐ KYC/verification complete on new account (payout-blocking)
2. ☑ Catalogue created and verified (this note)
3. ☐ Keys + webhooks swapped to new account; end-to-end live test purchase
   (£10 Starter monthly, then refund + cancel) before public traffic
4. ☐ Customer Portal + Smart Retries + branding configured (§3)
5. ☐ Founding Author announcement sent BEFORE public pricing switch
   (Paul has the announcement) and 11 beta authors subscribed to
   `author_founding`
6. ☐ Free Manuscript Analysis workflow ACTIVATED in production (funnel top;
   currently inactive per AL-PDC-FM-NOTE-001 §7)
7. ☐ Pricing page truth fix: "coming soon" labels on cover design /
   publishing prep / launch planning (held-back products)
8. ☐ Dashboard shows plan meter (passes used / included)

— AL Pricing Chat
