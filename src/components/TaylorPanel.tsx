'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ASSESSMENT_QUESTIONS, type AssessmentAnswers } from '@/types/database'

interface TaylorPanelProps {
    manuscriptId: string
}

interface ChatMessage {
    id: string
    sender: 'user' | 'taylor'
    message: string
    created_at: string
}

export default function TaylorPanel({ manuscriptId }: TaylorPanelProps) {
    const [assessmentCompleted, setAssessmentCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [publishingPlanUrl, setPublishingPlanUrl] = useState<string | null>(null)

    useEffect(() => {
        checkAssessmentStatus()
        subscribeToProgressUpdates()
    }, [manuscriptId])

    async function checkAssessmentStatus() {
        const supabase = createClient()
        const { data } = await supabase
            .from('publishing_progress')
            .select('assessment_completed, plan_pdf_url')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (data) {
            setAssessmentCompleted(data.assessment_completed || false)
            setPublishingPlanUrl(data.plan_pdf_url)
        }
        setIsLoading(false)
    }

    function subscribeToProgressUpdates() {
        const supabase = createClient()
        const channel = supabase
            .channel(`publishing-progress-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    console.log('📊 Publishing progress updated:', payload.new)
                    if (payload.new.assessment_completed) {
                        setAssessmentCompleted(true)
                        setPublishingPlanUrl(payload.new.plan_pdf_url)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    if (isLoading) {
        return (
            <div className="w-96 bg-white border-l border-gray-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Taylor Header */}
            <div className="p-4 border-b border-gray-200 bg-teal-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-2xl">
                        📚
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Taylor</h3>
                        <p className="text-xs text-gray-600">Publishing Specialist</p>
                    </div>
                </div>
            </div>

            {/* Conditional Content: Assessment or Chat */}
            {!assessmentCompleted ? (
                <AssessmentView manuscriptId={manuscriptId} />
            ) : (
                <TaylorChatView manuscriptId={manuscriptId} planPdfUrl={publishingPlanUrl} />
            )}
        </div>
    )
}

// ============================================
// Assessment View Component
// ============================================

function AssessmentView({ manuscriptId }: { manuscriptId: string }) {
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
            // Multi-select: toggle selection
            const newSelected = selectedMultiple.includes(value)
                ? selectedMultiple.filter(v => v !== value)
                : [...selectedMultiple, value]

            setSelectedMultiple(newSelected)
        } else {
            // Single select: move to next immediately
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
        // Save multi-select answers and move to next question
        const newAnswers = {
            ...answers,
            [currentQuestion.id]: selectedMultiple
        }
        setAnswers(newAnswers)
        setSelectedMultiple([]) // Reset for next multi-select question

        if (isLastQuestion) {
            submitAssessment(newAnswers)
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    function handleBack() {
        if (currentQuestionIndex > 0) {
            const newIndex = currentQuestionIndex - 1
            setCurrentQuestionIndex(newIndex)

            // Restore previous multi-select if going back
            const previousQuestion = ASSESSMENT_QUESTIONS[newIndex]
            if (previousQuestion.multiSelect) {
                // Fix TypeScript error by using type assertion
                const previousAnswer = answers[previousQuestion.id as keyof AssessmentAnswers]
                setSelectedMultiple(Array.isArray(previousAnswer) ? previousAnswer : [])
            } else {
                // Clear multi-select when going back to single-select question
                setSelectedMultiple([])
            }
        }
    }

    async function submitAssessment(finalAnswers: Partial<AssessmentAnswers>) {
        setIsSubmitting(true)

        try {
            // Call n8n webhook to generate publishing plan
            const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_TAYLOR_ASSESSMENT!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId,
                    assessmentAnswers: finalAnswers,
                    manuscriptTitle,
                    authorName
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate publishing plan')
            }

            console.log('✅ Assessment submitted, waiting for plan generation...')
            // The subscription will automatically update when plan is ready

        } catch (error) {
            console.error('❌ Error submitting assessment:', error)
            setIsSubmitting(false)
            // TODO: Show error message to user
        }
    }

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

            {/* Greeting (only on first question) */}
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

            {/* Question */}
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
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                                                ? 'bg-teal-500 border-teal-500'
                                                : 'border-gray-300'
                                            }`}>
                                            {isSelected && (
                                                <span className="text-white text-sm">✓</span>
                                            )}
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

            {/* Footer with Back and Next buttons */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Back Button */}
                    {currentQuestionIndex > 0 ? (
                        <button
                            onClick={handleBack}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div></div> // Spacer for flexbox alignment
                    )}

                    {/* Next Button (only for multi-select questions) */}
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

// ============================================
// Taylor Chat View Component
// ============================================

function TaylorChatView({ manuscriptId, planPdfUrl }: { manuscriptId: string, planPdfUrl: string | null }) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadChatHistory()
        subscribeToChatUpdates()
    }, [manuscriptId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function loadChatHistory() {
        const supabase = createClient()
        const { data } = await supabase
            .from('editor_chat_history')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .eq('phase_number', 4)
            .order('created_at', { ascending: true })

        if (data && data.length > 0) {
            setMessages(data.map(msg => ({
                id: msg.id,
                sender: msg.sender === 'author' ? 'user' : 'taylor',
                message: msg.message,
                created_at: msg.created_at
            })))
        } else {
            // Add initial greeting
            addInitialGreeting()
        }
    }

    async function addInitialGreeting() {
        const supabase = createClient()
        const { data: manuscript } = await supabase
            .from('manuscripts')
            .select('title, author_profiles!inner(first_name)')
            .eq('id', manuscriptId)
            .single()

        const profile = Array.isArray(manuscript?.author_profiles)
            ? manuscript.author_profiles[0]
            : manuscript?.author_profiles
        const authorName = profile?.first_name || 'there'
        const title = manuscript?.title || 'your manuscript'

        const greeting = `Hi ${authorName}! 👋

Your publishing plan for "${title}" is ready! ${planPdfUrl ? 'You can view it using the button above.' : ''}

I'm here to help you with every step of your publishing journey. Feel free to ask me about:

• Cover design and formatting
• Platform selection and setup
• Publishing timeline and strategy
• Any questions about your plan

What would you like to work on first?`

        // Save greeting to database
        await supabase
            .from('editor_chat_history')
            .insert({
                manuscript_id: manuscriptId,
                phase_number: 4,
                sender: 'taylor',
                message: greeting
            })

        setMessages([{
            id: 'greeting-' + Date.now(),
            sender: 'taylor',
            message: greeting,
            created_at: new Date().toISOString()
        }])
    }

    function subscribeToChatUpdates() {
        const supabase = createClient()
        const channel = supabase
            .channel(`taylor-chat-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'editor_chat_history',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    const newMessage = payload.new
                    if (newMessage.phase_number === 4 && newMessage.sender === 'taylor') {
                        setMessages(prev => [...prev, {
                            id: newMessage.id,
                            sender: 'taylor',
                            message: newMessage.message,
                            created_at: newMessage.created_at
                        }])
                        setIsLoading(false)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!inputMessage.trim() || isLoading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')
        setIsLoading(true)

        // Add user message immediately
        const tempId = 'temp-' + Date.now()
        setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user',
            message: userMessage,
            created_at: new Date().toISOString()
        }])

        // Save to database
        const supabase = createClient()
        await supabase
            .from('editor_chat_history')
            .insert({
                manuscript_id: manuscriptId,
                phase_number: 4,
                sender: 'author',
                message: userMessage
            })

        // Call n8n webhook for Taylor's response
        try {
            await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL_TAYLOR_CHAT!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId,
                    userMessage,
                    chatHistory: messages.slice(-10) // Send last 10 messages for context
                })
            })
        } catch (error) {
            console.error('❌ Error sending message:', error)
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Publishing Plan Button (if available) */}
            {planPdfUrl && (
                <div className="px-4 py-3 border-b border-gray-200 bg-teal-50">
                    <a
                        href={planPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all text-sm"
                    >
                        📄 View Your Publishing Plan
                    </a>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-lg p-3 ${msg.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 border border-gray-200'
                                }`}
                        >
                            <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                <span>Taylor is typing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask Taylor..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                    >
                        Send
                    </button>
                </div>
            </form>
        </>
    )
}