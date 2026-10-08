import type { Metadata } from 'next'
import { PublishersHeader, PublishersFooter } from './_components/PublishersChrome'

export const metadata: Metadata = {
  title: 'AuthorsLab for Publishing Houses',
  description:
    'The editorial read, for publishing houses: instrumented full-manuscript analysis your editors review and act on. We do not typeset and we do not distribute — the production files are yours.',
}

/**
 * The public publisher site's shell. Header, nav and footer mounted once.
 *
 * This folder is deliberately self-contained — its own chrome, its own content
 * module, no import from any author surface — so that when the publisher
 * product moves to its own app (Paul's ruling, 2026-10-06) it travels as a
 * unit rather than needing to be separated first.
 */
export default function PublishersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ivory min-h-screen flex flex-col">
      <PublishersHeader />
      {children}
      <PublishersFooter />
    </div>
  )
}
