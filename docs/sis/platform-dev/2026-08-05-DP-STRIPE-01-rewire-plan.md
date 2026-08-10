# DP-STRIPE-01 · Stripe billing rewire — implementation plan

**AL-PDC-STRIPE-01-PLAN · 2026-08-05**
**From:** Platform Developer station
**Status:** Draft plan for Paul's greenlight before execution
**Sources:** `docs/sis/pricing/AL-Stripe-Launch-Handover.md` (pricing catalogue), `docs/sis/platform-dev/2026-07-30-R1-mvp-launch-checklist.md` §3 (launch gates)

## 1 · Current state (before rewire)

Three files carry the billing surface today, all pre-pivot:

- **`src/app/api/create-checkout/route.ts`** (50 lines) — hardcoded `price_data` inline, USD $299 one-time, single "three-phase" package, no subscription mode, no lookup keys
- **`src/app/api/webhooks/stripe/route.ts`** (109 lines) — handles only `checkout.session.completed`, three obsolete package types ("three-phase" / "publishing" / "marketing"), no subscription lifecycle events, no failure events, `plan_type: 'pay_per_manuscript'` in inserts
- **`src/app/checkout/page.tsx`** (204 lines) — pricing/checkout initiation, still built around the single-package model

Supabase `subscriptions` table type has `plan_type: 'free' | 'basic' | 'professional' | 'enterprise'` (wrong tier names). Per Pricing Chat handover, `subscriptions` and `payments` are empty in production — no data migration needed, we can restructure freely.

Env vars in use: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Both currently point at the OLD Spike Island Stripe account.

## 2 · Target state (after rewire)

- Env vars point at the new AuthorsLab account (`acct_1U0u4gEGeehw2YKO`)
- Checkout resolves prices via lookup keys (`starter_monthly`, `author_monthly`, `pro_annual`, `single_project_pass`, etc.) so future price changes are zero-code
- Checkout picks `subscription` mode for recurring tiers, `payment` mode for the Pass
- Webhook handles the full event set: `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `invoice.payment_failed`
- Subscription rows carry the tier + Stripe product metadata (`passes_included`, `projects_allowed`)
- **Pass-credit mechanic**: if an author has bought a Single-Project Pass within the last 90 days, subscribing to any tier applies a £13 credit
- **Entitlement API**: dashboard can query passes-used-this-period (from LMO ledger) vs passes-included (from tier), and project count vs projects-allowed
- Founding tier (`author_founding`) never surfaces on the public pricing page or Customer Portal switch options

## 3 · Schema migration

New migration: `sql/migrations/20260805_billing_catalogue.sql`

Idempotent, extends `subscriptions` with columns needed for the tier model. Keeps the existing base structure since it's empty.

```sql
-- Idempotent; safe to re-run.

-- 1. Drop the old enum constraint on plan_type if it exists; the new tier
--    space is 'starter' | 'author' | 'author_founding' | 'pro' | 'pass'.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- 2. Add new columns capturing the Stripe catalogue linkage.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS stripe_product_id text,
  ADD COLUMN IF NOT EXISTS lookup_key text,
  ADD COLUMN IF NOT EXISTS passes_included int,
  ADD COLUMN IF NOT EXISTS projects_allowed int,
  ADD COLUMN IF NOT EXISTS current_period_passes_used int DEFAULT 0;

-- 3. Index for quick lookup by Stripe subscription ID (webhook handler).
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_idx
  ON public.subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS subscriptions_author_active_idx
  ON public.subscriptions (author_id, status)
  WHERE status IN ('active', 'trialing');

-- 4. Pass tracking table — one row per Single-Project Pass purchase, used
--    for the 90-day credit lookup at subscription checkout.
CREATE TABLE IF NOT EXISTS public.pass_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.author_profiles(id) ON DELETE CASCADE,
  stripe_checkout_session_id text NOT NULL UNIQUE,
  stripe_payment_intent_id text,
  manuscript_id uuid REFERENCES public.manuscripts(id) ON DELETE SET NULL,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'gbp',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  credit_applied_to_subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  credit_applied_at timestamptz
);

CREATE INDEX IF NOT EXISTS pass_purchases_author_purchased_idx
  ON public.pass_purchases (author_id, purchased_at DESC);

ALTER TABLE public.pass_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pass_purchases: author select" ON public.pass_purchases;
CREATE POLICY "pass_purchases: author select"
  ON public.pass_purchases FOR SELECT TO authenticated
  USING (
    author_id IN (SELECT id FROM public.author_profiles WHERE auth_user_id = auth.uid())
    OR public.is_admin()
  );
-- No INSERT/UPDATE/DELETE policies for authenticated users — only the webhook
-- (via service_role) writes to this table.

COMMENT ON TABLE public.pass_purchases IS
  'One row per Single-Project Pass purchase. The webhook writes on payment success; the checkout endpoint reads within the last 90 days to determine if a £13 credit should apply to a new subscription. credit_applied_to_subscription_id + credit_applied_at ensure each pass credits at most one subscription.';
```

## 4 · Code refactor — file by file

### 4.1 · `src/app/api/create-checkout/route.ts` — full rewrite

New shape: accepts `{ lookupKey, authorId, manuscriptId? }`, resolves the price, chooses mode, applies pass credit if applicable.

```typescript
// Signature (approximate)
POST /api/create-checkout
  body: { lookupKey: string, authorId: string, manuscriptId?: string }
  ->  { url: string }  |  { error: string }
```

Behaviour:

1. Verify author exists in `author_profiles`
2. Resolve the price: `stripe.prices.list({ lookup_keys: [lookupKey], expand: ['data.product'] })`
3. Read product metadata: `tier`, `passes_per_month` (or `passes_included` for the Pass), `projects_allowed`
4. Determine mode: `single_project_pass` → `payment`; all others → `subscription`
5. **If mode = subscription**: check `pass_purchases` for author within last 90 days where `credit_applied_at IS NULL`. If found, add `discounts: [{ coupon: <£13_coupon_id> }]` OR use a Stripe promotion code. **Design note**: the cleanest approach is a permanent `£13_pass_bridge` coupon in Stripe (13.00 GBP off first invoice) that we apply conditionally. Setup TBD in Stripe dashboard — I'll flag as a Paul-action.
6. Create checkout session with `client_reference_id = authorId`, `metadata = { author_id, lookup_key, tier, manuscript_id? }`
7. Return the session URL

Refuses to create a checkout for `author_founding` unless a special flag is set (protects against accidental public exposure of the £9.50 price).

### 4.2 · `src/app/api/webhooks/stripe/route.ts` — full rewrite

Handles the six-event set. Each event branch is small and focused.

```typescript
switch (event.type) {
  case 'checkout.session.completed': handleCheckoutCompleted(session); break
  case 'customer.subscription.created':  handleSubscriptionCreated(subscription); break
  case 'customer.subscription.updated':  handleSubscriptionUpdated(subscription); break
  case 'customer.subscription.deleted':  handleSubscriptionDeleted(subscription); break
  case 'invoice.payment_failed':         handlePaymentFailed(invoice); break
  case 'invoice.payment_succeeded':      handlePaymentSucceeded(invoice); break
}
```

**`handleCheckoutCompleted`** — routes by session.mode:
- `payment` mode + `single_project_pass` metadata → insert `pass_purchases` row + `payments` row
- `subscription` mode → wait for the sibling `customer.subscription.created` to do the row creation (avoids race). Also: if the checkout used a pass-bridge discount, mark the source `pass_purchases` row's `credit_applied_at`.

**`handleSubscriptionCreated`** — resolves the price → product, reads metadata, inserts `subscriptions` row with `tier`, `passes_included`, `projects_allowed`, etc.

**`handleSubscriptionUpdated`** — updates `status`, period dates, and tier if the customer switched via Portal.

**`handleSubscriptionDeleted`** — sets `status='canceled'`, `canceled_at=now()`.

**`handlePaymentFailed`** — sets `status='payment_failed'` on the linked subscription.

**`handlePaymentSucceeded`** — resets `current_period_passes_used` to 0 at the start of a new billing period (invoice paid = new period begins).

### 4.3 · `src/app/checkout/page.tsx` — refactor

Currently a "click to buy" page with one product. Needs to expose the four public tiers with monthly/annual toggle + the Pass. Marketing chat is drafting the `/pricing` page copy but this file might be the same or different — verify. If it's the actual buy button page, restructure to:

- Show 3 tier cards (Starter / Author / Pro) with monthly/annual toggle
- Show 1 Pass card
- Each card has a "Choose plan" button that calls `POST /api/create-checkout` with the corresponding lookup key
- Founding tier absent
- After decision on how Marketing's `/pricing` copy pass integrates, this may consolidate

**Recommendation**: leave `/checkout` as-is for now, build the tier-selection UI on the actual `/pricing` page (which Marketing owns). `/checkout` becomes the confirmation-in-flight page or gets absorbed.

### 4.4 · New: `src/app/api/subscription/entitlement/route.ts`

Simple GET endpoint returning the current author's entitlement state:

```json
{
  "tier": "author",
  "status": "active",
  "period_end": "2026-09-05T...",
  "passes_included": 4,
  "passes_used_this_period": 2,
  "passes_remaining": 2,
  "projects_allowed": null,   // null = unlimited
  "projects_count": 3,
  "has_recent_pass_purchase": false,
  "pass_bridge_credit_eligible": false
}
```

`passes_used_this_period` computed from LMO ledger: `SELECT count(*) FROM lmo_ledger WHERE station_id IN ('alex.full-manuscript-analysis', 'sam.full-manuscript-analysis', 'jordan.full-manuscript-analysis') AND author_id = ? AND created_at BETWEEN current_period_start AND now()`.

### 4.5 · New: `src/lib/stripe-catalogue.ts`

Small module exporting the tier map + helper types. Keeps lookup key strings consistent across code (checkout, webhook, entitlement display, UI).

```typescript
export const LOOKUP_KEYS = {
  STARTER_MONTHLY: 'starter_monthly',
  STARTER_ANNUAL: 'starter_annual',
  AUTHOR_MONTHLY: 'author_monthly',
  AUTHOR_ANNUAL: 'author_annual',
  AUTHOR_FOUNDING: 'author_founding', // NEVER public
  PRO_MONTHLY: 'pro_monthly',
  PRO_ANNUAL: 'pro_annual',
  SINGLE_PROJECT_PASS: 'single_project_pass',
} as const

export const PUBLIC_LOOKUP_KEYS = [
  LOOKUP_KEYS.STARTER_MONTHLY, LOOKUP_KEYS.STARTER_ANNUAL,
  LOOKUP_KEYS.AUTHOR_MONTHLY, LOOKUP_KEYS.AUTHOR_ANNUAL,
  LOOKUP_KEYS.PRO_MONTHLY, LOOKUP_KEYS.PRO_ANNUAL,
  LOOKUP_KEYS.SINGLE_PROJECT_PASS,
]

// Helper: from product metadata, return the tier map + limits
export function readProductMetadata(product: Stripe.Product): {
  tier: string, passes_included: number | null, projects_allowed: number | null
}
```

### 4.6 · `src/types/database.ts` — update Subscription interface

Reflect the new columns; leave old-shape references as deprecated for a release cycle.

## 5 · Paul-side actions before this can be live-tested

Cannot be worked around; these gate the smoke test only, not the code work:

1. **Complete KYC on new AuthorsLab Stripe account** (payout blocker; also may limit charges until verified)
2. **Register a webhook endpoint** on the new account: `https://authorslab.ai/api/webhooks/stripe`, minimum event set:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
3. **Copy the webhook signing secret** into Vercel as `STRIPE_WEBHOOK_SECRET` (production env)
4. **Swap `STRIPE_SECRET_KEY`** in Vercel to the new account's secret key (production env)
5. **Create the `£13_pass_bridge` coupon** in the Stripe dashboard: 13.00 GBP off, one-time. Note its coupon ID — pass to me for hardcoding in the checkout code.
6. **Configure Customer Portal** with cancel + plan-switch enabled among the six public prices (exclude `author_founding`) — per Pricing Chat handover §3
7. **Enable Smart Retries, automatic card updates, dunning emails** — per handover §3
8. **Set branding** (Manuscript Room palette, statement descriptor `AUTHORSLAB`, support email) — per handover §3

## 6 · Suggested execution order (my side, ~1-2 days total)

1. Write and hand you `20260805_billing_catalogue.sql` for you to apply
2. Create `src/lib/stripe-catalogue.ts`
3. Rewrite `create-checkout/route.ts`
4. Rewrite `webhooks/stripe/route.ts`
5. Build `api/subscription/entitlement/route.ts`
6. Update `src/types/database.ts`
7. TypeScript + ESLint verify

Entitlement DISPLAY UI (the actual card in the app showing "3 of 4 passes used") is a UI change I'd defer to a follow-up — the entitlement API is what unblocks other work, and a proper UI belongs in a UI/UX-designed panel. **Recommend**: build API now, brief UI/UX for the display panel post-launch.

`/pricing` and `/checkout` page changes I'd hold until Marketing's `/pricing` copy lands and we know the buy-button placement. **Recommend**: coordinate with Marketing before touching those pages.

## 7 · Smoke test plan (once Paul's actions land)

1. Vercel test env vars pointed at new account
2. Test-mode checkout: buy Starter monthly with test card — assert 200 status codes, subscription row created with `tier=starter`, `passes_included=1`
3. Test-mode Portal cancel — assert `status=canceled`, `canceled_at` set
4. Test-mode Pass purchase then subscription within 90-day window — assert £13 credit applies, `pass_purchases.credit_applied_at` set
5. Failed-payment simulation — assert `status=payment_failed`
6. Then flip env to LIVE keys, one real £10 Starter purchase, refund + cancel

## 8 · What I need from Paul to start

Just a greenlight on this plan shape. Specifically:

1. **Confirm the entitlement UI can be a follow-up** (build API now, panel later)
2. **Confirm `/pricing` and `/checkout` page changes wait for Marketing's copy pass**
3. **Confirm the `pass_purchases` table shape** — do you want additional fields (source, referral, etc.) or is this minimal set fine?
4. **Green-light the SQL migration approach** — augment `subscriptions` in place, add new `pass_purchases` table

Once you confirm, I execute — probably as one focused subagent pass with clear boundaries. Estimate: 1-2 days total from greenlight to smoke-test-ready.

— Platform Developer station
