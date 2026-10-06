'use client'

/**
 * COLLATERAL — the house's shelf for one title.
 *
 * A lift of the author Overview's `ShelfDocuments` (AL-UX-004 §4), which Paul
 * named on 2026-10-06 as the reason the author's Overview is the better page:
 * "it contains things like the collateral list."
 *
 * Kept verbatim: the coloured spine per document kind, so the list reads as a
 * shelf of objects rather than a bland download list. That was the whole
 * point of the original and it is the part worth carrying.
 *
 * Changed, and only this: the heading. "On your shelf" is the author's
 * possessive about their own book. For the house the noun is `Collateral` —
 * what the line produced for this title.
 *
 * The author's original upload is deliberately NOT here; see the route header.
 */

import type { PublisherCollateralDoc } from '@/app/api/publisher/projects/[id]/overview/route'

export function CollateralShelf({ docs }: { docs: PublisherCollateralDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: '#8A8A8A' }}>
          Collateral
        </p>
        {/* Honest absence. "No documents" would be a claim about a list we
            have; this says what will put something in it. */}
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#8A8A8A' }}>
          Nothing yet. Documents appear here as each station finishes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: '#8A8A8A' }}>
        Collateral
      </p>
      <ul className="space-y-1">
        {docs.map((doc) => (
          <li key={doc.id}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-1.5 px-1 -mx-1 rounded transition-colors group"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F2F0EC' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <DocSpine kind={doc.kind} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-tight truncate" style={{ color: '#1A1A1A' }}>
                  {doc.label}
                </p>
                {doc.meta && (
                  <p className="text-[11px] leading-tight mt-0.5" style={{ color: '#6B6B6B' }}>
                    {doc.meta}
                  </p>
                )}
              </div>
              <span
                className="text-[11px] transition-opacity opacity-0 group-hover:opacity-100 whitespace-nowrap"
                style={{ color: '#1E3A5F' }}
              >
                Open &rarr;
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Small coloured spine — the "book" for each shelf entry. Lifted. */
function DocSpine({ kind }: { kind: PublisherCollateralDoc['kind'] }) {
  return (
    <span
      className="inline-block flex-shrink-0 rounded-[1px]"
      style={{
        width: 4,
        height: 32,
        background: spineFor(kind),
        boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
      }}
      aria-hidden="true"
    />
  )
}

function spineFor(kind: PublisherCollateralDoc['kind']): string {
  if (kind === 'assessment') return 'var(--color-sage, #7C9A7E)'
  if (kind === 'line_notes') return 'var(--color-terracotta, #B5654A)'
  if (kind === 'copy_notes') return 'var(--color-sage-deep, #4E6B51)'
  if (kind === 'draft') return 'var(--color-charcoal, #2E2E2E)'
  if (kind === 'cover') return '#A98A6B'
  return '#8A8A8A'
}
