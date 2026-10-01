import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runGateA } from '@/lib/sentinel/gateA'
import {
    countVerdicts,
    worstVerdict,
    type ManuscriptSnapshot,
    type SentinelReport,
} from '@/lib/sentinel/types'

/**
 * Sentinel — Gate A.
 *
 *   POST /api/manuscripts/[id]/sentinel   run the structural checks, persist, return
 *   GET  /api/manuscripts/[id]/sentinel   return the most recent run
 *
 * SIS Doctrine V1 §2.7. Specified in
 * docs/ingestion/AL-INGEST-V1-the-sentinel-and-the-thirty-minute-wait.md
 *
 * ─── WHY THIS IS A ROUTE AND NOT AN n8n WORKFLOW ────────────────────────────
 * The design doc placed the Sentinel in n8n as workflow 0.9. Paul moved it here
 * on 2026-10-01. The checks are pure SQL-shaped logic over Postgres, and in the
 * app they are versioned in git, unit-testable against fixtures (which is what
 * makes the positive controls in scripts/sentinel-selftest.ts possible at all),
 * deployed by the same push as everything else, and callable from both n8n and
 * the client. A check nobody can run on demand is a check nobody trusts.
 *
 * ─── WHY THE WRITE USES THE SERVICE ROLE ────────────────────────────────────
 * manuscript_checks grants INSERT to service_role only. The Sentinel is an
 * instrument, not a user action: nothing a client does should be able to author
 * a verdict about itself. The READ below still goes through the user's own
 * session, so authorisation is decided by RLS exactly as everywhere else.
 */

export const dynamic = 'force-dynamic'

function serviceClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Authorisation through the caller's own session and RLS. If they cannot
    // read the manuscript, they cannot ask for a verdict about it.
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { data: manuscript, error: mErr } = await supabase
        .from('manuscripts')
        .select('id, full_text, current_word_count')
        .eq('id', id)
        .single()

    if (mErr || !manuscript) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const { data: chapterRows, error: cErr } = await supabase
        .from('chapters')
        .select('chapter_number, title, word_count, content')
        .eq('manuscript_id', id)
        .order('chapter_number', { ascending: true })

    if (cErr) {
        return NextResponse.json({ error: 'chapters_unreadable' }, { status: 500 })
    }

    const snapshot: ManuscriptSnapshot = {
        manuscriptId: id,
        fullText: manuscript.full_text ?? '',
        manuscriptWordCount: manuscript.current_word_count ?? null,
        chapters: (chapterRows ?? []).map((c) => ({
            chapterNumber: c.chapter_number,
            title: c.title,
            wordCount: c.word_count,
            contentLength: (c.content ?? '').length,
        })),
        // Not recorded at upload today, so S7 will report not_run rather than
        // guess. Honest silence over invented signal (§2.6).
        sourceFileBytes: null,
        sourceFormat: null,
    }

    const checks = runGateA(snapshot)
    const ranAt = new Date().toISOString()
    const runId = crypto.randomUUID()

    const report: SentinelReport = {
        manuscriptId: id,
        gate: 'A',
        ranAt,
        outcome: worstVerdict(checks),
        checks,
        counts: countVerdicts(checks),
    }

    // Persist. A failure to record must not be reported as a clean run, so the
    // report carries the persistence outcome rather than swallowing it.
    let persisted = true
    let persistError: string | null = null
    try {
        const { error: insErr } = await serviceClient()
            .from('manuscript_checks')
            .insert(
                checks.map((c) => ({
                    manuscript_id: id,
                    run_id: runId,
                    gate: c.gate,
                    check_id: c.id,
                    name: c.name,
                    verdict: c.verdict,
                    summary: c.summary,
                    cites: c.cites,
                    measured: c.measured,
                    not_run_reason: c.notRunReason ?? null,
                    ran_at: ranAt,
                }))
            )
        if (insErr) {
            persisted = false
            persistError = insErr.message
        }
    } catch (e) {
        persisted = false
        persistError = e instanceof Error ? e.message : 'unknown'
    }

    return NextResponse.json({ ...report, runId, persisted, persistError })
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Most recent run only. RLS decides whether this caller sees anything.
    const { data: rows, error } = await supabase
        .from('manuscript_checks')
        .select('*')
        .eq('manuscript_id', id)
        .order('ran_at', { ascending: false })
        .limit(50)

    if (error) {
        return NextResponse.json({ error: 'unreadable' }, { status: 500 })
    }
    if (!rows || rows.length === 0) {
        // Never imply a pass. No run means no run.
        return NextResponse.json({
            manuscriptId: id,
            gate: 'A',
            hasRun: false,
            message: 'The quality check has not been run on this manuscript.',
        })
    }

    const latestRun = rows[0].run_id
    const checks = rows
        .filter((r) => r.run_id === latestRun)
        .map((r) => ({
            id: r.check_id,
            gate: r.gate,
            name: r.name,
            verdict: r.verdict,
            summary: r.summary,
            cites: r.cites,
            measured: r.measured,
            notRunReason: r.not_run_reason ?? undefined,
        }))

    return NextResponse.json({
        manuscriptId: id,
        gate: 'A',
        hasRun: true,
        runId: latestRun,
        ranAt: rows[0].ran_at,
        outcome: worstVerdict(checks),
        counts: countVerdicts(checks),
        checks,
    })
}
