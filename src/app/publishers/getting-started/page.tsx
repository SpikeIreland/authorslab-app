import Link from 'next/link'
import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'Getting started — AuthorsLab for Publishing Houses' }

/**
 * NEW PAGE, 2026-10-08.
 *
 * ─── Why it did not exist, and why it should ────────────────────────────────
 * Nothing on the site answered "what does Monday look like". The FAQ said the
 * house workspace is in build and access is set up directly — which is the
 * honest state, and burying it in a FAQ answer made it read like a caveat
 * instead of a process.
 *
 * PRESENT-TENSE RULING: the hand-set access step is stated as the current
 * reality rather than apologised for. It is how a small supplier onboards its
 * first houses, and saying so plainly is more credible than implying a
 * self-service flow that does not exist.
 */
export default function GettingStartedPage() {
  return (
    <PageFrame
      kicker="Getting started"
      title="One manuscript, not a meeting."
      standfirst="The fastest way to judge an editorial read is to read one about a book you already have an opinion on."
    >
      <Block heading="Pick a book you know">
        <p>
          Ideally one your editors have already read and formed a view on, and
          preferably one where that view was contested. A read you can only
          agree with tells you nothing about the instrument.
        </p>
        <p>
          Anywhere in the 30,000&ndash;90,000-word range sits inside our measured
          band. Outside it we still read, and the figures are labelled as
          extrapolated.
        </p>
      </Block>

      <Block heading="We set your access up with you">
        <p>
          Your organisation, your imprints and your staff&rsquo;s seats are configured
          directly with us. <span className="text-ink font-semibold">The
          self-service house workspace is in build</span> &mdash; while it is, this
          step is a conversation and a short setup rather than a signup form.
        </p>
        <p>
          It is also the step at which we would rather be slow. A seat decides what a
          person at your house can see, and{' '}
          <Link href="/publishers/security" className="text-sage-deep hover:underline">
            we would rather set that up with you than guess at it
          </Link>.
        </p>
      </Block>

      <Block heading="The read">
        <p>
          About half an hour for a full novel, and it does not depend on anyone
          keeping a browser open &mdash; the job exists server-side and your editor is
          notified when it completes. What comes back is described on{' '}
          <Link href="/publishers/what-you-get" className="text-sage-deep hover:underline">
            what you get
          </Link>.
        </p>
      </Block>

      <Block heading="Then the part that matters">
        <p>
          Put the report beside your own editor&rsquo;s view of the same book and find
          where they disagree. Then ask us why &mdash; every claim in a read is tied
          to a recorded call against a passage, so &ldquo;why did it say that&rdquo; is
          a question with an answer.
        </p>
        <p className="text-ink font-semibold">
          A supplier who cannot tell you why their output said what it said is asking
          you to trust them. We would rather be checked.
        </p>
      </Block>

      <Block heading="What we need from you">
        <ul className="space-y-2 list-disc pl-5">
          <li>One manuscript file. Ingest is gated: a file that fails validation is refused with a stated reason rather than loaded in a degraded state.</li>
          <li>The names and email addresses of the people at your house who should hold seats.</li>
          <li>Your imprint structure, if the house has more than one &mdash; it is what seats are scoped to.</li>
        </ul>
      </Block>
    </PageFrame>
  )
}
