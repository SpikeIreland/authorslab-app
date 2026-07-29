'use client'

/**
 * AppShell — composes Header + LeftRail + content area.
 *
 * Wraps every authenticated page for consistent chrome. Per AL-UX-004 §2.
 * Content area uses the ivory app background so cards read as paper against it.
 *
 * Usage:
 *   <AppShell projectTitle="The Signal and the Shadow">
 *     <YourPageContent />
 *   </AppShell>
 *
 * projectTitle is only set inside a project shell — outside a project, the
 * header centre is empty and the "← Projects" back link is hidden.
 */

import { Header } from './Header'
import { LeftRail } from './LeftRail'

interface AppShellProps {
  children: React.ReactNode
  /** Project title, shown centred in the header when inside a project. */
  projectTitle?: string
  /** Optional first name for the profile chip; else it self-fetches. */
  firstName?: string
  /** Mode label (default "Author"). Rarely overridden. */
  modeLabel?: string
  /** Hide the rail — useful for edge cases like standalone full-screen editors. */
  hideRail?: boolean
}

export function AppShell({ children, projectTitle, firstName, modeLabel, hideRail = false }: AppShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-ivory)', color: 'var(--color-ink)' }}
    >
      <Header projectTitle={projectTitle} firstName={firstName} modeLabel={modeLabel} />
      <div className="flex flex-1 min-h-0">
        {!hideRail && <LeftRail />}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
