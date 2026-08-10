/**
 * POST /api/create-checkout
 *
 * Resolves a Stripe Checkout Session for the signed-in author. The client
 * sends a `lookupKey` — this endpoint looks up the price via Stripe's
 * lookup_keys API (never hardcoded price IDs), picks `payment` mode for the
 * Single-Project Pass and `subscription` mode for the recurring tiers, and
 * optionally attaches the pass-bridge coupon when the author bought a Pass
 * within the last 90 days.
 *
 * The author ID is derived from the signed-in Supabase session, not from the
 * body — the browser cannot pass an arbitrary author_id.
 *
 * DP-STRIPE-01 · see docs/sis/platform-dev/2026-08-05-DP-STRIPE-01-rewire-plan.md §4.1
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import {
  LOOKUP_KEYS,
  PUBLIC_LOOKUP_KEYS,
  PASS_CREDIT_WINDOW_DAYS,
  isPassLookupKey,
  readProductMetadata,
} from '@/lib/stripe-catalogue'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface CheckoutBody {
  lookupKey?: string
  manuscriptId?: string
}

export async function POST(req: Request) {
  // ---------------------------------------------------------------------
  // 1. Parse + validate the body.
  // ---------------------------------------------------------------------
  let body: CheckoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const lookupKey = (body.lookupKey ?? '').trim()
  const manuscriptId = body.manuscriptId?.trim() || undefined

  if (!lookupKey) {
    return NextResponse.json({ error: 'missing_lookup_key' }, { status: 400 })
  }

  // Founding tier is admin-only. Refuse unless an explicit admin flag is set.
  // (Admin bypass wiring is deferred — for now this always 403s, which is the
  // safe default: prevents accidental public exposure of the £9.50 price.)
  if (lookupKey === LOOKUP_KEYS.AUTHOR_FOUNDING) {
    return NextResponse.json(
      { error: 'founding_tier_not_available_via_public_checkout' },
      { status: 403 },
    )
  }

  if (!(PUBLIC_LOOKUP_KEYS as readonly string[]).includes(lookupKey)) {
    return NextResponse.json({ error: 'unknown_lookup_key' }, { status: 400 })
  }

  // ---------------------------------------------------------------------
  // 2. Verify the session + resolve the author.
  // ---------------------------------------------------------------------
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id, email')
    .eq('auth_user_id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_author_profile' }, { status: 404 })
  }

  const authorId = profile.id as string

  // ---------------------------------------------------------------------
  // 3. Resolve the price via lookup key.
  // ---------------------------------------------------------------------
  let price: Stripe.Price
  try {
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
      active: true,
      limit: 1,
    })
    if (!prices.data.length) {
      return NextResponse.json({ error: 'price_not_found' }, { status: 400 })
    }
    price = prices.data[0]
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stripe_error'
    console.error('[create-checkout] price lookup failed:', message)
    return NextResponse.json({ error: `stripe_price_lookup_failed: ${message}` }, { status: 400 })
  }

  const product = price.product as Stripe.Product
  const productMeta = readProductMetadata(product)

  // ---------------------------------------------------------------------
  // 4. Decide the mode.
  // ---------------------------------------------------------------------
  const isPass = isPassLookupKey(lookupKey)
  const mode: Stripe.Checkout.SessionCreateParams.Mode = isPass ? 'payment' : 'subscription'

  // ---------------------------------------------------------------------
  // 5. Pass-credit check (subscription mode only).
  //    Applies a one-off £13 coupon if this author bought a Pass in the
  //    last 90 days and the credit hasn't already been consumed.
  // ---------------------------------------------------------------------
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  let bridgePassPurchaseId: string | null = null

  if (mode === 'subscription') {
    const windowStart = new Date(
      Date.now() - PASS_CREDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString()

    const { data: recentPasses, error: passError } = await supabase
      .from('pass_purchases')
      .select('id')
      .eq('author_id', authorId)
      .gte('purchased_at', windowStart)
      .is('credit_applied_at', null)
      .order('purchased_at', { ascending: false })
      .limit(1)

    if (passError) {
      console.warn('[create-checkout] pass_purchases lookup failed:', passError.message)
    } else if (recentPasses && recentPasses.length > 0) {
      const couponId = process.env.STRIPE_PASS_BRIDGE_COUPON_ID
      if (couponId) {
        discounts = [{ coupon: couponId }]
        bridgePassPurchaseId = recentPasses[0].id as string
        console.log(
          `[create-checkout] applying pass-bridge coupon ${couponId} for author=${authorId} pass=${bridgePassPurchaseId}`,
        )
      } else {
        console.warn(
          '[create-checkout] Pass-bridge coupon ID not configured (STRIPE_PASS_BRIDGE_COUPON_ID) — skipping credit for author=' +
            authorId,
        )
      }
    }
  }

  // ---------------------------------------------------------------------
  // 6. Build the Checkout Session.
  // ---------------------------------------------------------------------
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const metadata: Record<string, string> = {
    author_id: authorId,
    lookup_key: lookupKey,
  }
  if (productMeta.tier) metadata.tier = productMeta.tier
  if (manuscriptId) metadata.manuscript_id = manuscriptId
  if (bridgePassPurchaseId) metadata.pass_bridge_purchase_id = bridgePassPurchaseId

  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
    client_reference_id: authorId,
    customer_email: profile.email ?? undefined,
    metadata,
    allow_promotion_codes: !discounts,
  }

  if (mode === 'subscription') {
    params.subscription_data = { metadata }
  } else {
    params.payment_intent_data = { metadata }
  }

  if (discounts) {
    params.discounts = discounts
    // Stripe rejects `allow_promotion_codes` when `discounts` is set.
    delete params.allow_promotion_codes
  }

  try {
    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stripe_error'
    console.error('[create-checkout] session create failed:', message, {
      authorId,
      lookupKey,
    })
    return NextResponse.json({ error: `stripe_checkout_create_failed: ${message}` }, { status: 400 })
  }
}
