'use client'

/**
 * LeftRail — charcoal 64px, full height. Home + Projects only per the standing
 * two-rail decision (AL-UX-004 §2.2, AL-UX-HANDOVER-001 §6).
 *
 * Active item shows a soft dark chip with a 3px sage left edge. Icons + 8.5px
 * labels. Wordmark mark on top.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface RailItem {
  href: string
  label: string
  match: (pathname: string) => boolean
  icon: React.ReactNode
}

const ITEMS: RailItem[] = [
  {
    href: '/home',
    label: 'Home',
    match: (p) => p === '/home' || p.startsWith('/home/'),
    icon: <IconHome />,
  },
  {
    href: '/lobby',
    label: 'Projects',
    match: (p) =>
      p === '/lobby' ||
      p.startsWith('/lobby/') ||
      p.startsWith('/projects/') ||
      p.startsWith('/author-studio'),
    icon: <IconBooks />,
  },
]

export function LeftRail() {
  const pathname = usePathname() || ''

  return (
    <nav
      className="w-16 flex flex-col items-center py-3 flex-shrink-0"
      style={{ background: 'var(--color-charcoal)', color: 'var(--color-paper)' }}
      aria-label="Primary"
    >
      {/* Wordmark mark */}
      <Link
        href="/home"
        className="w-9 h-9 rounded-md flex items-center justify-center mb-4 hover:opacity-90 transition-opacity"
        style={{ background: 'var(--color-sage-deep)' }}
        aria-label="AuthorsLab home"
      >
        <span
          className="text-[16px] leading-none"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-paper)' }}
        >
          A
        </span>
      </Link>

      <ul className="flex flex-col items-center gap-1 w-full px-2">
        {ITEMS.map((item) => {
          const active = item.match(pathname)
          return (
            <li key={item.href} className="w-full">
              <Link
                href={item.href}
                className="relative flex flex-col items-center gap-1 py-2 rounded-md transition-colors"
                style={{
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: active ? 'var(--color-paper)' : 'var(--color-faint)',
                }}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                    style={{ background: 'var(--color-sage)' }}
                  />
                )}
                <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                <span className="text-[8.5px] font-medium tracking-wide">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* Simple line icons — kept inline to avoid a dep. */
function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 9 L10 3 L17 9 V16 A1 1 0 0 1 16 17 H12 V12 H8 V17 H4 A1 1 0 0 1 3 16 Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBooks() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4 H8 V16 H4 Z M9 4 H13 V16 H9 Z M14 6 L17 5 L18 15 L15 16 Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
