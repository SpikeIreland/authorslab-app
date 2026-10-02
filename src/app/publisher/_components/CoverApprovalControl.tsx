'use client'

/**
 * THE ONE CONTROL THAT SIGNS FOR A COVER.
 *
 * `design` shipped the socket on 2026-10-02 and the binding is the good part:
 * `DesignStation` calls `renderApproval(current)`, so this control receives
 * the exact asset on screen and cannot be rendered against a stale version.
 * Their pane supplies; it never signs for what it supplied.
 *
 * ─── WHAT THIS RECORDS, AND WHAT IT DOES NOT CLAIM ──────────────────────────
 *
 * It appends one row to `publisher_actions` — station `cover`, kind
 * `approved` or `revisions_requested`, body the ASSET ID, actor the caller's
 * own membership read server-side. It does not change the cover, notify
 * anybody, or move a station. An approval here is a RECORD of a person's
 * decision and nothing else, which is all it has ever been able to be.
 *
 * ─── THE SUBJECT IS IN THE RECORD, FOR A REASON ─────────────────────────────
 *
 * `coverVerdictFor()` only reports a verdict whose recorded subject is this
 * asset. Without that, approving version 1 would leave version 3 reading
 * "approved" — the publisher shown their own tick against artwork they have
 * never seen. See `_approval.ts`; the negative controls in
 * `scripts/verify-lobby-derive.ts` are what make it a mechanism rather than
 * an intention, and they fail against the station-wide read.
 *
 * ─── NO CONTROL WITHOUT A SUBSTRATE, AND NO SILENT FAILURE ──────────────────
 *
 * `available !== true` hides the buttons entirely rather than disabling them
 * — an affordance is a claim. And a refused write says so in words, through
 * the hook's `lastFailure`, because a control that fails silently is worse
 * than a control with nothing behind it.
 */

import { usePublisherActions } from '../_data/usePublisherActions'
import { coverVerdictFor } from '@/app/api/publisher/lobby/_approval'

export function CoverApprovalControl({
  projectId,
  assetId,
  suppliedByLabel,
}: {
  projectId: string
  /** The asset on screen, from design's render-prop. Null when no artwork is
   *  filed — there is then nothing to decide about, and no control. */
  assetId: string | null
  /** Shown so the decision names what it is about in human terms as well as
   *  by id. Null where the record captured no supplier — never invented. */
  suppliedByLabel?: string | null
}) {
  const { actions, available, saving, record, lastFailure } = usePublisherActions(projectId)

  // Nothing to decide about.
  if (!assetId) return null
  // No substrate: no control, not a disabled one.
  if (available !== true) return null

  const verdict = coverVerdictFor(actions, assetId)

  return (
    <div className="rounded-md border border-[#E8E5E0] bg-[#FAFAF8] px-4 py-3.5">
      <p className="text-[11px] tracking-[0.12em] uppercase mb-2" style={{ color: '#8A8A8A' }}>
        Your decision on this version
      </p>

      {verdict ? (
        <p className="text-[13.5px] mb-3" style={{ color: '#1A1A1A' }}>
          {verdict === 'approved'
            ? 'Approved — recorded against this version.'
            : 'Revisions requested — recorded against this version.'}
          {suppliedByLabel ? (
            <span style={{ color: '#8A8A8A' }}> Supplied by {suppliedByLabel}.</span>
          ) : null}
        </p>
      ) : (
        <p className="text-[13.5px] mb-3" style={{ color: '#6B6B6B' }}>
          {/* NOT "awaiting approval" — that would assert a queue and an
              obligation the system knows nothing about. It says only what is
              true: no decision has been recorded about THIS version. */}
          No decision recorded about this version.
          {suppliedByLabel ? <> Supplied by {suppliedByLabel}.</> : null}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => record({ station: 'cover', kind: 'approved', body: assetId })}
          disabled={saving || verdict === 'approved'}
          className="text-[13px] px-4 py-2 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
        >
          Approve this version
        </button>
        <button
          type="button"
          onClick={() => record({ station: 'cover', kind: 'revisions_requested', body: assetId })}
          disabled={saving || verdict === 'revisions_requested'}
          className="text-[13px] px-4 py-2 rounded-[3px] border border-[#D8D8D4] text-[#3F3F3F] bg-white hover:bg-[#F7F7F5] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
        >
          Request revisions
        </button>
      </div>

      {lastFailure && (
        <p className="mt-3 text-[13px]" style={{ color: '#92400E' }}>
          {lastFailure}
        </p>
      )}

      <p className="mt-3 text-[12px]" style={{ color: '#8A8A8A' }}>
        {/* The boundary, stated by the product rather than assumed by the
            reader. The record is append-only: a later decision is a new row,
            and the history stays readable. */}
        Recorded against this version in your name. Nothing is sent to the
        designer or the author by recording it.
      </p>
    </div>
  )
}
