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
  layout: 'front' | 'wraparound'
  url: string | null
}

interface ProjectMeta {
  title: string
  genre: string
  authorName: string
}

type SectionId = 'cover' | 'front-matter' | 'back-matter' | 'interior-format'

const SECTIONS: Array<{ id: SectionId; label: string; preview?: boolean }> = [
  { id: 'cover', label: 'Cover' },
  { id: 'front-matter', label: 'Front matter', preview: true },
  { id: 'back-matter', label: 'Back matter', preview: true },
  { id: 'interior-format', label: 'Interior format', preview: true },
]

const POLL_INTERVAL_MS = 8000
const POLL_MAX_TRIES = 45 // ~6 minutes

const SPECIMEN_TEXT =
  'It began, as most true things do, quietly. A door left half open, a light in the window across the water, and the sense — before any evidence — that the evening had already decided something on her behalf.'

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
  const [project, setProject] = useState<ProjectMeta>({ title: 'Untitled', genre: '', authorName: 'Author Name' })
  const [generating, setGenerating] = useState<null | { baseline: number; expected: number; layout: string }>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [showBack, setShowBack] = useState(false)

  const [messages, setMessages] = useState<DesignMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load the selected cover, existing artwork + project meta, and chat history.
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
          const json = await assetsRes.json() as { assets: CoverAsset[]; project?: ProjectMeta }
          setAssets(json.assets)
          if (json.project) setProject(json.project)
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

  // Ask Taylor to generate artwork, then poll — rendering each concept as it
  // arrives (the workflow stores them one at a time over a few minutes).
  const startGeneration = useCallback(async (layout?: 'wraparound') => {
    if (generating) return
    setGenError(null)
    const baseline = assets.length

    let expected = layout === 'wraparound' ? 1 : 3
    try {
      const res = await fetch(`/api/projects/${projectId}/design/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout ? { layout } : {}),
      })
      if (!res.ok) throw new Error(`request failed (${res.status})`)
      const json = await res.json() as { expected?: number }
      if (json.expected) expected = json.expected
    } catch {
      setGenError('Taylor couldn’t start the run — try again in a moment.')
      return
    }

    setGenerating({ baseline, expected, layout: layout ?? 'front' })

    let tries = 0
    pollRef.current = setInterval(async () => {
      tries += 1
      if (tries > POLL_MAX_TRIES) {
        if (pollRef.current) clearInterval(pollRef.current)
        setGenerating(null)
        setGenError('This is taking longer than usual — new artwork will appear here once it’s done.')
        return
      }
      try {
        const res = await fetch(`/api/projects/${projectId}/design/assets`)
        if (!res.ok) return
        const json = await res.json() as { assets: CoverAsset[] }
        if (json.assets.length !== baseline) {
          setAssets(json.assets)   // progressive arrival — show each as it lands
        }
        if (json.assets.length >= baseline + expected) {
          if (pollRef.current) clearInterval(pollRef.current)
          setGenerating(null)
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

  const fronts = assets.filter(a => a.layout !== 'wraparound')
  const wraps = assets.filter(a => a.layout === 'wraparound')
  const latestWrap = wraps.length > 0 ? wraps[wraps.length - 1] : null
  const selectedAsset = fronts.find(a => selectedCover === `cover-asset:${a.id}`) ?? null
  const bookFront = selectedAsset ?? (fronts.length > 0 ? fronts[fronts.length - 1] : null)

  const arrived = generating ? Math.max(0, assets.length - generating.baseline) : 0
  const workingLabel = generating
    ? generating.layout === 'wraparound'
      ? 'Painting the full jacket — back, spine and front in one scene…'
      : `Painting concept ${Math.min(arrived + 1, generating.expected)} of ${generating.expected} — they’ll appear as they’re finished…`
    : ''

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
                {s.preview && (
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-1 py-px">
                    Preview
                  </span>
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
                    : fronts.length === 0
                      ? 'No concepts yet'
                      : selectedAsset
                        ? 'Cover chosen'
                        : `${fronts.length} concepts · none selected`}
              </p>
            </div>

            {/* Concept gallery — real artwork from Taylor's generation runs */}
            {fronts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {fronts.map(a => {
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.url} alt={`Cover concept ${a.coverIndex ?? ''}`} className="w-full h-full object-cover" />
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

            {/* Full jacket concepts — back · spine · front in one scene */}
            {wraps.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-2">
                  Full jacket
                </p>
                {wraps.map(w => (
                  <div key={w.id} className="max-w-2xl mb-3">
                    <div className="relative aspect-[3/2] rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                      {w.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.url} alt="Full jacket concept" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          Unavailable
                        </div>
                      )}
                      {/* Zone guides — where the jacket folds */}
                      <div className="absolute inset-y-0 left-1/3 w-px bg-white/50 border-l border-dashed border-slate-900/25" aria-hidden="true" />
                      <div className="absolute inset-y-0 left-2/3 w-px bg-white/50 border-l border-dashed border-slate-900/25" aria-hidden="true" />
                    </div>
                    <div className="flex text-[10px] uppercase tracking-wider text-slate-400 mt-1">
                      <span className="w-1/3">Back</span>
                      <span className="w-1/3 text-center">Spine</span>
                      <span className="w-1/3 text-right">Front</span>
                    </div>
                  </div>
                ))}
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
                <p className="text-sm text-slate-700">{workingLabel}</p>
              </div>
            )}

            {/* Intake — no artwork yet */}
            {!coverLoading && fronts.length === 0 && !generating && (
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
                      onClick={() => startGeneration()}
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

            {fronts.length > 0 && !generating && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => startGeneration()}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Generate more concepts
                </button>
                <button
                  type="button"
                  onClick={() => startGeneration('wraparound')}
                  className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Paint a full jacket
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

            {/* On the shelf — 3D book preview of the (selected) cover */}
            {bookFront?.url && (
              <div className="max-w-2xl">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                    In your hands
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowBack(false)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${!showBack ? 'border-slate-400 text-slate-800 bg-white' : 'border-slate-200 text-slate-500'}`}
                    >
                      Front
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBack(true)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${showBack ? 'border-slate-400 text-slate-800 bg-white' : 'border-slate-200 text-slate-500'}`}
                    >
                      Back
                    </button>
                  </div>
                </div>
                <div
                  className="rounded-md border border-slate-200 flex items-center justify-center py-10"
                  style={{ background: '#EDE9E1', perspective: '1200px' }}
                >
                  <div
                    className="relative motion-reduce:transition-none"
                    style={{
                      width: '176px',
                      height: '264px',
                      transformStyle: 'preserve-3d',
                      transform: showBack ? 'rotateY(-155deg)' : 'rotateY(-28deg)',
                      transition: 'transform 0.9s ease',
                    }}
                  >
                    {/* Front cover */}
                    <div
                      className="absolute inset-0 rounded-r-sm overflow-hidden"
                      style={{
                        transform: 'translateZ(14px)',
                        backfaceVisibility: 'hidden',
                        boxShadow: '14px 18px 40px rgba(44,44,42,.30)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bookFront.url} alt="Selected cover on a book" className="w-full h-full object-cover" />
                      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent" aria-hidden="true" />
                    </div>
                    {/* Back cover — real jacket art when a wrap exists, derived otherwise */}
                    <div
                      className="absolute inset-0 rounded-l-sm overflow-hidden"
                      style={{
                        transform: 'rotateY(180deg) translateZ(14px)',
                        backfaceVisibility: 'hidden',
                        ...(latestWrap?.url
                          ? {
                              backgroundImage: `url(${latestWrap.url})`,
                              backgroundSize: 'auto 100%',
                              backgroundPosition: '0% 50%',
                            }
                          : {
                              backgroundImage: `url(${bookFront.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'brightness(0.55) saturate(0.8)',
                            }),
                      }}
                    />
                    {/* Spine */}
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        width: '28px',
                        left: '-14px',
                        transform: 'rotateY(-90deg)',
                        ...(latestWrap?.url
                          ? {
                              backgroundImage: `url(${latestWrap.url})`,
                              backgroundSize: 'auto 100%',
                              backgroundPosition: '50% 50%',
                            }
                          : { background: '#2C2C2A' }),
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {latestWrap
                    ? 'Back and spine come from the full-jacket artwork — one continuous scene around the book.'
                    : 'Back and spine are previews derived from the front artwork — paint a full jacket to see the real thing.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== Front matter preview ==================== */}
        {section === 'front-matter' && (
          <div className="p-6">
            <SectionHeader
              title="Front matter"
              blurb="The pages that open your book — Taylor sets them up from your manuscript and profile."
            />
            <div className="flex flex-wrap gap-6 items-start">
              <div
                className="w-56 aspect-[2/3] bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col items-center justify-between text-center px-5 py-8"
                aria-label="Title page preview"
              >
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">A novel</p>
                <div>
                  <p className="font-serif text-lg leading-snug text-slate-900">{project.title}</p>
                  <div className="w-8 border-t border-slate-300 mx-auto my-3" />
                  <p className="text-[11px] text-slate-600">{project.authorName}</p>
                </div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">AuthorsLab</p>
              </div>
              <div className="flex-1 min-w-[220px] max-w-sm">
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Your title page, typeset from the project — then the pages readers expect,
                  each generated with you, not for you:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Title page', 'Copyright', 'Dedication', 'Epigraph', 'Contents'].map(p => (
                    <span key={p} className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
                <InDesignNote note="Editing these pages arrives with the cover composer — the typography here follows whatever your cover establishes." />
              </div>
            </div>
          </div>
        )}

        {/* ==================== Back matter preview ==================== */}
        {section === 'back-matter' && (
          <div className="p-6">
            <SectionHeader
              title="Back matter"
              blurb="The pages that close your book — and quietly sell your next one."
            />
            <div className="flex flex-wrap gap-6 items-start">
              <div className="w-56 aspect-[2/3] bg-white border border-slate-200 rounded-sm shadow-sm px-5 py-7" aria-label="About the author preview">
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mb-3">About the author</p>
                <p className="font-serif text-sm text-slate-900 mb-2">{project.authorName}</p>
                <div className="space-y-1.5" aria-hidden="true">
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-11/12" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mt-6 mb-2">Also by</p>
                <div className="space-y-1.5" aria-hidden="true">
                  <div className="h-1.5 bg-slate-100 rounded w-2/3" />
                  <div className="h-1.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex-1 min-w-[220px] max-w-sm">
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Author bio drawn from your profile, acknowledgments in your voice, and an
                  &ldquo;also by&rdquo; page that grows with your shelf:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['About the author', 'Acknowledgments', 'Also by', 'Newsletter invitation'].map(p => (
                    <span key={p} className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
                <InDesignNote note="Built with the composer — your bio and links come in from your author profile, ready to edit." />
              </div>
            </div>
          </div>
        )}

        {/* ==================== Interior format preview ==================== */}
        {section === 'interior-format' && (
          <div className="p-6">
            <SectionHeader
              title="Interior format"
              blurb="Typography, trim size, chapter openings — how the inside of your book reads."
            />
            <div className="flex flex-wrap gap-4 mb-4">
              <SpecimenPage
                caption="Classic Serif · 5×8″"
                serif
                chapterLabel="Chapter One"
                title={project.title}
              />
              <SpecimenPage
                caption="Contemporary · 6×9″"
                serif={false}
                chapterLabel="1"
                title={project.title}
              />
            </div>
            <div className="max-w-sm">
              <InDesignNote note="Two of the interior styles Taylor will offer — pick one, and every chapter, page number and running head follows it. Print-ready files per platform come from here." />
            </div>
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

// ============================================================================
// Small presentational pieces
// ============================================================================

function SectionHeader({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-medium text-slate-900">{title}</h2>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 border border-slate-200 bg-slate-50 rounded px-1.5 py-px">
          In design
        </span>
      </div>
      <p className="text-xs text-slate-600">{blurb}</p>
    </div>
  )
}

function InDesignNote({ note }: { note: string }) {
  return (
    <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md">
      <p className="text-[11px] text-slate-600 leading-relaxed">{note}</p>
    </div>
  )
}

function SpecimenPage({ caption, serif, chapterLabel, title }: {
  caption: string
  serif: boolean
  chapterLabel: string
  title: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="w-52 aspect-[2/3] bg-white border border-slate-200 rounded-sm shadow-sm px-4 py-6 overflow-hidden" aria-label={`Interior specimen — ${caption}`}>
        <p className="text-[8px] uppercase tracking-[0.25em] text-slate-400 text-center mb-1.5">{chapterLabel}</p>
        <p className={`text-center text-[13px] text-slate-900 mb-3 ${serif ? 'font-serif' : 'font-medium'}`}>{title}</p>
        <p className={`text-[9px] leading-[1.7] text-slate-700 text-justify ${serif ? 'font-serif' : ''}`}>
          <span className={`float-left text-[22px] leading-[0.85] pr-1 ${serif ? 'font-serif' : 'font-medium'}`}>I</span>
          {SPECIMEN_TEXT.slice(3)}
        </p>
        <p className={`text-[9px] leading-[1.7] text-slate-700 text-justify mt-1.5 ${serif ? 'font-serif' : ''}`}>
          {SPECIMEN_TEXT}
        </p>
      </div>
      <p className="text-[11px] text-slate-500 text-center">{caption}</p>
    </div>
  )
}
