import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'Pricing — AuthorsLab for Publishing Houses' }

/**
 * Moved from the single page, 2026-10-08.
 *
 * SHAPE ONLY. No figures: numbers are finance's and Paul's, and Paul's standing
 * position is that we leave the room without disclosing a price to a publisher.
 * No pilot terms either — ratification was never confirmed public.
 */
export default function PricingPage() {
  return (
    <PageFrame
      kicker="Pricing"
      title="A platform fee, and a fee per title that goes through the line."
      standfirst="That is the whole shape: you pay for the instrument, and for books reaching market — which is the thing you actually want more of."
    >
      <Block heading="We never count seats">
        <p>
          <span className="text-ink font-semibold">A three-person imprint with large
          ambitions should not pay more for growing its team.</span> Who you bring in
          is an editorial decision, and we would rather it never became a billing
          one.
        </p>
        <p>
          It also means you can put a junior editor, a freelancer and a rights
          manager on the same title without arithmetic.
        </p>
      </Block>

      <Block heading="How the numbers get set">
        <p>
          Against your list, with you, and in front of you rather than behind a form.
          List size, the mix of titles, and how much of the line you intend to use all
          move it, so a public number would be a fiction for almost every house that
          read it.
        </p>
        <p>
          Write to us and we will put a figure in front of you in the first
          conversation.
        </p>
      </Block>
    </PageFrame>
  )
}
