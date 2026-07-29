'use client'

/**
 * JourneyStepper — right column, five vertical steps in the state grammar.
 *
 * Per AL-UX-004 §4: complete = sage-deep ✓ chip, active = filled sage dot +
 * halo with per-step progress meter and mini-CTA, next-up = gate-hint line,
 * pending = hollow dot, skipped = hollow dashed (no strikethrough).
 */

import Link from 'next/link'
import { stepperSteps, type StepperStep } from './overviewDerivations'
import type { OverviewPayload } from '@/app/api/projects/[id]/overview/route'

interface JourneyStepperProps {
  payload: OverviewPayload
}

export function JourneyStepper({ payload }: JourneyStepperProps) {
  const steps = stepperSteps(payload)

  return (
    <section>
      <p className="kicker mb-4">The journey</p>
      <ol className="relative">
        {/* Vertical line running through all step dots. */}
        <span
          aria-hidden="true"
          className="absolute left-[11px] top-3 bottom-3 w-px"
          style={{ background: 'var(--color-line)' }}
        />

        {steps.map((step, i) => (
          <Step key={step.phase_number} step={step} isLast={i === steps.length - 1} />
        ))}
      </ol>
    </section>
  )
}

function Step({ step, isLast }: { step: StepperStep; isLast: boolean }) {
  const isLive = step.status === 'active'
  const isNextUp = step.gateHint !== undefined
  const isSkipped = step.status === 'skipped'
  const isComplete = step.status === 'complete'

  const labelColour = isSkipped ? 'var(--color-faint)'
    : (isLive || isComplete) ? 'var(--color-ink)'
    : 'var(--color-muted)'

  const labelWeight = isLive ? 600 : isComplete ? 500 : 400

  return (
    <li className={`relative pl-9 ${isLast ? '' : 'pb-6'}`}>
      <StageDot step={step} />
      <div className="pt-0.5">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className="text-[14px] leading-tight"
            style={{ color: labelColour, fontWeight: labelWeight }}
          >
            {step.label}
          </p>
          {step.editor && !isSkipped && (
            <p className="text-[12px]" style={{ color: 'var(--color-muted)' }}>
              {isLive ? `with ${step.editor}` : `· ${step.editor}`}
            </p>
          )}
          {isSkipped && (
            <span
              className="text-[10.5px] px-1.5 py-0.5 rounded"
              style={{
                background: 'transparent',
                border: '1px dashed var(--color-faint)',
                color: 'var(--color-faint)',
                letterSpacing: '0.04em',
              }}
            >
              Not needed
            </span>
          )}
        </div>

        <p
          className="text-[12.5px] mt-1"
          style={{ color: isSkipped ? 'var(--color-faint)' : 'var(--color-muted)' }}
        >
          {step.copy}
        </p>

        {/* Live step: progress meter + mini-CTA */}
        {isLive && (
          <div className="mt-3 space-y-2">
            {step.progressLabel && (
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-[11.5px] font-medium" style={{ color: 'var(--color-ink)' }}>
                    {step.progressLabel}
                  </p>
                </div>
                <div
                  className="relative rounded-full overflow-hidden"
                  style={{ height: 4, background: 'var(--color-line-soft)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(1, step.progressFill ?? 0)) * 100}%`,
                      background: 'var(--color-sage)',
                    }}
                  />
                </div>
              </div>
            )}
            <Link
              href={step.href}
              className="inline-block text-[12px] font-medium transition-transform hover:translate-x-0.5"
              style={{ color: 'var(--color-sage-deep)' }}
            >
              {step.ctaLabel}
            </Link>
          </div>
        )}

        {/* Next-up step: gate hint */}
        {isNextUp && step.gateHint && (
          <p
            className="text-[11.5px] italic mt-2"
            style={{ color: 'var(--color-muted)' }}
          >
            {step.gateHint}
          </p>
        )}

        {/* Complete step: subtle done marker */}
        {isComplete && (
          <p
            className="text-[11.5px] mt-1"
            style={{ color: 'var(--color-sage-deep)' }}
          >
            Complete
          </p>
        )}
      </div>
    </li>
  )
}

function StageDot({ step }: { step: StepperStep }) {
  const state = step.status
  const halo = state === 'active'

  return (
    <span
      className="absolute left-0 top-0.5 inline-flex items-center justify-center"
      style={halo ? { padding: 4, background: 'var(--color-sage-bg)', borderRadius: 999 } : {}}
    >
      <Dot state={state} number={step.phase_number} />
    </span>
  )
}

function Dot({ state, number }: { state: StepperStep['status']; number: number }) {
  if (state === 'complete') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          width: 18,
          height: 18,
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
        className="inline-flex items-center justify-center rounded-full text-[10px] font-semibold"
        style={{
          width: 14,
          height: 14,
          background: 'var(--color-sage)',
          color: 'var(--color-paper)',
        }}
      >
        {number}
      </span>
    )
  }
  if (state === 'skipped') {
    return (
      <span
        className="inline-block rounded-full"
        style={{
          width: 16,
          height: 16,
          border: '1px dashed var(--color-faint)',
          background: 'transparent',
        }}
      />
    )
  }
  // pending
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[10px]"
      style={{
        width: 16,
        height: 16,
        border: '1px solid var(--color-line)',
        background: 'var(--color-paper)',
        color: 'var(--color-faint)',
      }}
    >
      {number}
    </span>
  )
}
