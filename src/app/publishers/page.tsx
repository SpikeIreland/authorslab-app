// ============================================================================
// W1 REWRITE (2026-10-06) · /publishers — the publisher product's public page.
// Owner: `marketing`. Supersedes the Track A continuity-led version.
//
// Governing rulings, in order:
// - RESET 2026-10-06 §4: positioning is "THE EDITORIAL READ, FOR PUBLISHING
//   HOUSES". Continuity falls out of it; it is not the pitch. Supplier, not
//   tool.
// - PRESENT-TENSE RULING 2026-10-06: nothing unbuilt in present tense. The
//   live/in-build split is explicit on the page (the register the series
//   paragraph already used, extended everywhere). Publisher's five findings
//   all addressed, incl. the completed-stage claim corrected (shows person-
//   or-system, not WHO — completed_by_label not backfilled).
// - Station 7 boundary ON the page: we do not typeset, we do not distribute.
// - Personas: Alex/Sam/Jordan nameable (consistent across all titles). NO
//   name for Publishing/Marketing stations until astudio+design settle the
//   split editor_name mapping.
// - Pricing: SHAPE only (platform fee + per-title, no seat counting — Paul
//   ruled 2026-09-25). No figures; numbers are finance's + Paul's. No pilot
//   terms (ratification not confirmed public).
// - BOARD §6.4: no residency claims until the corrected table exists.
// - FOUNDING RULING: no author-product mention/link; own header and footer.
// - CTA (Paul ruled 2026-10-06): styled contact block on the verified
//   publishers@ mailbox; an enquiry form replaces it when I&B owns the
//   record and sysadmin the route. No hollow form ships.
// Done-when: completeness matches the author landing's structure — journey,
// readers, method, figures, pricing shape, FAQ, CTA.
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AuthorsLab for Publishing Houses',
  description:
    'The editorial read, for publishing houses: instrumented full-manuscript analysis your editors review and act on. We do not typeset and we do not distribute — the production files are yours.',
}

const PUBLISHER_CONTACT_EMAIL = 'publishers@authorslab.ai'

const STATIONS = [
  { n: 1, name: 'Manuscript', detail: 'The title enters the line. Ingest is gated: a file that fails validation is refused with a stated reason, never loaded in a degraded state.' },
  { n: 2, name: 'Developmental', detail: 'The full structural read — story, character, pacing — prepared by Alex and reviewed by an editor.' },
  { n: 3, name: 'Line', detail: 'The line-level pass — prose, rhythm, clarity — prepared by Sam.' },
  { n: 4, name: 'Copy', detail: 'The copy-edit pass — consistency, usage, mechanics — prepared by Jordan.' },
  { n: 5, name: 'Publishing', detail: 'Cover and interior move through approval. The house holds the gate.' },
  { n: 6, name: 'Marketing', detail: 'Launch materials are prepared for the house to approve.' },
  { n: 7, name: 'Handoff', detail: 'Our stations complete. The finished manuscript and every production file pass to the house.' },
]

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
    body: 'No approximation, and no degraded result presented as complete. A completed stage shows whether it was completed by a person or by the system — and an absent value is shown as absent, never as a plausible default.',
  },
]

const FAQS = [
  {
    q: 'Who uses it?',
    a: "The house's editorial staff. Pricing never counts seats, so who you bring in is your decision, not a billing event. The house workspace — organisation, imprints, staff roles — is in build now; while it is, access is set up with you directly.",
  },
  {
    q: 'What should we test first?',
    a: 'The manuscript itself. Send one full manuscript through the read and judge the editorial report, the chapter summaries and the key points against what your own editors would have produced. That is the core of the product and it is live today.',
  },
  {
    q: 'How does it fit our editorial process?',
    a: 'As a hybrid workflow. The system prepares the read; your editor reviews it, interrogates it, and decides what reaches the author. The system holds no opinion an editor has not approved. The editor’s workbench inside the publisher workspace — where notes are agreed and packaged for the author as a document from a named person — is in build; the read it works on is live.',
  },
  {
    q: 'Can it hold a series?',
    a: 'In build, honestly labelled: every read already produces chapter summaries and key points — the compressed form designed to be carried forward — and a series relationship that carries them into the next book’s read is being built now. We would rather tell you it is coming than imply it is here.',
  },
]

export default function PublishersPage() {
  return (
    <div className="bg-ivory min-h-screen flex flex-col">
      {/* Own header — no shared marketing nav (two products, one brand) */}
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <span className="font-serif text-xl text-ink">AuthorsLab</span>
          <span className="kicker text-sage-deep">For publishing houses</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
          <p className="kicker text-sage-deep">For publishing houses</p>
          <h1 className="font-serif text-5xl leading-tight mt-4 mb-6 text-ink">
            The editorial read, done properly, for houses.
          </h1>
          <p className="text-muted text-[17px] leading-relaxed mb-4">
            A full-manuscript editorial analysis your editors review and act on:
            structural, line and copy reads prepared in about half an hour, instrumented
            end to end, with every claim the system makes backed by a record. Your
            editors keep the judgement; the system does the reading and shows its
            working.
          </p>
          <p className="text-ink text-[16px] leading-relaxed font-semibold mb-9">
            We do not typeset and we do not distribute. The finished manuscript and
            every production file pass to the house — the line ends where yours begins.
          </p>
          <a
            href="#contact"
            className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
          >
            Put a manuscript through it
          </a>
        </section>

        {/* How it works — the line */}
        <section className="bg-paper border-y border-line">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <h2 className="font-serif text-3xl text-ink mb-3">How it works</h2>
            <p className="text-muted text-[16px] leading-relaxed mb-8">
              A title moves through seven stations — five working phases between two
              boundaries. Each editorial read runs five analyses in parallel against the
              complete manuscript — structural, character, plot, pacing, thematic —
              followed by a single synthesis pass, and produces three artefacts: a full
              editorial report, chapter summaries, and key points.
            </p>
            <ol className="space-y-4">
              {STATIONS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-sage-bg text-sage-deep font-semibold text-sm flex items-center justify-center">{s.n}</span>
                  <div>
                    <p className="text-ink font-semibold text-[15px]">{s.name}</p>
                    <p className="text-muted text-[14px] leading-relaxed">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-ink text-[15px] leading-relaxed mt-8 font-semibold">
              Station seven is a boundary we claim on purpose: composition and
              distribution are the house&rsquo;s, and the files we hand off are built to
              enter your pipeline, not to replace it.
            </p>
          </div>
        </section>

        {/* Who does the reading */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="font-serif text-3xl text-ink mb-3">Who does the reading</h2>
          <p className="text-muted text-[16px] leading-relaxed mb-6">
            Three editorial readers, one per discipline, consistent across every title
            on the platform:
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-paper border border-line rounded-lg p-5">
              <h3 className="text-ink font-semibold text-[15px] mb-1">Alex — developmental</h3>
              <p className="text-muted text-[14px] leading-relaxed">Structure, story and character: the whole-book read that answers whether the manuscript works.</p>
            </div>
            <div className="bg-paper border border-line rounded-lg p-5">
              <h3 className="text-ink font-semibold text-[15px] mb-1">Sam — line</h3>
              <p className="text-muted text-[14px] leading-relaxed">Prose at the sentence level: rhythm, clarity, voice — preserved, not overwritten.</p>
            </div>
            <div className="bg-paper border border-line rounded-lg p-5">
              <h3 className="text-ink font-semibold text-[15px] mb-1">Jordan — copy</h3>
              <p className="text-muted text-[14px] leading-relaxed">Consistency, usage and mechanics, with every flag citing the place it was found.</p>
            </div>
          </div>
          <p className="text-muted text-[15px] leading-relaxed mt-6">
            Each prepares; none decides. An editor at the house reviews every read, and
            the system holds no opinion an editor has not approved.
          </p>
        </section>

        {/* Live today / in build — the register, made structural */}
        <section className="bg-paper border-y border-line">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <h2 className="font-serif text-3xl text-ink mb-3">What is live, and what is in build</h2>
            <p className="text-muted text-[15px] leading-relaxed mb-8">
              Where a feature is unfinished, we say so rather than imply that it is.
              This section exists so you never have to guess which sentence is which.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="kicker text-sage-deep mb-3">Live today</h3>
                <ul className="space-y-2 text-[14px] text-muted leading-relaxed list-disc pl-4">
                  <li>The full-manuscript editorial read: five analyses plus synthesis, with the report, chapter summaries and key points it produces</li>
                  <li>Gated ingest that refuses a broken file with a stated reason</li>
                  <li>The instrumentation in the method section below — every call recorded, every output independently checked</li>
                </ul>
              </div>
              <div>
                <h3 className="kicker text-terracotta mb-3">In build now</h3>
                <ul className="space-y-2 text-[14px] text-muted leading-relaxed list-disc pl-4">
                  <li>The house workspace: your organisation and imprints, your staff and roles, your list ingested and worked inside the system</li>
                  <li>The editor&rsquo;s workbench: reviewing the read in conversation, agreeing notes, and packaging them for the author as a document sent by a named person</li>
                  <li>Series memory: each book&rsquo;s summaries and key points carried into the next book&rsquo;s read</li>
                </ul>
              </div>
            </div>
            <p className="text-faint text-[13px] leading-relaxed mt-6">
              When an item moves from the right column to the left, this page changes
              the same day — tense is a claim here, and we treat it like one.
            </p>
          </div>
        </section>

        {/* The method */}
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

        {/* Pricing shape */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <h2 className="font-serif text-3xl text-ink mb-3">How it is priced</h2>
          <p className="text-muted text-[16px] leading-relaxed mb-4">
            A platform fee for the house, and a per-title fee for each book that goes
            through the line. That is the whole shape: you pay for the instrument and
            for books reaching market, which is the thing you actually want more of.
          </p>
          <p className="text-muted text-[16px] leading-relaxed">
            <span className="text-ink font-semibold">We never count seats.</span> A
            three-person imprint with large ambitions should not pay more for growing
            its team. Numbers are sized with you against your list — write to us and we
            will put them in front of you rather than behind a form.
          </p>
        </section>

        {/* FAQ */}
        <section className="bg-paper border-y border-line">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <h2 className="font-serif text-3xl text-ink mb-3">Questions publishers ask us</h2>
            <p className="text-muted text-[15px] leading-relaxed mb-8">
              These four are verbatim the first questions our first publishing house
              asked. The answers are the honest ones, in the same register as the rest
              of this page.
            </p>
            <div className="space-y-6">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-ink font-semibold text-[16px] mb-1">{f.q}</h3>
                  <p className="text-muted text-[15px] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-ink mb-4">
            Put a manuscript through it
          </h2>
          <p className="text-muted text-[16px] leading-relaxed mb-8 max-w-xl mx-auto">
            The fastest way to judge us is the product&rsquo;s own: send one manuscript
            through the read and compare the result with your editors&rsquo; view of the
            same book. Write to us — a person answers, same working day — and we will
            also send the technical specification: what the system does, how it is
            built, and what it does not yet have. A specification that contains only
            good news is a brochure.
          </p>
          <a
            href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Put%20a%20manuscript%20through%20it`}
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
