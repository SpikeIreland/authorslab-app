import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/publisher/projects/[id]/covers
//
// Cover artwork for the portal's cover section, in a publisher-appropriate
// shape. Service role, per sysadmin's §2.1 posture for the publisher surface
// (handovers/sysadmin-ratifications-and-rulings-2026-09-22.md): a publisher
// reads in a session that is not the author's, so RLS would return nothing.
//
// Read pattern follows design's own assets route
// (src/app/api/projects/[id]/design/assets/route.ts) — the cover-assets bucket
// is PRIVATE, so every row needs a short-lived signed URL. Theirs signs for
// 12h under RLS for the author; this one signs for 1h, because a publisher's
// link is shared more widely than an author's own session and a shorter
// window is the cheaper side of that trade.
//
// The selected cover is carried by publishing_progress.selected_cover_url as
// `cover-asset:<uuid>` — a TOKEN, NOT A URL. Declared contract, confirmed by
// `design` (Option 2 build) and `publishing` (§7 of their surfaces courier).
// Anything that treats that column as a URL is broken by construction; this
// route parses the prefix and resolves the id against cover_assets.
//
// Excluded, same posture as the sibling routes: no chapter content, no editor
// notes, no account PII. `source` carries generation prompts and execution
// ids, so it is READ (to get layout) but NOT returned — that is production
// detail, not a publisher's business.
//
// LAYOUT FILTER. `design`'s jacket run (2026-09-23) added a WRAPAROUND asset
// alongside the three portrait concepts — same manuscript, same `kind`
// ('generated'), distinguished only by `source.layout`. A jacket spread is
// roughly 2:1; the portal's cover frames are 2:3 with object-cover, so an
// unfiltered gallery croppped a full wraparound to a narrow vertical strip
// and showed it as a fourth "concept". Portrait concepts are what a publisher
// approves, so wraparounds are excluded here — EXCEPT when one is the
// author's selection, because dropping the selected asset would be worse than
// showing it in an imperfect frame.

const SELECTED_PREFIX = 'cover-asset:'
const SIGNED_URL_TTL_SECONDS = 60 * 60

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const WRAPAROUND_LAYOUT = 'wraparound'

interface CoverAssetRow {
  id: string
  kind: string | null
  storage_path: string
  created_at: string
  source: unknown
}

interface PublisherCover {
  id: string
  url: string | null
  kind: string | null
  layout: string | null
  createdAt: string
  isSelected: boolean
}

/**
 * `source` is free-form jsonb written by the generation workflow. Read only
 * the one key we need and tolerate any other shape — a missing or oddly typed
 * source must not break the gallery.
 */
function layoutOf(source: unknown): string | null {
  if (!source || typeof source !== 'object') return null
  const value = (source as Record<string, unknown>).layout
  return typeof value === 'string' ? value : null
}

/**
 * Resolve the selected asset id from the handoff column.
 *
 * Three outcomes, and the distinction matters. An empty column means the
 * author has not chosen. A column carrying something this route cannot parse
 * — a bare URL in the legacy grammar, say — means the author HAS chosen and
 * we cannot tell what. Collapsing the second into the first makes the portal
 * state "once they choose one, it arrives here for your approval" about a book
 * whose author already chose, which is a confident falsehood rather than a
 * missing value. Observed in production 2026-09-23 on the demo book.
 */
function resolveSelection(raw: string | null | undefined): {
  selectedId: string | null
  unresolved: boolean
} {
  if (!raw || raw.trim().length === 0) {
    return { selectedId: null, unresolved: false }
  }
  if (!raw.startsWith(SELECTED_PREFIX)) {
    return { selectedId: null, unresolved: true }
  }
  const id = raw.slice(SELECTED_PREFIX.length).trim()
  return id.length > 0
    ? { selectedId: id, unresolved: false }
    : { selectedId: null, unresolved: true }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data: assetRows, error: assetsError } = await supabaseAdmin
      .from('cover_assets')
      .select('id, kind, storage_path, created_at, source')
      .eq('manuscript_id', id)
      .order('created_at', { ascending: true })

    if (assetsError) {
      console.error(`publisher/projects/${id}/covers: read failed:`, assetsError)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }

    const rows = (assetRows ?? []) as CoverAssetRow[]

    // No artwork is a legitimate state, not an error — a manuscript that has
    // not been through cover generation yet. The portal falls back to its own
    // placeholder treatment on an empty array.
    if (rows.length === 0) {
      return NextResponse.json({ covers: [], selectedId: null, selectionUnresolved: false })
    }

    // Read the selection BEFORE filtering: the layout filter below keeps the
    // selected asset whatever its layout, so it needs to know which one it is.
    const { data: progressRow } = await supabaseAdmin
      .from('publishing_progress')
      .select('selected_cover_url')
      .eq('manuscript_id', id)
      .maybeSingle()

    const { selectedId, unresolved } = resolveSelection(progressRow?.selected_cover_url)

    const displayRows = rows.filter(
      (row) => layoutOf(row.source) !== WRAPAROUND_LAYOUT || row.id === selectedId
    )

    if (displayRows.length === 0) {
      return NextResponse.json({ covers: [], selectedId: null, selectionUnresolved: unresolved })
    }

    const covers: PublisherCover[] = await Promise.all(
      displayRows.map(async (row) => {
        // Best-effort per asset: one unsignable object must not blank the
        // whole gallery, so a failure degrades that card to url: null and the
        // page renders its placeholder in place of the image.
        const { data: signed } = await supabaseAdmin.storage
          .from('cover-assets')
          .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS)

        return {
          id: row.id,
          url: signed?.signedUrl ?? null,
          kind: row.kind,
          layout: layoutOf(row.source),
          createdAt: row.created_at,
          isSelected: row.id === selectedId,
        }
      })
    )

    // Surface the selected one first — it is the subject of the publisher's
    // decision; the rest are context.
    covers.sort((a, b) => Number(b.isSelected) - Number(a.isSelected))

    return NextResponse.json({ covers, selectedId, selectionUnresolved: unresolved })
  } catch (err) {
    console.error(`publisher/projects/${id}/covers: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
