'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

interface ResearchMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

const STARTERS = [
  'Help me think through a tricky scene I\'ve been stuck on.',
  'I need background on a setting I\'m writing about — can we research it together?',
  'What questions should I be asking about my main character?',
]

export default function ResearchTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [messages, setMessages] = useState<ResearchMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load the project's existing Research conversation on mount.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/projects/${projectId}/research/messages`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then((json: { messages: ResearchMessage[] }) => {
        if (!cancelled) setMessages(json.messages)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [projectId])

  // Autoscroll on new content.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    const tempUser: ResearchMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])
    setInput('')

    try {
      const res = await fetch(`/api/projects/${projectId}/research/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `request failed (${res.status})`)
      }

      const json = await res.json() as { reply: string }
      const assistant: ResearchMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: json.reply,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistant])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setSendError(message)
      setMessages(prev => prev.filter(m => m.id !== tempUser.id))
      setInput(text)
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [projectId, input, sending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  return (
    <div className="h-full flex flex-col min-h-[480px]">

      {/* Tab header — sets context for what the agent knows */}
      <header className="px-6 py-4 border-b border-line flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ background: '#2C2C2A' }}
        >
          C
        </div>
        <div>
          <p className="text-sm font-medium text-ink leading-tight">Companion</p>
          <p className="text-[11px] text-muted">Research · I have your project loaded</p>
        </div>
      </header>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <p className="text-sm text-muted max-w-2xl mx-auto">Loading…</p>
        ) : messages.length === 0 ? (
          <EmptyState onSeed={(prompt) => setInput(prompt)} />
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

      {sendError && (
        <div className="px-6 py-2 bg-status-high/10 border-t border-status-high/40 text-sm text-status-high">
          {sendError}
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-line p-4">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — about your book, a setting, a character, a craft question…"
            rows={2}
            disabled={sending}
            className="flex-1 px-3 py-2 border border-line rounded-md text-sm resize-none focus:outline-none focus:border-sage-deep disabled:bg-paper-warm disabled:text-muted"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2 bg-charcoal hover:bg-charcoal/90 disabled:bg-line text-white text-sm font-medium rounded-md transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: ResearchMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-charcoal text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] bg-paper-warm text-ink rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-paper-warm rounded-2xl rounded-tl-sm px-4 py-3 inline-flex gap-1">
        <span className="w-1.5 h-1.5 bg-faint rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-faint rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-faint rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function EmptyState({ onSeed }: { onSeed: (prompt: string) => void }) {
  return (
    <div className="max-w-xl mx-auto text-center py-8">
      <p className="text-sm text-muted leading-relaxed mb-6">
        I&rsquo;ve got your project loaded — title, genre, summary, and any analysis we&rsquo;ve done together. Ask me anything that helps you move the work forward.
      </p>
      <div className="space-y-2 text-left">
        {STARTERS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSeed(s)}
            className="w-full px-4 py-3 border border-line rounded-md text-sm text-ink hover:bg-paper-warm transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
