/**
 * Typographic safety for the editing surface.
 *
 * ── Why this module exists ───────────────────────────────────────────────────
 * `highlightTextInEditor` used to rewrite the editor's ENTIRE innerHTML,
 * replacing every curly quote with its ASCII equivalent, so that Mark.js could
 * match an issue's `quoted_text`. It saved `originalHTML` and never restored
 * it. The author's next keystroke read `innerText` — now ASCII — into the
 * pending-save ref, and the three-second autosave committed it.
 *
 * So a READ-ONLY click destroyed an author's typography and persisted it
 * unasked, silently, on live manuscripts. Found by `publisher` on 2026-10-09
 * while lifting the chapter reader; released by `sysadmin` the same day as
 * outranking everything else in this lane.
 *
 * The defect was never the normalisation. It was the normalisation ESCAPING
 * into the document the author is editing. So:
 *
 *   - `quoteTolerantRegExp` matches curly and straight quotes against each
 *     other WITHOUT touching the DOM. Nothing is rewritten, so nothing can
 *     leak into a save.
 *   - `wouldFlattenTypography` is the control that can fail: a save whose
 *     outgoing text has lost every curly quote the loaded text had is refused.
 *     One keystroke cannot legitimately remove all of them, so this is a
 *     statement about the shape of the change rather than a guess at intent.
 */

const CURLY_QUOTES = /[“”‘’]/g

/** How many typographic (curly) quote marks a string contains. */
export function countCurlyQuotes(text: string | null | undefined): number {
  if (!text) return 0
  return (text.match(CURLY_QUOTES) || []).length
}

/**
 * Each quote character matches any of its own family, so `quoted_text` stored
 * with straight quotes still finds a chapter written with curly ones.
 */
const QUOTE_FAMILY: Record<string, string> = {
  '"': '["“”]',
  '“': '["“”]',
  '”': '["“”]',
  "'": "['‘’]",
  '‘': "['‘’]",
  '’': "['‘’]",
}

/**
 * Build a matcher for `needle` that is tolerant of quote style and of runs of
 * whitespace, and escapes everything else. Replaces the old approach of
 * flattening both sides to ASCII first.
 */
export function quoteTolerantRegExp(needle: string): RegExp {
  const words = needle.trim().split(/\s+/).filter(Boolean)
  const pattern = words
    .map((word) =>
      word
        .split('')
        .map((ch) => QUOTE_FAMILY[ch] ?? ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('')
    )
    .join('\\s+')
  return new RegExp(pattern, 'gi')
}

/**
 * True when persisting `outgoing` over `loaded` would remove every curly quote
 * the chapter had. Callers must refuse the write and say so.
 */
export function wouldFlattenTypography(
  loaded: string | null | undefined,
  outgoing: string | null | undefined
): boolean {
  const before = countCurlyQuotes(loaded)
  if (before === 0) return false
  return countCurlyQuotes(outgoing) === 0
}
