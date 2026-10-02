import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import {
  resolvePublisherIdentity,
  publisherIdentityRefusal,
  publisherMayIngestInto,
} from '@/lib/publisher/identity'

// COVER INTAKE — the publisher-side design engine (design lane).
//
// TDP-DT proposal §2 (2026-09-30), built against the schema sysadmin applied
// and identity-billing's ruling of the same date: intake is governed by
// MEMBERSHIP, not the authority dial. A publisher's designer uploading
// finished artwork is not our automation acting — it is a human filing their
// own work, and the system's verb is `record`. So:
//
//   - gate   = active org_memberships seat + imprint in scope, read through
//              identity-billing's own resolver (`publisherMayIngestInto`),
//              which is can_read_manuscript() leg 2 in module form. No
//              is_admin() on this path; staff privilege must not be what
//              makes a publisher's upload work. No imprint_role gate either —
//              that word is scope, not permission, by standing ruling.
//   - actor  = org_memberships.id, the same id publisher_actions records, so
//              a cover upload and a publisher's decision join to one person.
//   - record = cover_assets with origin='supplied'. The applied constraint
//              (cover_assets_supplied_has_supplier) refuses a supplied asset
//              with no supplier named: a human's work is never filed under an
//              AI station, and never under nobody.
//
// SERVICE ROLE, with the gate above it — sysadmin's §2.1 posture for the
// publisher surface, same as every sibling route here: the caller's session
// is not the author's, so author-shaped RLS (can_access_manuscript_shared_space)
// would refuse a legitimate seat. The explicit verdict from
// publisherMayIngestInto() is the authorisation; the service client is only
// the pen.
//
// VERSIONING IS A CHAIN, NOT A REPLACEMENT. `supersedes_asset_id` points at
// the asset this upload replaces; nothing is destroyed (retention ruling:
// keep every version). The current cover of a chain is the asset nothing
// supersedes. This route records the link; it never deletes, never selects,
// never decides — selection stays with the people.
//
// What the engine will NOT do: write publishing_progress, touch the author's
// selection, or transform the artwork. It prepares, records, surfaces,
// hands off.

const MAX_BYTES = 20 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
// Publisher links travel further than an author's own session — match the
// sibling covers route's shorter window, not the author route's 12h.
const SIGNED_URL_TTL_SECONDS = 60 * 60

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface SuppliedAssetRow {
  id: string
  storage_path: string
  origin: string
  supplied_by_membership_id: string | null
  supplied_by_label: string | null
  supersedes_asset_id: string | null
  rights_confirmed: boolean | null
  created_at: string
  source: unknown
}

/** The wire shape — attribution exactly as stored, so a surface can only
 *  ever display what the record says. */
function toWire(row: SuppliedAssetRow, url: string | null, current: boolean) {
  return {
    id: row.id,
    url,
    storagePath: row.storage_path,
    origin: row.origin,
    suppliedBy: {
      membershipId: row.supplied_by_membership_id,
      label: row.supplied_by_label,
    },
    supersedesAssetId: row.supersedes_asset_id,
    rightsConfirmed: row.rights_confirmed === true,
    createdAt: row.created_at,
    isCurrent: current,
  }
}

/**
 * Resolve the caller to an ingest verdict for this manuscript, or an HTTP
 * refusal. Shared by GET and POST so the two cannot drift.
 */
async function gate(manuscriptId: string): Promise<
  | {
      ok: true
      actorMembershipId: string
      authUserId: string
      manuscript: { id: string; title: string | null; isDemo: boolean }
    }
  | { ok: false; response: NextResponse }
> {
  // The caller's own session answers who is asking; identity-billing's
  // resolver answers whether that person holds a seat. `unavailable` maps to
  // 503, never 403 — a read failure is a statement about us, not about them.
  const identityResult = await resolvePublisherIdentity()
  if (identityResult.status !== 'ok') {
    const { body, status } = publisherIdentityRefusal(identityResult)
    return { ok: false, response: NextResponse.json(body, { status }) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    // Unreachable past an 'ok' identity in practice, but named rather than
    // assumed: no session means no actor to attribute.
    return {
      ok: false,
      response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    }
  }

  const { data: manuscript, error: mErr } = await supabaseAdmin
    .from('manuscripts')
    .select('id, title, imprint_id, is_demo')
    .eq('id', manuscriptId)
    .maybeSingle()
  if (mErr) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'read_failed' }, { status: 500 }),
    }
  }
  if (!manuscript) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'project_not_found' }, { status: 404 }),
    }
  }

  // The state that is neither: a manuscript with NO imprint is not a trade
  // title, so no house seat can file artwork for it. That is a fact about the
  // title, not about the caller — 409, not 403, and it says what to do next.
  if (!manuscript.imprint_id) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'not_in_an_imprint',
          message:
            'This title is not in an imprint, so there is no house to file artwork under. ' +
            'Assign it to an imprint first.',
        },
        { status: 409 }
      ),
    }
  }

  const verdict = publisherMayIngestInto(identityResult.identity, manuscript.imprint_id)
  if (!verdict.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'not_in_scope', message: verdict.reason },
        { status: 403 }
      ),
    }
  }

  return {
    ok: true,
    actorMembershipId: verdict.actor_membership_id,
    authUserId: user.id,
    manuscript: {
      id: manuscript.id,
      title: manuscript.title ?? null,
      // R9 as amended (2026-10-02): marking is PER ROW, from the estate's one
      // isolation key. The surface computes its sentence from this; the
      // engine only reports the fact.
      isDemo: manuscript.is_demo === true,
    },
  }
}

/**
 * GET — the supplied-artwork chain for this title, attribution as stored,
 * newest first, with `isCurrent` computed as "nothing supersedes it".
 * Generated concepts are the sibling route's business; this lists what
 * humans filed.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const gated = await gate(id)
  if (!gated.ok) return gated.response

  const { data: rows, error } = await supabaseAdmin
    .from('cover_assets')
    .select(
      'id, storage_path, origin, supplied_by_membership_id, supplied_by_label, supersedes_asset_id, rights_confirmed, created_at, source'
    )
    .eq('manuscript_id', id)
    .eq('origin', 'supplied')
    .order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: 'read_failed' }, { status: 500 })
  }

  const list = (rows ?? []) as SuppliedAssetRow[]
  const superseded = new Set(
    list.map((r) => r.supersedes_asset_id).filter((v): v is string => !!v)
  )

  const assets = await Promise.all(
    list.map(async (row) => {
      // Best-effort per asset: one unsignable object degrades one card to
      // url: null, never the whole list.
      const { data: signed } = await supabaseAdmin.storage
        .from('cover-assets')
        .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS)
      return toWire(row, signed?.signedUrl ?? null, !superseded.has(row.id))
    })
  )

  return NextResponse.json({ assets, isDemo: gated.manuscript.isDemo })
}

/**
 * POST — multipart: `file` (jpeg/png/webp, 20MB), `rightsConfirmed` ('true'
 * required), optional `label` (the designer's name as the house writes it),
 * optional `supersedes` (the asset id this upload replaces).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const gated = await gate(id)
  if (!gated.ok) return gated.response

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'missing file' }, { status: 400 })
  }
  if (form?.get('rightsConfirmed') !== 'true') {
    return NextResponse.json(
      {
        error: 'rights_not_confirmed',
        message: 'Confirm the house holds the rights to this artwork before filing it.',
      },
      { status: 400 }
    )
  }
  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json(
      { error: 'unsupported type (jpeg, png, webp only)' },
      { status: 415 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'file too large (20MB max)' }, { status: 413 })
  }

  // ATTRIBUTION. Whose name goes on the record: the label the house passes,
  // else the uploader's own profile name, else their email. The constraint
  // refuses a supplied asset with no supplier, and this route refuses before
  // the database has to — with a sentence that says what to send.
  let label = String(form?.get('label') ?? '').trim()
  if (!label) {
    const { data: profile } = await supabaseAdmin
      .from('author_profiles')
      .select('first_name, last_name')
      .eq('auth_user_id', gated.authUserId)
      .maybeSingle()
    label = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
  }
  if (!label) {
    const { data: userRow } = await supabaseAdmin.auth.admin.getUserById(gated.authUserId)
    label = userRow?.user?.email ?? ''
  }
  if (!label) {
    return NextResponse.json(
      {
        error: 'no_supplier_name',
        message:
          "A person's work carries a person's name. Pass `label` with the designer's name.",
      },
      { status: 400 }
    )
  }

  // SUPERSESSION. Optional, and checked against the same manuscript — a
  // chain link into another book's artwork would be a cross-title write
  // wearing a version number.
  const supersedesRaw = String(form?.get('supersedes') ?? '').trim()
  let supersedes: string | null = null
  if (supersedesRaw) {
    const { data: prior } = await supabaseAdmin
      .from('cover_assets')
      .select('id, manuscript_id')
      .eq('id', supersedesRaw)
      .maybeSingle()
    if (!prior || prior.manuscript_id !== id) {
      return NextResponse.json(
        {
          error: 'supersedes_not_found',
          message: 'The asset this upload replaces was not found on this title.',
        },
        { status: 400 }
      )
    }
    supersedes = prior.id
  }

  const assetId = randomUUID()
  const storagePath = `${id}/publisher-upload-${assetId}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('cover-assets')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: row, error: insertError } = await supabaseAdmin
    .from('cover_assets')
    .insert({
      id: assetId,
      manuscript_id: id,
      kind: 'uploaded',
      origin: 'supplied',
      storage_path: storagePath,
      rights_confirmed: true,
      supplied_by_membership_id: gated.actorMembershipId,
      supplied_by_label: label,
      supersedes_asset_id: supersedes,
      source: {
        original_filename: file.name,
        mime: file.type,
        bytes: file.size,
        via: 'publisher-intake',
      },
      created_by: gated.authUserId,
    })
    .select(
      'id, storage_path, origin, supplied_by_membership_id, supplied_by_label, supersedes_asset_id, rights_confirmed, created_at, source'
    )
    .single()
  if (insertError) {
    // The file landed but the record did not — remove the orphan so storage
    // and the table cannot disagree about what exists.
    await supabaseAdmin.storage.from('cover-assets').remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const { data: signed } = await supabaseAdmin.storage
    .from('cover-assets')
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)

  return NextResponse.json({
    asset: toWire(row as SuppliedAssetRow, signed?.signedUrl ?? null, true),
  })
}
