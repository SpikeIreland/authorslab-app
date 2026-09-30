'use client'

/**
 * THE HOUSE CHIP — the name of the firm that is looking, or nothing at all.
 *
 * Three per-title surfaces printed this from a constant. They now read it, and
 * the one rule worth centralising is what happens while the read is in flight
 * or after it fails: THE CHIP IS NOT RENDERED.
 *
 * Not a skeleton, not "Loading…", and above all not a placeholder name. A pill
 * with a status dot and no name in it is a control with nothing behind it — and
 * a pill with the wrong name in it is worse, because a publisher has no way to
 * tell it is wrong. The header is simply shorter until the estate knows whose
 * house this is.
 */

import { usePublisherFirm } from '../_data/firm'

export function FirmChip({
  label,
  size = 'sm',
}: {
  /** e.g. "Publisher:" — omitted on the surfaces that do not caption it. */
  label?: string
  size?: 'sm' | 'md'
}) {
  const state = usePublisherFirm()
  if (state.status !== 'ready') return null

  const pad = size === 'md' ? 'px-3.5 py-2' : 'px-3.5 py-1.5'
  const nameClass =
    size === 'md' ? 'text-[13px] text-[#1A1A1A] font-medium' : 'text-[12px] text-[#1A1A1A]'

  return (
    <div
      className={`flex items-center gap-3 ${pad} border border-[#E8E5E0] rounded-full bg-[#FAFAF8]`}
      // The scope is in the title rather than on the face of the chip: an
      // imprint-scoped member is looking at a slice of their house and the
      // header is not the place to argue about it, but it should be readable
      // without asking anybody.
      title={
        state.scopeIsWholeOrg
          ? `${state.firmName} — whole house`
          : state.imprints.length > 0
            ? `${state.firmName} — ${state.imprints.map((i) => i.name).join(', ')} only`
            : `${state.firmName} — no imprints assigned to you`
      }
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F]" aria-hidden />
      {label ? <span className="text-[12px] text-[#8A8A8A]">{label}</span> : null}
      <span className={nameClass}>{state.firmName}</span>
    </div>
  )
}
