import { PageFrame, Block } from '../_components/PageFrame'
import { STATIONS } from '../_content'

export const metadata = { title: 'How it works — AuthorsLab for Publishing Houses' }

/** Moved from the single page, 2026-10-08. STATIONS is the W1 array verbatim. */
export default function HowItWorksPage() {
  return (
    <PageFrame
      kicker="How it works"
      title="Seven stations, two of them boundaries."
      standfirst="A title moves through seven stations — five working phases between two boundaries. Each editorial read runs five analyses in parallel against the complete manuscript — structural, character, plot, pacing, thematic — followed by a single synthesis pass."
    >
      <Block heading="The line">
        <ol className="space-y-4 not-prose">
          {STATIONS.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-sage-bg text-sage-deep font-semibold text-sm flex items-center justify-center">
                {s.n}
              </span>
              <div>
                <p className="text-ink font-semibold text-[15px]">{s.name}</p>
                <p className="text-muted text-[14px] leading-relaxed">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>

      <Block heading="Where the line ends">
        <p className="text-ink font-semibold">
          Station seven is a boundary we claim on purpose: composition and
          distribution are the house&rsquo;s, and the files we hand off are built to
          enter your pipeline, not to replace it.
        </p>
        <p>
          We are a supplier to your process, not a replacement for it. That is a
          limit, and stating it is more useful to you than implying we could take
          the book all the way out.
        </p>
      </Block>
    </PageFrame>
  )
}
