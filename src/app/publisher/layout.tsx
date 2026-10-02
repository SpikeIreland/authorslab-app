import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AuthorsLab Publisher',
  // R7: the noun is Books. (The old description said "projects".)
  description: 'Where every book in the house is, at a glance.',
  robots: 'noindex, nofollow',
  // The desktop icon Paul wants: a PWA scoped to this path, per the High Line
  // ruling §7 — never a subdomain bought for an icon.
  manifest: '/publisher.webmanifest',
}

import { PublisherShell } from '@/components/publisher-chrome/PublisherShell'

// The shell is ux's (High Line demo-build ruling §6); every page inside it is
// publisher's. One integration point, so the whole product gets chrome at once
// and no publisher surface can ship with "no way in" again.
export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PublisherShell>{children}</PublisherShell>
}
