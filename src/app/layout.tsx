import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AuthorsLab',
  description: 'Transform your manuscript with AI-powered developmental editing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // marketing · schema.org (ruled 2026-10-08): brand-level only, minimal and
  // true — name and url. No logo, social or review claims until each exists.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: 'AuthorsLab', url: 'https://authorslab.ai' },
      { '@type': 'WebSite', name: 'AuthorsLab', url: 'https://authorslab.ai' },
    ],
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
