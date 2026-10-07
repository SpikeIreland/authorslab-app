import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AuthorsLab Publisher',
  // R7: the noun is Books. (The old description said "projects".)
  description: 'Where every book in the house is, at a glance.',
  robots: 'noindex, nofollow',
  // The desktop icon Paul wants: a PWA scoped to this path, per the High Line
  // ruling §7 — never a subdomain bought for an icon.
  manifest: '/publisher.webmanifest',
  // iOS ignores the manifest for Add to Home Screen. Without these three it
  // installs as a Safari bookmark with a screenshot for an icon, opens with
  // browser chrome, and the whole point of the icon is lost.
  appleWebApp: {
    capable: true,
    title: 'AuthorsLab',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/icons/publisher-icon-192.png',
  },
}

import { PublisherShell } from '@/components/publisher-chrome/PublisherShell'
import { createClient } from '@/lib/supabase/server'

// The shell is ux's (High Line demo-build ruling §6); every page inside it is
// publisher's. One integration point, so the whole product gets chrome at once
// and no publisher surface can ship with "no way in" again.
export default async function PublisherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The sign-in page lives INSIDE /publisher so the home-screen icon never
  // leaves its own PWA scope — but it must not be wrapped in the shell, whose
  // navigation implies a seat the visitor does not yet hold. A layout cannot
  // read the pathname, so it asks the question it actually cares about: is
  // there a session? No session reaching this layout means middleware has
  // already sent them to /publisher/login, so the only thing to render is the
  // page itself.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  return <PublisherShell>{children}</PublisherShell>
}
