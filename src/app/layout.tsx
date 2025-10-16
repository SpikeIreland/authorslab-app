import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AuthorLab.ai - AI-Powered Author Services',
  description: 'Transform your manuscript with AI-powered developmental editing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}