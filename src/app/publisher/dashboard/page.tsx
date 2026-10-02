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
import { StationMark, type StationCell } from '../_components/StationMark'


type Risk = 'overdue' | 'at-risk' | 'stalled' | 'moving' | 'not-started' | 'handed-off'


interface LobbyTitle {
  manuscriptId: string
  title: string
  authorName: string | null
  imprintName: string | null
  currentStationName: string | null
  /** R9, per row — a seeded sample title. */
  isSample: boolean
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
  /** R9 — served by the route, computed from the mix. See the Lobby route's
   *  header note 3 for why this surface must not carry a flat
   *  "not your titles" banner. */
  sampleDisclosure?: string | null
}

// Risk dots stay HERE: they are the wall chart's own vocabulary, not part of
// the station marks, and shipping them inside the shared component would hand
// `ux` a second colour scale they did not ask for.
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
        if (res.status === 503) {
          // WE COULD NOT CHECK, which is ours and not theirs. Distinguished
          // from 403 because the two sentences are opposites and only one of
          // them is ever true at a time.
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              heading: 'We could not check your seat just now',
              body:
                (typeof j?.message === 'string'
                  ? j.message
                  : 'Could not check your seat just now. This is our end, not yours.') +
                ' Nothing is wrong with your access — reload in a moment and it should answer.',
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

          {/* R9 — persistent, non-dismissible, above the fold. Wording from
              the payload; see the Lobby for the full note. */}
          {payload?.sampleDisclosure && (
            <div
              className="px-4 py-3 mb-5 rounded-md text-[13px] flex items-start gap-2.5"
              style={{ background: '#FEFCE8', border: '1px solid #FEF08A', color: '#854D0E' }}
              role="note"
            >
              <span aria-hidden className="mt-[1px]">&#9432;</span>
              <span>{payload.sampleDisclosure}</span>
            </div>
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
                            {/* R9 per row. The wall chart is where a reader
                                scans station marks rather than names, so a
                                seeded row that is NOT marked here would be
                                read as the house's own progress. */}
                            {t.isSample && (
                              <span
                                className="text-[9.5px] tracking-[0.1em] uppercase px-1.5 py-[2px] rounded-full shrink-0"
                                style={{ background: '#F7F7F5', color: '#6B6B6B', border: '1px dashed #C9C9C4' }}
                                title="A seeded sample title. Not one of your books."
                              >
                                sample
                              </span>
                            )}
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
