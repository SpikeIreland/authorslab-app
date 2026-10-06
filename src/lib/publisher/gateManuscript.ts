import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  canSeeImprint,
  type PublisherIdentity,
} from './identity'

/**
 * THE PER-BOOK PUBLISHER GATE — one implementation, for every route that
 * serves a single manuscript to a publisher.
 *
 * ─── Why this file exists (2026-10-06) ──────────────────────────────────────
 *
 * Four publisher routes were reading with the SERVICE ROLE — which bypasses
 * every row-level policy — and performing NO authentication at all. Not a seat
 * check, not an imprint check, not a signed-in check:
 *
 *   /api/publisher/projects/[id]           title, genre, phases, AUTHOR'S NAME
 *   /api/publisher/projects/[id]/chapters  THE CHAPTER TEXT
 *   /api/publisher/projects/[id]/covers    cover assets + SIGNED storage URLs
 *   /api/publisher/projects/[id]/line      line-editing state
 *
 * Anyone holding a manuscript id could read all of it, with no account.
 *
 * The header of the first route said "See /api/publisher/projects/route.ts for
 * the auth posture" — and that file does not exist. **A rule that points at a
 * missing reference is worse than a rule with none**: it reads as a
 * delegation, so every later reader assumes the check lives somewhere else.
 * Three other routes in this lane were gated individually while these four
 * were passed over for exactly that reason.
 *
 * So the gate is no longer a paragraph in a header. It is this function, and a
 * route either calls it or does not.
 *
 * ─── The logic is NOT new ───────────────────────────────────────────────────
 *
 * Lifted verbatim from the `gate()` already proven in
 * `/api/publisher/projects/[id]/actions/route.ts`, including both of its
 * deliberate decisions, which are restated here because they are the parts a
 * future reader is most likely to "simplify":
 *
 * 1. A null `imprint_id` is a REFUSAL. A manuscript on no imprint is on
 *    nobody's list. Treating null as "not yet assigned, so let it through" is
 *    the same one-character tenancy breach `identity.ts` rule 2 refuses:
 *    absence of scope is empty scope, never universal scope.
 *
 * 2. Out-of-scope returns 404, NOT 403. A 403 against a specific id confirms
 *    the book exists and belongs to somebody else — a small disclosure, but
 *    one repeated across an id space. The caller is told exactly what they
 *    would be told about an id that does not exist, because from their side
 *    those two facts should be identical.
 *
 * And a read failure is a 503 about us, never a 403 about the caller —
 * `publisherIdentityRefusal()` is the single mapping place (identity-billing,
 * 2026-10-01).
 */

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export type ManuscriptGate =
  | { ok: true; identity: PublisherIdentity; imprintId: string }
  | { ok: false; refusal: NextResponse }

/**
 * Resolve the caller's publisher identity and confirm this manuscript sits on
 * an imprint they hold. Returns the identity on success, or the response to
 * return unchanged on refusal.
 *
 *   const gate = await gatePublisherManuscript(id)
 *   if (!gate.ok) return gate.refusal
 */
export async function gatePublisherManuscript(
  manuscriptId: string
): Promise<ManuscriptGate> {
  const resolved = await resolvePublisherIdentity()
  if (resolved.status !== 'ok') {
    const r = publisherIdentityRefusal(resolved)
    return { ok: false, refusal: NextResponse.json(r.body, { status: r.status }) }
  }
  const identity = resolved.identity

  const { data: manuscript, error } = await supabaseAdmin
    .from('manuscripts')
    .select('id, imprint_id')
    .eq('id', manuscriptId)
    .maybeSingle()

  // A failed read is OURS, not the caller's. 503, never 404 — a 404 here would
  // tell a legitimate seat-holder their book does not exist because our
  // database was briefly unreachable.
  if (error) {
    console.error(`gatePublisherManuscript(${manuscriptId}): read failed:`, error)
    return {
      ok: false,
      refusal: NextResponse.json({ error: 'unavailable' }, { status: 503 }),
    }
  }

  if (!manuscript) {
    return { ok: false, refusal: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }

  const imprintId = (manuscript as { imprint_id: string | null }).imprint_id
  if (!imprintId || !canSeeImprint(identity, imprintId)) {
    return { ok: false, refusal: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }

  return { ok: true, identity, imprintId }
}
