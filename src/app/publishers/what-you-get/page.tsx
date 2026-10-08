import Link from 'next/link'
import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'What you get — AuthorsLab for Publishing Houses' }

/**
 * NEW PAGE, 2026-10-08.
 *
 * ─── Why it did not exist, and why it should ────────────────────────────────
 * The single page described a CAPABILITY end to end and never once said what
 * lands on an editor's desk. A house buying an editorial read is buying
 * documents, and nothing on the site named them.
 *
 * ─── Why there are no per-title counts here ─────────────────────────────────
 * The obvious move was a figure block from the one title we have audited in
 * depth. Two reasons it is not here, and both are the same reason:
 *
 * 1. That title has 37 chapters and 32 chapter summaries — five were written as
 *    EMPTY STRINGS and are being regenerated. "32 of 37" on a public page
 *    advertises the gap; "37 chapter summaries" would be false. Neither is
 *    publishable, so the pair stays off.
 * 2. Its issue count is a figure I have mislabelled once before in this
 *    project. A number whose noun I got wrong once does not go on a marketing
 *    page on the strength of the second attempt.
 *
 * Production timings and call counts live on /publishers/the-method, where they
 * were measured and ratified in W1. This page says what the artefacts ARE.
 */
export default function WhatYouGetPage() {
  return (
    <PageFrame
      kicker="What you get"
      title="Four artefacts, and what each is for."
      standfirst="A read is not a verdict in a chat window. It produces documents, and the documents are the product."
    >
      <Block heading="The editorial report">
        <p>
          The whole-book read: structure, story, character, pacing and theme, written
          as continuous prose rather than a scorecard. It is long &mdash; tens of
          thousands of characters for a full novel &mdash; because it is written to be
          read by an editor, not skimmed by a dashboard.
        </p>
        <p>
          <span className="text-ink font-semibold">Who uses it:</span> the
          commissioning or developmental editor, as the first full opinion on a
          manuscript, before any of their own time goes into it.
        </p>
      </Block>

      <Block heading="Chapter summaries">
        <p>
          One per chapter, compressed deliberately: what happens, what changes, what
          is set up and what is paid off. They are the artefact that makes a book
          navigable to someone who has not read it yet.
        </p>
        <p>
          <span className="text-ink font-semibold">Who uses it:</span> everyone who
          needs to talk about the book without having read it &mdash; rights, sales,
          marketing copy, a second reader coming in cold. They are also the form the{' '}
          <Link href="/publishers/series" className="text-sage-deep hover:underline">
            series feature
          </Link>{' '}
          carries into the next book&rsquo;s read.
        </p>
      </Block>

      <Block heading="Key points">
        <p>
          The compressed claims the read is built on, each tied to the place in the
          manuscript it came from. This is the artefact that makes the report
          arguable: an editor who disagrees can go to the passage rather than to
          the conclusion.
        </p>
        <p>
          <span className="text-ink font-semibold">Who uses it:</span> the editor
          interrogating the read, and anyone who has to defend or overturn a
          judgement about the book.
        </p>
      </Block>

      <Block heading="The line and copy passes">
        <p>
          Prose-level and mechanical notes, each flag citing the place it was found.
          Delivered as documents per pass, so a house can hand one to a freelancer
          without handing over the whole project.
        </p>
      </Block>

      <Block heading="And what the author receives">
        <p>
          Nothing, until a person at your house sends it. The notes package leaves as
          a document from a named editor at the house &mdash; not as a message from
          us, and not automatically.
        </p>
        <p className="text-ink font-semibold">
          The author is your relationship. We do not acquire one with them by being in
          the middle of it.
        </p>
        <p className="text-faint text-[14px]">
          The editor&rsquo;s workbench, where notes are agreed and packaged, is in
          build. The reads it works on are live today.
        </p>
      </Block>
    </PageFrame>
  )
}
