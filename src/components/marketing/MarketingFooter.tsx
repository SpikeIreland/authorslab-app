// ============================================================================
// AL-UX-006 · Shared marketing footer
// The public site previously had no footer at all. Charcoal band with the
// essential links. Legal links now point at the live /privacy, /terms,
// /cookies, /subprocessors, /dpa routes (previously mailto placeholders).
// ============================================================================

import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer className="bg-charcoal text-faint">
      <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t border-white/10">
        <span>© 2026 AuthorsLab · a Spike Island Studios company</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
          <Link href="/how-it-works" className="hover:text-ivory">How it works</Link>
          <Link href="/pricing" className="hover:text-ivory">Pricing</Link>
          <Link href="/faq" className="hover:text-ivory">FAQ</Link>
          <a href="mailto:support@authorslab.ai" className="hover:text-ivory">Contact</a>
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
