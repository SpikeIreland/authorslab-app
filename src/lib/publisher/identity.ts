/**
 * PUBLISHER IDENTITY — who is looking, and what they are allowed to see.
 *
 * P3, `identity-billing`, 2026-09-29. This is the seam `publisher` left in
 * `src/app/publisher/_data/firm.ts`:
 *
 *   > "Until there is a publisher identity to read it from (identity-billing),
 *   > it comes from here — one constant, one edit."
 *
 * This module is that read. It resolves the signed-in user to an organisation,
 * an org role, and the set of imprints they may see. It renders nothing and
 * decides nothing about the interface; it answers one question truthfully so
 * the surfaces above it do not each invent an answer.
 *
 * ---------------------------------------------------------------------------
 * THE VOCABULARY IS THE DATABASE'S, NOT THIS FILE'S
 * ---------------------------------------------------------------------------
 * Every literal below is CHECK-constrained in Postgres, read from
 * `pg_constraint` on 2026-09-29 rather than assumed:
 *
 *   org_memberships.org_role      IN ('owner','admin','member')
 *   org_memberships.status        IN ('invited','active','suspended')
 *   imprint_memberships.imprint_role IN ('publisher','editor','viewer')
 *
 * That matters because the last time this lane wrote a vocabulary from memory
 * it produced `alex|sam|jordan.full-manuscript-analysis` against a real
 * `alex.full_analysis.*`, into an unconstrained `text` column that could never
 * catch it, and the meter read zero for two months. A vocabulary with no
 * constraint on it cannot be a contract. These three have constraints, so this
 * file is checkable against the database and will break loudly if either moves.
 *
 * ---------------------------------------------------------------------------
 * THE THREE RULES
 * ---------------------------------------------------------------------------
 * 1 · ONLY `active` IS AN IDENTITY.
 *    `invited` is someone who has been offered a seat and not taken it;
 *    `suspended` is someone who had one and does not now. Neither is a member,
 *    and both resolve to `null` here. An invitation is not access.
 *
 * 2 · ABSENCE OF SCOPE IS EMPTY SCOPE, NEVER UNIVERSAL SCOPE.
 *    A `member` with no `imprint_memberships` rows sees NOTHING. It would be
 *    one character cheaper to treat "no imprints named" as "all imprints",
 *    and that character is a tenancy breach: the first member added before
 *    anyone assigns their imprints would silently see the whole house.
 *    This is the same rule as `publisher`'s target date — a NULL reads "not
 *    set", never "fine" — pointed at authorisation instead of a schedule.
 *
 * 3 · NO MEMBERSHIP MEANS NOT A PUBLISHER, AND THERE IS NO DEFAULT ORG.
 *    `null` is a complete answer. Callers must not fall back to a first or
 *    only organisation. `publisher`'s Lobby route already holds this line —
 *    "a route with no caller identity that returns every publisher's list is
 *    a disclosure, not a convenience" — and this module must not undercut it.
 *
 * ---------------------------------------------------------------------------
 * WHY THE USER'S OWN CLIENT AND NOT THE SERVICE ROLE
 * ---------------------------------------------------------------------------
 * Read through the caller's session, so RLS is a second, independent check on
 * the answer this code computes. The four tenancy tables carry SELECT-only
 * policies gated on `is_org_member()`; there are no client write policies at
 * all. If the scoping logic below were wrong, RLS would still refuse rows
 * outside the caller's org. Two mechanisms disagreeing is a caught bug; one
 * mechanism trusting itself is an outage.
 *
 * Note for whoever adds writes: these tables have NO client write grants by
 * design. Invite and role changes belong in a server route with an explicit
 * column allowlist, the same shape as `author_profiles`. Do not add a write
 * policy here to make a form work.
 */

import { createClient } from '@/lib/supabase/server'

export type OrgRole = 'owner' | 'admin' | 'member'
export type ImprintRole = 'publisher' | 'editor' | 'viewer'
export type MembershipStatus = 'invited' | 'active' | 'suspended'

/** The literal sets, exported so callers compare against these and not strings. */
export const ORG_ROLES: readonly OrgRole[] = ['owner', 'admin', 'member']
export const IMPRINT_ROLES: readonly ImprintRole[] = ['publisher', 'editor', 'viewer']

export interface ImprintScope {
  id: string
  name: string
  slug: string
  /** Null when the caller reaches this imprint by org role rather than by an
   *  imprint membership row — an owner/admin has no per-imprint role, and
   *  inventing one ('publisher', say) would be a claim the table does not make. */
  imprint_role: ImprintRole | null
}

export interface PublisherIdentity {
  /** `org_memberships.id` — the actor id `publisher_actions.actor_membership_id`
   *  records. Attribution joins on this, not on the auth user. */
  membership_id: string
  organisation: { id: string; name: string; slug: string }
  org_role: OrgRole
  /** Always 'active'. Present so a caller reading this object cannot mistake it
   *  for a pending invitation. */
  status: Extract<MembershipStatus, 'active'>
  /** The imprints this caller may see. Possibly empty — see rule 2. */
  imprints: ImprintScope[]
  /** True when the scope came from org role (owner/admin) rather than from
   *  imprint membership rows. Callers that need "can this person see a title
   *  in any imprint" should read this rather than re-deriving it from role. */
  scope_is_whole_org: boolean
}

/**
 * Resolve the signed-in user to a publisher identity, or `null`.
 *
 * `null` covers every not-a-publisher case and they are deliberately not
 * distinguished in the return value: no session, no membership, an invitation
 * not yet accepted, a suspended seat. A caller deciding whether to render a
 * publisher surface needs one bit, and a caller that needs the reason (the
 * invitation-acceptance path) should read the membership row directly rather
 * than have this function widen into a status oracle.
 */
export async function resolvePublisherIdentity(): Promise<PublisherIdentity | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return null

  // One membership per user per org is guaranteed by
  // UNIQUE (organisation_id, auth_user_id). Multi-org membership is therefore
  // representable and this query would return more than one row — see the
  // note below `rows.length > 1`.
  const { data: rows, error: mErr } = await supabase
    .from('org_memberships')
    .select(
      'id, organisation_id, org_role, status, organisations!inner ( id, name, slug, deleted_at )',
    )
    .eq('auth_user_id', user.id)
    .eq('status', 'active')

  // Fail closed, and fail visible to the caller as "not a publisher" rather
  // than throwing into a page render. A read error is not a membership.
  if (mErr || !rows || rows.length === 0) return null

  type Row = {
    id: string
    organisation_id: string
    org_role: string
    status: string
    organisations: { id: string; name: string; slug: string; deleted_at: string | null } | null
  }

  // A soft-deleted organisation is not a workspace. Filtered here because
  // `organisations.deleted_at` is nullable and nothing enforces that a
  // membership is torn down with its org.
  const live = (rows as unknown as Row[]).filter(
    (r) => r.organisations && r.organisations.deleted_at === null,
  )
  if (live.length === 0) return null

  // MULTI-ORG IS UNRESOLVED, ON PURPOSE.
  // Nobody in the estate holds two memberships today (org_memberships: 0 rows
  // as of 2026-09-29), and "which house am I looking at" is a UI decision with
  // an org switcher attached to it, not something this function should settle
  // by picking the first row. Until that surface exists, more than one active
  // membership is an unhandled state and says so out loud rather than choosing.
  if (live.length > 1) {
    throw new Error(
      `resolvePublisherIdentity: user holds ${live.length} active org memberships ` +
        `and no org switcher exists yet. Refusing to guess which house is being ` +
        `viewed. Add the switcher (P3) before creating multi-org members.`,
    )
  }

  const m = live[0]
  const org = m.organisations!

  if (!(ORG_ROLES as readonly string[]).includes(m.org_role)) {
    // The CHECK constraint should make this unreachable. It is here because
    // the constraint could be relaxed by a migration that does not visit this
    // file, and an unrecognised role must not fall through to a permissive
    // default.
    throw new Error(
      `resolvePublisherIdentity: unrecognised org_role '${m.org_role}'. ` +
        `Expected one of ${ORG_ROLES.join(', ')}.`,
    )
  }
  const org_role = m.org_role as OrgRole
  const scope_is_whole_org = org_role === 'owner' || org_role === 'admin'

  let imprints: ImprintScope[] = []

  if (scope_is_whole_org) {
    // Owner and admin see every live imprint in their own organisation. RLS
    // independently restricts this to orgs they belong to.
    const { data: imps, error: iErr } = await supabase
      .from('imprints')
      .select('id, name, slug')
      .eq('organisation_id', org.id)
      .is('deleted_at', null)
      .order('name')
    if (iErr) return null
    imprints = (imps ?? []).map((i) => ({
      id: i.id as string,
      name: i.name as string,
      slug: i.slug as string,
      imprint_role: null,
    }))
  } else {
    // A plain member sees exactly the imprints named against their membership.
    // Zero rows means zero imprints (rule 2).
    const { data: links, error: lErr } = await supabase
      .from('imprint_memberships')
      .select('imprint_role, imprints!inner ( id, name, slug, organisation_id, deleted_at )')
      .eq('membership_id', m.id)
    if (lErr) return null

    type Link = {
      imprint_role: string
      imprints: {
        id: string
        name: string
        slug: string
        organisation_id: string
        deleted_at: string | null
      } | null
    }

    imprints = (links as unknown as Link[] | null ?? [])
      .filter((l) => l.imprints && l.imprints.deleted_at === null)
      // Belt and braces against a cross-org imprint membership. UNIQUE
      // (imprint_id, membership_id) prevents duplicates but nothing prevents
      // a membership being linked to an imprint of a DIFFERENT organisation,
      // which would be a tenancy leak written as a data-entry mistake.
      .filter((l) => l.imprints!.organisation_id === org.id)
      .map((l) => ({
        id: l.imprints!.id,
        name: l.imprints!.name,
        slug: l.imprints!.slug,
        imprint_role: (IMPRINT_ROLES as readonly string[]).includes(l.imprint_role)
          ? (l.imprint_role as ImprintRole)
          : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  return {
    membership_id: m.id,
    organisation: { id: org.id, name: org.name, slug: org.slug },
    org_role,
    status: 'active',
    imprints,
    scope_is_whole_org,
  }
}

/**
 * Whether this identity may see a given imprint id.
 *
 * One place, so no surface re-derives it. Note this is an AUTHORISATION READ
 * and not an affordance test: a control is shown or hidden by the surface's own
 * gate, and this answers whether the data may be read at all.
 */
export function canSeeImprint(identity: PublisherIdentity, imprintId: string): boolean {
  return identity.imprints.some((i) => i.id === imprintId)
}
