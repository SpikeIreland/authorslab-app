'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { getUserAccess, type UserAccess } from '@/lib/accessControl'

function PhaseCompleteContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const manuscriptId = searchParams.get('manuscriptId')
    const [isLoading, setIsLoading] = useState(true)
    const [userAccess, setUserAccess] = useState<UserAccess | null>(null)
    const [manuscriptTitle, setManuscriptTitle] = useState('')

    useEffect(() => {
        async function loadData() {
            if (!manuscriptId) {
                router.push('/dashboard')
                return
            }

            const supabase = createClient()

            // Get user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get user access level
            const access = await getUserAccess(user.id)
            setUserAccess(access)

            // Get manuscript title
            const { data: manuscript } = await supabase
                .from('manuscripts')
                .select('title')
                .eq('id', manuscriptId)
                .single()

            if (manuscript) {
                setManuscriptTitle(manuscript.title)
            }

            setIsLoading(false)
        }

        loadData()
    }, [manuscriptId, router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-ivory flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-deep mx-auto mb-4"></div>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        )
    }

    // Complete Package Users - Direct access to Phase 4 & 5
    if (userAccess?.hasFullAccess) {
        return <CompleteProceedScreen manuscriptId={manuscriptId!} manuscriptTitle={manuscriptTitle} />
    }

    // Editing Package Users - Show upgrade offer
    return <UpgradeToCompleteScreen manuscriptId={manuscriptId!} manuscriptTitle={manuscriptTitle} />
}

// Screen for Complete Package users (Admin, Beta Testers, or Complete Package purchasers)
function CompleteProceedScreen({ manuscriptId, manuscriptTitle }: { manuscriptId: string, manuscriptTitle: string }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-ivory">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="text-2xl font-extrabold font-serif text-ink">
                        AuthorsLab
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="text-6xl mb-6"></div>
                    <h1 className="text-5xl font-bold text-ink mb-4">
                        Phase 3 Complete!
                    </h1>
                    <p className="text-xl text-muted max-w-2xl mx-auto">
                        &quot;{manuscriptTitle}&quot; is professionally edited and ready for publishing preparation.
                    </p>
                </div>

                {/* Next Phases Available */}
                <div className="max-w-5xl mx-auto bg-white rounded-3xl p-12 shadow-2xl">
                    <h2 className="text-3xl font-bold text-ink mb-8 text-center">
                        Continue Your Journey
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Phase 4: Taylor - Publishing */}
                        <div className="border-4 border-taylor/40 rounded-2xl p-8 bg-taylor-light">
                            <div className="text-5xl mb-4"></div>
                            <h3 className="text-2xl font-bold text-ink mb-3">Phase 4: Publishing Preparation</h3>
                            <p className="text-ink mb-6">
                                Work with Taylor to prepare your manuscript for publication. Generate cover designs,
                                format files for multiple platforms, and get your publishing strategy ready.
                            </p>
                            <ul className="space-y-2 mb-6 text-ink text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-taylor-text">✓</span>
                                    <span>AI-generated cover designs</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-taylor-text">✓</span>
                                    <span>Multi-platform formatting (EPUB, Kindle, Print PDF)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-taylor-text">✓</span>
                                    <span>Publishing strategy consultation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-taylor-text">✓</span>
                                    <span>Platform setup guidance</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => router.push(`/publishing-hub?manuscriptId=${manuscriptId}`)}
                                className="w-full bg-taylor text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-taylor/90 transition-all shadow-md hover:shadow-lg"
                            >
                                Start Phase 4 with Taylor →
                            </button>
                        </div>

                        {/* Phase 5: Quinn - Marketing */}
                        <div className="border-4 border-riley/40 rounded-2xl p-8 bg-riley-light">
                            <div className="text-5xl mb-4"></div>
                            <h3 className="text-2xl font-bold text-ink mb-3">Phase 5: Marketing Strategy</h3>
                            <p className="text-ink mb-6">
                                Work with Quinn to create a comprehensive marketing plan. Get guidance on launch strategy,
                                audience targeting, and promotion tactics.
                            </p>
                            <ul className="space-y-2 mb-6 text-ink text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-riley-text">✓</span>
                                    <span>Launch strategy & timeline</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-riley-text">✓</span>
                                    <span>Target audience identification</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-riley-text">✓</span>
                                    <span>Social media campaign plan</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-riley-text">✓</span>
                                    <span>Email marketing templates</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => router.push(`/marketing-hub?manuscriptId=${manuscriptId}`)}
                                className="w-full bg-riley text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-riley/90 transition-all shadow-md hover:shadow-lg"
                            >
                                Start Phase 5 with Quinn →
                            </button>
                        </div>
                    </div>

                    {/* Return to Editors */}
                    <div className="border-t-2 border-line pt-8">
                        <h3 className="text-xl font-bold text-ink mb-4 text-center">
                            Want to Refine Your Editing?
                        </h3>
                        <p className="text-muted text-center mb-6">
                            Return to any editor to make additional revisions before publishing
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=1`)}
                                className="bg-alex-light text-alex-text px-4 py-3 rounded-lg font-semibold hover:bg-alex/20 transition-all"
                            >
                                Return to Alex
                            </button>
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=2`)}
                                className="bg-sam-light text-sam-text px-4 py-3 rounded-lg font-semibold hover:bg-sam/20 transition-all"
                            >
                                Return to Sam
                            </button>
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=3`)}
                                className="bg-jordan-light text-jordan-text px-4 py-3 rounded-lg font-semibold hover:bg-jordan/20 transition-all"
                            >
                                Return to Jordan
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

// Screen for Editing Package users - show upgrade to Complete Package
function UpgradeToCompleteScreen({ manuscriptId, manuscriptTitle }: { manuscriptId: string, manuscriptTitle: string }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-ivory">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="text-2xl font-extrabold font-serif text-ink">
                        AuthorsLab
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-16">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="text-6xl mb-6"></div>
                    <h1 className="text-5xl font-bold text-ink mb-4">
                        Editing Complete!
                    </h1>
                    <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
                        &quot;{manuscriptTitle}&quot; is professionally edited and ready for the next step.
                    </p>
                    <div className="inline-block bg-sage-bg text-status-ok px-6 py-3 rounded-full font-semibold text-lg">
                        ✓ Editing Package Complete
                    </div>
                </div>

                {/* Upgrade Offer */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-charcoal rounded-3xl p-12 shadow-2xl text-white mb-8">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4"></div>
                            <h2 className="text-4xl font-bold mb-4">
                                Ready to Publish & Market?
                            </h2>
                            <p className="text-xl opacity-90 max-w-2xl mx-auto">
                                Upgrade to the Complete Package and get guided publishing preparation + marketing strategy
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-ink">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold">Complete Package</h3>
                                    <p className="text-muted">Phase 4 (Publishing) + Phase 5 (Marketing)</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted line-through">$349 separately</div>
                                    <div className="text-4xl font-bold text-taylor-text">$300</div>
                                    <div className="text-sm text-status-ok font-semibold">Save $49!</div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Phase 4 Features */}
                                <div className="border-2 border-taylor/40 rounded-xl p-6 bg-taylor-light">
                                    <h4 className="font-bold text-lg mb-3 text-taylor-text">Phase 4: Publishing</h4>
                                    <ul className="space-y-2 text-sm text-ink">
                                        <li className="flex items-start gap-2">
                                            <span className="text-taylor-text">✓</span>
                                            <span>AI-generated cover designs</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-taylor-text">✓</span>
                                            <span>EPUB, Kindle & Print PDF formatting</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-taylor-text">✓</span>
                                            <span>Publishing strategy consultation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-taylor-text">✓</span>
                                            <span>Platform setup guidance</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Phase 5 Features */}
                                <div className="border-2 border-riley/40 rounded-xl p-6 bg-riley-light">
                                    <h4 className="font-bold text-lg mb-3 text-riley-text">Phase 5: Marketing</h4>
                                    <ul className="space-y-2 text-sm text-ink">
                                        <li className="flex items-start gap-2">
                                            <span className="text-riley-text">✓</span>
                                            <span>Launch strategy & timeline</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-riley-text">✓</span>
                                            <span>Target audience identification</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-riley-text">✓</span>
                                            <span>Social media campaign plan</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-riley-text">✓</span>
                                            <span>Email marketing templates</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // TODO: Replace with your actual Stripe link for Complete Package upgrade
                                    const stripeUrl = `https://buy.stripe.com/YOUR_COMPLETE_PACKAGE_LINK?client_reference_id=${manuscriptId}`
                                    window.location.href = stripeUrl
                                }}
                                className="w-full bg-sage-deep text-white px-8 py-5 rounded-xl font-bold text-xl hover:bg-sage-deep/90 transition-all shadow-lg hover:shadow-xl"
                            >
                                Upgrade to Complete Package - $300 →
                            </button>

                            <p className="text-center text-sm text-muted mt-4">
                                One-time payment • Instant access to both phases
                            </p>
                        </div>
                    </div>

                    {/* Alternative: Return to Editors */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-2xl font-bold text-ink mb-4 text-center">
                            Not Ready to Publish Yet?
                        </h3>
                        <p className="text-muted text-center mb-6">
                            Return to any editor to make additional revisions
                        </p>
                        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=1`)}
                                className="bg-alex-light text-alex-text px-4 py-3 rounded-lg font-semibold hover:bg-alex/20 transition-all"
                            >
                                Return to Alex
                            </button>
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=2`)}
                                className="bg-sam-light text-sam-text px-4 py-3 rounded-lg font-semibold hover:bg-sam/20 transition-all"
                            >
                                Return to Sam
                            </button>
                            <button
                                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=3`)}
                                className="bg-jordan-light text-jordan-text px-4 py-3 rounded-lg font-semibold hover:bg-jordan/20 transition-all"
                            >
                                Return to Jordan
                            </button>
                        </div>

                        <p className="text-center text-sm text-muted mt-6">
                            You can upgrade to the Complete Package anytime from your dashboard
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function PhaseCompletePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-ivory flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-deep mx-auto mb-4"></div>
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        }>
            <PhaseCompleteContent />
        </Suspense>
    )
}