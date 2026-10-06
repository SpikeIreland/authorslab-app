import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/whoami            — who am I, and what seat do I hold?
 * GET /api/whoami?m=<uuid>   — ...and can I read that manuscript?
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 * I twice asked Paul to run `select public.can_read_manuscript(...)` "signed
 * in as yourself". There is no such thing. The Supabase SQL editor connects
 * as a superuser, so `auth.uid()` is null there and BOTH legs of the function
 * fail regardless of the answer. Two runs came back false and neither run
 * meant anything — including the one that "passed" earlier in the day, which
 * was false for the wrong reason.
 *
 *   A control that cannot be run under the conditions it is meant to test is
 *   not a weak control. It is a decoration, and it is worse than none,
 *   because a decoration that returns `false` looks exactly like a pass.
 *
 * So the instrument moves to where the session actually lives. Everything
 * below runs through the user's own Supabase client, which is the same path
 * every page takes, so the answer it gives is the answer the product gives.
 *
 * ─── WHY THIS IS SAFE TO SHIP ───────────────────────────────────────────────
 *
 * It requires a session and reports only what RLS would already allow that
 * session to discover. The manuscript check returns a boolean and never any
 * content: a caller learns whether they may read a row they must already know
 * the id of, which is precisely what clicking the link would tell them.
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { signed_in: false, note: 'No session. Sign in first — this is the whole point of the route.' },
            { status: 401 }
        )
    }

    // The seat, read through the user's own client so RLS applies.
    const { data: memberships } = await supabase
        .from('org_memberships')
        .select('id, organisation_id, org_role, status, organisations(name)')
        .eq('auth_user_id', user.id)

    // Scoped to THIS caller's own memberships.
    //
    // The first version selected the table with no filter, on the reasoning
    // that whatever came back was whatever RLS allowed — which is a fair
    // instrument for auditing a policy and the wrong one for answering "what
    // seat do I hold". It returned a colleague's seat at the same imprint and
    // labelled it `imprint_seats`, i.e. mine. We spent three rounds proving
    // the policy was correct; it always was.
    //
    //   An instrument that reports more than it was asked reads as a defect
    //   in the thing being measured.
    //
    const membershipIds = (memberships ?? []).map((m) => m.id)
    const { data: imprintSeats } = membershipIds.length
        ? await supabase
            .from('imprint_memberships')
            .select('imprint_role, imprints(name, slug)')
            .in('membership_id', membershipIds)
        : { data: [] }

    const { data: profile } = await supabase
        .from('author_profiles')
        .select('role, is_admin, is_beta_tester')
        .eq('auth_user_id', user.id)
        .maybeSingle()

    const body: Record<string, unknown> = {
        signed_in: true,
        email: user.email,
        auth_user_id: user.id,
        // role === 'admin' makes is_admin() true, which short-circuits
        // can_read_manuscript() before either membership leg runs. Anything
        // observed under it tells you nothing about the tenancy model.
        profile_role: profile?.role ?? null,
        bypasses_all_checks: profile?.role === 'admin',
        has_full_access_grant: profile?.is_admin ?? null,
        org_memberships: memberships ?? [],
        imprint_seats: imprintSeats ?? [],
    }

    const manuscriptId = request.nextUrl.searchParams.get('m')
    if (manuscriptId) {
        const { data, error } = await supabase.rpc('can_read_manuscript', {
            p_manuscript: manuscriptId,
        })
        body.manuscript = {
            id: manuscriptId,
            can_read: error ? null : data,
            error: error?.message ?? null,
        }
    }

    return NextResponse.json(body)
}
