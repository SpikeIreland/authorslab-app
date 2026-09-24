import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET  /api/publisher/projects/[id]/actions   → this book's publisher log
// POST /api/publisher/projects/[id]/actions   → record one act
//
// ─── An affordance is a claim ────────────────────────────────────────────────
//
// This route exists because of sysadmin's 2026-09-24 ruling. The portal
// offered Approve, Request revisions and Add note, and none of them persisted
// anything. The page disclosed that honestly, and the disclosure was doing the
// work of making dead buttons acceptable — "honest about being hollow" as the
// finish line instead of the floor.
//
// The substrate is public.publisher_actions (migration couriered to sysadmin,
// who owns the Supabase lane). Until it is applied every call here returns
// `available: false` and the surface hides the controls rather than offering
// an act it cannot perform.
//
// APPEND-ONLY. A decision is an event, not a mutable status: current state is
// derived by reading the log. "Approved, then revisions requested, then
// approved again" is a history a publisher can be shown, rather than a field
// that forgets.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const KINDS = ['approved', 'revisions_requested', 'note', 'route_confirmed'] as const
type Kind = (typeof KINDS)[number]

const STATIONS = ['cover', 'route', 'manuscript', 'marketing'] as const
type Station = (typeof STATIONS)[number]

const MAX_BODY = 4000

interface ActionRow {
  id: string
  station: string
  chapter_number: number | null
  kind: string
  body: string | null
  actor_firm: string
  visible_to_author: boolean
  created_at: string
}

/** Postgres "relation does not exist" — the migration has not landed yet. */
function isMissingTable(err: { code?: string } | null): boolean {
  return err?.code === '42P01'
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('publisher_actions')
      .select('id, station, chapter_number, kind, body, actor_firm, visible_to_author, created_at')
      .eq('manuscript_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      if (isMissingTable(error)) {
        // Not an error state — the substrate simply is not there yet. The
        // surface reads this and hides the controls.
        return NextResponse.json({ available: false, actions: [] })
      }
      console.error(`publisher actions ${id}: read failed:`, error)
      return NextResponse.json({ error: 'read_failed' }, { status: 500 })
    }

    return NextResponse.json({
      available: true,
      actions: (data ?? []) as ActionRow[],
    })
  } catch (err) {
    console.error(`publisher actions ${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = (await req.json().catch(() => null)) as {
      station?: string
      kind?: string
      body?: string
      chapterNumber?: number | null
      actorFirm?: string
      visibleToAuthor?: boolean
    } | null

    if (!body) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }

    const station = body.station as Station
    const kind = body.kind as Kind

    if (!STATIONS.includes(station)) {
      return NextResponse.json({ error: 'bad_station' }, { status: 400 })
    }
    if (!KINDS.includes(kind)) {
      return NextResponse.json({ error: 'bad_kind' }, { status: 400 })
    }

    const text = typeof body.body === 'string' ? body.body.trim() : null
    if (kind === 'note' && !text) {
      return NextResponse.json({ error: 'empty_note' }, { status: 400 })
    }
    if (text && text.length > MAX_BODY) {
      return NextResponse.json({ error: 'note_too_long' }, { status: 400 })
    }

    const actorFirm =
      typeof body.actorFirm === 'string' && body.actorFirm.trim().length > 0
        ? body.actorFirm.trim().slice(0, 120)
        : 'Unnamed firm'

    // The manuscript must exist. Without this an arbitrary id would write rows
    // the FK would reject anyway, but with a worse error and no log line.
    const { data: manuscript } = await supabaseAdmin
      .from('manuscripts')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (!manuscript) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('publisher_actions')
      .insert({
        manuscript_id: id,
        station,
        chapter_number:
          typeof body.chapterNumber === 'number' ? body.chapterNumber : null,
        kind,
        body: text,
        actor_firm: actorFirm,
        visible_to_author: Boolean(body.visibleToAuthor),
      })
      .select('id, station, chapter_number, kind, body, actor_firm, visible_to_author, created_at')
      .single()

    if (error) {
      if (isMissingTable(error)) {
        return NextResponse.json({ available: false }, { status: 503 })
      }
      console.error(`publisher actions ${id}: write failed:`, error)
      return NextResponse.json({ error: 'write_failed' }, { status: 500 })
    }

    return NextResponse.json({ available: true, action: data as ActionRow })
  } catch (err) {
    console.error(`publisher actions ${id}: unexpected error:`, err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
