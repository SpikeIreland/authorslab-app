import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// n8n `5.2 Taylor Generate Covers` production webhook (workflow TmIX5fPCwK2rbdUy).
const GENERATE_WEBHOOK_URL = 'https://authorslab.app.n8n.cloud/webhook/taylor-generate-covers'

interface CoverAssetRow {
  id: string
  kind: string
  storage_path: string
  created_at: string
  source: { prompt?: string; cover_index?: number; execution_id?: string; layout?: string } | null
}

// GET /api/projects/[id]/design/assets
// Lists this project's cover artwork (generated + uploaded) with short-lived
// signed URLs for the private cover-assets bucket, plus light project meta the
// Design tab's previews typeset (title, author display name). RLS scopes the
// table reads and signed-URL creation to the signed-in author.
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

  const [{ data, error }, { data: manuscript }] = await Promise.all([
    supabase
      .from('cover_assets')
      .select('id, kind, storage_path, created_at, source')
      .eq('manuscript_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('manuscripts')
      .select('title, genre, author_profiles ( first_name, last_name )')
      .eq('id', id)
      .maybeSingle(),
  ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as CoverAssetRow[]
  const assets = await Promise.all(
    rows.map(async row => {
      const { data: signed } = await supabase.storage
        .from('cover-assets')
        .createSignedUrl(row.storage_path, 60 * 60 * 12)
      return {
        id: row.id,
        kind: row.kind,
        storagePath: row.storage_path,
        createdAt: row.created_at,
        coverIndex: row.source?.cover_index ?? null,
        layout: row.source?.layout === 'wraparound' ? 'wraparound' : 'front',
        url: signed?.signedUrl ?? null,
      }
    })
  )

  const profile = (manuscript as unknown as {
    title?: string
    genre?: string
    author_profiles?: { first_name?: string; last_name?: string } | null
  } | null)
  const authorName = [profile?.author_profiles?.first_name, profile?.author_profiles?.last_name]
    .filter(Boolean)
    .join(' ')

  return NextResponse.json({
    assets,
    project: {
      title: profile?.title ?? 'Untitled',
      genre: profile?.genre ?? '',
      authorName: authorName || 'Author Name',
    },
  })
}

// POST /api/projects/[id]/design/assets
// Asks Taylor to generate cover artwork: verifies ownership, guarantees the
// publishing_progress row the workflow's first node updates, then fires the
// n8n webhook fire-and-forget (the workflow takes minutes; the client polls
// GET for arrival). Body may carry mood/colors/elements overrides and
// layout: 'wraparound' for a single full-jacket artwork.
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
    .select('id, title, genre')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({})) as {
    mood?: string
    colors?: string
    elements?: string
    layout?: string
  }

  // The workflow's first node UPDATEs publishing_progress and stops silently
  // when no row matches — make sure one exists before firing.
  const { error: progressError } = await supabase
    .from('publishing_progress')
    .upsert({ manuscript_id: id }, { onConflict: 'manuscript_id', ignoreDuplicates: true })
  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 })
  }

  const layout = body.layout === 'wraparound' ? 'wraparound' : undefined

  const payload = {
    manuscriptId: id,
    manuscriptTitle: manuscript.title ?? 'the book',
    genre: manuscript.genre ?? 'Fiction',
    mood: body.mood?.trim() || 'atmospheric, evocative, true to the genre',
    colors: body.colors?.trim() || 'a restrained, sophisticated palette suited to the genre',
    elements: body.elements?.trim() || 'imagery drawn from the book’s themes, strong single focal point',
    ...(layout ? { layout } : {}),
  }

  // Fire and forget: the webhook only responds when the whole run finishes,
  // so a short abort here just detaches us — the workflow keeps running.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    await fetch(GENERATE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    // AbortError means we detached while the workflow runs — expected.
    if (!(err instanceof Error && err.name === 'AbortError')) {
      return NextResponse.json({ error: 'workflow_unreachable' }, { status: 502 })
    }
  } finally {
    clearTimeout(timer)
  }

  return NextResponse.json({ started: true, expected: layout === 'wraparound' ? 1 : 3 })
}
