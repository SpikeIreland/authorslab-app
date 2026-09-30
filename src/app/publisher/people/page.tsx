'use client'

export const dynamic = 'force-dynamic'

/**
 * THE PEOPLE TAB — /publisher/people
 *
 * Build brief item ②. Who has access, to which imprints, and what they may do.
 *
 * ─── THE ENGINE IS `identity-billing`'S. THIS IS THE SURFACE ─────────────────
 * Invite, roles and imprint scoping are theirs (brief §3: surface it, do not
 * implement it). This page renders their four verbs and adds no rule of its
 * own — because two implementations of one capability is the pattern that has
 * cost this estate five defects.
 *
 * ─── TWO THINGS THAT COME FROM THE PAYLOAD, NOT FROM HERE ────────────────────
 * 1 · `role_disclosure` — "Roles describe scope today, not permission."
 *     `imprint_role` admits publisher/editor/viewer and NOTHING BRANCHES ON IT:
 *     an editor and a viewer have identical powers. A role name is a claim
 *     about a capability, so the word does not appear on this page without the
 *     sentence that keeps it honest. It arrives in the payload deliberately —
 *     a caveat living only in a surface is one refactor from being dropped.
 *
 * 2 · `invitations_are_delivered_by_email: false` — THIS ENGINE SENDS NO
 *     EMAIL. So the screen says "invite created" and never "invitation sent",
 *     and it says out loud that the person has to be told another way. Saying
 *     "sent" on the strength of a row is the fabricated-record family, in the
 *     past tense.
 *
 * ─── HIDE, NOT DISABLE — AND THE AMENDED TEST ────────────────────────────────
 * `viewer.can_manage_people` exists so the surface can HIDE management rather
 * than disable it. Where a control is shown disabled, the page says which
 * precondition is unmet and what can be done instead — the test is never
 * disabled-versus-absent, it is whether the user can tell why and what now.
 *
 * ─── THE STATE THIS WILL ACTUALLY BE WALKED IN ───────────────────────────────
 * There are ZERO org_memberships in the estate, and the engine resolves
 * identity from the caller's session. So this route answers 403 to everyone
 * today, including Paul. That is CORRECT — membership is what grants the read
 * — and it is the state this page was written for first.
 */

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/chrome/AppShell'
import { PublisherNav } from '../_components/PublisherNav'


interface SeatImprint {
  id: string
  name: string
  imprint_role: string | null
}

interface Seat {
  membership_id: string
  org_role: string
  status: string
  auth_user_id: string | null
  invited_email: string | null
  invited_at: string | null
  accepted_at: string | null
  imprints: SeatImprint[]
  scope_is_whole_org: boolean
}

interface Payload {
  organisation?: { id: string; name: string }
  viewer?: { membership_id: string | null; org_role: string; can_manage_people: boolean }
  seats?: Seat[]
  imprints?: { id: string; name: string }[]
  role_disclosure?: string
  invitations_are_delivered_by_email?: boolean
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  active: { bg: '#F0FDF4', fg: '#166534', border: '#BBF7D0', label: 'active' },
  invited: { bg: '#FFFBEB', fg: '#92400E', border: '#FDE68A', label: 'invited — not yet accepted' },
  suspended: { bg: '#FEF2F2', fg: '#991B1B', border: '#FECACA', label: 'suspended' },
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

function SeatRow({ seat }: { seat: Seat }) {
  const s = STATUS_STYLE[seat.status] ?? {
    bg: '#F8F8F7', fg: '#6B6B6B', border: '#E5E5E3', label: seat.status,
  }

  return (
    <div
      className="px-5 py-4"
      style={{ borderBottom: '1px solid #F0F0EE' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px]" style={{ color: 'var(--color-ink)' }}>
              {/* A seat that has not been accepted has no account and no name.
                  The invited address is the only true identifier there is. */}
              {seat.invited_email ?? 'Seat holder'}
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded"
              style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
            >
              {s.label}
            </span>
          </div>

          <div className="text-[12.5px] mt-1" style={{ color: 'var(--color-muted)' }}>
            {seat.org_role}
            {' · '}
            {seat.scope_is_whole_org ? (
              <>every imprint, by role</>
            ) : seat.imprints.length > 0 ? (
              <>
                {seat.imprints.map((i) => `${i.name} (${i.imprint_role ?? 'no role'})`).join(' · ')}
              </>
            ) : (
              /* Absence of scope is EMPTY scope, never universal scope —
                 identity-billing's rule, and the surface must not soften it
                 into something that looks like broad access. */
              <span style={{ color: '#92400E' }}>no imprints assigned — sees nothing</span>
            )}
          </div>

          <div className="text-[11.5px] mt-1" style={{ color: 'var(--color-muted)' }}>
            invited {formatWhen(seat.invited_at)}
            {seat.accepted_at ? <> · accepted {formatWhen(seat.accepted_at)}</> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PublisherPeoplePage() {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [noSeat, setNoSeat] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/publisher/people')
        if (res.status === 403) {
          // Not an error. The caller holds no seat, which is a fact about them
          // rather than a fault in the page.
          if (!cancelled) setNoSeat(true)
          return
        }
        if (!res.ok) throw new Error(`Unavailable (${res.status})`)
        const json = (await res.json()) as Payload
        if (!cancelled) setPayload(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const seats = payload?.seats ?? []

  return (
    <AppShell modeLabel="Publisher" firstName={payload?.organisation?.name}>
      <PublisherNav />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-100px)]">
        <div className="max-w-[860px] mx-auto px-6 py-10">

          <div className="mb-7">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              Your people
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {payload?.organisation?.name ?? '—'}
              {!loading && !noSeat && seats.length > 0 && (
                <> · {seats.length} {seats.length === 1 ? 'seat' : 'seats'}</>
              )}
            </p>
          </div>

          {loading && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
              Reading the seat list…
            </p>
          )}

          {error && (
            <div
              className="px-4 py-3 mb-4 rounded-md text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
            >
              {error}
            </div>
          )}

          {/* ── NO SEAT ─────────────────────────────────────────────────────
              The state everyone is in today. It is not a failure and must not
              read as one: the page explains what is true and what would change
              it, rather than showing an empty list that implies nobody else
              has access. */}
          {!loading && noSeat && (
            <div
              className="rounded-lg px-6 py-8"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[18px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                You do not hold a seat in a publisher organisation
              </p>
              <p className="text-[13.5px] max-w-[62ch]" style={{ color: 'var(--color-muted)' }}>
                Access to a publisher&rsquo;s people, imprints and titles comes
                from a membership of that organisation — not from an AuthorsLab
                account. Until an administrator issues you a seat, there is
                nothing here to show you, and showing you somebody else&rsquo;s
                list instead would be the wrong answer rather than a helpful one.
              </p>
            </div>
          )}

          {!loading && !noSeat && !error && payload && (
            <>
              <div className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E5E3' }}>
                {seats.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-[13.5px]" style={{ color: 'var(--color-muted)' }}>
                      No seats yet.
                    </p>
                  </div>
                ) : (
                  seats.map((s) => <SeatRow key={s.membership_id} seat={s} />)
                )}
              </div>

              {/* REQUIRED wherever roles are shown. From the payload. */}
              {payload.role_disclosure && (
                <p
                  className="text-[12.5px] mt-4 px-4 py-3 rounded-md"
                  style={{ background: '#FAFAF9', border: '1px solid #EFEFEC', color: '#6B6B6B' }}
                >
                  {payload.role_disclosure}
                </p>
              )}

              {/* Invitations are rows, not messages. Said before anyone
                  presses anything, not after. */}
              {payload.invitations_are_delivered_by_email === false && (
                <p className="text-[12.5px] mt-3" style={{ color: 'var(--color-muted)' }}>
                  Inviting someone here creates their seat. It does not email
                  them — you will need to tell them yourself, and they claim the
                  seat by signing in with the address it was issued to.
                </p>
              )}

              {/* Management is HIDDEN, not disabled, for anyone who cannot do
                  it — and absent for everyone until the invite form is built,
                  because a control that cannot write is worse than none. */}
              {payload.viewer?.can_manage_people && (
                <p className="text-[12.5px] mt-3" style={{ color: 'var(--color-muted)' }}>
                  You can issue and change seats. Doing it from this screen is
                  in build; until then we set them up for you.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
