/**
 * /checkout/success — Stripe post-checkout landing.
 *
 * Stripe redirects here with `?session_id=cs_...` after a successful
 * Checkout Session. The subscription row is created asynchronously by the
 * webhook handler (`/api/webhooks/stripe`) — there's an inherent race
 * between "the redirect lands" and "the webhook fires + row is written".
 * We don't need to gate on that here: the page is a confirmation surface,
 * not a state read. The Library will show the active tier once webhook
 * has done its work (usually within a couple of seconds).
 *
 * The webhook fires the `subscription_started` analytics event server-
 * side, so this page doesn't need to emit anything.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: "You're in — AuthorsLab",
  description: 'Your AuthorsLab subscription is active. Head to your Library to begin.',
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-ivory)' }}>
      <MarketingNav />

      <div className="container mx-auto px-6 py-24">
        <div className="max-w-2xl mx-auto text-center">

          {/* Sage-deep check chip — matches the state grammar "complete" mark */}
          <div className="inline-flex items-center justify-center mb-8">
            <span
              className="inline-flex items-center justify-center rounded-full text-[16px] font-bold"
              style={{
                width: 44,
                height: 44,
                background: 'var(--color-sage-bg)',
                color: 'var(--color-sage-deep)',
              }}
              aria-hidden="true"
            >
              ✓
            </span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.14em] mb-4" style={{ color: 'var(--color-muted)' }}>
            You&apos;re in
          </p>
          <h1
            className="text-4xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
          >
            Welcome to AuthorsLab
          </h1>
          <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--color-ink)' }}>
            Your subscription is active. A receipt is on its way to your inbox.
          </p>
          <p className="text-[13px] leading-relaxed mb-10" style={{ color: 'var(--color-muted)' }}>
            If your plan doesn&apos;t appear on your dashboard right away, refresh in a moment —
            we&apos;re just finishing setup.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/lobby"
              className="inline-flex items-center px-6 py-3 rounded-md text-[14px] font-medium transition-colors"
              style={{ background: 'var(--color-sage-deep)', color: 'var(--color-paper)' }}
            >
              Go to your Library →
            </Link>
            <Link
              href="/how-it-works"
              className="text-[14px] font-medium transition-colors"
              style={{ color: 'var(--color-sage-deep)' }}
            >
              How it works
            </Link>
          </div>

        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
