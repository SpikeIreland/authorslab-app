import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'The read — AuthorsLab for Publishing Houses' }

/**
 * Moved from the single page, 2026-10-08.
 *
 * Alex, Sam and Jordan are nameable per the W1 personas ruling because they are
 * consistent across every title on the platform. Publishing and Marketing are
 * deliberately UNNAMED until astudio and design settle the split editor_name
 * mapping — naming them here would put a person on the page that the estate
 * cannot yet confirm.
 */
export default function TheReadPage() {
  return (
    <PageFrame
      kicker="The read"
      title="Three readers, one per discipline."
      standfirst="Consistent across every title on the platform, so a house's second book is read by the same standard as its first."
    >
      <Block heading="Who reads what">
        <div className="grid sm:grid-cols-3 gap-5 not-prose">
          <div className="bg-paper border border-line rounded-lg p-5">
            <h3 className="text-ink font-semibold text-[15px] mb-1">Alex &mdash; developmental</h3>
            <p className="text-muted text-[14px] leading-relaxed">Structure, story and character: the whole-book read that answers whether the manuscript works.</p>
          </div>
          <div className="bg-paper border border-line rounded-lg p-5">
            <h3 className="text-ink font-semibold text-[15px] mb-1">Sam &mdash; line</h3>
            <p className="text-muted text-[14px] leading-relaxed">Prose at the sentence level: rhythm, clarity, voice &mdash; preserved, not overwritten.</p>
          </div>
          <div className="bg-paper border border-line rounded-lg p-5">
            <h3 className="text-ink font-semibold text-[15px] mb-1">Jordan &mdash; copy</h3>
            <p className="text-muted text-[14px] leading-relaxed">Consistency, usage and mechanics, with every flag citing the place it was found.</p>
          </div>
        </div>
      </Block>

      <Block heading="Each prepares; none decides">
        <p>
          An editor at the house reviews every read, interrogates it, and decides
          what reaches the author. <span className="text-ink font-semibold">The
          system holds no opinion an editor has not approved.</span>
        </p>
        <p>
          This is the part most easily mistaken for modesty. It is a design
          constraint: there is no path by which a read becomes an instruction to an
          author without a person at your house putting their name to it.
        </p>
      </Block>

      <Block heading="Consistency, and why it matters more than brilliance">
        <p>
          The same reader applies the same standard to every title you send. An
          editorial opinion that varies with who happened to pick the book up is
          hard to build a list on; one that is boringly consistent can be
          calibrated against your own editors once and then trusted.
        </p>
      </Block>
    </PageFrame>
  )
}
