import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// Shape
// ============================================================================
//
// Listing metadata persists to publishing_progress.metadata jsonb. Title can
// override the project's display title from manuscripts.title at publish time
// (working title vs. final published title), so we store it here too.
//
// The launch-prep blocks below (isbn / pricing / launch) are namespaced
// sub-objects inside the SAME jsonb column rather than new columns. Reason:
// Supabase migrations are sysadmin-direct per House Rules, and this ships
// without one. Namespacing keeps each block liftable into real columns in a
// single migration later — a post-demo courier to `sysadmin` proposes exactly
// that. `platforms` is different: it is already a real column on
// publishing_progress and is read by the legacy hub's PlatformsSection, so it
// is written there rather than duplicated into the jsonb.

export interface IsbnBlock {
  // 'own' = author already holds one; 'kdp_paid' = buy their own (~$125, their
  // imprint); 'kdp_free' = free KDP-assigned (Amazon listed as publisher).
  route?: 'own' | 'kdp_paid' | 'kdp_free' | null
  number?: string
  imprint?: string
}

export interface PricingBlock {
  currency?: string
  ebook?: string
  paperback?: string
  hardcover?: string
  kdp_select?: boolean
}

export interface LaunchBlock {
  date?: string | null          // YYYY-MM-DD
  preorder?: boolean
  notes?: string
}

export interface BookMetadata {
  title?: string
  subtitle?: string
  description?: string
  categories?: string[]
  keywords?: string[]
  isbn?: IsbnBlock
  pricing?: PricingBlock
  launch?: LaunchBlock
}

// What a PATCH body may carry. `platforms` is hoisted out of the jsonb.
type PublishingPatch = Partial<BookMetadata> & { platforms?: string[] }

const BLOCK_KEYS = ['isbn', 'pricing', 'launch'] as const

// Merge a patch over stored metadata. Scalars and arrays replace; the three
// namespaced blocks merge one level deep, so PATCH {isbn:{number}} does not
// wipe a previously chosen isbn.route.
function mergeMetadata(existing: BookMetadata, patch: Partial<BookMetadata>): BookMetadata {
  const merged: BookMetadata = { ...existing, ...patch }
  for (const key of BLOCK_KEYS) {
    if (patch[key] !== undefined) {
      merged[key] = {
        ...(existing[key] ?? {}),
        ...(patch[key] ?? {}),
      }
    }
  }
  return merged
}

// GET /api/projects/[id]/publishing/metadata
// Returns current metadata (title falling back to manuscripts.title when no
// metadata title has been set yet) plus the platforms column.
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
      .select('metadata, platforms, selected_cover_url')
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
    isbn: stored.isbn ?? {},
    pricing: stored.pricing ?? {},
    launch: stored.launch ?? {},
  }

  const platformsRaw = progressRes.data?.platforms
  const platforms: string[] = Array.isArray(platformsRaw) ? platformsRaw as string[] : []

  // selected_cover_url is read-only here — the Launch checklist derives a
  // "cover chosen" tick from it. Per design's cover-asset contract (V1,
  // 2026-09-22) any non-null value means the author has chosen; the value is
  // NEVER rendered as a URL, and unrecognised legacy strings still count as
  // chosen for checklist purposes only.
  const coverChosen = Boolean(progressRes.data?.selected_cover_url)

  return NextResponse.json({ metadata, platforms, coverChosen })
}

// PATCH /api/projects/[id]/publishing/metadata
// Body: Partial<BookMetadata> & { platforms?: string[] } — any subset.
// Merges with existing metadata and upserts the publishing_progress row
// (unique constraint publishing_progress_manuscript_id_key backs onConflict).
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

  const body = await req.json().catch(() => null) as PublishingPatch | null
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

  const { platforms, ...metadataPatch } = body

  // Read existing metadata so partial updates merge cleanly.
  const { data: existing } = await supabase
    .from('publishing_progress')
    .select('metadata')
    .eq('manuscript_id', id)
    .maybeSingle()

  const merged = mergeMetadata((existing?.metadata as BookMetadata) ?? {}, metadataPatch)

  const row: Record<string, unknown> = { manuscript_id: id, metadata: merged }
  if (platforms !== undefined) {
    row.platforms = Array.isArray(platforms) ? platforms : []
  }

  const { error: upsertError } = await supabase
    .from('publishing_progress')
    .upsert(row, { onConflict: 'manuscript_id' })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ metadata: merged, platforms })
}
