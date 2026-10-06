import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { gatePublisherManuscript } from '@/lib/publisher/gateManuscript'

/**
 * GET /api/publisher/projects/[id]/overview — A4.
 *
 * The payload behind the rebuilt per-book Overview. Paul, 2026-10-06:
 * "I want to go to an Overview page, but not the one that we currently have
 * because it is terrible. The Author's version of the Overview is much better
 * because it contains things like the collateral list."
 *
 * So this route is the publisher-shaped twin of
 * `/api/projects/[id]/overview` — the same three things that make the author's
 * Overview good (the book as an object, the shelf of documents, where it is in
 * the line) with the one thing that makes it wrong here removed.
 *
 * ─── Gated, unlike its four siblings ────────────────────────────────────────
 * `gatePublisherManuscript()` on the first line of the handler. The four
 * existing per-book publisher routes shipped with the service role and NO
 * caller check at all (closed 2026-10-06, same turn as this file). This route
 * reads the same data and is written gate-first so the question cannot be
 * deferred to a header sentence again.
 *
 * ─── Two deliberate exclusions ──────────────────────────────────────────────
 *
 * 1. NO `original_upload_url`. The author route puts "Your uploaded
 *    manuscript" on the shelf. The house's collateral is what the LINE
 *    PRODUCED — assessments, notes, approved drafts, the cover. An author's
 *    raw original file is their working material, not a deliverable of the
 *    line, and Paul's standing objection to this page was that it was "too
 *    intrusive on an Author's work". A publisher who needs to read the book
 *    reads it in the reading room, chapter by chapter, where the reading is
 *    recorded. Reversible in one line if Paul rules the other way.
 *
 * 2. NO cost or price field, by construction — Paul's standing position is
 *    that we leave the room without disclosing a price to a publisher. No
 *    column selected here carries one.
 */

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export interface PublisherCollateralDoc {
  id: string
  label: string
  kind: 'assessment' | 'line_notes' | 'copy_notes' | 'draft' | 'cover'
  url: string
  meta?: string
}

export interface PublisherOverviewStation {
  key: string
  name: string
  state: 'complete' | 'in-progress' | 'not-started'
  /** The reader who prepared it, where one is recorded. Never defaulted. */
  editorName: string | null
  completedAt: string | null
  /** Evidence, not a guess: null where the column is empty. */
  chaptersAnalyzed: number | null
  chaptersApproved: number | null
  /**
   * The three fields `StationMark` needs, derived by EXACTLY the rule the
   * lobby route uses (route.ts ~573) so one title cannot read differently on
   * the list and on its own page.
   *
   * `completedBy` is null when the station is not complete OR when
   * `completion_source` says neither 'system' nor 'human' — which reads as
   * UNKNOWN, never as system. StationMark renders that as the neutral
   * "reached" mark rather than the green "done", which is the whole reason
   * null must not be collapsed into a default here.
   */
  completedBy: 'system' | 'human' | null
  /** Only a HUMAN completion may carry a name. Null means not recorded. */
  completedByName: string | null
  operator: string | null
}

export interface PublisherOverviewPayload {
  title: {
    id: string
    title: string
    genre: string | null
    totalChapters: number | null
    wordCount: number | null
    coverUrl: string | null
    /** Whether a cover ASSET exists, as distinct from a selection. */
    hasCoverAsset: boolean
    authorName: string | null
    addedAt: string | null
    updatedAt: string
  }
  list: { imprintName: string; organisationName: string | null } | null
  stations: PublisherOverviewStation[]
  collateral: PublisherCollateralDoc[]
}

/** The five working stations, in journey order. Names are the house's. */
const STATION_DEFAULTS = [
  { n: 1, key: 'developmental', name: 'Developmental' },
  { n: 2, key: 'line_editing', name: 'Line' },
  { n: 3, key: 'copy_editing', name: 'Copy' },
  { n: 4, key: 'publishing', name: 'Publishing' },
  { n: 5, key: 'marketing', name: 'Marketing' },
] as const

interface PhaseRow {
  phase_number: number
  phase_status: string | null
  editor_name: string | null
  chapters_analyzed: number | null
  chapters_approved: number | null
  report_pdf_url: string | null
  completed_at: string | null
  completion_source?: string | null
  completed_by_label?: string | null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const gate = await gatePublisherManuscript(id)
  if (!gate.ok) return gate.refusal

  try {
    const { data: ms, error: msError } = await supabaseAdmin
      .from('manuscripts')
      .select(
        `
          id, title, genre, total_chapters, current_word_count,
          current_phase_number, status, created_at, updated_at,
          imprints ( name, organisations ( name ) ),
          author_profiles!inner ( first_name, last_name )
        `
      )
      .eq('id', id)
      .maybeSingle()

    if (msError) {
      console.error(`publisher overview ${id}: read failed:`, msError)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }
    if (!ms) {
      // The gate already proved it exists and is in scope, so a miss here is
      // a race or a deleted row — not a scope refusal. Say so honestly.
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const row = ms as Record<string, unknown>

    const [phasesRes, versionsRes, progressRes, assetsRes] = await Promise.all([
      supabaseAdmin
        .from('editing_phases')
        .select('phase_number, phase_status, editor_name, chapters_analyzed, chapters_approved, report_pdf_url, completed_at, completion_source, completed_by_label')
        .eq('manuscript_id', id)
        .order('phase_number', { ascending: true }),
      supabaseAdmin
        .from('manuscript_versions')
        .select('id, phase_number, version_type, word_count, created_by_editor, created_at')
        .eq('manuscript_id', id)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('publishing_progress')
        .select('selected_cover_url')
        .eq('manuscript_id', id)
        .maybeSingle(),
      supabaseAdmin
        .from('cover_assets')
        .select('id')
        .eq('manuscript_id', id)
        .limit(1),
    ])

    // ── Stations ─────────────────────────────────────────────────────────────
    const phaseByNumber = new Map<number, PhaseRow>()
    for (const p of (phasesRes.data ?? []) as PhaseRow[]) phaseByNumber.set(p.phase_number, p)

    const currentPhase = (row.current_phase_number as number | null) ?? 1
    const msStatus = (row.status as string | null) ?? ''

    const stations: PublisherOverviewStation[] = STATION_DEFAULTS.map((def) => {
      const p = phaseByNumber.get(def.n)

      // Same fallback rule the author stepper and the lobby cards use, so one
      // title cannot read differently on two surfaces.
      let state: PublisherOverviewStation['state']
      if (p?.phase_status === 'complete') state = 'complete'
      else if (p?.phase_status === 'active') state = 'in-progress'
      else if (p?.phase_status === 'pending') state = 'not-started'
      else if (msStatus === 'complete') state = 'complete'
      else if (def.n < currentPhase) state = 'complete'
      else if (def.n === currentPhase) state = 'in-progress'
      else state = 'not-started'

      return {
        key: def.key,
        name: def.name,
        state,
        // NOT defaulted to Alex/Sam/Jordan. The author route pads these with
        // persona names; doing that here would name a person on a station
        // nobody has worked, in front of the house. Absent is shown as absent.
        editorName: p?.editor_name ?? null,
        completedAt: p?.completed_at ?? null,
        chaptersAnalyzed: p?.chapters_analyzed ?? null,
        chaptersApproved: p?.chapters_approved ?? null,
        completedBy:
          state === 'complete' &&
          (p?.completion_source === 'system' || p?.completion_source === 'human')
            ? p.completion_source
            : null,
        completedByName:
          state === 'complete' && p?.completion_source === 'human'
            ? p?.completed_by_label ?? null
            : null,
        operator: p?.editor_name ?? null,
      }
    })

    // ── Collateral — what the line produced ──────────────────────────────────
    const collateral: PublisherCollateralDoc[] = []

    const REPORT_LABEL: Record<number, { label: string; kind: PublisherCollateralDoc['kind'] }> = {
      1: { label: 'Developmental assessment', kind: 'assessment' },
      2: { label: 'Line notes', kind: 'line_notes' },
      3: { label: 'Copy notes', kind: 'copy_notes' },
    }

    for (const p of (phasesRes.data ?? []) as PhaseRow[]) {
      if (!p.report_pdf_url) continue
      const m = REPORT_LABEL[p.phase_number]
      if (!m) continue
      collateral.push({
        id: `report-${p.phase_number}`,
        label: p.editor_name ? `${m.label} · ${p.editor_name}` : m.label,
        kind: m.kind,
        url: p.report_pdf_url,
        meta: 'PDF',
      })
    }

    // ── APPROVED DRAFTS: deliberately NOT on the shelf yet ───────────────────
    //
    // The author route builds `/api/projects/[id]/versions/[versionId]` for
    // each approved snapshot and `ShelfDocuments` renders it as a link.
    // MEASURED 2026-10-06: THAT ROUTE DOES NOT EXIST. The only `versions`
    // route anywhere under src/app/api is `projects/[id]/design/versions`,
    // which is the cover composer's and takes no version id in its path. So
    // every approved-draft row on the AUTHOR's own shelf is a dead link
    // today — found by porting the component, and couriered to the author
    // lanes rather than fixed here.
    //
    // The publisher shelf therefore does not carry drafts. Writing the same
    // URL under `/api/publisher/...` would have produced a row that looks
    // like a document, says how many words it has, and 404s on click — an
    // affordance is a claim, and this one would have been false the moment it
    // shipped. The rows come back the day a route serves them, and the query
    // above stays so the data is already in hand when it does.
    //
    // `versionsRes` is intentionally left unread. Removing the query would
    // make the omission invisible to the next reader.
    void versionsRes

    const coverUrl = (progressRes.data?.selected_cover_url as string | null) ?? null
    if (coverUrl) {
      collateral.push({ id: 'cover', label: 'Selected cover', kind: 'cover', url: coverUrl, meta: 'Image' })
    }

    // ── Imprint / organisation, normalised ──────────────────────────────────
    // Supabase returns an embedded to-one as an object OR a single-element
    // array depending on how it infers the relationship, so normalise rather
    // than assume — the same trap the sibling route documents.
    const rawImprint = row.imprints as
      | { name: string; organisations?: { name: string } | { name: string }[] }
      | { name: string; organisations?: { name: string } | { name: string }[] }[]
      | null
      | undefined
    const imprint = Array.isArray(rawImprint) ? rawImprint[0] : rawImprint
    const rawOrg = imprint?.organisations
    const org = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg

    const rawAuthor = row.author_profiles as
      | { first_name: string | null; last_name: string | null }
      | { first_name: string | null; last_name: string | null }[]
      | null
      | undefined
    const author = Array.isArray(rawAuthor) ? rawAuthor[0] : rawAuthor
    const authorName =
      [author?.first_name, author?.last_name].filter(Boolean).join(' ').trim() || null

    const payload: PublisherOverviewPayload = {
      title: {
        id: row.id as string,
        title: (row.title as string | null) ?? 'Untitled',
        genre: (row.genre as string | null) ?? null,
        totalChapters: (row.total_chapters as number | null) ?? null,
        wordCount: (row.current_word_count as number | null) ?? null,
        coverUrl,
        hasCoverAsset: (assetsRes.data?.length ?? 0) > 0,
        authorName,
        addedAt: (row.created_at as string | null) ?? null,
        updatedAt: row.updated_at as string,
      },
      list: imprint
        ? { imprintName: imprint.name, organisationName: org?.name ?? null }
        : null,
      stations,
      collateral,
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error(`publisher overview ${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
