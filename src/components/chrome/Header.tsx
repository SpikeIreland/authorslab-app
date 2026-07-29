'use client'

/**
 * Header — charcoal 56px, wordmark + mode label + optional project title +
 * notification bell + profile chip.
 *
 * Per AL-UX-004 §2.1.
 */

import Link from 'next/link'
import { NotificationBell } from '@/components/NotificationBell'
import { ProfileChip } from './ProfileChip'

interface HeaderProps {
  /** Optional project title, shown centred when set (i.e. inside a project shell). */
  projectTitle?: string
  /** Optional first name for the profile chip (else it self-fetches). */
  firstName?: string
  /** Mode label to the right of the wordmark. Default "Author". */
  modeLabel?: string
}

export function Header({ projectTitle, firstName, modeLabel = 'Author' }: HeaderProps) {
  const inProject = Boolean(projectTitle)

  return (
    <header
      className="h-14 flex items-center px-4 sticky top-0 z-40"
      style={{ background: 'var(--color-charcoal)', color: 'var(--color-paper)' }}
    >
      {/* Left cluster — wordmark + mode label + optional back link */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/home" className="flex items-baseline gap-2 hover:opacity-90 transition-opacity">
          <span
            className="text-[18px] leading-none font-normal tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            AuthorsLab
          </span>
          <span
            className="text-[11px] italic"
            style={{ color: 'var(--color-faint)' }}
          >
            {modeLabel}
          </span>
        </Link>
        {inProject && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--color-faint)' }}>·</span>
            <Link
              href="/lobby"
              className="text-[12px] hover:text-white transition-colors"
              style={{ color: 'var(--color-faint)' }}
            >
              ← Projects
            </Link>
          </>
        )}
      </div>

      {/* Centre — current project title (only inside a project shell) */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-4">
        {inProject && (
          <span
            className="italic text-[15px] truncate"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-paper)' }}
            title={projectTitle}
          >
            {projectTitle}
          </span>
        )}
      </div>

      {/* Right cluster — bell + profile chip */}
      <div className="flex items-center gap-2">
        <NotificationBell variant="dark" />
        <ProfileChip firstName={firstName} />
      </div>
    </header>
  )
}
