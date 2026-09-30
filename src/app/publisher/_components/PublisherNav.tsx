'use client'

/**
 * PUBLISHER NAV — the chrome, which is now mine end to end.
 *
 * `ux` handed this lane its own chrome on 2026-09-30 and endorsed the
 * no-AppShell-rail choice as doctrine. So navigation between publisher
 * surfaces lives here rather than in the author's rail.
 *
 * ─── ONLY WHAT EXISTS ────────────────────────────────────────────────────────
 * The build brief names four surfaces — Dashboard, Company, People, Notes.
 * THREE are built. This strip lists three.
 *
 * A tab is an affordance and an affordance is a claim: a "Company" tab leading
 * nowhere, or to an empty shell, tells a publisher the feature exists. Tabs
 * appear here as each surface does and not before — the same rule that removed
 * three controls from these pages this week.
 *
 * It also closes the defect Paul found on the portal from the other side: the
 * dashboard shipped with no way IN. A surface nobody can navigate to is a
 * surface nobody can check.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/publisher', label: 'What is late' },
  { href: '/publisher/dashboard', label: 'Where everything is' },
  { href: '/publisher/company', label: 'Your house' },
] as const

export function PublisherNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b" style={{ borderColor: '#E5E5E3' }}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1">
        {TABS.map((t) => {
          const active = pathname === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className="text-[13px] px-3 py-2.5 -mb-px border-b-2 transition-colors"
              style={
                active
                  ? { borderColor: 'var(--color-ink, #1A1A1A)', color: 'var(--color-ink, #1A1A1A)' }
                  : { borderColor: 'transparent', color: 'var(--color-muted, #6B6B6B)' }
              }
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
