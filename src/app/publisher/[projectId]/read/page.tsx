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
import { usePublisherNotes, type PublisherNote } from '../../_data/usePublisherNotes'
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
  /* ─── NOTES NOW PERSIST (C1, applied 2026-10-09) ─────────────────────────
   * This room's header used to say notes were "attributed but NOT PERSISTED —
   * there is no publisher-notes table yet". There is one now, and its policies
   * run on `can_work_manuscript_as_house` — the house leg ALONE, no author leg
   * and no is_admin — so the author of the book cannot read the house's notes
   * about it. That was sysadmin's reason for declining to reuse
   * `can_read_manuscript()`, whose first leg is the author.
   *
   * `unavailable` is NOT `empty`, which is why this reads a discriminated
   * state rather than a boolean: a failed read and a seatless caller must not
   * render as "no notes yet". */
  const { state: notesState, addNote: persistNote, saving, lastFailure } =
    usePublisherNotes(projectId)
  const notesAvailable = notesState.status === 'ready'

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

  const notesForChapter = useMemo<PublisherNote[]>(
    () =>
      notesState.status === 'ready'
        ? notesState.notes.filter((n) => n.chapter_number === current)
        : [],
    [notesState, current]
  )

  const addNote = useCallback(
    async (body: string) => {
      // `current` may be null — a note on the BOOK rather than a chapter. C1
      // makes chapter_number nullable precisely so that is sayable, so it is
      // passed through rather than guarded against.
      const result = await persistNote(body, current)
      if (!result.ok) console.error('note not saved:', result.reason)
    },
    [current, persistNote]
  )

  const noteCountByChapter = useMemo(() => {
    const counts = new Map<number, number>()
    if (notesState.status !== 'ready') return counts
    for (const n of notesState.notes) {
      // A book-level note belongs to no chapter row, so it is counted nowhere
      // rather than attributed to chapter 0 — which is a REAL chapter in this
      // estate (the prologue renders as 'P').
      if (n.chapter_number === null) continue
      counts.set(n.chapter_number, (counts.get(n.chapter_number) ?? 0) + 1)
    }
    return counts
  }, [notesState])

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
        be written (see usePublisherNotes). When it is absent the grid must
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
            disabled={saving}
            available={notesAvailable}
            lastFailure={lastFailure}
            myMembershipId={
              notesState.status === 'ready' ? notesState.myMembershipId : null
            }
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
  lastFailure,
  myMembershipId,
}: {
  chapterTitle: string
  notes: PublisherNote[]
  onAdd: (body: string) => void | Promise<void>
  disabled: boolean
  hasChapters: boolean | null
  available: boolean
  /** A write that failed. Rendered, never swallowed. */
  lastFailure: string | null
  /** The viewer's own membership, so "You" is a fact and not a guess. */
  myMembershipId: string | null
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
  if (!available) return null

  // A note attaches to a CHAPTER. With no chapters there is nothing to attach
  // one to, and with none selected there is nothing chosen — so the composer
  // is absent rather than present-and-silently-inert. It was the latter: the
  // textarea accepted text, "Add note" looked live, and `addNote` returned
  // early on a null chapter, discarding what had been typed with no feedback.
  // A control that pretends to succeed is worse than one that is missing.
  // A note with no chapter selected is a note ON THE BOOK — C1 makes
  // chapter_number nullable precisely so that is sayable. So the composer
  // stays; only a title with no manuscript at all has nothing to note on.
  const nothingToNoteOn = hasChapters === false

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
                {/* ATTRIBUTION, AND WHAT WE WILL NOT INVENT.
                    The old pane printed `actor_firm`, a column C1 does not
                    have: a note is attributed to a MEMBERSHIP id, with no
                    label. So this says the one thing the row supports —
                    whether the note is yours — and says nothing where it
                    cannot. Printing the house's own name against a colleague's
                    note would be the `actor_firm` defect again in the other
                    direction: a label that looks like attribution and names
                    nobody. A display name needs either a join in the notes
                    route or a label column; couriered as a question. */}
                <div className="text-[11px] text-[#B8B8B8] mt-2">
                  {n.author_membership_id === myMembershipId ? 'You' : 'A colleague'}
                  {' '}&middot; {formatWhen(n.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!nothingToNoteOn && (
        <>
        {/* A write that failed, said out loud. The console is not a surface. */}
        {lastFailure && (
          <p className="text-[12.5px] leading-relaxed mb-3" style={{ color: '#B5654A' }}>
            That note was not saved{lastFailure === 'not_on_your_list'
              ? ' — this title is not on your list.'
              : lastFailure === 'no_seat'
                ? ' — your account holds no seat on this list.'
                : '. Nothing was recorded; try again.'}
          </p>
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
        </>
        )}
      </div>
    </aside>
  )
}
