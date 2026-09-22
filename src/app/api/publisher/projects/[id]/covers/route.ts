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
// ids, so it is NOT returned — that is production detail, not a publisher's
// business.

const SELECTED_PREFIX = 'cover-asset:'
const SIGNED_URL_TTL_SECONDS = 60 * 60

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface CoverAssetRow {
  id: string
  kind: string | null
  storage_path: string
  created_at: string
}

interface PublisherCover {
  id: string
  url: string | null
  kind: string | null
  createdAt: string
  isSelected: boolean
}

/**
 * Resolve the selected asset id from the handoff column.
 * Returns null for a null column, for a bare URL (the legacy shape), and for
 * anything else that does not carry the declared prefix — on the principle
 * that an unrecognised value should read as "nothing selected" rather than be
 * guessed at.
 */
function selectedAssetIdFrom(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith(SELECTED_PREFIX)) return null
  const id = raw.slice(SELECTED_PREFIX.length).trim()
  return id.length > 0 ? id : null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data: assetRows, error: assetsError } = await supabaseAdmin
      .from('cover_assets')
      .select('id, kind, storage_path, created_at')
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
      return NextResponse.json({ covers: [], selectedId: null })
    }

    const { data: progressRow } = await supabaseAdmin
      .from('publishing_progress')
      .select('selected_cover_url')
      .eq('manuscript_id', id)
      .maybeSingle()

    const selectedId = selectedAssetIdFrom(progressRow?.selected_cover_url)

    const covers: PublisherCover[] = await Promise.all(
      rows.map(async (row) => {
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
          createdAt: row.created_at,
          isSelected: row.id === selectedId,
        }
      })
    )

    // Surface the selected one first — it is the subject of the publisher's
    // decision; the rest are context.
    covers.sort((a, b) => Number(b.isSelected) - Number(a.isSelected))

    return NextResponse.json({ covers, selectedId })
  } catch (err) {
    console.error(`publisher/projects/${id}/covers: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
