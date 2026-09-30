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
 * EDITORIAL PASS CONTRACT V1 — the meter for `passes_included`.
 *
 * Adopted verbatim from `astudio`, 2026-09-22, accepted by `finance`
 * 2026-09-23. Change-controlled: any change to this definition goes out as a
 * courier to identity-billing + finance + sysadmin BEFORE it lands, never
 * after (astudio P4).
 *
 *   > One pass = one row in `as_journeys` where
 *   > `journey_type = 'full_analysis'` AND
 *   > `editor_name IN ('alex','sam','jordan')` AND
 *   > `status IN ('ready','replied','complete')` AND
 *   > `terminal_reason IS NULL` AND
 *   > `completed_at <= timeout_at`.
 *   > Consumption is timestamped by `completed_at`.
 *   (V1.1, ruled by astudio 2026-09-30 — see the constants below for why each
 *   clause is there and why the obvious alternative fix was dangerous.)
 *
 * Why this is NOT an `lmo_ledger` station count, which is what this file did
 * until 2026-09-24 and why that read zero forever:
 *
 *  1. The old constants (`alex|sam|jordan.full-manuscript-analysis`) matched
 *     NOTHING. The ledger's real ids are `alex.full_analysis.*` — hyphens
 *     against underscores, and `station_id` is unconstrained `text NOT NULL`
 *     with no CHECK, enum or FK, so the misspelling could never be caught by
 *     the database. A vocabulary with no constraint on it cannot be a
 *     contract. The three columns above are all CHECK-constrained.
 *  2. `lmo_ledger` is a COST table — every NOT NULL column on it asserts the
 *     row is a model call. A "pass complete" event is not a model call.
 *  3. 49.5% of ledger rows carry no `journey_id` at all, and the old query
 *     reached the ledger through `journey_id`, so those rows were invisible
 *     to the meter by construction (astudio AS-3).
 *  4. `alex.full_analysis.final_synthesis` was proposed as the terminal
 *     event — by finance as a "natural predecessor" and by this chat as
 *     something that "may already be exactly that". It is not: the single
 *     instance fired with `success = false` inside a journey whose status is
 *     `failed` (`max_tokens_truncation`). Had it shipped, the meter's first
 *     act in production would have been to bill an author for a truncated
 *     analysis that failed (astudio AS-1). Recorded here because the
 *     correction is worth more than the code.
 *
 * Exactly-once is structural: one journey is one row, so no emitter can
 * double-fire and no n8n retry can duplicate. Completion consumes, failure
 * does not (finance rule 2) — hence `status = 'complete'` and NOT
 * `completed_at IS NOT NULL`, which is set on failures too.
 *
 * EXPECTED READING TODAY: zero. `status = 'complete'` is currently unused —
 * astudio P1 reserves it as the success terminal for full-analysis journeys
 * (an n8n change; they draft, Paul publishes), and astudio P2 closes the path
 * that runs a full analysis without creating a journey row at all. Until both
 * land, no completed journey can exist. That is a TRUE zero we can defend in
 * writing, which the station-id version was not.
 */
const PASS_JOURNEY_TYPE = 'full_analysis'
const PASS_EDITORS = ['alex', 'sam', 'jordan'] as const

/**
 * EDITORIAL PASS CONTRACT V1.1 — ruled by `astudio` 2026-09-30, landed here
 * the same turn. Change control discharged: couriered BEFORE it landed, never
 * after.
 *
 * V1 counted `status = 'complete'`. NOTHING HAS EVER WRITTEN THAT VALUE — 14
 * journeys since 12 August, 0 at 'complete'; the worker writes 'ready' for
 * every journey type. So the meter was structurally incapable of counting a
 * pass, and because the failure direction is generous (a stuck zero never
 * blocks anyone) it would never have raised a complaint. P1 succeeding is what
 * would have turned it into a live billing hole.
 *
 * Three clauses, and each one is load-bearing:
 *
 *  1 · status IN ('ready','replied','complete')
 *      This is already the success set the product uses: `terminalUserMessage`
 *      in src/lib/as_journeys.ts treats exactly these three as success and
 *      tells the author so. THE METER MUST COUNT WHAT THE PRODUCT TOLD THE
 *      AUTHOR IT DELIVERED. Narrower, and we give away work we announced as
 *      done.
 *
 *  2 · terminal_reason IS NULL
 *      `astudio`'s clause and the one that matters most. The n8n node
 *      "Journey: Ready" writes status and completed_at but NEVER CLEARS
 *      terminal_reason — that is the whole Mode B mechanism, where a worker
 *      outlives the reaper and overwrites a terminal verdict. It is also why
 *      the obvious alternative fix (make the worker write 'complete') is
 *      ACTIVELY DANGEROUS: it would produce 'complete' + terminal_reason =
 *      'timeout', which a status-only meter counts.
 *
 *  3 · completed_at <= timeout_at
 *      Refuses a journey that finished after its own deadline. Kept, but NOT
 *      sufficient alone: the 12 August truncation failure finished inside its
 *      window. Clause 1 excludes it.
 *
 * THE DISCRIMINATOR IS REACHABLE, checked before shipping rather than assumed
 * — 9 of 14 journeys satisfy all three clauses today (7 chapter_analysis, 2
 * editor_chat), and every failure, reap and Mode B row carries a non-null
 * terminal_reason. A predicate that nothing can satisfy is the defect this
 * amendment exists to repair; it would be absurd to fix it with another one.
 *
 * `full_analysis` itself is still 0 for 4, so this meter reads zero — but it
 * now reads zero because no pass has succeeded, not because it is blind.
 */
const PASS_SUCCESS_STATUSES = ['ready', 'replied', 'complete'] as const

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
  // 2. Passes used this period — counted from `as_journeys` per Editorial
  //    Pass Contract V1 (see the constants above). Two scoped queries:
  //    (a) manuscripts for this author, (b) completed full-analysis journeys
  //    on those manuscripts within the billing period.
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
    // Contract V1: manuscripts -> as_journeys. One query shorter than the old
    // manuscripts -> as_journeys -> lmo_ledger hop, and free of the orphaned-
    // row fault (AS-3). Period filter reads `completed_at`, not `created_at`:
    // a journey started in one period and finished in the next consumes in the
    // period it delivered value.
    // Rows, not a count. PostgREST cannot compare two columns to each other,
    // so `completed_at <= timeout_at` is not expressible as a filter and the
    // comparison happens here. That costs the `head: true` optimisation and is
    // free at these volumes (a handful of journeys per manuscript per period);
    // an explicit comparison a reader can check beats a clever filter that
    // cannot express the rule.
    const { data: candidates, error: passError } = await supabase
      .from('as_journeys')
      .select('id, completed_at, timeout_at')
      .in('manuscript_id', manuscriptIds)
      .eq('journey_type', PASS_JOURNEY_TYPE)
      .in('editor_name', PASS_EDITORS)
      .in('status', PASS_SUCCESS_STATUSES)
      .is('terminal_reason', null)
      .gte('completed_at', sub.current_period_start)

    if (passError) {
      // Fail visible, never silently green: a meter that cannot read must not
      // report a comfortable zero (House Rules, Invariants).
      return NextResponse.json({ error: passError.message }, { status: 500 })
    }

    // `completed_at` is NULLABLE while `timeout_at` is NOT NULL. A
    // success-terminal row with no completion time is a CONTRADICTION, and the
    // generous failure would be to let it fall out of the comparison silently
    // and under-count. It cannot reach here — the period filter above already
    // drops nulls — but the guard is explicit so that removing that filter
    // later cannot quietly reintroduce an under-count.
    passes_used_this_period = (candidates ?? []).filter((j) => {
      const done = j.completed_at as string | null
      const deadline = j.timeout_at as string | null
      if (!done || !deadline) return false
      return new Date(done).getTime() <= new Date(deadline).getTime()
    }).length
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
