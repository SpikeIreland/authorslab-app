'use client'

export const dynamic = 'force-dynamic'

/**
 * THE PUBLISHER LOBBY — /publisher
 *
 * Same visual grammar as the author's Library — one grammar, learn one
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
import { PublisherNav } from './_components/PublisherNav'
import { PublisherBookCover } from '@/components/publisher-chrome/PublisherBookCover'
import { PublisherJourneyStrip } from '@/components/publisher-chrome/PublisherJourneyStrip'
import type { StationCell } from './_components/StationMark'
import { HouseBand } from './_components/HouseBand'
import { ChapterDensity } from './_components/ChapterDensity'
import { PassProgress, StationTally } from './_components/PassProgress'
import { deriveHouseBand, type HouseBand as Band } from '@/app/api/publisher/lobby/_derive'


type Register = 'list' | 'line'
type RiskBasis = 'date' | 'stall' | 'none'
type Risk = 'overdue' | 'at-risk' | 'stalled' | 'moving' | 'not-started' | 'handed-off'

interface LobbyTitle {
  manuscriptId: string
  title: string
  authorName: string | null
  imprintId: string | null
  imprintName: string | null
  /** R9, per row — a seeded sample title. See the route's header note 3. */
  isSample: boolean
  /** The selection pointer, passed through. PublisherBookCover decides
   *  whether it is renderable; this page does not guess. */
  coverUrl: string | null
  /** Whether a cover EXISTS, which is a different fact from whether this list
   *  can show it. See the route's note. */
  hasCoverAsset: boolean
  /** The seven stations in journey order, as the route builds them. The strip
   *  and the wall chart read the same cells from the same component. */
  stations: StationCell[]
  /** The four visual facts — see the route's LobbyTitle header. */
  totalChapters?: number | null
  passProgress?: { approved: number; analyzed: number; of: number | null } | null
  reportCount?: number
  coverConceptCount?: number
  register: Register | null
  currentStationName: string | null
  currentStationOperator: string | null
  gate: string | null
  gateOwner: 'author' | 'publisher' | null
  lastActivityAt: string | null
  daysSinceActivity: number | null
  handoffDate: string | null
  publicationDate: string | null
  risk: Risk
  riskBasis: RiskBasis
}

interface LobbyPayload {
  authorised?: boolean
  organisation?: { name: string; slug: string }
  viewer?: {
    orgRole?: 'owner' | 'admin' | 'member'
    scopeIsWholeOrg?: boolean
    imprintCount?: number
  }
  imprints?: { id: string; name: string }[]
  titles?: LobbyTitle[]
  registerSplitAvailable?: boolean
  registerSplitReason?: string | null
  /**
   * R9. SERVED, not composed here — and null means "say nothing", which is a
   * real instruction and not a missing value: a marker over a list of a
   * publisher's own books would teach them to ignore markers, and then the
   * marker would not work on the surfaces that need it.
   */
  sampleDisclosure?: string | null
  sampleCount?: number
  realCount?: number
  datesAvailable?: boolean
  /** The figure band, computed by deriveHouseBand and proven in
   *  scripts/verify-lobby-derive.ts. Optional so an older cached response
   *  renders the list without a band rather than crashing. */
  band?: Band
  available?: false
  reason?: string
}

/**
 * The served `band` describes the WHOLE list. When an imprint filter is on,
 * the band must describe what is actually on screen, so it is recomputed from
 * the same pure function the route uses — one implementation, two callers,
 * rather than a second sum written here that could drift from the proven one.
 */
function deriveBandFor(titles: LobbyTitle[]): Band {
  return deriveHouseBand(
    titles.map((t) => ({
      totalChapters: t.totalChapters ?? null,
      reportCount: t.reportCount ?? 0,
      coverConceptCount: t.coverConceptCount ?? 0,
      stations: t.stations,
    }))
  )
}

// ─── 1. Risk presentation ─────────────────────────────────────────────────────
// Wording is deliberate. 'moving' never says "on track": on-track is a claim
// against a date, and most titles have no date. See the route's header.

const RISK_LABEL: Record<Risk, string> = {
  overdue: 'Past its handoff date',
  'at-risk': 'Handoff date close',
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
    // `cursor-pointer` is explicit: a <button> renders with the default arrow
    // in Chrome, so a row that navigates gave no hover signal that it was
    // clickable at all. Paul found it. An affordance the eye cannot see is
    // half an affordance.
    <button
      onClick={() => onOpen(t.manuscriptId)}
      className="w-full text-left px-4 py-3.5 rounded-lg transition-colors cursor-pointer hover:border-[#C9C9C4]"
      style={{ background: 'var(--color-paper, #FFFFFF)', border: '1px solid #E5E5E3' }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* ─── THE COVER SLOT ────────────────────────────────────────────
            Paul's ask, and `ux`'s component. Artwork where a cover is
            fetchable; an honestly empty slot otherwise — NEVER a procedural
            stand-in, because on a publisher's list an object that looks like
            a cover claims the design station has run.

            MEASURED 2026-10-02: 0 of the 9 titles on any publisher list had
            a cover asset or a selection, so it shipped as nine empty slots.

            RE-MEASURED 2026-10-08: the house list is two real titles, and The
            Veil and the Flame carries FOUR cover concepts. The first real
            cover exists, so the slot is no longer hypothetical — which is why
            the size went up. Paul, 2026-10-08: the industry "are embedded with
            creative people and pages that look 'flat' and 'content-only'
            rendered doesn't seem fitting." A book list that leads with text
            when it has artwork to show is making that mistake on purpose. */}
        <PublisherBookCover
          coverUrl={t.coverUrl}
          title={t.title}
          size="md"
          /* The third state, shipped by `ux` the same afternoon it was
             raised: a cover that EXISTS but cannot be shown on a list reads
             "Cover chosen", never "No cover yet". The payload carries
             existence only — no storage_path, no signing — so this list
             still makes no storage call per row. */
          hasCover={t.hasCoverAsset}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[15px] truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              {t.title}
            </span>
            <RiskChip risk={t.risk} />
            {/* R9 per row. A seeded title says so on its own line, because
                this is the one surface where a publisher's real book and a
                sample sit in the same list — so a view-level "not your
                titles" would be false about the row that matters most.
                Deliberately plain and unstyled-as-a-status: it is a
                provenance label, not a state, and it must not be mistaken
                for one of the risk chips beside it. */}
            {t.isSample && (
              <span
                className="text-[10.5px] tracking-[0.1em] uppercase px-2 py-[3px] rounded-full"
                style={{
                  background: '#F7F7F5',
                  color: '#6B6B6B',
                  border: '1px dashed #C9C9C4',
                }}
                title="A seeded sample title, here so the later stations have something to show. Not one of your books."
              >
                sample
              </span>
            )}
          </div>

          <div className="mt-1 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
            {t.authorName ?? 'Author unnamed'}
            {t.imprintName ? <> · {t.imprintName}</> : null}
          </div>

          {/* `ux`'s strip, built on the StationMark I lifted for them — so
              the row, the wall chart and the book header all draw the three
              marks from one component. A STATE DISPLAY, never navigation:
              it answers "where is this book" before anything is clicked,
              which is the property the demo-build ruling said to preserve.
              Cells arrive from the route already in journey order. */}
          {t.stations.length > 0 && (
            <div className="mt-2">
              <PublisherJourneyStrip cells={t.stations} compact />
            </div>
          )}

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

          {/* ─── THE VISUAL LAYER (2026-10-08) ───────────────────────────────
              Paul asked for "visual displays of progress and reporting" on a
              surface that read as text rows.

              Order is deliberate: the meter for the pass that is RUNNING, then
              the density of the book as a whole, then the tally and what is
              readable. Each renders NOTHING when its column is empty, so a
              title with no recorded progress shows a shorter row rather than a
              row of zeroed bars. An empty bar is a precise-looking claim built
              on an absent value, and this list has been the place that defect
              appeared before. */}
          <div className="mt-3 space-y-2.5">
            <PassProgress
              stationName={t.currentStationName}
              operator={t.currentStationOperator}
              progress={t.passProgress ?? null}
            />
            <ChapterDensity
              total={t.totalChapters ?? null}
              approved={t.passProgress?.approved ?? 0}
              analyzed={t.passProgress?.analyzed ?? 0}
            />
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
              <StationTally stations={t.stations} />
              {(t.reportCount ?? 0) > 0 && (
                <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-muted)' }}>
                  {t.reportCount} {t.reportCount === 1 ? 'report' : 'reports'} ready
                </span>
              )}
              {(t.coverConceptCount ?? 0) > 0 && (
                <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-muted)' }}>
                  {t.coverConceptCount} cover {t.coverConceptCount === 1 ? 'concept' : 'concepts'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          {t.handoffDate ? (
            <>
              {/* The HANDOFF date — ours, and the only one we are measured
                  against. A publication date, where one exists, is shown
                  beneath it as the publisher's own context: it includes
                  composition and distribution, which are not our stations. */}
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
                Handoff
              </div>
              <div className="text-[13px]" style={{ color: 'var(--color-ink)' }}>
                {formatDate(t.handoffDate)}
              </div>
              {t.publicationDate && (
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Publication {formatDate(t.publicationDate)}
                </div>
              )}
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

/**
 * WHY THE CALLER IS NOT BEING SHOWN A LIST — and it is not an error.
 *
 * The route stopped taking `?org=` on 2026-09-30 and now reads the caller's own
 * membership, which introduces two refusals that a red box would misdescribe.
 * Neither is a failure of the page: one is the correct answer for somebody
 * without a seat, and the other is the identity resolver declining to guess
 * which of two houses is being viewed.
 *
 * They are rendered as SURFACES, for the reason the People tab gives: an empty
 * list here would read as "nothing is late", which is the one sentence this
 * page must never say when it does not know.
 */
type Refusal =
  | { kind: 'not-a-publisher' }
  | { kind: 'unresolved'; message: string }
  /**
   * WE COULD NOT CHECK — added 2026-10-01, and it is the third state of a
   * pair I had already split once.
   *
   * I reported to `identity-billing` that their resolver returned `null` for
   * a read failure as well as for "no seat", and that my surface therefore
   * printed *"you do not hold a seat"* to an owner whose query had merely
   * timed out. They fixed it at the type, which means my route now answers
   * 503 — and until this branch existed, a 503 fell through to `!res.ok` and
   * this page showed a red box reading "Lobby unavailable (503)".
   *
   * So their fix was only half a fix until this was here, and the half that
   * was missing was mine. A refusal, a hiccup and a fault are three
   * sentences; the page now has three.
   */
  | { kind: 'unavailable'; message: string }

// ─── 3. The page ──────────────────────────────────────────────────────────────

export default function PublisherLobbyPage() {
  const router = useRouter()

  const [payload, setPayload] = useState<LobbyPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refusal, setRefusal] = useState<Refusal | null>(null)
  const [imprintFilter, setImprintFilter] = useState<string>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(
          '/api/publisher/lobby'
        )
        // 403 — the caller holds no active seat. A REAL ANSWER, not a fault,
        // and deliberately not shown as one. The old 404 branch here said
        // "this organisation is not set up yet", which was a claim about the
        // estate made from a fact about the caller.
        if (res.status === 403) {
          if (!cancelled) setRefusal({ kind: 'not-a-publisher' })
          return
        }
        // 409 — two active memberships and no org switcher. The resolver
        // refuses to pick one and the message it raises is the useful thing to
        // show, because the reader is the person who can fix it.
        // 503 — the seat could not be CHECKED. A statement about us, never
        // about the caller, and never shown in the red box.
        if (res.status === 503) {
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              kind: 'unavailable',
              message:
                typeof j?.message === 'string'
                  ? j.message
                  : 'Could not check your seat just now. This is our end, not yours.',
            })
          }
          return
        }
        if (res.status === 409) {
          const j = await res.json().catch(() => null)
          if (!cancelled) {
            setRefusal({
              kind: 'unresolved',
              message:
                typeof j?.message === 'string'
                  ? j.message
                  : 'You hold seats in more than one house and there is no way yet to choose between them.',
            })
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
    if (refusal) return ''
    if (imprints.length === 0) return 'No imprints in view'
    if (titles.length === 0) return 'No titles on your list yet'
    const pressing = filtered.filter(
      (t) => t.risk === 'overdue' || t.risk === 'at-risk' || t.risk === 'stalled'
    ).length
    const datesKnown = filtered.some((t) => t.handoffDate !== null)
    const head =
      pressing === 0
        ? `${filtered.length} ${filtered.length === 1 ? 'title' : 'titles'}, none pressing`
        : `${pressing} of ${filtered.length} ${filtered.length === 1 ? 'title needs' : 'titles need'} attention`
    // R9/R10 touch the same nerve here: a count is a claim about a
    // publisher's workload, and a seeded row inside it inflates that claim.
    // The samples are not removed from the count -- they are on the list and
    // pretending otherwise would make the number disagree with the rows
    // underneath it -- but the line says how many of them there are.
    const samples = filtered.filter((t) => t.isSample).length
    const sampleTail = samples > 0 ? ` · ${samples} seeded ${samples === 1 ? 'sample' : 'samples'}` : ''
    return (datesKnown
      ? head
      : `${head} · no handoff dates set, so this is measured by movement, not by deadline`) + sampleTail
  }, [loading, refusal, imprints.length, titles.length, filtered])

  return (
    <>
      <PublisherNav />
      {/* THE SHELL OWNS THE SCROLL, AND IT DID NOT WHEN THIS WAS WRITTEN.
          This div carried `flex-1 overflow-y-auto h-[calc(100vh-100px)]`,
          sized against AppShell's header back when these pages supplied their
          own chrome. `ux`'s PublisherShell now wraps the whole tree from the
          layout, its header is h-14 (56px, not 100), and its <main> is already
          `flex-1 min-w-0 overflow-y-auto` inside `h-screen flex flex-col`.
          So all three classes were wrong at once: the arithmetic, a second
          scroll container nested in the first, and a `flex-1` with no flex
          parent. The right height is the one <main> computes, so this element
          states none. */}
      <div>
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Greeting + summary — the author's grammar, the publisher's question */}
          <div className="mb-7">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              What is late
            </h1>
            {/* The house name and the count, and NEITHER of them invented.
                Until the read answers there is no name, and on a refusal there
                is no count — so the line prints what it knows and stops. An
                em-dash standing in for a publisher's name is the same defect
                as an em-dash standing in for a completed station. */}
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {[payload?.organisation?.name, summary].filter(Boolean).join(' · ')}
            </p>
          </div>

          {loading && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
              Reading the list…
            </p>
          )}

          {/* R9 — PERSISTENT AND NON-DISMISSIBLE, and above everything else
              on the page so it cannot be scrolled past. There is no close
              button and no state that hides it; the only thing that removes
              it is the route returning null, which happens when no row on the
              list is seeded. The wording comes from the payload rather than
              from here (identity-billing's rule: a caveat that lives only in
              a renderer is one refactor from being dropped) and it is
              computed from the MIX, so it can never tell a publisher that
              their own title is sample data. */}
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

          {refusal?.kind === 'not-a-publisher' && (
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
              <p className="text-[13.5px] max-w-xl mb-3" style={{ color: 'var(--color-muted)' }}>
                This page shows one house&rsquo;s list, and which house it is
                comes from your own seat rather than from the address bar. Your
                account has no active seat, so there is no list to show you.
              </p>
              <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                Showing you somebody else&rsquo;s list instead would be the
                wrong answer rather than a helpful one. Someone who owns the
                organisation can add you from their People tab.
              </p>
            </div>
          )}

          {refusal?.kind === 'unavailable' && (
            <div
              className="rounded-lg px-6 py-8"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[18px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                We could not check your seat just now
              </p>
              <p className="text-[13.5px] max-w-xl mb-3" style={{ color: 'var(--color-muted)' }}>
                {refusal.message}
              </p>
              <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                Nothing is wrong with your access, and this page is not telling
                you your list is empty. It is telling you it does not know yet.
                Reload in a moment.
              </p>
            </div>
          )}

          {refusal?.kind === 'unresolved' && (
            <div
              className="rounded-lg px-6 py-8"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              <p
                className="text-[18px] mb-2"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                Which house are you looking at?
              </p>
              <p className="text-[13.5px] max-w-xl mb-3" style={{ color: 'var(--color-muted)' }}>
                You hold an active seat in more than one publisher organisation,
                and there is no way yet to choose between them. Rather than pick
                one for you and print the wrong name at the top of every page,
                the read stops here.
              </p>
              <p className="text-[12.5px] max-w-xl font-mono" style={{ color: 'var(--color-muted)' }}>
                {refusal.message}
              </p>
            </div>
          )}

          {/* ── NO SCOPE IS NOT AN EMPTY LIST ──────────────────────────────
              A member with a seat and no imprints assigned may be standing
              two feet from nine titles and refused all of them. Reporting
              that as "no titles yet" would be the surface asserting an
              emptiness that belongs to their permissions, not to the house.
              An owner with no imprints is the other case, and it gets the
              other sentence. */}
          {!loading && !error && !refusal && imprints.length === 0 && payload?.organisation && (
            <div
              className="rounded-lg px-6 py-8"
              style={{ background: '#FFFFFF', border: '1px dashed #D8D8D4' }}
            >
              {payload.registerSplitReason === 'no_imprints_assigned_to_you' ? (
                <>
                  <p
                    className="text-[18px] mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
                  >
                    No imprints have been assigned to you yet
                  </p>
                  <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                    You hold a seat at {payload.organisation.name}, and your
                    view of the list is scoped to the imprints named against
                    it. None are, so there is nothing here yet &mdash; which is
                    not the same as the house having no books. An owner can
                    assign your imprints from the People tab.
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="text-[18px] mb-2"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
                  >
                    No imprints yet
                  </p>
                  <p className="text-[13.5px] max-w-xl" style={{ color: 'var(--color-muted)' }}>
                    A title joins this list by joining one of your imprints, and{' '}
                    {payload.organisation.name} has none set up yet.
                  </p>
                </>
              )}
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
          {!loading && !error && !refusal && titles.length > 0 && imprints.length > 1 && (
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
          {!loading && !error && !refusal && titles.length === 0 && imprints.length > 0 && payload?.organisation && (
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
              {/* Found by opening the page rather than by reading it: with no
                  titles the imprint filter offered a choice that changed
                  nothing, and the line above named both imprints while the
                  view was scoped to one. Both are small, and both are the
                  empty state — the one screen a new publisher sees first. */}
            </div>
          )}

          {/* ── THE TWO REGISTERS ─────────────────────────────────────────────
              Split only when it can be resolved. An uncapped floor is right,
              and an uncapped floor is what breaks a "what is late" Lobby when
              a whole backlog arrives and the answer is "everything" — so a
              title on the LIST is observed and never nagged, and only a title
              on the LINE is escalated. */}
          {/* ─── THE HOUSE BAND ──────────────────────────────────────────────
              Above both register sections, because it is about the house
              rather than about either half of the list. It renders nothing on
              an empty list, and drops any figure the estate cannot answer.

              It reads the FILTERED set, not the whole payload: when a reader
              has picked an imprint, a band describing the whole organisation
              would silently disagree with the list under it. */}
          {!loading && !error && !refusal && filtered.length > 0 && (
            <HouseBand
              band={deriveBandFor(filtered)}
              organisationName={imprintFilter === 'all' ? payload?.organisation?.name ?? null : null}
            />
          )}

          {!loading && !error && !refusal && filtered.length > 0 && !splitAvailable && (
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

          {!loading && !error && !refusal && splitAvailable && (
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
    </>
  )
}
