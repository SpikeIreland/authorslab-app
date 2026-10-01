import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  resolvePublisherIdentity,
  ORG_ROLES,
  IMPRINT_ROLES,
  EMPTY_SCOPE_NOTICE,
  type OrgRole,
} from '@/lib/publisher/identity'

// GET  /api/publisher/people   → the seats in the caller's organisation
// POST /api/publisher/people   → invite someone to a seat
//
// ─── What this is ────────────────────────────────────────────────────────────
//
// The People engine. `identity-billing` owns auth, organisations, memberships
// and billing as an ENGINE serving both products (sysadmin's operating-model
// ruling, 2026-09-30); the surface that renders this lives under /publisher
// and belongs to `publisher`. So this file answers "who has a seat, and what
// is their scope" and renders nothing.
//
// ─── Three rules carried from the identity resolver ──────────────────────────
//
// 1 · THE CALLER'S ORGANISATION IS NEVER TAKEN FROM THE REQUEST.
//    There is no `organisation_id` parameter on any verb here, by design. It
//    is read from the caller's own active membership. A tenancy key that
//    arrives in a request body is a tenancy key the client can change.
//
// 2 · ONLY `owner` AND `admin` MAY WRITE.
//    A `member` can see who else is in their organisation — RLS already
//    permits that read — and can change nothing.
//
// 3 · `admin` HERE IS AN ORG ROLE AND HAS NOTHING TO DO WITH `is_admin()`.
//    sysadmin's standing definition, 2026-09-29: `is_admin()` is an AuthorsLab
//    STAFF grant meaning unconditional read of every manuscript in the estate.
//    Reaching for it to give a publisher's people access to their own list
//    would hand that publisher read access to every other author on the
//    platform. Nothing in this file calls it.
//
// ─── Writes go through the service role, and why that is not a shortcut ──────
//
// `org_memberships` has RLS with SELECT-only policies and NO client write
// grants at all. That is deliberate and must stay: the way to make a form work
// is a server route with an explicit column allowlist, never a write policy.
// So reads below use the CALLER'S session (RLS independently refuses anything
// outside their org) and writes use the service role with the authorisation
// decided in code, above, and the columns enumerated.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** The only columns this route will ever write on an invite. */
const INVITE_COLUMN_ALLOWLIST = [
  'organisation_id',
  'invited_email',
  'org_role',
  'status',
  'invited_by',
  'invited_at',
] as const

/** Roles an invite may be issued at. `owner` is deliberately absent — see below. */
const INVITABLE_ROLES: readonly OrgRole[] = ['admin', 'member']

/**
 * WHAT THE ROLES ACTUALLY DO TODAY, stated because a role name is a claim.
 *
 * `publisher` found on 2026-09-29 that `imprint_role = 'editor'` has NO
 * BEHAVIOUR — an editor and a viewer have identical powers, because nothing in
 * src/app/ branches on imprint_role at all. sysadmin ruled: keep the word (it
 * came from High Line's own org chart and is right), do not invent behaviour
 * for it this week, and SAY SO on the seat screen.
 *
 * This constant is that sentence, and it ships in the API payload rather than
 * living in the renderer, so a surface cannot show the roles without it. That
 * is the affordance rule applied to a handover between lanes: if the caveat is
 * optional, it is one refactor from being dropped.
 */
const ROLE_DISCLOSURE =
  'Roles describe scope today, not permission. They control which imprints a ' +
  'person can see. They do not yet differ in what a person can do.'

interface SeatImprint {
  id: string
  name: string
  imprint_role: string | null
}

interface Seat {
  membership_id: string
  org_role: string
  status: string
  /** Null for a seat that has not been accepted — the person has no account yet. */
  auth_user_id: string | null
  invited_email: string | null
  invited_at: string | null
  accepted_at: string | null
  /** Empty for owner/admin, who reach every imprint by role rather than by grant. */
  imprints: SeatImprint[]
  scope_is_whole_org: boolean
}

// ────────────────────────────────────────────────────────────────────────────
// GET — the seat list
// ────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const resolved = await resolvePublisherIdentity()
  // 503, never 403: a read failure is a statement about US, not about the
  // caller. Telling an owner they have no seat because a query timed out is the
  // defect `publisher` caught in this module on 2026-09-30.
  if (resolved.status === 'unavailable') {
    return NextResponse.json(
      { error: 'Could not check your seat just now. This is our end, not yours.', detail: resolved.reason },
      { status: 503 }
    )
  }
  if (resolved.status === 'no_seat') {
    return NextResponse.json({ error: 'Not a publisher' }, { status: 403 })
  }
  const identity = resolved.identity

  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('org_memberships')
    .select(
      'id, org_role, status, auth_user_id, invited_email, invited_at, accepted_at, ' +
        'imprint_memberships ( imprint_role, imprints ( id, name, deleted_at ) )'
    )
    .eq('organisation_id', identity.organisation.id)
    .order('invited_at', { ascending: true })

  if (error) {
    // Fail visible. A seat list that cannot be read must not render as "no one
    // has a seat" -- that is a pass state indistinguishable from a fail state,
    // and on this surface it would read as "nobody else has access".
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  type Row = {
    id: string
    org_role: string
    status: string
    auth_user_id: string | null
    invited_email: string | null
    invited_at: string | null
    accepted_at: string | null
    imprint_memberships:
      | { imprint_role: string; imprints: { id: string; name: string; deleted_at: string | null } | null }[]
      | null
  }

  const seats: Seat[] = (rows as unknown as Row[] ?? []).map((r) => {
    const wholeOrg = r.org_role === 'owner' || r.org_role === 'admin'
    return {
      membership_id: r.id,
      org_role: r.org_role,
      status: r.status,
      auth_user_id: r.auth_user_id,
      invited_email: r.invited_email,
      invited_at: r.invited_at,
      accepted_at: r.accepted_at,
      scope_is_whole_org: wholeOrg,
      imprints: (r.imprint_memberships ?? [])
        .filter((l) => l.imprints && l.imprints.deleted_at === null)
        .map((l) => ({
          id: l.imprints!.id,
          name: l.imprints!.name,
          imprint_role: l.imprint_role,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  })

  return NextResponse.json({
    organisation: identity.organisation,
    /** What the CALLER may do, so the surface hides rather than disables. */
    viewer: {
      membership_id: identity.membership_id,
      org_role: identity.org_role,
      can_manage_people: identity.org_role === 'owner' || identity.org_role === 'admin',
    },
    seats,
    imprints: identity.imprints.map((i) => ({ id: i.id, name: i.name })),
    roles: { org: ORG_ROLES, invitable: INVITABLE_ROLES, imprint: IMPRINT_ROLES },
    /**
     * REQUIRED ON ANY SURFACE THAT SHOWS ROLES. Not advisory -- see the
     * constant's comment. If the seat screen renders roles without it, the
     * screen is making a claim the schema does not honour.
     */
    role_disclosure: ROLE_DISCLOSURE,
    /**
     * REQUIRED on any seat showing an empty scope. `publisher` asked whether
     * this sentence was mine; it is, so it ships from here. A blank scope reads
     * as "not restricted", which is the exact inversion of the truth.
     */
    empty_scope_notice: EMPTY_SCOPE_NOTICE,
    /**
     * NO EMAIL IS SENT BY THIS ENGINE. An invite writes a row and nothing
     * else. Saying "invitation sent" on the strength of a row is the
     * fabricated-record family this estate has spent the week removing --
     * the surface must say "invite created", and the person must be told
     * out of band until a delivery path exists.
     */
    invitations_are_delivered_by_email: false,
  })
}

// ────────────────────────────────────────────────────────────────────────────
// POST — create an invited seat
// ────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const resolved = await resolvePublisherIdentity()
  // 503, never 403: a read failure is a statement about US, not about the
  // caller. Telling an owner they have no seat because a query timed out is the
  // defect `publisher` caught in this module on 2026-09-30.
  if (resolved.status === 'unavailable') {
    return NextResponse.json(
      { error: 'Could not check your seat just now. This is our end, not yours.', detail: resolved.reason },
      { status: 503 }
    )
  }
  if (resolved.status === 'no_seat') {
    return NextResponse.json({ error: 'Not a publisher' }, { status: 403 })
  }
  const identity = resolved.identity
  if (identity.org_role !== 'owner' && identity.org_role !== 'admin') {
    return NextResponse.json(
      { error: 'Only an owner or admin can invite people' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, org_role, imprint_ids, imprint_role } = (body ?? {}) as {
    email?: unknown
    org_role?: unknown
    imprint_ids?: unknown
    imprint_role?: unknown
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }
  const cleanEmail = email.trim().toLowerCase()

  if (typeof org_role !== 'string' || !(INVITABLE_ROLES as readonly string[]).includes(org_role)) {
    // `owner` is not invitable through this route. Transferring ownership is a
    // different act with different consequences and it should not share a form
    // with "add a colleague".
    return NextResponse.json(
      { error: `org_role must be one of: ${INVITABLE_ROLES.join(', ')}` },
      { status: 400 }
    )
  }

  // Imprint scope is optional at invite time and means exactly what it says:
  // ABSENCE OF SCOPE IS EMPTY SCOPE. A `member` invited with no imprints sees
  // nothing until someone grants them an imprint. That is the resolver's rule
  // and it is not softened here for convenience.
  const imprintIds: string[] = Array.isArray(imprint_ids)
    ? imprint_ids.filter((x): x is string => typeof x === 'string')
    : []

  // Every imprint must belong to the CALLER'S organisation. Checked against the
  // resolver's own list rather than re-queried, so a caller cannot grant a seat
  // in somebody else's house by passing its imprint id.
  // THE IMPRINT ROLE IS THE CALLER'S TO CHOOSE, and this is a correction to my
  // own first draft, which hard-coded 'viewer' on the reasoning that `editor`
  // has no behaviour yet.
  //
  // That was wrong, and wrong in the exact family `publisher` removed from the
  // portal tonight: it would have RECORDED SOMETHING OTHER THAN WHAT THE USER
  // CHOSE. A publisher who labels a colleague an editor and finds 'viewer' in
  // the system has been quietly overruled by software.
  //
  // sysadmin's ruling is keep the word, give it no behaviour yet, and disclose
  // that roles describe scope rather than permission. The vocabulary is High
  // Line's own org chart, and a label is a real thing to a publisher even
  // before it gates anything. So: store what they chose, and say plainly what
  // it does and does not do (`role_disclosure`, returned by GET).
  const chosenImprintRole =
    imprint_role === undefined ? 'viewer' : imprint_role
  if (
    typeof chosenImprintRole !== 'string' ||
    !(IMPRINT_ROLES as readonly string[]).includes(chosenImprintRole)
  ) {
    return NextResponse.json(
      { error: `imprint_role must be one of: ${IMPRINT_ROLES.join(', ')}` },
      { status: 400 }
    )
  }

  const ownImprintIds = new Set(identity.imprints.map((i) => i.id))
  const foreign = imprintIds.filter((id) => !ownImprintIds.has(id))
  if (foreign.length > 0) {
    return NextResponse.json(
      { error: 'One or more imprints do not belong to your organisation' },
      { status: 403 }
    )
  }

  // UNIQUE (organisation_id, auth_user_id) does not constrain a pending invite,
  // whose auth_user_id is NULL -- so nothing in the database stops the same
  // address being invited twice. Checked here instead, and the check is on the
  // caller's own organisation only.
  const { data: existing, error: dupErr } = await supabaseAdmin
    .from('org_memberships')
    .select('id, status')
    .eq('organisation_id', identity.organisation.id)
    .eq('invited_email', cleanEmail)
    .limit(1)
  if (dupErr) {
    return NextResponse.json({ error: dupErr.message }, { status: 500 })
  }
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'That address already has a seat in this organisation' },
      { status: 409 }
    )
  }

  // The allowlist, written out. `auth_user_id` is NOT here: an invite is for a
  // person who may not have an account yet, and accepting a seat is what binds
  // it. A route that accepted auth_user_id from a request body would let a
  // caller mint a seat onto somebody else's account.
  const insertRow = {
    organisation_id: identity.organisation.id,
    invited_email: cleanEmail,
    org_role: org_role as OrgRole,
    status: 'invited' as const,
    invited_by: identity.membership_id,
    invited_at: new Date().toISOString(),
  }
  void INVITE_COLUMN_ALLOWLIST

  const { data: created, error: insErr } = await supabaseAdmin
    .from('org_memberships')
    .insert(insertRow)
    .select('id, invited_email, org_role, status, invited_at')
    .single()

  if (insErr || !created) {
    return NextResponse.json(
      { error: insErr?.message ?? 'Could not create the invitation' },
      { status: 500 }
    )
  }

  // Imprint grants, if any. Done after the membership exists because
  // imprint_memberships.membership_id is a FK to it.
  let imprintsGranted = 0
  if (imprintIds.length > 0) {
    const { error: imErr } = await supabaseAdmin.from('imprint_memberships').insert(
      imprintIds.map((imprint_id) => ({
        imprint_id,
        membership_id: created.id,
        imprint_role: chosenImprintRole,
      }))
    )
    if (imErr) {
      // Reported, not swallowed, and NOT rolled back silently: the seat exists
      // and the caller must know its scope is not what they asked for, rather
      // than discovering later that a colleague can see nothing.
      return NextResponse.json(
        {
          seat: created,
          imprints_granted: 0,
          warning:
            'The seat was created but its imprint scope was not applied: ' +
            imErr.message +
            ' — this person currently sees no titles.',
        },
        { status: 207 }
      )
    }
    imprintsGranted = imprintIds.length
  }

  return NextResponse.json(
    {
      seat: created,
      imprints_granted: imprintsGranted,
      /** Say this on screen. A row is not a message. */
      invitation_delivered: false,
      next_step:
        'No email has been sent. Tell this person directly that a seat is ' +
        'waiting; they claim it by signing in with this address.',
    },
    { status: 201 }
  )
}
