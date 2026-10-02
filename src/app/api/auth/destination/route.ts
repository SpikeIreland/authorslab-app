import { NextResponse } from 'next/server'
import { postLoginDestination } from '@/lib/publisher/identity'

// GET /api/auth/destination → where this signed-in caller belongs after login
//
// `ux`'s Q3 spec: "post-login, resolve identity server-side; a publisher seat
// lands on /publisher, an author lands on /lobby. One conditional in the auth
// callback. Say who takes it." Taken, with one change of location worth stating.
//
// ─── Why a route and not a branch in the login page ─────────────────────────
//
// The login page is a CLIENT component. `resolvePublisherIdentity()` reads the
// caller's session server-side so that RLS independently checks the answer,
// and that cannot happen in the browser. A client-side branch would have to
// ask the browser what it is allowed to be, which is the shape of question a
// client must never answer about itself.
//
// So the page asks this route where to go. The decision itself lives in
// `postLoginDestination()` and nowhere else (R6: one declaration site).
//
// ─── This is navigation, not authorisation ──────────────────────────────────
//
// Nothing here grants anything. `/publisher` is gated by its own surfaces
// against the same resolver; being sent there does not make a seat exist, and
// being sent to `/lobby` does not remove one. If this route were wrong in
// either direction the worst outcome is a person on the wrong landing page
// with a working door to the right one.

export async function GET() {
  const { destination, basis } = await postLoginDestination()
  return NextResponse.json(
    { destination, basis },
    // Never cached. A seat can be granted or suspended between two sign-ins,
    // and a cached destination would outlive the membership that justified it.
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
