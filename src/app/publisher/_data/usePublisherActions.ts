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
 */

import { useCallback, useEffect, useState } from 'react'
import { VIEWING_FIRM } from './firm'

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
  station: 'cover' | 'route' | 'manuscript' | 'marketing'
  kind: PublisherAction['kind']
  body?: string
  chapterNumber?: number | null
  visibleToAuthor?: boolean
}

export function usePublisherActions(projectId: string) {
  const [actions, setActions] = useState<PublisherAction[]>([])
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/actions`)
        if (cancelled) return
        if (!res.ok) {
          setAvailable(false)
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
      try {
        const res = await fetch(`/api/publisher/projects/${projectId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...input, actorFirm: VIEWING_FIRM }),
        })
        if (!res.ok) {
          // A write that did not land must not look like one that did.
          if (res.status === 503) setAvailable(false)
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

  return { actions, available, saving, record }
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
