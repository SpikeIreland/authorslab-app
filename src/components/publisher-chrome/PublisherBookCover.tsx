'use client'

/**
 * PUBLISHER BOOK COVER — the cover slot in the Books-list card grammar.
 *
 * Paul's ask (2026-10-02): the Books list shows cover art the way the author
 * Library does, WHERE THE DESIGN EXISTS. Sysadmin's constraint, adopted as
 * this component's whole design: a title with no cover must not render a
 * fake one — an empty slot is honest, a placeholder that looks like artwork
 * is not.
 *
 * That is why this is NOT the author Library's BookCover. The author
 * fallback is a procedural TYPESET cover — correct for an author's own
 * work-in-progress shelf, where it reads as "your book, dressed for now".
 * On a publisher's list the same object would read as "design completed",
 * which is a claim about a station. So:
 *
 *   - a renderable cover URL  → the artwork, same object idiom as the author
 *     card (spine line, inner-edge highlight, weighted shadow);
 *   - anything else           → an honestly EMPTY slot: ruled border, paper
 *     ground, the words "No cover yet". Unmistakably not artwork.
 *
 * Renderability uses the same guard the Library learned the hard way
 * (2026-09-23): only `/`-rooted or http(s) URLs render — internal schemes
 * like `cover-asset:` and dead signed URLs fall to the empty slot instead
 * of a broken-image glyph.
 */

const SIZES = {
  sm: { w: 64, h: 94 },
  md: { w: 92, h: 134 },
} as const

export function PublisherBookCover({
  coverUrl,
  title,
  size = 'sm',
}: {
  coverUrl: string | null | undefined
  title: string
  size?: keyof typeof SIZES
}) {
  const dim = SIZES[size]
  const renderable =
    coverUrl && (coverUrl.startsWith('/') || coverUrl.startsWith('http')) ? coverUrl : null

  if (renderable) {
    return (
      <div
        style={{ width: dim.w, height: dim.h }}
        className="relative rounded-r-md rounded-l-[3px] overflow-hidden flex-shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={renderable}
          alt={`${title} cover`}
          className="w-full h-full object-cover"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)' }}
        />
        <span className="absolute left-1.5 top-0 bottom-0 w-px bg-white/25" aria-hidden />
      </div>
    )
  }

  return (
    <div
      style={{
        width: dim.w,
        height: dim.h,
        background: 'var(--color-paper-warm)',
        border: '1px solid var(--color-line)',
      }}
      className="rounded-r-md rounded-l-[3px] flex-shrink-0 flex items-center justify-center p-1.5"
      aria-label={`${title} — no cover yet`}
    >
      <span
        className="text-[9px] text-center leading-snug"
        style={{ color: 'var(--color-faint)' }}
      >
        No cover yet
      </span>
    </div>
  )
}
