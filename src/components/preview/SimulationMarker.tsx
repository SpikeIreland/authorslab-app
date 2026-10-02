// R9 — A SIMULATION MUST ANNOUNCE ITSELF (sysadmin ruling, 2026-10-02).
//
// ONE mark for the whole estate. Design, Publishing Hub and Marketing Hub are
// all simulated for the High Line demo, and three lanes shipping three
// differently-worded banners is the station-marks defect in a new coat — so
// this component exists once, here, and every simulated surface mounts it.
// Same instruction as ux's brief: "reuse their marks; do not mint new ones."
//
// Authored by `design`. NORMALISED by `marketing-hub` on 2026-10-02 under
// AMENDMENT 2 §4 — "one component, one wording, one placement rule, consumed
// by every marked surface. A marker that differs per station is itself a
// claim that the stations differ." Design's wording, placement and palette
// are unchanged; what is added is the second state and the rules below.
//
// ── THE TWO STATES, AND THE THIRD CASE THAT IS NOT A STATE ────────────────
//
//   data: 'sample'  every row in the view is ours. R9's sentence VERBATIM.
//   data: 'mixed'   the view holds the customer's real work AND seeded
//                   samples. A counted sentence, and it must NEVER say "not
//                   your titles" — on a mixed view that is a surface
//                   disclaiming work that did happen, which is the
//                   green-cell-em-dash with the sign flipped. `publisher`
//                   found this on the Books list, where Oliver's own
//                   82-chapter manuscript sits beside our scenery.
//
// The third case — every row is the customer's own — is NOT a state of this
// component. It is a rule about MOUNTING: no marker at all. A banner over a
// publisher's real books teaches them to ignore banners, and the marker then
// stops working on the surfaces that need it. sysadmin granted this
// explicitly in AMENDMENT 2 §1, and ux ruled the same: condition the marker
// on data provenance, two states of one component, never a second component.
//
// So the counts are not decoration. Pass them and the component cannot be
// made to lie: `mixed` with no samples renders nothing, and `mixed` with no
// real rows collapses to R9's verbatim sentence. A caller that computed the
// wrong branch still gets the right marker, which is the reason the branch
// lives here and not at six call sites.
//
// ── THE OTHER RULES, BECAUSE A WORDING WITHOUT THEM IS HALF A SPEC ────────
//
// PLACEMENT: sticky at the top of the view it marks, inside the scrolling
// region, so it is visible without scrolling and cannot be scrolled away.
// Not in the app chrome — mount it per-surface, never per-app, so a real
// surface (the editorial studio) never wears it.
//
// PERSISTENT AND NON-DISMISSIBLE: no close button, no state, no
// localStorage. The moment it can be dismissed, the next screenshot is a
// simulation claiming to be real.
//
// IT IS ABOUT PROVENANCE, NOT BEHAVIOUR (R9.1): a marked surface may do real
// work. If the plumbing is live, use it. A control with no implementation
// stays out, marker or no marker.
//
// IT IS NOT THE ONLY MARK ON A MARKED SCREEN, AND THE OTHERS MUST NOT MATCH
// IT. This mark answers *whose titles are these* and comes off when the data
// is real. A draft mark answers *whose words are these, and has a person put
// their name to them* — it is true of real data and comes off only when a
// named person rewrites the text. An attribution caption answers *who
// supplied this*. Those outlive the preview. If they share this one's amber
// register, the day this banner comes off they look like they came off with
// it, and the system starts presenting machine prose as finished copy.
// `design` has checked this on their station (one amber mark only, captions
// in a different register); `marketing-hub`'s draft chip is slate and
// per-artefact for the same reason.

import { markerSentence, type MarkerData } from './markerSentence'

export type { MarkerData }

export default function SimulationMarker({
  state = { data: 'sample' },
  whyThisIsSample,
  detail,
}: {
  /** Defaults to the wholly-sample case, which is R9's own default. */
  state?: MarkerData
  /**
   * One clause saying WHY THIS VIEW IS SAMPLE. It may add; it must never
   * soften, and it must be FALSE once the marker goes.
   *
   * The parameter is named this way on purpose, as the only enforcement
   * available. The rule it protects is semantic and no type can check it, so
   * the name does the work at the call site: `whyThisIsSample="uploads here
   * file into the live, versioned record"` reads as the mistake it is, where
   * `detail=` read as a free slot. `publishing` shipped exactly that string
   * and caught it themselves — a clause true AFTER the demo ends, riding a
   * banner that comes off, so the true part would have left with the
   * disclaimer.
   */
  whyThisIsSample?: string
  /** @deprecated Use `whyThisIsSample`. Kept so existing mounts compile. */
  detail?: string
}) {
  // `null` means NO MARKER, which is a ruled outcome rather than a failure.
  const sentence = markerSentence(state)
  if (sentence === null) return null

  const clause = whyThisIsSample ?? detail

  return (
    <div
      role="status"
      aria-label="Preview surface notice"
      className="sticky top-0 z-40 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <span className="font-semibold">Preview</span>
      <span aria-hidden="true"> — </span>
      <span>{sentence}</span>
      {clause ? <span className="text-amber-800"> {clause}</span> : null}
    </div>
  )
}
