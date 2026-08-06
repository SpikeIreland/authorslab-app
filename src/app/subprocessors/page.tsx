// ============================================================================
// /subprocessors · Subprocessor List
// Reads docs/Legal/drafts/subprocessors.md at build time and hands it to the
// shared PolicyPage shell.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { PolicyPage } from '@/components/marketing/PolicyPage'

export const metadata: Metadata = {
  title: 'Subprocessors — AuthorsLab',
  description:
    'The third-party service providers AuthorsLab uses to deliver the platform, what they process, and where they’re based.',
}

export default function SubprocessorsPage() {
  const filePath = path.join(process.cwd(), 'docs/Legal/drafts/subprocessors.md')
  const markdownContent = fs.readFileSync(filePath, 'utf8')

  return (
    <PolicyPage
      title="Subprocessors"
      kicker="Third-party services"
      markdownContent={markdownContent}
    />
  )
}
