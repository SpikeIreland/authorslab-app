import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePublisherIdentity, publisherIdentityRefusal } from '@/lib/publisher/identity'

/**
 * GET / POST /api/publisher/projects/[id]/notes — C1's table, served.
 *
 * ─── Why a route at all, when C1's RLS would allow a direct client write ────
 *
 * `publisher_notes` is the one publisher table shaped for session-scoped
 * access: its policies run on `can_work_manuscript_as_house()`, the house leg
 * alone. So the browser could insert directly, and the INSERT policy would
 * re-check the named membership against `auth.uid()` and refuse a forged one.
 *
 * I started building it that way and stopped, for two reasons:
 *
 * 1. `author_membership_id` would be **supplied by the client**. That is the
 *    exact shape of the `actor_firm` defect — a caller naming the actor of
 *    its own write — and the fact that the database happens to re-check it
 *    makes the policy the only thing standing between us and fabricated
 *    attribution. One `EXISTS` clause relaxed during a future migration and
 *    the defect is live with no code change to notice. **The actor is derived
 *    server-side here, so the client cannot name it even wrongly.**
 * 2. `/api/publisher/identity` does not return `membership_id` (measured) —
 *    its payload is organisation + viewer + imprints. A client write would
 *    have needed that field added to a published payload for one consumer.
 *    Not adding it is the smaller change.
 *
 * ─── AND THE SESSION CLIENT IS USED ON PURPOSE ──────────────────────────────
 *
 * This route uses the **user's session** client, not the service role. Every
 * other per-book publisher route uses the service role because the RLS on
 * `manuscripts` is author-centric and a publisher satisfies none of it — but
 * `publisher_notes` is house-scoped, so a session-scoped query is exactly what
 * its policies were written for.
 *
 * That means C1's RLS is genuinely exercised rather than bypassed, and the
 * server-derived membership is a second, independent check of the same fact.
 * Defence in depth that costs nothing: if the resolver is wrong the policy
 * refuses, and if the policy is relaxed the resolver still refuses.
 *
 * `gatePublisherManuscript()` is deliberately NOT used. It is the right gate
 * for a service-role read, and using it here would add an app-level check in
 * front of a database-level one that is already correct and stricter — while
 * also pulling in a service-role client this route does not want to hold.
 */

interface NoteRow {
  id: string
  chapter_number: number | null
  body: string
  author_membership_id: string
  created_at: string
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return NextResponse.json(r.body, { status: r.status })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publisher_notes')
    .select('id, chapter_number, body, author_membership_id, created_at')
    .eq('manuscript_id', id)
    .order('created_at', { ascending: true })

  // A read failure is OURS. 503, never an empty list — an empty list is a
  // statement about the book, and this is a statement about us.
  if (error) {
    console.error(`publisher notes GET ${id}: read failed:`, error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }

  return NextResponse.json({
    notes: (data ?? []) as NoteRow[],
    /** So the surface can mark its own notes without a second round trip. */
    myMembershipId: resolved.identity.membership_id,
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return NextResponse.json(r.body, { status: r.status })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }

  const payload = body as { body?: unknown; chapterNumber?: unknown }

  const text = typeof payload.body === 'string' ? payload.body.trim() : ''
  if (!text) return NextResponse.json({ error: 'empty_body' }, { status: 400 })

  /**
   * NULL chapter_number is A REAL ANSWER — a note against the book rather than
   * against a chapter — so `null` is accepted and `undefined` is not silently
   * turned into it. A caller that forgot the field is a different thing from a
   * caller that meant the book, and collapsing them would make the book-level
   * note unaskable-for.
   */
  let chapterNumber: number | null
  if (payload.chapterNumber === null) {
    chapterNumber = null
  } else if (typeof payload.chapterNumber === 'number' && Number.isInteger(payload.chapterNumber)) {
    chapterNumber = payload.chapterNumber
  } else {
    return NextResponse.json(
      { error: 'chapter_number_required', detail: 'Pass an integer, or null for a note on the book.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publisher_notes')
    .insert({
      manuscript_id: id,
      chapter_number: chapterNumber,
      body: text,
      // SERVER-DERIVED. The request has no say in who wrote this.
      author_membership_id: resolved.identity.membership_id,
    })
    .select('id, chapter_number, body, author_membership_id, created_at')
    .single()

  if (error) {
    // The insert policy refusing is NOT our fault and not a 500: it means this
    // caller holds no seat on this title's imprint. 403 is honest here because
    // the caller already proved they are a publisher — this is about THIS book.
    const isPolicyRefusal = /row-level security|violates row-level/i.test(error.message)
    if (isPolicyRefusal) {
      return NextResponse.json({ error: 'not_on_your_list' }, { status: 403 })
    }
    console.error(`publisher notes POST ${id}: insert failed:`, error)
    return NextResponse.json({ error: 'write_failed' }, { status: 503 })
  }

  return NextResponse.json({ note: data as NoteRow }, { status: 201 })
}
