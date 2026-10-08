import { PageFrame, Block } from '../_components/PageFrame'
import { FAQS } from '../_content'

export const metadata = { title: 'Questions — AuthorsLab for Publishing Houses' }

/** Moved from the single page, 2026-10-08. FAQS verbatim from W1 — these four
 *  are the first questions our first publishing house actually asked. */
export default function FaqPage() {
  return (
    <PageFrame
      kicker="Questions"
      title="Questions publishers ask us."
      standfirst="These four are verbatim the first questions our first publishing house asked. The answers are the honest ones, in the same register as the rest of this site."
    >
      <Block heading="The four">
        <div className="space-y-7 not-prose">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="text-ink font-semibold text-[16px] mb-1">{f.q}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block heading="A question we cannot answer yet">
        <p>
          How well it reads <em>your</em> list. We have production figures and we have
          houses we can describe, but the only honest answer to &ldquo;will it be
          right about our books&rdquo; is to put one of your manuscripts through it and
          compare the result with what your own editors said about the same book.
        </p>
        <p>
          That is why the ask on every page of this site is one manuscript rather
          than a meeting.
        </p>
      </Block>
    </PageFrame>
  )
}
