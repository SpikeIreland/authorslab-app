'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

// ============================================================================
// Types
// ============================================================================

interface DesignMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type SectionId = 'cover' | 'front-matter' | 'back-matter' | 'interior-format'

interface ConceptDefinition {
  id: string
  label: string
  bg: string
  text: string
  meta: string
}

// Four mock cover concepts. When real cover generation is wired in via
// Taylor's n8n workflow, these get replaced with actual generated images and
// the bg/text fields go away in favour of <img> tags.
const COVER_CONCEPTS: ConceptDefinition[] = [
  { id: 'concept-1', label: 'Concept 1', bg: '#FDF6EE', text: '#5C7A6B', meta: 'cream + sage' },
  { id: 'concept-2', label: 'Concept 2', bg: '#5C7A6B', text: '#FDF6EE', meta: 'sage + cream' },
  { id: 'concept-3', label: 'Concept 3', bg: '#D4956A', text: '#4A1B0C', meta: 'amber + cocoa' },
  { id: 'concept-4', label: 'Concept 4', bg: '#2C2C2A', text: '#FAF8F4', meta: 'charcoal + ivory' },
]

const SECTIONS: Array<{ id: SectionId; label: string; comingSoon?: boolean }> = [
  { id: 'cover', label: 'Cover' },
  { id: 'front-matter', label: 'Front matter', comingSoon: true },
  { id: 'back-matter', label: 'Back matter', comingSoon: true },
  { id: 'interior-format', label: 'Interior format', comingSoon: true },
]

// ============================================================================
// Page
// ============================================================================

export default function DesignTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [section, setSection] = useState<SectionId>('cover')
  const [selectedCover, setSelectedCover] = useState<string | null>(null)
  const [coverLoading, setCoverLoading] = useState(true)
  const [savingCover, setSavingCover] = useState(false)

  const [messages, setMessages] = useState<DesignMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load the currently-selected cover and the chat history on mount.
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [coverRes, msgRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/design/cover`),
          fetch(`/api/projects/${projectId}/design/messages`),
        ])

        if (!cancelled && coverRes.ok) {
          const json = await coverRes.json() as { selected: string | null }
          setSelectedCover(json.selected)
        }
        if (!cancelled && msgRes.ok) {
          const json = await msgRes.json() as { messages: DesignMessage[] }
          setMessages(json.messages)
        }
      } finally {
        if (!cancelled) {
          setCoverLoading(false)
          setMessagesLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  // Autoscroll on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const selectedConcept = useMemo(
    () => COVER_CONCEPTS.find(c => c.id === selectedCover) ?? null,
    [selectedCover]
  )

  // Persist a cover selection.
  const chooseCover = useCallback(async (conceptId: string) => {
    if (savingCover) return
    setSavingCover(true)
    const previous = selectedCover
    setSelectedCover(conceptId)   // optimistic

    try {
      const res = await fetch(`/api/projects/${projectId}/design/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: conceptId }),
      })
      if (!res.ok) throw new Error(`save failed (${res.status})`)
    } catch {
      setSelectedCover(previous)   // roll back on failure
    } finally {
      setSavingCover(false)
    }
  }, [projectId, savingCover, selectedCover])

  // Send a message to Taylor.
  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    const tempUser: DesignMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])
    setInput('')

    try {
      const res = await fetch(`/api/projects/${projectId}/design/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `request failed (${res.status})`)
      }

      const json = await res.json() as { reply: string }
      const assistant: DesignMessage = {
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
    <div className="h-full flex min-h-[480px]">

      {/* Sections panel */}
      <aside className="w-44 border-r border-slate-200 bg-slate-50 flex flex-col">
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-wider font-medium text-slate-400">
          Sections
        </p>
        <nav className="flex flex-col gap-0.5 px-1.5">
          {SECTIONS.map(s => {
            const isActive = section === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`text-left text-sm px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-white border border-slate-200 text-slate-900 font-medium'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                <span>{s.label}</span>
                {s.comingSoon && (
                  <span className="text-[10px] text-slate-400 italic">soon</span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Center panel */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {section === 'cover' && (
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-base font-medium text-slate-900">Cover concepts</h2>
              <p className="text-xs text-slate-500">
                {coverLoading ? 'Loading…' : selectedConcept ? `${selectedConcept.label} selected` : '4 concepts · none selected'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {COVER_CONCEPTS.map(c => {
                const isSelected = selectedCover === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => chooseCover(c.id)}
                    disabled={savingCover}
                    className={`text-left flex flex-col gap-1.5 group disabled:opacity-50 disabled:cursor-wait`}
                  >
                    <div
                      className={`aspect-[2/3] rounded-md p-3 flex flex-col justify-between transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-blue-600 ring-offset-1'
                          : 'border border-slate-200 group-hover:border-slate-400'
                      }`}
                      style={{ background: c.bg, color: c.text }}
                    >
                      <p className="text-[10px] font-medium leading-tight">
                        Your book title
                      </p>
                      <p className="text-[8px] opacity-85">Author Name</p>
                    </div>
                    <div className="text-xs">
                      <span className={isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}>
                        {c.label}
                      </span>
                      <span className="text-slate-400 ml-1">· {c.meta}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-400 cursor-not-allowed"
                title="Coming soon — Taylor will generate fresh concepts based on your book"
              >
                Generate more concepts
              </button>
              {selectedCover && (
                <button
                  type="button"
                  onClick={() => chooseCover('')}
                  disabled={savingCover}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="mt-8 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md">
              <p className="text-xs text-slate-600 leading-relaxed">
                These four concepts are mock placeholders for now — Taylor&rsquo;s cover-generation workflow will replace them with concepts based on your book&rsquo;s genre, tone, and audience. Selection persists either way.
              </p>
            </div>
          </div>
        )}

        {section !== 'cover' && (
          <div className="p-12 text-center">
            <p className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-3">
              Coming soon
            </p>
            <h2 className="text-xl font-medium text-slate-900 mb-2">
              {SECTIONS.find(s => s.id === section)?.label}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {section === 'front-matter' && 'Title page, copyright, dedication, table of contents — the pages that open your book. Taylor will help you set them up.'}
              {section === 'back-matter' && 'Author bio, acknowledgments, also-by, about-the-publisher — the pages that close your book.'}
              {section === 'interior-format' && 'Typography, chapter headers, trim size, spacing. Taylor will generate the formatted files for each platform.'}
            </p>
          </div>
        )}
      </main>

      {/* Taylor chat panel */}
      <aside className="w-72 border-l border-slate-200 flex flex-col bg-white">
        <header className="px-3 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: '#1D9E75' }}>
            T
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 leading-tight">Taylor</p>
            <p className="text-[11px] text-slate-500">Design</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messagesLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell Taylor what you&rsquo;re thinking — about a concept above, your audience, or anything design-related. She&rsquo;s here to help you choose well.
            </p>
          ) : (
            messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 inline-flex gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {sendError && (
          <div className="px-3 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-800">
            {sendError}
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-slate-200 p-2.5">
          <div className="flex items-end gap-1.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to Taylor…"
              rows={2}
              disabled={sending}
              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs resize-none focus:outline-none focus:border-slate-500 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-md"
            >
              Send
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
