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
            <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6">
                <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center font-serif text-lg text-white">A</span>
                    <span className="font-serif text-lg text-ink">AuthorsLab</span>
                </Link>
                <div className="bg-paper border border-line rounded-2xl shadow-[0_8px_40px_rgba(44,44,42,0.10)] p-10 w-full max-w-md text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-muted">Verifying your reset link...</p>
                </div>
            </div>
        )
    }

    // Invalid or expired session
    if (isValidSession === false) {
        return (
            <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6">
                <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center font-serif text-lg text-white">A</span>
                    <span className="font-serif text-lg text-ink">AuthorsLab</span>
                </Link>
                <div className="bg-paper border border-line rounded-2xl shadow-[0_8px_40px_rgba(44,44,42,0.10)] p-10 w-full max-w-md text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-medium font-serif text-ink mb-4">Invalid or Expired Link</h1>
                    <p className="text-muted mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                        Request New Link
                    </Link>
                    <div className="mt-6 pt-6 border-t border-line">
                        <Link href="/login" className="text-sage-deep hover:underline font-medium">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6">
            <Link href="/" className="flex items-center justify-center gap-2 mb-6">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center font-serif text-lg text-white">A</span>
                <span className="font-serif text-lg text-ink">AuthorsLab</span>
            </Link>
            <div className="bg-paper border border-line rounded-2xl shadow-[0_8px_40px_rgba(44,44,42,0.10)] p-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🔑</div>
                    <h1 className="text-3xl font-medium font-serif text-ink mb-2">Set New Password</h1>
                    <p className="text-muted">Enter your new password below.</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-sage-bg border border-sage-deep/30 text-sage-deep px-4 py-4 rounded-xl mb-6">
                            <p className="font-semibold mb-2">✅ Password Updated!</p>
                            <p className="text-sm">Your password has been successfully changed.</p>
                        </div>
                        <p className="text-muted text-sm">Redirecting you to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-status-high/10 border border-status-high/30 text-status-high px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-ink mb-2">
                                New Password
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
                                Confirm New Password
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
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-line text-center">
                    <Link href="/login" className="text-sage-deep hover:underline font-medium">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}