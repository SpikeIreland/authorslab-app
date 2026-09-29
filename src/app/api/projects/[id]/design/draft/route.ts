import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// The studio's working document. One row per manuscript (cover_drafts is
// UNIQUE(manuscript_id)); RLS scopes reads and writes to the author.

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
    .from('cover_drafts')
    .select('doc, updated_at')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ doc: data?.doc ?? null, updatedAt: data?.updated_at ?? null })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Ownership check mirrors the sibling routes.
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

  const body = await req.json().catch(() => null) as { doc?: unknown } | null
  if (!body?.doc || typeof body.doc !== 'object') {
    return NextResponse.json({ error: 'missing doc' }, { status: 400 })
  }
  // Size guard: the doc is a small layer list, never megabytes.
  if (JSON.stringify(body.doc).length > 100_000) {
    return NextResponse.json({ error: 'doc too large' }, { status: 413 })
  }

  const { error: upsertError } = await supabase
    .from('cover_drafts')
    .upsert(
      { manuscript_id: id, doc: body.doc, updated_by: user.id, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' }
    )
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }
  return NextResponse.json({ saved: true })
}
