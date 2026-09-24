'use client'

/**
 * PUBLISHER HOME — /publisher
 *
 * The stable: every book this publisher has visibility of, sortable and
 * filterable by author. Mirrors the author's Library in structure so the two
 * read as one product, and diverges where the audience does — the author
 * column and the author filter are the whole axis of the trade-side view.
 *
 * Data comes from _data/stable.ts and nowhere else. See that file for the
 * live/mock split and the pre-flight ↔ demo-day project id switch.
 *
 * Visual language is matched to /publisher/[projectId] deliberately — these
 * two pages are the same surface and a publisher moves between them in one
 * click.
 */

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  STABLE,
  PHASE_NAMES,
  IMPRINTS,
  authorsInStable,
  inImprint,
  fullName,
  type StableListing,
  type PhaseNumber,
} from './_data/stable'

import { VIEWING_FIRM } from './_data/firm'
// ─── 1. Sorting vocabulary ────────────────────────────────────────────────────

type SortKey = 'author' | 'title' | 'activity'

const SORT_LABELS: Record<SortKey, string> = {
  author: 'Author',
  title: 'Title',
  activity: 'Last activity',
}

// ─── 2. Helpers ───────────────────────────────────────────────────────────────

function formatWordCount(n: number): string {
  return n.toLocaleString('en-GB')
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// ─── 3. Page ──────────────────────────────────────────────────────────────────

export default function PublisherHomePage() {
  const router = useRouter()

  const [sortKey, setSortKey] = useState<SortKey>('activity')
  const [authorFilter, setAuthorFilter] = useState<string>('all')
  const [imprintFilter, setImprintFilter] = useState<string>('all')
  const [sampleNoticeFor, setSampleNoticeFor] = useState<string | null>(null)

  const authors = useMemo(() => authorsInStable(STABLE), [])

  const visible = useMemo(() => {
    const filtered = STABLE.filter(
      (l) =>
        (authorFilter === 'all' || fullName(l) === authorFilter) &&
        (imprintFilter === 'all' || l.imprint === imprintFilter)
    )

    return filtered.sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title)
      if (sortKey === 'author') {
        const byLast = a.authorLast.localeCompare(b.authorLast)
        return byLast !== 0 ? byLast : a.title.localeCompare(b.title)
      }
      // activity — most recent first
      return b.lastActivity.localeCompare(a.lastActivity)
    })
  }, [sortKey, authorFilter, imprintFilter])

  function openListing(listing: StableListing) {
    if (listing.projectId) {
      router.push(`/publisher/${listing.projectId}`)
      return
    }
    // A sample row fails HONESTLY rather than routing into a wall.
    setSampleNoticeFor((prev) => (prev === listing.key ? null : listing.key))
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F]">
      <HomeHeader />

      <main className="max-w-[1200px] mx-auto px-8 py-10">
        <Masthead count={visible.length} total={STABLE.length} />

        <PortfolioStrip
          activeImprint={imprintFilter}
          onImprint={setImprintFilter}
        />

        <Controls
          authors={authors}
          authorFilter={authorFilter}
          onAuthorFilter={setAuthorFilter}
          imprintFilter={imprintFilter}
          onImprintFilter={setImprintFilter}
          sortKey={sortKey}
          onSort={setSortKey}
        />

        <div className="mt-6 border-t border-[#E8E5E0]">
          {visible.map((l) => (
            <ListingRow
              key={l.key}
              listing={l}
              showingNotice={sampleNoticeFor === l.key}
              onOpen={() => openListing(l)}
            />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="py-16 text-center text-[14px] text-[#8A8A8A]">
            No books match that filter.
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  )
}

// ─── 4. Chrome ────────────────────────────────────────────────────────────────

function HomeHeader() {
  return (
    <header className="border-b border-[#E8E5E0] bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
        <div>
          <div
            className="text-[22px] leading-tight text-[#1A1A1A]"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            Publisher Portal
          </div>
          <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mt-1">
            AuthorsLab
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 border border-[#E8E5E0] rounded-full bg-[#FAFAF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F]" aria-hidden />
          <span className="text-[12px] text-[#8A8A8A]">Publisher:</span>
          <span className="text-[13px] text-[#1A1A1A] font-medium">{VIEWING_FIRM}</span>
        </div>
      </div>
    </header>
  )
}

function HomeFooter() {
  return (
    <footer className="mt-16 border-t border-[#E8E5E0] bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-6 text-[12px] text-[#8A8A8A] flex items-center justify-between">
        <div>Private preview — do not share.</div>
        <div>AuthorsLab · Publisher Portal</div>
      </div>
    </footer>
  )
}

function Masthead({ count, total }: { count: number; total: number }) {
  return (
    <div className="mb-8">
      <h1
        className="text-[38px] leading-[1.1] text-[#1A1A1A]"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        Your authors&rsquo; books
      </h1>
      <p className="mt-2 text-[14px] text-[#8A8A8A]">
        {count === total
          ? `${total} books in progress across your list`
          : `Showing ${count} of ${total} books`}
      </p>
    </div>
  )
}

// ─── 4b. Portfolio strip — the view across imprints ───────────────────────────
//
// A CEO running several imprints manages the PORTFOLIO, not a list. The
// question is "what is in flight, where, and how far along" — across both
// imprints at once. This strip answers it before any row is read, and doubles
// as the imprint filter.
//
// Deliberately counts rather than charts: eight books is not a dataset, and a
// bar chart over single digits dresses up a number you can simply read.

function PortfolioStrip({
  activeImprint,
  onImprint,
}: {
  activeImprint: string
  onImprint: (v: string) => void
}) {
  const cards = IMPRINTS.map((im) => {
    const books = inImprint(STABLE, im)
    const inProduction = books.filter((b) => b.phase >= 4).length
    const inEditorial = books.filter((b) => b.phase <= 3).length
    return { imprint: im, total: books.length, inProduction, inEditorial }
  })

  const all = STABLE.length

  return (
    <div className="mb-8">
      <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
        Across the studio
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ImprintCard
          label="All imprints"
          total={all}
          lines={[`${STABLE.filter((b) => b.phase <= 3).length} in editorial`, `${STABLE.filter((b) => b.phase >= 4).length} in production`]}
          active={activeImprint === 'all'}
          onClick={() => onImprint('all')}
        />
        {cards.map((c) => (
          <ImprintCard
            key={c.imprint}
            label={c.imprint}
            total={c.total}
            lines={[`${c.inEditorial} in editorial`, `${c.inProduction} in production`]}
            active={activeImprint === c.imprint}
            onClick={() => onImprint(c.imprint)}
          />
        ))}
      </div>
    </div>
  )
}

function ImprintCard({
  label,
  total,
  lines,
  active,
  onClick,
}: {
  label: string
  total: number
  lines: string[]
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left p-5 rounded-[4px] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 ${
        active
          ? 'bg-white border-[#1E3A5F]'
          : 'bg-white border-[#E8E5E0] hover:border-[#B8B8B8]'
      }`}
      style={{ boxShadow: active ? 'inset 0 0 0 1px #1E3A5F' : '0 1px 0 rgba(0,0,0,0.02)' }}
    >
      <div
        className="text-[16px] text-[#1A1A1A] leading-tight"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className="text-[28px] leading-none text-[#1A1A1A]"
          style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
        >
          {total}
        </span>
        <span className="text-[12px] text-[#8A8A8A]">
          {total === 1 ? 'book' : 'books'}
        </span>
      </div>
      <div className="mt-2.5 text-[12px] text-[#8A8A8A] leading-relaxed">
        {lines.join(' · ')}
      </div>
    </button>
  )
}

// ─── 5. Controls — sort + filter by author ────────────────────────────────────

function Controls({
  authors,
  authorFilter,
  onAuthorFilter,
  imprintFilter,
  onImprintFilter,
  sortKey,
  onSort,
}: {
  authors: string[]
  authorFilter: string
  onAuthorFilter: (v: string) => void
  imprintFilter: string
  onImprintFilter: (v: string) => void
  sortKey: SortKey
  onSort: (k: SortKey) => void
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Imprint
        </span>
        <select
          value={imprintFilter}
          onChange={(e) => onImprintFilter(e.target.value)}
          className="text-[14px] text-[#1A1A1A] bg-white border border-[#E8E5E0] rounded-[3px] px-3.5 py-2 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
        >
          <option value="all">All imprints</option>
          {IMPRINTS.map((im) => (
            <option key={im} value={im}>
              {im}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Filter by author
        </span>
        <select
          value={authorFilter}
          onChange={(e) => onAuthorFilter(e.target.value)}
          className="text-[14px] text-[#1A1A1A] bg-white border border-[#E8E5E0] rounded-[3px] px-3.5 py-2 min-w-[220px] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F]"
        >
          <option value="all">All authors</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Sort by
        </span>
        <div className="flex" role="group" aria-label="Sort listings">
          {(Object.keys(SORT_LABELS) as SortKey[]).map((k, i) => {
            const active = sortKey === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => onSort(k)}
                aria-pressed={active}
                className={`text-[13px] px-4 py-2 border border-[#E8E5E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 ${
                  i === 0 ? 'rounded-l-[3px]' : '-ml-px'
                } ${
                  i === Object.keys(SORT_LABELS).length - 1 ? 'rounded-r-[3px]' : ''
                } ${
                  active
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] relative z-10'
                    : 'bg-white text-[#3F3F3F] hover:bg-[#FAFAF8]'
                }`}
              >
                {SORT_LABELS[k]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 6. A single listing row ──────────────────────────────────────────────────

function ListingRow({
  listing,
  showingNotice,
  onOpen,
}: {
  listing: StableListing
  showingNotice: boolean
  onOpen: () => void
}) {
  const isLive = listing.projectId !== null

  return (
    <div className="border-b border-[#E8E5E0]">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left flex items-center gap-6 px-2 py-5 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 rounded-[3px]"
      >
        <SpineTile listing={listing} />

        <div className="flex-1 min-w-0">
          <div
            className="text-[19px] leading-tight text-[#1A1A1A] truncate"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            {listing.title}
          </div>
          <div className="mt-1 text-[14px] text-[#3F3F3F]">
            {fullName(listing)}
          </div>
          <div className="mt-1.5 text-[12px] text-[#8A8A8A]">
            {listing.imprint} · {listing.genre} ·{' '}
            {formatWordCount(listing.wordCount)} words · {listing.chapters} chapters
          </div>
        </div>

        <div className="hidden md:block w-[190px] flex-shrink-0">
          <PhaseChip phase={listing.phase} />
          <div className="mt-2 text-[12px] text-[#8A8A8A]">
            Last activity {formatDate(listing.lastActivity)}
          </div>
        </div>

        <span
          className={`text-[13px] flex-shrink-0 ${
            isLive ? 'text-[#1E3A5F]' : 'text-[#B8B8B8]'
          }`}
          aria-hidden
        >
          →
        </span>
      </button>

      {showingNotice && (
        <div className="px-2 pb-5 -mt-1">
          <div className="text-[12px] text-[#8A5A2B] border border-[#8A5A2B]/30 bg-[#8A5A2B]/5 px-3 py-2 rounded-[3px] inline-block">
            Sample listing — this book&rsquo;s portal isn&rsquo;t connected yet.
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 7. Spine tile — a typeset stand-in, no image assets ──────────────────────

const SPINE_PALETTE: Record<PhaseNumber, { bg: string; ink: string }> = {
  1: { bg: 'linear-gradient(170deg, #C9C4BA 0%, #B4AEA2 100%)', ink: '#3B352C' },
  2: { bg: 'linear-gradient(170deg, #A8B8A0 0%, #7B9078 100%)', ink: '#FAF9F5' },
  3: { bg: 'linear-gradient(170deg, #B08D7A 0%, #8A6A57 100%)', ink: '#FAF9F5' },
  4: { bg: 'linear-gradient(170deg, #1B2A44 0%, #0D1930 100%)', ink: '#C6B78E' },
  5: { bg: 'linear-gradient(170deg, #F0E2C6 0%, #E0CDA6 100%)', ink: '#5A4327' },
}

function SpineTile({ listing }: { listing: StableListing }) {
  const pal = SPINE_PALETTE[listing.phase]
  return (
    <div
      className="w-[52px] h-[78px] rounded-[2px] flex-shrink-0 overflow-hidden flex items-end p-2"
      style={{ background: pal.bg, boxShadow: '0 1px 2px rgba(0,0,0,0.10)' }}
      aria-hidden
    >
      <div
        className="text-[8px] leading-[1.15]"
        style={{
          color: pal.ink,
          fontFamily: 'Iowan Old Style, Palatino, Georgia, serif',
        }}
      >
        {listing.title}
      </div>
    </div>
  )
}

// ─── 8. Phase chip ────────────────────────────────────────────────────────────

function PhaseChip({ phase }: { phase: PhaseNumber }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" aria-hidden />
      <span className="text-[13px] text-[#1A1A1A]">
        Phase {phase} — {PHASE_NAMES[phase]}
      </span>
    </div>
  )
}
