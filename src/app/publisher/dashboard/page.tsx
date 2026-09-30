'use client'

export const dynamic = 'force-dynamic'

/**
 * THE DASHBOARD — /publisher/dashboard
 *
 * Build brief item ③, 2026-09-30. Paul: *"a simple visual image of the
 * dashboard could tell a story by itself."* So this is the whole list against
 * the seven stations, in one picture, legible from across a room.
 *
 * The Lobby answers "which book is going to slip". This answers the question
 * before it — "where is everything?" — and it answers it without a sentence.
 *
 * ─── NO NEW MECHANICS ────────────────────────────────────────────────────────
 * Every value here comes from `/api/publisher/lobby`, which the Lobby already
 * uses. This is presentation over data that is already derived and already
 * tested (18/18, eight negative controls). A second derivation of the same
 * facts is how two surfaces start disagreeing, and this estate has paid for
 * that five times.
 *
 * ─── THE RULES IT IS JUDGED BY ───────────────────────────────────────────────
 * From the brief, and each one is a thing the surface must never do:
 *
 *   Stations      complete only by WHAT completed it — the system if it ran,
 *                 a person if they did. Unknown is shown as unknown.
 *   Movement      days since a STATION MOVED. Never since a row was touched.
 *   Waiting on    who, INCLUDING when it is them. A publisher-side gate left
 *                 open is the most expensive invisible thing on a list.
 *   Target date   where set; "no target date set" where not. NEVER on time.
 *   Sort          by attention, never alphabetically.
 *
 * ─── BOTH STATES ─────────────────────────────────────────────────────────────
 * Nine defects were found this week and every one lived in the empty case, so
 * this was written empty-first and opened in both.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/chrome/AppShell'
import { PublisherNav } from '../_components/PublisherNav'


type Risk = 'overdue' | 'at-risk' | 'stalled' | 'moving' | 'not-started' | 'handed-off'

interface StationCell {
  key: string
  name: string
  state: 'complete' | 'in-progress' | 'not-started'
  completedBy: 'system' | 'human' | null
  /** Who recorded it, where the estate captured that. Null on every row
   *  predating 2026-09-30 — the actor columns were applied and deliberately
   *  NOT backfilled, so a null here means "not recorded" and is shown as
   *  "by hand" rather than as a name nobody wrote down. */
  completedByName: string | null
  operator: string | null
}

interface LobbyTitle {
  manuscriptId: string
  title: string
  authorName: string | null
  imprintName: string | null
  currentStationName: string | null
  gateOwner: 'author' | 'publisher' | null
  daysSinceActivity: number | null
  handoffDate: string | null
  publicationDate: string | null
  risk: Risk
  stations: StationCell[]
}

interface Payload {
  organisation?: { name: string }
  imprints?: { id: string; name: string }[]
  titles?: LobbyTitle[]
}

// ─── 1. Station marks ─────────────────────────────────────────────────────────
// Three states, and a complete station additionally says WHO. The distinction
// between "the machine ran this" and "a person recorded it" is the authority
// model made visible, and it is the whole argument for level 1 being a real
// product rather than a crippled one.

function StationMark({ cell }: { cell: StationCell }) {
  const base =
    'w-full h-8 rounded-[3px] flex items-center justify-center text-[10px] font-medium'

  if (cell.state === 'complete') {
    // THREE kinds of complete, and they must not share a mark.
    //
    // Found on the live surface: a structural station (Manuscript, Handoff)
    // has no `completedBy` — nobody "runs" a submission — so it rendered as a
    // green box containing an em-dash. Green means "completed by the system"
    // in this page's own key, so the cell was both claiming the wrong thing
    // and showing a character that reads as missing data. On the surface that
    // is meant to be the most finished thing we own.
    if (cell.completedBy === null) {
      return (
        <div
          className={base}
          style={{ background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
          title={`${cell.name} — reached`}
        >
          reached
        </div>
      )
    }
    const byPerson = cell.completedBy === 'human'
    return (
      <div
        className={base}
        style={
          byPerson
            ? { background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' }
            : { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }
        }
        title={
          byPerson
            ? cell.completedByName
              ? `${cell.name} — recorded by ${cell.completedByName}`
              : `${cell.name} — recorded by hand (no name captured)`
            : `${cell.name} — completed by the system`
        }
      >
        {/* The mark stays "by hand" even when a name is known: it is 24px of
            cell and a name does not fit in it. The name is in the title, which
            is where it can be read without crowding out the distinction the
            mark exists to make. And where no name was captured the tooltip
            SAYS so, rather than leaving the reader to wonder whether a person
            with no name recorded it. */}
        {byPerson ? 'by hand' : 'done'}
      </div>
    )
  }

  if (cell.state === 'in-progress') {
    return (
      <div
        className={base}
        style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}
        title={`${cell.name}${cell.operator ? ` — ${cell.operator}` : ''}`}
      >
        {cell.operator ?? 'running'}
      </div>
    )
  }

  return (
    <div
      className={base}
      style={{ background: '#FAFAF9', color: '#C4C4C0', border: '1px solid #EFEFEC' }}
      title={`${cell.name} — not started`}
    />
  )
}

const RISK_DOT: Record<Risk, string> = {
  overdue: '#B91C1C',
  'at-risk': '#C2410C',
  stalled: '#A16207',
  moving: '#15803D',
  'not-started': '#A3A3A3',
  'handed-off': '#6D28D9',
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

// ─── 2. The page ──────────────────────────────────────────────────────────────

export default function PublisherDashboardPage() {
  const router = useRouter()
  const [payload, setPayload] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<{ heading: string; body: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/publisher/lobby')
        // The caller's own seat decides which house this is, so both of these
        // are answers rather than failures — see the Lobby's note.
        if (res.status === 403) {
          if (!cancelled) {
            setRefusal({
              heading: 'You do not hold a seat in a publisher organisation',
              body:
                'This page belongs to one house, and which house it is comes from ' +
                'your own seat. Your account has no active seat, so there is nothing ' +
                'here to show you — and showing you another house instead would be ' +
                'the wrong answer rather than a helpful one.',
            })
          }
          return
        }
        if (res.status === 409) {
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              heading: 'Which house are you looking at?',
              body:
                typeof j?.message === 'string'
                  ? j.message
                  : 'You hold a seat in more than one house and there is no way yet to choose between them.',
            })
          }
          return
        }
        if (!res.ok) throw new Error(`Dashboard unavailable (${res.status})`)
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

  const titles = payload?.titles ?? []
  const stationNames = titles[0]?.stations.map((s) => s.name) ?? []

  // Counted, never estimated. Each number is the length of a filtered list.
  const tally = useMemo(() => {
    const needsAttention = titles.filter(
      (t) => t.risk === 'overdue' || t.risk === 'at-risk' || t.risk === 'stalled'
    ).length
    const waitingOnYou = titles.filter((t) => t.gateOwner === 'publisher' && t.risk !== 'handed-off').length
    const handedOff = titles.filter((t) => t.risk === 'handed-off').length
    const dated = titles.filter((t) => t.handoffDate !== null).length
    return { needsAttention, waitingOnYou, handedOff, dated }
  }, [titles])

  return (
    <AppShell modeLabel="Publisher" firstName={payload?.organisation?.name}>
      <PublisherNav />
      <div className="flex-1 overflow-y-auto h-[calc(100vh-100px)]">
        <div className="max-w-[1200px] mx-auto px-6 py-10">

          <div className="mb-7">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              Where everything is
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {payload?.organisation?.name ?? '—'}
              {!loading && titles.length > 0 && (
                <> · {titles.length} {titles.length === 1 ? 'title' : 'titles'} across the seven stations</>
              )}
            </p>
          </div>

          {loading && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
              Reading the list…
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

          {/* A REFUSAL IS NOT A FAULT, so it is not drawn as one. Red means
              something is broken; "you hold no seat here" is the estate
              working. The Lobby carries the long form of this note. */}
          {refusal && (
            <div
              className="rounded-lg px-6 py-8 mb-4"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[17px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                {refusal.heading}
              </p>
              <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                {refusal.body}
              </p>
            </div>
          )}


          {/* ── THE EMPTY STATE ──────────────────────────────────────────────
              Written first, deliberately. A dashboard with no titles must not
              report zeroes — "0 at risk" is a claim about a list we do not
              have. It describes the instrument instead. */}
          {!loading && !error && titles.length === 0 && (
            <div
              className="rounded-lg px-6 py-10 text-center"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[18px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                Nothing on the line yet
              </p>
              <p className="text-[13.5px] max-w-lg mx-auto" style={{ color: 'var(--color-muted)' }}>
                When a book joins one of your imprints it appears here as a row,
                and each of the seven stations fills in as it is completed —
                marked by the system where it ran, and by name where one of your
                people recorded it.
              </p>
            </div>
          )}

          {!loading && !error && titles.length > 0 && (
            <>
              {/* Four counts. Each is the length of a list, not an estimate. */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                {[
                  { label: 'Need attention', value: tally.needsAttention, tone: '#B91C1C' },
                  { label: 'Waiting on you', value: tally.waitingOnYou, tone: '#C2410C' },
                  { label: 'Handed off', value: tally.handedOff, tone: '#6D28D9' },
                  { label: 'With a target date', value: `${tally.dated} of ${titles.length}`, tone: '#3F3F3F' },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg px-4 py-3"
                    style={{ background: '#FFFFFF', border: '1px solid #E5E5E3' }}
                  >
                    <div className="text-[22px] leading-none mb-1" style={{ color: c.tone, fontFamily: 'var(--font-serif)' }}>
                      {c.value}
                    </div>
                    <div className="text-[11.5px]" style={{ color: 'var(--color-muted)' }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* ── THE WALL CHART ──────────────────────────────────────────── */}
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E5E3', background: '#FFFFFF' }}>
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)', borderBottom: '1px solid #E5E5E3' }}>
                        Title
                      </th>
                      {stationNames.map((n) => (
                        <th
                          key={n}
                          className="px-1.5 py-3 text-[10px] uppercase tracking-wide font-medium text-center"
                          style={{ color: 'var(--color-muted)', borderBottom: '1px solid #E5E5E3', width: 84 }}
                        >
                          {n}
                        </th>
                      ))}
                      <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-muted)', borderBottom: '1px solid #E5E5E3' }}>
                        Handoff
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {titles.map((t) => (
                      <tr
                        key={t.manuscriptId}
                        onClick={() => router.push(`/publisher/${t.manuscriptId}`)}
                        className="cursor-pointer hover:bg-[#FAFAF9]"
                      >
                        <td className="px-4 py-2.5 align-middle" style={{ borderBottom: '1px solid #F0F0EE' }}>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: RISK_DOT[t.risk] }}
                              title={t.risk}
                            />
                            <span className="text-[13.5px]" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}>
                              {t.title}
                            </span>
                          </div>
                          <div className="text-[11.5px] mt-0.5 pl-3.5" style={{ color: 'var(--color-muted)' }}>
                            {t.authorName ?? 'Author unnamed'}
                            {t.imprintName ? <> · {t.imprintName}</> : null}
                            {/* Waiting on WHO, including when it is them. */}
                            {t.risk !== 'handed-off' && t.gateOwner === 'publisher' && (
                              <> · <span style={{ color: '#C2410C' }}>waiting on you</span></>
                            )}
                            {t.risk !== 'handed-off' && t.gateOwner === 'author' && <> · waiting on the author</>}
                            {t.daysSinceActivity !== null && t.risk !== 'handed-off' && (
                              <> · {t.daysSinceActivity}d since a station moved</>
                            )}
                          </div>
                        </td>

                        {t.stations.map((cell) => (
                          <td key={cell.key} className="px-1.5 py-2.5" style={{ borderBottom: '1px solid #F0F0EE' }}>
                            <StationMark cell={cell} />
                          </td>
                        ))}

                        <td className="px-4 py-2.5 text-right align-middle" style={{ borderBottom: '1px solid #F0F0EE' }}>
                          {t.handoffDate ? (
                            <>
                              <div className="text-[12.5px]" style={{ color: 'var(--color-ink)' }}>
                                {formatDate(t.handoffDate)}
                              </div>
                              {t.publicationDate && (
                                <div className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                                  pub {formatDate(t.publicationDate)}
                                </div>
                              )}
                            </>
                          ) : (
                            /* Never blank, and never "on time". */
                            <span className="text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
                              no target date set
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* The key. A picture that needs no explanation still has to say
                  what its own marks mean. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-[2px]" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }} />
                  completed by the system
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-[2px]" style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }} />
                  recorded by one of your people
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-[2px]" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }} />
                  reached — no station runs here
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-[2px]" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }} />
                  running now
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-[2px]" style={{ background: '#FAFAF9', border: '1px solid #EFEFEC' }} />
                  not started
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
