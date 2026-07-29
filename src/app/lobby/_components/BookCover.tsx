'use client'

/**
 * BookCover — procedural typeset cover for a manuscript.
 *
 * Uses the palette rotation from `coverPaletteFor(id)` so the same book always
 * gets the same cover. If `cover_url` is set, renders the image instead.
 *
 * Two sizes:
 *   - `small` (92×134) — Library book cards
 *   - `large` (225×330) — Overview book object (Phase 3)
 */

import { coverPaletteFor } from './derivations'

interface BookCoverProps {
  id: string
  title: string
  authorName?: string
  coverUrl?: string | null
  size?: 'small' | 'large'
}

const SIZES = {
  small: { w: 92, h: 134, titleSize: 12, kickerSize: 7, padding: 10, accentH: 2 },
  large: { w: 225, h: 330, titleSize: 26, kickerSize: 10, padding: 22, accentH: 3 },
}

export function BookCover({ id, title, authorName, coverUrl, size = 'small' }: BookCoverProps) {
  const dim = SIZES[size]

  if (coverUrl) {
    return (
      <div
        style={{ width: dim.w, height: dim.h }}
        className="rounded-sm overflow-hidden flex-shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`${title} cover`}
          className="w-full h-full object-cover"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)' }}
        />
      </div>
    )
  }

  const palette = coverPaletteFor(id)

  return (
    <div
      className="rounded-sm flex-shrink-0 relative overflow-hidden"
      style={{
        width: dim.w,
        height: dim.h,
        background: palette.bg,
        color: palette.ink,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
      }}
      aria-label={`${title} cover`}
    >
      {/* Accent bar at top */}
      <div
        style={{
          background: palette.accent,
          height: dim.accentH,
          width: '40%',
          marginTop: dim.padding,
          marginLeft: dim.padding,
        }}
      />
      {/* Typeset title + author */}
      <div
        className="flex flex-col justify-end absolute inset-0"
        style={{ padding: dim.padding, paddingTop: dim.padding + dim.accentH + 6 }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: dim.titleSize,
            lineHeight: 1.15,
            fontWeight: 400,
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
        >
          {title}
        </div>
        {authorName && (
          <div
            style={{
              fontSize: dim.kickerSize,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              opacity: 0.75,
              marginTop: 8,
            }}
          >
            {authorName}
          </div>
        )}
      </div>
    </div>
  )
}
