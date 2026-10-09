'use client'

/**
 * THE STUDIO ROOM — one surface, two chairs.
 *
 * Extraction 2 of `ux`'s SPEC "the studio, parameterised: same room, different
 * chair" (2026-10-09), built under sysadmin's UNFREEZE §3.
 *
 * ─── §1 ONE PARAMETER ───────────────────────────────────────────────────────
 *
 * `audience`. Register and hands both derive from it. Nobody passes "voice"
 * and "capability" separately, because the day they disagree we have built a
 * liar — a room that speaks to the author while obeying a publisher.
 *
 * `assertAudience()` below REFUSES an unrecognised value rather than picking
 * one. That is astudio's rule from the chat path, applied to the surface: a
 * silent fallback here is a publisher being addressed as the author.
 *
 * ─── §2 HANDS ARE NEVER MOUNTED, NOT DISABLED ───────────────────────────────
 *
 * `ux`'s rule, verbatim, and the reason it is a rule: a disabled control can
 * be re-enabled by a later prop, a styling change or a caller that forgets
 * which argument it was. An absent mount cannot. So in the publisher chair
 * there is no drag handle, no chapter menu, no insert point, no
 * `contentEditable` and no save handler ANYWHERE in the rendered tree — not
 * present-and-inert. `ux`'s acceptance test 2 is grep-able and this file is
 * written to pass it by construction.
 *
 * Management affordances arrive as OPTIONAL props and are read only on the
 * author chair. Passing them with `audience: 'publisher'` renders nothing —
 * so a caller that wires them wrongly cannot leak a write verb.
 *
 * ─── GEOMETRY IS LIFTED, NOT INVENTED ──────────────────────────────────────
 *
 * Token-for-token from the author studio's own shell so the two chairs are
 * recognisable at a glance (`ux` acceptance test 3): spine `w-64` / `w-16`
 * collapsed, `bg-white border-r border-line flex flex-col transition-all`,
 * header `p-4 border-b border-line` with `font-bold text-ink`; work centre
 * `flex-1 flex flex-col bg-white` with a `flex-1 overflow-y-auto p-6` body.
 *
 * ─── WHAT THIS FILE DOES NOT DO, DELIBERATELY ──────────────────────────────
 *
 * No highlighting. `highlightTextInEditor` is NOT lifted here, and the reason
 * is a defect I found while reading it and reported rather than fixed:
 * it rewrites the editor's ENTIRE innerHTML to replace every smart quote with
 * a straight one so Mark.js can match, saves the original into a variable
 * that is then never read, and the author's next keystroke feeds the
 * straight-quoted `innerText` into the three-second autosave. A read-only
 * click therefore destroys an author's typography and commits it.
 * Carrying that into a shared definition would have spread it. It waits on
 * astudio's ruling, and the publisher chair has no editor to corrupt.
 */

import type React from 'react'

export type StudioAudience = 'author' | 'publisher'

/**
 * `ux` §1: absent defaults to 'author' until the publisher app is a distinct
 * caller, then errors. An unrecognised value errors NOW — a typo must never
 * resolve to a chair.
 */
export function assertAudience(value: string | undefined): StudioAudience {
  if (value === undefined) return 'author'
  if (value === 'author' || value === 'publisher') return value
  throw new Error(
    `StudioRoom: unrecognised audience "${value}". The surface refuses rather ` +
      `than guessing — a silent fallback here is a publisher addressed as the author.`
  )
}

export interface StudioChapter {
  chapter_number: number
  title: string
  word_count?: number | null
}

/** Author-chair only. Never read when audience is 'publisher'. */
export interface SpineManagement {
  onReorder?: () => void
  onRename?: (chapterNumber: number) => void
  onDelete?: (chapterNumber: number) => void
  onInsertAfter?: (chapterNumber: number) => void
  /** Chapter numbers with unsaved edits. The writer's fact; `ux` §2. */
  unsaved?: ReadonlySet<number>
}

/** P for prologue, E for epilogue — the author studio's own convention. */
function chapterSigil(n: number): string {
  if (n === 0) return 'P'
  if (n === 999) return 'E'
  return String(n)
}

export function StudioSpine({
  audience,
  chapters,
  currentChapter,
  onSelect,
  collapsed = false,
  onToggleCollapsed,
  management,
  /** Per-chapter note counts, publisher chair. A count is a fact. */
  noteCounts,
}: {
  audience: StudioAudience
  chapters: readonly StudioChapter[]
  currentChapter: number | null
  onSelect: (chapterNumber: number) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
  management?: SpineManagement
  noteCounts?: ReadonlyMap<number, number>
}) {
  // The single branch this file makes. Everything downstream reads `isAuthor`
  // rather than re-deriving, so there is one place the chair is decided.
  const isAuthor = audience === 'author'

  return (
    <div
      className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-line flex flex-col transition-all`}
    >
      <div className="p-4 border-b border-line">
        <div className="flex items-center justify-between mb-2">
          {!collapsed && (
            <h2 className="font-bold text-ink">Chapters ({chapters.length})</h2>
          )}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="p-2 hover:bg-paper-warm rounded"
              aria-label={collapsed ? 'Expand chapter list' : 'Collapse chapter list'}
            >
              {collapsed ? '→' : '←'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chapters.length === 0 ? (
          !collapsed && (
            // Honest absence. "0 chapters" would be a claim about the book;
            // this says what is true about the list.
            <p className="px-2 py-3 text-[12.5px]" style={{ color: 'var(--color-faint)' }}>
              No chapters on this title yet.
            </p>
          )
        ) : (
          <ul>
            {chapters.map((ch) => {
              const isCurrent = ch.chapter_number === currentChapter
              const notes = noteCounts?.get(ch.chapter_number) ?? 0
              return (
                <li key={ch.chapter_number}>
                  <button
                    onClick={() => onSelect(ch.chapter_number)}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`w-full text-left rounded-lg px-3 py-2 mb-1 transition-colors ${
                      isCurrent ? 'bg-paper-warm' : 'hover:bg-paper-warm'
                    }`}
                  >
                    {collapsed ? (
                      <span className="block text-center text-sm text-ink">
                        {chapterSigil(ch.chapter_number)}
                      </span>
                    ) : (
                      <span className="flex items-baseline gap-2 min-w-0">
                        <span className="text-[11px] tabular-nums shrink-0" style={{ color: 'var(--color-muted)' }}>
                          {chapterSigil(ch.chapter_number)}
                        </span>
                        <span className="text-sm text-ink truncate flex-1">{ch.title}</span>

                        {/* THE WRITER'S FACT — author chair only. `ux` §2:
                            "no unsaved state (unsaved is the writer's fact)".
                            Not greyed out in the publisher chair. Absent. */}
                        {isAuthor && management?.unsaved?.has(ch.chapter_number) && (
                          <span
                            className="shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--color-status-warn)' }}
                            title="Unsaved changes"
                          />
                        )}

                        {/* The house's fact, publisher chair. */}
                        {!isAuthor && notes > 0 && (
                          <span
                            className="shrink-0 text-[10.5px] tabular-nums px-1.5 rounded-full"
                            style={{ background: '#F2F0EC', color: 'var(--color-muted)' }}
                            title={`${notes} ${notes === 1 ? 'note' : 'notes'} on this chapter`}
                          >
                            {notes}
                          </span>
                        )}
                      </span>
                    )}
                  </button>

                  {/* ─── MANAGEMENT: author chair only, and NEVER MOUNTED
                      otherwise. The whole block is inside `isAuthor`, so a
                      publisher-chair render contains no rename, no delete and
                      no insert point in the tree at all — nothing to re-enable
                      and nothing to find with a grep of the output. */}
                  {isAuthor && !collapsed && management && (
                    <div className="flex items-center gap-1 px-3 pb-1">
                      {management.onRename && (
                        <button
                          onClick={() => management.onRename?.(ch.chapter_number)}
                          className="text-[11px] hover:text-ink"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Rename
                        </button>
                      )}
                      {management.onDelete && (
                        <button
                          onClick={() => management.onDelete?.(ch.chapter_number)}
                          className="text-[11px] hover:text-status-high"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Delete
                        </button>
                      )}
                      {management.onInsertAfter && (
                        <button
                          onClick={() => management.onInsertAfter?.(ch.chapter_number)}
                          className="text-[11px] hover:text-ink"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Insert after
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export function StudioWorkCentre({
  audience,
  title,
  text,
  header,
  onEdit,
  isLocked = false,
}: {
  audience: StudioAudience
  title: string | null
  /** The chapter's prose. Null while loading; empty string is a real answer. */
  text: string | null
  /** Caller-supplied bar above the text. Register is the caller's per B4. */
  header?: React.ReactNode
  /** AUTHOR CHAIR ONLY. Ignored entirely when audience is 'publisher'. */
  onEdit?: (next: string) => void
  isLocked?: boolean
}) {
  const isAuthor = audience === 'author'

  return (
    <div className="flex-1 flex flex-col bg-white">
      {header}
      <div className="flex-1 overflow-y-auto p-6">
        {text === null ? (
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Loading…
          </p>
        ) : text === '' ? (
          // An empty chapter is a real state, not a failure. Say which.
          <p className="text-sm" style={{ color: 'var(--color-faint)' }}>
            This chapter has no text on the record.
          </p>
        ) : isAuthor ? (
          /* ─── THE AUTHOR CHAIR. The ONLY place in this file where
             contentEditable appears, and it is inside `isAuthor`. */
          <div
            contentEditable={!isLocked}
            suppressContentEditableWarning
            onInput={(e) => onEdit?.(e.currentTarget.innerText || '')}
            className="max-w-[72ch] mx-auto whitespace-pre-wrap text-ink leading-relaxed outline-none"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}
          >
            {text}
          </div>
        ) : (
          /* ─── THE PUBLISHER CHAIR. Read-only, and SELECTABLE on purpose:
             selection is how a note anchors, and `quoted_text` is the anchor
             (`ux`'s provenance ruling — the offsets are hints, and in fact the
             studio never reads them at all; measured 2026-10-09).

             `user-select: text` is stated rather than assumed, because a
             parent that sets select-none would silently remove the one
             interaction this chair has. */
          <div
            className="max-w-[72ch] mx-auto whitespace-pre-wrap text-ink leading-relaxed"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 17, userSelect: 'text' }}
            aria-label={title ? `${title}, read only` : 'Chapter text, read only'}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  )
}
