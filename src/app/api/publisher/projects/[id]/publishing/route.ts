import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  publisherMayIngestInto,
} from '@/lib/publisher/identity'

/**
 * PUBLISHER PUBLISHING READINESS — GET /api/publisher/projects/[id]/publishing
 *
 * Serves the Publishing Hub station in the publisher shell (sysadmin RULING
 * 2026-10-02 §6: Publishing Hub simulated, ONE platform — KDP).
 *
 * ─── Why a publisher route rather than reusing the author's ──────────────────
 * `api/projects/[id]/publishing/metadata` is deliberately AUTHOR-OWN — no
 * is_admin(), no org_memberships — per sysadmin's standing ruling on what admin
 * means. A publisher seat calling it gets a 404, correctly. So the publisher
 * read is its own route with its own gate, and the gate is not invented here:
 * it is `resolvePublisherIdentity()` + `publisherMayIngestInto()`, lifted from
 * the cover intake route so one person is one id across every publisher
 * surface. A read failure maps to 503, never 403 — a statement about us, not
 * about them (identity-billing, 2026-10-01).
 *
 * ─── READ ONLY, and that is a finding rather than a shortcut ─────────────────
 * This route does not write. Two things a publisher Publishing Hub would want
 * to write have no substrate today, and shipping a control over either would be
 * an affordance claiming an act that does not happen:
 *
 *   1. CHANNEL SELECTION. `publishing_progress.platforms` is a real column, but
 *      its only write path is the author-own metadata route. A
 *      publisher-authorised write to it does not exist yet.
 *   2. AN ATTRIBUTED HANDOFF EVENT. `publisher_actions.station` is the enum
 *      ['cover','route','manuscript','marketing']. There is no 'channel'
 *      value — and 'route' is already taken by the RIGHTS model
 *      (traditional / hybrid / independent), so reusing it would corrupt the
 *      `confirmedRoute` read on the publisher book page. Couriered rather than
 *      quietly widened.
 *
 * So the station reports readiness and says plainly that the handoff is a
 * person's act, which is also what the verb test requires: publisher-facing,
 * the system may prepare, check, record, surface and hand off — never publish.
 */

// Same shape as the sibling covers/intake route: the service client reads
// across RLS only AFTER publisherMayIngestInto() has authorised the caller.
// It is never the authorisation.
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// What KDP actually asks for at upload, and which of those we can evidence
// from our own columns. Nothing here is inferred from a vendor page; each flag
// is derived from a value this estate stores.
interface Readiness {
  title: boolean
  description: boolean
  categories: boolean
  keywords: boolean
  priced: boolean
  coverChosen: boolean
  interiorFile: boolean
  isbnDecided: boolean
  routedToKdp: boolean
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const identityResult = await resolvePublisherIdentity()
  if (identityResult.status !== 'ok') {
    const { body, status } = publisherIdentityRefusal(identityResult)
    return NextResponse.json(body, { status })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: manuscript, error: mErr } = await supabaseAdmin
    .from('manuscripts')
    .select('id, title, imprint_id')
    .eq('id', id)
    .maybeSingle()
  if (mErr) {
    return NextResponse.json({ error: 'read_failed' }, { status: 500 })
  }
  if (!manuscript) {
    return NextResponse.json({ error: 'book_not_found' }, { status: 404 })
  }
  if (!manuscript.imprint_id) {
    return NextResponse.json(
      {
        error: 'not_in_an_imprint',
        message:
          'This title is not in an imprint, so there is no house channel to prepare it for. ' +
          'Assign it to an imprint first.',
      },
      { status: 409 }
    )
  }

  const verdict = publisherMayIngestInto(identityResult.identity, manuscript.imprint_id)
  if (!verdict.ok) {
    return NextResponse.json({ error: 'not_in_scope', message: verdict.reason }, { status: 403 })
  }

  const { data: progress, error: pErr } = await supabaseAdmin
    .from('publishing_progress')
    .select('metadata, platforms, selected_cover_url, formatted_files')
    .eq('manuscript_id', id)
    .maybeSingle()
  if (pErr) {
    return NextResponse.json({ error: 'read_failed' }, { status: 500 })
  }

  const metadata = (progress?.metadata ?? {}) as Record<string, unknown>
  const pricing = (metadata.pricing ?? {}) as Record<string, unknown>
  const isbn = (metadata.isbn ?? {}) as Record<string, unknown>
  const platforms = Array.isArray(progress?.platforms) ? (progress.platforms as string[]) : []
  const formatted = (progress?.formatted_files ?? {}) as Record<string, unknown>

  function filled(v: unknown): boolean {
    if (typeof v === 'string') return v.trim().length > 0
    if (Array.isArray(v)) return v.length > 0
    return false
  }
  function fileExists(key: 'docx' | 'pdf'): boolean {
    const entry = formatted[key]
    if (!entry || typeof entry !== 'object') return false
    const o = entry as Record<string, unknown>
    return (typeof o.bucket === 'string' && typeof o.path === 'string') || typeof o.url === 'string'
  }

  const readiness: Readiness = {
    title: filled(metadata.title) || filled(manuscript.title),
    description: filled(metadata.description),
    categories: filled(metadata.categories),
    keywords: filled(metadata.keywords),
    priced: filled(pricing.ebook) || filled(pricing.paperback) || filled(pricing.hardcover),
    coverChosen: Boolean(progress?.selected_cover_url),
    interiorFile: fileExists('docx'),
    isbnDecided: filled(isbn.route),
    routedToKdp: platforms.includes('amazon-kdp'),
  }

  return NextResponse.json({
    book: { id: manuscript.id, title: metadata.title ?? manuscript.title ?? null },
    readiness,
    // Declared, not implied: what the station cannot do, so the component does
    // not have to guess whether to render a control.
    writable: false,
    // The print interior is the one KDP requirement we cannot evidence at all
    // yet — the PDF branch of 6.1 renders an empty body (P6). Reported as a
    // gap rather than as a false negative on a check.
    printInterior: fileExists('pdf') ? 'present' : 'not_produced_yet',
  })
}
