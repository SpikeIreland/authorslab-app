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
 * THE RESULT TYPE — and the defect it exists to repair.
 *
 * This function used to return `PublisherIdentity | null`, with `null` covering
 * every not-a-publisher case: no session, no membership, an unaccepted
 * invitation, a suspended seat — AND a database read error.
 *
 * `publisher` caught that and declined to work around it in their own route,
 * which was the right call twice over:
 *
 *   > "resolvePublisherIdentity() returns null for a read error AND for
 *   >  no-membership, and my surface prints 'you do not hold a seat' for null —
 *   >  which would tell an owner they have no seat if the database hiccupped."
 *
 * That is this lane's own rule turned on this lane's own code: a value whose
 * success state is indistinguishable from its failure state is not an answer.
 * And the direction of the failure is the bad one — an owner of a house is told
 * they have no seat in it, by a surface that sounds certain, because a query
 * timed out.
 *
 * So the three cases are now distinct and the caller must handle each:
 *
 *   ok           we checked, and here is the seat
 *   no_seat      WE CHECKED, and there is no seat          -> 403
 *   unavailable  WE COULD NOT CHECK                        -> 503, never 403
 *
 * A 403 is a statement about the person. A 503 is a statement about us. The
 * whole point of the split is that a surface can say "could not check" instead
 * of making a claim about a customer it has no evidence for.
 */
export type UnavailableKind =
  /** Two active memberships and no org switcher. We know they have seats. */
  | 'multi_org'
  /** A database or auth read failed. Transient, ours, says nothing about them. */
  | 'read_failed'
  /** A role the CHECK constraint should have prevented. A fault at our end. */
  | 'config'

export type PublisherIdentityResult =
  | { status: 'ok'; identity: PublisherIdentity }
  | { status: 'no_seat' }
  | { status: 'unavailable'; kind: UnavailableKind; reason: string }

/**
 * Resolve the signed-in user to a publisher identity.
 *
 * `no_seat` deliberately does NOT distinguish no session, no membership, an
 * unaccepted invitation or a suspended seat. A caller rendering a surface needs
 * one bit, and separating them here would leak whether a given organisation or
 * invitation exists. A caller that genuinely needs the reason — the invitation
 * acceptance path — reads the membership row directly rather than making this
 * function into a status oracle.
 *
 * `unavailable` is never a judgement about the caller. It carries a reason for
 * logs and for the surface to show, and it must never be rendered as a refusal.
 */
export async function resolvePublisherIdentity(): Promise<PublisherIdentityResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // An auth transport failure is NOT "no session". Distinguished, because this
  // is the same conflation one layer up.
  if (userError) {
    return {
      status: 'unavailable',
      kind: 'read_failed',
      reason: `auth check failed: ${userError.message}`,
    }
  }
  if (!user) return { status: 'no_seat' }

  const { data: rows, error: mErr } = await supabase
    .from('org_memberships')
    .select(
      'id, organisation_id, org_role, status, organisations!inner ( id, name, slug, deleted_at )',
    )
    .eq('auth_user_id', user.id)
    .eq('status', 'active')

  if (mErr) {
    return {
      status: 'unavailable',
      kind: 'read_failed',
      reason: `membership read failed: ${mErr.message}`,
    }
  }
  if (!rows || rows.length === 0) return { status: 'no_seat' }

  type Row = {
    id: string
    organisation_id: string
    org_role: string
    status: string
    organisations: { id: string; name: string; slug: string; deleted_at: string | null } | null
  }

  // A soft-deleted organisation is not a workspace.
  const live = (rows as unknown as Row[]).filter(
    (r) => r.organisations && r.organisations.deleted_at === null,
  )
  if (live.length === 0) return { status: 'no_seat' }

  // MULTI-ORG IS UNRESOLVED, ON PURPOSE -- and it is `unavailable`, not
  // `no_seat`. We know perfectly well they have seats; what we cannot do is
  // choose which house they are looking at, and that needs an org switcher
  // rather than a `[0]`. Telling someone with two seats that they have none
  // would be the same lie this type was created to prevent.
  if (live.length > 1) {
    return {
      status: 'unavailable',
      kind: 'multi_org',
      reason:
        `user holds ${live.length} active org memberships and no org switcher exists yet; ` +
        `refusing to guess which house is being viewed`,
    }
  }

  const m = live[0]
  const org = m.organisations!

  if (!(ORG_ROLES as readonly string[]).includes(m.org_role)) {
    // The CHECK constraint should make this unreachable. If a migration ever
    // relaxes it, an unrecognised role must not fall through to a permissive
    // default -- and must not read as "no seat" either, because it is a fault
    // at our end.
    return {
      status: 'unavailable',
      kind: 'config',
      reason: `unrecognised org_role '${m.org_role}'; expected one of ${ORG_ROLES.join(', ')}`,
    }
  }
  const org_role = m.org_role as OrgRole
  const scope_is_whole_org = org_role === 'owner' || org_role === 'admin'

  let imprints: ImprintScope[] = []

  if (scope_is_whole_org) {
    const { data: imps, error: iErr } = await supabase
      .from('imprints')
      .select('id, name, slug')
      .eq('organisation_id', org.id)
      .is('deleted_at', null)
      .order('name')
    if (iErr) {
      return {
        status: 'unavailable',
        kind: 'read_failed',
        reason: `imprint read failed: ${iErr.message}`,
      }
    }
    imprints = (imps ?? []).map((i) => ({
      id: i.id as string,
      name: i.name as string,
      slug: i.slug as string,
      imprint_role: null,
    }))
  } else {
    const { data: links, error: lErr } = await supabase
      .from('imprint_memberships')
      .select('imprint_role, imprints!inner ( id, name, slug, organisation_id, deleted_at )')
      .eq('membership_id', m.id)
    if (lErr) {
      return {
        status: 'unavailable',
        kind: 'read_failed',
        reason: `imprint scope read failed: ${lErr.message}`,
      }
    }

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

    imprints = ((links as unknown as Link[] | null) ?? [])
      .filter((l) => l.imprints && l.imprints.deleted_at === null)
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
    status: 'ok',
    identity: {
      membership_id: m.id,
      organisation: { id: org.id, name: org.name, slug: org.slug },
      org_role,
      status: 'active',
      imprints,
      scope_is_whole_org,
    },
  }
}

/**
 * THE EMPTY-SCOPE SENTENCE, owned here rather than in a surface.
 *
 * `publisher` asked whether the amber "no imprints assigned — sees nothing" on
 * a scopeless seat was my wording, and would rather I owned it or served it
 * from the payload. Served from the payload, same as `role_disclosure` and the
 * no-email fact, and for the same reason: it is a statement about what the
 * ENGINE does, and a blank there reads as "not restricted" — the exact
 * inversion of the truth, and the most dangerous single misreading on that
 * screen.
 */
export const EMPTY_SCOPE_NOTICE =
  'No imprints assigned — this person sees no titles. Scope is granted, never ' +
  'assumed: an empty scope is empty, not unrestricted.'

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

/**
 * The HTTP shape of a non-`ok` result, in one place.
 *
 * Six routes consume this resolver. If each maps the cases itself, one of them
 * eventually answers 403 to a read failure and we are back where we started —
 * `publisher` keeps its existing 409 for multi-org because their surfaces
 * already handle that state by name, and it is a real distinction: we know the
 * person has seats, we just cannot choose which house.
 */
export function publisherIdentityRefusal(
  result: Extract<PublisherIdentityResult, { status: 'no_seat' | 'unavailable' }>
): { body: Record<string, unknown>; status: number } {
  if (result.status === 'no_seat') {
    return { body: { error: 'not_a_publisher' }, status: 403 }
  }
  if (result.kind === 'multi_org') {
    return { body: { error: 'multi_org_unresolved', message: result.reason }, status: 409 }
  }
  return {
    body: {
      error: 'identity_unavailable',
      message: 'Could not check your seat just now. This is our end, not yours.',
      detail: result.reason,
    },
    status: 503,
  }
}

/**
 * ─── Q1 / R3 — THE PUBLISHER ENTITLEMENT PREDICATE ──────────────────────────
 *
 * `sysadmin`'s R3, 2026-10-01: *"Entitlement for the publisher path keys off
 * organisation membership, not Stripe. identity-billing owns the predicate."*
 * And the second half of the question: is it the same predicate that answers
 * the Company tab's 403?
 *
 * **It is the same predicate, and there is nothing new to build.** That is the
 * whole answer:
 *
 *     may this person put a book in the line
 *       = resolvePublisherIdentity().status === 'ok'          (an active seat)
 *       + canSeeImprint(identity, targetImprintId)            (in their scope)
 *
 * The first clause is exactly what gates the Company tab and the People tab.
 * The second is exactly what gates the Lobby's list. A publisher seat is a
 * seat for everything a seat is for; inventing a separate "ingestion
 * entitlement" would be a second vocabulary for one fact, which is how
 * `editor` came to name a capability nothing honours.
 *
 * ─── WHAT MUST NOT APPEAR ON THIS PATH ──────────────────────────────────────
 *
 * **No subscription check. No `pass_purchases`. No call to
 * `/api/subscription/entitlement`.** That route is the AUTHOR meter — it reads
 * `subscriptions`, counts editorial passes against a billing period and answers
 * "how many passes are left". An Odessa editor loading a pilot title holds no
 * consumer subscription and never will, so a subscription check on this path
 * does not restrict them, it refuses them outright. That is the contradiction
 * `sysadmin` named: the product disagreeing with the proposal we have already
 * sent Oliver.
 *
 * **And no `is_admin()`.** Staff privilege must not be the thing that makes a
 * publisher's ingest work, or the first real customer finds it does not.
 *
 * ─── ENTITLEMENT IS NOT METERING, AND THE DIFFERENCE IS LOAD-BEARING ────────
 *
 * This predicate answers *may this person act*. It does not answer *what do we
 * invoice* — the £400 per worked title (`finance`'s Q4). Those are different
 * questions with different evidence and different failure directions: a wrong
 * entitlement blocks a customer, a wrong meter bills one.
 *
 * Keeping them apart is the lesson from the pass meter, which counted a status
 * nothing wrote for two months and read as a comfortable zero. **A gate must
 * fail closed and visibly; a meter must fail loudly rather than generously.**
 * Do not make ingestion depend on the billable countable, and do not let the
 * countable be derived from "they were allowed in".
 */
export type IngestVerdict =
  | { ok: true; organisation_id: string; imprint_id: string; actor_membership_id: string }
  | { ok: false; reason: string }

/**
 * May this caller put a title into this imprint?
 *
 * Takes a RESOLVED identity rather than resolving internally, so the caller has
 * already had to handle `unavailable` separately and cannot accidentally turn a
 * read failure into "not entitled".
 */
export function publisherMayIngestInto(
  identity: PublisherIdentity,
  imprintId: string
): IngestVerdict {
  if (!imprintId) {
    return { ok: false, reason: 'No imprint was named. A title enters the line in an imprint.' }
  }
  if (!canSeeImprint(identity, imprintId)) {
    // Covers both "not your house" and "not in your scope", deliberately
    // undistinguished: telling a caller that an imprint exists but is not
    // theirs is a disclosure about somebody else's house.
    return {
      ok: false,
      reason:
        identity.imprints.length === 0
          ? 'This seat has no imprints assigned, so there is nowhere for a title to go yet.'
          : 'That imprint is not in this seat’s scope.',
    }
  }
  return {
    ok: true,
    organisation_id: identity.organisation.id,
    imprint_id: imprintId,
    // The actor for attribution -- the same id `publisher_actions` and the
    // cover intake record, so one person is one id across every surface.
    actor_membership_id: identity.membership_id,
  }
}

/**
 * ─── THE POST-LOGIN DESTINATION — ONE DECLARATION SITE ──────────────────────
 *
 * `sysadmin`'s geometry ruling §7 assigned this here, and R6's shape applies:
 * **one declaration site, not reimplemented elsewhere.** `ux` shipped the shell
 * and the seat-gated door; this is the single conditional behind both.
 *
 *     a publisher seat  -> /publisher
 *     everyone else     -> /lobby
 *
 * ─── WHY THE FAILURE DEFAULT IS `/lobby` AND NOT `/publisher` ───────────────
 *
 * `unavailable` means we could not check. The two wrong answers are not
 * symmetrical:
 *
 *  · An author sent to `/publisher` meets a page that says they hold no seat.
 *    That is a CLAIM ABOUT THEM, made on no evidence, as the first thing they
 *    see after signing in — the exact defect `publisher` caught in this module
 *    on 2026-09-30, reappearing as a routing decision.
 *
 *  · A publisher sent to `/lobby` sees the author Library and takes the door
 *    `ux` built. Mildly wrong, self-correcting, and it asserts nothing.
 *
 * So this fails to `/lobby`. **A routing default should be the one that makes
 * no claim**, and that is the general form worth keeping.
 */
export const POST_LOGIN_PUBLISHER = '/publisher'
export const POST_LOGIN_AUTHOR = '/lobby'

export async function postLoginDestination(): Promise<{
  destination: string
  /** Why, so a caller can log it. Never rendered as a reason to the person. */
  basis: 'publisher_seat' | 'no_seat' | 'could_not_check'
}> {
  const resolved = await resolvePublisherIdentity()
  if (resolved.status === 'ok') {
    return { destination: POST_LOGIN_PUBLISHER, basis: 'publisher_seat' }
  }
  if (resolved.status === 'no_seat') {
    return { destination: POST_LOGIN_AUTHOR, basis: 'no_seat' }
  }
  return { destination: POST_LOGIN_AUTHOR, basis: 'could_not_check' }
}
