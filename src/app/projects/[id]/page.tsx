import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Default landing for /projects/[id] — picks the most useful tab based on
// the project's current phase and redirects there.

export default async function ProjectIndexPage({
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
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) redirect('/login')

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('current_phase_number, status')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) redirect('/lobby')

  const phase = manuscript.current_phase_number ?? 1
  const status = manuscript.status

  let defaultTab = 'author-studio'
  if (status === 'complete') {
    defaultTab = 'marketing'   // post-launch lives in Marketing's Performance section
  } else if (phase === 4) {
    defaultTab = 'publishing'
  } else if (phase === 5) {
    defaultTab = 'marketing'
  }

  redirect(`/projects/${id}/${defaultTab}`)
}
