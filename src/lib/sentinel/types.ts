/**
 * Sentinel — shared types.
 *
 * SIS Doctrine V1 §2.7: inspect at the seam the user sees; the report may only
 * claim checks that executed; every check cites its ruling.
 */

export type Verdict = 'pass' | 'flag' | 'block' | 'not_run'

export type Gate = 'A' | 'B'

/**
 * The input every Gate A check reads.
 *
 * Deliberately a plain snapshot rather than a database handle: the checks must
 * be runnable against a fixture, which is what makes the positive controls
 * possible. It also keeps the Sentinel honest — it re-derives expectations from
 * `fullText`, the thing the author actually gave us, and compares them against
 * `chapters`, the thing the parser produced. It never asks the parser what it
 * did. A component's self-report is not evidence about itself.
 */
export interface ManuscriptSnapshot {
    manuscriptId: string
    /** The authoritative text, as stored on manuscripts.full_text. */
    fullText: string
    /** manuscripts.current_word_count — measured upstream over the whole document. */
    manuscriptWordCount: number | null
    chapters: ChapterSnapshot[]
    /** Size of the uploaded file in bytes, when the caller knows it. */
    sourceFileBytes?: number | null
    /** 'pdf' | 'docx' — when the caller knows it. */
    sourceFormat?: 'pdf' | 'docx' | null
}

export interface ChapterSnapshot {
    chapterNumber: number
    title: string | null
    wordCount: number | null
    contentLength: number
}

export interface CheckResult {
    /** Stable identifier, e.g. 'S3'. Never renumber a shipped check. */
    id: string
    gate: Gate
    name: string
    verdict: Verdict
    /** One sentence, written for the person who has to act on it. */
    summary: string
    /** The ruling or document this check enforces. */
    cites: string
    /** Raw numbers behind the verdict, so a reader can disagree with it. */
    measured: Record<string, number | string | boolean | null>
    /** Present only when verdict is 'not_run'. */
    notRunReason?: string
}

export interface SentinelReport {
    manuscriptId: string
    gate: Gate
    ranAt: string
    /** The most severe verdict present. */
    outcome: Verdict
    checks: CheckResult[]
    counts: Record<Verdict, number>
}

const SEVERITY: Record<Verdict, number> = {
    pass: 0,
    not_run: 1,
    flag: 2,
    block: 3,
}

/**
 * The worst verdict present.
 *
 * `not_run` outranks `pass` deliberately: a report containing a check that did
 * not execute is not a clean report, and must not read as one. Silence is not
 * a pass (SIS Doctrine V1 §2.6 — NULL, never placeholder).
 */
export function worstVerdict(checks: CheckResult[]): Verdict {
    return checks.reduce<Verdict>(
        (worst, c) => (SEVERITY[c.verdict] > SEVERITY[worst] ? c.verdict : worst),
        'pass'
    )
}

export function countVerdicts(checks: CheckResult[]): Record<Verdict, number> {
    const counts: Record<Verdict, number> = { pass: 0, flag: 0, block: 0, not_run: 0 }
    for (const c of checks) counts[c.verdict]++
    return counts
}
