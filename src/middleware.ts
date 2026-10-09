import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { parseUtmFromUrl, UTM_COOKIE_NAME, UTM_COOKIE_MAX_AGE_SECONDS, type UtmData } from '@/lib/utm'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Redirect ghostwriter subdomain root (and stray /onboarding hits) to /wright
  // Subdomain 'ghostwriter.' kept as DNS shim; destination path renamed to /wright.
  if (hostname.startsWith('ghostwriter.')) {
    if (pathname === '/' || pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/wright', request.url))
    }
  }

  const { response, user } = await updateSession(request)

  // THE PUBLISHER'S DOOR.
  //
  // There was no auth gate on /publisher at all: signed out, it rendered the
  // shell around an empty list rather than asking who you were. And the
  // home-screen icon needs somewhere in-scope to land, because a PWA scoped to
  // /publisher that redirects to /login leaves its own scope on first use and
  // opens in a browser tab instead of standalone.
  //
  // /publisher/login is deliberately INSIDE the scope. One door per product,
  // and this one never guesses which product you meant.
  const isPublisherLogin = pathname.startsWith('/publisher/login')

  if (pathname.startsWith('/publisher') && !isPublisherLogin && !user) {
    return NextResponse.redirect(new URL('/publisher/login', request.url))
  }

  // AND THE OTHER DIRECTION, which the first version missed.
  //
  // A signed-in person has no business on a sign-in page, and the layout
  // cannot help: it decides whether to draw the shell from whether there is a
  // session, and a server layout cannot read the pathname. So a signed-in
  // visitor to /publisher/login got the login form wrapped in the house
  // chrome — Harrowgate House in the header, People and House Style in the
  // panel, around a form asking them to sign in.
  //
  // It was never a leak: a signed-out visitor is served the page bare, which
  // is what the layout's no-session branch is for. But Paul could not tell
  // those two apart by looking, and neither could a customer. A page that
  // cannot be distinguished from a leak costs what a leak costs.
  //
  // Fixing it here rather than in the layout keeps one rule in one place:
  // middleware knows the path AND the session; the layout knows only the
  // session. The condition belongs where both facts are.
  if (isPublisherLogin && user) {
    return NextResponse.redirect(new URL('/publisher', request.url))
  }

  // MKT-004 Ask 3: first-touch UTM capture.
  // If the URL carries utm_* params AND the al_utm cookie doesn't already
  // exist, persist first-touch attribution to a 90-day cookie. We NEVER
  // overwrite an existing cookie — first touch wins.
  try {
    const alreadyCaptured = request.cookies.get(UTM_COOKIE_NAME)?.value
    if (!alreadyCaptured) {
      const utm = parseUtmFromUrl(request.nextUrl)
      if (Object.keys(utm).length > 0) {
        const payload: UtmData = { ...utm, first_touch_at: new Date().toISOString() }
        response.cookies.set(UTM_COOKIE_NAME, JSON.stringify(payload), {
          maxAge: UTM_COOKIE_MAX_AGE_SECONDS,
          path: '/',
          sameSite: 'lax',
          // Not HttpOnly — signup reads this from JS to attach to auth metadata.
        })
      }
    }
  } catch {
    // Never let attribution capture break the request.
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
