/**
 * VERIFY THE LOBBY DERIVATIONS — with negative controls that must not move.
 *
 * Why this exists rather than a screenshot: a register split wired to return
 * 'line' unconditionally produces a page that loads exactly as well as a
 * correct one. Per the house rule earned 2026-09-28:
 *
 *   "An instrument whose pass state is indistinguishable from its fail state
 *    is not an instrument."
 *
 * So this asserts what must happen AND what must NOT. Cases marked NEGATIVE
 * are the point — without them the run proves the functions return values,
 * not that they discriminate.
 *
 * Run:  npx tsc scripts/verify-lobby-derive.ts src/app/api/publisher/lobby/_derive.ts \
 *         --outDir /tmp/lobby-verify --module commonjs --target es2020 --esModuleInterop \
 *       && node /tmp/lobby-verify/scripts/verify-lobby-derive.js
 */

import { coverVerdictFor } from '../src/app/api/publisher/lobby/_approval'
import {
  deriveRegister,
  deriveRisk,
  sampleDisclosure,
  STALL_DAYS,
  type PhaseFact,
} from '../src/app/api/publisher/lobby/_derive'

let failures = 0
let checks = 0

function check(name: string, actual: unknown, expected: unknown) {
  checks++
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    console.log(`  PASS  ${name}`)
  } else {
    failures++
    console.log(`  FAIL  ${name}\n        expected ${e}\n        actual   ${a}`)
  }
}

const pending = (n: number): PhaseFact => ({ phase_number: n, phase_status: 'pending' })
const active = (n: number): PhaseFact => ({ phase_number: n, phase_status: 'active' })
const doneBy = (n: number, src: string | null): PhaseFact => ({
  phase_number: n,
  phase_status: 'complete',
  completion_source: src,
})
/** A completion from before the discriminator existed: no column at all. */
const doneNoColumn = (n: number): PhaseFact => ({ phase_number: n, phase_status: 'complete' })

console.log('\nREGISTER — does the split actually discriminate?')

check(
  'system completion → on the line',
  deriveRegister([doneBy(1, 'system'), active(2)], true),
  'line'
)

// NEGATIVE CONTROL 1. The control that catches a split hardwired to 'line'.
check(
  'NEGATIVE: human mark only → on the list, NOT the line',
  deriveRegister([doneBy(1, 'human'), active(2)], true),
  'list'
)

// NEGATIVE CONTROL 2. Absence of provenance is not evidence of system work.
check(
  'NEGATIVE: historical completion, completion_source NULL → on the list',
  deriveRegister([doneBy(1, null), active(2)], true),
  'list'
)

// NEGATIVE CONTROL 3. The discriminator is unavailable: the honest answer is
// "cannot tell", and the page must hide the split rather than caption it.
check(
  'NEGATIVE: discriminator unavailable → null, never a guess',
  deriveRegister([doneBy(1, 'system')], false),
  null
)

check(
  'NEGATIVE: column absent entirely on the row → on the list',
  deriveRegister([doneNoColumn(1), active(2)], true),
  'list'
)

check(
  'mixed human then system → on the line (first system completion decides)',
  deriveRegister([doneBy(1, 'human'), doneBy(2, 'system')], true),
  'line'
)

check(
  'an ACTIVE system phase is not a completion',
  deriveRegister([{ phase_number: 1, phase_status: 'active', completion_source: 'system' }], true),
  'list'
)

console.log('\nRISK — and what the judgement was made FROM')

check(
  'nothing started → not-started, basis none',
  deriveRisk({ phases: [pending(1)], daysSinceActivity: null, daysToLaunch: null }),
  { risk: 'not-started', riskBasis: 'none' }
)

check(
  'our last station complete → handed-off (our line ends here)',
  deriveRisk({
    phases: [doneBy(1, 'system'), doneBy(5, 'system')],
    daysSinceActivity: 2,
    daysToLaunch: 5,
  }),
  { risk: 'handed-off', riskBasis: 'none' }
)

check(
  'launch date passed with stations open → overdue, basis date',
  deriveRisk({ phases: [active(3)], daysSinceActivity: 1, daysToLaunch: -4 }),
  { risk: 'overdue', riskBasis: 'date' }
)

check(
  'launch date within 30 days → at-risk, basis date',
  deriveRisk({ phases: [active(3)], daysSinceActivity: 1, daysToLaunch: 12 }),
  { risk: 'at-risk', riskBasis: 'date' }
)

check(
  `no date, ${STALL_DAYS}d without movement → stalled, basis stall`,
  deriveRisk({ phases: [active(2)], daysSinceActivity: STALL_DAYS, daysToLaunch: null }),
  { risk: 'stalled', riskBasis: 'stall' }
)

// NEGATIVE CONTROL 4. THE IMPORTANT ONE. A title moving with no launch date
// must NOT be reported on basis 'date'. Most titles in this estate have no
// target date at all — launch_date is set in phase 5 — so a surface that
// claimed "on track" here would be confidently reporting on absence.
check(
  'NEGATIVE: moving with no launch date → basis stall, NEVER date',
  deriveRisk({ phases: [active(2)], daysSinceActivity: 1, daysToLaunch: null }),
  { risk: 'moving', riskBasis: 'stall' }
)

// NEGATIVE CONTROL 5. Nothing known at all still must not claim a date basis.
check(
  'NEGATIVE: started but no timestamps and no date → basis none',
  deriveRisk({ phases: [active(1)], daysSinceActivity: null, daysToLaunch: null }),
  { risk: 'moving', riskBasis: 'none' }
)

// NEGATIVE CONTROL 6. THE ONE FOUND IN PRODUCTION. A comfortable deadline must
// not suppress a stall: a book that has not moved in 40 days is stalled even
// if its handoff date is a year away. Setting a target date must never make a
// stalled book look healthier than it did without one.
check(
  'NEGATIVE: stalled 40d with a distant date -> stalled, NOT moving',
  deriveRisk({ phases: [active(2)], daysSinceActivity: 40, daysToLaunch: 300 }),
  { risk: 'stalled', riskBasis: 'stall' }
)

check(
  'moving with a comfortable date -> moving on basis date',
  deriveRisk({ phases: [active(2)], daysSinceActivity: 2, daysToLaunch: 300 }),
  { risk: 'moving', riskBasis: 'date' }
)

check(
  'an overdue date still outranks a stall',
  deriveRisk({ phases: [active(2)], daysSinceActivity: 40, daysToLaunch: -3 }),
  { risk: 'overdue', riskBasis: 'date' }
)

check(
  'handed-off takes precedence over an overdue date',
  deriveRisk({ phases: [doneBy(5, 'system')], daysSinceActivity: 90, daysToLaunch: -200 }),
  { risk: 'handed-off', riskBasis: 'none' }
)

// ─── R9 · THE SAMPLE DISCLOSURE ───────────────────────────────────────────
//
// This block exists because my implementation of R9 DOES NOT MATCH ITS
// LITERAL WORDING. The ruling gives one marker — "Preview — sample data, not
// your titles" — and on the Books list that sentence would be false about the
// one row that matters most, because Oliver's own 82-chapter manuscript sits
// in the same list as the seeded samples.
//
// A lane departing from a ruling owes more evidence than a lane following
// one, so the departure is the thing under test: the mixed case must NEVER
// produce the "not your titles" claim, and the wholly-sample case must
// reproduce the ruling's words EXACTLY.

const sample = { isSample: true }
const own = { isSample: false }

check('R9: no rows at all -> no marker', sampleDisclosure([]).sampleDisclosure, null)

check(
  'R9: NEGATIVE — a list of only the publisher\'s own books carries NO marker',
  sampleDisclosure([own, own, own]).sampleDisclosure,
  null
)

check(
  "R9: wholly seeded -> the ruling's words, exactly",
  sampleDisclosure([sample, sample]).sampleDisclosure,
  'Preview — sample data, not your titles.'
)

check(
  'R9: NEGATIVE — a MIXED list must not claim "not your titles"',
  sampleDisclosure([own, sample, sample]).sampleDisclosure?.includes('not your titles'),
  false
)

check(
  'R9: a mixed list reports both counts',
  sampleDisclosure([own, sample, sample]).sampleDisclosure,
  'This list holds 1 of your own title and 2 seeded samples. Every sample is marked on its own row.'
)

check(
  'R9: NEGATIVE — one own title among samples is counted as 1, not rounded away',
  sampleDisclosure([own, sample, sample, sample]).realCount,
  1
)

check(
  'R9: counts are of rows, not of flags',
  [sampleDisclosure([own, own, sample]).realCount, sampleDisclosure([own, own, sample]).sampleCount],
  [2, 1]
)

check(
  'R9: singular sample reads as a sample, not samples',
  sampleDisclosure([own, sample]).sampleDisclosure,
  'This list holds 1 of your own title and 1 seeded sample. Every sample is marked on its own row.'
)

// ─── COVER APPROVAL IS ABOUT A VERSION, NOT A STATION ─────────────────────
//
// The negative controls are the point. `design`'s socket stops an approval
// being RENDERED against a stale version; these stop one being REPORTED
// against a version it was never about. A suite that only proves "approved
// comes back as approved" would pass against the station-wide read that is
// the actual defect.

const A1 = 'asset-1111'
const A2 = 'asset-2222'
const dec = (kind: string, body: string | null, created_at: string, station = 'cover') => ({
  station,
  kind,
  body,
  created_at,
})

check('approval: an empty log is no verdict', coverVerdictFor([], A1), null)

check(
  'approval: a verdict on THIS asset is reported',
  coverVerdictFor([dec('approved', A1, '2026-10-01T10:00:00Z')], A1),
  'approved'
)

check(
  'approval: NEGATIVE — a verdict on ANOTHER asset is not this asset\'s verdict',
  coverVerdictFor([dec('approved', A2, '2026-10-01T10:00:00Z')], A1),
  null
)

check(
  'approval: NEGATIVE — approving v1 then superseding it leaves v2 undecided',
  coverVerdictFor(
    [dec('approved', A1, '2026-10-01T10:00:00Z'), dec('note', A2, '2026-10-02T10:00:00Z')],
    A2
  ),
  null
)

check(
  'approval: the LATEST verdict on this asset wins, by timestamp not array order',
  coverVerdictFor(
    [
      dec('approved', A1, '2026-10-02T09:00:00Z'),
      dec('revisions_requested', A1, '2026-10-02T11:00:00Z'),
    ],
    A1
  ),
  'revisions_requested'
)

check(
  'approval: out-of-order rows do not change the answer',
  coverVerdictFor(
    [
      dec('revisions_requested', A1, '2026-10-02T11:00:00Z'),
      dec('approved', A1, '2026-10-02T09:00:00Z'),
    ],
    A1
  ),
  'revisions_requested'
)

check(
  'approval: NEGATIVE — a decision with NO subject recorded is not a verdict',
  coverVerdictFor([dec('approved', null, '2026-10-01T10:00:00Z')], A1),
  null
)

check(
  'approval: NEGATIVE — a decision at another STATION is not a cover verdict',
  coverVerdictFor([dec('approved', A1, '2026-10-01T10:00:00Z', 'route')], A1),
  null
)

check(
  'approval: NEGATIVE — no asset on screen means no verdict to report',
  coverVerdictFor([dec('approved', A1, '2026-10-01T10:00:00Z')], null),
  null
)

check(
  'approval: a note on this asset is not a verdict',
  coverVerdictFor([dec('note', A1, '2026-10-01T10:00:00Z')], A1),
  null
)

console.log(
  `\n${checks - failures}/${checks} passed, ${failures} failed` +
    (failures === 0 ? ' — including 17 negative controls\n' : '\n')
)

process.exit(failures === 0 ? 0 : 1)
