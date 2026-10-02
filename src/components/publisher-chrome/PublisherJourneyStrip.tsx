'use client'

/**
 * PUBLISHER JOURNEY STRIP — the book-level state display (High Line ruling §6).
 *
 * A STATE DISPLAY, NOT NAVIGATION: it answers "where is this book" before
 * anything is clicked — that property is the whole reason the Author UI's
 * strip grammar was replicated, and it is preserved here by construction:
 * nothing in this component is a link. The mounting surface decides what a
 * click on the ROW does; the strip itself claims nothing.
 *
 * Marks are `publisher`'s three, imported from the ONE implementation they
 * lifted for exactly this consumer (src/app/publisher/_components/StationMark
 * — moved verbatim 2026-10-02 so the strip and the wall chart cannot drift).
 * This file renders a row of their cells and adds NOTHING to the vocabulary:
 * no new colours, no risk dots (wall-chart vocabulary, deliberately not in
 * the shared component), no readiness verdicts.
 *
 * Stations: same grammar as the author's journey, different stations —
 * editorial → design → production readiness → handoff. The mounting surface
 * supplies the cells (it owns the data read); this component owns only the
 * rendering of "where is this book".
 */

import { StationMark, type StationCell } from '@/app/publisher/_components/StationMark'

export function PublisherJourneyStrip({
  cells,
  compact = false,
}: {
  /** In journey order. The data owner (publisher's Books list) builds these. */
  cells: StationCell[]
  /** Tighter spacing for list rows; default spacing suits a book header. */
  compact?: boolean
}) {
  return (
    <div
      className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}
      role="img"
      aria-label={`Journey: ${cells
        .map((c) => `${c.name} ${c.state === 'complete' ? 'complete' : c.state === 'in-progress' ? 'in progress' : 'not started'}`)
        .join(', ')}`}
    >
      {cells.map((cell, i) => (
        <div key={cell.key} className="flex items-center">
          <div className={`flex ${compact ? 'flex-row items-center gap-1.5' : 'flex-col items-center gap-1'}`}>
            <StationMark cell={cell} />
            {!compact && (
              <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
                {cell.name}
              </span>
            )}
          </div>
          {i < cells.length - 1 && (
            <span
              aria-hidden="true"
              className={`${compact ? 'w-3 ml-2' : 'w-5 ml-3'} h-px`}
              style={{ background: 'var(--color-line)' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
