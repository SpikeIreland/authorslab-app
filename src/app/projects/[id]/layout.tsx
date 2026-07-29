import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectTabStrip } from './_components/ProjectTabStrip'
import { AppShell } from '@/components/chrome/AppShell'

// The project shell. Wraps every tab page inside /projects/[id]/.
// - Loads the project once on the server
// - Renders the AppShell (charcoal header + left rail) with the project title
// - Renders the horizontal tab strip below the shell chrome
// - Each tab page renders into {children}
//
// Chrome unified via AppShell in AL-UX-004 Phase 0/1.

export default async function ProjectLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>
  children: React.ReactNode
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

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id, title, genre, current_word_count, current_phase_number, status')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) redirect('/lobby')

  return (
    <AppShell projectTitle={manuscript.title ?? 'Untitled project'} firstName={profile.first_name ?? undefined}>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <ProjectTabStrip
          projectId={manuscript.id}
          phase={manuscript.current_phase_number}
          status={manuscript.status}
        />
        {/* Tab content slot — flex container so tab pages can fill the height
            (e.g. Design's three-panel layout) or scroll naturally
            (e.g. placeholder tabs). Paper background inside project chrome. */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ background: 'var(--color-paper)' }}>
          {children}
        </main>
      </div>
    </AppShell>
  )
}
