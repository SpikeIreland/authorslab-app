'use client'

// THE PUBLISHING HUB — publisher shell, High Line demo (publishing lane).
//
// Brief (sysadmin RULING 2026-10-02 §6): Publishing Hub simulated; ONE platform
// only — KDP; R9 marker required. "The point is to show that a title can be
// routed to a channel, not to enumerate channels."
//
// ─── THE VERB TEST DECIDED THE WHOLE SURFACE ─────────────────────────────────
// Publisher-facing, the system may PREPARE, CHECK, RECORD, SURFACE, HAND OFF.
// It may not WRITE, EDIT, DESIGN, PUBLISH, DECIDE. So there is no "Publish to
// KDP" on this screen and there never will be: AuthorsLab prepares the
// submission and a person at the house publishes it. That is not a hedge to
// cover a missing integration — it is the positioning. A system that publishes
// on a house's behalf is replacing the person who does it today.
//
// ─── WHAT IS REAL AND WHAT IS NOT ────────────────────────────────────────────
// REAL: every readiness line is derived from a column this estate stores,
// through /api/publisher/projects/[id]/publishing — membership-gated with
// identity-billing's resolver, the same gate as cover intake. Nothing is
// hardcoded to look finished.
// NOT REAL: no control writes anything. Two writes a Publishing Hub would want
// have no substrate (named in the route's header, and couriered):
//   - a publisher-authorised write to publishing_progress.platforms
//   - an attributed handoff event — publisher_actions.station has no 'channel'
//     value, and 'route' is already the RIGHTS model, so reusing it would
//     corrupt the book page's confirmedRoute read.
// Per the affordance rule those controls are ABSENT, not disabled-with-an-
// apology. The surface says what is true and stops.
//
// MOUNTING. Owned surface-wise by the shell (`ux`), same contract design set:
//   <PublishingStation bookId={…} bookTitle={…} />
// It renders its own R9 marker so no mounting surface can forget it.
//
// R7: the noun is Books.

import { useEffect, useState } from 'react'
import SimulationMarker from '@/components/preview/SimulationMarker'

interface Readiness {
  title: boolean
  description: boolean
  categories: boolean
  keywords: boolean
  priced: boolean
  coverChosen: boolean
  interiorFile: boolean
  isbnDecided: boolean
  routedToKdp: boolean
}

interface Payload {
  book: { id: string; title: string | null }
  readiness: Readiness
  writable: boolean
  printInterior: 'present' | 'not_produced_yet'
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready'; data: Payload }
  // The three refusals kept distinct, because 403 is about the person and 503
  // is about us — a surface reports state, not intent (R5).
  | { phase: 'refused'; message: string }
  | { phase: 'unavailable'; message: string }

// Each line is a thing KDP asks for at upload, paired with the column that
// evidences it. `who` is load-bearing on a publisher surface: it says which
// desk the outstanding work sits on, and never implies the system will do it.
const CHECKS: Array<{
  key: keyof Readiness
  label: string
  who: string
}> = [
  { key: 'title', label: 'Title', who: 'Editorial' },
  { key: 'description', label: 'Book description', who: 'Editorial' },
  { key: 'categories', label: 'Categories', who: 'Editorial' },
  { key: 'keywords', label: 'Keywords', who: 'Marketing' },
  { key: 'priced', label: 'Price set', who: 'Sales' },
  { key: 'coverChosen', label: 'Cover approved', who: 'Design' },
  { key: 'interiorFile', label: 'Interior file prepared', who: 'Production' },
  { key: 'isbnDecided', label: 'ISBN route decided', who: 'Rights' },
]

export default function PublishingStation({
  bookId,
  bookTitle,
}: {
  bookId: string
  bookTitle?: string
}) {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!bookId) return
      try {
        const res = await fetch(`/api/publisher/projects/${bookId}/publishing`)
        if (cancelled) return
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { message?: string }
          const message =
            json.message ??
            (res.status === 403
              ? 'This book is not in this seat’s scope.'
              : res.status === 404
                ? 'That book could not be found.'
                : 'Publishing readiness could not be checked just now.')
          setState(
            res.status === 403 || res.status === 404 || res.status === 409
              ? { phase: 'refused', message }
              : { phase: 'unavailable', message }
          )
          return
        }
        const data = (await res.json()) as Payload
        if (!cancelled) setState({ phase: 'ready', data })
      } catch {
        if (!cancelled) {
          setState({
            phase: 'unavailable',
            message: 'Publishing readiness could not be checked just now.',
          })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [bookId])

  return (
    <div>
      <SimulationMarker detail="The readiness checks below read this book’s real record." />

      <div className="px-6 py-8 max-w-[760px]">
        <div className="text-[11px] tracking-[0.16em] uppercase text-[#8A8A8A]">
          Publishing
        </div>
        <h1
          className="text-[30px] leading-tight text-[#1A1A1A] mt-1 mb-2"
          style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
        >
          Amazon KDP
        </h1>
        <p className="text-[14px] leading-relaxed text-[#3F3F3F] mb-8">
          {bookTitle ? <><em>{bookTitle}</em> is routed to KDP. </> : null}
          AuthorsLab prepares the submission and checks it against what KDP asks
          for. Your team uploads it — we do not publish on the house’s behalf.
        </p>

        {state.phase === 'loading' && (
          <p className="text-[13px] text-[#8A8A8A]">Checking this book’s record…</p>
        )}

        {state.phase === 'refused' && (
          <p className="text-[14px] leading-relaxed text-[#3F3F3F]">{state.message}</p>
        )}

        {state.phase === 'unavailable' && (
          <p className="text-[14px] leading-relaxed text-[#8A5A2B]">{state.message}</p>
        )}

        {state.phase === 'ready' && <Ready data={state.data} />}
      </div>
    </div>
  )
}

function Ready({ data }: { data: Payload }) {
  const done = CHECKS.filter((c) => data.readiness[c.key]).length

  return (
    <>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          What KDP asks for
        </div>
        <div className="text-[12px] text-[#8A8A8A]">
          {done} of {CHECKS.length} in place
        </div>
      </div>

      <ul className="border border-[#E8E5E0] rounded-[4px] bg-white divide-y divide-[#E8E5E0] mb-8">
        {CHECKS.map((c) => {
          const ok = data.readiness[c.key]
          return (
            <li key={c.key} className="flex items-center gap-3 px-4 py-3">
              {/* publisher's station marks, reused rather than re-minted: a
                  filled mark means a person or the system did the thing, and an
                  empty one means it has not been done. No em-dash in a green
                  cell — that was the mark that claimed work nobody had done. */}
              <span
                aria-hidden
                className={`w-[14px] h-[14px] rounded-full flex-shrink-0 border ${
                  ok ? 'bg-[#2E4A3C] border-[#2E4A3C]' : 'bg-white border-[#B8B8B8]'
                }`}
              />
              <span className="text-[14px] text-[#1A1A1A] flex-1 min-w-0">{c.label}</span>
              <span className="text-[12px] text-[#8A8A8A] whitespace-nowrap">
                {ok ? 'In place' : `Outstanding · ${c.who}`}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Under-claim in the document, over-deliver at access. The print
          interior is the one KDP requirement we cannot evidence at all, and
          saying so here is cheaper than an editor finding it at upload. */}
      {data.printInterior === 'not_produced_yet' && (
        <div className="border border-[#E8E5E0] bg-[#FAFAF8] rounded-[4px] p-4 mb-6">
          <div className="text-[13px] font-medium text-[#1A1A1A] mb-1">
            Print interior — not produced yet
          </div>
          <p className="text-[13px] leading-relaxed text-[#3F3F3F]">
            A paperback needs a typeset interior PDF at the book’s trim size.
            Our print branch does not produce a usable one yet, so we are not
            offering one. The ebook interior above is ready.
          </p>
        </div>
      )}

      {/* An affordance is a claim. There is no handoff control because there is
          nothing behind one: no publisher-authorised write to the channel
          column, and no attributed handoff event in publisher_actions. The
          absence is deliberate and this paragraph is a statement of state, not
          an apology for a button. */}
      {!data.writable && (
        <p className="text-[13px] leading-relaxed text-[#8A8A8A]">
          This view reads the book’s record; it does not change it. Recording a
          channel handoff against a book, attributed to the person who made it,
          is the next piece of work on this station.
        </p>
      )}
    </>
  )
}
