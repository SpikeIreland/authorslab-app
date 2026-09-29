import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Launch readiness for a book — what still has to happen before it can launch,
// and the earliest date that leaves room for the marketing run-up.
//
// WHAT THIS DELIBERATELY DOES NOT DO: mint a date.
//
// `publisher` ruled a two-date design on 2026-09-29 (settled with
// `identity-billing`): a PUBLICATION date, which is the publisher's truth and
// includes the last mile we do not own, and a HANDOFF date covering our seven
// stations, which is the only thing we can be measured against. Their columns
// do not exist yet. `project_marketing.launch_date` predates that ruling and is
// a third declaration of the same real-world event — so this route SUGGESTS and
// EXPLAINS, and the author confirms. When the publisher's target date lands,
// `basis` becomes 'publisher_target' and this estimate stops being consulted.
//
// Their guard rule, adopted verbatim: a NULL target date must read
// "no date set", NEVER "on time". `basis: 'none'` is how that is expressed here.

export type ReadinessBasis = 'publisher_target' | 'readiness_estimate' | 'none'

export interface ReadinessBlocker {
  station: number
  label: string
  who: string
  status: string
}

export interface LaunchReadiness {
  basis: ReadinessBasis
  suggestedDate: string | null
  weeksOut: number | null
  blockers: ReadinessBlocker[]
  marketingRunupWeeks: number
  assumptions: string[]
}

// Our seven-station line, by phase number. Marketing (5) is ours and is the
// station this page is for; 1-4 are upstream and gate a credible date.
const STATION_LABEL: Record<number, { label: string; who: string }> = {
  1: { label: 'Developmental edit', who: 'Alex' },
  2: { label: 'Line edit', who: 'Sam' },
  3: { label: 'Copy edit', who: 'Jordan' },
  4: { label: 'Publishing prep', who: 'Morgan' },
  5: { label: 'Marketing prep', who: 'Riley' },
}

// Weeks to allow for a station that is not yet finished. Stated as assumptions
// in the response rather than presented as knowledge — we have no completed
// journeys to calibrate against, and a fabricated precision here would be
// exactly the kind of claim an instrument cannot back.
const WEEKS_IF_PENDING = 3
const WEEKS_IF_ACTIVE = 2
// The launch template's earliest milestone is 4 weeks before launch day.
const MARKETING_RUNUP_WEEKS = 4

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: phases, error: phaseError } = await supabase
    .from('editing_phases')
    .select('phase_number, phase_status, editor_name')
    .eq('manuscript_id', id)
    .order('phase_number', { ascending: true })

  if (phaseError) {
    return NextResponse.json({ error: phaseError.message }, { status: 500 })
  }

  const blockers: ReadinessBlocker[] = []
  let weeks = 0

  for (const p of phases ?? []) {
    const n = p.phase_number as number
    const status = (p.phase_status as string) ?? 'pending'
    // Station 5 is this page's own work; it is not a blocker on itself.
    if (n >= 5) continue
    if (status === 'complete' || status === 'skipped') continue

    const meta = STATION_LABEL[n] ?? { label: `Station ${n}`, who: '' }
    blockers.push({
      station: n,
      label: meta.label,
      // Prefer the row's own editor_name over the constant — data wins,
      // the lesson from publisher's data-first portal.
      who: (p.editor_name as string) || meta.who,
      status,
    })
    weeks += status === 'active' ? WEEKS_IF_ACTIVE : WEEKS_IF_PENDING
  }

  const totalWeeks = weeks + MARKETING_RUNUP_WEEKS
  const suggested = new Date()
  suggested.setDate(suggested.getDate() + totalWeeks * 7)

  const readiness: LaunchReadiness = {
    basis: 'readiness_estimate',
    suggestedDate: suggested.toISOString(),
    weeksOut: totalWeeks,
    blockers,
    marketingRunupWeeks: MARKETING_RUNUP_WEEKS,
    assumptions: [
      `${MARKETING_RUNUP_WEEKS} weeks of marketing run-up, which is the earliest milestone in your launch plan`,
      blockers.length
        ? `${WEEKS_IF_ACTIVE}–${WEEKS_IF_PENDING} weeks for each station still to finish — an allowance, not a forecast; no book has been through the whole line yet`
        : 'every editing and publishing station is already complete',
    ],
  }

  return NextResponse.json(readiness)
}
