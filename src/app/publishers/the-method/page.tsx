import { PageFrame, Block } from '../_components/PageFrame'
import { METHOD_PROPERTIES } from '../_content'

export const metadata = { title: 'The method — AuthorsLab for Publishing Houses' }

/** Moved from the single page, 2026-10-08. METHOD_PROPERTIES verbatim from W1. */
export default function TheMethodPage() {
  return (
    <PageFrame
      kicker="The method"
      title="A language model is an unreliable industrial component."
      standfirst="Most tools call a model and display the answer. We treat a model call the way a factory treats a machine on a line. Four properties, all live today."
    >
      <Block heading="The four properties">
        <div className="grid sm:grid-cols-2 gap-5 not-prose">
          {METHOD_PROPERTIES.map((p) => (
            <div key={p.title} className="bg-paper border border-line rounded-lg p-5">
              <h3 className="text-ink font-semibold text-[15px] mb-2">{p.title}</h3>
              <p className="text-muted text-[14px] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block heading="Measured, not modelled">
        <p>
          Figures from real manuscript reads in production, October 2026. Outside the
          30,000&ndash;90,000-word range, figures are extrapolated and labelled as
          such in the interface.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center bg-charcoal rounded-lg py-8 px-4 not-prose">
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
        <p>
          Turnaround is close to flat with manuscript length &mdash; a 36% larger book
          took 4% longer, because the five analyses run concurrently and wall-clock
          time is dominated by model latency, not word count. A read does not depend
          on anyone&rsquo;s browser: the job record exists server-side and the editor is
          notified on completion.
        </p>
      </Block>

      <Block heading="What this buys you">
        <p>
          Every one of those properties exists so that a result you disagree with can
          be taken apart. If an editor at your house says a finding is wrong, there is
          a record of which call produced it, against which text, checked by what.
          A tool that cannot be audited cannot be argued with, and an editorial
          opinion you cannot argue with is not much use.
        </p>
      </Block>
    </PageFrame>
  )
}
