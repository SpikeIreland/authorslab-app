'use client'

export const dynamic = 'force-dynamic'

/**
 * THE READING ROOM — /publisher/[projectId]/read
 *
 * The thing a publisher most wants to do, which the portal has never let them
 * do: read the book, and put a note against the page in front of them.
 *
 * Layout mirrors the Author Studio's split so the two read as one product —
 * spine on the left, the work in the middle — with the AI chat column
 * replaced by the publisher's own notes. That was Paul's framing and it is
 * the right one: same room, different chair.
 *
 * ─── What is honest here, and what is not yet ────────────────────────────────
 * Chapter text is REAL, read through the publisher server route.
 * Notes are REAL within the session and attributed, but NOT PERSISTED — there
 * is no publisher-notes table yet (couriered to sysadmin). So nothing on this
 * page claims a note has reached the author, because it hasn't. When the table
 * exists, this component writes to it and the copy gains that claim honestly.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { VIEWING_FIRM } from '../../_data/firm'
// ─── 1. Types ─────────────────────────────────────────────────────────────────

interface SpineEntry {
  chapterNumber: number
  title: string
  wordCount: number
}

interface ChapterBody {
  chapterNumber: number
  title: string
  content: string
  wordCount: number
}

interface Note {
  id: string
  chapterNumber: number
  body: string
  when: string
}

// ─── 2. Helpers ───────────────────────────────────────────────────────────────

function formatWordCount(n: number): string {
  return n.toLocaleString('en-GB')
}

/** Chapter prose is stored as plain text; split on blank lines to paragraphs. */
function toParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

// ─── 3. Page ──────────────────────────────────────────────────────────────────

export default function ReadingRoomPage() {
  const params = useParams<{ projectId: string }>()
  const router = useRouter()
  const projectId = params?.projectId ?? ''

  const [spine, setSpine] = useState<SpineEntry[] | null>(null)
  const [current, setCurrent] = useState<number | null>(null)
  const [chapter, setChapter] = useState<ChapterBody | null>(null)
  const [loadingChapter, setLoadingChapter] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])

  // ── Load the spine, then open the first chapter ──────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/chapters`)
        if (cancelled) return
        if (!res.ok) {
          setError(
            res.status === 404
              ? 'Project not available — check the invitation link.'
              : 'Something went wrong loading the manuscript. Please try again.'
          )
          return
        }
        const json = (await res.json()) as { spine?: SpineEntry[] }
        if (cancelled) return
        const entries = json.spine ?? []
        setSpine(entries)
        if (entries.length > 0) setCurrent(entries[0].chapterNumber)
      } catch {
        if (!cancelled) {
          setError('Something went wrong loading the manuscript. Please try again.')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  // ── Load whichever chapter is open ───────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId || current === null) return
      setLoadingChapter(true)
      try {
        const res = await fetch(
          `/api/publisher/projects/${projectId}/chapters?n=${current}`
        )
        if (cancelled) return
        if (!res.ok) {
          setChapter(null)
          setLoadingChapter(false)
          return
        }
        const json = (await res.json()) as { chapter?: ChapterBody }
        if (cancelled) return
        setChapter(json.chapter ?? null)
        setLoadingChapter(false)
      } catch {
        if (!cancelled) {
          setChapter(null)
          setLoadingChapter(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId, current])

  const notesForChapter = useMemo(
    () => notes.filter((n) => n.chapterNumber === current),
    [notes, current]
  )

  const addNote = useCallback(
    (body: string) => {
      if (current === null) return
      setNotes((prev) => [
        ...prev,
        { id: makeId(), chapterNumber: current, body, when: 'just now' },
      ])
    },
    [current]
  )

  const noteCountByChapter = useMemo(() => {
    const m = new Map<number, number>()
    for (const n of notes) m.set(n.chapterNumber, (m.get(n.chapterNumber) ?? 0) + 1)
    return m
  }, [notes])

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F]">
        <ReadHeader onBack={() => router.push(`/publisher/${projectId}`)} />
        <div className="max-w-[720px] mx-auto px-8 py-24 text-center">
          <div
            className="text-[26px] text-[#1A1A1A] mb-3"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            Manuscript not available
          </div>
          <p className="text-[15px]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F] flex flex-col">
      <ReadHeader onBack={() => router.push(`/publisher/${projectId}`)} />

      <div className="flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <Spine
          entries={spine}
          current={current}
          noteCounts={noteCountByChapter}
          onSelect={setCurrent}
        />
        <ChapterPane chapter={chapter} loading={loadingChapter} />
        <NotesPane
          chapterTitle={chapter?.title ?? ''}
          notes={notesForChapter}
          onAdd={addNote}
          disabled={current === null}
        />
      </div>
    </div>
  )
}

// ─── 4. Header ────────────────────────────────────────────────────────────────

function ReadHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="border-b border-[#E8E5E0] bg-white sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#1E3A5F] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 rounded-[3px] px-1"
        >
          &larr; Back to the project
        </button>
        <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Reading room
        </div>
        <div className="flex items-center gap-3 px-3.5 py-1.5 border border-[#E8E5E0] rounded-full bg-[#FAFAF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F]" aria-hidden />
          <span className="text-[12px] text-[#1A1A1A]">{VIEWING_FIRM}</span>
        </div>
      </div>
    </header>
  )
}

// ─── 5. The spine ─────────────────────────────────────────────────────────────

function Spine({
  entries,
  current,
  noteCounts,
  onSelect,
}: {
  entries: SpineEntry[] | null
  current: number | null
  noteCounts: Map<number, number>
  onSelect: (n: number) => void
}) {
  return (
    <nav className="border-r border-[#E8E5E0] bg-white/60 lg:max-h-[calc(100vh-61px)] lg:overflow-y-auto">
      <div className="px-5 py-4 text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] border-b border-[#E8E5E0]">
        Contents
      </div>
      {entries === null ? (
        <div className="p-5 text-[13px] text-[#8A8A8A]">Loading&hellip;</div>
      ) : (
        <ul>
          {entries.map((e) => {
            const active = e.chapterNumber === current
            const noteCount = noteCounts.get(e.chapterNumber) ?? 0
            return (
              <li key={e.chapterNumber}>
                <button
                  type="button"
                  onClick={() => onSelect(e.chapterNumber)}
                  aria-current={active ? 'true' : undefined}
                  className={`w-full text-left px-5 py-2.5 border-l-2 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1E3A5F]/30 ${
                    active
                      ? 'border-l-[#1E3A5F] bg-white'
                      : 'border-l-transparent hover:bg-white'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-[13px] truncate ${active ? 'text-[#1A1A1A]' : 'text-[#3F3F3F]'}`}
                    >
                      {e.title}
                    </span>
                    {noteCount > 0 && (
                      <span className="ml-auto text-[10px] text-white bg-[#1E3A5F] rounded-full px-1.5 py-0.5 flex-shrink-0">
                        {noteCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#8A8A8A] mt-0.5">
                    {formatWordCount(e.wordCount)} words
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}

// ─── 6. The chapter ───────────────────────────────────────────────────────────

function ChapterPane({
  chapter,
  loading,
}: {
  chapter: ChapterBody | null
  loading: boolean
}) {
  if (loading && !chapter) {
    return (
      <main className="px-8 py-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-[#E8E5E0] border-t-[#1E3A5F] rounded-full animate-spin" />
      </main>
    )
  }
  if (!chapter) {
    return (
      <main className="px-8 py-16 text-center text-[14px] text-[#8A8A8A]">
        Choose a chapter to begin reading.
      </main>
    )
  }

  const paragraphs = toParagraphs(chapter.content)

  return (
    <main className="px-8 lg:px-14 py-12 lg:max-h-[calc(100vh-61px)] lg:overflow-y-auto">
      <article className="max-w-[640px] mx-auto">
        <h1
          className="text-[30px] leading-tight text-[#1A1A1A] mb-2"
          style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
        >
          {chapter.title}
        </h1>
        <div className="text-[12px] text-[#8A8A8A] mb-10">
          {formatWordCount(chapter.wordCount)} words
        </div>

        {paragraphs.length === 0 ? (
          <p className="text-[15px] text-[#8A8A8A]">This chapter is empty.</p>
        ) : (
          paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[17px] leading-[1.75] text-[#2A2A2A] mb-6"
              style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
            >
              {p}
            </p>
          ))
        )}
      </article>
    </main>
  )
}

// ─── 7. The publisher's notes ─────────────────────────────────────────────────

function NotesPane({
  chapterTitle,
  notes,
  onAdd,
  disabled,
}: {
  chapterTitle: string
  notes: Note[]
  onAdd: (body: string) => void
  disabled: boolean
}) {
  const [draft, setDraft] = useState('')

  function submit() {
    const body = draft.trim()
    if (!body) return
    onAdd(body)
    setDraft('')
  }

  return (
    <aside className="border-l border-[#E8E5E0] bg-white/60 lg:max-h-[calc(100vh-61px)] lg:overflow-y-auto">
      <div className="px-5 py-4 text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] border-b border-[#E8E5E0]">
        Your notes
      </div>

      <div className="px-5 py-4">
        {chapterTitle && (
          <div className="text-[12px] text-[#8A8A8A] mb-4">on {chapterTitle}</div>
        )}

        {notes.length === 0 ? (
          <p className="text-[13px] text-[#8A8A8A] leading-relaxed mb-5">
            Nothing yet. Notes you leave here sit against this chapter.
          </p>
        ) : (
          <div className="space-y-3 mb-5">
            {notes.map((n) => (
              <div
                key={n.id}
                className="border border-[#E8E5E0] bg-white rounded-[3px] px-3.5 py-3"
              >
                <div className="text-[14px] leading-[1.55] text-[#2A2A2A]">{n.body}</div>
                <div className="text-[11px] text-[#B8B8B8] mt-2">
                  {VIEWING_FIRM} &middot; {n.when}
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="A note on this chapter&hellip;"
          className="w-full text-[13px] px-3 py-2.5 border border-[#E8E5E0] rounded-[3px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !draft.trim()}
          className="mt-2.5 w-full text-[13px] px-4 py-2 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
        >
          Add note
        </button>
      </div>
    </aside>
  )
}
