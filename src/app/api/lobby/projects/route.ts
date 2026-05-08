import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Shape returned to the frontend. Keep this stable; the Lobby page's render
// logic is built around it.
export interface LobbyProject {
  id: string
  title: string
  genre: string | null
  word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  cover_url: string | null
}

// GET /api/lobby/projects
// Returns the current author's manuscripts for the Lobby, with cover URL
// pulled from publishing_progress when available.
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  // Manuscripts owned by this author.
  const { data: manuscripts, error: msError } = await supabase
    .from('manuscripts')
    .select('id, title, genre, current_word_count, current_phase_number, status, updated_at')
    .eq('author_id', profile.id)
    .order('updated_at', { ascending: false })
  if (msError) {
    return NextResponse.json({ error: msError.message }, { status: 500 })
  }

  if (!manuscripts || manuscripts.length === 0) {
    return NextResponse.json({ projects: [] })
  }

  // Pull cover URLs from publishing_progress in one query (best-effort).
  const ids = manuscripts.map(m => m.id)
  const { data: progress } = await supabase
    .from('publishing_progress')
    .select('manuscript_id, selected_cover_url')
    .in('manuscript_id', ids)

  const coverByManuscript = new Map<string, string | null>()
  for (const row of progress ?? []) {
    coverByManuscript.set(row.manuscript_id, row.selected_cover_url ?? null)
  }

  const projects: LobbyProject[] = manuscripts.map(m => ({
    id: m.id,
    title: m.title ?? 'Untitled project',
    genre: m.genre,
    word_count: m.current_word_count,
    current_phase_number: m.current_phase_number,
    status: m.status,
    updated_at: m.updated_at,
    cover_url: coverByManuscript.get(m.id) ?? null,
  }))

  return NextResponse.json({ projects })
}
