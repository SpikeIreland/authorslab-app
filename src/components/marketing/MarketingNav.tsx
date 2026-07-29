'use client'

// ============================================================================
// AL-UX-006 · Shared marketing navigation
// One nav for every public page — replaces the per-page inline copies.
// Ivory, blur-on-scroll, hairline border; wordmark in the serif; one CTA.
// ============================================================================

import { useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/editors', label: 'Your editors' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
]

export function MarketingNav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-ivory/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-15 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center font-serif text-lg text-white">
            A
          </span>
          <span className="font-serif text-lg text-ink">AuthorsLab</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 text-sm">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={l.href === active ? 'text-ink font-medium' : 'text-muted hover:text-ink'}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="text-ink hover:text-sage-deep">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-sage-deep hover:bg-sage-deep/90 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Start your book
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 text-muted hover:text-ink"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open
              ? <path d="M6 6l12 12M6 18L18 6" />
              : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-ivory px-6 py-4 flex flex-col gap-3 text-sm">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-ink py-1" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="text-ink py-1" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-sage-deep text-white text-center font-semibold px-4 py-2.5 rounded-lg mt-1"
            onClick={() => setOpen(false)}
          >
            Start your book
          </Link>
        </div>
      )}
    </nav>
  )
}
