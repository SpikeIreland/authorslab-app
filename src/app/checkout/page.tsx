'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [authorId, setAuthorId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAccessAndLoadUser()
    }, [])

    async function checkAccessAndLoadUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Get author profile
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('id, is_beta_tester')
                .eq('auth_user_id', user.id)
                .single()

            if (!profile) {
                router.push('/signup')
                return
            }

            // Beta testers skip payment
            if (profile.is_beta_tester) {
                router.push('/onboarding')
                return
            }

            // Check if already paid
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('author_id', profile.id)
                .eq('status', 'active')
                .single()

            if (subscription) {
                // Already paid, go to onboarding
                router.push('/onboarding')
                return
            }

            // Need to pay
            setAuthorId(profile.id)
            setLoading(false)

        } catch (error) {
            console.error('Error:', error)
            setLoading(false)
        }
    }

    async function handleCheckout() {
        if (!authorId) return

        try {
            // Redirect to Stripe checkout
            // You'll need to create this Stripe checkout session
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    authorId: authorId,
                    packageType: 'three-phase' // Alex, Sam, Jordan
                })
            })

            const { url } = await response.json()
            window.location.href = url

        } catch (error) {
            console.error('Checkout error:', error)
            alert('Failed to start checkout. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-deep mx-auto mb-4"></div>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-ivory py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-ink mb-4">
                        Complete Your Registration
                    </h1>
                    <p className="text-xl text-muted">
                        Get professional AI editing for your manuscript
                    </p>
                </div>

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto border-4 border-sage/40">
                    <div className="text-center mb-6">
                        <div className="text-sm font-bold text-sage-deep uppercase tracking-wide mb-2">
                            3-Phase Editing Package
                        </div>
                        <div className="text-5xl font-bold text-ink mb-2">
                            $299
                        </div>
                        <div className="text-muted">One-time payment</div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <span className="text-alex-text text-xl">✓</span>
                            <div>
                                <strong>Phase 1: Alex</strong> - Developmental editing
                                <p className="text-sm text-muted">Story structure, character development, pacing</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-sam-text text-xl">✓</span>
                            <div>
                                <strong>Phase 2: Sam</strong> - Line editing
                                <p className="text-sm text-muted">Sentence flow, word choice, voice clarity</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-jordan-text text-xl">✓</span>
                            <div>
                                <strong>Phase 3: Jordan</strong> - Copy editing
                                <p className="text-sm text-muted">Grammar, punctuation, consistency</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-ink text-xl">✓</span>
                            <div>
                                <strong>Real-time collaboration</strong>
                                <p className="text-sm text-muted">Work chapter-by-chapter with AI editors</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-ink text-xl">✓</span>
                            <div>
                                <strong>Comprehensive reports</strong>
                                <p className="text-sm text-muted">PDF analysis after each phase</p>
                            </div>
                        </div>
                    </div>

                    {/* ADD THE BETA TERMS HERE ↓ */}
                    <div className="mt-6 p-4 bg-sage-bg rounded-lg border border-sage/40">
                        <p className="text-sm text-ink leading-relaxed">
                            <strong>Beta Program:</strong> AuthorsLab is currently in beta testing.
                            By purchasing, you agree to provide feedback to help us improve the platform.
                            This early access price of $299 is a special beta rate - standard pricing will be higher at full launch.
                        </p>
                    </div>

                    {/* THEN THE BUTTON */}
                    <Button
                        onClick={handleCheckout}
                        className="w-full bg-sage-deep hover:bg-sage-deep/90 text-white text-lg py-6 rounded-xl font-bold mt-4"
                    >
                        Join Beta Program - $299
                    </Button>

                    <p className="text-center text-sm text-muted mt-4">
                        Secure payment powered by Stripe
                    </p>
                    
                    <Button
                        onClick={handleCheckout}
                        className="w-full bg-sage-deep hover:bg-sage-deep/90 text-white text-lg py-6 rounded-xl font-bold"
                    >
                        Continue to Payment
                    </Button>

                    <p className="text-center text-sm text-muted mt-4">
                        Secure payment powered by Stripe
                    </p>
                </div>

                <div className="text-center mt-8 text-sm text-muted">
                    <p>Questions? Email us at <a href="mailto:support@authorslab.ai" className="text-sage-deep hover:underline">support@authorslab.ai</a></p>
                </div>
            </div>
        </div>
    )
}