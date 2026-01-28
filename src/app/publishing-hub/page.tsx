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

interface Manuscript {
  title?: string
  genre?: string
  manuscript_summary?: string
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
    const cleanup = subscribeToProgressUpdates()
    return cleanup
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
      .channel(`taylor-panel-progress-${manuscriptId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'publishing_progress',
          filter: `manuscript_id=eq.${manuscriptId}`
        },
        (payload) => {
          console.log('📊 Taylor: Publishing progress updated via realtime')
          if (payload.new.assessment_completed === true) {
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

  // ✅ NEW: Callback for when assessment completes
  // This provides a fallback in case realtime subscription doesn't fire
  async function handleAssessmentComplete() {
    console.log('🔄 Assessment complete callback triggered - refreshing status...')

    // Small delay to ensure database has been updated
    await new Promise(resolve => setTimeout(resolve, 1000))

    const supabase = createClient()
    const { data } = await supabase
      .from('publishing_progress')
      .select('assessment_completed, plan_pdf_url')
      .eq('manuscript_id', manuscriptId)
      .single()

    if (data) {
      console.log('✅ Refreshed assessment status:', data.assessment_completed)
      setAssessmentCompleted(data.assessment_completed || false)
      setPublishingPlanUrl(data.plan_pdf_url)
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
        <AssessmentView
          manuscriptId={manuscriptId}
          onAssessmentComplete={handleAssessmentComplete}  // ✅ Pass callback
        />
      ) : (
        <TaylorChatView manuscriptId={manuscriptId} planPdfUrl={publishingPlanUrl} />
      )}
    </div>
  )
}

// ============================================
// Assessment View Component
// ============================================

interface AssessmentViewProps {
  manuscriptId: string
  onAssessmentComplete: () => Promise<void>  // ✅ NEW: Callback prop
}

function AssessmentView({ manuscriptId, onAssessmentComplete }: AssessmentViewProps) {
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

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="font-bold text-gray-900 mb-4">{currentQuestion.question}</h3>

        <div className="space-y-2">
          {currentQuestion.options.map((option) => {
            const isSelected = isMultiSelect
              ? selectedMultiple.includes(option.value)
              : answers[currentQuestion.id as keyof AssessmentAnswers] === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-teal-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                    ? 'border-teal-500 bg-teal-500'
                    : 'border-gray-300'
                    }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        )}
        {isMultiSelect && (
          <button
            onClick={handleMultiSelectNext}
            disabled={selectedMultiple.length === 0}
            className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLastQuestion ? 'Submit' : 'Next →'}
          </button>
        )}
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
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadChatHistory()
    loadManuscriptData()
    const cleanup = subscribeToChatUpdates()
    return cleanup
  }, [manuscriptId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadManuscriptData() {
    const supabase = createClient()
    const { data } = await supabase
      .from('manuscripts')
      .select('title, genre, manuscript_summary')
      .eq('id', manuscriptId)
      .single()

    if (data) {
      setManuscript(data)
    }
  }

  async function loadChatHistory() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('editor_chat_history')
      .select('*')
      .eq('manuscript_id', manuscriptId)
      .eq('phase_number', 4)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('❌ Error loading chat history:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('💬 Loaded', data.length, 'Taylor chat messages')
      setMessages(data.map(msg => ({
        id: msg.id,
        sender: (msg.sender === 'Author' ? 'user' : msg.sender.toLowerCase()) as 'user' | 'taylor',
        message: msg.message,
        created_at: msg.created_at
      })))
    }
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
          // Only handle phase 4 (Taylor) messages
          if (payload.new.phase_number !== 4) return

          console.log('💬 New Taylor message received via realtime')
          const newMsg: ChatMessage = {
            id: payload.new.id,
            sender: (payload.new.sender === 'Author' ? 'user' : payload.new.sender.toLowerCase()) as 'user' | 'taylor',
            message: payload.new.message,
            created_at: payload.new.created_at
          }

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // Stop loading if this is Taylor's response
          if (newMsg.sender === 'taylor') {
            setIsLoading(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSendMessage(message: string) {
    if (!message.trim() || isLoading) return

    const trimmedMessage = message.trim()
    setInputMessage('')
    setIsLoading(true)

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      message: trimmedMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const supabase = createClient()

      // Save user message to database
      await supabase.from('editor_chat_history').insert({
        manuscript_id: manuscriptId,
        phase_number: 4,
        sender: 'user',
        message: trimmedMessage
      })

      // Call Taylor chat workflow
      const response = await fetch(TAYLOR_WEBHOOKS.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId,
          userMessage: trimmedMessage,
          manuscriptData: {
            genre: manuscript?.genre || 'fiction',
            title: manuscript?.title || 'the book',
            summary: manuscript?.manuscript_summary || ''
          },
          chatHistory: messages.slice(-10)
        })
      })

      // Check if there's an immediate response
      if (response.ok) {
        const data = await response.json()

        if (data.response) {
          console.log('💬 Received immediate response from workflow')
          setMessages(prev => [...prev, {
            id: 'immediate-' + Date.now(),
            sender: 'taylor' as const,
            message: data.response,
            created_at: new Date().toISOString()
          }])
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Plan PDF Button */}
      {planPdfUrl && (
        <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-green-50 border-b border-gray-200">
          <a
            href={planPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            <span>📄</span>
            <span>View Your Publishing Plan</span>
          </a>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
              <p className="text-sm">Loading chat history...</p>
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
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Taylor is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage(inputMessage)
        }}
        className="p-4 border-t border-gray-200"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Taylor about publishing..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-100 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </>
  )
}