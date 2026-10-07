'use client'

export const dynamic = 'force-dynamic'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * The publisher's own front door.
 *
 * ─── WHY A SECOND LOGIN RATHER THAN REUSING /login ──────────────────────────
 *
 * Paul signed in through the author sign-in link and landed on the publisher
 * home page, because /login asks /api/auth/destination which found the seat he
 * had been given that morning. One door guessing which of two products you
 * meant. That event is what produced the ruling that the publisher product
 * becomes its own application.
 *
 * This page is the first piece of that split, built early because the demo
 * needs it: a home-screen icon that opens the PUBLISHER's login, not the
 * author's. It signs in and goes to /publisher. It never guesses.
 *
 * It is deliberately thin. When the split happens this file moves across
 * whole; nothing here knows anything about the author product.
 */
export default function PublisherLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setBusy(true)

        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        })

        if (signInError) {
            // The provider's own message, not a friendlier one of our invention.
            // "Honesty is the interface": a rewritten error is a claim about what
            // went wrong, and we do not know more than the provider does.
            setError(signInError.message)
            setBusy(false)
            return
        }

        router.push('/publisher')
        router.refresh()
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6"
             style={{ background: 'var(--color-ivory)' }}>
            <div className="w-full max-w-sm">
                <div className="mb-8">
                    <p className="font-serif text-2xl" style={{ color: 'var(--color-ink)' }}>
                        Authors<span className="font-semibold">Lab</span>
                    </p>
                    <p className="kicker mt-1" style={{ color: 'var(--color-sage-deep)' }}>
                        Publisher
                    </p>
                </div>

                <h1 className="font-serif text-2xl mb-6" style={{ color: 'var(--color-ink)' }}>
                    Sign in
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm mb-1.5"
                               style={{ color: 'var(--color-muted)' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 text-[15px]"
                            style={{
                                borderColor: 'var(--color-line)',
                                background: 'var(--color-paper)',
                                color: 'var(--color-ink)',
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm mb-1.5"
                               style={{ color: 'var(--color-muted)' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 text-[15px]"
                            style={{
                                borderColor: 'var(--color-line)',
                                background: 'var(--color-paper)',
                                color: 'var(--color-ink)',
                            }}
                        />
                    </div>

                    {error && (
                        <p className="text-sm" style={{ color: 'var(--color-status-high)' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                        style={{ background: 'var(--color-sage-deep)', color: '#fff' }}
                    >
                        {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                {/* No sign-up link. A publisher seat is granted by a house, never
                    self-served, so offering a route that cannot work would be an
                    affordance that is a claim. */}
                <p className="text-xs mt-6" style={{ color: 'var(--color-faint)' }}>
                    Access to a publishing house&rsquo;s environment is granted by that house.
                </p>
            </div>
        </div>
    )
}
