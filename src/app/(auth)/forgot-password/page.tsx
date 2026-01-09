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
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🔐</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-600">No worries, we&apos;ll send you reset instructions.</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="bg-green-50 border-2 border-green-500 text-green-900 px-4 py-4 rounded-xl mb-6">
                            <p className="font-semibold mb-2">✅ Check your email!</p>
                            <p className="text-sm">We&apos;ve sent a password reset link to:</p>
                            <p className="font-semibold text-green-700 mt-1">{email}</p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-gray-700">
                                <strong>Didn&apos;t receive the email?</strong>
                            </p>
                            <ul className="text-sm text-gray-600 mt-2 space-y-1">
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
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Try a different email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border-2 border-red-500 text-red-900 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
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