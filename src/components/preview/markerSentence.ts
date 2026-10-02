// THE R9 WORDING, AS A PURE FUNCTION — so the rule can be tested rather than
// eyeballed in a browser.
//
// This is lifted out of SimulationMarker.tsx for one reason: the rules R9 and
// AMENDMENT 2 lay down are rules about WORDS, and a component that renders
// the wrong words renders exactly as well as one that renders the right ones.
// A screenshot cannot tell those apart. `scripts/verify-marker-sentence.ts`
// can, and its negative controls are the point — chiefly that a mixed view
// must never say "not your titles".
//
// One component, one wording (AMENDMENT 2 §4). Every marked surface in the
// estate gets its sentence from here.

export type MarkerData =
  | { data: 'sample' }
  | { data: 'mixed'; ownCount: number; sampleCount: number }

/** R9's ruled sentence, verbatim. Nothing may soften or reword it. */
export const R9_VERBATIM = 'sample data, not your titles.'

/**
 * Returns the sentence that follows "Preview — ", or `null` when NO MARKER
 * should be mounted at all.
 *
 * `null` is a real answer, not a failure: a view holding only the customer's
 * own work carries no marker, because a banner over a publisher's real books
 * teaches them to ignore banners (AMENDMENT 2 §1; ux concurring).
 */
export function markerSentence(state: MarkerData): string | null {
  if (state.data === 'sample') return R9_VERBATIM

  // A mixed view with no samples in it is the all-real case: no marker.
  if (state.sampleCount <= 0) return null

  // A mixed view with none of the customer's own work is the wholly-sample
  // case. Collapsing it here means a caller that computed the wrong branch
  // still gets the right marker.
  if (state.ownCount <= 0) return R9_VERBATIM

  const own =
    state.ownCount === 1 ? '1 title of your own' : `${state.ownCount} titles of your own`
  const samples =
    state.sampleCount === 1 ? '1 seeded sample' : `${state.sampleCount} seeded samples`

  // NEVER "not your titles" on a mixed view — it disclaims work that did
  // happen, on the one surface where the realness is the whole argument.
  return `this view holds ${own} and ${samples}. Every sample is marked individually.`
}
