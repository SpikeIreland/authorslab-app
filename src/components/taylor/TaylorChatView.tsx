// ============================================
// Taylor Chat View Component
// Handles conversation after assessment is complete
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatMessage, Manuscript, TAYLOR_WEBHOOKS } from './taylorTypes'

interface TaylorChatViewProps {
    manuscriptId: string
    planPdfUrl: string | null
}

export default function TaylorChatView({ manuscriptId, planPdfUrl }: TaylorChatViewProps) {
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

    // ============================================
    // Data Loading Functions
    // ============================================

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
                sender: (msg.sender === 'Author' ? 'user' : 'taylor') as 'user' | 'taylor',
                message: msg.message,
                created_at: msg.created_at
            })))
        }
    }

    // ============================================
    // Realtime Subscription
    // ============================================

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
                    if (newMessage.phase_number === 4 && newMessage.sender === 'Taylor') {
                        console.log('💬 New Taylor message received via realtime')
                        setMessages(prev => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === newMessage.id)) return prev
                            const updated: ChatMessage[] = [...prev, {
                                id: newMessage.id,
                                sender: 'taylor' as const,
                                message: newMessage.message,
                                created_at: newMessage.created_at
                            }]
                            return updated
                        })
                        setIsLoading(false)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    // ============================================
    // Message Handling
    // ============================================

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!inputMessage.trim() || isLoading) return

        const userMessage = inputMessage.trim()
        setInputMessage('')
        setIsLoading(true)

        // Optimistically add user message to UI
        const tempId = 'temp-' + Date.now()
        setMessages(prev => [...prev, {
            id: tempId,
            sender: 'user' as const,
            message: userMessage,
            created_at: new Date().toISOString()
        }])

        const supabase = createClient()

        // Save user message to database
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
            const response = await fetch(TAYLOR_WEBHOOKS.chat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manuscriptId,
                    message: userMessage,
                    manuscriptData: {
                        genre: manuscript?.genre || 'fiction',
                        title: manuscript?.title || 'the book',
                        summary: manuscript?.manuscript_summary || ''
                    },
                    chatHistory: messages.slice(-10)
                })
            })

            // Check if there's an immediate response (like for cover generation)
            if (response.ok) {
                const data = await response.json()

                // If the workflow returns an immediate response, show it right away
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
                // Otherwise, wait for realtime subscription (normal chat)
                // isLoading stays true until subscription picks up the message
            }
        } catch (error) {
            console.error('❌ Error sending message:', error)
            setIsLoading(false)
        }
    }

    // ============================================
    // Render
    // ============================================

    return (
        <>
            {/* Publishing Plan PDF Button */}
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

            {/* Messages Area */}
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
                                    : 'bg-gray-100 text-gray-900 border border-gray-200'
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                            </div>
                        </div>
                    ))
                )}

                {/* Typing Indicator */}
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

            {/* Input Form */}
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