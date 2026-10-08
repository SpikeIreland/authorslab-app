'use client'

/**
 * PASS PROGRESS — one meter for the pass that is actually running.
 *
 * ─── FORM: a meter, not a chart ─────────────────────────────────────────────
 * A single magnitude against a known maximum. Thin mark, rounded data-end
 * anchored to the start of the track, recessive track, no axis and no gridline
 * — there is nothing to scale against but the track itself.
 *
 * ─── IT RENDERS NOTHING RATHER THAN A ZERO ──────────────────────────────────
 * `passProgress` is null when no pass is running, AND when the chapter columns
 * are empty on the row that IS running. The second case is the important one:
 * empty columns are not "zero chapters through", and a meter sitting at 0% is
 * a precise-looking claim built on an absent value. No value, no meter.
 *
 * A meter with no denominator is also refused: `of === null` means the book was
 * never chaptered, so the bar has no maximum and the component falls back to
 * the bare count in words.
 *
 * ─── COLOUR ─────────────────────────────────────────────────────────────────
 * The fill is the ink token and the track is the line token. No status hue:
 * this reports a quantity, not a condition, and the status palette in this
 * product is reserved for conditions.
 */

export function PassProgress({
  stationName,
  operator,
  progress,
}: {
  stationName: string | null
  operator: string | null
  progress: { approved: number; analyzed: number; of: number | null } | null
}) {
  if (!progress) return null

  const { approved, analyzed, of } = progress
  const label = [stationName, operator].filter(Boolean).join(' · ')

  if (of === null || of <= 0) {
    return (
      <p className="text-[11.5px]" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
        {label ? `${label} — ` : ''}
        {approved} chapters approved, {analyzed} read
        <span className="block" style={{ color: '#8A8A8A' }}>
          Chapter total not recorded, so there is nothing to measure against.
        </span>
      </p>
    )
  }

  const pct = Math.max(0, Math.min(100, Math.round((approved / of) * 100)))

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-[11.5px]" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
          {label || 'In progress'}
        </span>
        <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-ink, #1A1A1A)' }}>
          {pct}%
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 4, background: '#E5E5E3' }}
        role="progressbar"
        aria-valuenow={approved}
        aria-valuemin={0}
        aria-valuemax={of}
        aria-label={`${label || 'Current pass'}: ${approved} of ${of} chapters approved`}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'var(--color-ink, #1A1A1A)' }}
        />
      </div>
    </div>
  )
}

/**
 * STATIONS COMPLETE — "3 of 5", with the count in text.
 *
 * Deliberately a figure rather than a second meter. The row already carries
 * the station strip, which shows WHICH stations and in what state; a second
 * bar over the same facts would be two encodings of one thing, and when they
 * disagreed — because one rounded — the reader would have no way to tell
 * which was right.
 */
export function StationTally({
  stations,
}: {
  stations: readonly { state: 'complete' | 'in-progress' | 'not-started' }[]
}) {
  if (stations.length === 0) return null
  const complete = stations.filter((s) => s.state === 'complete').length
  return (
    <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
      {complete} of {stations.length} stations complete
    </span>
  )
}
