'use client'

/**
 * PUBLISHER NOTES — C1's table, read and written DIRECTLY under the caller's
 * own session.
 *
 * ─── Why this one is not a service-role route like the rest of the lane ─────
 *
 * Every other publisher read in this product goes through the service role
 * with `gatePublisherManuscript()` in front of it, because the RLS on
 * `manuscripts` and `chapters` is author-centric: a publisher's session
 * satisfies none of it, so a session-scoped read returns nothing.
 *
 * `publisher_notes` is the opposite by design. Read at source 2026-10-09:
 *
 *   SELECT  can_work_manuscript_as_house(manuscript_id)
 *   INSERT  can_work_manuscript_as_house(manuscript_id)
 *             AND author_membership_id belongs to auth.uid() AND status='active'
 *   UPDATE  house scope AND own membership
 *   DELETE  house scope AND own membership
 *
 * `can_work_manuscript_as_house` is the house leg ALONE — no author leg and
 * no `is_admin()` either — so a publisher's session satisfies it exactly and
 * the author of the book does not, which is the whole point of sysadmin
 * declining to reuse `can_read_manuscript()`.
 *
 * ─── AND WHY THIS HOOK STILL GOES THROUGH A ROUTE ──────────────────────────
 *
 * I began writing the direct client insert and stopped. It would have had the
 * BROWSER supply `author_membership_id` — a caller naming the actor of its own
 * write, which is the `actor_firm` defect exactly — with the INSERT policy's
 * `EXISTS` clause as the only thing between us and fabricated attribution.
 * One clause relaxed in a later migration and that is live with no code
 * change to notice it.
 *
 * It also could not have worked as written: `/api/publisher/identity` does
 * **not** return `membership_id` (measured — its payload is organisation +
 * viewer + imprints), so a client write needed that field added to a
 * published payload for one consumer.
 *
 * So the write goes through `/api/publisher/projects/[id]/notes`, which
 * derives the actor server-side AND uses the user's session client so C1's
 * policies are still the ones doing the enforcing. The client cannot name the
 * actor even wrongly.
 *
 * ─── STATES, KEPT APART ─────────────────────────────────────────────────────
 *
 * `unavailable` is NOT `empty`. A publisher with no seat, or a failed
 * identity read, must not render as "no notes yet" — that is a claim about
 * the book made out of a fact about us, and ux's §5 rule follows from it:
 * where notes cannot be recorded the tool does not mount at all.
 */

import { useCallback, useEffect, useState } from 'react'

export interface PublisherNote {
  id: string
  /** NULL is a real answer: a note against the book, not against a chapter. */
  chapter_number: number | null
  body: string
  author_membership_id: string
  created_at: string
}

export type NotesState =
  | { status: 'loading' }
  | { status: 'ready'; notes: PublisherNote[]; myMembershipId: string }
  /** No seat, or we could not establish one. The tool must not mount. */
  | { status: 'unavailable'; reason: string }

export function usePublisherNotes(manuscriptId: string) {
  const [state, setState] = useState<NotesState>({ status: 'loading' })
  const [saving, setSaving] = useState(false)
  const [lastFailure, setLastFailure] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/publisher/projects/${manuscriptId}/notes`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        // 403 = no seat. 503 = our database. Both mean the tool must not
        // mount, and NEITHER means "no notes yet" — rendering an empty list
        // here would be a claim about the book made from a fact about us.
        setState({
          status: 'unavailable',
          reason: res.status === 403 ? 'no_seat' : `notes_${res.status}`,
        })
        return
      }
      const json = (await res.json()) as {
        notes?: PublisherNote[]
        myMembershipId?: string
      }
      if (!json.myMembershipId) {
        setState({ status: 'unavailable', reason: 'identity_incomplete' })
        return
      }
      setState({
        status: 'ready',
        notes: json.notes ?? [],
        myMembershipId: json.myMembershipId,
      })
    } catch (err) {
      setState({
        status: 'unavailable',
        reason: err instanceof Error ? err.message : 'unknown',
      })
    }
  }, [manuscriptId])

  useEffect(() => { void load() }, [load])

  /**
   * Add a note. `chapterNumber` null is deliberate and meaningful — a note on
   * the book rather than on a chapter — so it is passed through rather than
   * coerced to a number.
   *
   * Returns the failure, never swallows it. This surface has produced the
   * silent-swallow defect twice: a control that fails quietly is worse than
   * one with nothing behind it.
   */
  const addNote = useCallback(
    async (body: string, chapterNumber: number | null): Promise<{ ok: true } | { ok: false; reason: string }> => {
      if (state.status !== 'ready') return { ok: false, reason: 'not_ready' }
      const trimmed = body.trim()
      if (!trimmed) return { ok: false, reason: 'empty' }

      setSaving(true)
      setLastFailure(null)
      try {
        const res = await fetch(`/api/publisher/projects/${manuscriptId}/notes`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          // `chapterNumber` is sent as null DELIBERATELY for a note on the
          // book. The route refuses `undefined` rather than treating a
          // forgotten field as "the book".
          body: JSON.stringify({ body: trimmed, chapterNumber }),
        })
        if (!res.ok) {
          let reason = `http_${res.status}`
          try {
            const err = (await res.json()) as { error?: string }
            if (typeof err.error === 'string') reason = err.error
          } catch { /* a non-JSON refusal is still a refusal */ }
          setLastFailure(reason)
          return { ok: false, reason }
        }
        await load()
        return { ok: true }
      } finally {
        setSaving(false)
      }
    },
    [state, manuscriptId, load]
  )

  return { state, addNote, saving, lastFailure, reload: load }
}
