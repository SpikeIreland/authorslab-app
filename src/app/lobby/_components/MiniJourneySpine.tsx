'use client'

/**
 * MiniJourneySpine — compact 5-dot journey visualisation for a Library book
 * card. Applies the state grammar (complete / active / pending / skipped) per
 * AL-UX-004 §1 with the "no strikethrough, no italic-only" rule for skipped.
 *
 * Below the dot row, the live stage's detail line renders (e.g. "Line edit ·
 * Alex"). If no stage is live (all complete or all pending), the detail line
 * is empty and the row of dots stands alone.
 */

import type { StageKey, StageState } from './derivations'

const STAGE_ORDER: { key: StageKey; label: string }[] = [
  { key: 'wright', label: 'Wright' },
  { key: 'author_studio', label: 'Author Studio' },
  { key: 'design', label: 'Design' },
  { key: 'publishing', label: 'Publishing' },
  { key: 'marketing', label: 'Marketing' },
]

interface MiniJourneySpineProps {
  states: Record<StageKey, StageState>
  /** Optional detail line for the active stage (e.g. "Line edit · Alex"). */
  activeDetail?: string
}

export function MiniJourneySpine({ states, activeDetail }: MiniJourneySpineProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {STAGE_ORDER.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-1.5">
            <StageDot state={states[stage.key]} label={stage.label} />
            {i < STAGE_ORDER.length - 1 && (
              <span aria-hidden="true" className="w-3 h-px" style={{ background: 'var(--color-line)' }} />
            )}
          </div>
        ))}
      </div>
      {activeDetail && (
        <div
          className="text-[10.5px] font-medium"
          style={{ color: 'var(--color-ink)', letterSpacing: '0.01em' }}
        >
          {activeDetail}
        </div>
      )}
    </div>
  )
}

function StageDot({ state, label }: { state: StageState; label: string }) {
  // Halo wrapper adds the sage-bg ring around active dots.
  const wrapper = state === 'active'
    ? { padding: 3, borderRadius: 999, background: 'var(--color-sage-bg)' }
    : {}

  return (
    <span
      className="inline-flex items-center justify-center"
      style={wrapper}
      title={`${label} — ${labelFor(state)}`}
    >
      <Dot state={state} />
    </span>
  )
}

function Dot({ state }: { state: StageState }) {
  if (state === 'complete') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full text-[9px] font-bold"
        style={{
          width: 12,
          height: 12,
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
        className="inline-block rounded-full"
        style={{ width: 10, height: 10, background: 'var(--color-sage)' }}
      />
    )
  }
  if (state === 'skipped') {
    // Skipped = hollow + dashed — reads as "not part of this journey"
    return (
      <span
        className="inline-block rounded-full"
        style={{
          width: 10,
          height: 10,
          border: '1px dashed var(--color-faint)',
          background: 'transparent',
        }}
      />
    )
  }
  // pending
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: 10,
        height: 10,
        border: '1px solid var(--color-line)',
        background: 'transparent',
      }}
    />
  )
}

function labelFor(state: StageState) {
  if (state === 'complete') return 'Complete'
  if (state === 'active') return 'Active'
  if (state === 'skipped') return 'Not needed'
  return 'Pending'
}
