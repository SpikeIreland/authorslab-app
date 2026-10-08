'use client'

/**
 * THE HOUSE BAND — the figures across the top of the Books list.
 *
 * Paul, 2026-10-08: the list "feels too thin", and "the publishing industry
 * are embedded with creative people and pages that look 'flat' and
 * 'content-only' rendered doesn't seem fitting."
 *
 * ─── FORM: this is deliberately NOT a chart ─────────────────────────────────
 * Five or six scalars with no shared axis and no time dimension. The right
 * form for a scalar is a STAT TILE, not a bar chart of unrelated quantities —
 * and a tile with no plot needs no hover layer. Charts arrive when there is a
 * series to plot; there is not one yet.
 *
 * ─── NO NEW COLOUR ──────────────────────────────────────────────────────────
 * The tiles wear TEXT tokens only. Status hues in this product are reserved
 * (StationMark's four, the risk chips') and a figure band is not a status, so
 * borrowing one would spend a reserved colour on a number. Nothing here
 * introduces a palette, which is also why there is no categorical palette to
 * validate: the only colour is ink, muted and the page surface.
 *
 * ─── A NULL FIGURE IS OMITTED, NOT DASHED ───────────────────────────────────
 * `deriveHouseBand` returns `number | null` where null means NOT KNOWABLE, and
 * this component drops those tiles entirely. A dash in a figure band reads as
 * zero, and "0 chapters read" is a claim about the house rather than about us.
 * Proven in scripts/verify-lobby-derive.ts — four of the controls exist for
 * exactly this collapse.
 */

import type { HouseBand as Band } from '@/app/api/publisher/lobby/_derive'

export function HouseBand({ band, organisationName }: { band: Band; organisationName?: string | null }) {
  // Nothing to report about an empty list; the list's own empty state speaks.
  if (band.titles === 0) return null

  const tiles: { value: string; label: string; note?: string }[] = []

  tiles.push({
    value: String(band.titles),
    label: band.titles === 1 ? 'title on your list' : 'titles on your list',
  })

  if (band.chapters !== null) {
    tiles.push({
      value: band.chapters.toLocaleString(),
      label: 'chapters in the line',
      // Says what it is counted FROM when that is not every title. A partial
      // total presented as a whole is the quieter version of a wrong number.
      note:
        band.chaptersFromTitles < band.titles
          ? `across ${band.chaptersFromTitles} of ${band.titles}`
          : undefined,
    })
  }

  if (band.stationsComplete !== null && band.stationsTotal !== null) {
    tiles.push({
      value: `${band.stationsComplete}/${band.stationsTotal}`,
      label: 'stations complete',
    })
  }

  if (band.running > 0) {
    tiles.push({
      value: String(band.running),
      label: band.running === 1 ? 'pass running now' : 'passes running now',
    })
  }

  tiles.push({
    value: String(band.reports),
    label: band.reports === 1 ? 'report ready to read' : 'reports ready to read',
  })

  if (band.coverConcepts > 0) {
    tiles.push({
      value: String(band.coverConcepts),
      label: band.coverConcepts === 1 ? 'cover concept' : 'cover concepts',
    })
  }

  return (
    <section
      aria-label="Your house, in figures"
      className="rounded-lg px-5 py-5 mb-6"
      style={{ background: 'var(--color-paper, #FFFFFF)', border: '1px solid #E5E5E3' }}
    >
      {organisationName && (
        <p className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: '#8A8A8A' }}>
          {organisationName}
        </p>
      )}
      <dl className="flex flex-wrap gap-x-10 gap-y-5">
        {tiles.map((t) => (
          <div key={t.label}>
            <dd
              className="text-[28px] leading-none"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink, #1A1A1A)' }}
            >
              {t.value}
            </dd>
            <dt className="text-[12px] mt-1.5" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
              {t.label}
              {t.note && (
                <span className="block text-[11px]" style={{ color: '#8A8A8A' }}>
                  {t.note}
                </span>
              )}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
