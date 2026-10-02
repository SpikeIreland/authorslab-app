/**
 * COVER APPROVAL — a decision about a VERSION, not about a station.
 *
 * `design` shipped the approval socket on 2026-10-02: `DesignStation` takes
 * `renderApproval(current)` and hands my control the exact asset on screen,
 * so an approval cannot be *rendered* against a stale version. That closes
 * half of it. This file closes the other half, which is worse and was mine to
 * notice:
 *
 * ─── THE DEFECT I WOULD HAVE SHIPPED ────────────────────────────────────────
 *
 * `publisher_actions` records `station` + `kind`, and `decisionAt()` reads the
 * latest `approved | revisions_requested` FOR A STATION. So a cover approved
 * on Monday would still read "approved" on Friday after a designer filed a
 * new version on Wednesday — the station remembers a verdict about artwork
 * that is no longer on screen. The publisher would see their own approval
 * against a cover they have never seen.
 *
 * That is the estate's recurring shape once more: a record answering a
 * different question from the one being asked of it. `updated_at` meaning
 * "a row was touched" rather than "a book moved"; `station='route'` meaning
 * two things to two lanes. Here: `approved` meaning "this house approved a
 * cover at some point", read as "this cover is approved".
 *
 * ─── SO THE DECISION CARRIES ITS SUBJECT ────────────────────────────────────
 *
 * The approval writes the asset id into `body`, and this function will only
 * report a verdict when the recorded subject IS the asset being asked about.
 * A decision about a superseded version is not a decision about this one, and
 * reads as *no decision yet* — which is the truth, and which puts the control
 * back in front of the publisher rather than a stale green tick.
 *
 * `body` rather than a typed column because `publisher_actions` has no column
 * for a subject. A `subject_asset_id` column is the proper fix and is
 * couriered to `sysadmin` with the `station` CHECK; until it lands this is a
 * convention, and it is a convention that FAILS CLOSED — an unparseable or
 * absent subject yields `null`, never an approval.
 */

export type CoverVerdict = 'approved' | 'revisions_requested'

export interface CoverDecisionFact {
  station: string
  kind: string
  /** The recorded subject — an asset id for cover decisions. */
  body: string | null
  created_at: string
}

/**
 * The verdict on ONE asset, or null.
 *
 * Null covers every honest "we do not know": no decisions at all, decisions
 * about other versions, a decision with no subject recorded, or no asset on
 * screen to ask about.
 */
export function coverVerdictFor(
  actions: readonly CoverDecisionFact[],
  assetId: string | null
): CoverVerdict | null {
  if (!assetId) return null

  // Newest first, by the recorded time rather than by array order — an
  // append-only log is usually in order and "usually" is not a guarantee a
  // verdict should rest on.
  const relevant = actions
    .filter(
      (a) =>
        a.station === 'cover' &&
        (a.kind === 'approved' || a.kind === 'revisions_requested') &&
        typeof a.body === 'string' &&
        a.body.trim() === assetId
    )
    .sort((x, y) => (x.created_at < y.created_at ? 1 : x.created_at > y.created_at ? -1 : 0))

  const latest = relevant[0]
  return latest ? (latest.kind as CoverVerdict) : null
}
