import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id]/design/cover
// Returns the currently-selected cover concept for this project.
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

  const { data, error } = await supabase
    .from('publishing_progress')
    .select('selected_cover_url')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ selected: data?.selected_cover_url ?? null })
}

// POST /api/projects/[id]/design/cover
// Body: { selected: string | null }
// Persists the selection to publishing_progress.selected_cover_url.
// For v1 the value is a placeholder identifier ('concept-1'..'concept-4');
// when real cover generation is wired in this becomes a real image URL.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as { selected?: string | null } | null
  if (body === null) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  const selected = body.selected ?? null

  // Verify ownership before writing.
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
    .select('id')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Upsert into publishing_progress — many projects won't have a row yet.
  const { error: upsertError } = await supabase
    .from('publishing_progress')
    .upsert(
      {
        manuscript_id: id,
        selected_cover_url: selected,
      },
      { onConflict: 'manuscript_id' }
    )

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ selected })
}
