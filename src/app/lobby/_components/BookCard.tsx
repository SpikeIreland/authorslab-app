'use client'

/**
 * BookCard — Library book card per AL-UX-004 §3.
 *
 * Composition:
 *   [ small typeset cover ] [ title + genre/words/updated ]
 *                           [ mini journey spine ]
 *                           [ Next line: persona avatar + sentence + Open → ]
 *
 * The entire card is a Link to /projects/[id] — the "Open →" is a visual cue,
 * not a separate target.
 */

import Link from 'next/link'
import {
  type LobbyProject,
  deriveStageStates,
  editorForPhase,
  activePersonaFor,
  nextActionFor,
  openHrefFor,
  relativeTime,
} from './derivations'
import { BookCover } from './BookCover'
import { MiniJourneySpine } from './MiniJourneySpine'
import { PersonaAvatar } from './PersonaAvatar'

interface BookCardProps {
  project: LobbyProject
  launched?: boolean
}

export function BookCard({ project, launched }: BookCardProps) {
  const states = deriveStageStates(project)
  const editor = editorForPhase(project.current_phase_number)
  const persona = activePersonaFor(project)
  const next = nextActionFor(project)
  const href = openHrefFor(project)
  const updated = relativeTime(project.updated_at)

  const wordCount = project.word_count ? `${project.word_count.toLocaleString()} words` : null
  const meta = [project.genre, wordCount].filter(Boolean).join(' · ')

  // Live stage detail — e.g. "Line edit · Sam". If no live stage, no detail.
  const activeDetail = launched
    ? null
    : project.status === 'ghostwriting'
      ? 'Drafting with Eliot'
      : editor
        ? `${labelForActivePhase(project.current_phase_number)} · ${editor}`
        : null

  return (
    <Link
      href={href}
      className="group block rounded-lg transition-shadow"
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-line)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <article className="p-5 flex gap-5">
        <BookCover
          id={project.id}
          title={project.title}
          coverUrl={project.cover_url}
          size="small"
        />

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-baseline justify-between gap-3">
            <h2
              className="text-[19px] leading-tight truncate"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              {project.title}
            </h2>
            <span
              className="text-[11px] whitespace-nowrap"
              style={{
                color: launched ? 'var(--color-sage-deep)' : 'var(--color-muted)',
                fontWeight: launched ? 500 : 400,
              }}
            >
              {launched ? '✓ Launched' : updated}
            </span>
          </div>

          {/* Meta */}
          {meta && (
            <p className="text-[12px] -mt-1.5" style={{ color: 'var(--color-muted)' }}>
              {meta}
            </p>
          )}

          {/* Mini journey spine + live detail */}
          <MiniJourneySpine states={states} activeDetail={activeDetail ?? undefined} />

          {/* Next line */}
          <div
            className="flex items-center justify-between gap-3 pt-3"
            style={{ borderTop: '1px solid var(--color-line-soft)' }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <PersonaAvatar persona={persona} size={22} />
              <p className="text-[13px] truncate" style={{ color: 'var(--color-ink)' }}>
                {next}
              </p>
            </div>
            <span
              className="text-[12px] font-medium whitespace-nowrap transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--color-sage-deep)' }}
            >
              Open →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function labelForActivePhase(phase: number | null): string {
  if (phase === 1) return 'Developmental'
  if (phase === 2) return 'Line edit'
  if (phase === 3) return 'Copy edit'
  if (phase === 4) return 'Design'
  if (phase === 5) return 'Marketing'
  return 'In progress'
}
