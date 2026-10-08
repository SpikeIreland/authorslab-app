'use client'

/**
 * PUBLISHER TAB STRIP — the per-book NAVIGATION for the publisher journey.
 *
 * ─── Why this file exists (A1, 2026-10-06) ──────────────────────────────────
 *
 * Three of the five journey nodes were already built — Overview
 * (`/publisher/[projectId]`), the reading room (`/read`) and the cover studio
 * (`/cover`) — and NOTHING navigated between them. `PublisherNav` carries the
 * two HOUSE-level views of the list; `PublisherJourneyStrip` is a state
 * display that says so in its own header ("nothing in this component is a
 * link"). Neither is per-book navigation, and per-book navigation was not any
 * lane's node, so it was never built.
 *
 * The consequence, measured: a publisher clicked a title on `/publisher`,
 * landed on Overview, and the journey visibly ended. The reading room and the
 * cover studio — the two things a publisher actually came to do — were
 * reachable ONLY by typing the URL. Paul's "something is still not landing
 * that feels like a sensible publisher's journey" was reading exactly this.
 *
 * HOUSE RULE EARNED: when a journey has no navigation, every lane builds the
 * index instead, because the index is the only page that is reachable.
 *
 * ─── The journey ────────────────────────────────────────────────────────────
 *
 * Paul's direction, stated consistently: the author's per-book journey, minus
 * Wright, Research and Script, rendered in the third person.
 *
 *   author:    Overview · Wright · Author Studio · Design · Publishing · Marketing
 *   publisher: Overview · Manuscript  ·  Design · Publishing · Marketing
 *
 * `Manuscript` rather than `Author Studio` is the third-person render of the
 * same node — R7's noun, and the reading room is where it lives.
 *
 * ─── What is LIFTED, not invented ───────────────────────────────────────────
 *
 * TAB_BASE, the active underline and the "Soon" chip are taken VERBATIM from
 * the author's `ProjectTabStrip` so the two products cannot drift apart
 * visually — the same reason `StationMark` moved verbatim on 2026-10-02. This
 * file adds no colour and no new vocabulary.
 *
 * ─── An affordance is a claim ───────────────────────────────────────────────
 *
 * Publishing and Marketing are NOT links: they render in the author strip's
 * existing `soon` state — a non-clickable span with the chip. Present, visibly
 * not yet. A tab that navigated to a page that does not exist would be the
 * defect this file was written to close, re-created in the act of closing it.
 *
 * CORRECTED 2026-10-08. This comment previously said those two "have no
 * publisher render yet", and `marketing-hub` pointed out that the repository
 * contradicts it: `MarketingStation.tsx` exists (14.9KB, read-only by design,
 * R9 marker conditional on provenance) and `publishing`'s PublishingStation
 * exists with a membership-gated route behind it. Both are UNMOUNTED, not
 * absent — B1 and B2 are therefore a MOUNT, not a build.
 *
 * The `soon` state is still the honest render today, because unmounted is
 * unreachable from here and the RESET freezes the method. But the reason had to
 * change: "does not exist" was a claim about the estate, and it was false.
 * A comment is a reference, and a reference is a claim.
 */

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

const TAB_BASE =
  'relative px-3 py-3 text-[13.5px] whitespace-nowrap inline-flex items-center gap-2 transition-colors'

/** Underline shown under the currently-selected tab. Lifted verbatim. */
function ActiveUnderline() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-3 right-3 -bottom-px h-[2px]"
      style={{ background: 'var(--color-ink, #1A1A1A)' }}
    />
  )
}

/** The author strip's "Soon" chip, lifted verbatim. */
function SoonChip() {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
      style={{
        background: 'var(--color-amber-bg, #FBF3E4)',
        color: 'var(--color-muted, #6B6B6B)',
        letterSpacing: '0.1em',
        fontWeight: 500,
      }}
    >
      Soon
    </span>
  )
}

/** The journey, in order. `path` is appended to /publisher/[projectId]. */
const NODES = [
  { key: 'overview', label: 'Overview', path: '' },
  { key: 'manuscript', label: 'Manuscript', path: '/read' },
  { key: 'design', label: 'Design', path: '/cover' },
  { key: 'publishing', label: 'Publishing', path: null },
  { key: 'marketing', label: 'Marketing', path: null },
] as const

export function PublisherTabStrip() {
  const pathname = usePathname()
  const params = useParams<{ projectId: string }>()
  const projectId = params?.projectId

  // No id means this is not a per-book surface; claim nothing.
  if (!projectId) return null

  const base = `/publisher/${projectId}`

  return (
    <nav
      aria-label="This title"
      className="border-b"
      style={{ borderColor: '#E8E5E0', background: '#FFFFFF' }}
    >
      <div className="max-w-[1200px] mx-auto px-8 flex items-center gap-1 overflow-x-auto">
        {NODES.map((n) => {
          if (n.path === null) {
            return (
              <span
                key={n.key}
                className={TAB_BASE}
                style={{ color: 'var(--color-faint, #8A8A8A)', fontWeight: 400, cursor: 'default' }}
              >
                <span>{n.label}</span>
                <SoonChip />
              </span>
            )
          }

          const href = `${base}${n.path}`
          const isCurrent = pathname === href

          return (
            <Link
              key={n.key}
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
              className={TAB_BASE}
              style={{
                color: isCurrent ? 'var(--color-ink, #1A1A1A)' : 'var(--color-muted, #6B6B6B)',
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              <span>{n.label}</span>
              {isCurrent && <ActiveUnderline />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
