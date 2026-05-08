'use client'

// Horizontal tab strip across the top of every project page. A Client
// Component because it needs usePathname() to know which tab is currently
// open and apply the active styling.

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type StageState = 'pending' | 'active' | 'complete' | 'skipped'

const JOURNEY_TABS = [
  { id: 'ghostwriter', label: 'Ghostwriter' },
  { id: 'author-studio', label: 'Author Studio' },
  { id: 'design', label: 'Design' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'marketing', label: 'Marketing' },
] as const

const TOOL_TABS = [
  { id: 'research', label: 'Research' },
  { id: 'script', label: 'Script' },
] as const

// Same derivation logic as the Lobby card so a project's pill states stay
// consistent across both surfaces. Mirrors src/app/lobby/page.tsx.
function deriveTabState(
  tabId: string,
  phase: number | null,
  status: string | null,
): StageState {
  if (status === 'complete') {
    return tabId === 'ghostwriter' ? 'skipped' : 'complete'
  }

  // Existing manuscripts (uploaded via legacy onboarding) skipped Ghostwriter.
  // The new Write/Edit fork will set this differently for new projects.
  if (tabId === 'ghostwriter') return 'skipped'

  const p = phase ?? 1
  if (tabId === 'author-studio') {
    if (p >= 1 && p <= 3) return 'active'
    return p > 3 ? 'complete' : 'pending'
  }
  if (tabId === 'design') {
    return p === 4 ? 'active' : p > 4 ? 'complete' : 'pending'
  }
  if (tabId === 'publishing') {
    return p === 4 ? 'active' : p > 4 ? 'complete' : 'pending'
  }
  if (tabId === 'marketing') {
    return p === 5 ? 'active' : 'pending'
  }
  return 'pending'
}

export function ProjectTabStrip({
  projectId,
  phase,
  status,
}: {
  projectId: string
  phase: number | null
  status: string | null
}) {
  const pathname = usePathname()

  const isCurrent = (tabId: string) => pathname === `/projects/${projectId}/${tabId}`

  function tabClasses(tabId: string, isToolTab: boolean): string {
    const base = 'px-3 py-2.5 text-sm border-b-2 -mb-px whitespace-nowrap inline-flex items-center gap-1.5 transition-colors'

    // Currently selected tab — bold, dark underline, regardless of state.
    if (isCurrent(tabId)) {
      return `${base} border-slate-900 text-slate-900 font-medium`
    }

    if (isToolTab) {
      // Research = always available; Script = aspirational/italic.
      if (tabId === 'script') {
        return `${base} border-transparent text-slate-400 italic hover:text-slate-600`
      }
      return `${base} border-transparent text-slate-600 hover:text-slate-900`
    }

    const state = deriveTabState(tabId, phase, status)
    if (state === 'complete') {
      return `${base} border-transparent text-emerald-700 hover:text-emerald-800`
    }
    if (state === 'active') {
      return `${base} border-transparent text-blue-700 hover:text-blue-800`
    }
    if (state === 'skipped') {
      return `${base} border-transparent text-slate-400 italic line-through hover:text-slate-500`
    }
    return `${base} border-transparent text-slate-500 hover:text-slate-800`
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="px-4 flex items-center overflow-x-auto">
        {JOURNEY_TABS.map(t => {
          const state = deriveTabState(t.id, phase, status)
          return (
            <Link key={t.id} href={`/projects/${projectId}/${t.id}`} className={tabClasses(t.id, false)}>
              {state === 'complete' && !isCurrent(t.id) && (
                <span className="text-[11px]" aria-hidden>✓</span>
              )}
              {state === 'active' && !isCurrent(t.id) && (
                <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
              )}
              {t.label}
            </Link>
          )
        })}

        <span className="w-px h-5 bg-slate-300 mx-2" aria-hidden />

        {TOOL_TABS.map(t => (
          <Link key={t.id} href={`/projects/${projectId}/${t.id}`} className={tabClasses(t.id, true)}>
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
