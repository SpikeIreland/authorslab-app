import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { track as trackServer } from '@vercel/analytics/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // AL-MKT-009 / marketing §2 — the confirmed end of the signup funnel.
      //
      // `signup_awaiting_confirmation` fires client-side when the email goes
      // out; this is its pair. The DIFFERENCE between the two is the drop-off
      // that was previously invisible — either event alone would only have
      // renamed the invisibility.
      //
      // Placed here and not earlier because this is the first line that can
      // only be reached by a session actually being exchanged. The event is a
      // claim that a confirmation completed, so it fires where that is true.
      //
      // Caveat recorded by `marketing` and accepted: a server-side fire
      // carries no UTM cookie props. Attribution joins on the `awaiting`
      // event, which does.
      //
      // Epoch: both events exist from 2026-09-29. No backfill, and none will
      // be claimed.
      //
      // Deliberately not awaited into the redirect's critical path failure
      // mode: analytics must not be able to break a confirmation. A dropped
      // event under-reports the funnel; a thrown event would lock the author
      // out of the account they just confirmed.
      try {
        await trackServer('signup_confirmed')
      } catch {
        // Swallowed on purpose — see above. The funnel is not load-bearing;
        // the session is.
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // Redirect to login with success message
      const redirectUrl = `/login?verified=true`
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}