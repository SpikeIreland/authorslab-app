'use client'

export const dynamic = 'force-dynamic'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAuthorProfile, getManuscriptsByAuthor } from '@/lib/supabase/queries'

function LoginContent() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (loginError) throw loginError

      if (!authData.user) {
        throw new Error('Login failed - no user returned')
      }

      console.log('✅ User authenticated:', authData.user.id)

      // Step 2: Get author profile
      const profile = await getAuthorProfile(authData.user.id)
      console.log('✅ Author profile loaded:', profile.id)

      // Step 3: Store in localStorage
      localStorage.setItem('currentUserId', authData.user.id)
      localStorage.setItem('currentUserEmail', profile.email)
      localStorage.setItem('currentUserFirstName', profile.first_name || '')
      localStorage.setItem('currentUserLastName', profile.last_name || '')
      localStorage.setItem('authorProfileId', profile.id)

      // Step 4: Always land in The Library (AL-UX-004 §2 landing surface).
      // With or without existing manuscripts, /lobby is the main dashboard:
      // it shows the book grid AND carries the "Begin a new book" card that
      // routes to Wright (drafting from scratch) or manuscript upload.
      // Was: legacy /onboarding?userId=… flow for first-time authors, which
      // is the pre-pivot uploader and inconsistent with the new architecture
      // where all new-project starts flow from the dashboard.
      // Step 4: ask the server where this person belongs.
      //
      // Was an unconditional push to /lobby. A publisher seat now lands on
      // /publisher instead (sysadmin's geometry ruling §7, ux's Q3 spec). The
      // conditional itself is NOT here -- it lives once, in
      // postLoginDestination(), because a membership question has to be
      // answered server-side where RLS can check the answer, and because R6's
      // one-declaration-site rule applies to a branch as much as to a route.
      //
      // Falls back to /lobby if the lookup fails for any reason: a routing
      // default should be the one that makes no claim about the person. An
      // author landed on /publisher is told they hold no seat before they have
      // done anything; a publisher landed on /lobby simply takes the door.
      let destination = '/lobby'
      try {
        const res = await fetch('/api/auth/destination', { cache: 'no-store' })
        if (res.ok) {
          const body = await res.json()
          if (typeof body?.destination === 'string') destination = body.destination
        }
      } catch {
        // Swallowed on purpose -- see above. Sign-in has already succeeded and
        // must not fail on a routing hint.
      }
      console.log('✅ Redirecting to', destination)
      router.push(destination)

    } catch (error: unknown) {
      console.error('Login error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An error occurred during login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center justify-center gap-2 mb-6">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center font-serif text-lg text-white">A</span>
        <span className="font-serif text-lg text-ink">AuthorsLab</span>
      </Link>
      <div className="bg-paper border border-line rounded-2xl shadow-[0_8px_40px_rgba(44,44,42,0.10)] p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium font-serif text-ink mb-2">Welcome back.</h1>
          <p className="text-muted">Log in to continue your writing journey</p>
        </div>

        {verified && (
          <div className="bg-sage-bg border border-sage-deep/30 text-sage-deep px-4 py-3 rounded-xl mb-6">
            Email verified! You can now log in.
          </div>
        )}

        {error && (
          <div className="bg-status-high/10 border border-status-high/30 text-status-high px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded accent-sage-deep" />
              <span className="text-sm text-muted">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-sage-deep hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sage-deep hover:bg-sage-deep/90 text-white py-4 rounded-lg font-semibold text-lg transition-all disabled:bg-line disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-sage-deep font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-line text-center">
          <Link href="/" className="text-sage-deep hover:underline font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}