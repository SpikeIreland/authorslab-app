'use client'

/**
 * ProjectTabStrip — horizontal tab strip across the top of every project page.
 *
 * AL-UX-004 §5 (Phase 4): full state-grammar restyle in the Manuscript Room
 * palette.
 *
 *   complete : sage-deep ✓, ink label
 *   active   : filled sage dot + sage-bg halo, ink label semibold
 *   pending  : hollow ring, muted label
 *   skipped  : hollow dashed ring + "Not needed" chip on hover
 *              (NO strikethrough, NO italic — those read as broken)
 *
 * Layout: Overview → | → journey tabs → | → tool tabs (Research + Script)
 * Script keeps its "Soon" pill as a small-caps chip, not italics.
 *
 * Client Component because it needs usePathname() to know which tab is open.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RELEASED } from '@/lib/feature-flags'

type StageState = 'pending' | 'active' | 'complete' | 'skipped'

const JOURNEY_TABS = [
  { id: 'ghostwriter', label: 'Ghostwriter' },
  { id: 'author-studio', label: 'Author Studio' },
  { id: 'design', label: 'Design' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'marketing', label: 'Marketing' },
] as const

const TOOL_TABS = [
  { id: 'research', label: 'Research' },
  { id: 'script', label: 'Script', soon: true },
] as const

// Same derivation rule as Lobby / Overview stepper, so a project's state stays
// consistent everywhere it's rendered.
function deriveTabState(
  tabId: string,
  phase: number | null,
  status: string | null,
): StageState {
  if (status === 'complete') {
    return tabId === 'ghostwriter' ? 'skipped' : 'complete'
  }
  if (status === 'ghostwriting') {
    if (tabId === 'ghostwriter') return 'active'
    return 'pending'
  }
  // Existing manuscripts (uploaded via legacy onboarding) skipped Ghostwriter.
  if (tabId === 'ghostwriter') return 'skipped'

  const p = phase ?? 1
  if (tabId === 'author-studio') {
    if (p >= 1 && p <= 3) return 'active'
    return p > 3 ? 'complete' : 'pending'
  }
  if (tabId === 'design') {
    return p === 4 ? 'active' : p > 4 ? 'complete' : 'pending'
  }
  if (tabId === 'publishing') {
    return p === 4 ? 'active' : p > 4 ? 'complete' : 'pending'
  }
  if (tabId === 'marketing') {
    return p === 5 ? 'active' : 'pending'
  }
  return 'pending'
}

export function ProjectTabStrip({
  projectId,
  phase,
  status,
}: {
  projectId: string
  phase: number | null
  status: string | null
}) {
  const pathname = usePathname()
  const overviewHref = `/projects/${projectId}`
  const isCurrent = (tabId: string) => pathname === `/projects/${projectId}/${tabId}`
  const isOverviewCurrent = pathname === overviewHref

  return (
    <div
      style={{
        background: 'var(--color-paper-warm)',
        borderBottom: '1px solid var(--color-line)',
      }}
    >
      <div className="px-4 flex items-center overflow-x-auto">
        {/* Overview — always available, always the entry point back to the book */}
        <OverviewTab href={overviewHref} isCurrent={isOverviewCurrent} />

        <Divider />

        {JOURNEY_TABS.map(t => {
          // Feature-gate: journey stations held back for staged R2-R5 releases
          // render as a non-clickable "Soon" chip (same treatment as Script)
          // instead of the state-grammar dot. `author-studio` is always live.
          if (t.id !== 'author-studio' && !RELEASED[t.id]) {
            return <SoonJourneyTab key={t.id} label={t.label} />
          }
          const state = deriveTabState(t.id, phase, status)
          return (
            <JourneyTab
              key={t.id}
              href={`/projects/${projectId}/${t.id}`}
              label={t.label}
              state={state}
              isCurrent={isCurrent(t.id)}
            />
          )
        })}

        <Divider />

        {TOOL_TABS.map(t => (
          <ToolTab
            key={t.id}
            href={`/projects/${projectId}/${t.id}`}
            label={t.label}
            soon={'soon' in t ? t.soon : false}
            isCurrent={isCurrent(t.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Tab building blocks
// ============================================================================

const TAB_BASE = 'relative px-3 py-3 text-[13.5px] whitespace-nowrap inline-flex items-center gap-2 transition-colors'

/** Underline shown under the currently-selected tab. */
function ActiveUnderline() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-3 right-3 -bottom-px h-[2px]"
      style={{ background: 'var(--color-ink)' }}
    />
  )
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-2"
      style={{ width: 1, height: 20, background: 'var(--color-line)' }}
    />
  )
}

function OverviewTab({ href, isCurrent }: { href: string; isCurrent: boolean }) {
  return (
    <Link
      href={href}
      className={TAB_BASE}
      style={{
        color: isCurrent ? 'var(--color-ink)' : 'var(--color-muted)',
        fontWeight: isCurrent ? 600 : 500,
      }}
      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.color = 'var(--color-ink)' }}
      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.color = 'var(--color-muted)' }}
    >
      {/* Small book-spine glyph so Overview reads as "the book itself", not another journey step. */}
      <span
        aria-hidden="true"
        className="inline-block rounded-[1px]"
        style={{
          width: 3,
          height: 12,
          background: isCurrent ? 'var(--color-ink)' : 'var(--color-faint)',
        }}
      />
      Overview
      {isCurrent && <ActiveUnderline />}
    </Link>
  )
}

function JourneyTab({
  href,
  label,
  state,
  isCurrent,
}: {
  href: string
  label: string
  state: StageState
  isCurrent: boolean
}) {
  const { colour, weight, tooltip } = journeyStyle(state, isCurrent)

  return (
    <Link
      href={href}
      className={TAB_BASE}
      title={tooltip}
      style={{ color: colour, fontWeight: weight }}
      onMouseEnter={(e) => {
        if (!isCurrent && state !== 'skipped') e.currentTarget.style.color = 'var(--color-ink)'
      }}
      onMouseLeave={(e) => { e.currentTarget.style.color = colour }}
    >
      <StageMarker state={state} isCurrent={isCurrent} />
      <span>{label}</span>
      {state === 'skipped' && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{
            background: 'transparent',
            border: '1px dashed var(--color-faint)',
            color: 'var(--color-faint)',
            letterSpacing: '0.08em',
          }}
        >
          Not needed
        </span>
      )}
      {isCurrent && <ActiveUnderline />}
    </Link>
  )
}

/**
 * SoonJourneyTab — station is built/specced but held back for a staged
 * release. Reuses the Script tab's "Soon" chip so the tease reads the same
 * everywhere. Renders as a non-clickable span (no href, no navigation).
 */
function SoonJourneyTab({ label }: { label: string }) {
  return (
    <span
      className={TAB_BASE}
      style={{
        color: 'var(--color-faint)',
        fontWeight: 400,
        cursor: 'default',
      }}
    >
      <span>{label}</span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
        style={{
          background: 'var(--color-amber-bg)',
          color: 'var(--color-muted)',
          letterSpacing: '0.1em',
          fontWeight: 500,
        }}
      >
        Soon
      </span>
    </span>
  )
}

function ToolTab({
  href,
  label,
  soon,
  isCurrent,
}: {
  href: string
  label: string
  soon: boolean
  isCurrent: boolean
}) {
  const colour = isCurrent
    ? 'var(--color-ink)'
    : soon ? 'var(--color-faint)' : 'var(--color-muted)'

  return (
    <Link
      href={href}
      className={TAB_BASE}
      style={{
        color: colour,
        fontWeight: isCurrent ? 600 : 400,
      }}
      onMouseEnter={(e) => { if (!isCurrent && !soon) e.currentTarget.style.color = 'var(--color-ink)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = colour }}
    >
      <span>{label}</span>
      {soon && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{
            background: 'var(--color-amber-bg)',
            color: 'var(--color-muted)',
            letterSpacing: '0.1em',
            fontWeight: 500,
          }}
        >
          Soon
        </span>
      )}
      {isCurrent && <ActiveUnderline />}
    </Link>
  )
}

// ============================================================================
// State grammar
// ============================================================================

function journeyStyle(state: StageState, isCurrent: boolean): {
  colour: string
  weight: number
  tooltip?: string
} {
  if (isCurrent) return { colour: 'var(--color-ink)', weight: 600 }
  if (state === 'complete') return { colour: 'var(--color-sage-deep)', weight: 500 }
  if (state === 'active') return { colour: 'var(--color-ink)', weight: 600 }
  if (state === 'skipped') return { colour: 'var(--color-faint)', weight: 400, tooltip: 'Not part of this journey' }
  return { colour: 'var(--color-muted)', weight: 400 }
}

/** Dot/check/ring shown before the label per the state grammar. */
function StageMarker({ state, isCurrent }: { state: StageState; isCurrent: boolean }) {
  // Current tab: no leading marker — the underline carries the affordance,
  // and the label weight is already bumped.
  if (isCurrent) return null

  if (state === 'complete') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center rounded-full text-[9px] font-bold"
        style={{
          width: 14,
          height: 14,
          background: 'var(--color-sage-bg)',
          color: 'var(--color-sage-deep)',
        }}
      >
        ✓
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center"
        style={{
          padding: 2,
          borderRadius: 999,
          background: 'var(--color-sage-bg)',
        }}
      >
        <span
          className="inline-block rounded-full"
          style={{ width: 8, height: 8, background: 'var(--color-sage)' }}
        />
      </span>
    )
  }
  if (state === 'skipped') {
    return (
      <span
        aria-hidden="true"
        className="inline-block rounded-full"
        style={{
          width: 8,
          height: 8,
          border: '1px dashed var(--color-faint)',
          background: 'transparent',
        }}
      />
    )
  }
  // pending
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-full"
      style={{
        width: 8,
        height: 8,
        border: '1px solid var(--color-line)',
        background: 'transparent',
      }}
    />
  )
}
