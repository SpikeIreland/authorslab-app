'use client'

/**
 * PUBLISHER ACTIONS — the hook every control on this surface goes through.
 *
 * sysadmin's 2026-09-24 ruling: an affordance is a claim. A control that
 * offers an act asserts the act happens; if the substrate is missing the
 * control is not shipped. So this hook's most important return value is
 * `available` — and every caller must HIDE its controls when it is false,
 * not disable them, and not caption them with an apology.
 *
 * `available` is false until sysadmin applies the publisher_actions migration
 * (couriered 2026-09-24). Nothing here needs changing when it lands.
 *
 * ─── `lastFailure`, and why it belongs HERE rather than in each caller ──────
 *
 * Added 2026-10-01, under `sysadmin`'s R5 — *a surface reports state, not
 * intent* — after checking my own surfaces against it and finding two failures
 * of exactly that kind:
 *
 *   · `Confirm route` called `record()` and DISCARDED the return value. A
 *     refused write re-enabled the button, said nothing, and left the
 *     confirmation line absent. The user clicks again.
 *   · the Communications composer did `if (ok) setDraft('')` — it kept the
 *     draft, which is right, and told the user nothing, which is not.
 *
 * I had already fixed this exact silent swallow once, in the reading room's
 * note composer, and it survived in two other places. **That is the evidence
 * that the first fix was local where it needed to be structural.** So the
 * failure is now held by the hook every control goes through: a caller cannot
 * write a new control that fails silently without ignoring a value that is
 * sitting in front of it, and the three refusals the routes now distinguish
 * (no seat, not your book, could not check) arrive as three sentences rather
 * than as one absent reaction.
 *
 * A control that fails silently is worse than a control with nothing behind
 * it: the second is honest about itself and the first is not.
 */

import { useCallback, useEffect, useState } from 'react'

export interface PublisherAction {
  id: string
  station: string
  chapter_number: number | null
  kind: 'approved' | 'revisions_requested' | 'note' | 'route_confirmed'
  body: string | null
  actor_firm: string
  visible_to_author: boolean
  created_at: string
}

export interface RecordInput {
  /** The ten evidenced stations — see the route's note. `marketing` is the
   *  EDITING PHASE; the portal's marketing section is `marketing_plan`. */
  station:
    | 'developmental'
    | 'line_editing'
    | 'copy_editing'
    | 'publishing'
    | 'marketing'
    | 'cover'
    | 'route'
    | 'manuscript'
    | 'marketing_plan'
    | 'channel'
  kind: PublisherAction['kind']
  body?: string
  chapterNumber?: number | null
  visibleToAuthor?: boolean
}

export function usePublisherActions(projectId: string) {
  const [actions, setActions] = useState<PublisherAction[]>([])
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastFailure, setLastFailure] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/actions`)
        if (cancelled) return
        if (!res.ok) {
          setAvailable(false)
          // A 503 means we could not CHECK the seat. The controls are hidden
          // either way -- hiding on an unknown is the conservative direction
          // -- but the surface must be able to say why they are not there
          // rather than leave a reader to conclude the feature is missing.
          if (res.status === 503) {
            setLastFailure(
              'Could not check your seat just now, so nothing is offered here. This is our end, not yours.'
            )
          }
          return
        }
        const json = (await res.json()) as {
          available?: boolean
          actions?: PublisherAction[]
        }
        if (cancelled) return
        setAvailable(Boolean(json.available))
        setActions(json.actions ?? [])
      } catch {
        if (!cancelled) setAvailable(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const record = useCallback(
    async (input: RecordInput): Promise<boolean> => {
      if (!projectId || available !== true) return false
      setSaving(true)
      // Cleared on every attempt, so a stale sentence can never sit under a
      // control that has since succeeded.
      setLastFailure(null)
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // NO `actorFirm`. It used to be sent from here, and an attribution
          // the browser supplies is an attribution the browser chooses. The
          // route reads the caller's own membership and records that.
          body: JSON.stringify(input),
        })
        if (!res.ok) {
          // A write that did not land must not look like one that did -- and
          // must not look like nothing happened either. Each status is a
          // different sentence, and the one that must never be guessed is
          // 503: it says nothing about this person's access.
          if (res.status === 503) setAvailable(false)
          setLastFailure(
            res.status === 403
              ? 'Your seat no longer allows this. Signing in again should restore it.'
              : res.status === 404
                ? 'This book is not on your list, so nothing was recorded against it.'
                : res.status === 409
                  ? 'You hold a seat in more than one house and there is no way yet to choose between them, so nothing was recorded.'
                  : res.status === 503
                    ? 'Could not check your seat just now, so nothing was recorded. This is our end, not yours.'
                    : 'That was not recorded. Nothing has changed against this book.'
          )
          setSaving(false)
          return false
        }
        const json = (await res.json()) as { action?: PublisherAction }
        if (json.action) setActions((prev) => [...prev, json.action as PublisherAction])
        setSaving(false)
        return true
      } catch {
        setSaving(false)
        return false
      }
    },
    [projectId, available]
  )

  return { actions, available, saving, record, lastFailure }
}

/** Latest decision at a station, derived from the append-only log. */
export function decisionAt(
  actions: PublisherAction[],
  station: string
): 'approved' | 'revisions_requested' | null {
  for (let i = actions.length - 1; i >= 0; i--) {
    const a = actions[i]
    if (a.station !== station) continue
    if (a.kind === 'approved' || a.kind === 'revisions_requested') return a.kind
  }
  return null
}

export function notesAt(
  actions: PublisherAction[],
  station: string,
  chapterNumber?: number | null
): PublisherAction[] {
  return actions.filter(
    (a) =>
      a.kind === 'note' &&
      a.station === station &&
      (chapterNumber === undefined || a.chapter_number === chapterNumber)
  )
}
