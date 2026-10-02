/**
 * VERIFY THE R9 WORDING — with negative controls that are the whole point.
 *
 * AMENDMENT 2 §4 made the marker normalisation marketing-hub's to propose:
 * "one component, one wording, one placement rule. A marker that differs per
 * station is itself a claim that the stations differ."
 *
 * A marker rule is a rule about WORDS, and a component rendering the wrong
 * words renders exactly as well as one rendering the right ones. Per the
 * house rule earned 2026-09-28:
 *
 *   "An instrument whose pass state is indistinguishable from its fail state
 *    is not an instrument."
 *
 * So the cases marked NEGATIVE assert what must NOT happen. They are what
 * separates this from a function that merely returns strings. Taken from
 * publisher's method on 2026-10-02, which is stronger than the single
 * negative control I used on the sample pack and is now the house standard.
 *
 * Run:  npx tsc scripts/verify-marker-sentence.ts src/components/preview/markerSentence.ts \
 *         --outDir /tmp/marker-verify --module commonjs --target es2020 --esModuleInterop \
 *       && node /tmp/marker-verify/scripts/verify-marker-sentence.js
 */

import { markerSentence, R9_VERBATIM, type MarkerData } from '../src/components/preview/markerSentence'

let pass = 0
let fail = 0

function check(name: string, ok: boolean, got: unknown) {
  if (ok) {
    pass++
  } else {
    fail++
    console.error(`  FAIL  ${name}\n        got: ${JSON.stringify(got)}`)
  }
}

const sample: MarkerData = { data: 'sample' }
const mixed = (ownCount: number, sampleCount: number): MarkerData => ({ data: 'mixed', ownCount, sampleCount })

// ── POSITIVE: the ruled sentence survives verbatim ────────────────────────
check('wholly-sample renders R9 verbatim', markerSentence(sample) === R9_VERBATIM, markerSentence(sample))
check('R9 verbatim is the ruled words', R9_VERBATIM === 'sample data, not your titles.', R9_VERBATIM)

// ── POSITIVE: mixed is counted, and counts are grammatical ────────────────
const m12 = markerSentence(mixed(1, 2))
check('mixed 1+2 counts both sides', m12 === 'this view holds 1 title of your own and 2 seeded samples. Every sample is marked individually.', m12)
const m31 = markerSentence(mixed(3, 1))
check('mixed 3+1 singularises the sample', m31 === 'this view holds 3 titles of your own and 1 seeded sample. Every sample is marked individually.', m31)
check('mixed 1+1 singularises both', markerSentence(mixed(1, 1)) === 'this view holds 1 title of your own and 1 seeded sample. Every sample is marked individually.', markerSentence(mixed(1, 1)))

// ── NEGATIVE: the sentence that must never appear on a mixed view ─────────
// This is the defect publisher found on the Books list: a surface disclaiming
// work that DID happen, on the one row where the realness is the argument.
for (const [own, s] of [[1, 2], [9, 1], [40, 40], [2, 7]] as Array<[number, number]>) {
  const out = markerSentence(mixed(own, s)) ?? ''
  check(`NEGATIVE mixed ${own}+${s} never says "not your titles"`, !out.includes('not your titles'), out)
  check(`NEGATIVE mixed ${own}+${s} is not R9 verbatim`, out !== R9_VERBATIM, out)
}

// ── NEGATIVE: the all-real case carries NO marker ─────────────────────────
// null is the ruled outcome. A banner over a publisher's real books teaches
// them to ignore banners.
check('NEGATIVE all-real returns null, not a sentence', markerSentence(mixed(9, 0)) === null, markerSentence(mixed(9, 0)))
check('NEGATIVE all-real with one book returns null', markerSentence(mixed(1, 0)) === null, markerSentence(mixed(1, 0)))
check('NEGATIVE zero/zero returns null rather than claiming samples', markerSentence(mixed(0, 0)) === null, markerSentence(mixed(0, 0)))

// ── POSITIVE: a caller that computed the wrong branch still gets it right ─
check('mixed with no real rows collapses to R9 verbatim', markerSentence(mixed(0, 5)) === R9_VERBATIM, markerSentence(mixed(0, 5)))

// ── NEGATIVE: negative counts must not produce a sentence ─────────────────
check('NEGATIVE negative sampleCount returns null', markerSentence(mixed(3, -1)) === null, markerSentence(mixed(3, -1)))
check('NEGATIVE negative ownCount collapses to verbatim, not a count', markerSentence(mixed(-2, 3)) === R9_VERBATIM, markerSentence(mixed(-2, 3)))

console.log(`\n${pass} passed, ${fail} failed  (${pass + fail} checks, 13 of them negative)`)
if (fail > 0) process.exit(1)
