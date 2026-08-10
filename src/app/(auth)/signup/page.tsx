'use client'

export const dynamic = 'force-dynamic'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createAuthorProfile, getAuthorProfile } from '@/lib/supabase/queries'
import { readUtmCookie } from '@/lib/utm'
import { trackEvent } from '@/lib/analytics'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      console.log('🚀 Starting signup process...')

      // MKT-004 Ask 3: fire signup_started before the auth call.
      trackEvent('signup_started')

      // MKT-004 Ask 3: pull first-touch UTM data from cookie so it can ride
      // along on the auth user metadata (and later be persisted to the
      // author_profiles row).
      const utm = readUtmCookie()
      const utmMetadata: Record<string, string> = {}
      if (utm?.utm_source) utmMetadata.utm_source = utm.utm_source
      if (utm?.utm_medium) utmMetadata.utm_medium = utm.utm_medium
      if (utm?.utm_campaign) utmMetadata.utm_campaign = utm.utm_campaign
      if (utm?.utm_content) utmMetadata.utm_content = utm.utm_content
      if (utm?.utm_term) utmMetadata.utm_term = utm.utm_term
      if (utm?.first_touch_at) utmMetadata.utm_first_touch_at = utm.first_touch_at

      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName,
            ...utmMetadata
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })

      if (signupError) throw signupError
      if (!authData.user) throw new Error('Signup failed - no user returned')

      console.log('✅ Auth user created:', authData.user.id)

      // Step 2: Wait and retry fetching profile (with exponential backoff)
      let profileId = null
      const maxRetries = 5

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔍 Attempt ${attempt}/${maxRetries} to fetch profile...`)

        // Wait before each attempt (increasing wait time)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))

        try {
          const { data: profile, error: fetchError } = await supabase
            .from('author_profiles')
            .select('id, auth_user_id')
            .eq('auth_user_id', authData.user.id)
            .maybeSingle()

          if (fetchError) {
            console.log('Query error:', fetchError)
            continue
          }

          if (profile && profile.id) {
            profileId = profile.id
            console.log('✅ Profile found on attempt', attempt, ':', profileId)
            break
          } else {
            console.log(`⏳ Profile not found yet (attempt ${attempt})`)
          }
        } catch (queryError) {
          console.log('Query exception:', queryError)
        }
      }

      if (!profileId) {
        console.warn('⚠️ Profile not found after all retries, continuing anyway')
      }

      // MKT-004 Ask 3: persist UTM to author_profiles for direct SQL query.
      // Best-effort — organic (no-UTM) visitors and missing profiles skip.
      if (profileId && Object.keys(utmMetadata).length > 0) {
        try {
          await supabase
            .from('author_profiles')
            .update({
              utm_source: utm?.utm_source ?? null,
              utm_medium: utm?.utm_medium ?? null,
              utm_campaign: utm?.utm_campaign ?? null,
              utm_content: utm?.utm_content ?? null,
              utm_term: utm?.utm_term ?? null,
              utm_first_touch_at: utm?.first_touch_at ?? null,
            })
            .eq('id', profileId)
        } catch (utmErr) {
          console.warn('Could not persist UTM to author_profiles:', utmErr)
        }
      }

      // MKT-004 Ask 3: fire signup_completed once profile is resolved.
      trackEvent('signup_completed')

      // Step 3: Check if user is beta tester
      let isBetaTester = false

      if (profileId) {
        const { data: profile } = await supabase
          .from('author_profiles')
          .select('is_beta_tester')
          .eq('id', profileId)
          .single()

        isBetaTester = profile?.is_beta_tester || false
        console.log('🔍 Beta tester status:', isBetaTester)
      }

      // Step 4: Store user data in localStorage
      localStorage.setItem('currentUserId', authData.user.id)
      localStorage.setItem('currentUserEmail', email)
      localStorage.setItem('currentUserFirstName', firstName)
      localStorage.setItem('currentUserLastName', lastName)

      if (profileId) {
        localStorage.setItem('authorProfileId', profileId)
        console.log('✅ Stored authorProfileId:', profileId)
      }

      // Step 5: Redirect based on beta tester status
      if (isBetaTester) {
        // Beta testers go straight to onboarding (free access)
        console.log('✅ Beta tester - redirecting to onboarding')
        const redirectUrl = `/onboarding?userId=${authData.user.id}&authorProfileId=${profileId}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`
        router.push(redirectUrl)
      } else {
        // Regular users must pay first
        console.log('✅ Regular user - redirecting to checkout')
        router.push('/checkout')
      }

    } catch (error: unknown) {
      console.error('❌ Signup error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An error occurred during signup')
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
          <h1 className="text-4xl font-medium font-serif text-ink mb-2">Begin.</h1>
          <p className="text-muted">Join AuthorsLab and start your writing journey</p>
        </div>

        {error && (
          <div className="bg-status-high/10 border border-status-high/30 text-status-high px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-ink mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
                placeholder="Doe"
              />
            </div>
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-line rounded-lg focus:border-sage-deep focus:outline-none transition-all text-ink"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sage-deep hover:bg-sage-deep/90 text-white py-4 rounded-lg font-semibold text-lg transition-all disabled:bg-line disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-sage-deep font-semibold hover:underline">
              Log In
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