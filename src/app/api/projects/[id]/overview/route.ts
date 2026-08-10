import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Shape returned to the Overview client. Keep stable — components are built
// around it.
export interface OverviewShelfDoc {
  /** Stable-ish identifier for React key. */
  id: string
  /** Human-readable label ("Alex's Developmental Assessment", "Chapter 4 draft"). */
  label: string
  /** Kind hint for icon/spine colour. */
  kind: 'assessment' | 'line_notes' | 'copy_notes' | 'manuscript' | 'draft' | 'cover'
  /** Absolute or signed URL to open. */
  url: string
  /** Optional secondary text ("PDF · 2 pages", "12 May 2026"). */
  meta?: string
}

export interface OverviewPhase {
  phase_number: number
  phase_name: string
  phase_status: 'pending' | 'active' | 'complete' | 'skipped' | 'on_hold'
  editor_name: string | null
  chapters_analyzed: number
  chapters_approved: number
  report_pdf_url: string | null
  completed_at: string | null
}

export interface OverviewPayload {
  manuscript: {
    id: string
    title: string
    genre: string | null
    total_chapters: number
    current_word_count: number | null
    current_phase_number: number | null
    status: string | null
    created_at: string
    updated_at: string
    cover_url: string | null
  }
  /** All five phases (padded with defaults if editing_phases isn't populated). */
  phases: OverviewPhase[]
  /** Documents ready to open (assessments, line/copy notes, manuscript versions, cover). */
  shelf: OverviewShelfDoc[]
  /** Live progress for the current phase — "chapter X of Y". */
  current_progress: {
    phase_number: number
    label: string      // e.g. "Chapter 4 of 12"
    approved: number
    total: number
  } | null
}

// GET /api/projects/[id]/overview
// Returns everything the Overview tab needs to render in one call: manuscript
// basics, per-phase status, chapter progress for the active phase, and the
// document shelf.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  const { data: manuscript, error: msError } = await supabase
    .from('manuscripts')
    .select(
      'id, title, genre, total_chapters, current_word_count, current_phase_number, status, created_at, updated_at, original_upload_url, report_pdf_url'
    )
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (msError || !manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  const [phasesRes, chaptersRes, versionsRes, coverRes] = await Promise.all([
    supabase
      .from('editing_phases')
      .select('phase_number, phase_name, phase_status, editor_name, chapters_analyzed, chapters_approved, report_pdf_url, completed_at')
      .eq('manuscript_id', id)
      .order('phase_number', { ascending: true }),
    supabase
      .from('chapters')
      .select('id, phase_1_approved_at, phase_2_approved_at, phase_3_approved_at')
      .eq('manuscript_id', id),
    supabase
      .from('manuscript_versions')
      .select('id, phase_number, version_type, word_count, created_by_editor, created_at')
      .eq('manuscript_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('publishing_progress')
      .select('selected_cover_url')
      .eq('manuscript_id', id)
      .maybeSingle(),
  ])

  // ----- Phases (pad missing with defaults so the stepper always has 5) -----
  const currentPhase = manuscript.current_phase_number ?? 1
  const msStatus = manuscript.status ?? ''

  interface EditingPhaseRow {
    phase_number: number
    phase_name: string | null
    phase_status: string | null
    editor_name: string | null
    chapters_analyzed: number | null
    chapters_approved: number | null
    report_pdf_url: string | null
    report_generated_at: string | null
    completed_at: string | null
  }
  const phaseByNumber = new Map<number, EditingPhaseRow>()
  for (const p of (phasesRes.data ?? []) as EditingPhaseRow[]) phaseByNumber.set(p.phase_number, p)

  const PHASE_DEFAULTS: { n: number; name: string; editor: string | null }[] = [
    { n: 1, name: 'developmental', editor: 'Alex' },
    { n: 2, name: 'line_editing', editor: 'Sam' },
    { n: 3, name: 'copy_editing', editor: 'Jordan' },
    { n: 4, name: 'publishing', editor: 'Taylor' },
    { n: 5, name: 'marketing', editor: 'Kai' },
  ]

  const phases: OverviewPhase[] = PHASE_DEFAULTS.map(def => {
    const row = phaseByNumber.get(def.n)

    // Derive status if editing_phases isn't populated (falls back to
    // current_phase_number + manuscript status, same rule the ProjectTabStrip
    // and Lobby cards use).
    let status: OverviewPhase['phase_status']
    if (row?.phase_status && ['pending', 'active', 'complete', 'skipped', 'on_hold'].includes(row.phase_status)) {
      status = row.phase_status as OverviewPhase['phase_status']
    } else if (msStatus === 'complete') {
      status = 'complete'
    } else if (def.n < currentPhase) {
      status = 'complete'
    } else if (def.n === currentPhase) {
      status = 'active'
    } else {
      status = 'pending'
    }

    return {
      phase_number: def.n,
      phase_name: (row?.phase_name ?? def.name) as string,
      phase_status: status,
      editor_name: row?.editor_name ?? def.editor,
      chapters_analyzed: row?.chapters_analyzed ?? 0,
      chapters_approved: row?.chapters_approved ?? 0,
      report_pdf_url: row?.report_pdf_url ?? null,
      completed_at: row?.completed_at ?? null,
    }
  })

  // ----- Current-phase live progress -----
  let currentProgress: OverviewPayload['current_progress'] = null
  if (currentPhase >= 1 && currentPhase <= 3 && chaptersRes.data) {
    const total = manuscript.total_chapters && manuscript.total_chapters > 0
      ? manuscript.total_chapters
      : chaptersRes.data.length
    const col = currentPhase === 1 ? 'phase_1_approved_at' : currentPhase === 2 ? 'phase_2_approved_at' : 'phase_3_approved_at'
    interface ChapterApprovalRow {
      phase_1_approved_at: string | null
      phase_2_approved_at: string | null
      phase_3_approved_at: string | null
    }
    const approved = (chaptersRes.data as ChapterApprovalRow[]).filter(c => c[col as keyof ChapterApprovalRow]).length
    if (total > 0) {
      currentProgress = {
        phase_number: currentPhase,
        label: `Chapter ${Math.min(approved + 1, total)} of ${total}`,
        approved,
        total,
      }
    }
  }

  // ----- Shelf documents -----
  const shelf: OverviewShelfDoc[] = []

  // Original upload
  if (manuscript.original_upload_url) {
    shelf.push({
      id: 'upload',
      label: 'Your uploaded manuscript',
      kind: 'manuscript',
      url: manuscript.original_upload_url,
      meta: 'Original file',
    })
  }

  // Phase reports (Alex assessment, Sam line notes, Jordan copy notes)
  for (const p of phases) {
    if (!p.report_pdf_url) continue
    let label = ''
    let kind: OverviewShelfDoc['kind'] = 'assessment'
    if (p.phase_number === 1) { label = `${p.editor_name ?? 'Alex'}'s Developmental Assessment`; kind = 'assessment' }
    else if (p.phase_number === 2) { label = `${p.editor_name ?? 'Sam'}'s Line Notes`; kind = 'line_notes' }
    else if (p.phase_number === 3) { label = `${p.editor_name ?? 'Jordan'}'s Copy Notes`; kind = 'copy_notes' }
    else { label = `Phase ${p.phase_number} report` }
    shelf.push({
      id: `phase-${p.phase_number}-report`,
      label,
      kind,
      url: p.report_pdf_url,
      meta: 'PDF',
    })
  }

  // Manuscript-level full analysis (Alex initial assessment fallback)
  if (manuscript.report_pdf_url && !phases[0]?.report_pdf_url) {
    shelf.push({
      id: 'full-analysis',
      label: 'Manuscript Assessment',
      kind: 'assessment',
      url: manuscript.report_pdf_url,
      meta: 'PDF',
    })
  }

  // Approved-snapshot manuscript versions (latest of each phase)
  interface ManuscriptVersionRow {
    id: string
    phase_number: number
    version_type: string
    word_count: number | null
    created_by_editor: string | null
    created_at: string
  }
  const seenPhaseVersion = new Set<number>()
  for (const v of (versionsRes.data ?? []) as ManuscriptVersionRow[]) {
    if (v.version_type !== 'approved_snapshot') continue
    if (seenPhaseVersion.has(v.phase_number)) continue
    seenPhaseVersion.add(v.phase_number)
    const editor = v.created_by_editor
    const phaseLabel = v.phase_number === 1 ? 'Developmental' : v.phase_number === 2 ? 'Line-edited' : v.phase_number === 3 ? 'Copy-edited' : `Phase ${v.phase_number}`
    shelf.push({
      id: `version-${v.id}`,
      label: `${phaseLabel} draft${editor ? ` · ${editor}` : ''}`,
      kind: 'draft',
      url: `/api/projects/${id}/versions/${v.id}`,
      meta: v.word_count ? `${v.word_count.toLocaleString()} words` : undefined,
    })
  }

  // Cover
  const coverUrl = coverRes.data?.selected_cover_url ?? null
  if (coverUrl) {
    shelf.push({
      id: 'cover',
      label: 'Cover',
      kind: 'cover',
      url: coverUrl,
      meta: 'Image',
    })
  }

  const payload: OverviewPayload = {
    manuscript: {
      id: manuscript.id,
      title: manuscript.title ?? 'Untitled project',
      genre: manuscript.genre,
      total_chapters: manuscript.total_chapters ?? 0,
      current_word_count: manuscript.current_word_count,
      current_phase_number: manuscript.current_phase_number,
      status: manuscript.status,
      created_at: manuscript.created_at,
      updated_at: manuscript.updated_at,
      cover_url: coverUrl,
    },
    phases,
    shelf,
    current_progress: currentProgress,
  }

  return NextResponse.json(payload)
}
