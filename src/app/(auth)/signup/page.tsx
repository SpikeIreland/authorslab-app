'use client'

export const dynamic = 'force-dynamic'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createAuthorProfile, getAuthorProfile } from '@/lib/supabase/queries'

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

    // Validation
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
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            firstName: firstName,
            lastName: lastName
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })

      if (signupError) throw signupError

      if (!authData.user) {
        throw new Error('Signup failed - no user returned')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Step 2: Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 2000)) // Increase wait time

      // Step 3: Get the profile ID from Supabase
      try {
        // Query by auth_user_id to get the profile
        const { data: profiles, error: profileError } = await supabase
          .from('author_profiles')
          .select('id, auth_user_id')
          .eq('auth_user_id', authData.user.id)
          .single()

        if (profileError) throw profileError

        if (profiles) {
          console.log('✅ Author profile found:', profiles.id)
          localStorage.setItem('authorProfileId', profiles.id)
        }
      } catch (profileError) {
        console.log('Profile fetch error:', profileError)

        // Fallback: try to create profile manually
        try {
          const newProfile = await createAuthorProfile({
            auth_user_id: authData.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName
          })
          console.log('✅ Author profile created manually:', newProfile.id)
          localStorage.setItem('authorProfileId', newProfile.id)
        } catch (createError) {
          console.error('Could not create profile:', createError)
          // Continue anyway - we'll handle missing profile in onboarding
        }
      }

      // Step 4: Store in localStorage
      localStorage.setItem('currentUserId', authData.user.id)
      localStorage.setItem('currentUserEmail', email)
      localStorage.setItem('currentUserFirstName', firstName)
      localStorage.setItem('currentUserLastName', lastName)

      console.log('✅ Redirecting to onboarding...')

      // Step 5: Redirect with profileId in URL
      const profileId = localStorage.getItem('authorProfileId')
      router.push(
        `/onboarding?userId=${authData.user.id}&authorProfileId=${profileId || ''}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}`
      )

    } catch (error: unknown) {
      console.error('Signup error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join AuthorsLab.ai and start your writing journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-900 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Log In
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}