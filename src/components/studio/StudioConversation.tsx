'use client'

/**
 * THE CONVERSATION COLUMN — one tool shape, two tools in it.
 *
 * Extraction 3 of `ux`'s studio spec. §2: *"Chat AND notes, both… One column,
 * two stacked tools, not two columns fighting."*
 *
 * ─── THE SEND PATH IS INJECTED, AND THAT IS THE WHOLE DESIGN ────────────────
 *
 * This component renders entries and, when given a composer, a way to add one.
 * It knows nothing about where an entry goes. `astudio` asked for exactly this
 * and said why better than I did: *"'no generation path is injected' is a
 * structural guarantee and a flag can be set wrongly while an absent injection
 * cannot."*
 *
 * So the notes caller injects a write to `publisher_notes`; the chat caller
 * injects a call to the chat service. A caller that injects nothing gets a
 * read-only column — not a disabled composer. `composer === null` means the
 * textarea and its button are **never mounted**, per `ux`'s rule.
 *
 * ─── IT NEVER SPEAKS AS A PERSON ────────────────────────────────────────────
 *
 * A failure renders as THE SURFACE failing, in `failure`, visually distinct
 * from an entry and never carrying a byline.
 *
 * That is a rule with a reason, found in the author studio's chat while
 * building this: on a network error it calls
 * `addChatMessage(editorName, "I'm having trouble connecting…")` — so a
 * connection failure is written into the history AS ALEX, and the same string
 * is also the `||` fallback when a successful response has an unexpected
 * shape. A reader cannot tell those lines from something the editor said.
 * R8's third rule — observations, not utterances — and the plainer rule that a
 * persona must never be made to say something it did not say.
 *
 * This component cannot do that: `failure` has no byline slot, and entries
 * come only from the caller's data.
 */

import { useState } from 'react'
import type { StudioAudience } from './StudioRoom'

export interface ConversationEntry {
  id: string
  body: string
  /** Who said it, where that is known. Null renders no byline at all —
   *  never a placeholder, never the house's own name standing in. */
  byline: string | null
  /** Already formatted by the caller: formatting is a register decision. */
  when: string | null
  /** A system line — rendered plainly, never with a persona's byline. */
  system?: boolean
}

export interface ConversationComposer {
  placeholder: string
  submitLabel: string
  onSend: (body: string) => void | Promise<void>
  /** Busy, not broken. Keeps the control mounted and inert for the moment. */
  busy?: boolean
}

export function StudioConversation({
  audience,
  title,
  subtitle,
  entries,
  emptyText,
  composer = null,
  failure = null,
  thinking = false,
}: {
  audience: StudioAudience
  /** The tool's own label. Caller-supplied: the register is the caller's,
   *  per B4 — this component never writes a word of its own about the book. */
  title: string
  subtitle?: string | null
  entries: readonly ConversationEntry[]
  /** What an empty list means, in the caller's words. Never "no data". */
  emptyText: string
  /** null = no send path. The composer is NOT MOUNTED, not disabled. */
  composer?: ConversationComposer | null
  failure?: string | null
  /** A pending reply. Rendered as the surface waiting, with no byline. */
  thinking?: boolean
}) {
  const [draft, setDraft] = useState('')
  // `audience` is held so the two chairs can diverge here later without a new
  // parameter; it changes nothing today and that is stated rather than hidden
  // behind an unused-variable suppression.
  void audience

  async function submit() {
    if (!composer) return
    const body = draft.trim()
    if (!body) return
    await composer.onSend(body)
    setDraft('')
  }

  return (
    <section className="border-t border-[#E8E5E0] first:border-t-0">
      <div className="px-5 py-4 border-b border-[#E8E5E0]">
        <p className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">{title}</p>
        {subtitle && <p className="text-[12px] text-[#8A8A8A] mt-1">{subtitle}</p>}
      </div>

      <div className="px-5 py-4">
        {entries.length === 0 && !thinking ? (
          <p className="text-[13px] text-[#8A8A8A] leading-relaxed">{emptyText}</p>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => (
              <div
                key={e.id}
                className={
                  e.system
                    ? 'text-[12.5px] leading-relaxed text-[#8A8A8A]'
                    : 'border border-[#E8E5E0] bg-white rounded-[3px] px-3.5 py-3'
                }
              >
                <div className={e.system ? '' : 'text-[14px] leading-[1.55] text-[#2A2A2A]'}>
                  {e.body}
                </div>
                {/* A byline only where there is one. No placeholder, and
                    nothing standing in for a name we do not hold. */}
                {!e.system && (e.byline || e.when) && (
                  <div className="text-[11px] text-[#B8B8B8] mt-2">
                    {[e.byline, e.when].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              // The surface waiting. No byline, because nobody has spoken.
              <p className="text-[12.5px] text-[#8A8A8A] italic">Waiting for a reply…</p>
            )}
          </div>
        )}

        {/* A FAILURE IS THE SURFACE'S, NEVER A PERSON'S. No byline slot
            exists here, which is what stops this column doing what the
            author studio's chat does on a network error. */}
        {failure && (
          <p className="text-[12.5px] leading-relaxed mt-4" style={{ color: '#B5654A' }}>
            {failure}
          </p>
        )}

        {/* NOT MOUNTED when there is no send path. */}
        {composer && (
          <div className="mt-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={composer.placeholder}
              rows={3}
              disabled={composer.busy}
              className="w-full text-[13px] px-3 py-2.5 border border-[#E8E5E0] rounded-[3px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={submit}
              disabled={composer.busy || draft.trim().length === 0}
              className="mt-2 text-[12.5px] px-3 py-1.5 rounded-[3px] bg-[#1E3A5F] text-white disabled:opacity-40"
            >
              {composer.busy ? 'Saving…' : composer.submitLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
