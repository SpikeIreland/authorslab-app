'use client'

/**
 * PUBLISHER SHELL — the publisher application wearing the Author UI's layout.
 *
 * Commissioned by sysadmin's High Line demo-build ruling §6 (2026-10-02):
 * replicate the Author shell's grammar — charcoal header, 64px left panel,
 * content area — for the publisher product. `ux` owns this shell; `publisher`
 * owns every page mounted inside it (R: a lane owns an ENGINE or a SURFACE).
 *
 * ─── The left panel: Paul's four, honestly rendered ─────────────────────────
 * Paul's specification names Books · People · House Style · Chat. Two of the
 * four surfaces exist today. The other two render as non-clickable "Soon"
 * chips — the ProjectTabStrip precedent — because a panel item is an
 * affordance and an affordance is a claim. Each chip flips to a live item in
 * THIS file the day its surface ships, so the panel always shows the product's
 * shape without ever claiming an unbuilt room. (R9 covers simulated SURFACES;
 * a navigation item is not a surface and gets the Soon treatment instead.)
 *
 * ─── R7 ─────────────────────────────────────────────────────────────────────
 * The noun is Books, never Projects, on everything publisher-facing.
 *
 * ─── Vocabulary note ────────────────────────────────────────────────────────
 * This shell renders NOTHING author-shaped: no author rail items, no author
 * Home, no Wright anywhere (explicitly excluded from the publisher product).
 * The two applications share tokens and grammar, not navigation.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FirmChip } from '@/app/publisher/_components/FirmChip'

interface PanelItem {
  href: string
  label: string
  match: (pathname: string) => boolean
  icon: React.ReactNode
  soon?: false
}
interface SoonItem {
  label: string
  icon: React.ReactNode
  soon: true
}

const PANEL: (PanelItem | SoonItem)[] = [
  {
    href: '/publisher',
    label: 'Books',
    // Books = the home list, the dashboard, and every per-title surface.
    // Everything publisher-side that is not People/Company is about books.
    match: (p) =>
      p.startsWith('/publisher') &&
      !p.startsWith('/publisher/people') &&
      !p.startsWith('/publisher/company'),
    icon: <IconBooks />,
  },
]

// ─── §4 of sysadmin's own-app RULING (2026-10-06, decided by Paul) ──────────
// Until the publisher product moves to its own application, the shell renders
// ONE station: Books → a title → the report. People, House Style and Chat are
// HIDDEN, not deleted — they return in the publisher's own app, and their
// routes stay live for anyone who holds a URL. This is not the affordance
// rule inverted: that rule bars offering what doesn't work, never withholding
// what does. What §4 names is the opposite claim — twelve unfinished rooms
// presenting as a broken platform instead of one finished small one.
const HIDDEN_UNTIL_SPLIT: (PanelItem | SoonItem)[] = [
  {
    href: '/publisher/people',
    label: 'People',
    match: (p) => p.startsWith('/publisher/people'),
    icon: <IconPeople />,
  },
  {
    // LIVE since 2026-09-30 at /publisher/company — my first render of this
    // panel put a "Soon" chip on it, which is the affordance rule INVERTED:
    // a disclaimer denying a capability we have (publisher's catch,
    // 2026-10-02). The panel points at the existing surface; nothing else
    // about that surface changed.
    href: '/publisher/company',
    label: 'House Style',
    match: (p) => p.startsWith('/publisher/company'),
    icon: <IconHouseStyle />,
  },
  { label: 'Chat', icon: <IconChat />, soon: true },
]
void HIDDEN_UNTIL_SPLIT

export function PublisherShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--color-ivory)' }}>
      {/* Header — same charcoal grammar as the author product, publisher voice */}
      <header
        className="h-14 flex items-center px-4 sticky top-0 z-40 flex-shrink-0"
        style={{ background: 'var(--color-charcoal)', color: 'var(--color-paper)' }}
      >
        <Link href="/publisher" className="flex items-baseline gap-2 hover:opacity-90 transition-opacity">
          <span
            className="text-[18px] leading-none font-normal tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            AuthorsLab
          </span>
          <span className="text-[11px] italic" style={{ color: 'var(--color-faint)' }}>
            Publisher
          </span>
        </Link>
        <div className="ml-auto">
          {/* The house name, or nothing — FirmChip's own honest-refusal rule. */}
          <FirmChip />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left panel — 64px charcoal, Author-rail grammar */}
        <nav
          className="w-16 flex flex-col items-center py-3 flex-shrink-0 overflow-y-auto"
          style={{ background: 'var(--color-charcoal)', color: 'var(--color-paper)' }}
          aria-label="Publisher"
        >
          <ul className="flex flex-col items-center gap-1 w-full px-2">
            {PANEL.map((item) =>
              item.soon ? (
                <li key={item.label} className="w-full">
                  <div
                    className="relative flex flex-col items-center gap-1 py-2 rounded-md select-none"
                    style={{ color: 'var(--color-faint)', opacity: 0.55 }}
                    aria-disabled="true"
                    title={`${item.label} — coming soon`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                    {/* text-center: items-center centres the BOX, not the text
                        inside it. Without this, any label that wraps — "House
                        Style" is the only one today — renders left-ragged and
                        reads as a misalignment. Paul found it in the first
                        screenshot he took. */}
                    <span className="text-[8.5px] font-medium tracking-wide text-center leading-tight">{item.label}</span>
                    <span className="text-[7px] uppercase tracking-widest">soon</span>
                  </div>
                </li>
              ) : (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    className="relative flex flex-col items-center gap-1 py-2 rounded-md transition-colors"
                    style={{
                      background: item.match(pathname) ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: item.match(pathname) ? 'var(--color-paper)' : 'var(--color-faint)',
                    }}
                    aria-current={item.match(pathname) ? 'page' : undefined}
                  >
                    {item.match(pathname) && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                        style={{ background: 'var(--color-sage)' }}
                      />
                    )}
                    <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                    <span className="text-[8.5px] font-medium tracking-wide text-center leading-tight">{item.label}</span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function IconBooks() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 3.5h3v13H4zM8.5 3.5h3v13h-3z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12.8 4.2l2.9-.6 2 12.7-2.9.6z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7.5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 15.5c.8-2.2 2.6-3.3 4.5-3.3s3.7 1.1 4.5 3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13.8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.2 12.6c1.9 0 3.5 1 4.3 2.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconHouseStyle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 9.5L10 4l6.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9v6.5h9V9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.2 13.2l1.2-3 1.2 3M8.6 12.3h1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3.5 5.5A1.5 1.5 0 015 4h10a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0115 13H8l-3.5 3v-3H5a1.5 1.5 0 01-1.5-1.5v-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
