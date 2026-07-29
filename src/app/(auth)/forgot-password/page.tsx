'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccess(false)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`
            })

            if (resetError) throw resetError

            setSuccess(true)
        } catch (err: unknown) {
            console.error('Password reset error:', err)
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('An error occurred. Please try again.')
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
                    <div className="text-5xl mb-4">🔐</div>
                    <h1 className="text-3xl font-medium font-serif text-ink mb-2">Forgot Password?</h1>
                    <p className="text-muted">No worries, we&apos;ll send you reset instructions.</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-sage-bg border border-sage-deep/30 text-sage-deep px-4 py-4 rounded-xl mb-6">
                            <p className="font-semibold mb-2">✅ Check your email!</p>
                            <p className="text-sm">We&apos;ve sent a password reset link to:</p>
                            <p className="font-semibold text-sage-deep mt-1">{email}</p>
                        </div>

                        <div className="bg-paper-warm border border-line rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-ink">
                                <strong>Didn&apos;t receive the email?</strong>
                            </p>
                            <ul className="text-sm text-muted mt-2 space-y-1">
                                <li>• Check your spam/junk folder</li>
                                <li>• Make sure you entered the correct email</li>
                                <li>• Wait a few minutes and try again</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => {
                                setSuccess(false)
                                setEmail('')
                            }}
                            className="text-sage-deep hover:underline font-semibold"
                        >
                            Try a different email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-status-high/10 border border-status-high/30 text-status-high px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                                Email Address
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-sage-deep hover:bg-sage-deep/90 text-white py-4 rounded-lg font-semibold text-lg transition-all disabled:bg-line disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
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