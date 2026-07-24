// ============================================================================
// as_journeys — client-side helpers for the Author Studio journey mechanism
// (Dispatch DP-AS-02, per docs/sis/AuthorsLab-Dispatches-AS-Wave1.md)
//
// Design contract (from AL-RDP-001 §2 + the standing laws in the
// Re-Founding Brief):
//   - startJourney: INSERT a row BEFORE the webhook fires. Scan on arrival.
//                   Return { journey_id, timeout_at } for the caller to pass
//                   into the webhook payload. Throws on insert failure —
//                   callers must decide whether to skip the fire or fail
//                   honestly. Never a silent success.
//   - pollJourney:  Pure read. Never writes. Awaits a terminal state
//                   (ready | replied | complete | rejected | failed | reaped)
//                   or exits on client-side safety timeout past the row's
//                   own timeout_at. The reaper (pg_cron every 5 min) is the
//                   real timeout — this is a safety net for laggy clients.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------

export type JourneyType =
  | 'full_analysis'
  | 'chapter_analysis'
  | 'editor_chat'
  | 'phase_transition'

export type EditorName = 'alex' | 'sam' | 'jordan'

export type JourneyStatus =
  | 'submitted'
  | 'received'
  | 'processing'
  | 'persisted'
  | 'ready'
  | 'replied'
  | 'complete'
  | 'rejected'
  | 'failed'
  | 'reaped'

export const TERMINAL_STATUSES: readonly JourneyStatus[] = [
  'ready', 'replied', 'complete', 'rejected', 'failed', 'reaped',
]

export function isTerminal(status: JourneyStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

// ---------- Timeout constants (per AL-RDP-001 §2) ----------

const TIMEOUTS_MS = {
  // Overall ceiling; per-chapter/carousel granularity is n8n-side and lives
  // inside the workflow, not here. Size-scaled ×2 above 80k words per RDP.
  full_analysis: { base: 20 * 60 * 1000, large_word_threshold: 80_000, large_multiplier: 2 },
  chapter_analysis: { base: 3 * 60 * 1000 },
  editor_chat: { base: 90 * 1000 },
  phase_transition: { base: 8 * 60 * 1000 },
} as const

function computeTimeoutMs(
  journey_type: JourneyType,
  size_hint?: { word_count?: number | null },
): number {
  const spec = TIMEOUTS_MS[journey_type]
  if (journey_type === 'full_analysis') {
    const fa = spec as typeof TIMEOUTS_MS['full_analysis']
    const wc = size_hint?.word_count ?? 0
    return wc > fa.large_word_threshold ? fa.base * fa.large_multiplier : fa.base
  }
  return spec.base
}

// ---------- startJourney ----------

export interface StartJourneyArgs {
  journey_type: JourneyType
  manuscript_id: string
  chapter_id?: string           // if you already have the uuid
  chapter_number?: number       // convenience: we resolve chapter_id from this + manuscript_id
  editor_name?: EditorName
  size_hint?: { word_count?: number | null }
}

export interface StartedJourney {
  journey_id: string
  timeout_at: string   // ISO 8601
}

/**
 * INSERT a journey row before firing the corresponding webhook.
 * Throws on failure — the caller must decide whether to skip the fire
 * or surface an honest failure state.
 */
export async function startJourney(
  supabase: SupabaseClient,
  args: StartJourneyArgs,
): Promise<StartedJourney> {
  // Resolve chapter_id from chapter_number when only the number is available.
  // Cheap single-row lookup — the alternative is to change every call site
  // to carry the uuid, which is not the DP-AS-02 scope.
  let chapter_id: string | null = args.chapter_id ?? null
  if (chapter_id === null && args.chapter_number !== undefined) {
    const { data: ch, error: chErr } = await supabase
      .from('chapters')
      .select('id')
      .eq('manuscript_id', args.manuscript_id)
      .eq('chapter_number', args.chapter_number)
      .single()
    if (chErr || !ch) {
      throw new Error(
        `startJourney: could not resolve chapter_id for manuscript=${args.manuscript_id} ` +
        `chapter_number=${args.chapter_number}: ${chErr?.message ?? 'not found'}`,
      )
    }
    chapter_id = ch.id
  }

  const timeout_ms = computeTimeoutMs(args.journey_type, args.size_hint)
  const timeout_at = new Date(Date.now() + timeout_ms).toISOString()

  const { data, error } = await supabase
    .from('as_journeys')
    .insert({
      journey_type: args.journey_type,
      manuscript_id: args.manuscript_id,
      chapter_id,
      editor_name: args.editor_name ?? null,
      status: 'submitted',
      timeout_at,
    })
    .select('id, timeout_at')
    .single()

  if (error || !data) {
    throw new Error(`startJourney: insert failed — ${error?.message ?? 'no row returned'}`)
  }

  return { journey_id: data.id, timeout_at: data.timeout_at }
}

// ---------- pollJourney ----------

export interface PollJourneyResult {
  status: JourneyStatus
  terminal_reason: string | null
  reaped: boolean          // true if we ended in a timeout state
}

export interface PollJourneyOptions {
  intervalMs?: number      // default 3000
  signal?: AbortSignal     // optional cancellation
}

/**
 * Poll the journey row until it reaches a terminal state.
 * Pure read — never writes.
 *
 * The DB-side reaper (production_control.reap_stalled_journeys, pg_cron
 * every 5 minutes) is the real timeout mechanism. This client-side loop
 * has a safety net: if we exceed the row's timeout_at by more than the
 * poll interval × 2, we return a synthetic "reaped" so the UI can't spin
 * forever if the reaper is somehow behind.
 */
export async function pollJourney(
  supabase: SupabaseClient,
  journey_id: string,
  opts?: PollJourneyOptions,
): Promise<PollJourneyResult> {
  const intervalMs = opts?.intervalMs ?? 3000

  while (true) {
    if (opts?.signal?.aborted) {
      return { status: 'submitted', terminal_reason: 'client-aborted', reaped: false }
    }

    const { data, error } = await supabase
      .from('as_journeys')
      .select('status, terminal_reason, timeout_at')
      .eq('id', journey_id)
      .single()

    if (error || !data) {
      throw new Error(`pollJourney: read failed for ${journey_id} — ${error?.message ?? 'not found'}`)
    }

    const status = data.status as JourneyStatus

    if (isTerminal(status)) {
      return {
        status,
        terminal_reason: data.terminal_reason ?? null,
        reaped: status === 'reaped',
      }
    }

    // Client-side safety net beyond the reaper's window.
    const timeoutAtMs = new Date(data.timeout_at).getTime()
    if (Date.now() > timeoutAtMs + intervalMs * 4) {
      return {
        status: 'reaped',
        terminal_reason: 'client-safety-timeout: reaper did not close row',
        reaped: true,
      }
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
}

// ---------- Convenience: honest UI message from a terminal result ----------

/**
 * Deterministic template for a user-facing "hit a snag" message when a
 * journey terminates in a failure state. Never LLM-generated (per D4 in
 * DP-AS-04's brief: no AI prose to users without a gate).
 */
export function terminalUserMessage(
  result: PollJourneyResult,
  action: string,   // e.g. "analysis", "chapter analysis", "chat"
): string {
  if (result.status === 'ready' || result.status === 'replied' ||
      result.status === 'complete') {
    // Success — caller wouldn't normally need this, but include for symmetry.
    return `${action} finished.`
  }
  if (result.reaped) {
    return `The ${action} took longer than expected. It's been logged and we're looking into it — please try again in a moment.`
  }
  if (result.status === 'rejected') {
    return `The ${action} couldn't complete: ${result.terminal_reason ?? 'requirements not met'}.`
  }
  return `The ${action} hit a snag. It's been logged — please try again.`
}
