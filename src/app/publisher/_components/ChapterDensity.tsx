'use client'

/**
 * CHAPTER DENSITY — one mark per chapter, so a 69-chapter book looks like one.
 *
 * Paul asked for "visual displays of progress" on a surface that currently
 * reads as text rows. This is the texture element: the thing that makes the
 * difference between a 37-chapter novel and a 69-chapter one visible before
 * anything is read.
 *
 * ─── WHAT IT CLAIMS, AND WHAT IT DOES NOT ───────────────────────────────────
 *
 * The route gives COUNTS — `approved`, `analyzed`, `of` — not per-chapter
 * state. So this strip renders HOW MANY chapters are through, laid out in
 * order. It does NOT claim which chapters those are, and that distinction is
 * why the marks carry no tooltip naming a chapter: a per-mark tooltip saying
 * "Chapter 12 — approved" would be an assertion the data cannot support.
 *
 * It is the same discipline as the station marks: render what the column says,
 * and where the column is silent, be silent in the same shape.
 *
 * ─── IDENTITY IS NEVER COLOUR-ALONE ─────────────────────────────────────────
 * Three states in sequence, distinguished by fill. So the strip ships with a
 * visible numeric caption and an aria-label that states the same counts in
 * words. A reader who cannot separate the fills reads the numbers instead.
 *
 * No new palette: the fills are the ink/muted/line tokens already in use, and
 * the amber "running" step is StationMark's, not a new one. Status hues in this
 * product are reserved, and reusing the existing step keeps one vocabulary.
 */

export function ChapterDensity({
  total,
  approved,
  analyzed,
}: {
  /** manuscripts.total_chapters. Nothing renders without it. */
  total: number | null
  approved: number
  analyzed: number
}) {
  // No denominator, no strip. A density display with a guessed total is the
  // fallback rule wearing a nicer coat.
  if (total === null || total <= 0) return null

  const through = Math.min(approved, total)
  const reading = Math.max(0, Math.min(analyzed, total) - through)
  const untouched = Math.max(0, total - through - reading)

  // Above this, individual marks stop being legible and become noise; the
  // caption still carries the numbers, so nothing is lost but the texture.
  if (total > 140) {
    return (
      <p className="text-[11.5px]" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
        {through} of {total} chapters through
        {reading > 0 ? `, ${reading} being read` : ''}
      </p>
    )
  }

  const marks = [
    ...Array.from({ length: through }, () => 'through' as const),
    ...Array.from({ length: reading }, () => 'reading' as const),
    ...Array.from({ length: untouched }, () => 'untouched' as const),
  ]

  const caption =
    `${through} of ${total} chapters through` + (reading > 0 ? `, ${reading} being read` : '')

  return (
    <div>
      <div
        className="flex items-end gap-[2px] flex-wrap"
        role="img"
        aria-label={`Chapters: ${caption}.`}
      >
        {marks.map((m, i) => (
          <span
            key={i}
            className="inline-block rounded-[1px]"
            style={{
              width: 3,
              height: m === 'untouched' ? 7 : 11,
              background:
                m === 'through'
                  ? 'var(--color-ink, #1A1A1A)'
                  : m === 'reading'
                    ? '#FDE68A'
                    : '#E5E5E3',
            }}
          />
        ))}
      </div>
      <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-muted, #6B6B6B)' }}>
        {caption}
      </p>
    </div>
  )
}
