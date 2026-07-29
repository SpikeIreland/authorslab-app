'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/chrome/AppShell'

// ============================================================================
// Types
// ============================================================================

interface Conversation {
  id: string
  title: string
  created_at: string
  last_message_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ============================================================================
// Helpers
// ============================================================================

type DateBucket = 'today' | 'yesterday' | 'lastWeek' | 'older'

function bucketFor(iso: string): DateBucket {
  const then = new Date(iso).getTime()
  const nowDay = new Date()
  nowDay.setHours(0, 0, 0, 0)
  const yestDay = new Date(nowDay)
  yestDay.setDate(nowDay.getDate() - 1)
  const sevenDay = new Date(nowDay)
  sevenDay.setDate(nowDay.getDate() - 7)

  if (then >= nowDay.getTime()) return 'today'
  if (then >= yestDay.getTime()) return 'yesterday'
  if (then >= sevenDay.getTime()) return 'lastWeek'
  return 'older'
}

// ============================================================================
// Page
// ============================================================================

export default function HomePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [authChecked, setAuthChecked] = useState(false)
  const [authorFirstName, setAuthorFirstName] = useState<string>('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auth + load conversations on mount.
  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('author_profiles')
        .select('first_name')
        .eq('auth_user_id', user.id)
        .single()

      if (cancelled) return
      setAuthorFirstName(profile?.first_name ?? '')
      setAuthChecked(true)

      const res = await fetch('/api/home/conversations')
      if (!cancelled && res.ok) {
        const json = await res.json() as { conversations: Conversation[] }
        setConversations(json.conversations)
        if (json.conversations.length > 0) {
          setActiveId(json.conversations[0].id)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [router, supabase])

  // Load messages whenever the active conversation changes.
  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    let cancelled = false
    setLoadingMessages(true)

    fetch(`/api/home/conversations/${activeId}/messages`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then((json: { messages: Message[] }) => {
        if (cancelled) return
        setMessages(json.messages)
        setLoadingMessages(false)
      })
      .catch(() => {
        if (cancelled) return
        setMessages([])
        setLoadingMessages(false)
      })

    return () => { cancelled = true }
  }, [activeId])

  // Autoscroll the message thread on new content.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Group conversations into date buckets, preserving order within each.
  const groupedConversations = useMemo(() => {
    const groups: Record<DateBucket, Conversation[]> = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    }
    for (const c of conversations) {
      groups[bucketFor(c.last_message_at)].push(c)
    }
    return groups
  }, [conversations])

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) ?? null,
    [conversations, activeId]
  )

  // Create a new conversation.
  const newConversation = useCallback(async () => {
    const res = await fetch('/api/home/conversations', { method: 'POST' })
    if (!res.ok) return
    const json = await res.json() as { conversation: Conversation }
    setConversations(prev => [json.conversation, ...prev])
    setActiveId(json.conversation.id)
    setMessages([])
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Send a message.
  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    // If no active conversation, create one first.
    let conversationId = activeId
    let isNewConversation = false
    if (!conversationId) {
      const res = await fetch('/api/home/conversations', { method: 'POST' })
      if (!res.ok) {
        setSendError("Couldn't start a new conversation. Try again?")
        setSending(false)
        return
      }
      const json = await res.json() as { conversation: Conversation }
      conversationId = json.conversation.id
      isNewConversation = true
      setConversations(prev => [json.conversation, ...prev])
      setActiveId(conversationId)
    }

    // Optimistically render the user message.
    const tempUserMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])
    setInput('')

    try {
      const res = await fetch('/api/home/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `request failed (${res.status})`)
      }

      const json = await res.json() as { reply: string; title?: string }

      // Append assistant reply.
      const assistantMsg: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: json.reply,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      // If the title was derived (first user message), refresh the conversation
      // entry in the sidebar so it picks up the new title.
      if (json.title || isNewConversation) {
        const listRes = await fetch('/api/home/conversations')
        if (listRes.ok) {
          const listJson = await listRes.json() as { conversations: Conversation[] }
          setConversations(listJson.conversations)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setSendError(message)
      // Remove the optimistic user message so the writer can retry.
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      setInput(text)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [activeId, input, sending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    )
  }

  return (
    <AppShell firstName={authorFirstName || undefined}>
      {/* Two-pane chat */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-56px)]">
        {/* Left: conversation history */}
        <aside className="w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-200">
            <button
              onClick={newConversation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors"
            >
              <span aria-hidden>+</span>
              New conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {conversations.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">
                No conversations yet. Start one on the right.
              </p>
            ) : (
              <>
                <HistoryGroup
                  label="Today"
                  items={groupedConversations.today}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
                <HistoryGroup
                  label="Yesterday"
                  items={groupedConversations.yesterday}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
                <HistoryGroup
                  label="Last 7 days"
                  items={groupedConversations.lastWeek}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
                <HistoryGroup
                  label="Older"
                  items={groupedConversations.older}
                  activeId={activeId}
                  onSelect={setActiveId}
                />
              </>
            )}
          </div>
        </aside>

        {/* Right: chat thread */}
        <section className="flex-1 flex flex-col bg-white min-w-0">
          {/* Thread header */}
          <header className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-medium text-slate-900 truncate">
              {activeConversation?.title ?? 'Companion'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeConversation
                ? 'Conversation stored in your history.'
                : "Your creative companion. Tell me what you're thinking about."}
            </p>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {!activeId && messages.length === 0 ? (
              <EmptyState
                authorFirstName={authorFirstName}
                onSeed={(prompt) => setInput(prompt)}
              />
            ) : loadingMessages ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {messages.map(m => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {sending && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Send error */}
          {sendError && (
            <div className="px-5 py-2 bg-rose-50 border-t border-rose-200 text-sm text-rose-800">
              {sendError}
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4">
            <div className="max-w-2xl mx-auto flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Reply to your companion…"
                rows={2}
                disabled={sending}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-md transition-colors"
              >
                Send
              </button>
            </div>

            {/* Make-this-a-project CTA — placeholder until Lobby is built */}
            {messages.length >= 4 && (
              <div className="max-w-2xl mx-auto mt-3 pt-3 border-t border-dashed border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-500">Ready to develop this further?</span>
                <button
                  type="button"
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => router.push('/lobby')}
                >
                  Make this a project →
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </AppShell>
  )
}

// ============================================================================
// History group + row
// ============================================================================

function HistoryGroup({
  label,
  items,
  activeId,
  onSelect,
}: {
  label: string
  items: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="mb-3">
      <p className="px-4 pb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <ul className="space-y-0.5 px-2">
        {items.map(c => (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors ${
                activeId === c.id
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// Message bubble + typing + empty state
// ============================================================================

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-slate-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 inline-flex gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function EmptyState({
  authorFirstName,
  onSeed,
}: {
  authorFirstName: string
  onSeed: (prompt: string) => void
}) {
  const greeting = authorFirstName ? `Hi ${authorFirstName}.` : 'Hi.'
  const starters = [
    'I have an idea for a memoir but I\'m not sure where to start.',
    'Help me think through a story I\'ve been carrying for years.',
    'I want to write a book about something I know well — what should I consider?',
  ]

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <p className="text-lg text-slate-900 font-medium mb-2">{greeting}</p>
      <p className="text-sm text-slate-600 mb-8 leading-relaxed">
        I&rsquo;m your creative companion. Tell me what you&rsquo;re thinking about — an idea, a question, something you&rsquo;ve been turning over. There are no wrong starting points.
      </p>
      <div className="space-y-2 text-left">
        {starters.map((s, i) => (
          <button
            key={i}
            onClick={() => onSeed(s)}
            className="w-full px-4 py-3 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
