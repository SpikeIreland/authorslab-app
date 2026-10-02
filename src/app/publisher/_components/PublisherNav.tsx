'use client'

/**
 * THE TWO VIEWS OF THE BOOKS LIST — and nothing the shell already owns.
 *
 * ─── FOLDED 2026-10-02, and only PART of it ─────────────────────────────────
 *
 * `ux` shipped the publisher shell (4470335) with Books · People · House Style
 * · Chat in a left panel, and asked whether this strip folds or stays. It
 * folds BY HALF, and the half that stays is the half the shell cannot carry.
 *
 * The shell's panel lists SECTIONS. `Books` points at `/publisher`, and
 * `/publisher/dashboard` is not another section — it is the SAME list read a
 * different way: "what is late" sorts the house by risk, "where everything is"
 * draws all seven stations across every book. One answers which book to worry
 * about; the other answers where they all are. A section panel has no place to
 * put that distinction, and this strip does.
 *
 * So `Your people` and `Your house` are REMOVED — the shell owns them, and two
 * navigations to one destination is how a reader learns to distrust both.
 *
 * ─── WHY NOT FOLD IT ENTIRELY ───────────────────────────────────────────────
 *
 * Because folding it entirely would have re-created, for the third time, the
 * defect this file was written to close: `/publisher/dashboard` shipped with
 * NO WAY IN, and the shell's panel does not reach it. Deleting this strip to
 * tidy up would have left the wall chart unreachable again — and I would have
 * done it in the same turn as couriering about front doors.
 *
 * A tab is still an affordance and an affordance is still a claim: both entries
 * below lead to surfaces that exist and work.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/publisher', label: 'What is late' },
  { href: '/publisher/dashboard', label: 'Where everything is' },
] as const

export function PublisherNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b" style={{ borderColor: '#E5E5E3' }}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1">
        {TABS.map((t) => {
          const active = pathname === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className="text-[13px] px-3 py-2.5 -mb-px border-b-2 transition-colors"
              style={
                active
                  ? { borderColor: 'var(--color-ink, #1A1A1A)', color: 'var(--color-ink, #1A1A1A)' }
                  : { borderColor: 'transparent', color: 'var(--color-muted, #6B6B6B)' }
              }
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
