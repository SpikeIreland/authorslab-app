/**
 * GET /api/subscription/entitlement
 *
 * Returns the signed-in author's entitlement state — tier, limits,
 * consumption for the current billing period, and whether a pass-bridge
 * credit is still eligible.
 *
 * DP-STRIPE-01 · see docs/sis/platform-dev/2026-08-05-DP-STRIPE-01-rewire-plan.md §4.4
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PASS_CREDIT_WINDOW_DAYS } from '@/lib/stripe-catalogue'

export interface EntitlementResponse {
  tier: string | null
  status: string | null
  period_end: string | null
  passes_included: number | null
  passes_used_this_period: number
  passes_remaining: number | null
  projects_allowed: number | null
  projects_count: number
  has_recent_pass_purchase: boolean
  pass_bridge_credit_eligible: boolean
}

/**
 * Station IDs on lmo_ledger that represent a full-manuscript pass
 * (one row per completed pass through Alex / Sam / Jordan full-manuscript
 * analysis). This is the meter for `passes_included`.
 */
const PASS_STATION_IDS = [
  'alex.full-manuscript-analysis',
  'sam.full-manuscript-analysis',
  'jordan.full-manuscript-analysis',
]

export async function GET() {
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
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_author_profile' }, { status: 404 })
  }
  const authorId = profile.id as string

  // ---------------------------------------------------------------------
  // 1. Active subscription (most recent, may be null).
  // ---------------------------------------------------------------------
  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select(
      'id, tier, status, current_period_start, current_period_end, passes_included, projects_allowed',
    )
    .eq('author_id', authorId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 })
  }
  const sub = subs && subs.length > 0 ? subs[0] : null

  // ---------------------------------------------------------------------
  // 2. Passes used this period — count from lmo_ledger. `lmo_ledger` has
  //    no author_id column (its FK is `journey_id` → as_journeys), so we
  //    derive by joining as_journeys → manuscripts. We do that via two
  //    scoped queries: (a) manuscripts for this author, (b) as_journeys
  //    for those manuscripts, (c) lmo_ledger for those journeys with the
  //    right station_id and time window.
  // ---------------------------------------------------------------------
  let passes_used_this_period = 0

  const { data: manuscripts, error: msError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('author_id', authorId)
  if (msError) {
    return NextResponse.json({ error: msError.message }, { status: 500 })
  }
  const projects_count = manuscripts?.length ?? 0
  const manuscriptIds = (manuscripts ?? []).map((m) => m.id as string)

  if (sub && sub.current_period_start && manuscriptIds.length > 0) {
    const { data: journeys } = await supabase
      .from('as_journeys')
      .select('id')
      .in('manuscript_id', manuscriptIds)
    const journeyIds = (journeys ?? []).map((j) => j.id as string)

    if (journeyIds.length > 0) {
      // `count: 'exact', head: true` returns the count without rows.
      const { count } = await supabase
        .from('lmo_ledger')
        .select('id', { count: 'exact', head: true })
        .in('journey_id', journeyIds)
        .in('station_id', PASS_STATION_IDS)
        .gte('created_at', sub.current_period_start)
      passes_used_this_period = count ?? 0
    }
  }

  const passes_included = sub?.passes_included ?? null
  const passes_remaining =
    passes_included == null ? null : Math.max(0, passes_included - passes_used_this_period)

  // ---------------------------------------------------------------------
  // 3. Pass-bridge credit eligibility.
  // ---------------------------------------------------------------------
  const windowStart = new Date(
    Date.now() - PASS_CREDIT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString()

  const { data: recentPasses } = await supabase
    .from('pass_purchases')
    .select('id, credit_applied_at')
    .eq('author_id', authorId)
    .gte('purchased_at', windowStart)
    .order('purchased_at', { ascending: false })
    .limit(1)

  const has_recent_pass_purchase = (recentPasses?.length ?? 0) > 0
  const pass_bridge_credit_eligible =
    has_recent_pass_purchase && !sub && (recentPasses?.[0]?.credit_applied_at == null)

  const response: EntitlementResponse = {
    tier: sub?.tier ?? null,
    status: sub?.status ?? null,
    period_end: sub?.current_period_end ?? null,
    passes_included,
    passes_used_this_period,
    passes_remaining,
    projects_allowed: sub?.projects_allowed ?? null,
    projects_count,
    has_recent_pass_purchase,
    pass_bridge_credit_eligible,
  }
  return NextResponse.json(response)
}
