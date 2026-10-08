import Link from 'next/link'
import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'Series — AuthorsLab for Publishing Houses' }

/**
 * NEW PAGE, 2026-10-08.
 *
 * ─── Why it did not exist, and why it should ────────────────────────────────
 * The differentiator was one line in an FAQ. The RESET ruled that continuity
 * "falls out of" the positioning and is not the pitch — which is right about
 * the HERO and wrong about the site having no page for it. A house with a
 * trilogy on its list asks this question directly.
 *
 * ─── PRESENT-TENSE RULING, strictly ─────────────────────────────────────────
 * Series memory is IN BUILD. The summaries and key points it carries forward
 * are live. This page keeps those two facts apart in every paragraph, and the
 * in-build label is a heading rather than a footnote, because a reader who
 * clicks straight here never saw the register on the hub.
 */
export default function SeriesPage() {
  return (
    <PageFrame
      kicker="Series"
      title="The thing a house loses when an editor leaves."
      standfirst="Continuity knowledge lives in a person. People move on, and book three is read by someone who did not read book one."
    >
      <Block heading="What the problem actually is">
        <p>
          A series editor holds a model of the books in their head: who knows what and
          when, which thread was dropped on purpose, what the second book promised that
          the third has to pay off. None of it is written down, because writing it down
          was never anybody&rsquo;s job.
        </p>
        <p>
          When that editor moves, the house does not lose a file. It loses a reading.
          The next person starts from the manuscript in front of them.
        </p>
      </Block>

      <Block heading="Why the artefacts already fit">
        <p>
          Every read produces chapter summaries and key points &mdash; the compressed
          form of a book, tied back to the text. Those exist today, for every title
          that goes through the line, as a by-product of the read rather than as extra
          work.
        </p>
        <p>
          <span className="text-ink font-semibold">That is the whole mechanism.</span>{' '}
          A series relationship carries book one&rsquo;s summaries and key points into
          the read of book two, so the structural pass on the later book is performed
          against the earlier one rather than in isolation.
        </p>
      </Block>

      <Block heading="In build now — stated plainly">
        <p>
          The artefacts are live. <span className="text-ink font-semibold">The
          relationship that carries them forward is being built.</span> We would rather
          tell you it is coming than imply it is here.
        </p>
        <p>
          What exists today: the summaries and key points, per title, for every book
          read. What is being built: the series relation itself, and the panel that
          shows an editor the earlier books in the series while they read the later
          one.
        </p>
      </Block>

      <Block heading="What it does not do">
        <p>
          It does not enforce continuity, and it will not tell an author they have
          contradicted themselves. It gives the person reading book three the reading
          of books one and two, in a form they can check. The judgement stays where
          it was &mdash; with{' '}
          <Link href="/publishers/the-read" className="text-sage-deep hover:underline">
            your editor
          </Link>.
        </p>
      </Block>
    </PageFrame>
  )
}
