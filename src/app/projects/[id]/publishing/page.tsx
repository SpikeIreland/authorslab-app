'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

// ============================================================================
// Types — mirror the API's shape (src/app/api/projects/[id]/publishing/metadata)
// ============================================================================

interface IsbnBlock {
  route?: 'own' | 'kdp_paid' | 'kdp_free' | null
  number?: string
  imprint?: string
}

interface PricingBlock {
  currency?: string
  ebook?: string
  paperback?: string
  hardcover?: string
  kdp_select?: boolean
}

interface LaunchBlock {
  date?: string | null
  preorder?: boolean
  notes?: string
}

interface BookMetadata {
  title: string
  subtitle: string
  description: string
  categories: string[]
  keywords: string[]
  isbn: IsbnBlock
  pricing: PricingBlock
  launch: LaunchBlock
}

interface PublishingMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

type SectionId = 'metadata' | 'isbn' | 'pricing' | 'platforms' | 'launch'

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'metadata', label: 'Book metadata' },
  { id: 'isbn', label: 'ISBN' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'launch', label: 'Launch' },
]

const KEYWORDS_MAX = 7

const EMPTY_METADATA: BookMetadata = {
  title: '',
  subtitle: '',
  description: '',
  categories: [],
  keywords: [],
  isbn: {},
  pricing: {},
  launch: {},
}

// Platform catalogue. Costs and setup times carried over from the legacy
// publishing hub's PlatformsSection so the two surfaces tell one story.
const PLATFORMS: Array<{
  id: string
  name: string
  initials: string
  tint: string
  blurb: string
  reach: string
  cost: string
  setup: string
}> = [
  { id: 'amazon-kdp', name: 'Amazon KDP', initials: 'A', tint: '#E08A1E', blurb: 'The largest bookstore in the world, and where most self-published books earn most of their money.', reach: 'Kindle · Print-on-demand · Kindle Unlimited', cost: 'Free', setup: '~30 min' },
  { id: 'ingramspark', name: 'IngramSpark', initials: 'IS', tint: '#2B5B9E', blurb: 'The route into physical bookshops and libraries. Slower, more exacting, and the only way onto a shelf.', reach: '40,000+ retailers · Libraries · Premium print', cost: '$49 setup', setup: '~45 min' },
  { id: 'draft2digital', name: 'Draft2Digital', initials: 'D2D', tint: '#3F8F5B', blurb: 'One upload, many retailers. The pragmatic way to be everywhere that is not Amazon.', reach: 'Apple Books · Kobo · Barnes & Noble · more', cost: 'Free', setup: '~25 min' },
  { id: 'apple-books', name: 'Apple Books', initials: 'AB', tint: '#4A4A48', blurb: 'Strong royalties and a clean reading experience. Worth going direct if Apple readers are your audience.', reach: 'iOS · macOS', cost: 'Free', setup: '~30 min' },
  { id: 'kobo', name: 'Kobo Writing Life', initials: 'K', tint: '#2F8C86', blurb: 'Significant outside the US — Canada, the Netherlands, France, Australia.', reach: 'International · Kobo Plus · Promotions', cost: 'Free', setup: '~25 min' },
  { id: 'barnes-noble', name: 'Barnes & Noble Press', initials: 'BN', tint: '#2F6B44', blurb: 'The largest US retail bookseller, with its own ebook platform.', reach: 'Nook · Print · In-store potential', cost: 'Free', setup: '~30 min' },
  { id: 'google-play', name: 'Google Play Books', initials: 'G', tint: '#B5503F', blurb: 'Discovery through search, and the default reader on most Android devices.', reach: 'Android · Search discovery · Web reader', cost: 'Free', setup: '~20 min' },
  { id: 'lulu', name: 'Lulu', initials: 'LU', tint: '#7A5AA8', blurb: 'Straightforward print with no upfront cost. Good for a small run you control.', reach: 'Print & ebooks · Global distribution', cost: 'Free', setup: '~20 min' },
]

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD'] as const
const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', AUD: 'A$', CAD: 'C$' }

// ============================================================================
// Page
// ============================================================================

export default function PublishingTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [section, setSection] = useState<SectionId>('metadata')

  const [metadata, setMetadata] = useState<BookMetadata>(EMPTY_METADATA)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [coverChosen, setCoverChosen] = useState(false)
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
          const json = await metaRes.json() as {
            metadata: Partial<BookMetadata>
            platforms?: string[]
            coverChosen?: boolean
          }
          setMetadata({ ...EMPTY_METADATA, ...json.metadata })
          setPlatforms(json.platforms ?? [])
          setCoverChosen(Boolean(json.coverChosen))
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

  // Persist a partial update to the server. Accepts metadata fields and the
  // hoisted `platforms` column in the same call.
  const save = useCallback(async (patch: Record<string, unknown>) => {
    setSavingState('saving')
    try {
      const res = await fetch(`/api/projects/${projectId}/publishing/metadata`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error()
      setSavingState('saved')
      setTimeout(() => setSavingState(prev => (prev === 'saved' ? 'idle' : prev)), 1500)
    } catch {
      setSavingState('error')
    }
  }, [projectId])

  // Save text inputs on blur (only if changed from current state).
  const handleTextBlur = useCallback((field: 'title' | 'subtitle' | 'description', value: string) => {
    if (value === metadata[field]) return
    setMetadata(prev => ({ ...prev, [field]: value }))
    save({ [field]: value })
  }, [metadata, save])

  // Add / remove a chip from categories or keywords.
  const addChip = useCallback((field: 'categories' | 'keywords', value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (metadata[field].includes(trimmed)) return
    if (field === 'keywords' && metadata.keywords.length >= KEYWORDS_MAX) return
    const next = [...metadata[field], trimmed]
    setMetadata(prev => ({ ...prev, [field]: next }))
    save({ [field]: next })
  }, [metadata, save])

  const removeChip = useCallback((field: 'categories' | 'keywords', value: string) => {
    const next = metadata[field].filter(v => v !== value)
    setMetadata(prev => ({ ...prev, [field]: next }))
    save({ [field]: next })
  }, [metadata, save])

  // Patch one of the namespaced blocks. The API merges blocks one level deep,
  // so sending a single key does not clear its siblings.
  const patchBlock = useCallback(<K extends 'isbn' | 'pricing' | 'launch'>(
    block: K,
    patch: BookMetadata[K],
  ) => {
    setMetadata(prev => ({ ...prev, [block]: { ...prev[block], ...patch } }))
    save({ [block]: patch })
  }, [save])

  const togglePlatform = useCallback((platformId: string) => {
    const next = platforms.includes(platformId)
      ? platforms.filter(p => p !== platformId)
      : [...platforms, platformId]
    setPlatforms(next)
    save({ platforms: next })
  }, [platforms, save])

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

  // Ask Morgan about the section in view, pre-filling a contextual prompt.
  const askMorgan = useCallback((prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }, [])

  // ── Launch readiness, derived from real state ─────────────────────────────
  // Every tick reads something that was actually saved. Nothing here is a
  // hardcoded checkmark; an author who has done nothing sees five empty rows.
  const checklist = useMemo(() => {
    const metadataComplete = Boolean(
      metadata.title.trim()
      && metadata.description.trim()
      && metadata.categories.length > 0
      && metadata.keywords.length > 0
    )
    const isbnDecided = Boolean(metadata.isbn.route)
    const pricingSet = Boolean(
      metadata.pricing.ebook || metadata.pricing.paperback || metadata.pricing.hardcover
    )
    return [
      { id: 'metadata' as SectionId, label: 'Book metadata complete', done: metadataComplete, hint: 'Title, description, categories and keywords' },
      { id: 'metadata' as SectionId, label: 'Cover chosen', done: coverChosen, hint: 'Selected on the Design tab', jumpsToDesign: true },
      { id: 'isbn' as SectionId, label: 'ISBN decided', done: isbnDecided, hint: 'Which route you are taking' },
      { id: 'pricing' as SectionId, label: 'Pricing set', done: pricingSet, hint: 'At least one format priced' },
      { id: 'platforms' as SectionId, label: 'Platforms chosen', done: platforms.length > 0, hint: 'Where the book will be sold' },
    ]
  }, [metadata, platforms, coverChosen])

  const readyCount = checklist.filter(c => c.done).length

  return (
    <div className="h-full flex min-h-[480px]" style={{ background: 'var(--color-paper)' }}>

      {/* Sections rail */}
      <aside
        className="w-44 flex flex-col"
        style={{ borderRight: '1px solid var(--color-line)', background: 'var(--color-paper-warm)' }}
      >
        <p className="px-3 pt-3 pb-2 text-[10px] uppercase tracking-wider font-medium text-faint">
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
                className="text-left text-sm px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 transition-colors"
                style={{
                  background: isActive ? 'var(--color-paper)' : 'transparent',
                  border: isActive ? '1px solid var(--color-line)' : '1px solid transparent',
                  color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span>{s.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Readiness meter — the rail's own summary of the derived checklist. */}
        <div className="mt-auto px-3 py-3" style={{ borderTop: '1px solid var(--color-line-soft)' }}>
          <p className="text-[10px] uppercase tracking-wider font-medium text-faint mb-1.5">
            Launch readiness
          </p>
          <div className="flex items-center gap-1" aria-hidden="true">
            {checklist.map((c, i) => (
              <span
                key={i}
                className="flex-1 rounded-full"
                style={{
                  height: 4,
                  background: c.done ? 'var(--color-sage)' : 'var(--color-line)',
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted mt-1.5">{readyCount} of {checklist.length} ready</p>
        </div>
      </aside>

      {/* Centre panel */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {metadataLoading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : (
          <>
            {section === 'metadata' && (
              <MetadataForm
                metadata={metadata}
                savingState={savingState}
                onTextBlur={handleTextBlur}
                onAddChip={addChip}
                onRemoveChip={removeChip}
                onAskMorgan={askMorgan}
              />
            )}
            {section === 'isbn' && (
              <IsbnSection
                isbn={metadata.isbn}
                savingState={savingState}
                onPatch={patch => patchBlock('isbn', patch)}
                onAskMorgan={askMorgan}
              />
            )}
            {section === 'pricing' && (
              <PricingSection
                pricing={metadata.pricing}
                savingState={savingState}
                onPatch={patch => patchBlock('pricing', patch)}
                onAskMorgan={askMorgan}
              />
            )}
            {section === 'platforms' && (
              <PlatformsPanel
                selected={platforms}
                savingState={savingState}
                onToggle={togglePlatform}
                onAskMorgan={askMorgan}
              />
            )}
            {section === 'launch' && (
              <LaunchSection
                launch={metadata.launch}
                checklist={checklist}
                readyCount={readyCount}
                savingState={savingState}
                onPatch={patch => patchBlock('launch', patch)}
                onGoToSection={setSection}
                onAskMorgan={askMorgan}
              />
            )}
          </>
        )}
      </main>

      {/* Morgan chat */}
      <aside
        className="w-72 flex flex-col"
        style={{ borderLeft: '1px solid var(--color-line)', background: 'var(--color-paper)' }}
      >
        <header className="px-3 py-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ background: 'var(--color-morgan)' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-medium text-ink leading-tight">Morgan</p>
            <p className="text-[11px] text-muted">Publishing</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {messagesLoading ? (
            <p className="text-xs text-muted">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-muted leading-relaxed">
              Tell Morgan what you&rsquo;re working on. Ask about categories that fit your book,
              keywords that get found, KDP Select trade-offs, or pricing for your genre.
            </p>
          ) : (
            messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className="max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === 'user'
                      ? { background: 'var(--color-charcoal)', color: '#fff', borderTopRightRadius: 4 }
                      : { background: 'var(--color-morgan-light)', color: 'var(--color-ink)', borderTopLeftRadius: 4 }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-3 py-2 inline-flex gap-1"
                style={{ background: 'var(--color-morgan-light)', borderTopLeftRadius: 4 }}
              >
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--color-morgan)', animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--color-morgan)', animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--color-morgan)', animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {sendError && (
          <div
            className="px-3 py-2 text-xs"
            style={{ background: '#FBEEEA', borderTop: '1px solid #EFD5CD', color: 'var(--color-status-high)' }}
          >
            {sendError}
          </div>
        )}

        <form onSubmit={sendMessage} className="p-2.5" style={{ borderTop: '1px solid var(--color-line)' }}>
          <div className="flex items-end gap-1.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Reply to Morgan…"
              rows={2}
              disabled={sending}
              className="flex-1 px-2.5 py-1.5 rounded-md text-xs resize-none focus:outline-none"
              style={{ border: '1px solid var(--color-line)', background: 'var(--color-paper)' }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-2.5 py-1.5 text-white text-xs font-medium rounded-md disabled:opacity-40"
              style={{ background: 'var(--color-charcoal)' }}
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
// Shared section furniture
// ============================================================================

function SectionShell({
  title,
  blurb,
  savingState,
  right,
  children,
}: {
  title: string
  blurb: string
  savingState: SaveState
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2 className="text-base font-medium text-ink">{title}</h2>
        {right ?? <SaveIndicator state={savingState} />}
      </div>
      <p className="text-xs text-muted mb-6 leading-relaxed">{blurb}</p>
      {children}
    </div>
  )
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function SaveIndicator({ state, idleText }: { state: SaveState; idleText?: string }) {
  let text: string
  let colour: string
  if (state === 'saving') { text = 'Saving…'; colour = 'var(--color-muted)' }
  else if (state === 'saved') { text = 'Saved'; colour = 'var(--color-sage-deep)' }
  else if (state === 'error') { text = 'Save failed'; colour = 'var(--color-status-high)' }
  else { text = idleText ?? 'Changes save automatically'; colour = 'var(--color-faint)' }
  return <span className="text-xs whitespace-nowrap" style={{ color: colour }}>{text}</span>
}

/** Hands a contextual question to Morgan rather than answering it in the UI. */
function AskMorgan({ label, prompt, onAskMorgan }: { label: string; prompt: string; onAskMorgan: (p: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onAskMorgan(prompt)}
      className="text-xs px-3 py-1 rounded-md transition-colors"
      style={{ border: '1px solid var(--color-line)', color: 'var(--color-morgan-text)', background: 'var(--color-morgan-light)' }}
    >
      {label} →
    </button>
  )
}

/** A selectable card used by the ISBN routes and the platform list. */
function ChoiceCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="w-full text-left rounded-lg p-4 transition-colors"
      style={{
        border: selected ? '1.5px solid var(--color-sage-deep)' : '1px solid var(--color-line)',
        background: selected ? 'var(--color-sage-bg)' : 'var(--color-paper)',
      }}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-medium text-muted mb-1.5">{children}</span>
}

const INPUT_STYLE: React.CSSProperties = {
  border: '1px solid var(--color-line)',
  background: 'var(--color-paper)',
  color: 'var(--color-ink)',
}

// ============================================================================
// Metadata
// ============================================================================

function MetadataForm({
  metadata,
  savingState,
  onTextBlur,
  onAddChip,
  onRemoveChip,
  onAskMorgan,
}: {
  metadata: BookMetadata
  savingState: SaveState
  onTextBlur: (field: 'title' | 'subtitle' | 'description', value: string) => void
  onAddChip: (field: 'categories' | 'keywords', value: string) => void
  onRemoveChip: (field: 'categories' | 'keywords', value: string) => void
  onAskMorgan: (prompt: string) => void
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

  return (
    <SectionShell
      title="Book metadata"
      blurb="This is your book's listing copy for Amazon, Apple Books and everywhere else you sell. You enter it on each platform yourself — this is where you get it right first, once, instead of improvising it eight times. It is also what readers search."
      savingState={savingState}
      right={<SaveIndicator state={savingState} idleText={`${filledCount} of 5 filled`} />}
    >
      <div className="space-y-5">
        <TextField label="Title" value={metadata.title} placeholder="The published title of your book" onBlur={v => onTextBlur('title', v)} />
        <TextField label="Subtitle" value={metadata.subtitle} placeholder="Optional — typically a short clarifying line" onBlur={v => onTextBlur('subtitle', v)} />

        <DescriptionField
          value={metadata.description}
          onBlur={v => onTextBlur('description', v)}
          onAskMorgan={onAskMorgan}
        />

        <ChipsField
          label="Categories"
          values={metadata.categories}
          placeholder="Add a category (e.g. Science Fiction)"
          onAdd={v => onAddChip('categories', v)}
          onRemove={v => onRemoveChip('categories', v)}
        />

        <ChipsField
          label="Keywords"
          values={metadata.keywords}
          placeholder={metadata.keywords.length >= KEYWORDS_MAX ? 'Maximum 7 keywords' : 'Add a keyword (e.g. first contact)'}
          maxItems={KEYWORDS_MAX}
          onAdd={v => onAddChip('keywords', v)}
          onRemove={v => onRemoveChip('keywords', v)}
        />

        <div className="flex justify-end pt-1">
          <AskMorgan
            label="Ask Morgan about categories"
            prompt="Which categories and keywords will actually get my book found? Here's what I have so far."
            onAskMorgan={onAskMorgan}
          />
        </div>
      </div>
    </SectionShell>
  )
}

function TextField({ label, value, placeholder, onBlur }: {
  label: string; value: string; placeholder?: string; onBlur: (value: string) => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onBlur(local)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
        style={INPUT_STYLE}
      />
    </label>
  )
}

function DescriptionField({ value, onBlur, onAskMorgan }: {
  value: string; onBlur: (value: string) => void; onAskMorgan: (p: string) => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])

  const wordCount = local.trim() ? local.trim().split(/\s+/).length : 0

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-muted">Description</span>
        <span className="text-[11px] text-faint">{wordCount} words</span>
      </div>
      <textarea
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => onBlur(local)}
        placeholder="The pitch the reader sees on Amazon. Aim for 150–250 words for non-fiction; fiction can be shorter."
        rows={6}
        className="w-full px-3 py-2 rounded-md text-sm resize-y focus:outline-none"
        style={INPUT_STYLE}
      />
      <div className="mt-2 flex justify-end">
        <AskMorgan
          label="Refine with Morgan"
          prompt={local.trim()
            ? `Can you refine my book description? Here's what I have:\n\n"${local.trim()}"`
            : "I haven't written a description yet — help me draft one."}
          onAskMorgan={onAskMorgan}
        />
      </div>
    </div>
  )
}

function ChipsField({ label, values, placeholder, maxItems, onAdd, onRemove }: {
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

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-muted">{label}</span>
        {maxItems !== undefined && (
          <span className="text-[11px] text-faint">{values.length} of {maxItems}</span>
        )}
      </div>
      <div
        className="rounded-md px-2 py-1.5 flex flex-wrap items-center gap-1.5"
        style={{ border: '1px solid var(--color-line)', background: 'var(--color-paper)' }}
      >
        {values.map(v => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
            style={{ background: 'var(--color-sage-bg)', color: 'var(--color-sage-deep)' }}
          >
            {v}
            <button type="button" onClick={() => onRemove(v)} aria-label={`Remove ${v}`} style={{ opacity: 0.65 }}>×</button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
          onBlur={submit}
          placeholder={values.length === 0 ? placeholder : ''}
          disabled={atMax}
          className="flex-1 min-w-[140px] px-1 py-0.5 text-sm focus:outline-none bg-transparent disabled:text-faint"
        />
      </div>
    </div>
  )
}

// ============================================================================
// ISBN
// ============================================================================

const ISBN_ROUTES: Array<{
  id: NonNullable<IsbnBlock['route']>
  title: string
  cost: string
  summary: string
  tradeoff: string
}> = [
  {
    id: 'own',
    title: 'I already have an ISBN',
    cost: '—',
    summary: 'You bought one previously, or your country issues them free (Canada, and a few others).',
    tradeoff: 'Nothing to decide. Enter the number and the imprint it is registered to.',
  },
  {
    id: 'kdp_paid',
    title: 'Buy my own ISBN',
    cost: '~$125 (US, single)',
    summary: 'Registered to you or your imprint, and yours permanently across every platform and edition.',
    tradeoff: 'Costs money up front. In return your imprint — not Amazon — is listed as the publisher, which matters to bookshops and to some reviewers.',
  },
  {
    id: 'kdp_free',
    title: 'Use a free KDP ISBN',
    cost: 'Free',
    summary: 'Amazon assigns one at no cost when you publish.',
    tradeoff: 'Free, and it only works on Amazon — you cannot carry it to IngramSpark or anywhere else, and Amazon is listed as the publisher. Fine if Amazon is your only channel.',
  },
]

function IsbnSection({ isbn, savingState, onPatch, onAskMorgan }: {
  isbn: IsbnBlock
  savingState: SaveState
  onPatch: (patch: IsbnBlock) => void
  onAskMorgan: (p: string) => void
}) {
  return (
    <SectionShell
      title="ISBN"
      blurb="The number that identifies your book to every retailer, library and distributor. Ebooks on Amazon do not strictly need one; print books do. Three routes, with genuinely different consequences."
      savingState={savingState}
    >
      <div className="space-y-3">
        {ISBN_ROUTES.map(route => {
          const selected = isbn.route === route.id
          return (
            <ChoiceCard key={route.id} selected={selected} onClick={() => onPatch({ route: route.id })}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-medium text-ink">{route.title}</span>
                <span className="text-xs whitespace-nowrap" style={{ color: selected ? 'var(--color-sage-deep)' : 'var(--color-faint)' }}>
                  {route.cost}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{route.summary}</p>
              <p className="text-xs leading-relaxed mt-1.5" style={{ color: 'var(--color-ink)', opacity: 0.75 }}>
                {route.tradeoff}
              </p>
            </ChoiceCard>
          )
        })}
      </div>

      {isbn.route === 'own' && (
        <div className="mt-5 space-y-4">
          <TextField
            label="ISBN"
            value={isbn.number ?? ''}
            placeholder="978-…"
            onBlur={v => onPatch({ number: v })}
          />
          <TextField
            label="Registered imprint"
            value={isbn.imprint ?? ''}
            placeholder="The publisher name this ISBN is registered to"
            onBlur={v => onPatch({ imprint: v })}
          />
        </div>
      )}

      {isbn.route === 'kdp_paid' && (
        <div className="mt-5 space-y-4">
          <TextField
            label="Imprint name"
            value={isbn.imprint ?? ''}
            placeholder="The publisher name you want listed — often the author's own press"
            onBlur={v => onPatch({ imprint: v })}
          />
          <p
            className="text-xs leading-relaxed rounded-md p-3"
            style={{ background: 'var(--color-amber-bg)', color: 'var(--color-ink)' }}
          >
            You buy this one directly — from Bowker in the US, Nielsen in the UK, or your national agency
            elsewhere. AuthorsLab does not purchase it for you, and anyone who offers to resell you a
            single ISBN at a markup is worth declining. Morgan can talk you through your country&rsquo;s agency.
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <AskMorgan
          label="Ask Morgan which route fits"
          prompt="Which ISBN route makes sense for my book? I want to understand what I give up with the free KDP option."
          onAskMorgan={onAskMorgan}
        />
      </div>
    </SectionShell>
  )
}

// ============================================================================
// Pricing
// ============================================================================

/**
 * Amazon's ebook royalty bands, which are the single most consequential
 * pricing fact for a self-publishing author: 70% applies only between $2.99
 * and $9.99 (US list), 35% outside it. Pricing at $10.99 can therefore EARN
 * LESS per sale than pricing at $9.99. Real arithmetic, not decoration.
 */
function ebookRoyalty(price: number): { rate: number; perSale: number; band: 'high' | 'low' } | null {
  if (!Number.isFinite(price) || price <= 0) return null
  const inBand = price >= 2.99 && price <= 9.99
  const rate = inBand ? 0.7 : 0.35
  return { rate, perSale: price * rate, band: inBand ? 'high' : 'low' }
}

function PricingSection({ pricing, savingState, onPatch, onAskMorgan }: {
  pricing: PricingBlock
  savingState: SaveState
  onPatch: (patch: PricingBlock) => void
  onAskMorgan: (p: string) => void
}) {
  const currency = pricing.currency ?? 'USD'
  const symbol = CURRENCY_SYMBOL[currency] ?? '$'
  const royalty = ebookRoyalty(parseFloat(pricing.ebook ?? ''))

  return (
    <SectionShell
      title="Pricing"
      blurb="What each format sells for. You can change these any time after launch — nothing here is locked in when the book goes live."
      savingState={savingState}
    >
      <div className="space-y-5">
        <label className="block max-w-[180px]">
          <FieldLabel>Currency</FieldLabel>
          <select
            value={currency}
            onChange={e => onPatch({ currency: e.target.value })}
            className="w-full px-3 py-2 rounded-md text-sm focus:outline-none"
            style={INPUT_STYLE}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-3">
          <PriceField label="eBook" symbol={symbol} value={pricing.ebook ?? ''} onBlur={v => onPatch({ ebook: v })} />
          <PriceField label="Paperback" symbol={symbol} value={pricing.paperback ?? ''} onBlur={v => onPatch({ paperback: v })} />
          <PriceField label="Hardcover" symbol={symbol} value={pricing.hardcover ?? ''} onBlur={v => onPatch({ hardcover: v })} />
        </div>

        {royalty && currency === 'USD' && (
          <div
            className="rounded-md p-3 text-xs leading-relaxed"
            style={{
              background: royalty.band === 'high' ? 'var(--color-sage-bg)' : 'var(--color-amber-bg)',
              color: 'var(--color-ink)',
            }}
          >
            <strong>
              {Math.round(royalty.rate * 100)}% royalty — about {symbol}{royalty.perSale.toFixed(2)} per sale.
            </strong>{' '}
            {royalty.band === 'high'
              ? 'Inside Amazon’s 70% band ($2.99–$9.99).'
              : 'Outside Amazon’s 70% band ($2.99–$9.99), so this earns 35%. A book priced at $10.99 takes home less per copy than the same book at $9.99 — worth knowing before you round up.'}
          </div>
        )}

        <div
          className="rounded-lg p-4"
          style={{ border: '1px solid var(--color-line)', background: 'var(--color-paper-warm)' }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(pricing.kdp_select)}
              onChange={e => onPatch({ kdp_select: e.target.checked })}
              className="mt-0.5"
            />
            <span>
              <span className="block text-sm font-medium text-ink">Enrol in KDP Select</span>
              <span className="block text-xs text-muted leading-relaxed mt-1">
                Puts the ebook in Kindle Unlimited and unlocks Amazon&rsquo;s promotional tools — in exchange for
                90 days of <em>exclusivity</em>. You cannot sell the ebook anywhere else during that window,
                which rules out most of the Platforms list. Renews automatically unless you turn it off.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end">
          <AskMorgan
            label="Ask Morgan about my genre"
            prompt="What do books in my genre typically price at, and is KDP Select worth the exclusivity for me?"
            onAskMorgan={onAskMorgan}
          />
        </div>
      </div>
    </SectionShell>
  )
}

function PriceField({ label, symbol, value, onBlur }: {
  label: string; symbol: string; value: string; onBlur: (v: string) => void
}) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])

  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center rounded-md" style={{ border: '1px solid var(--color-line)', background: 'var(--color-paper)' }}>
        <span className="pl-3 text-sm text-faint">{symbol}</span>
        <input
          type="text"
          inputMode="decimal"
          value={local}
          onChange={e => setLocal(e.target.value)}
          onBlur={() => onBlur(local)}
          placeholder="—"
          className="w-full px-2 py-2 text-sm focus:outline-none bg-transparent"
        />
      </div>
    </label>
  )
}

// ============================================================================
// Platforms
// ============================================================================

function PlatformsPanel({ selected, savingState, onToggle, onAskMorgan }: {
  selected: string[]
  savingState: SaveState
  onToggle: (id: string) => void
  onAskMorgan: (p: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <SectionShell
      title="Platforms"
      blurb="Where the book will be sold. Most authors start with Amazon and add the rest once the launch settles — you are not committing to set all of these up at once."
      savingState={savingState}
      right={<SaveIndicator state={savingState} idleText={`${selected.length} selected`} />}
    >
      <div className="space-y-2">
        {PLATFORMS.map(p => {
          const isSelected = selected.includes(p.id)
          const isExpanded = expanded === p.id
          return (
            <div
              key={p.id}
              className="rounded-lg overflow-hidden transition-colors"
              style={{
                border: isSelected ? '1.5px solid var(--color-sage-deep)' : '1px solid var(--color-line)',
                background: isSelected ? 'var(--color-sage-bg)' : 'var(--color-paper)',
              }}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => onToggle(p.id)}
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Remove' : 'Add'} ${p.name}`}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <span
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                    style={{ background: p.tint }}
                  >
                    {p.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink truncate">{p.name}</span>
                    <span className="block text-[11px] text-muted truncate">{p.reach}</span>
                  </span>
                </button>

                <span className="text-[11px] text-faint whitespace-nowrap hidden sm:block">
                  {p.cost} · {p.setup}
                </span>

                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${p.name}`}
                  className="text-xs px-2 py-1 rounded shrink-0"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {isExpanded ? '−' : 'i'}
                </button>

                <span
                  aria-hidden="true"
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{
                    background: isSelected ? 'var(--color-sage-deep)' : 'transparent',
                    border: isSelected ? 'none' : '1px solid var(--color-line)',
                    color: '#fff',
                  }}
                >
                  {isSelected ? '✓' : ''}
                </span>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pl-14">
                  <p className="text-xs text-muted leading-relaxed">{p.blurb}</p>
                  <p className="text-[11px] text-faint mt-2 sm:hidden">{p.cost} · {p.setup} to set up</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted leading-relaxed mt-5">
        Choosing a platform here records your intent and shapes your launch checklist. Each one still has its
        own account to open and its own forms to fill, by you, on their site. AuthorsLab does not connect to them — Morgan knows what each one asks for and will talk any of them through with you.
      </p>

      <div className="mt-3 flex justify-end">
        <AskMorgan
          label="Ask Morgan where to start"
          prompt="Which of these platforms should I set up first, and which can wait until after launch?"
          onAskMorgan={onAskMorgan}
        />
      </div>
    </SectionShell>
  )
}

// ============================================================================
// Launch
// ============================================================================

interface ChecklistRow {
  id: SectionId
  label: string
  done: boolean
  hint: string
  jumpsToDesign?: boolean
}

/** Tuesday is the conventional release day in trade publishing — charts, review cycles and new-release emails all key off it. */
function dayName(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { weekday: 'long' })
}

function LaunchSection({
  launch,
  checklist,
  readyCount,
  savingState,
  onPatch,
  onGoToSection,
  onAskMorgan,
}: {
  launch: LaunchBlock
  checklist: ChecklistRow[]
  readyCount: number
  savingState: SaveState
  onPatch: (patch: LaunchBlock) => void
  onGoToSection: (s: SectionId) => void
  onAskMorgan: (p: string) => void
}) {
  const date = launch.date ?? ''
  const day = date ? dayName(date) : ''
  const allReady = readyCount === checklist.length

  return (
    <SectionShell
      title="Launch"
      blurb="The date the book goes live, and everything that needs to be true before it does."
      savingState={savingState}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <FieldLabel>Launch date</FieldLabel>
            <input
              type="date"
              value={date}
              onChange={e => onPatch({ date: e.target.value || null })}
              className="px-3 py-2 rounded-md text-sm focus:outline-none"
              style={INPUT_STYLE}
            />
          </label>
          {day && (
            <p className="text-xs text-muted pb-2.5">
              {day}.{' '}
              {day !== 'Tuesday' && (
                <span style={{ color: 'var(--color-status-warn)' }}>
                  Most books release on a Tuesday — review cycles and new-release emails key off it.
                </span>
              )}
            </p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(launch.preorder)}
            onChange={e => onPatch({ preorder: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            <span className="block text-sm font-medium text-ink">Run a pre-order</span>
            <span className="block text-xs text-muted leading-relaxed mt-1">
              Lets readers buy before release day, and all those sales land at once on launch day, which
              helps the early ranking. The catch: Amazon requires the final file well ahead of the date, and
              missing it costs you pre-order rights for a year.
            </span>
          </span>
        </label>

        {/* Derived readiness — every row reads saved state. */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium text-muted">Before you launch</span>
            <span className="text-[11px] text-faint">{readyCount} of {checklist.length} ready</span>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-line)' }}>
            {checklist.map((row, i) => (
              <div
                key={`${row.label}-${i}`}
                className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-line-soft)',
                  background: row.done ? 'var(--color-sage-bg)' : 'var(--color-paper)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: row.done ? 'var(--color-sage-deep)' : 'transparent',
                    border: row.done ? 'none' : '1px solid var(--color-line)',
                    color: '#fff',
                  }}
                >
                  {row.done ? '✓' : ''}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">{row.label}</span>
                  <span className="block text-[11px] text-muted">{row.hint}</span>
                </span>
                {!row.done && !row.jumpsToDesign && (
                  <button
                    type="button"
                    onClick={() => onGoToSection(row.id)}
                    className="text-xs px-2 py-1 rounded shrink-0"
                    style={{ color: 'var(--color-morgan-text)' }}
                  >
                    Open →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg p-4"
          style={{
            border: allReady ? '1.5px solid var(--color-sage-deep)' : '1px solid var(--color-line)',
            background: allReady ? 'var(--color-sage-bg)' : 'var(--color-paper-warm)',
          }}
        >
          <p className="text-sm font-medium text-ink mb-1">
            {allReady ? 'Everything is in place.' : 'Not ready to publish yet.'}
          </p>
          <p className="text-xs text-muted leading-relaxed">
            {allReady
              ? 'Your launch prep is complete. Publishing itself happens on each platform, by you — AuthorsLab does not upload on your behalf. Ask Morgan what any of them will want and she can tell you before you get there.'
              : 'Finish the rows above and your launch prep is complete. Morgan can start on any of them now — you do not have to go in order.'}
          </p>
        </div>

        <div className="flex justify-end">
          <AskMorgan
            label="Ask Morgan about timing"
            prompt="When should I launch, and how far ahead do I need everything finished if I want to run a pre-order?"
            onAskMorgan={onAskMorgan}
          />
        </div>
      </div>
    </SectionShell>
  )
}
