import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/publisher/invitations/claim
//   → bind the signed-in user to any seat invited to their verified address
//
// ─── Why this route has to exist ─────────────────────────────────────────────
//
// Without it, an invitation is a control that offers an act it cannot perform.
// `POST /api/publisher/people` writes a row with status 'invited' and a NULL
// `auth_user_id`; nothing else in the estate ever turns that into a seat. An
// invite list that can only grow is the hollow-affordance pattern with a
// database row behind it, which is worse than a dead button because it looks
// like state.
//
// ─── The one rule that matters here ──────────────────────────────────────────
//
// THE EMAIL IS TAKEN FROM THE SESSION, NEVER FROM THE REQUEST.
//
// There is no email parameter. If a caller could name the address to claim,
// anyone with an account could claim anyone's seat by typing their colleague's
// address — a complete tenancy bypass wearing the shape of a convenience.
//
// And it must be a VERIFIED address. Supabase will issue a session for an
// unconfirmed sign-up depending on project settings, so "the session says this
// is their email" is not on its own evidence that they control the mailbox.
// Since the invite was addressed to a mailbox, control of that mailbox is
// exactly the thing being proven. Unconfirmed callers are refused.

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const email = user.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'This account has no email address' }, { status: 400 })
  }

  // The mailbox check -- AND A CORRECTION TO WHAT IT PROVES.
  //
  // This comment used to say `email_confirmed_at` means the confirmation link
  // was used. That is true of accounts created through the signup flow and
  // FALSE of accounts created by a seed: measured 2026-10-02, 9 of 20 confirmed
  // accounts in this estate had the flag set by seeding, on invented
  // @harrowgate.example addresses, with `last_sign_in_at` NULL. Nobody clicked
  // anything.
  //
  // So what this check actually proves is "something set this flag", and the
  // set of things that can is {the confirmation flow, us}. Against an outside
  // caller it still holds -- they cannot set it -- and it remains the right
  // gate. But the guarantee is narrower than the sentence that was here, and a
  // comment claiming more than the mechanism delivers is the defect this lane
  // keeps finding in other people's surfaces.
  //
  // The fix is not to weaken the check. It is for the seed to stop setting a
  // flag that asserts a human act (raised to sysadmin, 2026-10-02).
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      {
        error:
          'Confirm your email address before claiming a seat. The invitation ' +
          'was sent to that mailbox, so control of it is what the seat depends on.',
      },
      { status: 403 }
    )
  }

  const { data: pending, error: findErr } = await supabaseAdmin
    .from('org_memberships')
    .select('id, organisation_id, org_role, organisations ( name )')
    .eq('invited_email', email)
    .eq('status', 'invited')

  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 })
  }
  if (!pending || pending.length === 0) {
    // Not an error. Most sign-ins are ordinary authors with no seat waiting,
    // and this route is safe to call on every sign-in.
    return NextResponse.json({ claimed: [], count: 0 })
  }

  type Pending = {
    id: string
    organisation_id: string
    org_role: string
    organisations: { name: string } | null
  }

  const claimed: { membership_id: string; organisation: string; org_role: string }[] = []
  const skipped: { membership_id: string; reason: string }[] = []

  for (const row of pending as unknown as Pending[]) {
    // UNIQUE (organisation_id, auth_user_id) means a second seat in the same
    // organisation cannot bind. That happens when someone already has a seat
    // and is invited again at the same address -- the invite is stale, not the
    // account, so it is skipped rather than failing the whole claim.
    const { error: updErr } = await supabaseAdmin
      .from('org_memberships')
      .update({
        auth_user_id: user.id,
        status: 'active',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('status', 'invited') // Re-checked in the WHERE: two concurrent
      .is('auth_user_id', null) // claims must not both succeed.

    if (updErr) {
      skipped.push({ membership_id: row.id, reason: updErr.message })
      continue
    }
    claimed.push({
      membership_id: row.id,
      organisation: row.organisations?.name ?? 'your organisation',
      org_role: row.org_role,
    })
  }

  return NextResponse.json({
    claimed,
    count: claimed.length,
    skipped,
    // Said out loud because a claimed seat does not imply a visible list: a
    // `member` with no imprint grants sees no titles, by design. The surface
    // should not congratulate someone into an empty page without explaining it.
    note:
      claimed.length > 0
        ? 'A seat can be active and still show no titles: members see only the ' +
          'imprints they have been granted.'
        : undefined,
  })
}
