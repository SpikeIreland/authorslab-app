import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Shape of the response — used by the Author Studio bridge view.
export interface AuthorStudioState {
  editors: Array<{
    name: 'Alex' | 'Sam' | 'Jordan'
    phase: 1 | 2 | 3
    role: string
    status: 'pending' | 'active' | 'complete'
    color: string
  }>
  chapters: Array<{
    id: string
    chapter_number: number
    title: string
    word_count: number | null
    dev_approved: boolean
    line_approved: boolean
    copy_approved: boolean
    has_unresolved_issues: boolean
  }>
  current_phase_number: number | null
  open_issues_count: number
  total_chapters: number
  approved_for_dev: number
  approved_for_line: number
  approved_for_copy: number
}

// GET /api/projects/[id]/author-studio/state
// Returns enough state to render the Author Studio bridge view inside the
// project shell — editor states, per-chapter approval status, recent issue
// counts.
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

  // Verify ownership and grab the manuscript's current phase.
  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id, current_phase_number')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Capture the phase value so the closure below doesn't trip TypeScript's
  // narrowing limits (the early-return narrowing doesn't propagate into nested
  // function scopes).
  const currentPhase: number = manuscript.current_phase_number ?? 1

  // Pull editing_phases for richer status (some manuscripts may not have these
  // populated, in which case we fall back to current_phase_number).
  const { data: phases } = await supabase
    .from('editing_phases')
    .select('phase_number, phase_status')
    .eq('manuscript_id', id)

  const phaseMap = new Map<number, string>()
  for (const p of phases ?? []) {
    phaseMap.set(p.phase_number, p.phase_status)
  }

  function statusFor(phase: 1 | 2 | 3): 'pending' | 'active' | 'complete' {
    const s = phaseMap.get(phase)
    if (s === 'complete') return 'complete'
    if (s === 'active') return 'active'
    if (s === 'pending') return 'pending'

    // Fall back to current_phase_number when editing_phases isn't populated.
    if (phase < currentPhase) return 'complete'
    if (phase === currentPhase) return 'active'
    return 'pending'
  }

  // Pull chapters and unresolved issues.
  const [chaptersRes, issuesRes] = await Promise.all([
    supabase
      .from('chapters')
      .select('id, chapter_number, title, word_count, phase_1_approved_at, phase_2_approved_at, phase_3_approved_at')
      .eq('manuscript_id', id)
      .order('chapter_number', { ascending: true }),
    supabase
      .from('manuscript_issues')
      .select('chapter_number, status')
      .eq('manuscript_id', id)
      .neq('status', 'resolved')
      .neq('status', 'dismissed'),
  ])

  if (chaptersRes.error) {
    return NextResponse.json({ error: chaptersRes.error.message }, { status: 500 })
  }

  const unresolvedByChapter = new Set<number>()
  for (const issue of issuesRes.data ?? []) {
    unresolvedByChapter.add(issue.chapter_number)
  }

  let approvedForDev = 0, approvedForLine = 0, approvedForCopy = 0
  const chapters = (chaptersRes.data ?? []).map(ch => {
    const dev = ch.phase_1_approved_at !== null
    const line = ch.phase_2_approved_at !== null
    const copy = ch.phase_3_approved_at !== null
    if (dev) approvedForDev++
    if (line) approvedForLine++
    if (copy) approvedForCopy++

    return {
      id: ch.id,
      chapter_number: ch.chapter_number,
      title: ch.title ?? `Chapter ${ch.chapter_number}`,
      word_count: ch.word_count,
      dev_approved: dev,
      line_approved: line,
      copy_approved: copy,
      has_unresolved_issues: unresolvedByChapter.has(ch.chapter_number),
    }
  })

  const state: AuthorStudioState = {
    editors: [
      { name: 'Alex',   phase: 1, role: 'Developmental editing', status: statusFor(1), color: '#639922' },
      { name: 'Sam',    phase: 2, role: 'Line editing',          status: statusFor(2), color: '#7F77DD' },
      { name: 'Jordan', phase: 3, role: 'Copy editing',          status: statusFor(3), color: '#378ADD' },
    ],
    chapters,
    current_phase_number: manuscript.current_phase_number,
    open_issues_count: issuesRes.data?.length ?? 0,
    total_chapters: chapters.length,
    approved_for_dev: approvedForDev,
    approved_for_line: approvedForLine,
    approved_for_copy: approvedForCopy,
  }

  return NextResponse.json(state)
}
