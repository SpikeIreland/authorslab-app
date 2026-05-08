import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Shape persisted to publishing_progress.metadata jsonb. Title can override
// the project's display title from manuscripts.title at publish time
// (working title vs. final published title), so we store it here too.
interface BookMetadata {
  title?: string
  subtitle?: string
  description?: string
  categories?: string[]
  keywords?: string[]
}

// GET /api/projects/[id]/publishing/metadata
// Returns current metadata, falling back to manuscripts.title when no
// metadata title has been set yet.
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

  const [progressRes, manuscriptRes] = await Promise.all([
    supabase
      .from('publishing_progress')
      .select('metadata')
      .eq('manuscript_id', id)
      .maybeSingle(),
    supabase
      .from('manuscripts')
      .select('title')
      .eq('id', id)
      .single(),
  ])

  if (progressRes.error && progressRes.error.code !== 'PGRST116') {
    return NextResponse.json({ error: progressRes.error.message }, { status: 500 })
  }
  if (manuscriptRes.error) {
    return NextResponse.json({ error: manuscriptRes.error.message }, { status: 500 })
  }

  const stored = (progressRes.data?.metadata ?? {}) as BookMetadata
  const metadata: BookMetadata = {
    title: stored.title ?? manuscriptRes.data?.title ?? '',
    subtitle: stored.subtitle ?? '',
    description: stored.description ?? '',
    categories: stored.categories ?? [],
    keywords: stored.keywords ?? [],
  }

  return NextResponse.json({ metadata })
}

// PATCH /api/projects/[id]/publishing/metadata
// Body: Partial<BookMetadata> — any subset of the fields. Merges with
// existing metadata and upserts the publishing_progress row.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as Partial<BookMetadata> | null
  if (body === null) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  // Verify ownership.
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

  // Read existing metadata so partial updates merge cleanly.
  const { data: existing } = await supabase
    .from('publishing_progress')
    .select('metadata')
    .eq('manuscript_id', id)
    .maybeSingle()

  const merged: BookMetadata = {
    ...(existing?.metadata as BookMetadata ?? {}),
    ...body,
  }

  const { error: upsertError } = await supabase
    .from('publishing_progress')
    .upsert(
      {
        manuscript_id: id,
        metadata: merged,
      },
      { onConflict: 'manuscript_id' }
    )

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ metadata: merged })
}
