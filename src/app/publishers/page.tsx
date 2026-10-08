import Link from 'next/link'
import { PUBLISHER_PAGES } from './_content'
import { ContactBlock } from './_components/ContactBlock'

// ============================================================================
// /publishers — THE HUB.
//
// Was a single 365-line page carrying nine sections. Split 2026-10-08 on
// Paul's premise: "people don't scroll down - they click on pages. Therefore,
// I would prefer to see these sections as headers with dedicated pages rather
// than one long list of things jammed onto one page."
//
// So this page keeps exactly three things and sends the reader onward:
//   1. The positioning, in the hero.
//   2. The live / in-build register, which is a TRUST DEVICE and belongs where
//      everyone lands rather than on a page a reader might not click.
//   3. The nine doors.
//
// Every W1 ruling still governs the content, and the content itself was moved
// programmatically rather than retyped (see _content.ts):
// - RESET §4: positioning is "the editorial read, for publishing houses".
//   Continuity falls out of it; it is not the pitch. Supplier, not tool.
// - PRESENT-TENSE RULING: nothing unbuilt in the present tense. The live /
//   in-build split is structural, not a caveat.
// - Station 7 boundary on the page: we do not typeset, we do not distribute.
// - Personas: Alex/Sam/Jordan nameable. No name for Publishing/Marketing.
// - Pricing: SHAPE only, no figures.
// - FOUNDING RULING: no author-product mention or link.
// ============================================================================

export default function PublishersHubPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14">
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
        <p className="text-ink text-[16px] leading-relaxed font-semibold">
          We do not typeset and we do not distribute. The finished manuscript and
          every production file pass to the house &mdash; the line ends where yours
          begins.
        </p>
      </section>

      {/* The nine doors */}
      <section className="bg-paper border-y border-line">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="font-serif text-3xl text-ink mb-3">What you want to know</h2>
          <p className="text-muted text-[15px] leading-relaxed mb-8 max-w-2xl">
            Nine pages rather than one long one. Each answers a single question and
            ends with a way to reach a person.
          </p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PUBLISHER_PAGES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group block h-full bg-ivory border border-line rounded-lg p-5 hover:border-sage-deep transition-colors"
                >
                  <p className="text-ink font-semibold text-[15px] mb-1 group-hover:text-sage-deep transition-colors">
                    {p.label}
                  </p>
                  <p className="text-muted text-[13.5px] leading-relaxed">{p.blurb}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Live today / in build — the register, kept on the hub deliberately */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h2 className="font-serif text-3xl text-ink mb-3">What is live, and what is in build</h2>
        <p className="text-muted text-[15px] leading-relaxed mb-8">
          Where a feature is unfinished, we say so rather than imply that it is. This
          section is on the first page you land on, not filed behind a link, so you
          never have to guess which sentence is which.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="kicker text-sage-deep mb-3">Live today</h3>
            <ul className="space-y-2 text-[14px] text-muted leading-relaxed list-disc pl-4">
              <li>The full-manuscript editorial read: five analyses plus synthesis, with the report, chapter summaries and key points it produces</li>
              <li>Gated ingest that refuses a broken file with a stated reason</li>
              <li>The instrumentation on <Link href="/publishers/the-method" className="text-sage-deep hover:underline">the method</Link> page &mdash; every call recorded, every output independently checked</li>
            </ul>
          </div>
          <div>
            <h3 className="kicker text-terracotta mb-3">In build now</h3>
            <ul className="space-y-2 text-[14px] text-muted leading-relaxed list-disc pl-4">
              <li>The house workspace: your organisation and imprints, your staff and roles, your list ingested and worked inside the system</li>
              <li>The editor&rsquo;s workbench: reviewing the read in conversation, agreeing notes, and packaging them for the author as a document sent by a named person</li>
              <li><Link href="/publishers/series" className="text-sage-deep hover:underline">Series memory</Link>: each book&rsquo;s summaries and key points carried into the next book&rsquo;s read</li>
            </ul>
          </div>
        </div>
        <p className="text-faint text-[13px] leading-relaxed mt-6">
          When an item moves from the right column to the left, this page changes the
          same day &mdash; tense is a claim here, and we treat it like one.
        </p>
      </section>

      <ContactBlock />
    </main>
  )
}
