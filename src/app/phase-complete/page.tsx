'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Manuscript {
    id: string
    title: string
    current_word_count: number
}

interface ManuscriptVersion {
    id: string
    phase_number: number
    editor_name: string
    file_url: string | null
    created_at: string
}

function PhaseCompleteContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const manuscriptId = searchParams.get('manuscriptId')

    const [manuscript, setManuscript] = useState<Manuscript | null>(null)
    const [versions, setVersions] = useState<ManuscriptVersion[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [feedback, setFeedback] = useState('')
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

    const loadData = useCallback(async () => {
        if (!manuscriptId) {
            router.push('/author-studio')
            return
        }

        const supabase = createClient()

        // Load manuscript
        const { data: manuscriptData, error: manuscriptError } = await supabase
            .from('manuscripts')
            .select('*')
            .eq('id', manuscriptId)
            .single()

        if (manuscriptError || !manuscriptData) {
            console.error('Error loading manuscript:', manuscriptError)
            router.push('/author-studio')
            return
        }

        // Load manuscript versions
        const { data: versionsData } = await supabase
            .from('manuscript_versions')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .order('phase_number', { ascending: true })

        setManuscript(manuscriptData)
        setVersions(versionsData || [])
        setIsLoading(false)
    }, [manuscriptId, router])

    useEffect(() => {
        loadData()
    }, [loadData])

    async function handleFeedbackSubmit() {
        if (!feedback.trim()) return

        // Here you could save feedback to a database table
        console.log('Beta Feedback:', feedback)

        // For now, just show success
        setFeedbackSubmitted(true)

        // You could add a feedback table and insert here
        // const supabase = createClient()
        // await supabase.from('beta_feedback').insert({
        //   manuscript_id: manuscriptId,
        //   feedback: feedback,
        //   submitted_at: new Date().toISOString()
        // })
    }

    function handleContinueEditing(phase: number) {
        router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=${phase}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        AuthorsLab.ai
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Celebration Header */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-gradient-to-r from-green-100 via-purple-100 to-blue-100 px-6 py-3 rounded-full text-lg font-bold mb-6 border-2 border-blue-400">
                        🎉 All 3 Editing Phases Complete!
                    </div>

                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Your Manuscript is Professionally Edited
                    </h1>

                    <p className="text-2xl text-gray-600 mb-2">
                        {manuscript?.title}
                    </p>

                    <p className="text-lg text-gray-500">
                        {manuscript?.current_word_count.toLocaleString()} words of polished, publication-ready content
                    </p>
                </div>

                {/* Achievement Summary */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        What You&apos;ve Accomplished
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Phase 1 - Alex */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                👔
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 1: Alex</h3>
                            <p className="text-green-600 font-semibold mb-3">Developmental Editing</p>
                            <ul className="text-sm text-gray-600 space-y-1 text-left">
                                <li>✓ Story structure refined</li>
                                <li>✓ Character arcs developed</li>
                                <li>✓ Plot tightened</li>
                                <li>✓ Pacing optimized</li>
                            </ul>
                        </div>

                        {/* Phase 2 - Sam */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                ✨
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 2: Sam</h3>
                            <p className="text-purple-600 font-semibold mb-3">Line Editing</p>
                            <ul className="text-sm text-gray-600 space-y-1 text-left">
                                <li>✓ Word choice refined</li>
                                <li>✓ Rhythm perfected</li>
                                <li>✓ Dialogue polished</li>
                                <li>✓ Voice strengthened</li>
                            </ul>
                        </div>

                        {/* Phase 3 - Jordan */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                                🔍
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 3: Jordan</h3>
                            <p className="text-blue-600 font-semibold mb-3">Copy Editing</p>
                            <ul className="text-sm text-gray-600 space-y-1 text-left">
                                <li>✓ Grammar perfected</li>
                                <li>✓ Punctuation accurate</li>
                                <li>✓ Consistency verified</li>
                                <li>✓ Technical polish complete</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Download Manuscript Versions */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-2 border-purple-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                        📥 Download Your Manuscript Versions
                    </h2>

                    <p className="text-gray-600 text-center mb-8">
                        We&apos;ve saved a version of your manuscript at each editing milestone
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {versions.map((version) => (
                            <div
                                key={version.id}
                                className={`p-6 rounded-xl border-2 ${version.phase_number === 1
                                        ? 'bg-green-50 border-green-300'
                                        : version.phase_number === 2
                                            ? 'bg-purple-50 border-purple-300'
                                            : 'bg-blue-50 border-blue-300'
                                    }`}
                            >
                                <h3 className="font-bold text-gray-900 mb-2">
                                    Phase {version.phase_number}: {version.editor_name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {new Date(version.created_at).toLocaleDateString()}
                                </p>
                                {version.file_url ? (
                                    <a
                                        href={version.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Download PDF
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="block w-full text-center px-4 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg font-semibold text-gray-400 cursor-not-allowed"
                                    >
                                        Processing...
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Continue Editing */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-12 border-2 border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                        Want to Continue Editing?
                    </h2>

                    <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                        Return to any of your editors to review, refine, or discuss your manuscript further. All your progress is saved.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Return to Alex */}
                        <button
                            onClick={() => handleContinueEditing(1)}
                            className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl group"
                        >
                            <div className="text-4xl mb-3">👔</div>
                            <h3 className="text-xl font-bold mb-2">Return to Alex</h3>
                            <p className="text-sm text-green-100">
                                Review story structure & character development
                            </p>
                        </button>

                        {/* Return to Sam */}
                        <button
                            onClick={() => handleContinueEditing(2)}
                            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl group"
                        >
                            <div className="text-4xl mb-3">✨</div>
                            <h3 className="text-xl font-bold mb-2">Return to Sam</h3>
                            <p className="text-sm text-purple-100">
                                Polish more prose & refine your voice
                            </p>
                        </button>

                        {/* Return to Jordan */}
                        <button
                            onClick={() => handleContinueEditing(3)}
                            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl group"
                        >
                            <div className="text-4xl mb-3">🔍</div>
                            <h3 className="text-xl font-bold mb-2">Return to Jordan</h3>
                            <p className="text-sm text-blue-100">
                                Fine-tune grammar & technical details
                            </p>
                        </button>
                    </div>
                </div>

                {/* What's Coming Next */}
                <div className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-12 border-2 border-teal-300">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                        🚀 What&apos;s Coming Next
                    </h2>

                    <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                        We&apos;re building two more phases to take your manuscript from edited to published and marketed!
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Phase 4 - Taylor */}
                        <div className="bg-white rounded-xl p-6 border-2 border-teal-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-3xl">
                                    📚
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Phase 4: Taylor</h3>
                                    <p className="text-teal-600 font-semibold">Publishing Preparation</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Taylor will help you format your manuscript for publication, prepare cover copy, and guide you through publishing options (traditional, indie, hybrid).
                            </p>
                            <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                                <p className="text-sm font-semibold text-teal-700">
                                    🎯 Coming in ~1 week
                                </p>
                            </div>
                        </div>

                        {/* Phase 5 - Quinn */}
                        <div className="bg-white rounded-xl p-6 border-2 border-orange-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Phase 5: Quinn</h3>
                                    <p className="text-orange-600 font-semibold">Marketing Strategy</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Quinn will help you build your author platform, create a book marketing plan, and connect with your target readers through strategic promotion.
                            </p>
                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                <p className="text-sm font-semibold text-orange-700">
                                    🎯 Coming in ~2 weeks
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beta Feedback */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-300">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                        💬 Help Us Improve
                    </h2>

                    <p className="text-gray-600 text-center mb-6">
                        As a beta tester, your feedback is invaluable. How was your experience with Alex, Sam, and Jordan?
                    </p>

                    {!feedbackSubmitted ? (
                        <div className="max-w-2xl mx-auto">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Share your thoughts: What worked well? What could be better? Any bugs or issues?"
                                className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <button
                                onClick={handleFeedbackSubmit}
                                disabled={!feedback.trim()}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Feedback
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-lg font-semibold text-green-800 mb-2">
                                    Thank you for your feedback!
                                </p>
                                <p className="text-gray-600">
                                    Your insights help us build a better writing platform for all authors.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function PhaseCompletePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <PhaseCompleteContent />
        </Suspense>
    )
}