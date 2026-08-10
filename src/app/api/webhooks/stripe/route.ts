/**
 * POST /api/webhooks/stripe
 *
 * Six-event Stripe webhook handler for the AuthorsLab billing rewire:
 *   checkout.session.completed
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_failed
 *   invoice.payment_succeeded
 *
 * Idempotency:
 *   - `pass_purchases.stripe_checkout_session_id` is UNIQUE — ON CONFLICT
 *     DO NOTHING guards Stripe redeliveries.
 *   - `subscriptions.stripe_subscription_id` is checked before insert.
 *
 * Uses the Supabase service_role client (bypasses RLS) — the webhook is
 * the only writer for `pass_purchases` and `subscriptions`.
 *
 * DP-STRIPE-01 · see docs/sis/platform-dev/2026-08-05-DP-STRIPE-01-rewire-plan.md §4.2
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { track as trackServer } from '@vercel/analytics/server'
import { readProductMetadata } from '@/lib/stripe-catalogue'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[stripe-webhook] signature verification failed:', message)
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  console.log(`[stripe-webhook] received event=${event.type} id=${event.id}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`[stripe-webhook] ignoring event=${event.type}`)
    }
  } catch (err) {
    // Log but still 200 back — the webhook signature validated; retrying
    // won't help most errors. Investigate via the log line.
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[stripe-webhook] handler threw for event=${event.type}:`, message)
  }

  return NextResponse.json({ received: true })
}

// ---------------------------------------------------------------------------
// checkout.session.completed
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const authorId = session.client_reference_id ?? session.metadata?.author_id ?? null
  const lookupKey = session.metadata?.lookup_key ?? null
  const manuscriptId = session.metadata?.manuscript_id ?? null

  console.log(
    `[stripe-webhook] checkout.completed session=${session.id} mode=${session.mode} author=${authorId} lookup=${lookupKey}`,
  )

  if (!authorId) {
    console.warn(`[stripe-webhook] checkout.completed missing author_id — session=${session.id}`)
    return
  }

  if (session.mode === 'payment' && lookupKey === 'single_project_pass') {
    // Record the Pass purchase (idempotent on stripe_checkout_session_id).
    const passRow = {
      author_id: authorId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      manuscript_id: manuscriptId,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'gbp',
    }

    const { error: passError } = await supabase
      .from('pass_purchases')
      .upsert(passRow, { onConflict: 'stripe_checkout_session_id', ignoreDuplicates: true })

    if (passError) {
      console.error('[stripe-webhook] pass_purchases insert failed:', passError.message)
    } else {
      console.log(`[stripe-webhook] recorded pass purchase session=${session.id}`)
    }

    // Also record on the general payments ledger.
    const { error: payError } = await supabase.from('payments').insert({
      author_id: authorId,
      manuscript_id: manuscriptId,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? 'gbp',
      payment_type: 'one_time',
      stripe_payment_intent_id: passRow.stripe_payment_intent_id,
      status: 'succeeded',
      succeeded_at: new Date().toISOString(),
    })
    if (payError) {
      console.warn('[stripe-webhook] payments insert failed (non-fatal):', payError.message)
    }
    return
  }

  if (session.mode === 'subscription') {
    // Subscription rows are written by customer.subscription.created to
    // avoid a race with this event. Here we only consume the pass-bridge
    // credit if one was applied.
    const discountApplied = (session.total_details?.amount_discount ?? 0) > 0
    const bridgePassId = session.metadata?.pass_bridge_purchase_id
    if (discountApplied && bridgePassId) {
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? null

      const { data: subRow } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', subscriptionId ?? '')
        .maybeSingle()

      const { error: updError } = await supabase
        .from('pass_purchases')
        .update({
          credit_applied_at: new Date().toISOString(),
          credit_applied_to_subscription_id: subRow?.id ?? null,
        })
        .eq('id', bridgePassId)
        .is('credit_applied_at', null)

      if (updError) {
        console.warn('[stripe-webhook] pass credit-apply failed:', updError.message)
      } else {
        console.log(
          `[stripe-webhook] pass credit applied purchase=${bridgePassId} → sub=${subscriptionId}`,
        )
      }
    }
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.created
// ---------------------------------------------------------------------------

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(
    `[stripe-webhook] subscription.created id=${subscription.id} status=${subscription.status}`,
  )

  // Idempotent skip if row already exists.
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()
  if (existing) {
    console.log(`[stripe-webhook] subscription row already exists for ${subscription.id}, skipping insert`)
    return
  }

  const authorId = await resolveAuthorId(subscription)
  if (!authorId) {
    console.warn(
      `[stripe-webhook] subscription.created could not resolve author_id sub=${subscription.id} customer=${subscription.customer}`,
    )
    return
  }

  const meta = await readSubscriptionMetadata(subscription)
  const periods = readSubscriptionPeriods(subscription)

  const row = {
    author_id: authorId,
    tier: meta.tier,
    stripe_customer_id:
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: meta.priceId,
    stripe_product_id: meta.productId,
    lookup_key: meta.lookupKey,
    passes_included: meta.passes_included,
    projects_allowed: meta.projects_allowed,
    status: normaliseStatus(subscription.status),
    current_period_start: periods.start,
    current_period_end: periods.end,
    current_period_passes_used: 0,
    manuscripts_used: 0,
  }

  const { error } = await supabase.from('subscriptions').insert(row)
  if (error) {
    console.error(`[stripe-webhook] subscriptions insert failed for ${subscription.id}:`, error.message)
  } else {
    console.log(
      `[stripe-webhook] subscription row created author=${authorId} tier=${meta.tier} lookup=${meta.lookupKey}`,
    )
    // MKT-004 Ask 3: fire subscription_started server-side via
    // @vercel/analytics/server (webhook has no window/client context).
    try {
      await trackServer('subscription_started', {
        tier: meta.tier ?? null,
        lookup_key: meta.lookupKey ?? null,
        author_id: authorId,
      })
    } catch (trackErr) {
      console.warn('[stripe-webhook] trackServer(subscription_started) failed:', trackErr)
    }
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.updated
// ---------------------------------------------------------------------------

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(
    `[stripe-webhook] subscription.updated id=${subscription.id} status=${subscription.status}`,
  )

  const meta = await readSubscriptionMetadata(subscription)
  const periods = readSubscriptionPeriods(subscription)

  const update: Record<string, unknown> = {
    status: normaliseStatus(subscription.status),
    current_period_start: periods.start,
    current_period_end: periods.end,
    // Tier / limits may have changed via Customer Portal switch.
    tier: meta.tier,
    stripe_price_id: meta.priceId,
    stripe_product_id: meta.productId,
    lookup_key: meta.lookupKey,
    passes_included: meta.passes_included,
    projects_allowed: meta.projects_allowed,
  }

  if (subscription.cancel_at_period_end) {
    update.canceled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(update)
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error(`[stripe-webhook] subscription update failed for ${subscription.id}:`, error.message)
  }
}

// ---------------------------------------------------------------------------
// customer.subscription.deleted
// ---------------------------------------------------------------------------

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[stripe-webhook] subscription.deleted id=${subscription.id}`)
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id)
  if (error) {
    console.error(`[stripe-webhook] subscription delete-mark failed for ${subscription.id}:`, error.message)
  }
  // MKT-004 Ask 3: fire subscription_cancelled server-side.
  try {
    await trackServer('subscription_cancelled', {
      stripe_subscription_id: subscription.id,
    })
  } catch (trackErr) {
    console.warn('[stripe-webhook] trackServer(subscription_cancelled) failed:', trackErr)
  }
}

// ---------------------------------------------------------------------------
// invoice.payment_failed
// ---------------------------------------------------------------------------

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = readInvoiceSubscriptionId(invoice)
  console.log(`[stripe-webhook] invoice.payment_failed sub=${subscriptionId}`)
  if (!subscriptionId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'payment_failed' })
    .eq('stripe_subscription_id', subscriptionId)
  if (error) {
    console.error(`[stripe-webhook] payment_failed update failed for ${subscriptionId}:`, error.message)
  }
}

// ---------------------------------------------------------------------------
// invoice.payment_succeeded
// ---------------------------------------------------------------------------

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = readInvoiceSubscriptionId(invoice)
  console.log(
    `[stripe-webhook] invoice.payment_succeeded sub=${subscriptionId} reason=${invoice.billing_reason}`,
  )
  if (!subscriptionId) return
  if (invoice.billing_reason !== 'subscription_cycle') return

  // Refetch the subscription so we know the new period.
  let sub: Stripe.Subscription
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[stripe-webhook] subscription refetch failed for ${subscriptionId}:`, message)
    return
  }
  const periods = readSubscriptionPeriods(sub)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      current_period_start: periods.start,
      current_period_end: periods.end,
      current_period_passes_used: 0,
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error(`[stripe-webhook] period reset failed for ${subscriptionId}:`, error.message)
  } else {
    console.log(`[stripe-webhook] period reset sub=${subscriptionId} start=${periods.start}`)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Prefer subscription.metadata.author_id (set by our checkout endpoint). Fall
 * back to looking up the customer's most recent author_profile via
 * stripe_customer_id on an existing subscription row.
 */
async function resolveAuthorId(subscription: Stripe.Subscription): Promise<string | null> {
  const fromMeta = subscription.metadata?.author_id
  if (fromMeta) return fromMeta

  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const { data } = await supabase
    .from('subscriptions')
    .select('author_id')
    .eq('stripe_customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.author_id as string | undefined) ?? null
}

interface SubMeta {
  tier: string | null
  priceId: string | null
  productId: string | null
  lookupKey: string | null
  passes_included: number | null
  projects_allowed: number | null
}

async function readSubscriptionMetadata(subscription: Stripe.Subscription): Promise<SubMeta> {
  const item = subscription.items.data[0]
  if (!item?.price) {
    return {
      tier: null,
      priceId: null,
      productId: null,
      lookupKey: null,
      passes_included: null,
      projects_allowed: null,
    }
  }
  const price = item.price
  const priceId = price.id
  const lookupKey = price.lookup_key ?? null
  const productId = typeof price.product === 'string' ? price.product : price.product.id

  // We may already have the expanded product on the item; if not, retrieve
  // it. A DeletedProduct on the price is a Stripe edge case (product was
  // deleted after the price was created); refetch a fresh copy so the
  // metadata read is meaningful.
  let product: Stripe.Product
  if (typeof price.product === 'string' || price.product.deleted) {
    try {
      product = await stripe.products.retrieve(productId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[stripe-webhook] product retrieve failed for ${productId}:`, message)
      return {
        tier: null,
        priceId,
        productId,
        lookupKey,
        passes_included: null,
        projects_allowed: null,
      }
    }
  } else {
    product = price.product
  }

  const meta = readProductMetadata(product)
  return {
    tier: meta.tier,
    priceId,
    productId,
    lookupKey,
    passes_included: meta.passes_included,
    projects_allowed: meta.projects_allowed,
  }
}

/**
 * Stripe API version 2025-04-30+ moves `current_period_start` / `_end` from
 * the Subscription object to the Subscription Item. Support both shapes so
 * the handler works regardless of the account's API version.
 */
function readSubscriptionPeriods(subscription: Stripe.Subscription): {
  start: string | null
  end: string | null
} {
  const item = subscription.items.data[0]
  const itemStart = item?.current_period_start
  const itemEnd = item?.current_period_end

  const legacy = subscription as unknown as {
    current_period_start?: number
    current_period_end?: number
  }
  const start = itemStart ?? legacy.current_period_start ?? null
  const end = itemEnd ?? legacy.current_period_end ?? null
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
  }
}

/**
 * Modern invoice shape puts the linked subscription on
 * `invoice.parent.subscription_details.subscription`. Older API versions
 * put it on `invoice.subscription`. Handle both.
 */
function readInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent?.subscription_details?.subscription
  if (parent) {
    return typeof parent === 'string' ? parent : parent.id
  }
  const legacy = (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription
  if (!legacy) return null
  return typeof legacy === 'string' ? legacy : legacy.id
}

/** Map Stripe subscription status onto the internal enum. */
function normaliseStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'unpaid':
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return status === 'past_due' || status === 'unpaid' ? 'payment_failed' : status
    default:
      return status
  }
}

// exported for tests / debugging; also silences the unused-import lint on
// SupabaseClient in the rare case it's tree-shaken.
export type __SupabaseHandle = SupabaseClient
