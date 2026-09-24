import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/publisher/projects/[id]/line
//
// THE PRODUCTION LINE, as a publisher sees it.
//
// The portal showed outcomes — Complete, Complete, Complete — and never the
// mechanism that earned the word. The one-pager's claim is that AuthorsLab's
// control is "observable rather than aspirational"; this route is what makes
// it observable. Per station: what the machine did, what the gate requires,
// and who closes it.
//
// ─── Controlled calls come from lmo_ledger ───────────────────────────────────
// The ledger already carries `station_id` — the production-line vocabulary is
// in the schema, not invented here. Station ids are namespaced by editor
// ('alex.chapter_analysis', 'sam.chapter_analysis', …), so a phase's call
// count is the ledger rows whose station_id starts with that editor's name,
// joined through as_journeys to this manuscript.
//
// ─── What is deliberately NOT returned: cost ─────────────────────────────────
// lmo_ledger carries cost_estimate_usd and it is a striking number — a couple
// of dollars of model spend against an editorial process that costs a house
// thousands. It is exactly the wrong number to put in front of a publisher:
// Paul's standing position is to leave the room without disclosing a price,
// and a visible per-book model cost anchors every later pricing conversation
// against it. The claim this surface makes is AUDITABLE, not CHEAP.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface Station {
  key: string
  order: number
  name: string
  /** The editor who runs this station, where one does. */
  operator: string | null
  /** What must be true for the book to leave this station. */
  gate: string
  /** Who closes that gate. */
  gateOwner: 'author' | 'publisher'
  state: 'complete' | 'in-progress' | 'waiting'
  /** Controlled calls logged at this station, or null where none are expected. */
  controlledCalls: number | null
}

const EDITOR_BY_PHASE: Record<number, string> = {
  1: 'alex',
  2: 'sam',
  3: 'jordan',
  4: 'morgan',
  5: 'riley',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data: phaseRows } = await supabaseAdmin
      .from('editing_phases')
      .select('phase_number, phase_status, editor_name')
      .eq('manuscript_id', id)
      .order('phase_number', { ascending: true })

    // Controlled-call counts per editor, via this manuscript's journeys.
    const { data: journeys } = await supabaseAdmin
      .from('as_journeys')
      .select('id')
      .eq('manuscript_id', id)

    const journeyIds = (journeys ?? []).map((j) => j.id)
    const callsByEditor = new Map<string, number>()

    if (journeyIds.length > 0) {
      const { data: ledger } = await supabaseAdmin
        .from('lmo_ledger')
        .select('station_id')
        .in('journey_id', journeyIds)

      for (const row of ledger ?? []) {
        const editor = String(row.station_id ?? '').split('.')[0].toLowerCase()
        if (!editor) continue
        callsByEditor.set(editor, (callsByEditor.get(editor) ?? 0) + 1)
      }
    }

    function phaseState(n: number): Station['state'] {
      const p = (phaseRows ?? []).find((r) => r.phase_number === n)
      if (p?.phase_status === 'complete') return 'complete'
      if (p?.phase_status === 'active') return 'in-progress'
      return 'waiting'
    }

    function operatorFor(n: number): string | null {
      const p = (phaseRows ?? []).find((r) => r.phase_number === n)
      return p?.editor_name ?? null
    }

    function callsFor(n: number): number | null {
      const editor = EDITOR_BY_PHASE[n]
      if (!editor) return null
      return callsByEditor.get(editor) ?? 0
    }

    const manuscriptComplete = phaseState(1) !== 'waiting'

    const stations: Station[] = [
      {
        key: 'manuscript',
        order: 1,
        name: 'Manuscript',
        operator: null,
        gate: 'The author submits a complete draft',
        gateOwner: 'author',
        state: manuscriptComplete ? 'complete' : 'waiting',
        controlledCalls: null,
      },
      {
        key: 'developmental',
        order: 2,
        name: 'Developmental edit',
        operator: operatorFor(1),
        gate: 'Author approves every chapter',
        gateOwner: 'author',
        state: phaseState(1),
        controlledCalls: callsFor(1),
      },
      {
        key: 'line',
        order: 3,
        name: 'Line edit',
        operator: operatorFor(2),
        gate: 'Author approves every chapter',
        gateOwner: 'author',
        state: phaseState(2),
        controlledCalls: callsFor(2),
      },
      {
        key: 'copy',
        order: 4,
        name: 'Copy edit',
        operator: operatorFor(3),
        gate: 'Author approves every chapter',
        gateOwner: 'author',
        state: phaseState(3),
        controlledCalls: callsFor(3),
      },
      {
        key: 'cover',
        order: 5,
        name: 'Cover',
        operator: 'Taylor',
        gate: 'Publisher approves the cover',
        gateOwner: 'publisher',
        state: phaseState(4),
        controlledCalls: callsByEditor.get('taylor') ?? 0,
      },
      {
        key: 'publishing',
        order: 6,
        name: 'Publishing preparation',
        operator: operatorFor(4),
        gate: 'Publisher confirms the route to market',
        gateOwner: 'publisher',
        state: phaseState(4),
        controlledCalls: callsFor(4),
      },
      {
        key: 'marketing',
        order: 7,
        name: 'Marketing',
        operator: operatorFor(5),
        gate: 'Publisher approves the plan',
        gateOwner: 'publisher',
        state: phaseState(5),
        controlledCalls: callsFor(5),
      },
    ]

    const totalCalls = Array.from(callsByEditor.values()).reduce((a, b) => a + b, 0)

    return NextResponse.json({
      stations,
      totalControlledCalls: totalCalls,
      publisherGates: stations.filter((s) => s.gateOwner === 'publisher').length,
    })
  } catch (err) {
    console.error(`publisher line ${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
