// ============================================
// Assessment View Component
// Handles the questionnaire flow before publishing
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ASSESSMENT_QUESTIONS, type AssessmentAnswers } from '@/types/database'
import { TAYLOR_WEBHOOKS } from './taylorTypes'

interface AssessmentViewProps {
    manuscriptId: string
    onAssessmentComplete: () => Promise<void>  // ✅ NEW: Callback when assessment completes
}

export default function AssessmentView({ manuscriptId, onAssessmentComplete }: AssessmentViewProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({})
    const [selectedMultiple, setSelectedMultiple] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [authorName, setAuthorName] = useState('there')
    const [manuscriptTitle, setManuscriptTitle] = useState('your manuscript')

    useEffect(() => {
        loadManuscriptDetails()
    }, [manuscriptId])

    async function loadManuscriptDetails() {
        const supabase = createClient()
        const { data } = await supabase
            .from('manuscripts')
            .select('title, author_profiles!inner(first_name)')
            .eq('id', manuscriptId)
            .single()

        if (data) {
            setManuscriptTitle(data.title)
            const profile = Array.isArray(data.author_profiles)
                ? data.author_profiles[0]
                : data.author_profiles
            setAuthorName(profile?.first_name || 'there')
        }
    }

    const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1
    const isMultiSelect = currentQuestion.multiSelect || false

    function handleAnswer(value: string) {
        if (isMultiSelect) {
            const newSelected = selectedMultiple.includes(value)
                ? selectedMultiple.filter(v => v !== value)
                : [...selectedMultiple, value]
            setSelectedMultiple(newSelected)
        } else {
            const newAnswers = {
                ...answers,
                [currentQuestion.id]: value
            }
            setAnswers(newAnswers)

            if (isLastQuestion) {
                submitAssessment(newAnswers)
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
            }
        }
    }

    function handleMultiSelectNext() {
        console.log('🎯 Next button clicked, current selections:', selectedMultiple)

        const newAnswers = {
            ...answers,
            [currentQuestion.id]: selectedMultiple
        }

        console.log('💾 Updated answers:', newAnswers)
        setAnswers(newAnswers)
        setSelectedMultiple([])

        if (isLastQuestion) {
            console.log('🏁 Last question - submitting assessment')
            submitAssessment(newAnswers)
        } else {
            console.log('➡️ Moving to next question')
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    function handleBack() {
        if (currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1
            setCurrentQuestionIndex(newIndex)

            const previousQuestion = ASSESSMENT_QUESTIONS[newIndex]
            if (previousQuestion.multiSelect) {
                const previousAnswer = answers[previousQuestion.id as keyof AssessmentAnswers]
                setSelectedMultiple(Array.isArray(previousAnswer) ? previousAnswer : [])
            } else {
                setSelectedMultiple([])
            }
        }
    }

    async function submitAssessment(finalAnswers: Partial<AssessmentAnswers>) {
        console.log('📋 Submitting assessment with answers:', finalAnswers)
        setIsSubmitting(true)

        try {
            const response = await fetch(TAYLOR_WEBHOOKS.assessment, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId,
                    assessmentAnswers: finalAnswers,
                    manuscriptTitle,
                    authorName
                })
            })

            console.log('📡 Webhook response status:', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Webhook error response:', errorText)
                throw new Error(`Failed to generate publishing plan: ${response.status}`)
            }

            const responseData = await response.json()
            console.log('✅ Assessment submitted successfully:', responseData)

            // ✅ FIX: Call the parent callback to refresh assessment status
            // This ensures the view switches even if realtime subscription fails
            console.log('🔄 Calling onAssessmentComplete callback...')
            await onAssessmentComplete()

            // Note: isSubmitting will stay true, but that's fine because
            // the parent component will now switch to TaylorChatView

        } catch (error) {
            console.error('❌ Error submitting assessment:', error)
            setIsSubmitting(false)
            alert('There was an error submitting your assessment. Please try again.')
        }
    }

    // ============================================
    // Render: Submitting State
    // ============================================
    if (isSubmitting) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Creating Your Publishing Plan</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Taylor is analyzing your answers and crafting a personalized strategy...
                    </p>
                    <p className="text-xs text-gray-500">This usually takes 2-3 minutes</p>
                </div>
            </div>
        )
    }

    // ============================================
    // Render: Question Form
    // ============================================
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Progress Bar */}
            <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                        Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
                    </span>
                    <span className="text-xs text-gray-500">
                        {Math.round(((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Welcome Message (first question only) */}
            {currentQuestionIndex === 0 && (
                <div className="px-4 pt-6 pb-4">
                    <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            <strong>Hi {authorName}!</strong> 👋
                            <br /><br />
                            I&apos;m Taylor, your publishing specialist. Let&apos;s create a personalized publishing plan for &quot;{manuscriptTitle}&quot;.
                            <br /><br />
                            I&apos;ll ask you a few quick questions (3-5 minutes) to understand your goals and help you succeed.
                        </p>
                    </div>
                </div>
            )}

            {/* Question & Options */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">
                    {currentQuestion.question}
                </h3>

                {isMultiSelect && (
                    <p className="text-sm text-gray-600 mb-3">
                        ✓ Select all that apply
                    </p>
                )}

                <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = isMultiSelect && selectedMultiple.includes(option.value)

                        return (
                            <button
                                key={option.value}
                                onClick={() => handleAnswer(option.value)}
                                className={`w-full text-left p-4 border-2 rounded-lg transition-all group ${isSelected
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {isMultiSelect && (
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
                                            }`}>
                                            {isSelected && <span className="text-white text-sm">✓</span>}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-gray-900 group-hover:text-teal-700'
                                            }`}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className="text-sm text-gray-600 mt-1">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    {currentQuestionIndex > 0 ? (
                        <button
                            onClick={handleBack}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {isMultiSelect && (
                        <button
                            onClick={handleMultiSelectNext}
                            disabled={selectedMultiple.length === 0}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLastQuestion ? 'Submit' : 'Next →'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}