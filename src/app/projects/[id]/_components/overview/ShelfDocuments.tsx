'use client'

/**
 * ShelfDocuments — "On your shelf" list of documents produced for this project.
 *
 * Per AL-UX-004 §4 left column: assessment PDFs, line notes, copy notes,
 * approved drafts, cover. Coloured-spine icon per doc kind so the list reads
 * as a small shelf of objects — not a bland download list.
 */

import type { OverviewShelfDoc } from '@/app/api/projects/[id]/overview/route'

interface ShelfDocumentsProps {
  docs: OverviewShelfDoc[]
}

export function ShelfDocuments({ docs }: ShelfDocumentsProps) {
  if (docs.length === 0) {
    return (
      <div className="space-y-2">
        <p className="kicker">On your shelf</p>
        <p className="text-[12.5px]" style={{ color: 'var(--color-faint)' }}>
          Documents will appear here as each editor finishes their pass.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="kicker">On your shelf</p>
      <ul className="space-y-1">
        {docs.map(doc => (
          <li key={doc.id}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded transition-colors group"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-paper-warm)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <DocSpine kind={doc.kind} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-tight truncate" style={{ color: 'var(--color-ink)' }}>
                  {doc.label}
                </p>
                {doc.meta && (
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {doc.meta}
                  </p>
                )}
              </div>
              <span
                className="text-[11px] transition-opacity opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--color-sage-deep)' }}
              >
                Open →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Small coloured spine — the "book" for each shelf entry. */
function DocSpine({ kind }: { kind: OverviewShelfDoc['kind'] }) {
  const palette = spinePaletteFor(kind)
  return (
    <span
      className="inline-block flex-shrink-0 rounded-[1px]"
      style={{
        width: 4,
        height: 32,
        background: palette,
        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
      }}
      aria-hidden="true"
    />
  )
}

function spinePaletteFor(kind: OverviewShelfDoc['kind']): string {
  if (kind === 'assessment') return 'var(--color-sage)'
  if (kind === 'line_notes') return 'var(--color-terracotta)'
  if (kind === 'copy_notes') return 'var(--color-sage-deep)'
  if (kind === 'draft') return 'var(--color-charcoal)'
  if (kind === 'manuscript') return 'var(--color-muted)'
  if (kind === 'cover') return '#A98A6B' // Taylor's clay
  return 'var(--color-faint)'
}
