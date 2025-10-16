'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getAuthorProfile, getManuscriptsByAuthor } from '@/lib/supabase/queries'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
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

      // Step 4: Check for existing manuscripts
      const manuscripts = await getManuscriptsByAuthor(profile.id)
      console.log('✅ Found manuscripts:', manuscripts.length)

      // Step 5: Redirect appropriately
      if (manuscripts && manuscripts.length > 0) {
        // User has manuscripts - go to studio
        const latestManuscript = manuscripts[0]
        console.log('✅ Redirecting to studio with manuscript:', latestManuscript.id)
        
        router.push(
          `/author-studio?userId=${authData.user.id}&manuscriptId=${latestManuscript.id}`
        )
      } else if (profile.onboarding_complete) {
        // Onboarding complete but no manuscript - go to studio (will show upload)
        console.log('✅ Redirecting to studio (no manuscript)')
        router.push(`/author-studio?userId=${authData.user.id}`)
      } else {
        // Not onboarded - go to onboarding
        console.log('✅ Redirecting to onboarding')
        router.push(
          `/onboarding?userId=${authData.user.id}&firstName=${encodeURIComponent(profile.first_name || '')}&lastName=${encodeURIComponent(profile.last_name || '')}&email=${encodeURIComponent(profile.email)}`
        )
      }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to continue your writing journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-900 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign Up
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