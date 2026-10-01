/**
 * How long a full manuscript read actually takes.
 *
 * The studio told authors "about 5 minutes" in five separate places. The real
 * figure is six to seven times that, and the claim survived because nobody had
 * measured it against the copy.
 *
 * MEASURED RUNS (2.3 Alex Full Manuscript Analysis, end to end):
 *   journey 97a46075   2026-09-24   47,000 words   31m 44s
 *   execution 309      2026-09-30   64,000 words   32m 55s
 *   execution 243      2026-09-24   47,000 words   31m 42s
 *
 * Note the shape: a 36% larger book took 4% longer. The five analyses run in
 * PARALLEL against the whole manuscript, so wall-clock time is dominated by
 * model latency rather than length. That is why this returns broad bands and
 * not a per-word formula — two points on a nearly flat line do not justify one,
 * and a precise-looking wrong number is worse than an honest range.
 *
 * Revise the bands when there are runs to revise them from, and update the
 * table above when you do.
 */

export interface ReadEstimate {
    /** For prose: "about 30–40 minutes". */
    label: string
    /** Lower bound in minutes, for progress UI. */
    minMinutes: number
    /** Upper bound in minutes, for progress UI. */
    maxMinutes: number
    /** False when we have no measured basis for this size and are extrapolating. */
    measured: boolean
}

export function estimateFullReadTime(wordCount: number | null | undefined): ReadEstimate {
    const words = wordCount ?? 0

    // Below the measured range. Shorter books are quicker, but we have not timed
    // one, so the band is wide and honest about it.
    if (words > 0 && words < 30_000) {
        return { label: 'about 20–30 minutes', minMinutes: 20, maxMinutes: 30, measured: false }
    }

    // The measured range: 47k and 64k both landed at ~32 minutes.
    if (words >= 30_000 && words <= 90_000) {
        return { label: 'about 30–40 minutes', minMinutes: 30, maxMinutes: 40, measured: true }
    }

    // Above the measured range. The journey timeout doubles above 80k words, so
    // the system itself already assumes these take materially longer.
    if (words > 90_000) {
        return { label: 'about 45–60 minutes', minMinutes: 45, maxMinutes: 60, measured: false }
    }

    // Word count unknown — say the typical thing rather than invent precision.
    return { label: 'about 30–40 minutes', minMinutes: 30, maxMinutes: 40, measured: false }
}
