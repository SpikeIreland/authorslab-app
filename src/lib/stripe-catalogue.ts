/**
 * src/lib/stripe-catalogue.ts
 *
 * Single source of truth for the Stripe catalogue on the app side.
 * Code references LOOKUP KEYS, never price IDs — this way price steps
 * (PD-7) can create new prices and move a lookup key without any code
 * change. Product/price IDs are documented in
 * docs/sis/pricing/AL-Stripe-Launch-Handover.md §1.
 */

import type Stripe from 'stripe'

// ---------------------------------------------------------------------------
// Lookup keys — must match Stripe exactly (case-sensitive).
// ---------------------------------------------------------------------------

export const LOOKUP_KEYS = {
  STARTER_MONTHLY: 'starter_monthly',
  STARTER_ANNUAL: 'starter_annual',
  AUTHOR_MONTHLY: 'author_monthly',
  AUTHOR_ANNUAL: 'author_annual',
  /**
   * Founding Author tier (£9.50/mo). NEVER surfaced on the public pricing
   * page or in Customer Portal switch options. The 11 beta authors are
   * subscribed to this price directly from the Stripe dashboard.
   */
  AUTHOR_FOUNDING: 'author_founding',
  PRO_MONTHLY: 'pro_monthly',
  PRO_ANNUAL: 'pro_annual',
  /** One-time £119 pass covering a single project's full journey. */
  SINGLE_PROJECT_PASS: 'single_project_pass',
} as const

export type LookupKey = (typeof LOOKUP_KEYS)[keyof typeof LOOKUP_KEYS]

/**
 * Lookup keys the public pricing page and Customer Portal may reference.
 * Excludes `author_founding` — that price is Founding-Author-only.
 */
export const PUBLIC_LOOKUP_KEYS: LookupKey[] = [
  LOOKUP_KEYS.STARTER_MONTHLY,
  LOOKUP_KEYS.STARTER_ANNUAL,
  LOOKUP_KEYS.AUTHOR_MONTHLY,
  LOOKUP_KEYS.AUTHOR_ANNUAL,
  LOOKUP_KEYS.PRO_MONTHLY,
  LOOKUP_KEYS.PRO_ANNUAL,
  LOOKUP_KEYS.SINGLE_PROJECT_PASS,
]

/** Lookup keys that represent one-time (Checkout `payment` mode) purchases. */
export const PASS_LOOKUP_KEYS: LookupKey[] = [LOOKUP_KEYS.SINGLE_PROJECT_PASS]

/**
 * Recurring subscription tier identifier. The Single-Project Pass is a
 * one-time product, not a tier — it does not appear here.
 */
export type Tier = 'starter' | 'author' | 'pro'

/**
 * How long a Single-Project Pass counts as "recent" for the pass-bridge
 * credit lookup. Matches the pricing chat commitment in the handover.
 */
export const PASS_CREDIT_WINDOW_DAYS = 90

/**
 * Number of full-manuscript passes bundled with a Single-Project Pass.
 *
 * NOTE (2026-08-05): the Stripe product currently carries
 * `passes_per_month: 1` in metadata. Per Paul's decision the Pass covers
 * the full three-editor journey (Alex + Sam + Jordan full-manuscript
 * analyses = 3 passes). The plan doc §4 flagged that Pricing Chat should
 * update the product metadata to `passes_included: 3`. Until that lands
 * this constant is the hardcoded fallback used by readProductMetadata()
 * when the metadata key is absent.
 */
export const PASS_INCLUDED_FALLBACK = 3

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isPassLookupKey(key: string): key is LookupKey {
  return (PASS_LOOKUP_KEYS as readonly string[]).includes(key)
}

export function isSubscriptionLookupKey(key: string): key is LookupKey {
  if (!(PUBLIC_LOOKUP_KEYS as readonly string[]).includes(key)) return false
  return !isPassLookupKey(key)
}

/** True if the lookup key represents any known price (public or founding). */
export function isKnownLookupKey(key: string): key is LookupKey {
  return Object.values(LOOKUP_KEYS).includes(key as LookupKey)
}

/**
 * Read the machine-readable tier map from Stripe product metadata.
 *
 * - `tier`: expected to be one of 'starter' | 'author' | 'pro' for
 *   subscription products. Pass products carry no tier (returned as null).
 * - `passes_included`: for subscription products, read
 *   `metadata.passes_per_month`; for the Pass, read `metadata.passes_included`
 *   or fall back to PASS_INCLUDED_FALLBACK.
 * - `projects_allowed`: read `metadata.projects_allowed`; the string
 *   'unlimited' or absence maps to null.
 */
export function readProductMetadata(product: Stripe.Product): {
  tier: Tier | 'author_founding' | null
  passes_included: number | null
  projects_allowed: number | null
} {
  const md = product.metadata ?? {}

  // Tier
  let tier: Tier | 'author_founding' | null = null
  const rawTier = (md.tier ?? '').toString().trim().toLowerCase()
  if (rawTier === 'starter' || rawTier === 'author' || rawTier === 'pro' || rawTier === 'author_founding') {
    tier = rawTier
  }

  // Passes included
  let passes_included: number | null = null
  const passesPerMonth = md.passes_per_month
  const passesIncluded = md.passes_included
  if (passesIncluded != null && passesIncluded !== '') {
    const n = Number(passesIncluded)
    passes_included = Number.isFinite(n) ? n : null
  } else if (passesPerMonth != null && passesPerMonth !== '') {
    const n = Number(passesPerMonth)
    passes_included = Number.isFinite(n) ? n : null
  }

  // Pass product fallback: if this product has no tier and no explicit
  // passes_included, treat it as the Single-Project Pass and apply the
  // agreed 3-pass bundle. Guarded against silently over-writing a legitimate
  // metadata value.
  if (tier === null && passes_included === null) {
    passes_included = PASS_INCLUDED_FALLBACK
  }

  // Projects allowed
  let projects_allowed: number | null = null
  const rawProjects = md.projects_allowed
  if (rawProjects != null && rawProjects !== '' && rawProjects !== 'unlimited') {
    const n = Number(rawProjects)
    projects_allowed = Number.isFinite(n) ? n : null
  }

  return { tier, passes_included, projects_allowed }
}
