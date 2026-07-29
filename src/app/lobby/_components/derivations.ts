/**
 * Lobby (The Library) derivations — shared by the page and card components.
 *
 * Preserved verbatim from the previous lobby/page.tsx per AL-UX-004 §3
 * ("this is a re-skin plus the mini-spine, not a data change").
 */

export interface LobbyProject {
  id: string
  title: string
  genre: string | null
  word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  cover_url: string | null
}

export type StageKey = 'ghostwriter' | 'author_studio' | 'design' | 'publishing' | 'marketing'
export type StageState = 'skipped' | 'pending' | 'active' | 'complete'

// Map a manuscript's current_phase_number + status to states for each of the
// five Library pills. Existing manuscripts skipped Ghostwriter (they came in via
// the upload onboarding); future projects from the new flow may show
// Ghostwriter active.
export function deriveStageStates(p: LobbyProject): Record<StageKey, StageState> {
  const phase = p.current_phase_number ?? 1
  const status = p.status ?? ''

  if (status === 'complete') {
    return {
      ghostwriter: 'skipped',
      author_studio: 'complete',
      design: 'complete',
      publishing: 'complete',
      marketing: 'complete',
    }
  }

  if (status === 'ghostwriting') {
    return {
      ghostwriter: 'active',
      author_studio: 'pending',
      design: 'pending',
      publishing: 'pending',
      marketing: 'pending',
    }
  }

  return {
    ghostwriter: 'skipped',
    author_studio: phase >= 1 && phase <= 3 ? 'active' : phase > 3 ? 'complete' : 'pending',
    design: phase === 4 ? 'active' : phase > 4 ? 'complete' : 'pending',
    publishing: phase === 4 ? 'active' : phase > 4 ? 'complete' : 'pending',
    marketing: phase === 5 ? 'active' : 'pending',
  }
}

export function editorForPhase(phase: number | null): string | null {
  if (phase === 1) return 'Alex'
  if (phase === 2) return 'Sam'
  if (phase === 3) return 'Jordan'
  return null
}

/** Active persona name for the current stage (used by BookCard's Next line). */
export function activePersonaFor(p: LobbyProject): string {
  if (p.status === 'ghostwriting') return 'Eden'
  const phase = p.current_phase_number ?? 1
  if (phase === 1) return 'Alex'
  if (phase === 2) return 'Sam'
  if (phase === 3) return 'Jordan'
  if (phase === 4) return 'Taylor'
  if (phase === 5) return 'Riley'
  return 'Alex'
}

export function nextActionFor(p: LobbyProject): string {
  if (p.status === 'complete') return 'Live and available — review sales or run a campaign'
  if (p.status === 'ghostwriting') return 'Eden is waiting to introduce your ghostwriter'
  const phase = p.current_phase_number ?? 1
  if (phase === 1) return 'Alex is reading your manuscript'
  if (phase === 2) return 'Sam is reviewing your manuscript with you'
  if (phase === 3) return 'Jordan is polishing the final pass'
  if (phase === 4) return 'Set up cover, metadata and platforms'
  if (phase === 5) return 'Plan your launch with Riley'
  return 'Open the project to keep going'
}

/** Route target for a project card. Lands on the project shell. */
export function openHrefFor(p: LobbyProject): string {
  return `/projects/${p.id}`
}

/** "Updated 2 days ago", "Updated today", etc. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const day = 24 * 60 * 60 * 1000
  const hour = 60 * 60 * 1000
  const minute = 60 * 1000

  if (diffMs < hour) {
    const m = Math.max(1, Math.floor(diffMs / minute))
    return `Updated ${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour)
    return `Updated ${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diffMs < 2 * day) return 'Updated yesterday'
  if (diffMs < 7 * day) {
    const d = Math.floor(diffMs / day)
    return `Updated ${d} days ago`
  }
  if (diffMs < 30 * day) {
    const w = Math.floor(diffMs / (7 * day))
    return `Updated ${w} week${w === 1 ? '' : 's'} ago`
  }
  const mo = Math.floor(diffMs / (30 * day))
  return `Updated ${mo} month${mo === 1 ? '' : 's'} ago`
}

/** Time-of-day-aware greeting seed. */
export function greetingFor(name: string): string {
  const h = new Date().getHours()
  const period = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${period}, ${name}.` : `${period}.`
}

/** Persona colour tokens. */
export type PersonaKey = 'alex' | 'sam' | 'jordan' | 'eden' | 'ivy' | 'reid' | 'taylor' | 'riley'

export function personaColourFor(persona: string): { bg: string; ink: string } {
  const p = persona.toLowerCase() as PersonaKey
  if (p === 'alex' || p === 'eden') return { bg: 'var(--color-sage)', ink: 'var(--color-paper)' }
  if (p === 'sam' || p === 'ivy') return { bg: 'var(--color-terracotta)', ink: 'var(--color-paper)' }
  if (p === 'jordan' || p === 'reid') return { bg: 'var(--color-sage-deep)', ink: 'var(--color-paper)' }
  if (p === 'taylor') return { bg: '#A98A6B', ink: 'var(--color-paper)' }
  if (p === 'riley') return { bg: 'var(--color-faint)', ink: 'var(--color-paper)' }
  return { bg: 'var(--color-muted)', ink: 'var(--color-paper)' }
}

/** Cover palette rotation for procedural typeset covers, keyed on id. */
export function coverPaletteFor(id: string): { bg: string; ink: string; accent: string } {
  // Cheap stable hash so the same book always gets the same cover.
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const idx = Math.abs(h) % 3
  if (idx === 0) return { bg: 'var(--color-charcoal)', ink: 'var(--color-paper)', accent: 'var(--color-sage)' }
  if (idx === 1) return { bg: 'var(--color-sage-deep)', ink: 'var(--color-paper)', accent: 'var(--color-sage-bg)' }
  return { bg: 'var(--color-terracotta)', ink: 'var(--color-paper)', accent: 'var(--color-amber-bg)' }
}
