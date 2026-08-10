-- ============================================================================
-- 20260805_billing_catalogue.sql
-- DP-STRIPE-01 · Billing catalogue rewire (Spike Island → AuthorsLab account).
--
-- Extends `subscriptions` with tier + Stripe catalogue linkage columns needed
-- for the four-tier model (starter / author / author_founding / pro) plus the
-- Single-Project Pass one-time product. Adds a `pass_purchases` table that
-- records each Pass sale so the checkout endpoint can apply a £13 credit if
-- an author later subscribes within 90 days.
--
-- Idempotent — safe to re-run.
-- Sources: docs/sis/pricing/AL-Stripe-Launch-Handover.md,
--          docs/sis/platform-dev/2026-08-05-DP-STRIPE-01-rewire-plan.md §3.
-- ============================================================================

-- 1. Drop the old enum constraint on plan_type if it exists; the new tier
--    space is 'starter' | 'author' | 'author_founding' | 'pro' | 'pass'.
--    plan_type is intentionally left in place (deprecated) so any residual
--    code references keep compiling; it will be removed in a later pass.
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
  ADD COLUMN IF NOT EXISTS current_period_passes_used int NOT NULL DEFAULT 0;

-- 3. Indexes for the webhook handler (stripe_subscription_id lookup) and the
--    entitlement API (latest active subscription per author).
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_idx
  ON public.subscriptions (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS subscriptions_author_active_idx
  ON public.subscriptions (author_id, status)
  WHERE status IN ('active', 'trialing');

-- 4. Pass tracking table — one row per Single-Project Pass purchase, used
--    for the 90-day credit lookup at subscription checkout.
--    stripe_checkout_session_id is UNIQUE so the webhook can safely
--    ON CONFLICT DO NOTHING on Stripe redelivery.
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

-- 5. RLS — authors read their own pass purchases; only service_role writes.
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

COMMENT ON COLUMN public.subscriptions.tier IS
  'starter | author | author_founding | pro. Sourced from Stripe product metadata.tier by the webhook.';
COMMENT ON COLUMN public.subscriptions.lookup_key IS
  'Stripe price lookup key (e.g. author_monthly). Code always references lookup keys, never price IDs.';
COMMENT ON COLUMN public.subscriptions.passes_included IS
  'Passes included per billing cycle (from product metadata.passes_per_month). NULL = unlimited.';
COMMENT ON COLUMN public.subscriptions.projects_allowed IS
  'Projects the author may keep concurrently (from product metadata.projects_allowed). NULL = unlimited.';
COMMENT ON COLUMN public.subscriptions.current_period_passes_used IS
  'Counter reset to 0 by the webhook on invoice.payment_succeeded (subscription_cycle). Read alongside lmo_ledger for the real meter; this is a hint.';
