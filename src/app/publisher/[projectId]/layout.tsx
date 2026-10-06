import type { Metadata } from 'next'
import { PublisherTabStrip } from '@/app/publisher/_components/PublisherTabStrip'

export const metadata: Metadata = {
  title: 'Publisher Portal — AuthorsLab',
  description: 'A private view into an AuthorsLab project.',
  robots: 'noindex, nofollow',
}

/**
 * The per-book publisher shell.
 *
 * The journey strip is mounted HERE, once, rather than in each of the three
 * page files — so a node added later (B1 Publishing, B2 Marketing) cannot ship
 * with navigation on two pages and missing on the third. That is the same
 * defect class this strip exists to close (A1); mounting it three times would
 * leave it available to re-open.
 *
 * All three pages below are `min-h-screen` rather than a fixed viewport
 * height, so a strip above them pushes content down without creating a second
 * scroll container. Checked before mounting — the four dashboard pages were
 * un-wrapped from AppShell on 2026-10-02 for exactly that bug.
 */
export default function PublisherPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublisherTabStrip />
      {children}
    </>
  )
}
