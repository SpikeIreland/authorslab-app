'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

// ============================================================================
// Types
// ============================================================================

interface BookMetadata {
  title: string
  subtitle: string
  description: string
  categories: string[]
  keywords: string[]
}

interface PublishingMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type SectionId = 'metadata' | 'isbn' | 'pricing' | 'platforms' | 'launch'

const SECTIONS: Array<{ id: SectionId; label: string; available: boolean }> = [
  { id: 'metadata', label: 'Book metadata', available: true },
  { id: 'isbn', label: 'ISBN', available: false },
  { id: 'pricing', label: 'Pricing', available: false },
  { id: 'platforms', label: 'Platforms', available: false },
  { id: 'launch', label: 'Launch', available: false },
]

const KEYWORDS_MAX = 7

const EMPTY_METADATA: BookMetadata = {
  title: '',
  subtitle: '',
  description: '',
  categories: [],
  keywords: [],
}

// ============================================================================
// Page
// ============================================================================

export default function PublishingTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [section, setSection] = useState<SectionId>('metadata')

  const [metadata, setMetadata] = useState<BookMetadata>(EMPTY_METADATA)
  const [metadataLoading, setMetadataLoading] = useState(true)
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Chat state
  const [messages, setMessages] = useState<PublishingMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load metadata + chat history on mount.
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [metaRes, msgRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/publishing/metadata`),
          fetch(`/api/projects/${projectId}/publishing/messages`),
        ])

        if (!cancelled && metaRes.ok) {
          const json = await metaRes.json() as { metadata: Partial<BookMetadata> }
          setMetadata({ ...EMPTY_METADATA, ...json.metadata })
        }
        if (!cancelled && msgRes.ok) {
          const json = await msgRes.json() as { messages: PublishingMessage[] }
          setMessages(json.messages)
        }
      } finally {
        if (!cancelled) {
          setMetadataLoading(false)
          setMessagesLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Persist a partial metadata update to the server.
  const saveMetadata = useCallback(async (patch: Partial<BookMetadata>) => {
    setSavingState('saving')
    try {
      const res = await fetch(`/api/projects/${projectId}/publishing/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
      setSavingState('saved')
      // Clear the "Saved" indicator after a moment so it doesn't linger.
      setTimeout(() => setSavingState(prev => (prev === 'saved' ? 'idle' : prev)), 1500)
    } catch {
      setSavingState('error')
    }
  }, [projectId])

  // Save text inputs on blur (only if changed from current state).
  const handleTextBlur = useCallback((field: 'title' | 'subtitle' | 'description', value: string) => {
    if (value === metadata[field]) return
    setMetadata(prev => ({ ...prev, [field]: value }))
    saveMetadata({ [field]: value })
  }, [metadata, saveMetadata])

  // Add / remove a chip from categories or keywords.
  const addChip = useCallback((field: 'categories' | 'keywords', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (metadata[field].includes(trimmed)) return
    if (field === 'keywords' && metadata.keywords.length >= KEYWORDS_MAX) return
    const next = [...metadata[field], trimmed]
    setMetadata(prev => ({ ...prev, [field]: next }))
    saveMetadata({ [field]: next })
  }, [metadata, saveMetadata])

  const removeChip = useCallback((field: 'categories' | 'keywords', value: string) => {
    const next = metadata[field].filter(v => v !== value)
    setMetadata(prev => ({ ...prev, [field]: next }))
    saveMetadata({ [field]: next })
  }, [metadata, saveMetadata])

  // Send a message to Morgan.
  const sendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    const tempUser: PublishingMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])
    setInput('')

    try {
      const res = await fetch(`/api/projects/${projectId}/publishing/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errBody.error || `request failed (${res.status})`)
      }
      const json = await res.json() as { reply: string }
      setMessages(prev => [...prev, {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: json.reply,
        created_at: new Date().toISOString(),
      }])
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

  const handleChatKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // Ask Morgan to refine the description (sends a contextual prompt to chat).
  const refineDescription = useCallback(() => {
    const desc = metadata.description.trim()
    if (!desc) {
      setInput("I haven't written a description yet — help me draft one.")
    } else {
      setInput(`Can you refine my book description? Here's what I have:\n\n"${desc}"`)
    }
    inputRef.current?.focus()
  }, [metadata.description])

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
                {!s.available && (
                  <span className="text-[10px] text-slate-400 italic">soon</span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Center panel */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {section === 'metadata' && (
          <MetadataForm
            loading={metadataLoading}
            metadata={metadata}
            savingState={savingState}
            onTextBlur={handleTextBlur}
            onAddChip={addChip}
            onRemoveChip={removeChip}
            onRefineDescription={refineDescription}
          />
        )}
        {section !== 'metadata' && <SectionPlaceholder sectionId={section} />}
      </main>

      {/* Morgan chat */}
      <aside className="w-72 border-l border-slate-200 flex flex-col bg-white">
        <header className="px-3 py-3 border-b border-slate-200 flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ background: '#BA7517' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 leading-tight">Morgan</p>
            <p className="text-[11px] text-slate-500">Publishing</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messagesLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Tell Morgan what you&rsquo;re working on. Ask about categories that fit your book, keywords that get found, KDP Select trade-offs, or pricing for your genre.
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
              onKeyDown={handleChatKeyDown}
              placeholder="Reply to Morgan…"
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

// ============================================================================
// Metadata form
// ============================================================================

function MetadataForm({
  loading,
  metadata,
  savingState,
  onTextBlur,
  onAddChip,
  onRemoveChip,
  onRefineDescription,
}: {
  loading: boolean
  metadata: BookMetadata
  savingState: 'idle' | 'saving' | 'saved' | 'error'
  onTextBlur: (field: 'title' | 'subtitle' | 'description', value: string) => void
  onAddChip: (field: 'categories' | 'keywords', value: string) => void
  onRemoveChip: (field: 'categories' | 'keywords', value: string) => void
  onRefineDescription: () => void
}) {
  const filledCount = useMemo(() => {
    let count = 0
    if (metadata.title.trim()) count++
    if (metadata.subtitle.trim()) count++
    if (metadata.description.trim()) count++
    if (metadata.categories.length > 0) count++
    if (metadata.keywords.length > 0) count++
    return count
  }, [metadata])

  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading…</p>
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-base font-medium text-slate-900">Book metadata</h2>
        <SaveIndicator state={savingState} filledCount={filledCount} />
      </div>
      <p className="text-xs text-slate-500 mb-6">
        These fields populate your book&rsquo;s listing on Amazon, Apple Books, and other platforms. Changes save automatically.
      </p>

      <div className="space-y-5">
        <TextField
          label="Title"
          value={metadata.title}
          placeholder="The published title of your book"
          onBlur={value => onTextBlur('title', value)}
        />

        <TextField
          label="Subtitle"
          value={metadata.subtitle}
          placeholder="Optional — typically a short clarifying line"
          onBlur={value => onTextBlur('subtitle', value)}
        />

        <DescriptionField
          value={metadata.description}
          onBlur={value => onTextBlur('description', value)}
          onRefine={onRefineDescription}
        />

        <ChipsField
          label="Categories"
          values={metadata.categories}
          placeholder="Add a category (e.g. Self-Help)"
          onAdd={value => onAddChip('categories', value)}
          onRemove={value => onRemoveChip('categories', value)}
        />

        <ChipsField
          label="Keywords"
          values={metadata.keywords}
          placeholder={metadata.keywords.length >= KEYWORDS_MAX ? 'Maximum 7 keywords' : 'Add a keyword (e.g. mindfulness)'}
          maxItems={KEYWORDS_MAX}
          onAdd={value => onAddChip('keywords', value)}
          onRemove={value => onRemoveChip('keywords', value)}
        />
      </div>
    </div>
  )
}

function SaveIndicator({ state, filledCount }: { state: 'idle' | 'saving' | 'saved' | 'error'; filledCount: number }) {
  let text: string
  let color: string
  if (state === 'saving') { text = 'Saving…'; color = 'text-slate-500' }
  else if (state === 'saved') { text = 'Saved'; color = 'text-emerald-700' }
  else if (state === 'error') { text = 'Save failed'; color = 'text-rose-700' }
  else { text = `${filledCount} of 5 filled`; color = 'text-slate-500' }
  return <span className={`text-xs ${color}`}>{text}</span>
}

// ============================================================================
// Field components
// ============================================================================

function TextField({
  label,
  value,
  placeholder,
  onBlur,
}: {
  label: string
  value: string
  placeholder?: string
  onBlur: (value: string) => void
}) {
  const [local, setLocal] = useState(value)
  // Keep local in sync if parent value changes (e.g. after a save round-trip).
  useEffect(() => { setLocal(value) }, [value])

  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">{label}</span>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onBlur(local)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-slate-500"
      />
    </label>
  )
}

function DescriptionField({
  value,
  onBlur,
  onRefine,
}: {
  value: string
  onBlur: (value: string) => void
  onRefine: () => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])

  const wordCount = local.trim() ? local.trim().split(/\s+/).length : 0

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600">Description</span>
        <span className="text-[11px] text-slate-400">{wordCount} words</span>
      </div>
      <textarea
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onBlur(local)}
        placeholder="The pitch the reader sees on Amazon. Aim for 150–250 words for non-fiction, can be shorter for fiction."
        rows={6}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-y focus:outline-none focus:border-slate-500"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onRefine}
          className="text-xs px-3 py-1 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
        >
          Refine with Morgan →
        </button>
      </div>
    </div>
  )
}

function ChipsField({
  label,
  values,
  placeholder,
  maxItems,
  onAdd,
  onRemove,
}: {
  label: string
  values: string[]
  placeholder?: string
  maxItems?: number
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}) {
  const [draft, setDraft] = useState('')
  const atMax = maxItems !== undefined && values.length >= maxItems

  const submit = () => {
    if (!draft.trim() || atMax) return
    onAdd(draft)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {maxItems !== undefined && (
          <span className="text-[11px] text-slate-400">{values.length} of {maxItems}</span>
        )}
      </div>
      <div className="border border-slate-300 rounded-md px-2 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:border-slate-500">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs">
            {v}
            <button
              type="button"
              onClick={() => onRemove(v)}
              className="text-slate-400 hover:text-slate-700"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={submit}
          placeholder={values.length === 0 ? placeholder : ''}
          disabled={atMax}
          className="flex-1 min-w-[140px] px-1 py-0.5 text-sm focus:outline-none disabled:bg-transparent disabled:text-slate-400"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Section placeholder
// ============================================================================

function SectionPlaceholder({ sectionId }: { sectionId: SectionId }) {
  const titles: Record<SectionId, string> = {
    metadata: 'Book metadata',
    isbn: 'ISBN',
    pricing: 'Pricing',
    platforms: 'Platforms',
    launch: 'Launch',
  }
  const blurbs: Record<SectionId, string> = {
    metadata: '',
    isbn: 'Bring your own ISBN, buy one through KDP ($95, yours forever), or use a free KDP-only ISBN. Three-way choice with real trade-offs.',
    pricing: 'Per-platform pricing matrix. Morgan will help you set prices that are competitive in your genre.',
    platforms: 'Connect KDP, IngramSpark, Apple Books, and others. Each has its own forms and decisions — Morgan walks you through them.',
    launch: 'Pre-order setup, release date, and the trigger that takes the project live across all your platforms at once.',
  }

  return (
    <div className="p-12 text-center">
      <p className="text-[11px] uppercase tracking-wider font-medium text-slate-400 mb-3">
        Coming soon
      </p>
      <h2 className="text-xl font-medium text-slate-900 mb-2">{titles[sectionId]}</h2>
      <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{blurbs[sectionId]}</p>
    </div>
  )
}
