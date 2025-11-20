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

const TAYLOR_WEBHOOKS = {
    assessment: 'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-assessment',
    chat: 'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-chat'
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
        console.log('🔍 [PANEL] checkAssessmentStatus called for:', manuscriptId)
        const supabase = createClient()
        const { data } = await supabase
            .from('publishing_progress')
            .select('assessment_completed, plan_pdf_url')
            .eq('manuscript_id', manuscriptId)
            .single()

        console.log('🔍 [PANEL] Query result:', data)
        if (data) {
            console.log('🔍 [PANEL] Setting assessmentCompleted:', data.assessment_completed)
            console.log('🔍 [PANEL] Setting planPdfUrl:', data.plan_pdf_url)
            setAssessmentCompleted(data.assessment_completed || false)
            setPublishingPlanUrl(data.plan_pdf_url)
        }
        console.log('🔍 [PANEL] Setting isLoading to false')
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
                    console.log('🔍 [SUB] assessment_completed value:', payload.new.assessment_completed)

                    // Instead of trying to update state from the callback,
                    // re-check the database to get fresh data
                    if (payload.new.assessment_completed) {
                        console.log('✅ [SUB] Assessment completed detected - rechecking database')
                        checkAssessmentStatus()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    if (isLoading) {
        console.log('🔍 [PANEL] Rendering loading spinner')
        return (
            <div className="w-96 bg-white border-l border-gray-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    console.log('🔍 [PANEL] isLoading is false, rendering main panel')
    console.log('🔍 [PANEL] assessmentCompleted:', assessmentCompleted)

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
                <>
                    {console.log('🔍 [PANEL] Rendering AssessmentView')}
                    <AssessmentView manuscriptId={manuscriptId} />
                </>
            ) : (
                <>
                    {console.log('🔍 [PANEL] Rendering TaylorChatView')}
                    <TaylorChatView manuscriptId={manuscriptId} planPdfUrl={publishingPlanUrl} />
                </>
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

            // ✅ REMOVED: Frontend no longer saves the message
            // The n8n workflow will handle saving Taylor's welcome message directly
            // This avoids RLS policy issues and timing problems

        } catch (error) {
            console.error('❌ Error submitting assessment:', error)
            setIsSubmitting(false)
            alert('There was an error submitting your assessment. Please try again.')
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

// ============================================
// Taylor Chat View Component
// ============================================

function TaylorChatView({ manuscriptId, planPdfUrl }: { manuscriptId: string, planPdfUrl: string | null }) {
    console.log('🔍 [CHAT] TaylorChatView component rendering')
    console.log('🔍 [CHAT] manuscriptId:', manuscriptId)
    console.log('🔍 [CHAT] planPdfUrl:', planPdfUrl)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        console.log('🔍 [CHAT] useEffect triggered - calling loadChatHistory and subscribeToChatUpdates')
        loadChatHistory()
        subscribeToChatUpdates()
    }, [manuscriptId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function loadChatHistory() {
        console.log('🔍 [CHAT] loadChatHistory called for manuscript:', manuscriptId)

        const supabase = createClient()
        console.log('🔍 [CHAT] Supabase client created')

        const { data, error } = await supabase
            .from('editor_chat_history')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .eq('phase_number', 4)
            .order('created_at', { ascending: true })

        console.log('🔍 [CHAT] Query executed')
        console.log('🔍 [CHAT] Error:', error)
        console.log('🔍 [CHAT] Data:', data)
        console.log('🔍 [CHAT] Data length:', data?.length)

        if (error) {
            console.error('❌ Error loading chat history:', error)
            return
        }

        if (data && data.length > 0) {
            console.log('💬 Loaded chat history:', data.length, 'messages')
            console.log('🔍 [CHAT] First message:', data[0])
            setMessages(data.map(msg => ({
                id: msg.id,
                sender: (msg.sender === 'Author' ? 'user' : 'taylor') as 'user' | 'taylor',
                message: msg.message,
                created_at: msg.created_at
            })))
        } else {
            console.log('📭 No existing chat history, waiting for Taylor welcome message...')
            console.log('🔍 [CHAT] Messages array is now empty')
        }
    }

    function subscribeToChatUpdates() {
        console.log('🔍 [CHAT] Setting up subscription for manuscript:', manuscriptId)

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
                    console.log('🔍 [CHAT] Realtime event received!')
                    console.log('🔍 [CHAT] Payload:', payload)

                    const newMessage = payload.new
                    console.log('💬 New chat message received:', newMessage.sender)
                    console.log('🔍 [CHAT] Phase number:', newMessage.phase_number)
                    console.log('🔍 [CHAT] Checking if phase === 4 and sender === Taylor')

                    if (newMessage.phase_number === 4 && newMessage.sender === 'Taylor') {
                        console.log('✅ [CHAT] Conditions met, adding message to state')
                        setMessages(prev => {
                            console.log('🔍 [CHAT] Previous messages:', prev.length)
                            const updated: ChatMessage[] = [...prev, {
                                id: newMessage.id,
                                sender: 'taylor' as const,
                                message: newMessage.message,
                                created_at: newMessage.created_at
                            }]
                            console.log('🔍 [CHAT] Updated messages:', updated.length)
                            return updated
                        })
                        setIsLoading(false)
                    } else {
                        console.log('❌ [CHAT] Conditions NOT met')
                        console.log('🔍 [CHAT] Phase match:', newMessage.phase_number === 4)
                        console.log('🔍 [CHAT] Sender match:', newMessage.sender === 'Taylor')
                    }
                }
            )
            .subscribe((status) => {
                console.log('🔍 [CHAT] Subscription status:', status)
            })

        return () => {
            console.log('🔍 [CHAT] Cleaning up subscription')
            supabase.removeChannel(channel)
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!inputMessage.trim() || isLoading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')
        setIsLoading(true)

        const tempId = 'temp-' + Date.now()
        setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user' as const,
            message: userMessage,
            created_at: new Date().toISOString()
        }])

        const supabase = createClient()
        const { error } = await supabase
            .from('editor_chat_history')
            .insert({
                manuscript_id: manuscriptId,
                phase_number: 4,
                sender: 'Author',
                message: userMessage
            })

        if (error) {
            console.error('❌ Error saving user message:', error)
            setIsLoading(false)
            return
        }

        try {
            await fetch(TAYLOR_WEBHOOKS.chat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId,
                    userMessage,
                    chatHistory: messages.slice(-10)
                })
            })
        } catch (error) {
            console.error('❌ Error sending message:', error)
            setIsLoading(false)
        }
    }

    return (
        <>
            {planPdfUrl && (
                <div className="px-4 py-3 border-b border-gray-200 bg-teal-50">

                    <a href={planPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all text-sm"
                    >
                        📄 View Your Publishing Plan
                    </a>
                </div>
            )
            }

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                            <p className="text-sm">Waiting for Taylor...</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
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
                    ))
                )}

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