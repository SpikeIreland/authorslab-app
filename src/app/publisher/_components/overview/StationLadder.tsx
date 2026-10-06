'use client'

/**
 * THE LADDER — where this title is, station by station.
 *
 * The author Overview's `JourneyStepper`, read in the third person. The marks
 * are `StationMark` — the ONE implementation in this lane, already shared with
 * the Books list and the wall chart (moved verbatim 2026-10-02) — so a title
 * cannot read one way here and another way on the list.
 *
 * ─── What it does NOT do ────────────────────────────────────────────────────
 * The author's stepper carries a per-step CTA into the phase the author should
 * work on next. That is intent, and R5 holds that a surface reports state, not
 * intent. There is no CTA here: the tab strip above already navigates, and a
 * second route to the same place teaches a reader to distrust both.
 *
 * An editor's name is rendered only where one is RECORDED. The author route
 * pads these with Alex/Sam/Jordan; doing that in front of a house would name a
 * person on a station nobody has worked.
 */

import { StationMark, type StationCell } from '@/app/publisher/_components/StationMark'
import type { PublisherOverviewStation } from '@/app/api/publisher/projects/[id]/overview/route'

export function StationLadder({ stations }: { stations: PublisherOverviewStation[] }) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: '#8A8A8A' }}>
        Where it is
      </p>
      <ol className="space-y-0">
        {stations.map((s, i) => {
          // The FULL cell. Dropping a field here would make StationMark
          // render the wrong one of its three completes — a green "done"
          // claims the system ran it, and that is the defect its own header
          // records being found on a live surface.
          const cell: StationCell = {
            key: s.key,
            name: s.name,
            state: s.state,
            completedBy: s.completedBy,
            completedByName: s.completedByName,
            operator: s.operator,
          }
          const detail = detailFor(s)
          return (
            <li
              key={s.key}
              className="flex items-start gap-3 py-3"
              style={i < stations.length - 1 ? { borderBottom: '1px solid #F0EEEA' } : undefined}
            >
              <div className="pt-0.5">
                <StationMark cell={cell} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[14px] leading-tight"
                  style={{
                    color: s.state === 'not-started' ? '#8A8A8A' : '#1A1A1A',
                    fontWeight: s.state === 'in-progress' ? 600 : 400,
                  }}
                >
                  {s.name}
                </p>
                {detail && (
                  <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: '#6B6B6B' }}>
                    {detail}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/**
 * One line of EVIDENCE per station, or nothing.
 *
 * Every branch below is backed by a column. Where the columns are empty the
 * function returns null and the row carries only its mark — which is the
 * honest reading of "this station has not reported anything yet", and is not
 * the same as asserting it has not started.
 */
function detailFor(s: PublisherOverviewStation): string | null {
  if (s.state === 'complete') {
    if (s.completedAt) {
      const d = new Date(s.completedAt)
      if (!Number.isNaN(d.getTime())) {
        const when = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        return s.editorName ? `Completed ${when} · prepared by ${s.editorName}` : `Completed ${when}`
      }
    }
    // Complete with no recorded date. Say complete, claim no date.
    return s.editorName ? `Complete · prepared by ${s.editorName}` : 'Complete'
  }

  if (s.state === 'in-progress') {
    const total = s.chaptersAnalyzed
    const approved = s.chaptersApproved
    if (total !== null && total > 0 && approved !== null) {
      return s.editorName
        ? `${approved} of ${total} chapters through · ${s.editorName}`
        : `${approved} of ${total} chapters through`
    }
    return s.editorName ? `In progress · ${s.editorName}` : 'In progress'
  }

  return null
}
