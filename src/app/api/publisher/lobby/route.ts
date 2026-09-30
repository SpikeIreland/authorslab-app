import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  resolvePublisherIdentity,
  type PublisherIdentity,
} from '@/lib/publisher/identity'
import {
  deriveRegister,
  deriveRisk,
  LAST_PHASE,

  RISK_ORDER,
  type Register,
  type Risk,
  type RiskBasis,
} from './_derive'

// GET /api/publisher/lobby
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
// ─── TENANCY COMES FROM THE CALLER, NOT FROM THE URL (2026-09-30) ───────────
// This route used to take `?org=<slug>` and answer for whichever house the
// caller named. That was honest when there was no caller identity to read —
// and it stopped being honest at 01:26 today, when `sysadmin` seeded two live
// seats and `identity-billing` commissioned `can_read_manuscript()`'s
// publisher-staff leg returning TRUE for the first time.
//
// It is replaced by `resolvePublisherIdentity()`. Two defects go with it:
//
// 1. A TENANCY KEY THE CLIENT CHOOSES. `identity-billing`'s People engine
//    states the rule I was breaking: *"a tenancy key that arrives in a
//    request body is a tenancy key the client can change."* One organisation
//    exists today, so nothing leaked — but the hole was in the shape, not in
//    the data, and a second organisation would have opened it without a code
//    change.
//
// 2. A SCOPED MEMBER SEEING THE WHOLE HOUSE. The imprint list came from
//    `imprints WHERE organisation_id = org`, which is the ORGANISATION's
//    imprints and not the CALLER's. `identity-billing` named this in advance
//    and named it as mine: *"an owner sees 9 titles, an imprint-scoped member
//    sees 5, and if the Lobby ever shows a member all nine that is a SURFACE
//    bug, not a permissions one, because the database has already refused
//    four of them."* It would have shown nine. Monday runs as that member.
//
// The imprint set is now `identity.imprints` in both cases and there is no
// branch on role in this file: the resolver answers "which imprints may this
// caller see" once, under the caller's own session with RLS as a second
// check, and this route scopes to that answer. A surface re-deriving scope
// from a role is a second implementation of an authorisation rule.
//
// ─── What this route does NOT claim ──────────────────────────────────────────
// 1. THAT `authorised: true` MEANS ROW-LEVEL ENFORCEMENT. It means the
//    caller's membership was resolved and the list was scoped to it. The rows
//    themselves are still read with the service role, because this route
//    aggregates five tables and RLS on `editing_phases` is not written for
//    publisher staff. The authorisation is therefore IN CODE, standing on a
//    scope computed under RLS — one mechanism, not two, and said so here
//    rather than implied by the flag.
//
// 2. THE REGISTER SPLIT, when the schema cannot support it. A title is "on
//    the line" when a STATION HAS BEEN COMPLETED BY THE SYSTEM, which needs
//    `editing_phases.completion_source` (applied 2026-09-29). The probe below
//    stays: the column exists today and the split must report UNAVAILABLE,
//    never guess, if it ever stops existing.
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
  /** The seven stations, for the dashboard. */
  stations: StationCell[]
}

/**
 * THE SEVEN STATIONS, as the dashboard draws them.
 *
 * The same line the portal shows for one book, drawn across the whole list so
 * progress is legible at a glance to everyone in the house. Station 1 is the
 * author's submission and station 7 is the boundary — our stations complete,
 * the book handed off. Neither is an editing phase, which is why they are
 * named here rather than derived from `editing_phases`.
 */
export const STATIONS = [
  { key: 'manuscript', name: 'Manuscript', phase: null },
  { key: 'developmental', name: 'Developmental', phase: 1 },
  { key: 'line', name: 'Line', phase: 2 },
  { key: 'copy', name: 'Copy', phase: 3 },
  { key: 'publishing', name: 'Publishing', phase: 4 },
  { key: 'marketing', name: 'Marketing', phase: 5 },
  { key: 'handoff', name: 'Handoff', phase: null },
] as const

export interface StationCell {
  key: string
  name: string
  state: 'complete' | 'in-progress' | 'not-started'
  /**
   * WHAT completed it, never a guess. 'system' when the machine ran it,
   * 'human' when a person recorded it, null when it is not complete or when
   * `completion_source` is absent — which reads as UNKNOWN, never as system.
   */
  completedBy: 'system' | 'human' | null
  /**
   * WHO recorded it, when the estate knows. `sysadmin` applied
   * `completed_by_membership_id` + `completed_by_label` on 2026-09-30,
   * constrained so only a human completion can carry a name — the machine
   * does not get one — and DELIBERATELY NOT BACKFILLED.
   *
   * So null here means "not recorded", and on every row that predates today
   * that is exactly what is true. Monday reads "by hand", not "Jacky".
   * Inventing a name for a station whose actor was never captured is the
   * fabricated-attribution defect I removed from the Communications thread,
   * and it would be worse here because a station mark is a claim about a
   * colleague's work.
   */
  completedByName: string | null
  /** The named operator on an editing station, from the row. */
  operator: string | null
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

export async function GET() {
  let identity: PublisherIdentity | null

  try {
    identity = await resolvePublisherIdentity()
  } catch (err) {
    // `identity.ts` THROWS rather than guess when a user holds two active
    // memberships and no org switcher exists. That refusal is right and I am
    // not softening it — but a throw falling into this route's catch would
    // reach the page as `lobby_failed`, and "something went wrong" is the
    // wrong report for a state the estate understands perfectly well. Caught
    // and named here; the engine's behaviour is unchanged.
    return NextResponse.json(
      {
        error: 'multi_org_unresolved',
        message: err instanceof Error ? err.message : 'unresolved',
      },
      { status: 409 }
    )
  }

  if (!identity) {
    // No session, no membership, an invitation not accepted, or a suspended
    // seat — the resolver deliberately does not distinguish them, and neither
    // does this route. What the PAGE must not do is render an empty list:
    // "you hold no seat" and "your house has no books" are different
    // sentences and only one of them is true here.
    return NextResponse.json({ error: 'not_a_publisher' }, { status: 403 })
  }

  const org = identity.organisation

  try {
    // THE CALLER'S IMPRINTS, NOT THE ORGANISATION'S. An owner's set is every
    // live imprint in their house; a member's is exactly the rows against
    // their membership. Both are computed in one place, under the caller's own
    // session, with RLS refusing anything outside their org independently.
    const imprintList = identity.imprints.map((i) => ({ id: i.id, name: i.name }))
    const imprintIds = imprintList.map((i) => i.id)
    const imprintNameById = new Map(imprintList.map((i) => [i.id, i.name]))

    const viewer = {
      orgRole: identity.org_role,
      scopeIsWholeOrg: identity.scope_is_whole_org,
      imprintCount: imprintList.length,
    }

    if (imprintIds.length === 0) {
      // TWO DIFFERENT EMPTIES, AND THE PAGE MUST TELL THEM APART.
      //
      // An owner with no imprints has an empty house — nothing has been set
      // up yet, and the answer is to create an imprint. A MEMBER with no
      // imprints has been given a seat and no scope: there may be nine
      // titles two feet away and they are refused all of them. Reporting
      // that as "no titles" would be the surface asserting an emptiness
      // that is not the estate's.
      //
      // This is the House Rule from my own green-box defect, pointed at a
      // different pair: when you split a state in two, name what happens to
      // the state that is neither — and here, name which of the two you are.
      return NextResponse.json({
        authorised: true,
        scope: 'caller-membership',
        organisation: { name: org.name, slug: org.slug },
        viewer,
        imprints: [],
        titles: [],
        registerSplitAvailable: false,
        registerSplitReason: identity.scope_is_whole_org
          ? 'no_imprints_in_organisation'
          : 'no_imprints_assigned_to_you',
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
        authorised: true,
        scope: 'caller-membership',
        organisation: { name: org.name, slug: org.slug },
        viewer,
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

    // `completed_by_label` rides with `completion_source`: both arrived in the
    // same migration, so one probe answers for both. Probing them separately
    // would be two round trips certifying the same fact.
    const phaseColumns = registerSplitAvailable
      ? 'manuscript_id, phase_number, phase_status, editor_name, started_at, completed_at, completion_source, completed_by_label'
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
      completed_by_label?: string | null
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

      const anyPhaseRow = ps.length > 0
      const phase5Complete = ps.some(
        (x) => x.phase_number === LAST_PHASE && x.phase_status === 'complete'
      )

      const stations: StationCell[] = STATIONS.map((st) => {
        if (st.key === 'manuscript') {
          // The author's submission. A book with phase rows has a draft in the
          // system; one without has not arrived.
          return {
            key: st.key,
            name: st.name,
            state: anyPhaseRow ? 'complete' : 'not-started',
            completedBy: null,
            completedByName: null,
            operator: null,
          }
        }
        if (st.key === 'handoff') {
          return {
            key: st.key,
            name: st.name,
            state: phase5Complete ? 'complete' : 'not-started',
            completedBy: null,
            completedByName: null,
            operator: null,
          }
        }
        const row = ps.find((x) => x.phase_number === st.phase)
        const state =
          row?.phase_status === 'complete'
            ? 'complete'
            : row?.phase_status === 'active'
              ? 'in-progress'
              : 'not-started'
        return {
          key: st.key,
          name: st.name,
          state,
          // Only a COMPLETE station can say what completed it, and only when
          // the discriminator is there to say so.
          completedBy:
            state === 'complete' && (row?.completion_source === 'system' || row?.completion_source === 'human')
              ? row.completion_source
              : null,
          // A name only where a HUMAN completion carries one. The CHECK
          // constraint makes a machine completion with a name unwritable, and
          // this condition makes it unreadable too — so a name on a green
          // system mark cannot arrive from either direction.
          completedByName:
            state === 'complete' && row?.completion_source === 'human'
              ? row?.completed_by_label ?? null
              : null,
          operator: row?.editor_name ?? null,
        }
      })

      return {
        stations,
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
      authorised: true,
      scope: 'caller-membership',
      organisation: { name: org.name, slug: org.slug },
      viewer,
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
