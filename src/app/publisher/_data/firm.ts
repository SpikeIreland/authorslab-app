'use client'

/**
 * THE VIEWING FIRM — now a read, not a constant.
 *
 * ─── What was here ──────────────────────────────────────────────────────────
 *
 *   export const VIEWING_FIRM = 'Harrowgate House'
 *   export const VIEWING_FIRM_SLUG = 'harrowgate-house'
 *
 * with a comment promising: *"when publisher accounts land, this constant is
 * replaced by a read of the signed-in firm and nothing else on these pages
 * changes."* `identity-billing` reported on 2026-09-30 that the read returns an
 * identity for two live seats and commissioned it both directions. So the
 * promise is kept and the constants are gone.
 *
 * The slug is the more important of the two removals. It was not a label — it
 * was the TENANCY KEY, and the surfaces sent it to the API as `?org=`. A client
 * that names the house it wants to see is a client that can name a different
 * one. Both routes now read the caller's own membership and the parameter no
 * longer exists.
 *
 * ─── There is no fallback, and that is the point ─────────────────────────────
 *
 * This hook returns `null` for the firm until the read answers. It does NOT
 * return a placeholder name in the meantime, and nothing in this file knows a
 * publisher's name.
 *
 * A fallback here would be the exact defect this lane keeps finding: a claim
 * made before anyone can check it. `'Harrowgate House'` rendered while a read
 * is in flight is a surface telling a publisher which house they are looking
 * at before it knows — and if the read then fails, the page settles on a
 * confident wrong answer instead of an honest blank. The header simply has no
 * house name until there is one.
 */

import { useEffect, useState } from 'react'

export type PublisherFirmState =
  | { status: 'loading' }
  /** A resolved publisher identity. */
  | {
      status: 'ready'
      firmName: string
      firmSlug: string
      orgRole: 'owner' | 'admin' | 'member'
      scopeIsWholeOrg: boolean
      imprints: { id: string; name: string }[]
    }
  /** Signed in, but holding no active seat in any publisher organisation. */
  | { status: 'not-a-publisher' }
  /** Two active memberships and no org switcher — the resolver refuses to
   *  guess which house is being viewed, and so does this. */
  | { status: 'unresolved'; message: string }
  /** The read itself failed. Distinguished from `not-a-publisher` because
   *  "you have no seat" and "we could not find out" are different sentences
   *  and a surface must not print the first when the second is true. */
  | { status: 'error' }

export function usePublisherFirm(): PublisherFirmState {
  const [state, setState] = useState<PublisherFirmState>({ status: 'loading' })

  useEffect(() => {
    let live = true

    ;(async () => {
      try {
        const res = await fetch('/api/publisher/identity')

        if (res.status === 403) {
          if (live) setState({ status: 'not-a-publisher' })
          return
        }
        if (res.status === 409) {
          const j = await res.json().catch(() => null)
          if (live) {
            setState({
              status: 'unresolved',
              message:
                typeof j?.message === 'string'
                  ? j.message
                  : 'More than one organisation and no way to choose.',
            })
          }
          return
        }
        if (!res.ok) {
          if (live) setState({ status: 'error' })
          return
        }

        const j = await res.json()
        if (!live) return

        // Validate rather than trust the shape. A missing name must not render
        // as "undefined" in a header chip.
        const name = j?.organisation?.name
        const slug = j?.organisation?.slug
        if (typeof name !== 'string' || typeof slug !== 'string') {
          setState({ status: 'error' })
          return
        }

        setState({
          status: 'ready',
          firmName: name,
          firmSlug: slug,
          orgRole: j.viewer?.orgRole ?? 'member',
          scopeIsWholeOrg: Boolean(j.viewer?.scopeIsWholeOrg),
          imprints: Array.isArray(j.viewer?.imprints) ? j.viewer.imprints : [],
        })
      } catch {
        if (live) setState({ status: 'error' })
      }
    })()

    return () => {
      live = false
    }
  }, [])

  return state
}

/**
 * The house name, or `null` while it is unknown or unavailable.
 *
 * For the header chip, which has one job and no room to explain itself. A
 * surface that must DISTINGUISH the reasons — and the Lobby must — reads the
 * state above instead of this.
 */
export function useFirmName(): string | null {
  const state = usePublisherFirm()
  return state.status === 'ready' ? state.firmName : null
}
