// A control that proves it can fail. No test runner in this repo, so this is a
// script: node --experimental-strip-types scripts/check-typography.ts
import {
  countCurlyQuotes,
  quoteTolerantRegExp,
  wouldFlattenTypography,
} from '../src/lib/studio/typography.ts'

let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`)
}

const curly = 'She said “I never asked”, and Mara’s hand shook.'
const straightNeedle = 'She said "I never asked", and Mara\'s hand shook.'

check('counts curly quotes', countCurlyQuotes(curly), 3)
check('counts none in ascii', countCurlyQuotes(straightNeedle), 0)

// The match this whole defect existed to achieve, now without touching the DOM.
check(
  'straight needle matches curly haystack',
  quoteTolerantRegExp(straightNeedle).test(curly),
  true
)
check(
  'curly needle matches curly haystack',
  quoteTolerantRegExp(curly).test(curly),
  true
)
check(
  'whitespace runs tolerated',
  quoteTolerantRegExp('I never    asked').test('I never\nasked'),
  true
)
check(
  'regex metacharacters escaped, not interpreted',
  quoteTolerantRegExp('cost (approx.) $5').test('cost (approx.) $5'),
  true
)
check(
  'a needle that is absent does not match',
  quoteTolerantRegExp('a line that is not there').test(curly),
  false
)

// THE DEFECT ITSELF: flattened text must be refused.
const flattened = curly
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
check('refuses a save that flattens every curly quote', wouldFlattenTypography(curly, flattened), true)
check('allows an ordinary edit', wouldFlattenTypography(curly, curly + ' And then she left.'), false)
check('allows an edit that removes SOME curly quotes', wouldFlattenTypography(curly, 'She said “no”.'), false)
check('no curly quotes to lose is not a flattening', wouldFlattenTypography(straightNeedle, straightNeedle), false)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
