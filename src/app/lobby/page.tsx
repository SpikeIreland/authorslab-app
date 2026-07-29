'use client'

export const dynamic = 'force-dynamic'

/**
 * The Library — AuthorsLab's project landing surface (formerly /lobby list).
 *
 * Per AL-UX-004 §3: serif greeting, book cards with typeset covers + mini
 * journey spines + persona-avatared Next line, dashed Begin-a-new-book card,
 * launched-books section styled in the state grammar.
 *
 * All derivation logic is preserved from the prior implementation and lives
 * in _components/derivations.ts.
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NewProjectModal } from './_components/NewProjectModal'
import { AppShell } from '@/components/chrome/AppShell'
import { BookCard } from './_components/BookCard'
import { BeginNewBookCard } from './_components/BeginNewBookCard'
import { greetingFor, type LobbyProject } from './_components/derivations'

export default function LibraryPage() {
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

  // One-line summary under the greeting — brief §3.1.
  const summary = useMemo(() => {
    if (loading) return 'Loading your library…'
    if (projects.length === 0) return 'No books on the shelf yet — start one below.'
    const parts: string[] = []
    if (inProgress.length > 0) {
      const n = inProgress.length
      parts.push(`${n === 1 ? 'One book' : `${wordFor(n)} books`} in the making`)
    }
    if (launched.length > 0) {
      const n = launched.length
      parts.push(`${n === 1 ? 'one' : wordFor(n)} launched`)
    }
    return parts.join(' · ')
  }, [loading, projects.length, inProgress.length, launched.length])

  if (!authChecked) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading…</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell firstName={authorFirstName || undefined}>
      <main className="flex-1 overflow-y-auto h-[calc(100vh-56px)]">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Greeting + summary */}
          <div className="mb-8">
            <h1
              className="text-[32px] leading-tight mb-1.5"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
            >
              {greetingFor(authorFirstName)}
            </h1>
            <p className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              {summary}
            </p>
          </div>

          {loading && (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted)' }}>
              Loading projects…
            </p>
          )}

          {error && (
            <div
              className="px-4 py-3 mb-4 rounded-md text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
            >
              {error}
            </div>
          )}

          {/* Book cards */}
          {!loading && !error && inProgress.length > 0 && (
            <div className="space-y-4 mb-6">
              {inProgress.map(p => (
                <BookCard key={p.id} project={p} />
              ))}
            </div>
          )}

          {/* Begin a new book — always shown, brief §3.3 */}
          {!loading && !error && (
            <div className={inProgress.length > 0 ? 'mt-6' : ''}>
              <BeginNewBookCard onClick={() => setNewProjectModalOpen(true)} />
            </div>
          )}

          {/* Launched section — brief §3.4 */}
          {!loading && !error && launched.length > 0 && (
            <>
              <p className="kicker mt-10 mb-3">Launched</p>
              <div className="space-y-4">
                {launched.map(p => (
                  <BookCard key={p.id} project={p} launched />
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
    </AppShell>
  )
}

// Numbers under 10 read better as words in a serif greeting sentence.
function wordFor(n: number): string {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  if (n < words.length) return words[n]
  return String(n)
}
