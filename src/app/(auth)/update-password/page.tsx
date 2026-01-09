'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
    const router = useRouter()
    const supabase = createClient()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

    useEffect(() => {
        // Check if user has a valid session from the reset link
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession()
            setIsValidSession(!!session)
        }
        checkSession()
    }, [supabase.auth])

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) throw updateError

            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?reset=true')
            }, 3000)

        } catch (err: unknown) {
            console.error('Password update error:', err)
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An error occurred. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Still checking session
    if (isValidSession === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Verifying your reset link...</p>
                </div>
            </div>
        )
    }

    // Invalid or expired session
    if (isValidSession === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
                    <p className="text-gray-600 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        Request New Link
                    </Link>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🔑</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
                    <p className="text-gray-600">Enter your new password below.</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-green-50 border-2 border-green-500 text-green-900 px-4 py-4 rounded-xl mb-6">
                            <p className="font-semibold mb-2">✅ Password Updated!</p>
                            <p className="text-sm">Your password has been successfully changed.</p>
                        </div>
                        <p className="text-gray-600 text-sm">Redirecting you to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-500 text-red-900 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
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
                                Confirm New Password
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
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}