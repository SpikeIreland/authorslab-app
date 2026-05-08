'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { NewProjectModal } from './_components/NewProjectModal'

// ============================================================================
// Types — must mirror /api/lobby/projects/route.ts
// ============================================================================

interface LobbyProject {
  id: string
  title: string
  genre: string | null
  word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  cover_url: string | null
}

type StageKey = 'ghostwriter' | 'author_studio' | 'design' | 'publishing' | 'marketing'
type StageState = 'skipped' | 'pending' | 'active' | 'complete'

// ============================================================================
// Stage state derivation
// ============================================================================

// Map a manuscript's current_phase_number + status to states for each of the
// five Lobby pills. Existing manuscripts skipped Ghostwriter (they came in via
// the upload onboarding); future projects from the new flow may show
// Ghostwriter active.
function deriveStageStates(p: LobbyProject): Record<StageKey, StageState> {
  const phase = p.current_phase_number ?? 1
  const status = p.status ?? ''

  if (status === 'complete') {
    return {
      ghostwriter: 'skipped',
      author_studio: 'complete',
      design: 'complete',
      publishing: 'complete',
      marketing: 'complete',
    }
  }

  // Write-path projects from the new-project fork — Ghostwriter is the
  // active stage; everything downstream is pending (not skipped).
  if (status === 'ghostwriting') {
    return {
      ghostwriter: 'active',
      author_studio: 'pending',
      design: 'pending',
      publishing: 'pending',
      marketing: 'pending',
    }
  }

  return {
    ghostwriter: 'skipped',
    author_studio: phase >= 1 && phase <= 3 ? 'active' : phase > 3 ? 'complete' : 'pending',
    design: phase === 4 ? 'active' : phase > 4 ? 'complete' : 'pending',
    publishing: phase === 4 ? 'active' : phase > 4 ? 'complete' : 'pending',
    marketing: phase === 5 ? 'active' : 'pending',
  }
}

// Friendly editor name for the active Author Studio editor.
function editorForPhase(phase: number | null): string | null {
  if (phase === 1) return 'Alex'
  if (phase === 2) return 'Sam'
  if (phase === 3) return 'Jordan'
  return null
}

// Warm "Next:" sentence based on phase.
function nextActionFor(p: LobbyProject): string {
  if (p.status === 'complete') return 'Live and available — review sales or run a campaign'
  if (p.status === 'ghostwriting') return 'Eden is waiting to introduce your ghostwriter'
  const phase = p.current_phase_number ?? 1
  if (phase === 1) return 'Alex is reading your manuscript'
  if (phase === 2) return 'Sam is reviewing your manuscript with you'
  if (phase === 3) return 'Jordan is polishing the final pass'
  if (phase === 4) return 'Set up cover, metadata and platforms'
  if (phase === 5) return 'Plan your launch with Riley'
  return 'Open the project to keep going'
}

// Where "Open →" should route. Lands the writer in the new project shell;
// the shell's index page picks the right default tab based on phase.
function openHrefFor(p: LobbyProject): string {
  return `/projects/${p.id}`
}

// "Updated 2 days ago", "Updated today", etc.
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const day = 24 * 60 * 60 * 1000
  const hour = 60 * 60 * 1000
  const minute = 60 * 1000

  if (diffMs < hour) {
    const m = Math.max(1, Math.floor(diffMs / minute))
    return `Updated ${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour)
    return `Updated ${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diffMs < 2 * day) return 'Updated yesterday'
  if (diffMs < 7 * day) {
    const d = Math.floor(diffMs / day)
    return `Updated ${d} days ago`
  }
  if (diffMs < 30 * day) {
    const w = Math.floor(diffMs / (7 * day))
    return `Updated ${w} week${w === 1 ? '' : 's'} ago`
  }
  const mo = Math.floor(diffMs / (30 * day))
  return `Updated ${mo} month${mo === 1 ? '' : 's'} ago`
}

// ============================================================================
// Page
// ============================================================================

export default function LobbyPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [authChecked, setAuthChecked] = useState(false)
  const [authorFirstName, setAuthorFirstName] = useState<string>('')
  const [projects, setProjects] = useState<LobbyProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('author_profiles')
        .select('first_name')
        .eq('auth_user_id', user.id)
        .single()

      if (cancelled) return
      setAuthorFirstName(profile?.first_name ?? '')
      setAuthChecked(true)

      try {
        const res = await fetch('/api/lobby/projects')
        if (!res.ok) throw new Error(`Failed to load projects (${res.status})`)
        const json = await res.json() as { projects: LobbyProject[] }
        if (cancelled) return
        setProjects(json.projects)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [router, supabase])

  // Split into in-progress vs launched.
  const { inProgress, launched } = useMemo(() => {
    const inProgress: LobbyProject[] = []
    const launched: LobbyProject[] = []
    for (const p of projects) {
      if (p.status === 'complete') launched.push(p)
      else inProgress.push(p)
    }
    return { inProgress, launched }
  }, [projects])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar — same pattern as /home */}
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
            {authorFirstName ? `Signed in as ${authorFirstName}` : ''}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">

          <div className="flex items-baseline justify-between mb-5">
            <h1 className="text-xl font-medium text-slate-900">Your projects</h1>
            <p className="text-sm text-slate-500">
              {projects.length === 0
                ? 'Nothing yet'
                : `${inProgress.length} in progress${launched.length > 0 ? ` · ${launched.length} launched` : ''}`}
            </p>
          </div>

          {/* Start a new project — opens the Write/Edit fork modal */}
          <button
            type="button"
            onClick={() => setNewProjectModalOpen(true)}
            className="block w-full text-center px-4 py-3 mb-4 border border-dashed border-slate-300 rounded-md text-sm text-slate-600 hover:bg-white hover:border-slate-400 transition-colors"
          >
            + Start a new project
          </button>

          {loading && (
            <p className="text-sm text-slate-500 py-8 text-center">Loading projects…</p>
          )}

          {error && (
            <div className="px-4 py-3 mb-4 bg-rose-50 border border-rose-200 rounded-md text-sm text-rose-800">
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <p className="text-base text-slate-900 font-medium mb-2">
                No projects yet
              </p>
              <p className="text-sm text-slate-600 mb-6">
                Start your first project — upload a manuscript or draft from scratch with a Ghostwriter.
              </p>
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(true)}
                className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
              >
                Start a new project
              </button>
            </div>
          )}

          {!loading && !error && inProgress.length > 0 && (
            <div className="space-y-3">
              {inProgress.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}

          {!loading && !error && launched.length > 0 && (
            <>
              <p className="mt-8 mb-3 text-[11px] uppercase tracking-wider font-medium text-slate-400">
                Launched
              </p>
              <div className="space-y-3">
                {launched.map(p => (
                  <ProjectCard key={p.id} project={p} launched />
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      <NewProjectModal
        open={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
      />
    </div>
  )
}

// ============================================================================
// Project card
// ============================================================================

function ProjectCard({ project, launched }: { project: LobbyProject; launched?: boolean }) {
  const states = deriveStageStates(project)
  const editor = editorForPhase(project.current_phase_number)
  const next = nextActionFor(project)
  const href = openHrefFor(project)
  const updated = relativeTime(project.updated_at)

  const wordCount = project.word_count
    ? `${project.word_count.toLocaleString()} words`
    : null

  const meta = [project.genre, wordCount].filter(Boolean).join(' · ')

  return (
    <article className="bg-white border border-slate-200 rounded-lg p-4 flex gap-4">
      {project.cover_url && (
        <div className="w-12 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover_url}
            alt={`${project.title} cover`}
            className="w-12 h-[72px] object-cover rounded-sm border border-slate-200"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="text-base font-medium text-slate-900 truncate">
            {project.title}
          </h2>
          <span className={`text-xs whitespace-nowrap ${launched ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
            {launched ? 'Launched' : updated}
          </span>
        </div>

        {meta && (
          <p className="text-xs text-slate-500 mb-3">{meta}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <StagePill label="Ghostwriter" state={states.ghostwriter} />
          <StagePill
            label={editor && states.author_studio === 'active' ? `Author Studio · ${editor}` : 'Author Studio'}
            state={states.author_studio}
          />
          <StagePill label="Design" state={states.design} />
          <StagePill label="Publishing" state={states.publishing} />
          <StagePill label="Marketing" state={states.marketing} />
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-700 flex-1 min-w-0 truncate">
            <span className="text-slate-500 mr-1.5">{launched ? 'Live on:' : 'Next:'}</span>
            {next}
          </p>
          <Link
            href={href}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            Open →
          </Link>
        </div>
      </div>
    </article>
  )
}

function StagePill({ label, state }: { label: string; state: StageState }) {
  if (state === 'complete') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
        <span className="text-[10px]">✓</span>{label}
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />{label}
      </span>
    )
  }
  if (state === 'skipped') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-slate-300 text-slate-400 italic">
        {label}
      </span>
    )
  }
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      {label}
    </span>
  )
}
