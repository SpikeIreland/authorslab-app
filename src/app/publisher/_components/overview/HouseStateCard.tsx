'use client'

/**
 * THE HOUSE-STATE CARD — what replaces the author's greeting.
 *
 * ─── Why the author's card could not be lifted ──────────────────────────────
 *
 * The author Overview's fourth component is `EditorGreetingCard`: a persona
 * avatar, a greeting addressed to the author by first name, and a CTA into the
 * writing step they should do next. It is the single component on that page
 * that cannot cross, and it is EXACTLY the defect Paul has been naming since
 * September: "The chat currently speaks as if talking to the Author which
 * doesn't work."
 *
 * So this card answers the publisher's question instead of the author's.
 * The author's card asks "what should I do next with my book". The house asks
 * "where is this title, and is there anything here for me to read".
 *
 * ─── R5: it reports state, not intent ───────────────────────────────────────
 *
 * Every line is derived from a column. There is NO "needs your attention"
 * verdict here, deliberately: the evidenced risk model lives on the Books list
 * and the wall chart, and a second verdict computed from a thinner read on
 * this page would be a recommendation from a partial read — which is not a
 * measurement. If the house needs to know what is late, the list says so.
 */

import type { PublisherOverviewPayload } from '@/app/api/publisher/projects/[id]/overview/route'

export function HouseStateCard({ payload }: { payload: PublisherOverviewPayload }) {
  const { stations, collateral, list } = payload

  const complete = stations.filter((s) => s.state === 'complete').length
  const active = stations.find((s) => s.state === 'in-progress') ?? null
  const total = stations.length

  const headline =
    complete === total
      ? 'All five stations complete'
      : active
        ? `${active.name} — in progress`
        : complete > 0
          ? `${complete} of ${total} stations complete`
          : 'Not yet started on the line'

  // The collateral sentence is a COUNT, which is a fact. It does not say the
  // documents are good, or that anyone has read them.
  const readable =
    collateral.length === 0
      ? 'No documents yet.'
      : collateral.length === 1
        ? 'One document ready to read.'
        : `${collateral.length} documents ready to read.`

  return (
    <section
      className="rounded-lg p-6"
      style={{ background: '#FFFFFF', border: '1px solid #E8E5E0' }}
    >
      {list && (
        <p className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: '#8A8A8A' }}>
          {[list.organisationName, list.imprintName].filter(Boolean).join(' · ')}
        </p>
      )}

      <h2 className="font-serif text-[22px] leading-snug mb-2" style={{ color: '#1A1A1A' }}>
        {headline}
      </h2>

      <p className="text-[14px] leading-relaxed" style={{ color: '#6B6B6B' }}>
        {readable}{' '}
        {complete < total && (
          <>
            The remaining stations report here as they finish.
          </>
        )}
      </p>

      {/* Station seven is the house's own boundary, and the public page claims
          it: we do not typeset and we do not distribute. Saying it on the
          title's own page keeps the claim in both places rather than only in
          the pitch. */}
      {complete === total && (
        <p className="text-[13px] leading-relaxed mt-3" style={{ color: '#6B6B6B' }}>
          Our stations are done. The manuscript and the production files are
          yours — composition and distribution are the house&rsquo;s.
        </p>
      )}
    </section>
  )
}
