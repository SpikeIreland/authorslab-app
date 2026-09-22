'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
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

interface CoverAsset {
  id: string
  kind: string
  storagePath: string
  createdAt: string
  coverIndex: number | null
  url: string | null
}

type SectionId = 'cover' | 'front-matter' | 'back-matter' | 'interior-format'

const SECTIONS: Array<{ id: SectionId; label: string; comingSoon?: boolean }> = [
  { id: 'cover', label: 'Cover' },
  { id: 'front-matter', label: 'Front matter', comingSoon: true },
  { id: 'back-matter', label: 'Back matter', comingSoon: true },
  { id: 'interior-format', label: 'Interior format', comingSoon: true },
]

const POLL_INTERVAL_MS = 8000
const POLL_MAX_TRIES = 40 // ~5 minutes

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

  const [assets, setAssets] = useState<CoverAsset[]>([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const [messages, setMessages] = useState<DesignMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load the selected cover, existing artwork, and chat history on mount.
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [coverRes, assetsRes, msgRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/design/cover`),
          fetch(`/api/projects/${projectId}/design/assets`),
          fetch(`/api/projects/${projectId}/design/messages`),
        ])

        if (!cancelled && coverRes.ok) {
          const json = await coverRes.json() as { selected: string | null }
          setSelectedCover(json.selected)
        }
        if (!cancelled && assetsRes.ok) {
          const json = await assetsRes.json() as { assets: CoverAsset[] }
          setAssets(json.assets)
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
    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [projectId])

  // Autoscroll on new messages.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  // Persist a cover selection.
  const chooseCover = useCallback(async (value: string) => {
    if (savingCover) return
    setSavingCover(true)
    const previous = selectedCover
    setSelectedCover(value || null)   // optimistic

    try {
      const res = await fetch(`/api/projects/${projectId}/design/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: value || null }),
      })
      if (!res.ok) throw new Error(`save failed (${res.status})`)
    } catch {
      setSelectedCover(previous)   // roll back on failure
    } finally {
      setSavingCover(false)
    }
  }, [projectId, savingCover, selectedCover])

  // Ask Taylor to generate three artwork concepts, then poll for arrival.
  const startGeneration = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setGenError(null)
    const baseline = assets.length

    try {
      const res = await fetch(`/api/projects/${projectId}/design/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error(`request failed (${res.status})`)
    } catch {
      setGenerating(false)
      setGenError('Taylor couldn’t start the run — try again in a moment.')
      return
    }

    let tries = 0
    pollRef.current = setInterval(async () => {
      tries += 1
      if (tries > POLL_MAX_TRIES) {
        if (pollRef.current) clearInterval(pollRef.current)
        setGenerating(false)
        setGenError('This is taking longer than usual — the concepts will appear here once they’re done.')
        return
      }
      try {
        const res = await fetch(`/api/projects/${projectId}/design/assets`)
        if (!res.ok) return
        const json = await res.json() as { assets: CoverAsset[] }
        if (json.assets.length > baseline) {
          if (pollRef.current) clearInterval(pollRef.current)
          setAssets(json.assets)
          setGenerating(false)
        }
      } catch {
        // transient — keep polling
      }
    }, POLL_INTERVAL_MS)
  }, [projectId, generating, assets.length])

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

  const selectedAsset = assets.find(a => selectedCover === `cover-asset:${a.id}`) ?? null

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
                {coverLoading
                  ? 'Loading…'
                  : generating
                    ? 'Taylor is working…'
                    : assets.length === 0
                      ? 'No concepts yet'
                      : selectedAsset
                        ? `Concept ${selectedAsset.coverIndex ?? ''} selected`.replace('  ', ' ')
                        : `${assets.length} concepts · none selected`}
              </p>
            </div>

            {/* Concept gallery — real artwork from Taylor's generation runs */}
            {assets.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {assets.map(a => {
                  const value = `cover-asset:${a.id}`
                  const isSelected = selectedCover === value
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => chooseCover(value)}
                      disabled={savingCover}
                      className="text-left flex flex-col gap-1.5 group disabled:opacity-50 disabled:cursor-wait"
                    >
                      <div
                        className={`aspect-[2/3] rounded-md overflow-hidden bg-slate-100 transition-shadow ${
                          isSelected
                            ? 'ring-2 ring-sage-deep ring-offset-1'
                            : 'border border-slate-200 group-hover:border-slate-400'
                        }`}
                      >
                        {a.url ? (
                          // Signed URLs from the private bucket; plain img avoids
                          // next/image remote-domain config for expiring hosts.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.url}
                            alt={`Cover concept ${a.coverIndex ?? ''}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            Unavailable
                          </div>
                        )}
                      </div>
                      <div className="text-xs flex items-center gap-1.5">
                        <span className={isSelected ? 'text-sage-deep font-medium' : 'text-slate-700'}>
                          {a.coverIndex ? `Concept ${a.coverIndex}` : 'Concept'}
                        </span>
                        {isSelected && <span className="text-sage-deep">✓ Your cover</span>}
                        {a.kind === 'uploaded' && (
                          <span className="text-slate-400 border border-slate-200 rounded px-1">Uploaded</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Taylor is working — persona working state */}
            {generating && (
              <div className="flex items-center gap-3 px-4 py-4 bg-white border border-slate-200 rounded-md mb-5">
                <div className="relative w-9 h-9 shrink-0">
                  <span className="absolute inset-0 rounded-full bg-sage-bg animate-ping motion-reduce:animate-none" aria-hidden="true" />
                  <span className="relative w-9 h-9 rounded-full bg-taylor text-white text-sm font-medium flex items-center justify-center font-serif">
                    T
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  Painting three concepts — this can take a few minutes…
                </p>
              </div>
            )}

            {/* Intake — no artwork yet */}
            {!coverLoading && assets.length === 0 && !generating && (
              <div className="px-5 py-6 bg-white border border-slate-200 rounded-md mb-5 max-w-xl">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-taylor text-white text-sm font-medium flex items-center justify-center font-serif shrink-0">
                    T
                  </span>
                  <div>
                    <p className="text-sm text-slate-800 leading-relaxed mb-3">
                      Ready when you are — I’ll read the book’s genre and tone and paint
                      three artwork directions to start from. Tell me in the chat if you
                      already have a mood, palette, or imagery in mind.
                    </p>
                    <button
                      type="button"
                      onClick={startGeneration}
                      className="text-xs px-3.5 py-2 rounded-md text-white bg-sage-deep hover:opacity-90 font-medium"
                    >
                      Ask Taylor for concepts
                    </button>
                  </div>
                </div>
              </div>
            )}

            {genError && (
              <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 mb-5">
                {genError}
              </p>
            )}

            {assets.length > 0 && !generating && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startGeneration}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
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
            )}
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
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium bg-taylor font-serif">
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
              Tell Taylor what you’re thinking — about a concept, your audience, or
              anything design-related. She’s here to help you choose well.
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
