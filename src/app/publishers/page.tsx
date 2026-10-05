// ============================================================================
// TRACK A (demo build plan 2026-10-05) · /publishers — the publisher
// product's public page. Owner: `marketing`. Replaces the portal-era
// threshold page (AL-UX task #118), which predated the founding ruling.
//
// Binding constraints, in order of authority:
// - FOUNDING RULING 2026-10-02: two products, one brand. This page must not
//   mention, describe, or link to the author product. No shared nav/footer
//   with author surfaces (structural separation — build constraint, ruled by
//   marketing-hub 2026-10-01 §3.3). The author landing MAY link here (A5);
//   never the reverse.
// - VERB TEST (publisher-facing register): the system prepares, checks,
//   records, surfaces, hands off. It never writes, edits, designs, publishes
//   or decides.
// - A4: carry the method, not the adjectives. All figures below are measured
//   (System Specification V1.0 §3), not modelled. Present tense only for what
//   is live; the series mechanism is labelled in build (Track E).
// - A3: lead with the series/continuity argument — the value is not the
//   reading, it is the remembering.
// Done-when: a stranger can tell within ten seconds this is for publishing
// houses, not for them.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AuthorsLab for Publishing Houses',
  description:
    "A working environment for a publishing house's editorial department: instrumented manuscript analysis an editor reviews, approves and sends on — and an editorial memory that stays when people move on.",
}

const PUBLISHER_CONTACT_EMAIL = 'publishers@authorslab.ai'

const METHOD_PROPERTIES = [
  {
    title: 'Every model call is a job with a record.',
    body: 'Registered before it starts, carries a timeout, ends in an explicit terminal state — ready, failed or timed out. A run that never finishes is detected and recorded rather than quietly disappearing.',
  },
  {
    title: 'One door to the model.',
    body: 'All model access passes through a single component that records model, token counts and cost per call. There is no second path and no ad-hoc call anywhere in the system.',
  },
  {
    title: 'Every output is checked by something that did not produce it.',
    body: 'An independent layer re-derives what the output should contain from the source material and compares. It never asks the component that did the work whether the work was done.',
  },
  {
    title: 'When we cannot do something properly, we refuse.',
    body: 'No approximation, and no degraded result presented as complete. A file that fails validation is refused with a stated reason. Where a feature is unfinished, the page says so rather than offering a control that appears to work.',
  },
]

export default function PublishersPage() {
  return (
    <div className="bg-ivory min-h-screen flex flex-col">
      {/* Own header — deliberately no shared marketing nav (two products, one brand) */}
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <span className="font-serif text-xl text-ink">AuthorsLab</span>
          <span className="kicker text-sage-deep">For publishing houses</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero — the ten-second test lives here */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
          <p className="kicker text-sage-deep">An editorial working environment for publishing houses</p>
          <h1 className="font-serif text-5xl leading-tight mt-4 mb-6 text-ink">
            Continuity knowledge lives in a person. People move on.
          </h1>
          <p className="text-muted text-[17px] leading-relaxed mb-4">
            When an editor leaves mid-series, the next one rebuilds their context from
            nothing — or doesn&rsquo;t, and the series acquires contradictions nobody
            intended. An author never has that problem. Only a house does, because a
            house is made of people who move on.
          </p>
          <p className="text-ink text-[17px] leading-relaxed font-semibold mb-9">
            The value is not the reading. It is the remembering.
          </p>
          <a
            href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Publisher%20enquiry`}
            className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
          >
            Talk to us
          </a>
        </section>

        {/* What it is */}
        <section className="bg-paper border-y border-line">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <h2 className="font-serif text-3xl text-ink mb-5">What AuthorsLab is</h2>
            <p className="text-muted text-[16px] leading-relaxed mb-4">
              A working environment for a publishing house&rsquo;s editorial department.
              The house ingests the titles on its list; its editors work on them inside
              the system; the system prepares editorial analysis that a named person at
              the house reviews, approves and sends on. The house owns the copy.
            </p>
            <p className="text-muted text-[16px] leading-relaxed mb-4">
              Every full manuscript read runs five analyses in parallel — structural,
              character, plot, pacing, thematic — followed by a single synthesis pass.
              Each read produces three artefacts: a full editorial report, chapter
              summaries, and key points — the compressed form, designed to be carried
              forward. An editor can interrogate the analysis in conversation, scoped to
              that manuscript.
            </p>
            <p className="text-muted text-[16px] leading-relaxed">
              Human judgement stays with your team. The system holds no opinion an
              editor has not approved, and editorial output leaves as a document — a
              package sent by a named person at the house. A completed stage shows who
              completed it, and whether that was a person or the system. An absent
              value is shown as absent, never as a plausible default.
            </p>
            <p className="text-faint text-[14px] leading-relaxed mt-5">
              In build now: a series relationship that carries each book&rsquo;s
              summaries and key points into the next book&rsquo;s read, so the context
              the last editor held is on file rather than in a leaving card. We say so
              here because it is not finished — when it is, this sentence will change
              tense.
            </p>
          </div>
        </section>

        {/* The method — A4 */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="font-serif text-3xl text-ink mb-3">The method</h2>
          <p className="text-muted text-[16px] leading-relaxed mb-8">
            A language model is an unreliable industrial component. Most tools call a
            model and display the answer. We treat a model call the way a factory
            treats a machine on a line. Four properties, all live today:
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {METHOD_PROPERTIES.map((p) => (
              <div key={p.title} className="bg-paper border border-line rounded-lg p-5">
                <h3 className="text-ink font-semibold text-[15px] mb-2">{p.title}</h3>
                <p className="text-muted text-[14px] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Measured figures */}
        <section className="bg-charcoal">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <h2 className="font-serif text-3xl text-ivory mb-3">Measured, not modelled</h2>
            <p className="text-faint text-[15px] leading-relaxed mb-8">
              Figures from real manuscript reads in production, October 2026. Outside
              the 30,000&ndash;90,000-word range, figures are extrapolated and labelled
              as such in the interface.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="font-serif text-3xl text-ivory">31m&thinsp;44s</p>
                <p className="text-faint text-[13px] mt-1">47,000-word read</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ivory">32m&thinsp;55s</p>
                <p className="text-faint text-[13px] mt-1">64,000-word read</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ivory">6</p>
                <p className="text-faint text-[13px] mt-1">model calls per read, each recorded</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-ivory">82</p>
                <p className="text-faint text-[13px] mt-1">chapters, longest run</p>
              </div>
            </div>
            <p className="text-faint text-[14px] leading-relaxed mt-8">
              Turnaround is close to flat with manuscript length — a 36% larger book
              took 4% longer, because the five analyses run concurrently and wall-clock
              time is dominated by model latency, not word count. A read does not
              depend on anyone&rsquo;s browser: the job record exists server-side and
              the editor is notified on completion.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-ink mb-4">
            We would rather show you than tell you
          </h2>
          <p className="text-muted text-[16px] leading-relaxed mb-8 max-w-xl mx-auto">
            A specification that contains only good news is a brochure. Write to us and
            we will send the technical specification — what the system does, how it is
            built, where data rests, and what it does not yet have.
          </p>
          <a
            href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Publisher%20enquiry`}
            className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
          >
            {PUBLISHER_CONTACT_EMAIL}
          </a>
        </section>
      </main>

      {/* Own footer — company and legal only; no author-product links */}
      <footer className="bg-charcoal text-faint">
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
    </div>
  )
}
