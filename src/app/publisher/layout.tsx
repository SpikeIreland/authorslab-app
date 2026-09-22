import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publisher Portal — AuthorsLab',
  description: 'A private view into AuthorsLab projects.',
  robots: 'noindex, nofollow',
}

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
