/**
 * Overview tab derivations — greeting templates + stepper copy per AL-UX-004
 * §4. Phase 1 uses templated messages per phase/status; a future iteration can
 * feed the editor greeting through the existing AI infra.
 */

import type { OverviewPayload, OverviewPhase } from '@/app/api/projects/[id]/overview/route'

export type Persona = 'Eden' | 'Alex' | 'Sam' | 'Jordan' | 'Taylor' | 'Riley' | 'Ivy' | 'Reid'

/**
 * Which persona owns the greeting card for this project state?
 *   - ghostwriting → Eden
 *   - phase 1-3 → editor for that phase
 *   - phase 4 → Taylor (publishing)
 *   - phase 5 → Riley (marketing)
 *   - complete → Riley (post-launch lives with Marketing)
 */
export function greetingPersona(payload: OverviewPayload): Persona {
  const { status, current_phase_number } = payload.manuscript
  if (status === 'ghostwriting') return 'Eden'
  if (status === 'complete') return 'Riley'
  const phase = current_phase_number ?? 1
  if (phase === 1) return 'Alex'
  if (phase === 2) return 'Sam'
  if (phase === 3) return 'Jordan'
  if (phase === 4) return 'Taylor'
  return 'Riley'
}

/** Phase label used in the kicker ("Author Studio · Line edit"). */
export function greetingKicker(payload: OverviewPayload): string {
  const { status, current_phase_number } = payload.manuscript
  if (status === 'ghostwriting') return 'Ghostwriter · Drafting'
  if (status === 'complete') return 'Marketing · Launched'
  const phase = current_phase_number ?? 1
  if (phase === 1) return 'Author Studio · Developmental edit'
  if (phase === 2) return 'Author Studio · Line edit'
  if (phase === 3) return 'Author Studio · Copy edit'
  if (phase === 4) return 'Publishing · Preparing to launch'
  if (phase === 5) return 'Marketing · Launch plan'
  return 'In progress'
}

/**
 * Editor greeting message. Templated by phase/status. Tone: warm, direct,
 * one to two sentences.
 */
export function greetingMessage(payload: OverviewPayload): { headline: string; body: string } {
  const { status, current_phase_number, title } = payload.manuscript
  const progress = payload.current_progress

  if (status === 'ghostwriting') {
    return {
      headline: 'Ready when you are.',
      body: `Eden's holding your project. Book a session and she'll introduce your ghostwriter.`,
    }
  }
  if (status === 'complete') {
    return {
      headline: 'Live and out in the world.',
      body: `Riley can walk you through recent activity, or help you plan a promo push.`,
    }
  }

  const phase = current_phase_number ?? 1
  if (phase === 1) {
    return {
      headline: 'Alex has read your manuscript.',
      body: progress
        ? `You're on ${progress.label.toLowerCase()}. Open the studio to keep working through Alex's developmental notes.`
        : `Open the studio to walk through Alex's developmental notes together, one chapter at a time.`,
    }
  }
  if (phase === 2) {
    return {
      headline: 'Sam is on the line pass.',
      body: progress
        ? `You're on ${progress.label.toLowerCase()}. Sam has line-level suggestions ready — pick up where you left off.`
        : `Sam has line-level suggestions ready — sentence-by-sentence work on flow, voice, and clarity.`,
    }
  }
  if (phase === 3) {
    return {
      headline: 'Jordan is polishing the final pass.',
      body: progress
        ? `You're on ${progress.label.toLowerCase()}. Copy-edit corrections are ready for your sign-off.`
        : `Copy-edit corrections are ready for your sign-off — grammar, punctuation, consistency.`,
    }
  }
  if (phase === 4) {
    return {
      headline: `Taylor's ready to set up the launch.`,
      body: `Cover, metadata, platforms. Open Publishing to work through the checklist with Taylor.`,
    }
  }
  if (phase === 5) {
    return {
      headline: `Riley's ready to plan ${title}'s launch.`,
      body: `Positioning, audience, campaign plan. Open Marketing to start with Riley.`,
    }
  }
  return {
    headline: 'Keep going.',
    body: 'Open the studio to pick up where you left off.',
  }
}

/**
 * Primary CTA — jumps into the phase-appropriate tab.
 * Returns `href` (target tab route) and `label` (button copy).
 */
export function primaryCta(payload: OverviewPayload): { href: string; label: string } {
  const projectId = payload.manuscript.id
  const { status, current_phase_number } = payload.manuscript

  if (status === 'ghostwriting') {
    return { href: `/projects/${projectId}/ghostwriter`, label: 'Continue with Eden →' }
  }
  if (status === 'complete') {
    return { href: `/projects/${projectId}/marketing`, label: 'Open Marketing →' }
  }
  const phase = current_phase_number ?? 1
  if (phase >= 1 && phase <= 3) {
    const editor = phase === 1 ? 'Alex' : phase === 2 ? 'Sam' : 'Jordan'
    return { href: `/projects/${projectId}/author-studio`, label: `Continue with ${editor} →` }
  }
  if (phase === 4) {
    return { href: `/projects/${projectId}/publishing`, label: 'Continue with Taylor →' }
  }
  if (phase === 5) {
    return { href: `/projects/${projectId}/marketing`, label: 'Continue with Riley →' }
  }
  return { href: `/projects/${projectId}/author-studio`, label: 'Open project →' }
}

/**
 * Secondary CTA — points to the current phase's report/notes if available.
 */
export function secondaryCta(payload: OverviewPayload): { href: string; label: string } | null {
  const { current_phase_number } = payload.manuscript
  const phase = current_phase_number ?? 1
  const currentPhaseRow = payload.phases.find(p => p.phase_number === phase)
  if (currentPhaseRow?.report_pdf_url) {
    const editor = currentPhaseRow.editor_name
    return {
      href: currentPhaseRow.report_pdf_url,
      label: editor ? `Read ${editor}'s notes` : 'Read notes',
    }
  }
  return null
}

// ============================================================================
// Journey stepper copy
// ============================================================================

export interface StepperStep {
  phase_number: number
  label: string
  editor: string | null
  status: OverviewPhase['phase_status']
  /** Body copy shown under the label. */
  copy: string
  /** For the live step: progress meter text. */
  progressLabel?: string
  /** For the live step: 0..1 fill. */
  progressFill?: number
  /** For the step after live: gate hint. */
  gateHint?: string
  /** Route target for the step's mini-CTA. */
  href: string
  /** Mini-CTA label. */
  ctaLabel: string
}

const STEP_LABELS: Record<number, { label: string; copy: string; hrefSuffix: string; cta: string }> = {
  1: {
    label: 'Developmental edit',
    copy: 'Structure, characters, plot, pacing — the foundation.',
    hrefSuffix: 'author-studio',
    cta: 'Open with Alex →',
  },
  2: {
    label: 'Line edit',
    copy: 'Voice, flow, word choice — sentence by sentence.',
    hrefSuffix: 'author-studio',
    cta: 'Open with Sam →',
  },
  3: {
    label: 'Copy edit',
    copy: 'Grammar, punctuation, consistency — the final polish.',
    hrefSuffix: 'author-studio',
    cta: 'Open with Jordan →',
  },
  4: {
    label: 'Publishing',
    copy: 'Cover, metadata, formatting — ready the book for shelves.',
    hrefSuffix: 'publishing',
    cta: 'Open Publishing →',
  },
  5: {
    label: 'Marketing',
    copy: 'Positioning, audience, launch plan.',
    hrefSuffix: 'marketing',
    cta: 'Open Marketing →',
  },
}

function gateHintFor(phase: number, editor: string | null): string {
  if (phase === 2) return `Unlocks after your sign-off on ${editor ?? 'Alex'}'s developmental pass.`
  if (phase === 3) return `Unlocks after your sign-off on ${editor ?? 'Sam'}'s line-edit pass.`
  if (phase === 4) return `Unlocks after the copy-edit pass is signed off.`
  if (phase === 5) return `Unlocks once the book is ready to publish.`
  return ''
}

export function stepperSteps(payload: OverviewPayload): StepperStep[] {
  const projectId = payload.manuscript.id
  const activePhase = payload.phases.find(p => p.phase_status === 'active')?.phase_number ?? null

  return payload.phases.map(p => {
    const meta = STEP_LABELS[p.phase_number]
    const isLive = p.phase_status === 'active'
    const isNextUp = activePhase !== null && p.phase_number === activePhase + 1 && p.phase_status === 'pending'

    let progressLabel: string | undefined
    let progressFill: number | undefined
    if (isLive && payload.current_progress && payload.current_progress.phase_number === p.phase_number) {
      progressLabel = payload.current_progress.label
      progressFill = payload.current_progress.total > 0
        ? payload.current_progress.approved / payload.current_progress.total
        : 0
    }

    return {
      phase_number: p.phase_number,
      label: meta.label,
      editor: p.editor_name,
      status: p.phase_status,
      copy: meta.copy,
      progressLabel,
      progressFill,
      gateHint: isNextUp ? gateHintFor(p.phase_number, payload.phases[p.phase_number - 2]?.editor_name ?? null) : undefined,
      href: `/projects/${projectId}/${meta.hrefSuffix}`,
      ctaLabel: meta.cta,
    }
  })
}

/** Format a date for the meta line under the cover. */
export function formatUploadedDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
