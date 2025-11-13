'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TaylorChatWidgetProps {
    manuscriptId: string
    isOpen?: boolean
    onClose?: () => void
    initialMessage?: string
}

interface ChatMessage {
    id: string
    sender: 'user' | 'taylor'
    message: string
    created_at: string
}

export default function TaylorChatWidget({
    manuscriptId,
    isOpen: externalIsOpen = false,
    onClose,
    initialMessage
}: TaylorChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(externalIsOpen)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync with external isOpen prop
    useEffect(() => {
        setIsOpen(externalIsOpen)
    }, [externalIsOpen])

    // Handle initial message when chat opens
    useEffect(() => {
        if (initialMessage && isOpen && messages.length > 0 && !hasProcessedInitialMessage) {
            console.log('📨 Processing initial message:', initialMessage)
            setHasProcessedInitialMessage(true)

            // Wait a moment for chat to fully load, then send
            setTimeout(() => {
                handleSendMessage(initialMessage)
            }, 800)
        }
    }, [initialMessage, isOpen, messages.length, hasProcessedInitialMessage])

    // Reset initial message flag when chat closes
    useEffect(() => {
        if (!isOpen) {
            setHasProcessedInitialMessage(false)
        }
    }, [isOpen])

    // Load chat history
    useEffect(() => {
        if (!isOpen || !manuscriptId) return
        loadChatHistory()
    }, [isOpen, manuscriptId])

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Realtime message updates
    useEffect(() => {
        if (!manuscriptId) return

        const supabase = createClient()
        console.log('🔌 Setting up Taylor message subscription for:', manuscriptId)

        const channel = supabase
            .channel(`taylor-messages-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'editor_chat_history',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    console.log('🎨 New chat message received:', payload.new)

                    // Only add if it's from Taylor (avoid duplicates from user messages)
                    if (payload.new.sender === 'Taylor') {
                        const newMessage: ChatMessage = {
                            id: payload.new.id,
                            sender: 'taylor',
                            message: payload.new.message,
                            created_at: payload.new.created_at
                        }

                        setMessages(prev => {
                            const exists = prev.some(m => m.id === newMessage.id)
                            if (exists) {
                                console.log('⚠️ Message already exists, skipping')
                                return prev
                            }
                            console.log('✅ Adding new Taylor message to chat')
                            return [...prev, newMessage]
                        })

                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                        }, 100)
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Taylor messages subscription status:', status)
            })

        return () => {
            console.log('🔌 Cleaning up Taylor messages subscription')
            supabase.removeChannel(channel)
        }
    }, [manuscriptId])

    async function loadChatHistory() {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('editor_chat_history')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .eq('phase_number', 4)
            .order('created_at', { ascending: true })

        if (!error && data) {
            const formattedMessages = data.map(msg => ({
                id: msg.id,
                sender: msg.sender.toLowerCase() === 'taylor' ? 'taylor' as const : 'user' as const,
                message: msg.message,
                created_at: msg.created_at
            }))
            setMessages(formattedMessages)

            // If no messages, add Taylor's greeting
            if (formattedMessages.length === 0) {
                addTaylorGreeting()
            }
        }
    }

    async function addTaylorGreeting() {
        const supabase = createClient()

        const { data: manuscript } = await supabase
            .from('manuscripts')
            .select('title, genre, current_word_count, author_profiles!inner(first_name)')
            .eq('id', manuscriptId)
            .single()

        const { data: publishingProgress } = await supabase
            .from('publishing_progress')
            .select('assessment_completed')
            .eq('manuscript_id', manuscriptId)
            .single()

        const authorProfile = Array.isArray(manuscript?.author_profiles)
            ? manuscript.author_profiles[0]
            : manuscript?.author_profiles

        const authorName = authorProfile?.first_name || 'there'
        const title = manuscript?.title || 'your manuscript'
        const assessmentCompleted = publishingProgress?.assessment_completed || false

        const greetingMessage = {
            id: 'greeting-' + Date.now(),
            sender: 'taylor' as const,
            message: assessmentCompleted
                ? `👋 Hi ${authorName}! Welcome back! I'm ready to help you with the next steps for "${title}". What would you like to work on today?`
                : `👋 Hi ${authorName}! I'm Taylor, your publishing specialist. I'm excited to help you bring "${title}" to life! 

Before we can design your cover or dive into publishing, I need to understand your goals. Let me ask you a few quick questions to create a personalized publishing plan.

Ready to start? Just say "I'm ready" or "let's begin"! 📚`,
            created_at: new Date().toISOString()
        }

        setMessages([greetingMessage])

        // Save greeting to database
        await supabase.from('editor_chat_history').insert({
            manuscript_id: manuscriptId,
            phase_number: 4,
            sender: 'Taylor',
            message: greetingMessage.message
        })
    }

    async function handleSendMessage(message: string) {
        if (!message.trim() || isLoading) return

        // Add user message to UI
        const userMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            message: message.trim(),
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, userMsg])
        setInputMessage('')
        setIsLoading(true)

        try {
            const supabase = createClient()

            // Save user message to database
            await supabase.from('editor_chat_history').insert({
                manuscript_id: manuscriptId,
                phase_number: 4,
                sender: 'user',
                message: message.trim()
            })

            // Check if publishing_progress exists and if assessment is completed
            const { data: progress, error: progressError } = await supabase
                .from('publishing_progress')
                .select('assessment_completed')
                .eq('manuscript_id', manuscriptId)
                .maybeSingle()  // Use maybeSingle instead of single to avoid error if row doesn't exist

            const assessmentCompleted = progress?.assessment_completed || false
            const hasNoProgress = !progress  // Row doesn't exist yet

            console.log('📋 Assessment status:', { assessmentCompleted, hasNoProgress })

            // Only block if no progress row exists AND user is trying to do cover stuff
            const wantsCover = message.toLowerCase().includes('cover') ||
                message.toLowerCase().includes('design')

            if (hasNoProgress && wantsCover) {
                // User wants covers but hasn't started assessment
                const redirectMsg: ChatMessage = {
                    id: 'taylor-' + Date.now(),
                    sender: 'taylor',
                    message: "I'd love to help you design an amazing cover! 🎨\n\nBut first, I need to understand your publishing goals through a quick assessment. You can start it by chatting with me or by clicking 'Start Assessment' in the Book Builder panel above.\n\nReady to begin?",
                    created_at: new Date().toISOString()
                }
                setMessages(prev => [...prev, redirectMsg])

                await supabase.from('editor_chat_history').insert({
                    manuscript_id: manuscriptId,
                    phase_number: 4,
                    sender: 'Taylor',
                    message: redirectMsg.message
                })

                setIsLoading(false)
                setTimeout(() => inputRef.current?.focus(), 100)
                return
            }

            // Get author first name
            const { data: profile } = await supabase
                .from('author_profiles')
                .select('first_name')
                .single()

            console.log('💬 Calling taylor-chat workflow...')

            // Call taylor-chat workflow for conversation
            const response = await fetch(
                'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-chat',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        manuscriptId,
                        message: message.trim(),
                        authorFirstName: profile?.first_name || 'there'
                    })
                }
            )

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Taylor responded:', data)

                // Add Taylor's response to UI
                const taylorMsg: ChatMessage = {
                    id: 'taylor-' + Date.now(),
                    sender: 'taylor',
                    message: data.response,
                    created_at: new Date().toISOString()
                }
                setMessages(prev => [...prev, taylorMsg])

                // Save Taylor's response to database
                await supabase.from('editor_chat_history').insert({
                    manuscript_id: manuscriptId,
                    phase_number: 4,
                    sender: 'Taylor',
                    message: data.response
                })

                // If Taylor indicates it's time to generate covers, trigger generation
                if (data.shouldGenerateCovers) {
                    console.log('🎨 Taylor wants to generate covers - triggering generation...')
                    await handleCoverRequest('generate covers based on our discussion')
                }
            } else {
                throw new Error(`Taylor chat failed: ${response.status}`)
            }
        } catch (error) {
            console.error('💥 Error in Taylor chat:', error)

            const errorMsg: ChatMessage = {
                id: 'error-' + Date.now(),
                sender: 'taylor',
                message: "I'm having trouble responding right now. Please try again in a moment!",
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    // EXISTING: Cover generation handler
    async function handleCoverRequest(userMessage: string) {
        // Don't add user message again if it came from handleSendMessage
        const isFromConversation = userMessage === 'generate covers based on our discussion'

        if (!isFromConversation) {
            const userMsg: ChatMessage = {
                id: 'temp-' + Date.now(),
                sender: 'user',
                message: userMessage,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, userMsg])
            setInputMessage('')
        }

        setIsLoading(true)

        try {
            const supabase = createClient()

            // Save user message if not from conversation
            if (!isFromConversation) {
                await supabase.from('editor_chat_history').insert({
                    manuscript_id: manuscriptId,
                    phase_number: 4,
                    sender: 'user',
                    message: userMessage
                })
            }

            // Get manuscript data
            const { data: manuscript } = await supabase
                .from('manuscripts')
                .select('title, genre, current_word_count')
                .eq('id', manuscriptId)
                .single()

            console.log('🎨 Calling cover intent detection workflow...')

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            try {
                const response = await fetch(
                    'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-detect-cover-intent',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            manuscriptId,
                            userMessage,
                            manuscriptData: {
                                title: manuscript?.title,
                                genre: manuscript?.genre,
                                wordCount: manuscript?.current_word_count
                            }
                        }),
                        signal: controller.signal
                    }
                )

                clearTimeout(timeoutId)
                console.log('✅ Response received:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('📦 Response data:', data)

                    const taylorMsg: ChatMessage = {
                        id: 'taylor-' + Date.now(),
                        sender: 'taylor',
                        message: data.response || "🎨 I'm generating your cover designs now! This will take 2-3 minutes. I'll let you know when they're ready!",
                        created_at: new Date().toISOString()
                    }

                    setMessages(prev => [...prev, taylorMsg])

                    await supabase.from('editor_chat_history').insert({
                        manuscript_id: manuscriptId,
                        phase_number: 4,
                        sender: 'Taylor',
                        message: taylorMsg.message
                    })
                } else {
                    throw new Error(`Workflow returned ${response.status}`)
                }
            } catch (fetchError) {
                clearTimeout(timeoutId)
                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    console.error('⏱️ Request timeout after 30 seconds')
                    throw new Error('Request timeout')
                }
                throw fetchError
            }
        } catch (error) {
            console.error('💥 Error handling cover request:', error)

            const errorMsg: ChatMessage = {
                id: 'error-' + Date.now(),
                sender: 'taylor',
                message: "I'm having trouble starting the cover generation right now. Please try again in a moment!",
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    // Handle close button - call parent onClose handler if provided
    function handleClose() {
        setIsOpen(false)
        onClose?.()
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center text-2xl"
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-blue-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                                📚
                            </div>
                            <div>
                                <h3 className="font-bold">Taylor</h3>
                                <p className="text-xs opacity-90">Publishing Specialist</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage(inputMessage)
                        }}
                        className="p-4 border-t-2 border-gray-200"
                    >
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask Taylor about publishing..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? '...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}