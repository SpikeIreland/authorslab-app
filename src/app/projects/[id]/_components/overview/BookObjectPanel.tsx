'use client'

/**
 * BookObjectPanel — left column of the Overview tab.
 *
 * Per AL-UX-004 §4: large typeset cover, meta (words / chapters / uploaded /
 * version), and "On your shelf" document list.
 */

import { BookCover } from '@/app/lobby/_components/BookCover'
import { ShelfDocuments } from './ShelfDocuments'
import { formatUploadedDate } from './overviewDerivations'
import type { OverviewPayload } from '@/app/api/projects/[id]/overview/route'

interface BookObjectPanelProps {
  payload: OverviewPayload
  authorName?: string
}

export function BookObjectPanel({ payload, authorName }: BookObjectPanelProps) {
  const { manuscript, shelf } = payload

  const metaLines: Array<{ label: string; value: string }> = []
  if (manuscript.current_word_count && manuscript.current_word_count > 0) {
    metaLines.push({ label: 'Words', value: manuscript.current_word_count.toLocaleString() })
  }
  if (manuscript.total_chapters && manuscript.total_chapters > 0) {
    metaLines.push({ label: 'Chapters', value: String(manuscript.total_chapters) })
  }
  if (manuscript.genre) {
    metaLines.push({ label: 'Genre', value: manuscript.genre })
  }
  metaLines.push({ label: 'Uploaded', value: formatUploadedDate(manuscript.created_at) })

  return (
    <aside className="flex flex-col gap-8">
      {/* Cover */}
      <div className="flex justify-center lg:justify-start">
        <BookCover
          id={manuscript.id}
          title={manuscript.title}
          authorName={authorName}
          coverUrl={manuscript.cover_url}
          size="large"
        />
      </div>

      {/* Meta */}
      <dl className="space-y-1.5">
        {metaLines.map(line => (
          <div key={line.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              {line.label}
            </dt>
            <dd className="text-[13px] text-right" style={{ color: 'var(--color-ink)' }}>
              {line.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-line-soft)' }} />

      {/* Shelf */}
      <ShelfDocuments docs={shelf} />
    </aside>
  )
}
