// R9 — A SIMULATION MUST ANNOUNCE ITSELF (sysadmin ruling, 2026-10-02).
//
// ONE mark for the whole estate. Design, Publishing Hub and Marketing Hub are
// all simulated for the High Line demo, and three lanes shipping three
// differently-worded banners is the station-marks defect in a new coat — so
// this component exists once, here, and every simulated surface mounts it.
// Same instruction as ux's brief: "reuse their marks; do not mint new ones."
//
// The ruling's requirements, each load-bearing:
//   - PERSISTENT and NON-DISMISSIBLE: no close button, no state, no
//     localStorage. It cannot be made to go away, because the moment it can
//     be dismissed the next screenshot is a simulation claiming to be real.
//   - VISIBLE WITHOUT SCROLLING: sticky at the top of the view it marks.
//   - ON EVERY SIMULATED VIEW: mount it per-surface, not per-app, so a real
//     surface (the editorial studio) never wears it. The marker protects the
//     true part — if Oliver discovers one room is a stage set unannounced,
//     he will reasonably doubt the rooms that aren't.
//
// The default copy is the ruled sentence verbatim. `detail` may add one
// surface-specific clause (e.g. what IS real on the view); it must never
// soften the first sentence.

export default function SimulationMarker({ detail }: { detail?: string }) {
  return (
    <div
      role="status"
      aria-label="Preview surface notice"
      className="sticky top-0 z-40 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <span className="font-semibold">Preview</span>
      <span aria-hidden="true"> — </span>
      <span>sample data, not your titles.</span>
      {detail ? <span className="text-amber-800"> {detail}</span> : null}
    </div>
  )
}
