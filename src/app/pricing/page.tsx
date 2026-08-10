// ============================================================================
// AL-UX-006 · Pricing page — per AL-PC-DR-001 (Pricing Decision Record V1)
// PD-1: Starter £10 / Author £19 / Pro £39 monthly; annual effective £7/£13/£27
// PD-2: annual price is the headline everywhere — never a bare monthly price
// PD-3: allowances 1 / 4 / 10 deep passes per month (provisional numbers)
// PD-4 SUPERSEDED 2026-08-10 (AL-MKT-008): the £119 one-time pass is REMOVED.
//        Membership only. Human-services anchor softened per AL-MKT-007 §4.
// SEQUENCING (PD-5): do not deploy before the Founding Author announcement.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'Pricing — AuthorsLab',
  description:
    'One membership covers every book you write. The editing studio today — first read, line edit, polish — with new stages joining as they release. From £7/mo billed annually.',
}

const TIERS = [
  {
    name: 'Starter',
    annual: '£7',
    monthly: '£10',
    blurb: 'For one book, moving at its own pace.',
    passes: '1 full-manuscript editorial pass each month',
    featured: false,
    features: [
      'The editing studio: Alex, Sam and Jordan',
      'One active project in your library',
      'Every assessment and edit filed on your shelf',
    ],
  },
  {
    name: 'Author',
    annual: '£13',
    monthly: '£19',
    blurb: 'For the writer with more than one book in them.',
    passes: '4 full-manuscript editorial passes each month',
    featured: true,
    features: [
      'Everything in Starter',
      'Unlimited projects in your library',
      'New stages join as they release — your price never changes',
    ],
  },
  {
    name: 'Pro',
    annual: '£27',
    monthly: '£39',
    blurb: 'For working authors and heavy revisers.',
    passes: '10 full-manuscript editorial passes each month',
    featured: false,
    features: [
      'Everything in Author',
      'Capacity for serious revision cycles',
      'First access to new stages and tools',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <MarketingNav active="/pricing" />

      {/* ================= HERO ================= */}
      <section className="max-w-3xl mx-auto px-6 pt-18 pb-10 text-center">
        <p className="kicker text-sage-deep mt-16">Membership</p>
        <h1 className="font-serif text-5xl leading-tight mt-4 mb-4 text-ink">
          One membership. Every book you&rsquo;ll ever write.
        </h1>
        <p className="text-muted text-[16px] leading-relaxed max-w-xl mx-auto">
          Begin with a free manuscript assessment. Then choose the pace that fits — every tier
          includes the editing studio: Alex&rsquo;s first read, Sam&rsquo;s line edit and
          Jordan&rsquo;s polish, with new stages joining your membership as they release.
        </p>
      </section>

      {/* ================= TIERS ================= */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {TIERS.map(t => (
            <div
              key={t.name}
              className={
                t.featured
                  ? 'bg-paper border-2 border-sage-deep rounded-2xl p-7 relative shadow-[0_0_0_3px_#EFF4EE] flex flex-col'
                  : 'bg-paper border border-line rounded-2xl p-7 flex flex-col'
              }
            >
              {t.featured && (
                <span className="absolute -top-2.5 left-6 bg-sage-deep text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Most writers
                </span>
              )}
              <h2 className="font-serif text-xl text-ink">{t.name}</h2>
              <p className="text-[13px] text-muted mt-1">{t.blurb}</p>

              {/* PD-2: annual headline, monthly subline — never a bare monthly price */}
              <div className="mt-5 mb-1">
                <span className="font-serif text-4xl text-ink">{t.annual}</span>
                <span className="text-sm text-muted">/mo billed annually</span>
              </div>
              <p className="text-xs text-faint mb-5">{t.monthly} billed monthly</p>

              <p className="text-[13px] font-semibold text-ink mb-3">{t.passes}</p>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-muted mb-6">
                {t.features.map(f => (
                  <li key={f} className="flex gap-2">
                    <span className="text-sage-deep text-xs mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Link
                  href="/signup"
                  className={
                    t.featured
                      ? 'block text-center bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-4 py-2.5 rounded-lg text-sm'
                      : 'block text-center border border-line hover:border-faint hover:bg-paper-warm text-ink font-semibold px-4 py-2.5 rounded-lg text-sm'
                  }
                >
                  Start with {t.name} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FREE + ONE-TIME PASS ================= */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-paper border border-line rounded-2xl p-7">
            <p className="kicker mb-2">Before anything</p>
            <h3 className="font-serif text-xl text-ink">Free manuscript assessment</h3>
            <p className="text-[14px] text-muted leading-relaxed mt-2 mb-5">
              Alex reads your full manuscript and writes a developmental assessment — structure,
              voice, and the chapters that carry the book. Yours to keep, no card required.
            </p>
            <Link
              href="/free-analysis"
              className="inline-block border border-line hover:border-faint hover:bg-paper-warm text-ink font-semibold px-4 py-2.5 rounded-lg text-sm"
            >
              Get your assessment
            </Link>
          </div>

          <div className="bg-paper border border-line rounded-2xl p-7">
            <p className="kicker mb-2">The road ahead</p>
            <h3 className="font-serif text-xl text-ink">New stages, coming soon</h3>
            <p className="text-[14px] text-muted leading-relaxed mt-2 mb-5">
              Design with Taylor, Publishing with Morgan, Marketing with Riley — and Wright,
              for books that begin from a blank page. Each releases in its own time and joins
              your membership when it does, without your price changing.
            </p>
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-sage-deep bg-sage-bg px-2.5 py-1 rounded-full">
              Coming soon
            </span>
          </div>
        </div>
      </section>

      {/* ================= VALUE ANCHOR (PD-4: retained) ================= */}
      <section className="bg-paper-warm border-y border-line">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <h2 className="font-serif text-2xl text-ink mb-3">What this replaces</h2>
          <p className="text-muted text-[15px] leading-relaxed">
            Assembling the same editorial team from human professionals — a developmental
            editor, a line editor, a copy editor — typically costs thousands of pounds per
            book and takes months of scheduling. AuthorsLab puts your editors on call, for
            every book in your library, at a fraction of the cost of a single human edit.
          </p>
        </div>
      </section>

      {/* ================= PRICING QUESTIONS ================= */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="font-serif text-2xl text-ink text-center mb-8">Pricing questions</h2>
        <div className="flex flex-col gap-4">
          {[
            {
              q: 'What counts as an editorial pass?',
              a: 'A full deep read of your manuscript by one of your editors — Alex’s assessment, a chapter-by-chapter line pass with Sam, Jordan’s polish. Conversation with your editors is always unlimited; passes meter the heavy reading work.',
            },
            {
              q: 'Can I cancel or change tier?',
              a: 'Any time. Changes take effect at the end of your billing period, and your library and every document on your shelf stay yours.',
            },
            {
              q: 'Do I keep the rights to my book?',
              a: 'Always. Every right, every royalty, on every tier — including the free assessment.',
            },
            {
              q: 'What happened to the one-time packages?',
              a: 'They’ve been retired in favour of simple memberships. Beta users can complete the manuscript they’re working on in the editing studio; ongoing use beyond that is by membership.',
            },
          ].map(item => (
            <div key={item.q} className="bg-paper border border-line rounded-xl px-6 py-5">
              <h3 className="text-[15px] font-semibold text-ink mb-1.5">{item.q}</h3>
              <p className="text-[13.5px] text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[13px] text-muted mt-6">
          More questions? <Link href="/faq" className="text-sage-deep font-semibold">Read the full FAQ →</Link>
        </p>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-charcoal text-center">
        <div className="max-w-xl mx-auto px-6 pt-16 pb-16">
          <h2 className="font-serif text-3xl text-ivory mb-3">Start where every book starts.</h2>
          <p className="text-faint text-[15px] leading-relaxed mb-7">
            The free assessment costs nothing and tells you the truth about your manuscript.
          </p>
          <Link
            href="/free-analysis"
            className="inline-block bg-sage hover:bg-sage/90 text-charcoal font-semibold px-6 py-3 rounded-lg text-sm"
          >
            Get your free assessment →
          </Link>
        </div>
        <MarketingFooter />
      </section>
    </div>
  )
}
