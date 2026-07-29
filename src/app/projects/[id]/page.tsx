import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OverviewClient } from './_components/overview/OverviewClient'

// Default landing for /projects/[id] — the Project Overview tab.
//
// Deliberate design change (AL-UX-004 §4): the previous behaviour of auto-
// redirecting to a phase tab has moved into the Overview's primary CTA.
// Authors now land on their book, then step into the studio.

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id, first_name')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) redirect('/login')

  // Ownership check (the layout also verifies, but this keeps the page safe
  // if it ever renders outside the layout).
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) redirect('/lobby')

  return <OverviewClient projectId={id} authorName={profile.first_name ?? undefined} />
}
