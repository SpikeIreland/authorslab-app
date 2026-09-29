/**
 * LOBBY DERIVATIONS — the two registers and the risk judgement, as pure
 * functions so they can be PROVEN to discriminate rather than observed to
 * render.
 *
 * House rule, earned twice on 2026-09-28:
 *   "An instrument whose pass state is indistinguishable from its fail state
 *    is not an instrument."
 *
 * A Lobby that loads is not evidence that its register split works — a split
 * wired to return 'line' unconditionally produces a page that loads too. These
 * functions exist apart from the route so `scripts/verify-lobby-derive.ts` can
 * exercise them with NEGATIVE CONTROLS that must not move.
 */

export type Register = 'list' | 'line'
export type RiskBasis = 'date' | 'stall' | 'none'
export type Risk =
  | 'overdue'
  | 'at-risk'
  | 'stalled'
  | 'moving'
  | 'not-started'
  | 'handed-off'

export interface PhaseFact {
  phase_number: number
  phase_status: string
  /** 'system' | 'human' | null. Absent entirely when the column is unapplied. */
  completion_source?: string | null
}

/** Our seven stations end here. Beyond this is somebody else's pipeline. */
export const LAST_PHASE = 5

/** Days without a station advancing before a title reads as stalled. */
export const STALL_DAYS = 14

/**
 * ON THE LINE means a station has been completed BY THE SYSTEM.
 *
 * Returns null when the discriminator is unavailable — a human mark and a
 * system completion are then indistinguishable, and the honest answer to
 * "is this in production?" is that we cannot tell. The caller must HIDE the
 * split, not caption it.
 */
export function deriveRegister(
  phases: PhaseFact[],
  discriminatorAvailable: boolean
): Register | null {
  if (!discriminatorAvailable) return null
  const hasSystemCompletion = phases.some(
    (p) => p.phase_status === 'complete' && p.completion_source === 'system'
  )
  return hasSystemCompletion ? 'line' : 'list'
}

export interface RiskInput {
  phases: PhaseFact[]
  /** Days since any station last moved; null when nothing has ever moved. */
  daysSinceActivity: number | null
  /** Days until the launch date; null when no launch date is set. */
  daysToLaunch: number | null
}

/**
 * Risk, and WHAT IT WAS JUDGED FROM.
 *
 * `riskBasis` is the load-bearing half. Most titles in this estate have no
 * target date — `project_marketing.launch_date` is set in phase 5, the last
 * station — so lateness is not computable for a book still in production.
 * 'moving' on basis 'stall' is a claim about MOTION and never about meeting a
 * deadline nobody has set. A surface that showed "on track" computed from
 * nothing would be the level-1 failure mode: confident reporting on absence.
 */
export function deriveRisk(input: RiskInput): { risk: Risk; riskBasis: RiskBasis } {
  const { phases, daysSinceActivity, daysToLaunch } = input

  const allOursComplete = phases.some(
    (p) => p.phase_number === LAST_PHASE && p.phase_status === 'complete'
  )
  const anyStarted = phases.some((p) => p.phase_status !== 'pending')

  // Checked before everything else: our line ends here. Not "done", and not
  // "to market" — formatting and distribution have no station in this estate.
  if (allOursComplete) return { risk: 'handed-off', riskBasis: 'none' }

  if (!anyStarted) return { risk: 'not-started', riskBasis: 'none' }

  // ── A COMFORTABLE DEADLINE MUST NOT SUPPRESS A STALL ──────────────────
  // This block used to return `moving` as soon as a date existed and was more
  // than 30 days out, BEFORE the stall test ran. Found live: "A Dictionary of
  // Small Repairs" had not moved in 40 days and read as MOVING, because its
  // handoff date is Feb 2027. Setting a target date made a stalled book look
  // healthier, and the attention count fell from 5 of 9 to 4 of 9 — the
  // surface rewarded us for adding information.
  //
  // Backwards, and backwards in the direction that costs most: a stalled book
  // with a distant deadline is EXACTLY the one that quietly becomes late.
  // Nobody chases it, because the date still looks fine, right up until it
  // doesn't.
  //
  // Date and movement are independent signals. A title surfaces if EITHER is
  // bad, and precedence runs by urgency: overdue > at-risk > stalled > moving.
  if (daysToLaunch !== null) {
    if (daysToLaunch < 0) return { risk: 'overdue', riskBasis: 'date' }
    if (daysToLaunch <= 30) return { risk: 'at-risk', riskBasis: 'date' }
  }

  if (daysSinceActivity !== null && daysSinceActivity >= STALL_DAYS) {
    return { risk: 'stalled', riskBasis: 'stall' }
  }

  // Moving, with a date we are comfortably inside.
  if (daysToLaunch !== null) return { risk: 'moving', riskBasis: 'date' }

  return {
    risk: 'moving',
    riskBasis: daysSinceActivity !== null ? 'stall' : 'none',
  }
}

/** Risk order for the list. Risk-sorted, never recency-sorted. */
export const RISK_ORDER: Record<Risk, number> = {
  overdue: 0,
  'at-risk': 1,
  stalled: 2,
  'not-started': 3,
  moving: 4,
  'handed-off': 5,
}
