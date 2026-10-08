'use client'

/**
 * THE PUBLIC PUBLISHER CHROME — header, nav, footer, shared by every
 * /publishers page.
 *
 * Mounted ONCE in `src/app/publishers/layout.tsx`, not per page, for the same
 * reason the per-book journey strip is mounted once in the [projectId] layout:
 * a page added later cannot then ship with the nav on eight pages and missing
 * on the ninth.
 *
 * FOUNDING RULING HELD: own header and own footer, no author-product mention
 * or link anywhere. The only cross-link is `Sign in`, which goes to the
 * publisher's own door at /publisher/login — not the shared one. That changed
 * under me on 2026-10-07 (commit 20bc7a7) and this component follows it rather
 * than keeping a second opinion about where the door is.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PUBLISHER_PAGES, PUBLISHER_CONTACT_EMAIL } from '../_content'

export function PublishersHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b border-line bg-ivory sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-6 pt-5 pb-0 flex items-baseline justify-between gap-6">
        <Link href="/publishers" className="font-serif text-xl text-ink hover:opacity-80 transition-opacity">
          AuthorsLab
        </Link>
        <span className="flex items-baseline gap-6">
          <span className="kicker text-sage-deep hidden md:inline">For publishing houses</span>
          <Link
            href="/publisher/login"
            className="text-[13px] font-semibold text-ink hover:text-sage-deep whitespace-nowrap"
          >
            Sign in
          </Link>
        </span>
      </div>

      {/* The nav. Every entry leads to a page that exists — an affordance is a
          claim, and a nav is nine of them at once. */}
      <nav aria-label="Sections" className="max-w-5xl mx-auto px-6">
        <ul className="flex items-center gap-1 overflow-x-auto -mb-px">
          {PUBLISHER_PAGES.map((p) => {
            const active = pathname === p.href
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={active ? 'page' : undefined}
                  className="relative inline-block whitespace-nowrap text-[13px] px-3 py-3 border-b-2 transition-colors"
                  style={
                    active
                      ? { borderColor: 'var(--color-ink)', color: 'var(--color-ink)', fontWeight: 600 }
                      : { borderColor: 'transparent', color: 'var(--color-muted)' }
                  }
                >
                  {p.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}

export function PublishersFooter() {
  return (
    <footer className="bg-charcoal text-faint mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t border-white/10">
        <span>&copy; 2026 AuthorsLab &middot; a Spike Island Studios company</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
          <a href={`mailto:${PUBLISHER_CONTACT_EMAIL}`} className="hover:text-ivory">Contact</a>
          <Link href="/privacy" className="hover:text-ivory">Privacy</Link>
          <Link href="/terms" className="hover:text-ivory">Terms</Link>
          <Link href="/cookies" className="hover:text-ivory">Cookies</Link>
          <Link href="/subprocessors" className="hover:text-ivory">Subprocessors</Link>
          <Link href="/dpa" className="hover:text-ivory">DPA</Link>
        </span>
      </div>
    </footer>
  )
}
