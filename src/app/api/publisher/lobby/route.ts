import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  deriveRegister,
  deriveRisk,

  RISK_ORDER,
  type Register,
  type Risk,
  type RiskBasis,
} from './_derive'

// GET /api/publisher/lobby?org=<slug>
//
// THE PUBLISHER LOBBY — the aggregate register.
//
// The portal answers "how is this book?". This answers "which book is going
// to slip?". Same estate, different unit: one manuscript vs the whole list,
// detail vs aggregate, a visitor vs an operator.
//
// ─── Rows come from TENANCY, not from a mock file ────────────────────────────
// `manuscripts.imprint_id` (applied 2026-09-28) is the single-valued tenancy
// relation. A title is on a publisher's list because it carries their
// imprint, and for no other reason. This route is what retires
// `_data/stable.ts` as a row source — eight listings of which one was real.
//
// ─── What this route does NOT claim ──────────────────────────────────────────
// 1. AUTHORISATION. There is no membership check here, because there is no
//    caller identity to check. `can_read_manuscript()` exists and is
//    deliberately unwired, and no org membership exists for anyone yet. So
//    the org is named by an explicit `?org=` parameter rather than inferred
//    from a session, and the response says `authorised: false` in as many
//    words. A reader that cannot resolve a value must SAY SO rather than pick
//    the convenient meaning — and the convenient meaning here would be that
//    this list is private. It is not. When memberships exist, the parameter
//    is replaced by the caller's membership and this flag becomes true.
//
// 2. THE REGISTER SPLIT, until the schema can support it. A title is "on the
//    line" when a STATION HAS BEEN COMPLETED BY THE SYSTEM, which requires
//    `editing_phases.completion_source` (ruled 2026-09-28, not yet applied).
//    Without that column, human marks and system completions are
//    indistinguishable, so the split is reported UNAVAILABLE rather than
//    guessed. The page must hide the sections, not caption them.
//
// 3. COST. `lmo_ledger.cost_estimate_usd` is never read here. Paul's standing
//    position: leave the room without disclosing a price.
//
// ─── The date finding, which is the important one ────────────────────────────
// Oliver is buying certainty about DATES. The estate has exactly one date a
// publisher would recognise as a target — `project_marketing.launch_date` —
// and it is set in phase 5, the LAST station. So for every book still in
// production there is no target date at all, and "late" is not computable
// against anything.
//
// This route therefore returns `riskBasis` alongside `risk`, naming what the
// judgement was made FROM: 'date' where a launch date exists, 'stall' where
// only elapsed time is available, 'none' where neither is. A Lobby that
// showed "on track" computed from nothing would be the level-1 failure mode
// exactly — a surface reporting confidently on absent data.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Register, Risk, RiskBasis, LAST_PHASE, STALL_DAYS and the two derivations
// live in ./_derive so they can be exercised with negative controls by
// scripts/verify-lobby-derive.ts. A page that renders is not evidence that a
// split discriminates.

export interface LobbyTitle {
  manuscriptId: string
  title: string
  authorName: string | null
  imprintId: string | null
  imprintName: string | null
  /** null when the register split cannot be resolved — see header note 2. */
  register: Register | null
  currentStationName: string | null
  currentStationOperator: string | null
  gate: string | null
  gateOwner: 'author' | 'publisher' | null
  lastActivityAt: string | null
  daysSinceActivity: number | null
  launchDate: string | null
  risk: Risk
  riskBasis: RiskBasis
}

const PHASE_NAME: Record<number, string> = {
  1: 'Developmental edit',
  2: 'Line edit',
  3: 'Copy edit',
  4: 'Publishing prep',
  5: 'Marketing prep',
}

/** Who closes the gate at the end of each phase. */
const GATE: Record<number, { gate: string; owner: 'author' | 'publisher' }> = {
  1: { gate: 'The author accepts the developmental pass', owner: 'author' },
  2: { gate: 'The author accepts the line pass', owner: 'author' },
  3: { gate: 'The author accepts the copy pass', owner: 'author' },
  4: { gate: 'The publisher approves the cover and interior', owner: 'publisher' },
  5: { gate: 'The publisher approves the launch plan', owner: 'publisher' },
}

function daysBetween(then: string, now: number): number {
  return Math.floor((now - new Date(then).getTime()) / 86_400_000)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const orgSlug = url.searchParams.get('org')

  if (!orgSlug) {
    // Deliberately a 400 and not a full list. A route with no caller identity
    // must not default to "everything" — that is how an unauthenticated
    // surface becomes a disclosure.
    return NextResponse.json(
      { error: 'org_required', message: 'Name the organisation explicitly.' },
      { status: 400 }
    )
  }

  try {
    const { data: org, error: orgErr } = await supabaseAdmin
      .from('organisations')
      .select('id, name, slug')
      .eq('slug', orgSlug)
      .is('deleted_at', null)
      .maybeSingle()

    if (orgErr) {
      // 42P01 — the org tables are not there. Distinguish "not migrated" from
      // "no such organisation", because they look identical to a page.
      if (orgErr.code === '42P01') {
        return NextResponse.json(
          { available: false, reason: 'org_model_not_applied' },
          { status: 200 }
        )
      }
      throw orgErr
    }

    if (!org) {
      return NextResponse.json({ error: 'org_not_found' }, { status: 404 })
    }

    const { data: imprints } = await supabaseAdmin
      .from('imprints')
      .select('id, name')
      .eq('organisation_id', org.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    const imprintList = imprints ?? []
    const imprintIds = imprintList.map((i) => i.id)
    const imprintNameById = new Map(imprintList.map((i) => [i.id, i.name]))

    // No imprints means no tenancy means no titles. An empty org is a real
    // and honest state, not an error — see the page's empty state.
    if (imprintIds.length === 0) {
      return NextResponse.json({
        authorised: false,
        scope: 'explicit-org-parameter',
        organisation: { name: org.name, slug: org.slug },
        imprints: [],
        titles: [],
        registerSplitAvailable: false,
        registerSplitReason: 'no_titles',
      })
    }

    const { data: manuscripts } = await supabaseAdmin
      .from('manuscripts')
      .select('id, title, imprint_id, author_profiles!inner (first_name, last_name)')
      .in('imprint_id', imprintIds)

    const rows = manuscripts ?? []
    const ids = rows.map((r) => r.id)

    if (ids.length === 0) {
      return NextResponse.json({
        authorised: false,
        scope: 'explicit-org-parameter',
        organisation: { name: org.name, slug: org.slug },
        imprints: imprintList,
        titles: [],
        registerSplitAvailable: false,
        registerSplitReason: 'no_titles',
      })
    }

    // ── Probe for completion_source rather than assuming it ────────────────
    // Selecting a column that does not exist is 42703. That is the signal,
    // and it is checked once for the whole request rather than inferred from
    // a null value — a null in a column that exists means something quite
    // different from the column being absent.
    let registerSplitAvailable = true
    let registerSplitReason: string | null = null

    const probe = await supabaseAdmin
      .from('editing_phases')
      .select('completion_source')
      .limit(1)

    if (probe.error) {
      if (probe.error.code === '42703') {
        registerSplitAvailable = false
        registerSplitReason = 'completion_source_not_applied'
      } else {
        throw probe.error
      }
    }

    const phaseColumns = registerSplitAvailable
      ? 'manuscript_id, phase_number, phase_status, editor_name, started_at, completed_at, updated_at, completion_source'
      : 'manuscript_id, phase_number, phase_status, editor_name, started_at, completed_at, updated_at'

    const { data: phases } = await supabaseAdmin
      .from('editing_phases')
      .select(phaseColumns)
      .in('manuscript_id', ids)

    const { data: marketing } = await supabaseAdmin
      .from('project_marketing')
      .select('manuscript_id, launch_date')
      .in('manuscript_id', ids)

    const launchByManuscript = new Map<string, string | null>(
      (marketing ?? []).map((m) => [
        m.manuscript_id as string,
        (m.launch_date as string | null) ?? null,
      ])
    )

    type PhaseRow = {
      manuscript_id: string
      phase_number: number
      phase_status: string
      editor_name: string | null
      started_at: string | null
      completed_at: string | null
      updated_at: string | null
      completion_source?: string | null
    }

    const phasesByManuscript = new Map<string, PhaseRow[]>()
    for (const p of (phases ?? []) as unknown as PhaseRow[]) {
      const list = phasesByManuscript.get(p.manuscript_id) ?? []
      list.push(p)
      phasesByManuscript.set(p.manuscript_id, list)
    }

    const now = Date.now()

    const titles: LobbyTitle[] = rows.map((r) => {
      const ps = (phasesByManuscript.get(r.id) ?? []).sort(
        (a, b) => a.phase_number - b.phase_number
      )

      const author = (r as unknown as {
        author_profiles?: { first_name: string | null; last_name: string | null }
      }).author_profiles
      const authorName =
        author && (author.first_name || author.last_name)
          ? [author.first_name, author.last_name].filter(Boolean).join(' ')
          : null

      const active = ps.find((p) => p.phase_status === 'active')

      const register: Register | null = deriveRegister(ps, registerSplitAvailable)

      const stamps = ps
        .map((p) => p.completed_at ?? p.started_at ?? p.updated_at)
        .filter((s): s is string => Boolean(s))
        .sort()
      const lastActivityAt = stamps.length > 0 ? stamps[stamps.length - 1] : null
      const daysSinceActivity =
        lastActivityAt !== null ? daysBetween(lastActivityAt, now) : null

      const launchDate = launchByManuscript.get(r.id) ?? null

      const currentPhase = active?.phase_number ?? null
      const gateInfo = currentPhase !== null ? GATE[currentPhase] : undefined

      const daysToLaunch = launchDate !== null ? -daysBetween(launchDate, now) : null
      const { risk, riskBasis } = deriveRisk({
        phases: ps,
        daysSinceActivity,
        daysToLaunch,
      })

      return {
        manuscriptId: r.id,
        title: r.title,
        authorName,
        imprintId: (r.imprint_id as string | null) ?? null,
        imprintName: r.imprint_id
          ? imprintNameById.get(r.imprint_id as string) ?? null
          : null,
        register,
        currentStationName: currentPhase !== null ? PHASE_NAME[currentPhase] ?? null : null,
        currentStationOperator: active?.editor_name ?? null,
        gate: gateInfo?.gate ?? null,
        gateOwner: gateInfo?.owner ?? null,
        lastActivityAt,
        daysSinceActivity,
        launchDate,
        risk,
        riskBasis,
      }
    })

    // Risk order, not recency. The whole point of the surface.
    titles.sort((a, b) => {
      const d = RISK_ORDER[a.risk] - RISK_ORDER[b.risk]
      if (d !== 0) return d
      return (b.daysSinceActivity ?? -1) - (a.daysSinceActivity ?? -1)
    })

    return NextResponse.json({
      authorised: false,
      scope: 'explicit-org-parameter',
      organisation: { name: org.name, slug: org.slug },
      imprints: imprintList,
      titles,
      registerSplitAvailable,
      registerSplitReason,
      /** No title in this estate has a target date before phase 5. Stated so
       *  the page can say it rather than imply on-track. */
      datesAvailable: titles.some((t) => t.launchDate !== null),
    })
  } catch (err) {
    console.error('[publisher/lobby] failed:', err)
    return NextResponse.json({ error: 'lobby_failed' }, { status: 500 })
  }
}
