'use client'

export const dynamic = 'force-dynamic'

/**
 * THE PUBLISHER LOBBY — /publisher
 *
 * Same shell as the author's Library (AppShell, one visual grammar: learn one
 * screen and you have learned them all). Different question:
 *
 *   Author's Lobby:    "what am I working on?"
 *   Publisher's Lobby: "WHAT IS LATE?"
 *
 * Same furniture, different verb. Ratified in
 * `sysadmin-…-the-highline-brief-throughput-not-editing-2026-09-25.md` §4.
 *
 * ─── What replaced what ──────────────────────────────────────────────────────
 * This surface previously rendered `_data/stable.ts`: eight listings of which
 * exactly ONE carried a real project id. That was a level-1 Lobby reporting
 * confidently on nothing — the failure mode, already live. Rows now come from
 * `/api/publisher/lobby`, which reads tenancy (`manuscripts.imprint_id`) and
 * nothing else.
 *
 * ─── The five ratified pieces ────────────────────────────────────────────────
 * 1. Real rows from tenancy.
 * 2. TWO REGISTERS — on the list (observed, dated, never nagged) vs on the
 *    line (gated, risk-sorted, escalated). Hidden entirely when the route
 *    cannot resolve the split, rather than captioned with an apology.
 * 3. One-click station mark from the row — the single interaction the whole
 *    authority model rests on. Shown only where the substrate exists.
 * 4. The DESIGNED EMPTY STATE. The level-1 failure mode is not emptiness, it
 *    is FALSE CONFIDENCE. "No titles yet — the line starts when you add one"
 *    is honest; "0 titles at risk" is a claim about a list we do not have.
 * 5. The TERMINAL HANDOFF STATE. Our seven stations end where they end.
 *    A book whose stations are complete is HANDED OFF — not "done", not "to
 *    market". Formatting and distribution are the last mile, they have no
 *    station, and Oliver's densest questions were about exactly that. Better
 *    said by the product than by a caveat.
 *
 * ─── The affordance rule ─────────────────────────────────────────────────────
 * Nothing on this page asserts an act it cannot perform, and nothing states a
 * judgement it cannot support. Where a value is unresolvable the surface says
 * so — it never picks the convenient meaning.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/chrome/AppShell'
import { VIEWING_FIRM, VIEWING_FIRM_SLUG } from './_data/firm'

type Register = 'list' | 'line'
type RiskBasis = 'date' | 'stall' | 'none'
type Risk = 'overdue' | 'at-risk' | 'stalled' | 'moving' | 'not-started' | 'handed-off'

interface LobbyTitle {
  manuscriptId: string
  title: string
  authorName: string | null
  imprintId: string | null
  imprintName: string | null
  register: Register | null
  currentStationName: string | null
  currentStationOperator: string | null
  gate: string | null
  gateOwner: 'author' | 'publisher' | null
  lastActivityAt: string | null
  daysSinceActivity: number | null
  launchDate: string | null
  risk: Risk
  riskBasis: RiskBasis
}

interface LobbyPayload {
  authorised?: boolean
  organisation?: { name: string; slug: string }
  imprints?: { id: string; name: string }[]
  titles?: LobbyTitle[]
  registerSplitAvailable?: boolean
  registerSplitReason?: string | null
  datesAvailable?: boolean
  available?: false
  reason?: string
}

// ─── 1. Risk presentation ─────────────────────────────────────────────────────
// Wording is deliberate. 'moving' never says "on track": on-track is a claim
// against a date, and most titles have no date. See the route's header.

const RISK_LABEL: Record<Risk, string> = {
  overdue: 'Past its launch date',
  'at-risk': 'Launch date close',
  stalled: 'Nothing has moved',
  moving: 'Moving',
  'not-started': 'Not started',
  'handed-off': 'Handed off',
}

const RISK_STYLE: Record<Risk, { bg: string; fg: string; border: string }> = {
  overdue: { bg: '#FEF2F2', fg: '#991B1B', border: '#FECACA' },
  'at-risk': { bg: '#FFF7ED', fg: '#9A3412', border: '#FED7AA' },
  stalled: { bg: '#FEFCE8', fg: '#854D0E', border: '#FEF08A' },
  'not-started': { bg: '#F8F8F7', fg: '#6B6B6B', border: '#E5E5E3' },
  moving: { bg: '#F0FDF4', fg: '#166534', border: '#BBF7D0' },
  'handed-off': { bg: '#F5F3FF', fg: '#5B21B6', border: '#DDD6FE' },
}

function RiskChip({ risk }: { risk: Risk }) {
  const s = RISK_STYLE[risk]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
    >
      {RISK_LABEL[risk]}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ─── 2. A row ─────────────────────────────────────────────────────────────────

function TitleRow({
  t,
  onOpen,
}: {
  t: LobbyTitle
  onOpen: (id: string) => void
}) {
  // What the row must answer, per the brief: when it ships and what it is
  // waiting on. Where the first has no answer, the row says so.
  const waitingOn =
    t.risk === 'handed-off'
      ? null
      : t.gateOwner === 'publisher'
        ? 'Waiting on you'
        : t.gateOwner === 'author'
          ? 'Waiting on the author'
          : null

  return (
    <button
      onClick={() => onOpen(t.manuscriptId)}
      className="w-full text-left px-4 py-3.5 rounded-lg transition-colors"
      style={{ background: 'var(--color-paper, #FFFFFF)', border: '1px solid #E5E5E3' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[15px] truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              {t.title}
            </span>
            <RiskChip risk={t.risk} />
          </div>

          <div className="mt-1 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
            {t.authorName ?? 'Author unnamed'}
            {t.imprintName ? <> · {t.imprintName}</> : null}
          </div>

          <div className="mt-1.5 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
            {t.risk === 'handed-off' ? (
              // The boundary, stated by the product.
              <>Our stations are complete — formatting and distribution sit with you</>
            ) : t.currentStationName ? (
              <>
                {t.currentStationName}
                {t.currentStationOperator ? <> · {t.currentStationOperator}</> : null}
                {waitingOn ? <> · {waitingOn}</> : null}
              </>
            ) : (
              <>No station open</>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          {t.launchDate ? (
            <>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                Launch
              </div>
              <div className="text-[13px]" style={{ color: 'var(--color-ink)' }}>
                {formatDate(t.launchDate)}
              </div>
            </>
          ) : (
            // Not a blank. The absence of a target date is a fact a publisher
            // needs, and hiding it is how a surface implies on-track.
            <div className="text-[11.5px] leading-tight" style={{ color: 'var(--color-muted)' }}>
              No target date
              <br />
              set yet
            </div>
          )}
          {t.daysSinceActivity !== null && t.risk !== 'handed-off' && (
            <div className="mt-1.5 text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
              {t.daysSinceActivity === 0
                ? 'Moved today'
                : `${t.daysSinceActivity}d since a station moved`}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── 3. The page ──────────────────────────────────────────────────────────────

export default function PublisherLobbyPage() {
  const router = useRouter()

  const [payload, setPayload] = useState<LobbyPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imprintFilter, setImprintFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(
          `/api/publisher/lobby?org=${encodeURIComponent(VIEWING_FIRM_SLUG)}`
        )
        if (res.status === 404) {
          if (!cancelled) {
            setError(
              'This organisation is not set up yet — no imprints, no titles, nothing to report on.'
            )
          }
          return
        }
        if (!res.ok) throw new Error(`Lobby unavailable (${res.status})`)
        const json = (await res.json()) as LobbyPayload
        if (!cancelled) setPayload(json)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const titles = payload?.titles ?? []
  const imprints = payload?.imprints ?? []
  const splitAvailable = payload?.registerSplitAvailable === true

  const filtered = useMemo(
    () =>
      imprintFilter === 'all'
        ? titles
        : titles.filter((t) => t.imprintId === imprintFilter),
    [titles, imprintFilter]
  )

  // The two registers. Only split when the route could actually resolve it —
  // otherwise one list, and a line saying why.
  const { onTheLine, onTheList } = useMemo(() => {
    if (!splitAvailable) return { onTheLine: [], onTheList: [] }
    return {
      onTheLine: filtered.filter((t) => t.register === 'line'),
      onTheList: filtered.filter((t) => t.register !== 'line'),
    }
  }, [filtered, splitAvailable])

  // The summary line. It reports only what it can compute, and says when it
  // cannot compute lateness at all — rather than answering "nothing is late".
  const summary = useMemo(() => {
    if (loading) return 'Reading the list…'
    if (titles.length === 0) return 'No titles on your list yet'
    const pressing = filtered.filter(
      (t) => t.risk === 'overdue' || t.risk === 'at-risk' || t.risk === 'stalled'
    ).length
    const datesKnown = filtered.some((t) => t.launchDate !== null)
    const head =
      pressing === 0
        ? `${filtered.length} ${filtered.length === 1 ? 'title' : 'titles'}, none pressing`
        : `${pressing} of ${filtered.length} ${filtered.length === 1 ? 'title needs' : 'titles need'} attention`
    return datesKnown
      ? head
      : `${head} · no launch dates set, so this is measured by movement, not by deadline`
  }, [loading, titles.length, filtered])

  return (
    <AppShell modeLabel="Publisher" firstName={VIEWING_FIRM}>
      <div className="flex-1 overflow-y-auto h-[calc(100vh-56px)]">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Greeting + summary — the author's grammar, the publisher's question */}
          <div className="mb-7">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              What is late
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {payload?.organisation?.name ?? VIEWING_FIRM} · {summary}
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

          {payload?.available === false && (
            <div
              className="px-4 py-3 mb-4 rounded-md text-sm"
              style={{ background: '#FEFCE8', border: '1px solid #FEF08A', color: '#854D0E' }}
            >
              The organisation model is not in place on this environment yet, so
              there is no list to read.
            </div>
          )}

          {/* Imprint filter — a publisher runs several lists and manages across
              them. Shown only when there is more than one to choose between. */}
          {!loading && !error && imprints.length > 1 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <button
                onClick={() => setImprintFilter('all')}
                className="px-2.5 py-1 rounded text-[12px]"
                style={
                  imprintFilter === 'all'
                    ? { background: 'var(--color-ink)', color: 'var(--color-ivory)' }
                    : { background: 'transparent', color: 'var(--color-muted)', border: '1px solid #E5E5E3' }
                }
              >
                All imprints
              </button>
              {imprints.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setImprintFilter(i.id)}
                  className="px-2.5 py-1 rounded text-[12px]"
                  style={
                    imprintFilter === i.id
                      ? { background: 'var(--color-ink)', color: 'var(--color-ivory)' }
                      : { background: 'transparent', color: 'var(--color-muted)', border: '1px solid #E5E5E3' }
                  }
                >
                  {i.name}
                </button>
              ))}
            </div>
          )}

          {/* ── THE DESIGNED EMPTY STATE ──────────────────────────────────────
              Not "0 titles at risk". An empty list is shown as an invitation
              and a description of the mechanism, because the failure mode is
              false confidence, not emptiness. */}
          {!loading && !error && titles.length === 0 && payload?.organisation && (
            <div
              className="rounded-lg px-6 py-8 text-center"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[18px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                No titles yet
              </p>
              <p
                className="text-[13.5px] max-w-md mx-auto mb-5"
                style={{ color: 'var(--color-muted)' }}
              >
                The line starts when a book joins one of your imprints. From
                then on this page answers one question — which of them is going
                to slip — and it answers it from what the stations record, not
                from an estimate.
              </p>
              <div
                className="text-[12px] inline-flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-lg"
                style={{ color: 'var(--color-muted)' }}
              >
                {[
                  'Manuscript',
                  'Developmental edit',
                  'Line edit',
                  'Copy edit',
                  'Publishing prep',
                  'Marketing prep',
                  'Handed off',
                ].map((s, idx, arr) => (
                  <span key={s}>
                    {s}
                    {idx < arr.length - 1 ? <span className="opacity-40"> → </span> : null}
                  </span>
                ))}
              </div>
              {imprints.length > 0 && (
                <p className="mt-5 text-[12px]" style={{ color: 'var(--color-muted)' }}>
                  {imprints.length === 1
                    ? `${imprints[0].name} is ready and empty.`
                    : `${imprints.map((i) => i.name).join(' and ')} are ready and empty.`}
                </p>
              )}
            </div>
          )}

          {/* ── THE TWO REGISTERS ─────────────────────────────────────────────
              Split only when it can be resolved. An uncapped floor is right,
              and an uncapped floor is what breaks a "what is late" Lobby when
              a whole backlog arrives and the answer is "everything" — so a
              title on the LIST is observed and never nagged, and only a title
              on the LINE is escalated. */}
          {!loading && !error && filtered.length > 0 && !splitAvailable && (
            <>
              <div className="space-y-2.5">
                {filtered.map((t) => (
                  <TitleRow key={t.manuscriptId} t={t} onOpen={(id) => router.push(`/publisher/${id}`)} />
                ))}
              </div>
              <p className="mt-4 text-[11.5px]" style={{ color: 'var(--color-muted)' }}>
                Shown as one list. Separating titles in production from titles
                merely on your list needs the station record to distinguish
                system work from a human mark, which this environment cannot do
                yet.
              </p>
            </>
          )}

          {!loading && !error && splitAvailable && (
            <>
              {onTheLine.length > 0 && (
                <>
                  <p className="kicker mb-3">On the line</p>
                  <div className="space-y-2.5 mb-8">
                    {onTheLine.map((t) => (
                      <TitleRow key={t.manuscriptId} t={t} onOpen={(id) => router.push(`/publisher/${id}`)} />
                    ))}
                  </div>
                </>
              )}

              {onTheList.length > 0 && (
                <>
                  <p className="kicker mb-1.5">On your list</p>
                  <p className="text-[12px] mb-3" style={{ color: 'var(--color-muted)' }}>
                    Observed and dated. Nothing here is in production, so nothing
                    here is chased.
                  </p>
                  <div className="space-y-2.5">
                    {onTheList.map((t) => (
                      <TitleRow key={t.manuscriptId} t={t} onOpen={(id) => router.push(`/publisher/${id}`)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </AppShell>
  )
}
