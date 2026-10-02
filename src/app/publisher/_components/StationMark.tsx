'use client'

/**
 * THE THREE STATION MARKS — lifted here VERBATIM, at `ux`'s ask, 2026-10-02.
 *
 * `sysadmin`'s High Line ruling §6 made these non-negotiable for the publisher
 * shell and told `ux` to reuse them rather than mint new ones. `ux` then asked
 * for the component itself rather than the description, which is the right ask:
 * a second implementation of three marks is two implementations that will
 * disagree, and the disagreement would land on the exact distinction the marks
 * exist to make.
 *
 * NOTHING BELOW IS CHANGED from the dashboard version — not a colour, not a
 * title string, not the ordering of the branches. It is moved, not rewritten,
 * so the shell's journey strip and the wall chart cannot drift apart. If a mark
 * needs to change it changes here, once, for both.
 *
 * The third mark is the one that matters and the one that was missing: a
 * structural station (Manuscript, Handoff) has no `completedBy`, and before
 * 2026-09-30 it rendered as a GREEN BOX CONTAINING AN EM-DASH — green meaning
 * "completed by the system" in this page's own key, so the cell claimed the
 * machine had done something it had not, while showing a character that reads
 * as missing data. Two lies in one cell. Whence the House Rule: WHEN YOU SPLIT
 * A STATE IN TWO, NAME WHAT HAPPENS TO THE STATE THAT IS NEITHER.
 *
 * `publishing` has already reused these (filled or empty, and no em-dash in a
 * filled cell) rather than minting their own. That is the point of this file.
 */

export type StationState = 'complete' | 'in-progress' | 'not-started'

export interface StationCell {
  key: string
  name: string
  state: 'complete' | 'in-progress' | 'not-started'
  completedBy: 'system' | 'human' | null
  /** Who recorded it, where the estate captured that. Null on every row
   *  predating 2026-09-30 — the actor columns were applied and deliberately
   *  NOT backfilled, so a null here means "not recorded" and is shown as
   *  "by hand" rather than as a name nobody wrote down. */
  completedByName: string | null
  operator: string | null
}

// ─── The marks ─────────────────────────────────────────────────────────
// Three states, and a complete station additionally says WHO. The distinction
// between "the machine ran this" and "a person recorded it" is the authority
// model made visible, and it is the whole argument for level 1 being a real
// product rather than a crippled one.

export function StationMark({ cell }: { cell: StationCell }) {
  const base =
    'w-full h-8 rounded-[3px] flex items-center justify-center text-[10px] font-medium'

  if (cell.state === 'complete') {
    // THREE kinds of complete, and they must not share a mark.
    //
    // Found on the live surface: a structural station (Manuscript, Handoff)
    // has no `completedBy` — nobody "runs" a submission — so it rendered as a
    // green box containing an em-dash. Green means "completed by the system"
    // in this page's own key, so the cell was both claiming the wrong thing
    // and showing a character that reads as missing data. On the surface that
    // is meant to be the most finished thing we own.
    if (cell.completedBy === null) {
      return (
        <div
          className={base}
          style={{ background: '#F3F4F6', color: '#4B5563', border: '1px solid #E5E7EB' }}
          title={`${cell.name} — reached`}
        >
          reached
        </div>
      )
    }
    const byPerson = cell.completedBy === 'human'
    return (
      <div
        className={base}
        style={
          byPerson
            ? { background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE' }
            : { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }
        }
        title={
          byPerson
            ? cell.completedByName
              ? `${cell.name} — recorded by ${cell.completedByName}`
              : `${cell.name} — recorded by hand (no name captured)`
            : `${cell.name} — completed by the system`
        }
      >
        {/* The mark stays "by hand" even when a name is known: it is 24px of
            cell and a name does not fit in it. The name is in the title, which
            is where it can be read without crowding out the distinction the
            mark exists to make. And where no name was captured the tooltip
            SAYS so, rather than leaving the reader to wonder whether a person
            with no name recorded it. */}
        {byPerson ? 'by hand' : 'done'}
      </div>
    )
  }

  if (cell.state === 'in-progress') {
    return (
      <div
        className={base}
        style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}
        title={`${cell.name}${cell.operator ? ` — ${cell.operator}` : ''}`}
      >
        {cell.operator ?? 'running'}
      </div>
    )
  }

  return (
    <div
      className={base}
      style={{ background: '#FAFAF9', color: '#C4C4C0', border: '1px solid #EFEFEC' }}
      title={`${cell.name} — not started`}
    />
  )
}
