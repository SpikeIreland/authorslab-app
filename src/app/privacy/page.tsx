// ============================================================================
// /privacy · Privacy Policy
// Reads docs/Legal/drafts/privacy-policy.md at build time and hands it to the
// shared PolicyPage shell.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { PolicyPage } from '@/components/marketing/PolicyPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — AuthorsLab',
  description:
    'How AuthorsLab collects, uses, and protects your data. Your writing is yours; this policy explains, in plain terms, what we do with the rest.',
}

export default function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'docs/Legal/drafts/privacy-policy.md')
  const markdownContent = fs.readFileSync(filePath, 'utf8')

  return (
    <PolicyPage
      title="Privacy Policy"
      kicker="Your data"
      markdownContent={markdownContent}
    />
  )
}
