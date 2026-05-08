import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectTabStrip } from './_components/ProjectTabStrip'

// The project shell. Wraps every tab page inside /projects/[id]/.
// - Loads the project once on the server
// - Renders the brand bar, project header (← Projects · title · meta), and
//   the horizontal tab strip
// - Each tab page renders into {children}
//
// The auto-collapsing rail (Task #30) will replace the horizontal top nav
// with a left-side icon strip when implemented. For now the top nav matches
// /home and /lobby so navigation feels consistent across the app.

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

  const wordCount = manuscript.current_word_count
    ? `${manuscript.current_word_count.toLocaleString()} words`
    : null
  const meta = [manuscript.genre, wordCount].filter(Boolean).join(' · ')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Brand bar — same as /home and /lobby for navigational consistency */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/home" className="text-base font-medium text-slate-900">
              AuthorsLab
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/home"
                className="px-3 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/lobby"
                className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-900"
              >
                Projects
              </Link>
            </nav>
          </div>
          <div className="text-sm text-slate-500">
            {profile.first_name ? `Signed in as ${profile.first_name}` : ''}
          </div>
        </div>
      </header>

      {/* Project header — back to lobby, project title, project metadata */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-3 flex items-baseline gap-4">
          <Link href="/lobby" className="text-sm text-slate-500 hover:text-slate-900 whitespace-nowrap">
            ← Projects
          </Link>
          <h1 className="text-base font-medium text-slate-900 truncate">
            {manuscript.title ?? 'Untitled project'}
          </h1>
          {meta && (
            <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">{meta}</span>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <ProjectTabStrip
        projectId={manuscript.id}
        phase={manuscript.current_phase_number}
        status={manuscript.status}
      />

      {/* Tab content slot — flex container so tab pages can fill the height
          (e.g. Design's three-panel layout) or scroll naturally
          (e.g. placeholder tabs). */}
      <main className="flex-1 overflow-hidden bg-white flex flex-col min-h-0">
        {children}
      </main>
    </div>
  )
}
