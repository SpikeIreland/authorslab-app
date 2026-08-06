// ============================================================================
// /terms · Terms of Service
// Reads docs/Legal/drafts/terms-of-service.md at build time and hands it to
// the shared PolicyPage shell.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { PolicyPage } from '@/components/marketing/PolicyPage'

export const metadata: Metadata = {
  title: 'Terms of Service — AuthorsLab',
  description:
    'The terms on which AuthorsLab offers you access to the platform. Written to be understood — but they matter, so please read them.',
}

export default function TermsPage() {
  const filePath = path.join(process.cwd(), 'docs/Legal/drafts/terms-of-service.md')
  const markdownContent = fs.readFileSync(filePath, 'utf8')

  return (
    <PolicyPage
      title="Terms of Service"
      kicker="Using AuthorsLab"
      markdownContent={markdownContent}
    />
  )
}
