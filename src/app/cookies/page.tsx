// ============================================================================
// /cookies · Cookie Policy
// Reads docs/Legal/drafts/cookie-policy.md at build time and hands it to the
// shared PolicyPage shell.
// ============================================================================

import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import { PolicyPage } from '@/components/marketing/PolicyPage'

export const metadata: Metadata = {
  title: 'Cookie Policy — AuthorsLab',
  description:
    'The cookies AuthorsLab uses, why we use them, and how you can manage them. Kept short — writers don’t need more small print.',
}

export default function CookiesPage() {
  const filePath = path.join(process.cwd(), 'docs/Legal/drafts/cookie-policy.md')
  const markdownContent = fs.readFileSync(filePath, 'utf8')

  return (
    <PolicyPage
      title="Cookie Policy"
      kicker="Cookies"
      markdownContent={markdownContent}
    />
  )
}
