'use client'

/**
 * THE PUBLISHER OVERVIEW — A4, the rebuild.
 *
 * Paul, 2026-10-06: "I want to go to an Overview page, but not the one that we
 * currently have because it is terrible. The Author's version of the Overview
 * is much better because it contains things like the collateral list."
 *
 * The author Overview is four components. Three cross; one does not:
 *
 *   BookObjectPanel     -> TitleObjectPanel   cover + the facts
 *   ShelfDocuments      -> CollateralShelf    THE COLLATERAL LIST
 *   JourneyStepper      -> StationLadder      where it is, station by station
 *   EditorGreetingCard  -> HouseStateCard     (replaced — see that file)
 *
 * Layout mirrors the author's two columns on purpose, so the two products read
 * as one product seen from two chairs — the same reasoning that put the
 * reading room's spine on the left.
 *
 * Every refusal below is reported. A control or a surface that fails silently
 * is worse than one with nothing behind it, and this page has now been the
 * place that defect appeared twice.
 */

import { useEffect, useState } from 'react'
import { TitleObjectPanel } from './TitleObjectPanel'
import { StationLadder } from './StationLadder'
import { HouseStateCard } from './HouseStateCard'
import type { PublisherOverviewPayload } from '@/app/api/publisher/projects/[id]/overview/route'

type State =
  | { phase: 'loading' }
  | { phase: 'ready'; payload: PublisherOverviewPayload }
  | { phase: 'refused'; status: number; kind: string }

export function PublisherOverview({ projectId }: { projectId: string }) {
  const [state, setState] = useState<State>({ phase: 'loading' })

  useEffect(() => {
    let live = true
    async function load() {
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/overview`, {
          cache: 'no-store',
        })
        if (!live) return
        if (!res.ok) {
          let kind = 'unknown'
          try {
            const body = await res.json()
            kind = typeof body?.error === 'string' ? body.error : 'unknown'
          } catch { /* a non-JSON refusal is still a refusal */ }
          setState({ phase: 'refused', status: res.status, kind })
          return
        }
        const payload = (await res.json()) as PublisherOverviewPayload
        setState({ phase: 'ready', payload })
      } catch {
        if (live) setState({ phase: 'refused', status: 0, kind: 'network' })
      }
    }
    load()
    return () => { live = false }
  }, [projectId])

  if (state.phase === 'loading') {
    return (
      <div className="max-w-[1200px] mx-auto px-8 py-20 flex justify-center">
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{ borderColor: '#E8E5E0', borderTopColor: '#1E3A5F' }}
          role="status"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (state.phase === 'refused') {
    return (
      <div className="max-w-[720px] mx-auto px-8 py-20">
        <h1 className="font-serif text-[24px] mb-3" style={{ color: '#1A1A1A' }}>
          {refusalHeadline(state.status, state.kind)}
        </h1>
        <p className="text-[14px] leading-relaxed" style={{ color: '#6B6B6B' }}>
          {refusalBody(state.status, state.kind)}
        </p>
      </div>
    )
  }

  const { payload } = state

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-[30px] leading-tight" style={{ color: '#1A1A1A' }}>
          {payload.title.title}
        </h1>
        {payload.title.authorName && (
          <p className="text-[14px] mt-1" style={{ color: '#6B6B6B' }}>
            {payload.title.authorName}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-10 items-start">
        <TitleObjectPanel payload={payload} />
        <div className="flex flex-col gap-8">
          <HouseStateCard payload={payload} />
          <StationLadder stations={payload.stations} />
        </div>
      </div>
    </div>
  )
}

/**
 * A 404 here means EITHER no such title OR a title on an imprint this seat
 * does not hold — the gate returns the same thing for both on purpose, so the
 * copy must not resolve the ambiguity it was written to preserve.
 *
 * A 503 is OURS. It must never read as "you have no access", which is the
 * conflation identity-billing's discriminated result exists to prevent.
 */
function refusalHeadline(status: number, kind: string): string {
  if (status === 404) return 'Not on your list'
  if (status === 403) return 'No seat on this list'
  if (status === 503 || kind === 'unavailable') return 'We could not check your access'
  if (status === 0) return 'We could not reach the server'
  return 'This title could not be opened'
}

function refusalBody(status: number, kind: string): string {
  if (status === 404) {
    return 'Either this title does not exist, or it sits on an imprint your seat does not cover. We do not distinguish between those two from here.'
  }
  if (status === 403) {
    return 'Your account is signed in but holds no seat on a publisher list. Whoever set up your house can add one.'
  }
  if (status === 503 || kind === 'unavailable') {
    return 'This is a fault on our side, not a statement about your access. Nothing about your permissions has changed — try again shortly.'
  }
  if (status === 0) {
    return 'The request did not complete. Your connection may have dropped.'
  }
  return `The server refused the request (${status}${kind !== 'unknown' ? `, ${kind}` : ''}).`
}
