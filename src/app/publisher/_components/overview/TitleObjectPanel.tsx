'use client'

/**
 * THE TITLE AS AN OBJECT — left column of the publisher Overview.
 *
 * The author Overview's `BookObjectPanel`, third-person. Cover, the facts
 * about the title, then the collateral shelf.
 *
 * Two changes from the author version:
 * - The author's panel passes `authorName` into the cover because it is the
 *   reader's own book. Here the author is a FACT ABOUT the title, so it is a
 *   meta row like any other, and the house's imprint is one too.
 * - Every meta row is omitted when its value is absent rather than shown with
 *   a dash or a zero. A zero word count is a claim; an absent row is not.
 */

import { PublisherBookCover } from '@/components/publisher-chrome/PublisherBookCover'
import { CollateralShelf } from './CollateralShelf'
import type { PublisherOverviewPayload } from '@/app/api/publisher/projects/[id]/overview/route'

export function TitleObjectPanel({ payload }: { payload: PublisherOverviewPayload }) {
  const t = payload.title

  const meta: Array<{ label: string; value: string }> = []
  if (t.authorName) meta.push({ label: 'Author', value: t.authorName })
  if (t.wordCount && t.wordCount > 0) meta.push({ label: 'Words', value: t.wordCount.toLocaleString() })
  if (t.totalChapters && t.totalChapters > 0) meta.push({ label: 'Chapters', value: String(t.totalChapters) })
  if (t.genre) meta.push({ label: 'Genre', value: t.genre })
  if (payload.list) meta.push({ label: 'Imprint', value: payload.list.imprintName })
  if (t.addedAt) meta.push({ label: 'Added', value: formatDate(t.addedAt) })

  return (
    <aside className="flex flex-col gap-7">
      <div className="flex justify-center lg:justify-start">
        <PublisherBookCover
          coverUrl={t.coverUrl}
          title={t.title}
          size="md"
          hasCover={t.hasCoverAsset}
        />
      </div>

      {meta.length > 0 && (
        <dl className="space-y-1.5">
          {meta.map((m) => (
            <div key={m.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-[11px] uppercase tracking-wider" style={{ color: '#8A8A8A' }}>
                {m.label}
              </dt>
              <dd className="text-[13px] text-right" style={{ color: '#1A1A1A' }}>
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div style={{ height: 1, background: '#E8E5E0' }} />

      <CollateralShelf docs={payload.collateral} />
    </aside>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
