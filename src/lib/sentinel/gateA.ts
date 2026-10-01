/**
 * Sentinel — Gate A, structural checks run immediately after chapter parsing.
 *
 * Every check here exists because something was lost silently and nobody noticed
 * until a human went looking. The dates and manuscript ids in the comments are
 * the real incidents; keep them, because a check whose reason has been forgotten
 * is a check somebody will delete.
 *
 * Three rules, from SIS Doctrine V1:
 *   §2.7  Re-derive independently. Never ask the parser what it did.
 *   §2.2  A check must prove it can fail — see sentinel.selftest.mjs.
 *   §2.6  Silence is not a pass. A check that could not run says so.
 */

import type { CheckResult, ManuscriptSnapshot } from './types'

/** Chapter 0 is the prologue slot, 999 the epilogue slot. */
const PROLOGUE = 0
const EPILOGUE = 999

const isBodyChapter = (n: number) => n !== PROLOGUE && n !== EPILOGUE

/**
 * Front matter — title page, copyright, dedication — legitimately sits in
 * full_text without belonging to any chapter. Anything beyond this is unexplained.
 */
const FRONT_MATTER_WORD_ALLOWANCE = 500

// ---------------------------------------------------------------------------
// S1 — Encoding integrity
//
// 2026-10-01, 'CS The List' (b391c0bf): pdf-parse decoded the font's fi/fl
// ligature glyphs as the digit 8. office/of8ice 63 times, first/8irst 51 times.
// 646 corrupted words across 66 of 80 chapters, and NOT ONE occurrence of "fi"
// or "fl" in 361,157 characters of English prose. Every screen looked correct,
// because the text was legible — just wrong.
//
// Conservative on purpose: all three conditions must hold. Any correct
// extraction of an English manuscript contains hundreds of fi/fl pairs, so this
// cannot fire on good input. Known limits, stated rather than hidden: it will
// not catch corruption in a text under 20k characters, nor partial corruption
// where some fi survives.
// ---------------------------------------------------------------------------
export function checkS1Encoding(s: ManuscriptSnapshot): CheckResult {
    const text = s.fullText || ''
    const ligatureHits = (text.match(/fi|fl|ﬀ|ﬁ|ﬂ|ﬃ|ﬄ/gi) || []).length
    const brokenGlyphHits = (text.match(/(?<![0-9])[0-9](?=[il][a-z])/g) || []).length

    const base = {
        id: 'S1',
        gate: 'A' as const,
        name: 'Encoding integrity',
        cites: 'R4, publisher-first ruling 2026-10-01',
    }

    if (text.length < 20000) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: 'Text under 20,000 characters — too short to judge ligature frequency reliably.',
            summary: 'Not run: manuscript too short for this check to be meaningful.',
            measured: { characters: text.length, ligatureHits, brokenGlyphHits },
        }
    }

    const broken = ligatureHits === 0 && brokenGlyphHits >= 20

    return {
        ...base,
        verdict: broken ? 'block' : 'pass',
        summary: broken
            ? `Text appears corrupted: ${brokenGlyphHits} damaged words and no "fi"/"fl" anywhere in ${text.length.toLocaleString()} characters. This is a font decoding failure, not the author's writing. Upload the .docx version.`
            : `Encoding looks sound — ${ligatureHits.toLocaleString()} ligature pairs present.`,
        measured: { characters: text.length, ligatureHits, brokenGlyphHits },
    }
}

// ---------------------------------------------------------------------------
// S2 — Heading census
//
// Counts chapter headings in full_text and compares with the rows the parser
// produced. This is the independent re-derivation: it does not care what the
// parser believes it did.
// ---------------------------------------------------------------------------
export function checkS2HeadingCensus(s: ManuscriptSnapshot): CheckResult {
    const text = s.fullText || ''
    const headings = text.match(/(?:^|\n)\s*(?:CHAPTER|Chapter)\s+\d+/g) || []
    const hashHeadings = text.match(/(?:^|\n)\s*#\d+(?:\s*[,&\d\s]*)(?::\s*|\s+)/g) || []
    const headingsFound = Math.max(headings.length, hashHeadings.length)

    const bodyRows = s.chapters.filter((c) => isBodyChapter(c.chapterNumber)).length
    const difference = headingsFound - bodyRows

    const base = {
        id: 'S2',
        gate: 'A' as const,
        name: 'Heading census',
        cites: 'AL-INGEST V1 §2.1',
    }

    if (headingsFound === 0) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: 'No recognisable chapter headings in the text — nothing to compare against.',
            summary: 'Not run: no chapter headings detected, so the census has no baseline.',
            measured: { headingsFound, bodyRows },
        }
    }

    return {
        ...base,
        verdict: difference === 0 ? 'pass' : 'flag',
        summary:
            difference === 0
                ? `All ${headingsFound} chapter headings in the manuscript have a matching chapter.`
                : difference > 0
                  ? `${difference} chapter heading${difference === 1 ? '' : 's'} in the manuscript ${difference === 1 ? 'has' : 'have'} no matching chapter — that content may not be readable by the editorial stations.`
                  : `${Math.abs(difference)} more chapters stored than headings found — chapters may have been split unintentionally.`,
        measured: { headingsFound, bodyRows, difference },
    }
}

// ---------------------------------------------------------------------------
// S3 — Word coverage
//
// 2026-10-01, 'CS The List' (5891a144): full_text held 63,273 words, the chapter
// rows summed to 61,679. 1,594 words — three whole chapters — existed in the
// manuscript but in no chapter row, invisible because the sidebar numbering
// looked continuous. This aggregate is what found it.
// ---------------------------------------------------------------------------
export function checkS3WordCoverage(s: ManuscriptSnapshot): CheckResult {
    const stored = s.chapters.reduce((sum, c) => sum + (c.wordCount ?? 0), 0)
    const total = s.manuscriptWordCount ?? 0

    const base = {
        id: 'S3',
        gate: 'A' as const,
        name: 'Word coverage',
        cites: 'AL-INGEST V1 §2.1',
    }

    if (!total || s.chapters.length === 0) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: !total
                ? 'No manuscript word count recorded — nothing to measure coverage against.'
                : 'No chapters stored.',
            summary: 'Not run: coverage cannot be measured without both a word count and chapters.',
            measured: { manuscriptWords: total, storedWords: stored, chapters: s.chapters.length },
        }
    }

    const unaccounted = total - stored
    const short = unaccounted > FRONT_MATTER_WORD_ALLOWANCE
    const pct = total > 0 ? Math.round((stored / total) * 1000) / 10 : 0

    return {
        ...base,
        verdict: short ? 'flag' : 'pass',
        summary: short
            ? `${unaccounted.toLocaleString()} words (${(100 - pct).toFixed(1)}%) are in the manuscript but in no chapter. The editorial stations will not read them.`
            : `Chapters account for ${pct}% of the manuscript; the remainder is within the normal front-matter allowance.`,
        measured: {
            manuscriptWords: total,
            storedWords: stored,
            unaccounted,
            percentStored: pct,
            allowance: FRONT_MATTER_WORD_ALLOWANCE,
        },
    }
}

// ---------------------------------------------------------------------------
// S4 — Numbering integrity
//
// Reports gaps and duplicates in the AUTHOR'S declared labels. On 'CS The List'
// the author labels two chapters 20, two 48 and two 76, and has no 19, 47 or 78.
// That is the author's own typo and the wording must not imply otherwise — but
// an editor needs to know, because it is why their chapter numbers will not
// match ours.
// ---------------------------------------------------------------------------
export function checkS4Numbering(s: ManuscriptSnapshot): CheckResult {
    const text = s.fullText || ''
    const declared = [...text.matchAll(/(?:^|\n)\s*(?:CHAPTER|Chapter)\s+(\d+)/g)].map((m) =>
        parseInt(m[1], 10)
    )

    const base = {
        id: 'S4',
        gate: 'A' as const,
        name: 'Numbering integrity',
        cites: 'AL-INGEST V1 §2.1',
    }

    if (declared.length === 0) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: 'No numbered chapter headings found in the text.',
            summary: 'Not run: the manuscript uses no numbered chapter headings.',
            measured: { declaredHeadings: 0 },
        }
    }

    const seen = new Map<number, number>()
    for (const n of declared) seen.set(n, (seen.get(n) ?? 0) + 1)

    const duplicates = [...seen.entries()].filter(([, c]) => c > 1).map(([n]) => n).sort((a, b) => a - b)
    const lowest = Math.min(...declared)
    const highest = Math.max(...declared)
    const gaps: number[] = []
    for (let i = lowest; i <= highest; i++) if (!seen.has(i)) gaps.push(i)

    const clean = duplicates.length === 0 && gaps.length === 0

    return {
        ...base,
        verdict: clean ? 'pass' : 'flag',
        summary: clean
            ? `Chapter numbering runs ${lowest}–${highest} with no gaps or repeats.`
            : `The manuscript's own chapter numbering is uneven: ${gaps.length ? `no chapter ${gaps.join(', ')}` : 'no gaps'}; ${duplicates.length ? `${duplicates.join(', ')} used twice` : 'no repeats'}. All chapters are loaded — the order below follows the manuscript, not the labels.`,
        measured: {
            declaredHeadings: declared.length,
            distinctNumbers: seen.size,
            lowest,
            highest,
            gaps: gaps.join(',') || 'none',
            duplicates: duplicates.join(',') || 'none',
        },
    }
}

// ---------------------------------------------------------------------------
// S5 — Prologue and epilogue
//
// 2026-10-01: the parser detected a prologue and then discarded it unless the
// uploader had ticked a box. Fixed in 1.4 the same day, but the check stays —
// a fix is not a guarantee, and this is the cheapest possible confirmation that
// what the text contains is what got stored.
// ---------------------------------------------------------------------------
export function checkS5PrologueEpilogue(s: ManuscriptSnapshot): CheckResult {
    const text = s.fullText || ''
    const prologueInText = /(?:^|\n)\s*(?:PROLOGUE|Prologue)\b/.test(text)
    const epilogueInText = /(?:^|\n)\s*(?:EPILOGUE|Epilogue)\b/.test(text)
    const prologueStored = s.chapters.some((c) => c.chapterNumber === PROLOGUE)
    const epilogueStored = s.chapters.some((c) => c.chapterNumber === EPILOGUE)

    const missing: string[] = []
    if (prologueInText && !prologueStored) missing.push('prologue')
    if (epilogueInText && !epilogueStored) missing.push('epilogue')

    return {
        id: 'S5',
        gate: 'A',
        name: 'Prologue and epilogue',
        cites: '1.4 Parse Chapters ruling, 2026-10-01',
        verdict: missing.length ? 'flag' : 'pass',
        summary: missing.length
            ? `The manuscript contains ${missing.join(' and ')}, but ${missing.length === 1 ? 'it was' : 'they were'} not stored as ${missing.length === 1 ? 'a chapter' : 'chapters'}. No editorial pass will read ${missing.length === 1 ? 'it' : 'them'}.`
            : prologueInText || epilogueInText
              ? `Front and back matter stored as expected.`
              : `No prologue or epilogue in this manuscript.`,
        measured: { prologueInText, prologueStored, epilogueInText, epilogueStored },
    }
}

// ---------------------------------------------------------------------------
// S6 — Chapter plausibility
//
// Empty chapters are always wrong. Very short ones are judged against THIS
// book's own distribution rather than a fixed threshold, because a 300-word
// chapter is normal in some books and a symptom in others.
// ---------------------------------------------------------------------------
export function checkS6Plausibility(s: ManuscriptSnapshot): CheckResult {
    const body = s.chapters.filter((c) => isBodyChapter(c.chapterNumber))

    const base = {
        id: 'S6',
        gate: 'A' as const,
        name: 'Chapter plausibility',
        cites: 'AL-INGEST V1 §2.1',
    }

    if (body.length === 0) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: 'No body chapters stored.',
            summary: 'Not run: there are no chapters to assess.',
            measured: { chapters: 0 },
        }
    }

    const counts = body.map((c) => c.wordCount ?? 0)
    const empty = counts.filter((w) => w === 0).length
    const median = [...counts].sort((a, b) => a - b)[Math.floor(counts.length / 2)]
    const tinyThreshold = Math.max(50, Math.round(median * 0.1))
    const tiny = counts.filter((w) => w > 0 && w < tinyThreshold).length

    return {
        ...base,
        verdict: empty > 0 ? 'flag' : 'pass',
        summary:
            empty > 0
                ? `${empty} chapter${empty === 1 ? ' has' : 's have'} no text at all.`
                : tiny > 0
                  ? `No empty chapters. ${tiny} ${tiny === 1 ? 'is' : 'are'} unusually short for this book, which may be deliberate.`
                  : `All ${body.length} chapters contain text, with no unusual outliers.`,
        measured: { chapters: body.length, empty, unusuallyShort: tiny, medianWords: median, tinyThreshold },
    }
}

// ---------------------------------------------------------------------------
// S7 — Extraction yield
//
// A sanity check on characters-extracted against source file size. Catches the
// case where extraction half-succeeded — a PDF that yields a title page and
// stops, which otherwise presents as a very short but perfectly valid book.
// ---------------------------------------------------------------------------
export function checkS7ExtractionYield(s: ManuscriptSnapshot): CheckResult {
    const chars = (s.fullText || '').length
    const bytes = s.sourceFileBytes ?? null

    const base = {
        id: 'S7',
        gate: 'A' as const,
        name: 'Extraction yield',
        cites: 'R4, publisher-first ruling 2026-10-01',
    }

    if (!bytes) {
        return {
            ...base,
            verdict: 'not_run',
            notRunReason: 'Source file size was not recorded at upload, so yield cannot be assessed.',
            summary: 'Not run: the uploaded file size was not recorded.',
            measured: { characters: chars, sourceBytes: null },
        }
    }

    // A .docx is a zip: roughly 1 character of prose per byte is normal, and the
    // ratio is far lower for PDFs, which carry fonts and layout. Only a very low
    // yield is meaningful, so the floor is deliberately generous.
    const ratio = chars / bytes
    const floor = s.sourceFormat === 'pdf' ? 0.02 : 0.1
    const low = ratio < floor

    return {
        ...base,
        verdict: low ? 'flag' : 'pass',
        summary: low
            ? `Only ${chars.toLocaleString()} characters were read from a ${(bytes / 1024 / 1024).toFixed(1)}MB file. Part of the document may not have been extracted.`
            : `Extraction yield is normal for a ${s.sourceFormat ?? 'source'} file of this size.`,
        measured: { characters: chars, sourceBytes: bytes, ratio: Math.round(ratio * 1000) / 1000, floor },
    }
}

/** Every Gate A check, in report order. */
export const GATE_A_CHECKS = [
    checkS1Encoding,
    checkS2HeadingCensus,
    checkS3WordCoverage,
    checkS4Numbering,
    checkS5PrologueEpilogue,
    checkS6Plausibility,
    checkS7ExtractionYield,
] as const

export function runGateA(snapshot: ManuscriptSnapshot): CheckResult[] {
    return GATE_A_CHECKS.map((check) => check(snapshot))
}
