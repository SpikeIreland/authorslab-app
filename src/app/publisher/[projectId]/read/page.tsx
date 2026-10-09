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

import { FirmChip } from '../../_components/FirmChip'
import { usePublisherActions, notesAt } from '../../_data/usePublisherActions'
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

import type { PublisherAction as PublisherNote } from '../../_data/usePublisherActions'
import {
  StudioSpine,
  StudioWorkCentre,
  type StudioChapter,
} from '@/components/studio/StudioRoom'

// ─── 2. Helpers ───────────────────────────────────────────────────────────────



function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
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
  const { actions, available, saving, record } = usePublisherActions(projectId)
  const notesAvailable = available === true

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
    () => notesAt(actions, 'manuscript', current),
    [actions, current]
  )

  const addNote = useCallback(
    async (body: string) => {
      if (current === null) return
      await record({
        station: 'manuscript',
        kind: 'note',
        body,
        chapterNumber: current,
      })
    },
    [current, record]
  )

  const noteCountByChapter = useMemo(() => {
    const m = new Map<number, number>()
    for (const a of actions) {
      if (a.kind !== 'note' || a.station !== 'manuscript') continue
      if (a.chapter_number === null) continue
      m.set(a.chapter_number, (m.get(a.chapter_number) ?? 0) + 1)
    }
    return m
  }, [actions])

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

  /* The surface takes the shared shape; this room keeps its own fetch. The
   * mapping is here rather than in the components because the SHAPE is the
   * contract and the field names are this room's business. */
  const spineChapters: StudioChapter[] | null =
    spine === null
      ? null
      : spine.map((e) => ({
          chapter_number: e.chapterNumber,
          title: e.title,
          word_count: e.wordCount,
        }))

  /* THREE STATES, KEPT APART. null = still loading; '' = a chapter that holds
   * no text on the record; a string = the prose. Collapsing loading into
   * empty would show "no text on the record" about a chapter we have not
   * fetched yet, which is a claim about the book made from a claim about us. */
  const workCentreText: string | null =
    loadingChapter || current === null ? null : chapter?.content ?? ''

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F] flex flex-col">
      <ReadHeader onBack={() => router.push(`/publisher/${projectId}`)} />

      {/*
        The notes column is only rendered when the publisher log can actually
        be written (see usePublisherActions). When it is absent the grid must
        COLLAPSE to two tracks — an empty 300px gutter reads as a broken page,
        which is its own kind of dishonesty: it shows a hole where a feature
        was rather than a page that simply does not have that feature yet.
      */}
      <div
        className={`flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 ${
          notesAvailable
            ? 'lg:grid-cols-[240px_minmax(0,1fr)_300px]'
            : 'lg:grid-cols-[240px_minmax(0,1fr)]'
        }`}
      >
        {/* ─── THE ONE SURFACE, PUBLISHER CHAIR (ux SPEC §2, 2026-10-09) ──
            This room's own Spine and ChapterPane are RETIRED, not refactored.
            `ux`: "the reading room's layout was right, and its reward is
            retirement: it becomes the publisher MOUNT of the one surface, not
            a sibling of it."

            They were a sibling in the literal sense that matters to
            acceptance test 3 — this room's spine carried its own geometry and
            its own navy accent, so a publisher and an author looking at the
            same book did NOT recognise each other's screen. Same job, two
            appearances, which is the divergence the lift exists to end.

            `audience="publisher"` is the whole of the difference. Hands and
            register both derive from it, and no management handler is passed
            — but passing one would render nothing anyway, which is the
            property proven in scripts/verify-studio-chairs.tsx by rendering
            this chair with every write handler wired. */}
        <StudioSpine
          audience="publisher"
          chapters={spineChapters ?? []}
          currentChapter={current}
          onSelect={setCurrent}
          noteCounts={noteCountByChapter}
        />
        <StudioWorkCentre
          audience="publisher"
          title={chapter?.title ?? null}
          text={workCentreText}
        />
        {notesAvailable && (
          <NotesPane
            chapterTitle={chapter?.title ?? ''}
            notes={notesForChapter}
            onAdd={addNote}
            disabled={current === null || saving}
            available={available}
            hasChapters={spine === null ? null : spine.length > 0}
          />
        )}
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
        <FirmChip />
      </div>
    </header>
  )
}

// ─── 5. The spine ─────────────────────────────────────────────────────────────


// ─── 6. The chapter ───────────────────────────────────────────────────────────


// ─── 7. The publisher's notes ─────────────────────────────────────────────────

function NotesPane({
  chapterTitle,
  notes,
  onAdd,
  disabled,
  hasChapters,
  available,
}: {
  chapterTitle: string
  notes: PublisherNote[]
  onAdd: (body: string) => void | Promise<void>
  disabled: boolean
  hasChapters: boolean | null
  available: boolean | null
}) {
  const [draft, setDraft] = useState('')

  async function submit() {
    const body = draft.trim()
    if (!body) return
    await onAdd(body)
    setDraft('')
  }

  // An affordance is a claim. Where notes cannot be recorded, the column does
  // not offer to record one — it is not disabled-with-an-apology, it is absent.
  if (available !== true) return null

  // A note attaches to a CHAPTER. With no chapters there is nothing to attach
  // one to, and with none selected there is nothing chosen — so the composer
  // is absent rather than present-and-silently-inert. It was the latter: the
  // textarea accepted text, "Add note" looked live, and `addNote` returned
  // early on a null chapter, discarding what had been typed with no feedback.
  // A control that pretends to succeed is worse than one that is missing.
  const nothingToNoteOn = hasChapters === false || disabled

  return (
    <aside className="border-l border-[#E8E5E0] bg-white/60 lg:max-h-[calc(100vh-61px)] lg:overflow-y-auto">
      <div className="px-5 py-4 text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] border-b border-[#E8E5E0]">
        Your notes
      </div>

      <div className="px-5 py-4">
        {chapterTitle && (
          <div className="text-[12px] text-[#8A8A8A] mb-4">on {chapterTitle}</div>
        )}

        {nothingToNoteOn ? (
          <p className="text-[13px] text-[#8A8A8A] leading-relaxed">
            {hasChapters === false
              ? 'Notes attach to a chapter. There is no manuscript here yet.'
              : 'Select a chapter to leave a note on it.'}
          </p>
        ) : notes.length === 0 ? (
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
                  {n.actor_firm} &middot; {formatWhen(n.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!nothingToNoteOn && (
        <>
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
        </>
        )}
      </div>
    </aside>
  )
}
