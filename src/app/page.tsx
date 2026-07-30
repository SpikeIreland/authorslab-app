// ============================================================================
// AL-UX-006 · Public landing page — The Manuscript Room language
// Mockup: docs/sis/design/2026-07-29-AL-UX-006-landing-mockup.html
// Membership teaser ships WITHOUT figures (Paul, 2026-07-29) — the free
// assessment leads; membership details land with the pricing work.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  title: 'AuthorsLab — every book deserves an editorial team',
  description:
    'AuthorsLab gives your manuscript what publishing houses give theirs: a first read, a line edit, a final polish, a cover, a launch — with named editors who work at your pace.',
}

// ---------------------------------------------------------------------------
// Hero book objects — Carl Lyons's Flame series (Book III title TBC)
// ---------------------------------------------------------------------------

function HeroBook({
  title,
  className,
  cover,
  ruleClass,
}: {
  title: React.ReactNode
  className: string
  cover: string
  ruleClass: string
}) {
  return (
    <div
      className={`absolute rounded-r-lg rounded-l-[4px] flex flex-col justify-center text-center px-5 shadow-[14px_18px_40px_rgba(44,44,42,0.30)] ${cover} ${className}`}
    >
      <span className="absolute left-2 top-0 bottom-0 w-px bg-white/20" aria-hidden />
      <div className="font-serif leading-tight">{title}</div>
      <div className={`h-px mx-auto my-3 ${ruleClass}`} style={{ width: 26 }} aria-hidden />
      <div className="text-[8px] tracking-[0.18em] uppercase opacity-75">Carl Lyons</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Journey personas
// ---------------------------------------------------------------------------

const JOURNEY = [
  {
    initial: 'E',
    name: 'Eden',
    disc: 'bg-sage',
    role: "Meets you first, and matches you with a ghostwriter if you're starting from a blank page",
    phase: 'Begin',
  },
  {
    initial: 'A',
    name: 'Alex',
    disc: 'bg-alex',
    role: 'Reads the whole manuscript; assesses structure, voice and the chapters that carry it',
    phase: 'First read',
  },
  {
    initial: 'S',
    name: 'Sam',
    disc: 'bg-sam',
    role: 'Works the prose with you, chapter by chapter, line by line',
    phase: 'Line edit',
  },
  {
    initial: 'J',
    name: 'Jordan',
    disc: 'bg-jordan',
    role: 'The final pass — consistency, rhythm, and the details readers notice',
    phase: 'Polish',
  },
  {
    initial: 'T·R',
    name: 'Taylor & Riley',
    disc: 'bg-taylor',
    role: 'Cover and interior design, then platforms, metadata and your launch plan',
    phase: 'Design → Launch',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-ivory min-h-screen">
      <MarketingNav active="/" />

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
        <div>
          <p className="kicker text-sage-deep">An editorial house, open to every author</p>
          <h1 className="font-serif text-5xl leading-[1.12] mt-4 mb-5 text-ink">
            Every book deserves an <em className="italic text-sage-deep">editorial team.</em>
          </h1>
          <p className="text-[17px] leading-relaxed text-muted max-w-lg mb-7">
            AuthorsLab gives your manuscript what publishing houses give theirs — a first read,
            a line edit, a final polish, a cover, a launch — with editors who work at your pace
            and leave every decision, and every right, with you.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/signup"
              className="bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
            >
              Start your book →
            </Link>
            <Link
              href="/free-analysis"
              className="border border-line hover:border-faint hover:bg-paper-warm text-ink font-semibold px-5 py-3 rounded-lg text-sm"
            >
              Get a free manuscript assessment
            </Link>
          </div>
          <div className="flex flex-wrap gap-5 text-[13px] text-muted">
            {['A named editor at every stage', 'Your rights, always', 'Work at your pace'].map(t => (
              <span key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" aria-hidden />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Book collage — the Flame series */}
        <div className="relative h-[420px] hidden md:block" aria-hidden>
          <HeroBook
            title={<span className="text-base">The Signal and the Shadow</span>}
            cover="bg-sage-deep text-amber-bg"
            ruleClass="bg-terracotta"
            className="w-[170px] h-[250px] right-[225px] top-[95px] -rotate-[4deg] z-[2]"
          />
          <HeroBook
            title={<span className="text-[21px]">The Veil and<br />the Flame</span>}
            cover="bg-charcoal text-ivory"
            ruleClass="bg-sage"
            className="w-[200px] h-[295px] right-[60px] top-[20px] z-[3]"
          />
          <HeroBook
            title={<span className="text-sm">The Flame Series<br />Book III</span>}
            cover="bg-gradient-to-br from-terracotta to-[#B87C50] text-[#4A1B0C]"
            ruleClass="bg-[#4A1B0C]"
            className="w-[150px] h-[220px] right-0 top-[150px] rotate-[5deg] z-[1]"
          />
        </div>
      </section>

      {/* ================= JOURNEY ================= */}
      <section className="bg-charcoal text-ivory py-18">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="kicker text-sage">The journey</p>
          <h2 className="font-serif text-3xl mt-3 mb-3">Five stages. A named editor at each one.</h2>
          <p className="text-faint text-[15px] leading-relaxed max-w-2xl">
            Not a tool that marks up your file — a team that reads your book, talks it through
            with you, and carries it from draft to launch.
          </p>
          <div className="flex flex-col md:flex-row mt-11 gap-8 md:gap-0">
            {JOURNEY.map((p, i) => (
              <div key={p.name} className="flex-1 relative text-center px-3">
                {i < JOURNEY.length - 1 && (
                  <span
                    className="hidden md:block absolute top-[23px] h-0.5 bg-white/10"
                    style={{ left: 'calc(50% + 26px)', right: 'calc(-50% + 26px)' }}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 w-[46px] h-[46px] rounded-full mx-auto mb-3.5 flex items-center justify-center font-serif text-lg text-white ${p.disc}`}
                >
                  {p.initial}
                </span>
                <div className="text-[15px] font-semibold">{p.name}</div>
                <div className="text-xs text-faint leading-relaxed mt-1">{p.role}</div>
                <div className="text-[10px] tracking-[0.14em] uppercase text-white/30 mt-2">{p.phase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= AUTHOR STUDIO ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-[0.9fr_1.1fr] gap-13 items-center">
        <div>
          <p className="kicker">The Author Studio</p>
          <h2 className="font-serif text-3xl mt-3 mb-3.5 text-ink">Where the work actually happens.</h2>
          <p className="text-muted text-[15px] leading-relaxed mb-4">
            Your book lives in its own room: the manuscript on one side, your editor on the
            other, and the journey — every stage, every deliverable — always in view.
          </p>
          <ul className="flex flex-col gap-3 mt-5">
            {[
              'A real conversation with your editor, grounded in your chapters — not generic notes',
              'Every assessment and edit filed on your shelf as a document you keep',
              "One library for every book you're writing — switch projects, keep every journey",
            ].map(t => (
              <li key={t} className="flex gap-2.5 text-sm text-ink items-start">
                <span className="w-5 h-5 rounded-full bg-sage-bg text-sage-deep text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Product vignette */}
        <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-[0_18px_50px_rgba(44,44,42,0.14)]">
          <div className="bg-charcoal h-8 flex items-center gap-1.5 px-3.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-white/15" aria-hidden />
            ))}
          </div>
          <div className="p-4 grid grid-cols-[90px_1fr] gap-3.5 bg-ivory">
            <div className="w-[90px] h-[132px] bg-charcoal rounded-r-md rounded-l-[3px] text-ivory flex flex-col justify-center text-center p-2.5">
              <span className="font-serif text-[11px] leading-tight">The Veil and the Flame</span>
              <span className="w-4 h-px bg-sage mx-auto mt-2" aria-hidden />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="w-2 h-2 rounded-full bg-sage-deep" aria-hidden />
                <span className="w-2 h-2 rounded-full bg-sage shadow-[0_0_0_3px_#EFF4EE]" aria-hidden />
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-line" aria-hidden />
                ))}
                <span className="text-[10px] text-faint ml-1.5">First read ✓ · Line edit — Chapter 12 of 36</span>
              </div>
              <div className="bg-paper border border-line rounded-lg px-3 py-2.5 flex gap-2.5 items-start">
                <span className="w-6 h-6 rounded-full bg-sam text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  S
                </span>
                <span className="text-[11.5px] leading-relaxed text-muted">
                  <b className="text-ink font-semibold">Sam:</b> Chapter 12 is the strongest thing in the
                  manuscript — I&rsquo;ve marked three places where slowing down would let it land even harder.
                </span>
              </div>
              <div className="bg-paper-warm border border-line rounded-lg px-3 py-2.5">
                <span className="text-[11.5px] text-muted ml-8">
                  <b className="text-ink font-semibold">You:</b> Show me the first one.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MEMBERSHIP (no figures — pending pricing work) ================= */}
      <section className="bg-paper-warm border-y border-line py-19">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="kicker">Membership</p>
            <h2 className="font-serif text-3xl mt-3 mb-2.5 text-ink">
              One membership. Every book you&rsquo;ll ever write.
            </h2>
            <p className="text-muted text-[15px] leading-relaxed">
              Begin with a free manuscript assessment. Then one membership covers your whole
              library — every editor, every stage, as many projects as you&rsquo;re working on.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="bg-paper border border-line rounded-2xl p-7">
              <h3 className="font-serif text-xl text-ink">Free assessment</h3>
              <p className="text-xs text-faint mt-1 mb-4">One manuscript · no card required</p>
              <ul className="flex flex-col gap-2.5 mb-5 text-[13.5px] text-muted">
                {[
                  'Alex reads your full manuscript',
                  'A written developmental assessment, yours to keep',
                  'A recommended path through the stages',
                ].map(t => (
                  <li key={t} className="flex gap-2">
                    <span className="text-sage-deep text-xs mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/free-analysis"
                className="inline-block border border-line hover:border-faint hover:bg-paper-warm text-ink font-semibold px-4 py-2.5 rounded-lg text-sm"
              >
                Get your assessment
              </Link>
            </div>
            <div className="bg-paper border-2 border-sage-deep rounded-2xl p-7 relative shadow-[0_0_0_3px_#EFF4EE]">
              <span className="absolute -top-2.5 left-6 bg-sage-deep text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Membership
              </span>
              <h3 className="font-serif text-xl text-ink">AuthorsLab membership</h3>
              <p className="text-xs text-faint mt-1 mb-4">From £7/mo billed annually · <Link href="/pricing" className="text-sage-deep font-semibold">see plans</Link></p>
              <ul className="flex flex-col gap-2.5 mb-5 text-[13.5px] text-muted">
                {[
                  'Your full editorial team, every stage',
                  'Unlimited projects in your library',
                  'Cover design, publishing prep, launch plan',
                  'Every deliverable filed on your shelf',
                ].map(t => (
                  <li key={t} className="flex gap-2">
                    <span className="text-sage-deep text-xs mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-4 py-2.5 rounded-lg text-sm"
              >
                Start your book →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDING STORY ================= */}
      <section className="max-w-3xl mx-auto px-6 py-19">
        <div className="bg-paper border border-line rounded-2xl px-10 py-10 text-center my-16">
          <p className="kicker mb-4">Why we built this</p>
          <blockquote className="font-serif italic text-xl leading-normal text-ink">
            &ldquo;I&rsquo;d written the book. What I couldn&rsquo;t get — not without thousands of
            pounds and a year of waiting — was someone to read it properly and tell me the truth.
            That&rsquo;s the gap AuthorsLab exists to close.&rdquo;
          </blockquote>
          <div className="mt-5 flex items-center justify-center gap-2.5 text-[13px] text-muted">
            <span className="w-8 h-8 rounded-full bg-sage-deep text-white text-xs font-semibold flex items-center justify-center">
              CL
            </span>
            <span>
              <b className="text-ink">Carl Lyons</b> · Author &amp; AuthorsLab co-founder
            </span>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-charcoal text-center pt-18">
        <div className="max-w-xl mx-auto px-6 pt-16 pb-16">
          <h2 className="font-serif text-4xl text-ivory mb-3.5">Your story deserves to be told well.</h2>
          <p className="text-faint text-[15px] leading-relaxed mb-7">
            Start with the free assessment — Alex will read your manuscript and tell you,
            honestly, where it stands.
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
