// ============================================================================
// AL-UX task #118 · /publishers — publisher threshold page (public)
// Ruling: ux-to-paul+publisher-publisher-footer-link-2026-09-21.md (amended)
// + publisher-to-ux-footer-destination-answer-2026-09-22.md
// SAFE-BY-CONSTRUCTION under the RLS hold (publisher-to-sysadmin+paul-portal-
// is-author-only-rls-2026-09-22.md): the sample-portal CTA renders ONLY when
// PORTAL_HOME_URL is non-null. Target settled by publisher's demo-journey
// spec (publisher-to-paul+sysadmin+ux-demo-journey-spec-2026-09-22.md):
// '/publisher' (publisher home), flipped only when sysadmin's server-route
// fix lands — until then cold visitors would hit author-only RLS dead ends.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'For publishers — AuthorsLab',
  description:
    "The Publisher Portal: a publisher's view of each book in progress — editorial status, cover proposals to approve, publishing-route decisions — by the author's invitation.",
}

// FLIPPED 2026-09-22: guard released by publisher after signed-out production
// verify (publisher-to-sysadmin+paul-list-route-has-no-consumer-2026-09-22.md)
// — detail route scoped + verified, home is mock data. Set back to null only
// with a courier stating why.
const PORTAL_HOME_URL: string | null = '/publisher'

// publishers@authorslab.ai gate CLEARED 2026-09-22: Paul observed a test
// delivery land in the inbox (the gate was an observed delivery, per
// publisher chat's courier — never a DNS record alone).
const PUBLISHER_CONTACT_EMAIL = 'publishers@authorslab.ai'

export default function PublishersPage() {
  return (
    <div className="bg-ivory min-h-screen flex flex-col">
      <MarketingNav />

      <main className="flex-1">
        <section className="max-w-2xl mx-auto px-6 pt-24 pb-20 text-center">
          <p className="kicker text-sage-deep">For publishers</p>
          <h1 className="font-serif text-5xl leading-tight mt-4 mb-6 text-ink">
            Where your authors&rsquo; books take shape.
          </h1>
          <p className="text-muted text-[16px] leading-relaxed mb-4">
            AuthorsLab gives every manuscript an editorial team. The Publisher
            Portal is your side of that work: each book&rsquo;s editorial
            progress with its named editors, cover proposals waiting for your
            approval, and the publishing-route decision — all in one place.
          </p>
          <p className="text-muted text-[15px] leading-relaxed mb-9">
            The portal is invitation-based: your authors bring you into their
            books, so you see the work as it stands rather than waiting for a
            finished file.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {PORTAL_HOME_URL ? (
              <>
                <Link
                  href={PORTAL_HOME_URL}
                  className="bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
                >
                  Enter the portal &rarr;
                </Link>
                <a
                  href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Publisher%20enquiry`}
                  className="border border-line hover:border-faint hover:bg-paper-warm text-ink font-semibold px-5 py-3 rounded-lg text-sm"
                >
                  Talk to us
                </a>
              </>
            ) : (
              <a
                href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Publisher%20enquiry`}
                className="bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
              >
                Talk to us
              </a>
            )}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
