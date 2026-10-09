import Link from 'next/link'
import { PageFrame, Block } from '../_components/PageFrame'

export const metadata = { title: 'Your data — AuthorsLab for Publishing Houses' }

/**
 * NEW PAGE, 2026-10-08.
 *
 * ─── Why it did not exist, and why it should ────────────────────────────────
 * The site promised prospects a technical specification covering "where data
 * rests" and had no section on the subject. A promise to send a document is
 * not an answer to the question the document answers.
 *
 * ─── TWO THINGS DELIBERATELY ABSENT ────────────────────────────────────────
 *
 * 1. NO RESIDENCY CLAIM. BOARD §6.4: no residency claims until the corrected
 *    table exists. So this page names the subprocessors and says residency
 *    detail comes in the specification. Saying "your data stays in the EU"
 *    before the table is corrected would be the exact defect the ruling
 *    exists to prevent.
 *
 * 2. NO LEGAL LANGUAGE. Paul is generating the publisher-side privacy policy,
 *    terms and DPA through Clarence Legal (2026-10-06). This page describes the
 *    SYSTEM; those documents will state the obligations. Where the two could
 *    disagree, this page defers.
 *
 * The access model described here is the seat model as built and measured, not
 * the author-facing policy's §5.2, which describes a different one — that
 * conflict is Paul's to resolve and is recorded in the policy courier.
 */
export default function SecurityPage() {
  return (
    <PageFrame
      kicker="Your data"
      title="Where a manuscript rests, and who can reach it."
      standfirst="An unpublished manuscript is the most confidential object a publishing house handles. This page says what happens to one."
    >
      <Block heading="Who can see a title">
        <p>
          Access is by <span className="text-ink font-semibold">seat on an
          imprint</span>. A member of your staff holds a seat, and a seat reaches the
          titles on the imprints it covers &mdash; and nothing else. A title on
          another house&rsquo;s imprint is not merely hidden from them; the request is
          refused server-side and answers identically to a request for a title that
          does not exist.
        </p>
        <p>
          That last detail is deliberate. Telling a caller &ldquo;this exists but is
          not yours&rdquo; is a small disclosure, and a small disclosure repeated
          across a list of identifiers stops being small.
        </p>
      </Block>

      <Block heading="What a seat never reaches">
        <ul className="space-y-2 list-disc pl-5">
          <li>Any title on an imprint the seat does not cover.</li>
          <li>An author&rsquo;s private working conversations with the system.</li>
          <li>Any cost or token figure. Those are ours to carry, not yours to read.</li>
        </ul>
      </Block>

      <Block heading="The other product">
        {/* marketing-hub §3 (total omission is a risk) · wording is publisher's
            preferred §1.4 sentence, countersigned via their pg_policies read
            2026-10-08. The original RLS-everywhere draft was REFUSED as false —
            the publisher path reads through the service role with seat checks
            in application code; the row-level claim is true only author-side.
            I&B confirm-or-amend window open before the subdomain move ships. */}
        <p>
          AuthorsLab also operates a separate product for individual writers. The
          two share one engine and nothing else a user can see: a writer&rsquo;s own
          work is protected row by row at the database, and a publisher&rsquo;s
          access is resolved from their seat on every request and refused outside
          it.
        </p>
      </Block>

      <Block heading="Who processes a manuscript">
        <p>
          The platform runs on <span className="text-ink">Supabase</span> (database
          and storage) and <span className="text-ink">Vercel</span> (application
          hosting). Editorial pipelines are orchestrated through{' '}
          <span className="text-ink">n8n Cloud</span> and the reads are performed by{' '}
          <span className="text-ink">Anthropic</span> and{' '}
          <span className="text-ink">OpenAI</span> models.{' '}
          <span className="text-ink">Stripe</span> processes payment and never
          receives manuscript content.
        </p>
        <p>
          Every subprocessor is bound by a data processing agreement, and none may use
          your data for their own purposes. The current list is published at{' '}
          <Link href="/subprocessors" className="text-sage-deep hover:underline">
            /subprocessors
          </Link>.
        </p>
        <p className="text-faint text-[14px]">
          Processing locations and retention periods are stated in the technical
          specification rather than here. We are correcting that table and will not
          put a residency claim on a marketing page ahead of it.
        </p>
      </Block>

      <Block heading="What is recorded about what your staff do">
        <p>
          Decisions a publisher makes inside the system &mdash; an approval, a request
          for revisions, a note &mdash; are written to an append-only log, attributed
          to the named seat and the organisation that holds it. A publisher cannot
          record a decision under a name they supply; the actor is derived from the
          session, not from the request.
        </p>
        <p>
          This exists so that &ldquo;the house approved the cover&rdquo; is a
          checkable statement months later, which is the only version of that
          sentence worth having.
        </p>
      </Block>

      <Block heading="The documents">
        <p>
          A publisher-side privacy policy, terms and data processing agreement are
          being drafted. Until they are published, the operative documents are the
          ones linked in the footer, and anything in this page that they contradict
          should be read as this page being out of date.
        </p>
      </Block>
    </PageFrame>
  )
}
