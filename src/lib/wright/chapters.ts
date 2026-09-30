// src/lib/wright/chapters.ts
//
// Chapter allocation and creation for the Wright workshop.
//
// Wright writes directly to `chapters` — the same table Author Studio edits.
// There is no parallel drafts table, no export step, no adapter layer. Every
// chapter Wright creates is a real chapter Alex will read. (Workspace design
// commission §4, ratified.)
//
// The allocator exists because Ivy and Reid create chapters from conversation,
// and `insertChapterAt` in /author-studio reserves two slots that an emergent
// chapter must never land on by arithmetic accident:
//
//   chapter_number 0   = prologue
//   chapter_number 999 = epilogue
//
// astudio raised this as a condition of the reuse countersign
// (astudio-to-wright+sysadmin-chat-log-enum-and-reuse-countersign-2026-09-22 §2.2):
// "Ivy and Reid inserting chapters from conversation must respect both, or an
// emergent 'chapter 999' collides with an epilogue that may not exist yet.
// Worth an explicit guard in the Wright port rather than an inherited
// assumption."
//
// This module is that guard.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Chapter } from '@/types/database'

// ─── Reserved slots ───────────────────────────────────────────────────────────

/** Prologue's reserved chapter_number. Never allocated except on request. */
export const PROLOGUE_SLOT = 0

/** Epilogue's reserved chapter_number. Never allocated except on request. */
export const EPILOGUE_SLOT = 999

/** Highest chapter_number an emergent body chapter may take. */
export const MAX_BODY_CHAPTER = EPILOGUE_SLOT - 1 // 998

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * What kind of slot the caller wants.
 *
 * `next` is what a partner-proposed chapter always asks for. `prologue` and
 * `epilogue` are only ever reached by an explicit author request — Ivy and Reid
 * cannot arrive at a reserved slot by counting.
 */
export type SlotRequest = 'next' | 'prologue' | 'epilogue'

/** The ways an allocation can legitimately fail. */
export type SlotFailureReason = 'prologue_taken' | 'epilogue_taken' | 'body_full'

/**
 * Allocation outcome.
 *
 * A result type rather than a thrown error, because every failure here has
 * something honest to say to the author ("there's already a prologue") and an
 * exception makes that awkward to surface. Every path terminates in a named
 * reason — corpse on every path, in miniature.
 */
export type SlotResult =
  | { ok: true; chapterNumber: number }
  | { ok: false; reason: SlotFailureReason }

/** A read or write against the database did not complete. */
export type DbFailure = { ok: false; reason: 'db_failed'; detail: string }

/** Allocation against live data: an allocation outcome, or the read failing. */
export type AllocationOutcome = SlotResult | DbFailure

/** Chapter creation: the row, a refused slot, or a failed read/insert. */
export type CreateChapterResult =
  | { ok: true; chapter: Chapter }
  | { ok: false; reason: SlotFailureReason }
  | DbFailure

// ─── The allocator (pure) ─────────────────────────────────────────────────────

/**
 * Choose a chapter_number, given the numbers already in use.
 *
 * Pure so it can be reasoned about and tested without a database.
 *
 * Behaviour worth knowing:
 *
 * - `next` allocates `max(body) + 1`, where body excludes both reserved slots.
 *   An empty manuscript therefore starts at 1, not 0 — chapter 0 is the
 *   prologue and is never where a book begins by default.
 *
 * - `next` does NOT fill gaps. If chapters 1, 2 and 5 exist, the next is 6.
 *   Gap-filling would change what a chapter's number means relative to its
 *   neighbours, and renumbering is astudio's cascade, not ours. Their standing
 *   instruction is "don't add a third renumber path without the temp pass".
 *
 * - At 998 body chapters `next` REFUSES rather than returning 999. That is the
 *   whole point of the guard: the failure mode astudio named is an emergent
 *   chapter silently taking the epilogue's slot.
 */
export function allocateChapterNumber(
  existing: readonly number[],
  request: SlotRequest = 'next'
): SlotResult {
  if (request === 'prologue') {
    return existing.includes(PROLOGUE_SLOT)
      ? { ok: false, reason: 'prologue_taken' }
      : { ok: true, chapterNumber: PROLOGUE_SLOT }
  }

  if (request === 'epilogue') {
    return existing.includes(EPILOGUE_SLOT)
      ? { ok: false, reason: 'epilogue_taken' }
      : { ok: true, chapterNumber: EPILOGUE_SLOT }
  }

  // request === 'next' — body chapters only, both reserved slots excluded.
  const body = existing.filter(
    (n) => n > PROLOGUE_SLOT && n < EPILOGUE_SLOT
  )

  const candidate = body.length === 0 ? 1 : Math.max(...body) + 1

  if (candidate > MAX_BODY_CHAPTER) {
    return { ok: false, reason: 'body_full' }
  }

  return { ok: true, chapterNumber: candidate }
}

/**
 * Honest, author-facing text for an allocation failure.
 *
 * Kept next to the reasons so a new reason cannot be added without someone
 * having to write the sentence that explains it.
 */
export function explainSlotFailure(reason: SlotFailureReason): string {
  switch (reason) {
    case 'prologue_taken':
      return 'There is already a prologue. Open it rather than adding another.'
    case 'epilogue_taken':
      return 'There is already an epilogue. Open it rather than adding another.'
    case 'body_full':
      return 'This project has reached 998 chapters, which is as far as the numbering goes.'
  }
}

// ─── Word count ───────────────────────────────────────────────────────────────

/**
 * Word count, matching the convention used across the estate
 * (/author-studio/page.tsx and /onboarding/page.tsx both use this shape).
 * Duplicated deliberately rather than imported, to avoid Wright taking a
 * dependency on an Author Studio page module.
 */
export function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length
}

// ─── Database-backed allocation ───────────────────────────────────────────────

/**
 * Read the chapter numbers in use for a manuscript.
 *
 * Returns an empty array on error as well as on genuinely-no-chapters, which
 * is a deliberate limitation: callers that need to distinguish the two should
 * use `allocateChapterNumberFor` instead, which surfaces the read failure.
 */
async function readExistingNumbers(
  supabase: SupabaseClient,
  manuscriptId: string
): Promise<{ ok: true; numbers: number[] } | { ok: false; detail: string }> {
  const { data, error } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('manuscript_id', manuscriptId)

  if (error) {
    return { ok: false, detail: error.message }
  }

  return { ok: true, numbers: (data ?? []).map((r) => r.chapter_number as number) }
}

/**
 * Allocate against live data.
 *
 * Note the race: two chapters created in the same instant can both read the
 * same max and both propose the same number. `chapters` has no unique index on
 * (manuscript_id, chapter_number), so the database will not catch it.
 *
 * Not defended against here, and deliberately so — Wright is a single author in
 * conversation with one partner, so concurrent creation is not a shape this
 * surface produces. If Wright ever gains multi-member editing, this becomes a
 * real hazard and the answer is a partial unique index, not application
 * retries. Recorded rather than silently assumed away.
 */
export async function allocateChapterNumberFor(
  supabase: SupabaseClient,
  manuscriptId: string,
  request: SlotRequest = 'next'
): Promise<AllocationOutcome> {
  const existing = await readExistingNumbers(supabase, manuscriptId)
  if (!existing.ok) {
    return { ok: false, reason: 'db_failed', detail: existing.detail }
  }
  return allocateChapterNumber(existing.numbers, request)
}

// ─── Chapter creation ─────────────────────────────────────────────────────────

export interface CreateWrightChapterInput {
  manuscriptId: string
  title: string
  /** Optional starting prose. `chapters.content` is NOT NULL, so this defaults to ''. */
  content?: string
  /** Defaults to 'next'. Only an explicit author request should pass the reserved slots. */
  request?: SlotRequest
}

/**
 * Create a chapter for a Wright project.
 *
 * `chapters.content` is `text NOT NULL` with no default (verified against
 * information_schema 2026-09-29), so an empty chapter is created with '' rather
 * than NULL. `status` is left to its own default of 'draft'.
 */
export async function createWrightChapter(
  supabase: SupabaseClient,
  input: CreateWrightChapterInput
): Promise<CreateChapterResult> {
  const { manuscriptId, title, content = '', request = 'next' } = input

  const slot = await allocateChapterNumberFor(supabase, manuscriptId, request)
  if (!slot.ok) {
    return slot
  }

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      manuscript_id: manuscriptId,
      chapter_number: slot.chapterNumber,
      title,
      content,
      word_count: countWords(content),
    })
    .select()
    .single()

  if (error || !data) {
    return {
      ok: false,
      reason: 'db_failed',
      detail: error?.message ?? 'insert returned no row',
    }
  }

  return { ok: true, chapter: data as Chapter }
}
