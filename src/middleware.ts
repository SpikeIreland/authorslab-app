import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { parseUtmFromUrl, UTM_COOKIE_NAME, UTM_COOKIE_MAX_AGE_SECONDS, type UtmData } from '@/lib/utm'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Redirect ghostwriter subdomain root (and stray /onboarding hits) to /ghostwriter
  if (hostname.startsWith('ghostwriter.')) {
    if (pathname === '/' || pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/ghostwriter', request.url))
    }
  }

  const response = await updateSession(request)

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
