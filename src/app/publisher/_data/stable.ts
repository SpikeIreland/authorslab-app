/**
 * THE STABLE — mock data for the Publisher Home (/publisher).
 *
 * ─── Why this file exists on its own ─────────────────────────────────────────
 * Every row the Publisher Home renders comes from here and nowhere else. When
 * the live data path lands (server routes reading with the service-role key —
 * see handovers/publisher-to-paul+sysadmin+ux-demo-journey-spec-2026-09-22.md
 * §3), swapping to real rows is a single import change in page.tsx, not a
 * rewrite of the page.
 *
 * ─── The author names are invented, on purpose ───────────────────────────────
 * Every author below except Carl Lyons is a fictional person. A demo list
 * carrying real authors' names, shown to a literary agent, reads as a claim
 * that those authors are AuthorsLab clients. Do not replace these with real
 * names. Ratified by Paul 2026-09-22.
 */

// ─── 1. Types ─────────────────────────────────────────────────────────────────

export type PhaseNumber = 1 | 2 | 3 | 4 | 5

export interface StableListing {
  /** Stable key for React. Not a manuscript id. */
  key: string
  title: string
  authorFirst: string
  authorLast: string
  genre: string
  wordCount: number
  chapters: number
  phase: PhaseNumber
  /** ISO date of last editorial activity. Fixed, so the demo never drifts. */
  lastActivity: string
  /**
   * A real manuscript id, or null for a sample listing.
   * Only rows with a live id navigate; the rest say so when clicked rather
   * than routing into a "Project not available" wall.
   */
  projectId: string | null
}

// ─── 2. The live listing — THE ONE ROW THAT NAVIGATES ─────────────────────────
//
// Two real manuscripts carry this book. They are otherwise identical, so the
// ONLY thing distinguishing them is the account that owns them — which is why
// each is named here rather than pasted inline.
//
//   PRE_FLIGHT  paul.lyons@authorslab.ai   — Paul's own copy, for testing now
//   DEMO_DAY    carl@spikeisland.tv        — Carl's copy, for Wednesday
//
// Flip ACTIVE_PROJECT_ID to DEMO_DAY before the demo. That is the whole switch.

export const PRE_FLIGHT_PROJECT_ID = '4d0025e6-14cc-458b-a70c-f48593aff44d'
export const DEMO_DAY_PROJECT_ID = 'c037e098-2f9c-4728-8ac3-f97fb40665fc'

export const ACTIVE_PROJECT_ID = PRE_FLIGHT_PROJECT_ID

// ─── 3. Phase vocabulary ──────────────────────────────────────────────────────

export const PHASE_NAMES: Record<PhaseNumber, string> = {
  1: 'Developmental',
  2: 'Line',
  3: 'Copy',
  4: 'Design',
  5: 'Marketing',
}

// ─── 4. The stable ────────────────────────────────────────────────────────────
//
// Eight books, spread across all five phases, so the author filter has
// something to do and the list reads as a working stable rather than a
// showroom. Carl's is the furthest along — it is the one Carl clicks.

export const STABLE: StableListing[] = [
  {
    key: 'veil-and-flame',
    title: 'The Veil and the Flame',
    authorFirst: 'Carl',
    authorLast: 'Lyons',
    genre: 'Science fiction',
    wordCount: 47291,
    chapters: 37,
    phase: 5,
    lastActivity: '2026-09-19',
    projectId: ACTIVE_PROJECT_ID,
  },
  {
    key: 'salt-and-tinder',
    title: 'Salt and Tinder',
    authorFirst: 'Moira',
    authorLast: 'Vance',
    genre: 'Literary fiction',
    wordCount: 82140,
    chapters: 41,
    phase: 4,
    lastActivity: '2026-09-18',
    projectId: null,
  },
  {
    key: 'quiet-cartographer',
    title: 'The Quiet Cartographer',
    authorFirst: 'Emeka',
    authorLast: 'Duru',
    genre: 'Historical fiction',
    wordCount: 96430,
    chapters: 52,
    phase: 3,
    lastActivity: '2026-09-17',
    projectId: null,
  },
  {
    key: 'nightjar-season',
    title: 'Nightjar Season',
    authorFirst: 'Róisín',
    authorLast: 'Caffrey',
    genre: 'Crime',
    wordCount: 74880,
    chapters: 44,
    phase: 3,
    lastActivity: '2026-09-15',
    projectId: null,
  },
  {
    key: 'what-the-tide-owes',
    title: 'What the Tide Owes',
    authorFirst: 'Priya',
    authorLast: 'Raghunathan',
    genre: 'Literary fiction',
    wordCount: 68020,
    chapters: 33,
    phase: 2,
    lastActivity: '2026-09-12',
    projectId: null,
  },
  {
    key: 'antikythera-letters',
    title: 'The Antikythera Letters',
    authorFirst: 'Tomas',
    authorLast: 'Berg',
    genre: 'Historical thriller',
    wordCount: 91005,
    chapters: 48,
    phase: 2,
    lastActivity: '2026-09-09',
    projectId: null,
  },
  {
    key: 'small-mercies',
    title: 'Small Mercies at Scale',
    authorFirst: 'Delphine',
    authorLast: 'Okonjo',
    genre: 'Non-fiction',
    wordCount: 58760,
    chapters: 22,
    phase: 1,
    lastActivity: '2026-09-05',
    projectId: null,
  },
  {
    key: 'hollow-orchard',
    title: 'The Hollow Orchard',
    authorFirst: 'Aled',
    authorLast: 'Pryce',
    genre: 'Speculative fiction',
    wordCount: 39410,
    chapters: 19,
    phase: 1,
    lastActivity: '2026-08-28',
    projectId: null,
  },
]

// ─── 5. Derived helpers ───────────────────────────────────────────────────────

export function fullName(l: StableListing): string {
  return `${l.authorFirst} ${l.authorLast}`
}

/** Unique author names, surname-sorted — drives the filter control. */
export function authorsInStable(listings: StableListing[]): string[] {
  const seen = new Map<string, StableListing>()
  for (const l of listings) seen.set(fullName(l), l)
  return Array.from(seen.values())
    .sort((a, b) => a.authorLast.localeCompare(b.authorLast))
    .map(fullName)
}
