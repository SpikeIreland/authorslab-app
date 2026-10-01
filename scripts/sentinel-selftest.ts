/**
 * Sentinel self-test — positive controls.
 *
 * SIS Doctrine V1 §2.2: "a check must prove it can fail — dead-prober doctrine;
 * positive controls beside important zeros."
 *
 * A check that has never been observed failing is not known to work. Every
 * Gate A check therefore has at least two fixtures here: one it must pass, and
 * one engineered to make it fail. Several fixtures are the real incidents from
 * 2026-10-01, reduced to their essentials.
 *
 * Run:  node scripts/sentinel-selftest.ts
 * (Node 22 strips the types natively — no test framework, no new dependency.)
 */

import {
    checkS1Encoding,
    checkS2HeadingCensus,
    checkS3WordCoverage,
    checkS4Numbering,
    checkS5PrologueEpilogue,
    checkS6Plausibility,
    checkS7ExtractionYield,
} from '../src/lib/sentinel/gateA.ts'
import type { ChapterSnapshot, ManuscriptSnapshot, Verdict } from '../src/lib/sentinel/types.ts'

// --- fixture helpers --------------------------------------------------------

const CLEAN_PARA =
    'The office was on the first floor and she could not find the file. ' +
    'Her fiance flushed as the figure flashed briefly past the flat window. '

const BROKEN_PARA = CLEAN_PARA.replace(/fi/g, '8i').replace(/fl/g, '8l')

function body(paragraphs: number, source = CLEAN_PARA): string {
    return source.repeat(paragraphs)
}

function chapters(spec: Array<[number, number]>): ChapterSnapshot[] {
    return spec.map(([chapterNumber, wordCount]) => ({
        chapterNumber,
        title: `Chapter ${chapterNumber}`,
        wordCount,
        contentLength: wordCount * 6,
    }))
}

function manuscript(over: Partial<ManuscriptSnapshot> = {}): ManuscriptSnapshot {
    return {
        manuscriptId: 'fixture',
        fullText: '',
        manuscriptWordCount: 0,
        chapters: [],
        sourceFileBytes: null,
        sourceFormat: 'docx',
        ...over,
    }
}

/** A text with N numbered chapter headings, each followed by real prose. */
function withHeadings(numbers: number[], extra = ''): string {
    return (
        extra +
        numbers.map((n) => `\nChapter ${n}\n\n${body(6)}`).join('\n')
    )
}

// --- harness ----------------------------------------------------------------

let passed = 0
let failed = 0
const failures: string[] = []

function expect(label: string, actual: Verdict, wanted: Verdict, detail = '') {
    if (actual === wanted) {
        passed++
        console.log(`  ok    ${label}  → ${actual}`)
    } else {
        failed++
        failures.push(`${label}: expected ${wanted}, got ${actual}. ${detail}`)
        console.log(`  FAIL  ${label}  → ${actual} (expected ${wanted})  ${detail}`)
    }
}

console.log('\nSentinel Gate A — positive controls\n')

// --- S1 Encoding ------------------------------------------------------------
console.log('S1 Encoding integrity')
{
    const clean = manuscript({ fullText: body(600) })
    expect('clean prose passes', checkS1Encoding(clean).verdict, 'pass')

    // The real 2026-10-01 failure: every fi/fl became the digit 8.
    const corrupt = manuscript({ fullText: body(600, BROKEN_PARA) })
    const r = checkS1Encoding(corrupt)
    expect('ligature corruption blocks', r.verdict, 'block', JSON.stringify(r.measured))

    // Must not fire on legitimate digits adjacent to i/l.
    const digits = manuscript({
        fullText: body(600) + 'Page 8 line 4. At 8.30, 9 litres, 3 inches, 7 islands. '.repeat(100),
    })
    expect('real digits do not trip it', checkS1Encoding(digits).verdict, 'pass')

    // Too short to judge — must say so rather than imply a pass.
    const short = manuscript({ fullText: body(600, BROKEN_PARA).slice(0, 15000) })
    expect('short text reports not_run', checkS1Encoding(short).verdict, 'not_run')
}

// --- S2 Heading census ------------------------------------------------------
console.log('\nS2 Heading census')
{
    const nums = [1, 2, 3, 4, 5]
    const matched = manuscript({
        fullText: withHeadings(nums),
        chapters: chapters(nums.map((n) => [n, 900] as [number, number])),
    })
    expect('headings match rows', checkS2HeadingCensus(matched).verdict, 'pass')

    // Three headings with no chapter row — the CS The List shape.
    const dropped = manuscript({
        fullText: withHeadings([1, 2, 3, 4, 5]),
        chapters: chapters([[1, 900], [2, 900]]),
    })
    const r = checkS2HeadingCensus(dropped)
    expect('missing chapters flag', r.verdict, 'flag', JSON.stringify(r.measured))

    const none = manuscript({ fullText: body(50), chapters: [] })
    expect('no headings reports not_run', checkS2HeadingCensus(none).verdict, 'not_run')
}

// --- S3 Word coverage -------------------------------------------------------
console.log('\nS3 Word coverage')
{
    const covered = manuscript({
        manuscriptWordCount: 10200,
        chapters: chapters([[1, 5000], [2, 5000]]),
    })
    expect('full coverage passes', checkS3WordCoverage(covered).verdict, 'pass')

    // The real shape: 1,594 words in no chapter at all.
    const short = manuscript({
        manuscriptWordCount: 63273,
        chapters: chapters([[1, 30000], [2, 31679]]),
    })
    const r = checkS3WordCoverage(short)
    expect('unaccounted words flag', r.verdict, 'flag', JSON.stringify(r.measured))

    const unknown = manuscript({ manuscriptWordCount: null, chapters: chapters([[1, 10]]) })
    expect('no word count reports not_run', checkS3WordCoverage(unknown).verdict, 'not_run')
}

// --- S4 Numbering -----------------------------------------------------------
console.log('\nS4 Numbering integrity')
{
    const tidy = manuscript({ fullText: withHeadings([1, 2, 3, 4, 5]) })
    expect('continuous numbering passes', checkS4Numbering(tidy).verdict, 'pass')

    // CS The List: duplicates at 20/48/76, gaps at 19/47/78.
    const uneven = manuscript({ fullText: withHeadings([18, 20, 20, 21]) })
    const r = checkS4Numbering(uneven)
    expect('gap + duplicate flags', r.verdict, 'flag', JSON.stringify(r.measured))

    const unnumbered = manuscript({ fullText: body(50) })
    expect('unnumbered book reports not_run', checkS4Numbering(unnumbered).verdict, 'not_run')
}

// --- S5 Prologue / epilogue -------------------------------------------------
console.log('\nS5 Prologue and epilogue')
{
    const stored = manuscript({
        fullText: `\nPROLOGUE\n\n${body(6)}\n\nChapter 1\n\n${body(6)}\n\nEPILOGUE\n\n${body(6)}`,
        chapters: chapters([[0, 400], [1, 900], [999, 400]]),
    })
    expect('both stored passes', checkS5PrologueEpilogue(stored).verdict, 'pass')

    // The real 2026-10-01 defect: present in the text, absent from the rows.
    const dropped = manuscript({
        fullText: `\nPROLOGUE\n\n${body(6)}\n\nChapter 1\n\n${body(6)}`,
        chapters: chapters([[1, 900]]),
    })
    const r = checkS5PrologueEpilogue(dropped)
    expect('suppressed prologue flags', r.verdict, 'flag', JSON.stringify(r.measured))

    const neither = manuscript({ fullText: withHeadings([1, 2]), chapters: chapters([[1, 900], [2, 900]]) })
    expect('book with neither passes', checkS5PrologueEpilogue(neither).verdict, 'pass')
}

// --- S6 Plausibility --------------------------------------------------------
console.log('\nS6 Chapter plausibility')
{
    const even = manuscript({ chapters: chapters([[1, 900], [2, 950], [3, 880]]) })
    expect('even chapters pass', checkS6Plausibility(even).verdict, 'pass')

    const empty = manuscript({ chapters: chapters([[1, 900], [2, 0], [3, 880]]) })
    const r = checkS6Plausibility(empty)
    expect('empty chapter flags', r.verdict, 'flag', JSON.stringify(r.measured))

    expect('no chapters reports not_run', checkS6Plausibility(manuscript()).verdict, 'not_run')
}

// --- S7 Extraction yield ----------------------------------------------------
console.log('\nS7 Extraction yield')
{
    const good = manuscript({ fullText: body(2000), sourceFileBytes: 200_000, sourceFormat: 'docx' })
    expect('normal yield passes', checkS7ExtractionYield(good).verdict, 'pass')

    // 4MB file, a title page of text.
    const stalled = manuscript({ fullText: body(2), sourceFileBytes: 4_000_000, sourceFormat: 'docx' })
    const r = checkS7ExtractionYield(stalled)
    expect('stalled extraction flags', r.verdict, 'flag', JSON.stringify(r.measured))

    const noSize = manuscript({ fullText: body(2000), sourceFileBytes: null })
    expect('unknown size reports not_run', checkS7ExtractionYield(noSize).verdict, 'not_run')
}

// --- result -----------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed) {
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
}
console.log('Every check demonstrated both a pass and a failure it can detect.\n')
