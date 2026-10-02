import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  canSeeImprint,
  type PublisherIdentity,
} from '@/lib/publisher/identity'

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
//
// ─── THE ACTOR IS NO LONGER THE CLIENT'S TO NAME (2026-09-30) ────────────────
//
// This route used to take `actorFirm` FROM THE REQUEST BODY, and when none
// arrived it wrote the string `'Unnamed firm'`. Both halves were wrong, and
// the second half is worse than the first:
//
//   · A CLIENT-NAMED ACTOR. `actor_firm` is the attribution on an append-only
//     record — the one column a publisher would point at in a dispute about
//     who approved what. Taking it from the browser means the record says
//     whatever the caller typed. It is `identity-billing`'s rule about tenancy
//     keys, pointed at an audit trail: an attribution that arrives in a
//     request body is an attribution the client can choose.
//
//   · A FALLBACK THAT FABRICATED ONE. `'Unnamed firm'` is a NOT NULL column
//     satisfied with a placeholder, which is `sysadmin`'s §6 ruling on cover
//     assets almost word for word: a row marked as a person's act with no
//     person named is the fabricated-attribution defect with better manners.
//     The write should have been refused, not decorated.
//
// Both are replaced by `resolvePublisherIdentity()`. The actor is the caller's
// own membership — `actor_membership_id`, which is the id `identity.ts` says
// attribution joins on — and `actor_firm` is that membership's organisation
// name, read server-side. A caller with no membership cannot write at all, so
// there is no case left in which the column needs a placeholder.
//
// AND THE LOG IS SCOPED. The manuscript must sit in an imprint this caller can
// see, checked with `canSeeImprint` on both verbs. Before today any caller
// could read — and append to — the decision log of any book in the estate by
// knowing its id.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const KINDS = ['approved', 'revisions_requested', 'note', 'route_confirmed'] as const
type Kind = (typeof KINDS)[number]

/**
 * ─── THE STATION VOCABULARY, AND WHY IT IS NOT YET A CONTRACT ───────────────
 *
 * `'channel'` added 2026-10-02 at `publishing`'s ask, and the ask came with a
 * collision they caught before shipping — which would have been MY bug:
 *
 *   their Publishing Hub needed to record "this title is routed to a channel".
 *   There was no `'channel'` station, and `'route'` was already taken by MY
 *   RIGHTS MODEL (traditional / hybrid / independent). My book page derives
 *   `confirmedRoute` from the latest `station='route'` + `kind='route_confirmed'`
 *   — so a channel string written under `'route'` would have SILENTLY REPLACED
 *   the publisher's rights decision on my surface.
 *
 * They did not widen it; they asked. One value, my route, and it does not
 * touch the rights path because a channel record now carries its own station.
 *
 * THE REAL FINDING IS UNDERNEATH, AND IT IS MINE. `publisher_actions` has TWO
 * vocabularies and only ONE of them is constrained:
 *
 *   publisher_actions_kind_check   CHECK (kind IN ('approved',
 *                                   'revisions_requested','note',
 *                                   'route_confirmed'))        <- a contract
 *   station                        plain text, no constraint   <- a convention
 *
 * Read from `pg_constraint` this turn, not recalled. So the list below is
 * ADVISORY: the database would have accepted `publishing`'s channel string
 * under `'route'` without complaint, and the only thing standing between that
 * write and a silently overwritten rights decision was a person reading my
 * page's code. `identity-billing`'s rule, which I have quoted at other lanes:
 * A VOCABULARY WITH NO CONSTRAINT ON IT CANNOT BE A CONTRACT.
 *
 * A CHECK on `station` is couriered to `sysadmin` (migrations are theirs). With
 * it, the next lane needing a new station gets a loud refusal instead of a
 * silent collision — which is what `kind` already gives them one column over.
 */
/**
 * ─── THE VOCABULARY, NOW TAKEN FROM THE DATA RATHER THAN FROM THIS FILE ─────
 *
 * Revised 2026-10-02 because MY OWN GATE FIRED. The ready-to-apply CHECK I
 * couriered this morning carried a stop-if-dirty query first — list any row
 * whose station is outside the list, and STOP rather than coerce. `sysadmin`
 * ran it and it returned rows:
 *
 *     station='developmental', kind='note', 2 rows, 29 Sept
 *     — AND THEY ARE THE ONLY TWO ROWS IN THE TABLE.
 *
 * So the constraint I proposed would have rejected the entire contents of the
 * table it was meant to protect, and the list below was wrong rather than the
 * rows. I wrote a vocabulary from my own route code and never checked it
 * against what had been written. The gate is the only reason that is a
 * paragraph instead of an incident.
 *
 * TWO THINGS CAME OUT OF LOOKING PROPERLY.
 *
 * 1 · The editorial stations were missing entirely. `editing_phases.phase_name`
 *     holds `developmental`, `line_editing`, `copy_editing`, `publishing`,
 *     `marketing` (22 rows each, read this turn) — and the two existing
 *     action rows use THAT vocabulary, not mine. `sysadmin` put it sharply:
 *     the list had no editorial station while the proposal's central promise
 *     is an editor releasing a notes package — an action, at an editorial
 *     station, by a named person.
 *
 * 2 · `marketing` WAS ALREADY A SHARED SLOT READ BY TWO MEANINGS. Mine meant
 *     the portal's marketing-plan section; `editing_phases` means phase 5.
 *     That is `publishing`'s `route` collision a second time, in the same
 *     column — except this one was already live rather than caught on the way
 *     in. Mine is renamed `marketing_plan`, which costs nothing because no
 *     caller passed it and the table holds no row with it; `marketing` is
 *     left to the editing phase that has 22.
 *
 * Every value below is evidenced: five from `editing_phases.phase_name`, two
 * with live rows, `channel` from `publishing`'s ask, `marketing_plan` as the
 * disambiguated rename.
 */
const STATIONS = [
  // Editorial stations — where an editor acts on the work itself. The
  // vocabulary is `editing_phases.phase_name`'s, deliberately identical so
  // the two tables can be joined on it rather than mapped between.
  'developmental',
  'line_editing',
  'copy_editing',
  'publishing',
  'marketing',
  // Publisher decisions — where the house decides something about the book
  // rather than about the text.
  'cover',
  'route',
  'manuscript',
  'marketing_plan',
  'channel',
] as const
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

/**
 * Resolve the caller and check this book is on their list.
 *
 * One gate for both verbs, because a read gate and a write gate that are
 * written separately are two chances to write one of them wrong. Returns the
 * identity on success or a response to return on refusal — never a boolean,
 * so a caller cannot forget which way round `true` meant.
 */
async function gate(
  manuscriptId: string
): Promise<{ identity: PublisherIdentity } | { refusal: NextResponse }> {
  // Mapped in one place -- see publisherIdentityRefusal(). A read failure is a
  // 503 about us, not a 403 about the caller (identity-billing, 2026-10-01).
  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return { refusal: NextResponse.json(r.body, { status: r.status }) }
  }
  const identity: PublisherIdentity = resolved.identity

  const { data: manuscript } = await supabaseAdmin
    .from('manuscripts')
    .select('id, imprint_id')
    .eq('id', manuscriptId)
    .maybeSingle()

  if (!manuscript) {
    return { refusal: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }

  // A manuscript with no imprint is on NOBODY's list. Treating null as "not
  // yet assigned, so let it through" is the same one-character tenancy breach
  // `identity.ts` rule 2 refuses for imprint scope: absence of scope is empty
  // scope, never universal scope.
  const imprintId = manuscript.imprint_id as string | null
  if (!imprintId || !canSeeImprint(identity, imprintId)) {
    // 404 rather than 403, deliberately. A 403 on a specific id confirms that
    // the book exists and belongs to somebody else, which is a small
    // disclosure repeated across an id space. The caller is told the same
    // thing they would be told about an id that does not exist, because from
    // their side those two facts should be identical.
    return { refusal: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }

  return { identity }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const g = await gate(id)
  if ('refusal' in g) return g.refusal

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

  const g = await gate(id)
  if ('refusal' in g) return g.refusal
  const { identity } = g

  try {
    // `actorFirm` is ABSENT from this type on purpose. It was here, the client
    // sent it, and it is now derived. Leaving it declared would let a future
    // edit read it again without anyone deciding to.
    const body = (await req.json().catch(() => null)) as {
      station?: string
      kind?: string
      body?: string
      chapterNumber?: number | null
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

    // The actor, read from the server's own resolution of who is signed in.
    // Not trimmed, not defaulted, not length-capped — it is not user input.
    const actorFirm = identity.organisation.name

    // The manuscript's existence and its place on this caller's list were both
    // established by `gate` above, so there is no second lookup here.

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
        actor_membership_id: identity.membership_id,
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
