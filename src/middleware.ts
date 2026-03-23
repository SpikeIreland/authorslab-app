import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Redirect ghostwriter subdomain root (and stray /onboarding hits) to /ghostwriter
  if (hostname.startsWith('ghostwriter.')) {
    if (pathname === '/' || pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/ghostwriter', request.url))
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
