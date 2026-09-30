// src/lib/wright/transcript.ts
//
// Wright's conversation, stored in the shared project dialogue log.
//
// Wright does NOT have its own chat table. It writes to `editor_chat_history`,
// the same log Alex, Sam, Jordan and Taylor already write to — one dialogue
// record per project across the whole journey.
//
// The decision and its evidence, so a future reader does not reopen it:
//
//   - `ghostwriter_chat` (Wright's old table) held 0 rows when checked on
//     2026-09-23, so the retirement costs no data migration.
//   - `editor_chat_history.sender` is `text NOT NULL`, free-form, with no CHECK
//     constraint. Ivy, Reid and Eliot are simply three new string values. There
//     is no enum to widen and no migration to accept.
//   - Taylor — a non-editor persona — has written to this table since
//     2026-01-29. The shared log is not a proposal; it is the status quo with
//     one station missing.
//
// Ruled in `astudio-to-wright+sysadmin-chat-log-enum-and-reuse-countersign-2026-09-22` §2,
// re-answered on corrected premises after `editor_chat_messages` turned out not
// to exist, and countersigned in
// `astudio-to-sysadmin+wright-phantom-writes-audited-and-shared-log-answered-2026-09-23` §2.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { EditorChatMessage } from '@/types/database'
import { getChatHistory, saveChatMessage } from '@/lib/supabase/helpers'

// ─── Phase ────────────────────────────────────────────────────────────────────

/**
 * Wright's phase_number in `editor_chat_history`.
 *
 * `phase_number` is `integer NOT NULL`. Phases 1–5 are the editing journey;
 * Wright happens before any of them, and 0 reads naturally as "before the
 * phased journey begins". It also parallels the prologue's chapter_number.
 *
 * Countersigned by astudio, who own the column's semantics
 * (…-phantom-writes-audited-and-shared-log-answered-2026-09-23 §2.3).
 */
export const WRIGHT_PHASE = 0

// ─── Senders ──────────────────────────────────────────────────────────────────

/**
 * The personas that speak in a Wright transcript.
 *
 * Casing follows the live data in `editor_chat_history` ('Alex', 'Author',
 * 'Sam', 'Taylor', 'Jordan'). Note this differs from `as_journeys.editor_name`,
 * which is lowercase — two tables, two conventions, and each is followed
 * rather than harmonised unilaterally.
 */
export type WrightSender = 'Author' | 'Eliot' | 'Ivy' | 'Reid'

/** The two Project Partners. Eliot appoints one; it does not change after. */
export type ProjectPartner = 'Ivy' | 'Reid'

/**
 * Never "ghostwriter", anywhere, in any string a person might read.
 * Ivy and Reid are Project Partners. (Positioning ruling, commission §2.)
 */
export const PARTNER_LABEL = 'Project Partner' as const

// ─── Reads ────────────────────────────────────────────────────────────────────

/**
 * The Wright transcript for a project, oldest first.
 *
 * This is one continuous conversation: Eliot's intake and the partner's work
 * are the same thread, because the partner picks up where Eliot left off
 * without a reload or a second panel. Filtering by sender to separate them
 * would undo the thing the design is for.
 */
export async function loadWrightTranscript(
  supabase: SupabaseClient,
  manuscriptId: string
): Promise<EditorChatMessage[]> {
  return getChatHistory(supabase, manuscriptId, WRIGHT_PHASE)
}

/**
 * Which partner, if any, has been appointed on this project.
 *
 * Derived from the transcript rather than stored separately, so there is
 * exactly one source of truth and no possibility of the two disagreeing. The
 * first partner to speak is the appointed one.
 *
 * Returns null when Eliot has not yet made the appointment — which is also the
 * signal that the workshop is still in intake.
 */
export function appointedPartner(
  transcript: readonly EditorChatMessage[]
): ProjectPartner | null {
  for (const m of transcript) {
    if (m.sender === 'Ivy' || m.sender === 'Reid') return m.sender
  }
  return null
}

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Append a message to the Wright transcript.
 *
 * Delegates to astudio's `saveChatMessage` rather than inserting directly —
 * one writer for one table. When they fixed the chapter-number cascade on
 * 2026-09-23 the fix reached Wright for free, which is the property being
 * preserved here.
 *
 * `chapterNumber` pins the message to a chapter when the exchange is about
 * one. astudio maintain that pin through reorders; Wright must not grow a
 * second renumber path.
 *
 * Returns false on failure. Callers must treat that as a failed turn and say
 * so — a message the author believes was sent and was not is the silent-failure
 * class this estate keeps finding.
 */
export async function saveWrightMessage(
  supabase: SupabaseClient,
  manuscriptId: string,
  sender: WrightSender,
  message: string,
  chapterNumber?: number
): Promise<boolean> {
  return saveChatMessage(
    supabase,
    manuscriptId,
    WRIGHT_PHASE,
    sender,
    message,
    chapterNumber
  )
}
