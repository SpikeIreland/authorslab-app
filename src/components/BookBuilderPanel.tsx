'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface BookBuilderProps {
    manuscriptId: string
    onOpenTaylorChat?: (message?: string) => void
}

interface ManuscriptData {
    title: string
    current_word_count: number
    total_chapters: number
}

interface CoverData {
    selected_cover_url: string | null
}

type AssemblyStep = 'cover' | 'interior' | 'metadata' | 'ready'

export default function BookBuilderPanel({
    manuscriptId,
    onOpenTaylorChat
}: BookBuilderProps) {
    const [manuscript, setManuscript] = useState<ManuscriptData | null>(null)
    const [coverUrl, setCoverUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [readinessScore, setReadinessScore] = useState(0)
    const [nextStep, setNextStep] = useState<AssemblyStep>('cover')
    const [assessmentCompleted, setAssessmentCompleted] = useState(false)  // NEW

    useEffect(() => {
        loadBookData()
    }, [manuscriptId])

    async function loadBookData() {
        const supabase = createClient()

        // Load manuscript data
        const { data: manuscriptData } = await supabase
            .from('manuscripts')
            .select('title, current_word_count, total_chapters')
            .eq('id', manuscriptId)
            .single()  // Keep this one as .single() - manuscript always exists

        // Load publishing progress with assessment status
        const { data: progressData } = await supabase
            .from('publishing_progress')
            .select('selected_cover_url, assessment_completed')
            .eq('manuscript_id', manuscriptId)
            .maybeSingle()  // CHANGED from .single()

        if (manuscriptData) {
            setManuscript(manuscriptData)
        }

        if (progressData) {
            setCoverUrl(progressData.selected_cover_url)
            setAssessmentCompleted(progressData.assessment_completed || false)
        } else {
            // No progress row yet - assessment not started
            console.log('📊 No publishing progress yet')
            setAssessmentCompleted(false)
            setCoverUrl(null)
        }

        // Calculate readiness
        calculateReadiness(manuscriptData, progressData)
        setIsLoading(false)
    }

    // Realtime subscription for cover updates
    useEffect(() => {
        if (!manuscriptId) return

        const supabase = createClient()

        const channel = supabase
            .channel(`book-builder-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    console.log('📚 Book Builder: Publishing progress updated')

                    if (payload.new.selected_cover_url !== coverUrl) {
                        setCoverUrl(payload.new.selected_cover_url)
                        // Recalculate readiness
                        calculateReadiness(manuscript, {
                            selected_cover_url: payload.new.selected_cover_url
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [manuscriptId, manuscript, coverUrl])

    function calculateReadiness(
        manuscript: ManuscriptData | null,
        progress: CoverData | null
    ) {
        let score = 0
        let next: AssemblyStep = 'cover'

        // Manuscript complete = 25%
        if (manuscript) {
            score += 25
        }

        // Cover selected = 35%
        if (progress?.selected_cover_url) {
            score += 35
            next = 'interior'
        }

        // Interior (Phase C) = 30%
        // Publishing metadata = 10%
        // Total = 100%

        setReadinessScore(score)
        setNextStep(next)
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-blue-200 mb-12">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-12">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            📚 Your Book Assembly
                        </h2>
                        <p className="text-gray-600">
                            {manuscript?.title || 'Untitled Manuscript'}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-blue-600 mb-1">
                            {readinessScore}%
                        </div>
                        <div className="text-sm text-gray-600">Complete</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${readinessScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Component Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* 1. Manuscript Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-400">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl">
                            ✅
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Manuscript</h3>
                            <p className="text-sm text-green-600">Complete</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                            <span>Words:</span>
                            <span className="font-semibold">{manuscript?.current_word_count?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Chapters:</span>
                            <span className="font-semibold">{manuscript?.total_chapters}</span>
                        </div>
                    </div>

                    <Link
                        href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                        className="block text-center w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-all text-sm"
                    >
                        View in Studio
                    </Link>
                </div>

                {/* 2. Cover Card */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border-2 ${coverUrl ? 'border-purple-400' : 'border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${coverUrl ? 'bg-purple-500' : 'bg-gray-300'
                            }`}>
                            {coverUrl ? '✅' : '🎨'}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Cover Design</h3>
                            <p className={`text-sm ${coverUrl ? 'text-purple-600' : 'text-gray-500'}`}>
                                {coverUrl ? 'Selected' : assessmentCompleted ? 'Pending' : 'Assessment Required'}
                            </p>
                        </div>
                    </div>

                    {coverUrl ? (
                        <>
                            {/* Cover Preview */}
                            <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                    src={coverUrl}
                                    alt="Selected cover"
                                    className="w-full aspect-[2/3] object-cover"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    document.getElementById('cover-designer-panel')?.scrollIntoView({
                                        behavior: 'smooth'
                                    })
                                }}
                                className="block text-center w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-all text-sm"
                            >
                                Change Cover
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 text-center py-8 bg-gray-50 rounded-lg">
                                {assessmentCompleted ? (
                                    <p className="text-gray-500 text-sm">
                                        No cover selected yet
                                    </p>
                                ) : (
                                    <p className="text-amber-600 text-sm font-semibold">
                                        Complete your publishing assessment first
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={async () => {
                                    if (assessmentCompleted) {
                                        onOpenTaylorChat?.("Hi Taylor! I'd like to design my book cover")
                                    } else {
                                        // Clear any existing incomplete assessment chat history
                                        const supabase = createClient()
                                        await supabase
                                            .from('editor_chat_history')
                                            .delete()
                                            .eq('manuscript_id', manuscriptId)
                                            .eq('phase_number', 4)

                                        // Open chat to start fresh
                                        onOpenTaylorChat?.("Hi Taylor! I'm ready to start")
                                    }
                                }}
                                className={`block text-center w-full px-4 py-2 rounded-lg font-semibold transition-all text-sm ${assessmentCompleted
                                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                                        : 'bg-amber-500 text-white hover:bg-amber-600'
                                    }`}
                            >
                                {assessmentCompleted ? 'Select Cover' : 'Start Assessment'}
                            </button>
                        </>
                    )}
                </div>

                {/* 3. Interior Format Card (Phase C Placeholder) */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-300 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-2xl">
                            📖
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Interior Format</h3>
                            <p className="text-sm text-gray-500">Phase C</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                            <span>⏳</span>
                            <span>Kindle Format</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⏳</span>
                            <span>Print PDF (6×9)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⏳</span>
                            <span>EPUB Format</span>
                        </div>
                    </div>

                    <div className="text-center w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-semibold text-sm cursor-not-allowed">
                        Coming Soon
                    </div>
                </div>
            </div>

            {/* Next Step CTA */}
            <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                            Next Step: {!assessmentCompleted
                                ? 'Complete Publishing Assessment'
                                : nextStep === 'cover'
                                    ? 'Select Your Cover'
                                    : 'Interior Formatting'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {!assessmentCompleted
                                ? 'Answer a few questions about your publishing goals to get a personalized plan'
                                : nextStep === 'cover'
                                    ? 'Choose your favorite cover design from the options below'
                                    : 'Format your manuscript for Kindle, print, and EPUB (Coming in Phase C)'}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (!assessmentCompleted) {
                                onOpenTaylorChat?.("Hi Taylor! I'm ready to start")
                            } else if (nextStep === 'cover') {
                                onOpenTaylorChat?.("Hi Taylor! I'd like to design my book cover")
                            }
                        }}
                        disabled={assessmentCompleted && nextStep !== 'cover'}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${!assessmentCompleted || nextStep === 'cover'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {!assessmentCompleted
                            ? 'Start Assessment →'
                            : nextStep === 'cover'
                                ? 'Get Started →'
                                : 'Coming Soon'}
                    </button>
                </div>
            </div>
        </div>
    )
}