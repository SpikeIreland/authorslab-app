// ============================================================================
// /dpa · Data Processing Addendum (template for enterprise / publisher customers)
// Reads docs/Legal/drafts/dpa-template.md at build time and hands it to the
// shared PolicyPage shell.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { PolicyPage } from '@/components/marketing/PolicyPage'

export const metadata: Metadata = {
  title: 'Data Processing Addendum — AuthorsLab',
  description:
    'The DPA AuthorsLab offers to enterprise and publisher customers under UK GDPR and EU GDPR. For everyday subscribers, the Privacy Policy governs data processing.',
}

export default function DPAPage() {
  const filePath = path.join(process.cwd(), 'docs/Legal/drafts/dpa-template.md')
  const markdownContent = fs.readFileSync(filePath, 'utf8')

  return (
    <PolicyPage
      title="Data Processing Addendum"
      kicker="For business customers"
      markdownContent={markdownContent}
    />
  )
}
