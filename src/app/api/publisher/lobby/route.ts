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
// ─── Dates: what we are measured against, and what we are not ───────────────
// Oliver is buying certainty about DATES. When this route was written the
// estate held no target date for any book in production — the only date was a
// marketing-phase launch date set at the LAST station — so "late" was not
// computable and the surface said so rather than implying otherwise.
//
// `title_target_dates` (applied 2026-09-29) replaced that, and it holds TWO
// kinds. Only the HANDOFF date feeds risk, because it is the only one we
// control; a PUBLICATION date includes composition and distribution, which are
// the publisher's. We display it and are never measured on it.
//
// `riskBasis` survives all of this unchanged and is still the load-bearing
// half: it names what the judgement was made FROM — 'date', 'stall' or
// 'none' — so a surface can never report "on track" computed from nothing.
// A missing date reads as "no date set", never as safety.

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
  /** What we are measured against. Ours. */
  handoffDate: string | null
  /** The publisher's own date, including the last mile. Context only. */
  publicationDate: string | null
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
      ? 'manuscript_id, phase_number, phase_status, editor_name, started_at, completed_at, completion_source'
      : 'manuscript_id, phase_number, phase_status, editor_name, started_at, completed_at'

    const { data: phases } = await supabaseAdmin
      .from('editing_phases')
      .select(phaseColumns)
      .in('manuscript_id', ids)

    // ── TARGET DATES ──────────────────────────────────────────────────────
    // Migrated off `project_marketing.launch_date` (2026-09-29). This route
    // was the LAST live reader of that column, so my own replace-then-drop
    // rule was blocking `marketing-hub`'s drop on my own surface — which is
    // the rule doing exactly what it was written for, pointed at me.
    //
    // TWO KINDS, and only one of them is ours:
    //   handoff     — our seven stations. THE ONLY DATE RISK IS MEASURED
    //                 AGAINST, because it is the only one we control.
    //   publication — the publisher's, including the last mile we do not own
    //                 (composition, distribution). CONTEXT ONLY. It never
    //                 reaches deriveRisk, so we are never reported late
    //                 against a calendar that is not ours.
    //
    // ORDERED ON `seq`, NEVER `created_at`. `created_at DEFAULT now()` is
    // TRANSACTION time, so two revisions in one transaction tie and "the
    // latest row" stops being a single row. That was a defect in my own DDL;
    // commissioning caught what two readings of it had not.
    const { data: targetDates } = await supabaseAdmin
      .from('title_target_dates')
      .select('manuscript_id, kind, target_date, seq')
      .in('manuscript_id', ids)
      .order('seq', { ascending: false })

    const handoffByManuscript = new Map<string, string>()
    const publicationByManuscript = new Map<string, string>()
    for (const row of (targetDates ?? []) as {
      manuscript_id: string
      kind: string
      target_date: string
    }[]) {
      // Rows arrive newest-first, so the first one seen per key is current.
      const target = row.kind === 'handoff' ? handoffByManuscript : publicationByManuscript
      if (!target.has(row.manuscript_id)) target.set(row.manuscript_id, row.target_date)
    }

    type PhaseRow = {
      manuscript_id: string
      phase_number: number
      phase_status: string
      editor_name: string | null
      started_at: string | null
      completed_at: string | null
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

      // ── `updated_at` is NOT an activity signal ─────────────────────────
      // It was in this list as a last-resort fallback and it was wrong.
      // `updated_at` records that a ROW WAS TOUCHED, not that a BOOK MOVED —
      // a migration, a backfill, any write at all bumps it. `sysadmin` found
      // it hiding stalls on real titles today: a 249-day stall read as 6 days
      // because their migration had touched the rows six days earlier.
      //
      // That is this estate's recurring defect in its purest form — a column
      // answering a different question from the one being asked of it. The
      // Lobby's entire job is "what is late", so a fallback that silently
      // converts "nothing has happened for eight months" into "moved this
      // week" is not a rounding error, it is the surface lying.
      //
      // Only two stamps mean a station moved: it started, or it completed.
      const stamps = ps
        .flatMap((p) => [p.completed_at, p.started_at])
        .filter((s): s is string => Boolean(s))
        .sort()
      const lastActivityAt = stamps.length > 0 ? stamps[stamps.length - 1] : null
      const daysSinceActivity =
        lastActivityAt !== null ? daysBetween(lastActivityAt, now) : null

      const handoffDate = handoffByManuscript.get(r.id) ?? null
      const publicationDate = publicationByManuscript.get(r.id) ?? null

      const currentPhase = active?.phase_number ?? null
      const gateInfo = currentPhase !== null ? GATE[currentPhase] : undefined

      // Only the HANDOFF date feeds risk. A publication date is the
      // publisher's own commitment and includes two stages we do not own, so
      // measuring ourselves against it would be reporting a slip we did not
      // cause. Absent stays absent: null means "no date set", never "on time".
      const daysToLaunch = handoffDate !== null ? -daysBetween(handoffDate, now) : null
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
        handoffDate,
        publicationDate,
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
      datesAvailable: titles.some((t) => t.handoffDate !== null),
    })
  } catch (err) {
    console.error('[publisher/lobby] failed:', err)
    return NextResponse.json({ error: 'lobby_failed' }, { status: 500 })
  }
}
