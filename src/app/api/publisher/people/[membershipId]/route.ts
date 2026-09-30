import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { resolvePublisherIdentity, IMPRINT_ROLES } from '@/lib/publisher/identity'

// PATCH /api/publisher/people/[membershipId]
//   → change a seat's org role, its imprint scope, or suspend / restore it
//
// Completes the People engine's verbs. Read the sibling route.ts header first;
// the tenancy rules there apply here unchanged, and the additional ones are:
//
//  · A seat can only be modified by an owner or admin OF ITS OWN ORGANISATION.
//    The target is re-read server-side and its organisation_id compared to the
//    caller's. A membership id in a URL is a client-supplied value.
//
//  · `owner` CANNOT BE GRANTED HERE, for the same reason it cannot be invited:
//    transferring ownership is a different act with different consequences and
//    should not share a form with "change Amara to admin".
//
//  · AN ORGANISATION CANNOT BE LEFT WITHOUT AN ACTIVE OWNER. Demoting or
//    suspending the last one is refused. This is the only check here that
//    protects against an act with no undo from inside the product -- everything
//    else a publisher does wrong on this screen, they can put right on it.
//
//  · Only an owner may modify another owner. An admin managing people should
//    not be able to suspend the person who gave them the seat.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const SETTABLE_ROLES = ['admin', 'member'] as const
const SETTABLE_STATUSES = ['active', 'suspended'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> }
) {
  const { membershipId } = await params

  const identity = await resolvePublisherIdentity()
  if (!identity) {
    return NextResponse.json({ error: 'Not a publisher' }, { status: 403 })
  }
  if (identity.org_role !== 'owner' && identity.org_role !== 'admin') {
    return NextResponse.json(
      { error: 'Only an owner or admin can manage people' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { org_role, status, imprint_ids, imprint_role } = (body ?? {}) as {
    org_role?: unknown
    status?: unknown
    imprint_ids?: unknown
    imprint_role?: unknown
  }

  // ── The target, re-read server-side ───────────────────────────────────────
  const { data: target, error: tErr } = await supabaseAdmin
    .from('org_memberships')
    .select('id, organisation_id, org_role, status, auth_user_id, invited_email')
    .eq('id', membershipId)
    .maybeSingle()

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 })
  if (!target || target.organisation_id !== identity.organisation.id) {
    // Same response for "does not exist" and "belongs to another house", so
    // this route cannot be used to discover whether a membership id is real.
    return NextResponse.json({ error: 'No such seat' }, { status: 404 })
  }
  if (target.org_role === 'owner' && identity.org_role !== 'owner') {
    return NextResponse.json({ error: 'Only an owner can modify an owner' }, { status: 403 })
  }

  // ── Validate what was asked ───────────────────────────────────────────────
  const patch: { org_role?: string; status?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  }

  if (org_role !== undefined) {
    if (typeof org_role !== 'string' || !(SETTABLE_ROLES as readonly string[]).includes(org_role)) {
      return NextResponse.json(
        { error: `org_role must be one of: ${SETTABLE_ROLES.join(', ')}` },
        { status: 400 }
      )
    }
    patch.org_role = org_role
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || !(SETTABLE_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${SETTABLE_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
    if (target.status === 'invited') {
      return NextResponse.json(
        { error: 'That seat has not been claimed yet, so it cannot be activated or suspended' },
        { status: 409 }
      )
    }
    patch.status = status
  }

  // ── The last-owner guard ──────────────────────────────────────────────────
  const losesOwner =
    target.org_role === 'owner' &&
    ((patch.org_role !== undefined && patch.org_role !== 'owner') || patch.status === 'suspended')

  if (losesOwner) {
    const { count, error: cErr } = await supabaseAdmin
      .from('org_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', identity.organisation.id)
      .eq('org_role', 'owner')
      .eq('status', 'active')
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        {
          error:
            'This is the organisation’s only active owner. Make someone else an ' +
            'owner first — otherwise nobody can manage people here again.',
        },
        { status: 409 }
      )
    }
  }

  // ── Imprint scope, replaced wholesale ─────────────────────────────────────
  // Replace rather than merge: a scope screen shows the imprints someone can
  // see, and submitting it means "this is the list now". Merging would make
  // removal impossible through the only surface that shows it.
  let scopeApplied: number | null = null
  if (imprint_ids !== undefined) {
    if (!Array.isArray(imprint_ids)) {
      return NextResponse.json({ error: 'imprint_ids must be an array' }, { status: 400 })
    }
    const ids = imprint_ids.filter((x): x is string => typeof x === 'string')
    const own = new Set(identity.imprints.map((i) => i.id))
    // Stored as chosen, not as this route would prefer -- see the note in the
    // sibling POST. Silently writing 'viewer' over someone's choice of 'editor'
    // is a record that says something its author did not.
    const chosenImprintRole = imprint_role === undefined ? 'viewer' : imprint_role
    if (
      typeof chosenImprintRole !== 'string' ||
      !(IMPRINT_ROLES as readonly string[]).includes(chosenImprintRole)
    ) {
      return NextResponse.json(
        { error: `imprint_role must be one of: ${IMPRINT_ROLES.join(', ')}` },
        { status: 400 }
      )
    }
    if (ids.some((id) => !own.has(id))) {
      return NextResponse.json(
        { error: 'One or more imprints do not belong to your organisation' },
        { status: 403 }
      )
    }

    const { error: delErr } = await supabaseAdmin
      .from('imprint_memberships')
      .delete()
      .eq('membership_id', target.id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    if (ids.length > 0) {
      const { error: insErr } = await supabaseAdmin.from('imprint_memberships').insert(
        ids.map((imprint_id) => ({
          imprint_id,
          membership_id: target.id,
          imprint_role: chosenImprintRole,
        }))
      )
      if (insErr) {
        // The old scope is already gone. Say so plainly rather than reporting a
        // generic failure: this person can currently see nothing.
        return NextResponse.json(
          {
            error:
              'The previous imprint scope was cleared but the new one was not ' +
              'applied: ' + insErr.message + ' — this person currently sees no titles.',
          },
          { status: 500 }
        )
      }
    }
    scopeApplied = ids.length
  }

  // ── Apply the row patch ───────────────────────────────────────────────────
  if (patch.org_role !== undefined || patch.status !== undefined) {
    const { error: updErr } = await supabaseAdmin
      .from('org_memberships')
      .update(patch)
      .eq('id', target.id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({
    membership_id: target.id,
    org_role: patch.org_role ?? target.org_role,
    status: patch.status ?? target.status,
    imprints_in_scope: scopeApplied,
    // An owner/admin reaches every imprint by role, so a scope list set against
    // one is recorded and ignored. Said rather than silently dropped.
    scope_note:
      (patch.org_role ?? target.org_role) !== 'member'
        ? 'Owners and admins see every imprint in the organisation; imprint scope ' +
          'only changes what a member sees.'
        : undefined,
  })
}
