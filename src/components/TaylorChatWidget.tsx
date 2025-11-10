'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
    id: string
    sender: 'user' | 'taylor'
    message: string
    created_at: string
}

interface TaylorChatWidgetProps {
    manuscriptId: string
}

export default function TaylorChatWidget({ manuscriptId }: TaylorChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load chat history
    useEffect(() => {
        if (!isOpen || !manuscriptId) return

        loadChatHistory()
    }, [isOpen, manuscriptId])

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
                sender: msg.sender as 'user' | 'taylor',
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
        // Fetch manuscript details for personalized greeting
        const supabase = createClient()
        const { data: manuscript } = await supabase
            .from('manuscripts')
            .select('title, genre, current_word_count, author_profiles!inner(first_name)')
            .eq('id', manuscriptId)
            .single()

        const authorProfile = Array.isArray(manuscript?.author_profiles)
            ? manuscript.author_profiles[0]
            : manuscript?.author_profiles

        const authorName = authorProfile?.first_name || 'there'
        const title = manuscript?.title || 'your manuscript'
        const genre = manuscript?.genre || 'your genre'
        const wordCount = manuscript?.current_word_count?.toLocaleString() || 'your word count'

        const greetingMessage = {
            id: 'greeting-' + Date.now(),
            sender: 'taylor' as const,
            message: `👋 Welcome to your Publishing Hub, ${authorName}!

I'm Taylor, your publishing specialist. Congratulations on completing the editing for "${title}"! That's a huge accomplishment.

📚 **Your Manuscript:**
• Genre: ${genre}
• Length: ${wordCount} words
• Status: Edited and ready for publishing

**What I'll Help You With:**

🎯 **Strategy & Planning**
• Choosing the right publishing platforms for your goals
• Understanding the publishing timeline
• Setting realistic expectations

🎨 **Professional Presentation**
• AI-generated cover design concepts
• Optimized book descriptions and metadata
• All the file formats you'll need (EPUB, Kindle, Print PDF)

📖 **Platform Setup**
• Step-by-step guides for Amazon KDP, Draft2Digital, and more
• Account setup assistance
• Upload walkthroughs with screenshots

**Let's Get Started!**

I'll begin with a quick assessment (3-5 minutes) to create your personalized publishing plan. Or if you have specific questions, just ask away!

Type "let's start" to begin the assessment, or ask me anything about publishing your book.`,
            created_at: new Date().toISOString()
        }

        setMessages([greetingMessage])

        // Save greeting to database
        await supabase.from('editor_chat_history').insert({
            manuscript_id: manuscriptId,
            phase_number: 4,
            sender: 'taylor',
            message: greetingMessage.message
        })
    }

    async function sendMessage() {
        if (!inputMessage.trim() || isLoading) return

        const userMessage: ChatMessage = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            message: inputMessage,
            created_at: new Date().toISOString()
        }

        // Add user message to UI
        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

        try {
            // Save user message to database
            const supabase = createClient()
            await supabase.from('editor_chat_history').insert({
                manuscript_id: manuscriptId,
                phase_number: 4,
                sender: 'user',
                message: userMessage.message
            })

            // Call Taylor chat workflow
            const response = await fetch(
                'https://spikeislandstudios.app.n8n.cloud/webhook/taylor-chat',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        manuscriptId: manuscriptId,
                        userMessage: userMessage.message,
                        conversationHistory: messages.slice(-10) // Last 10 messages for context
                    })
                }
            )

            if (response.ok) {
                const data = await response.json()

                const taylorMessage: ChatMessage = {
                    id: 'taylor-' + Date.now(),
                    sender: 'taylor',
                    message: data.response || "I'm here to help with your publishing questions!",
                    created_at: new Date().toISOString()
                }

                setMessages(prev => [...prev, taylorMessage])

                // Save Taylor's response to database
                await supabase.from('editor_chat_history').insert({
                    manuscript_id: manuscriptId,
                    phase_number: 4,
                    sender: 'taylor',
                    message: taylorMessage.message
                })
            }
        } catch (error) {
            console.error('Error sending message:', error)

            // Add error message
            const errorMessage: ChatMessage = {
                id: 'error-' + Date.now(),
                sender: 'taylor',
                message: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <>
            {/* Chat Bubble - Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center text-3xl z-50 animate-bounce"
                >
                    📚
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-teal-500">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                                📚
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Taylor</h3>
                                <p className="text-xs opacity-90">Publishing Specialist</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-teal-700 rounded-lg p-2 transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user'
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-white border-2 border-teal-200 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-teal-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border-2 border-teal-200 rounded-2xl px-4 py-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Ask Taylor about publishing..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-teal-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-teal-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Taylor can help with publishing questions and guidance
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}