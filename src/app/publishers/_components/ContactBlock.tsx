import { PUBLISHER_CONTACT_EMAIL } from '../_content'

/**
 * The close, on every page.
 *
 * Copy carries marketing's E2 softening (Paul ruled 2026-10-06): "a person
 * reads every enquiry" replaced the same-working-day promise, because the
 * promise had no named owner behind it. A claim about response time is a claim
 * like any other, and this one is the weaker, true version.
 *
 * It stays a mailto rather than a form: the enquiry record is ruled to
 * identity-billing and there is still no table and no route, so a form would
 * submit into nothing. A mailto records nothing and promises nothing, which is
 * the honest pairing.
 */
export function ContactBlock() {
  return (
    <section className="bg-paper border-t border-line">
      <div className="max-w-3xl mx-auto px-6 py-14 text-center">
        <h2 className="font-serif text-[26px] text-ink mb-3">Put a manuscript through it</h2>
        <p className="text-muted text-[16px] leading-relaxed mb-7 max-w-xl mx-auto">
          The fastest way to judge us is the product&rsquo;s own: send one manuscript
          through the read and compare the result with your editors&rsquo; view of the
          same book. Write to us &mdash; a person reads every enquiry &mdash; and we
          will also send the technical specification: what the system does, how it is
          built, and what it does not yet have. A specification that contains only
          good news is a brochure.
        </p>
        <a
          href={`mailto:${PUBLISHER_CONTACT_EMAIL}?subject=Put%20a%20manuscript%20through%20it`}
          className="inline-block bg-sage-deep hover:bg-sage-deep/90 text-white font-semibold px-5 py-3 rounded-lg text-sm"
        >
          {PUBLISHER_CONTACT_EMAIL}
        </a>
      </div>
    </section>
  )
}
