import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publisher Portal — AuthorsLab',
  description: 'A private view into an AuthorsLab project.',
  robots: 'noindex, nofollow',
}

export default function PublisherPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
