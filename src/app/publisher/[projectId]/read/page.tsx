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
import {
  StudioConversation,
  type ConversationEntry,
} from '@/components/studio/StudioConversation'
import { usePublisherChat } from '../../_data/usePublisherChat'

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

  /* ─── THE CHAT, NOW MOUNTED (sysadmin RULED 2026-10-09) ──────────────────
   * Journeyless: the route passes no journey_id at all. Both of my questions
   * were answered — the field is optional by construction, and whether a
   * publisher-originated chat should create a journey is ruled NOT YET,
   * because a journey has an actor and a house's conversation about someone
   * else's book raises whose journey it is. No journey beats a journey that
   * claims the wrong actor. */
  const { turns, thinking, failure: chatFailure, ask } = usePublisherChat(projectId)

  const chatEntries = useMemo<ConversationEntry[]>(
    () =>
      turns.map((t) => ({
        id: t.id,
        body: t.body,
        // 'Alex' appears ONLY on a reply the service actually returned. A
        // failure never becomes an entry, so no byline can be attached to
        // something no editor said.
        byline: t.from === 'house' ? 'You' : 'Alex',
        when: formatWhen(t.at),
      })),
    [turns]
  )

  const askAlex = useCallback(
    async (message: string) => {
      /* NO manuscriptTitle. This room does not hold the book's title — its
       * spine endpoint returns chapters, not the manuscript — and the chat
       * workflow fetches manuscript context from the id it is given. Sending
       * an empty string, or the chapter's title standing in for the book's,
       * would be telling the service something untrue to fill a field. The
       * route omits the key entirely when it is absent. */
      await ask(message, {
        chapterNumber: current,
        chapterTitle: chapter?.title ?? '',
        chapterContent: chapter?.content ?? '',
      })
    },
    [ask, current, chapter]
  )

  /* The shared column's entry shape. The byline says the one thing the row
   * supports — whether the note is the viewer's own — because C1 stores a
   * membership id and no label. `null` would render no byline at all; here we
   * do have a fact, so it is stated. */
  const noteEntries = useMemo<ConversationEntry[]>(() => {
    if (notesState.status !== 'ready') return []
    return notesForChapter.map((n) => ({
      id: n.id,
      body: n.body,
      /* "You" for your own; the resolved name where the house may show one;
       * "A colleague" where it may not. Three states, and the third is an
       * honest absence rather than a stand-in. */
      byline:
        n.author_membership_id === notesState.myMembershipId
          ? 'You'
          : n.authorName ?? 'A colleague',
      when: formatWhen(n.created_at),
    }))
  }, [notesState, notesForChapter])

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
        {/* ─── THE CONVERSATION COLUMN (ux SPEC §2) ───────────────────────
            One column, stacked tools. Notes is the first caller of the shared
            component and injects its own send path; the chat is the second and
            is NOT MOUNTED — see the header note below. */}
        {notesAvailable && (
          <aside className="border-l border-[#E8E5E0] bg-white/60 lg:max-h-[calc(100vh-61px)] lg:overflow-y-auto">
            <StudioConversation
              audience="publisher"
              title="Your notes"
              subtitle={chapter?.title ? `on ${chapter.title}` : 'on this title'}
              entries={noteEntries}
              emptyText={
                spine !== null && spine.length === 0
                  ? 'Notes attach to a chapter or to the book. There is no manuscript here yet.'
                  : current === null
                    ? 'Nothing yet. A note left with no chapter selected sits against the book.'
                    : 'Nothing yet. Notes you leave here sit against this chapter.'
              }
              composer={
                /* NOT MOUNTED where there is nothing to note on. A title with
                   no manuscript has no chapter and no book text to annotate;
                   everywhere else a note is possible, including with no
                   chapter selected, because C1 takes a null chapter. */
                spine !== null && spine.length === 0
                  ? null
                  : {
                      placeholder:
                        current === null
                          ? 'A note on this book…'
                          : 'A note on this chapter…',
                      submitLabel: 'Add note',
                      onSend: addNote,
                      busy: saving,
                    }
              }
              failure={
                lastFailure
                  ? lastFailure === 'not_on_your_list'
                    ? 'That note was not saved — this title is not on your list.'
                    : lastFailure === 'no_seat'
                      ? 'That note was not saved — your account holds no seat on this list.'
                      : 'That note was not saved. Nothing was recorded; try again.'
                  : null
              }
            />

            {/* ─── THE CHAT — second tool, same column (ux SPEC §2) ────────
                Alex only. My standing condition, which `ux` has now RULED and
                enforced by absence: no Sam or Jordan chat mounts until 3.3 and
                4.3 carry the parameter. Not disabled — absent. */}
            <StudioConversation
              audience="publisher"
              title="Ask Alex"
              subtitle={
                chapter?.title
                  ? `about ${chapter.title}`
                  : 'about this manuscript'
              }
              entries={chatEntries}
              emptyText="Alex has read this manuscript. Ask about the structural read, and the answer discusses the author's work rather than addressing its writer."
              thinking={thinking}
              composer={{
                placeholder: 'Ask Alex about this manuscript…',
                submitLabel: 'Ask',
                onSend: askAlex,
                busy: thinking,
              }}
              failure={chatFailure}
            />

            {/* IN-SESSION, AND SAID SO. There is no publisher chat table, so
                these turns are gone on reload — the same honesty the notes
                column carried for a fortnight before C1 gave it a substrate.
                Stated on the surface rather than discovered by a publisher who
                expected to find the conversation again. */}
            <p className="px-5 pb-5 text-[11.5px] leading-relaxed text-[#8A8A8A]">
              This conversation is not kept. Your notes above are.
            </p>
          </aside>
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

