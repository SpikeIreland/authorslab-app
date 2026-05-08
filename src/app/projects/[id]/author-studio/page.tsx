'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

// ============================================================================
// Types — must mirror /api/projects/[id]/author-studio/state/route.ts
// ============================================================================

interface Editor {
  name: 'Alex' | 'Sam' | 'Jordan'
  phase: 1 | 2 | 3
  role: string
  status: 'pending' | 'active' | 'complete'
  color: string
}

interface ChapterStatus {
  id: string
  chapter_number: number
  title: string
  word_count: number | null
  dev_approved: boolean
  line_approved: boolean
  copy_approved: boolean
  has_unresolved_issues: boolean
}

interface State {
  editors: Editor[]
  chapters: ChapterStatus[]
  current_phase_number: number | null
  open_issues_count: number
  total_chapters: number
  approved_for_dev: number
  approved_for_line: number
  approved_for_copy: number
}

// ============================================================================
// Page
// ============================================================================

export default function AuthorStudioTabPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const [state, setState] = useState<State | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/author-studio/state`)
        if (!res.ok) throw new Error(`Failed to load (${res.status})`)
        const json = await res.json() as State
        if (!cancelled) setState(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [projectId])

  const activeEditor = useMemo(
    () => state?.editors.find(e => e.status === 'active') ?? null,
    [state]
  )

  if (loading) {
    return <p className="p-8 text-sm text-slate-500">Loading…</p>
  }

  if (error || !state) {
    return (
      <div className="p-8 max-w-md">
        <p className="text-sm text-rose-700">{error ?? 'Failed to load.'}</p>
        <Link
          href={`/author-studio?manuscriptId=${projectId}`}
          className="inline-block mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
        >
          Open Author Studio →
        </Link>
      </div>
    )
  }

  const studioHref = `/author-studio?manuscriptId=${projectId}`
  const ctaLabel = activeEditor
    ? `Continue with ${activeEditor.name} →`
    : state.editors.every(e => e.status === 'complete')
      ? 'Open Author Studio →'
      : 'Open Author Studio →'

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto p-6">

        {/* Editor sub-bar */}
        <section className="mb-5">
          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mb-2">
            Working with
          </p>
          <div className="flex flex-wrap gap-2">
            {state.editors.map(editor => (
              <EditorPill key={editor.name} editor={editor} />
            ))}
          </div>
        </section>

        {/* Continue CTA */}
        <section className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href={studioHref}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium"
          >
            {ctaLabel}
          </Link>
          {state.open_issues_count > 0 && (
            <span className="text-xs text-slate-500">
              {state.open_issues_count} open {state.open_issues_count === 1 ? 'issue' : 'issues'} across your chapters
            </span>
          )}
        </section>

        {/* Progress summary */}
        {state.total_chapters > 0 && (
          <section className="mb-8 grid grid-cols-3 gap-3">
            <ProgressCard
              label="Developmental"
              done={state.approved_for_dev}
              total={state.total_chapters}
              color="#639922"
            />
            <ProgressCard
              label="Line"
              done={state.approved_for_line}
              total={state.total_chapters}
              color="#7F77DD"
            />
            <ProgressCard
              label="Copy"
              done={state.approved_for_copy}
              total={state.total_chapters}
              color="#378ADD"
            />
          </section>
        )}

        {/* Chapter status table */}
        {state.chapters.length === 0 ? (
          <section className="bg-slate-50 border border-slate-200 rounded-md p-6 text-center">
            <p className="text-sm text-slate-700 font-medium mb-1">No chapters yet</p>
            <p className="text-xs text-slate-500 mb-4">
              Open Author Studio to upload or build out your manuscript&rsquo;s chapters.
            </p>
            <Link
              href={studioHref}
              className="inline-block px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Open Author Studio →
            </Link>
          </section>
        ) : (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-900">Chapters</h2>
              <p className="text-[11px] text-slate-500">
                D · L · C indicate approvals from Alex, Sam, and Jordan
              </p>
            </div>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-slate-500 w-12">#</th>
                    <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-slate-500">Title</th>
                    <th className="text-right px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-slate-500 w-24">Words</th>
                    <th className="text-center px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-slate-500 w-32">D · L · C</th>
                    <th className="text-right px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-slate-500 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {state.chapters.map(ch => (
                    <tr key={ch.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-500 text-xs">
                        {ch.chapter_number === 0 ? 'P' : ch.chapter_number}
                      </td>
                      <td className="px-3 py-2 text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{ch.title}</span>
                          {ch.has_unresolved_issues && (
                            <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" title="Unresolved issues" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-500 text-xs">
                        {ch.word_count ? ch.word_count.toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ApprovalDot done={ch.dev_approved} color="#639922" letter="D" />
                          <ApprovalDot done={ch.line_approved} color="#7F77DD" letter="L" />
                          <ApprovalDot done={ch.copy_approved} color="#378ADD" letter="C" />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`${studioHref}&chapterId=${ch.id}`}
                          className="text-xs text-slate-600 hover:text-slate-900"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footnote */}
        <p className="mt-6 text-xs text-slate-500 leading-relaxed max-w-md">
          The full editing experience — chapter editor, issue panel, real-time chat with {activeEditor?.name ?? 'your editor'} — opens in your existing Author Studio. We&rsquo;re integrating it into the project shell in a future pass; for now this is the bridge.
        </p>

      </div>
    </div>
  )
}

// ============================================================================
// Editor pill — Alex / Sam / Jordan with their state
// ============================================================================

function EditorPill({ editor }: { editor: Editor }) {
  const baseAvatar = 'w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0'
  const avatar = (
    <div className={baseAvatar} style={{ background: editor.color }}>
      {editor.name.charAt(0)}
    </div>
  )

  if (editor.status === 'complete') {
    return (
      <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
        {avatar}
        <span className="text-xs text-slate-700 font-medium">{editor.name}</span>
        <span className="text-[11px] text-emerald-700">{editor.role} ✓</span>
      </div>
    )
  }

  if (editor.status === 'active') {
    return (
      <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-blue-50 border border-blue-200">
        {avatar}
        <span className="text-xs text-slate-900 font-medium">{editor.name}</span>
        <span className="text-[11px] text-blue-700">{editor.role}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-slate-50 border border-slate-200 opacity-70">
      {avatar}
      <span className="text-xs text-slate-700">{editor.name}</span>
      <span className="text-[11px] text-slate-500">{editor.role}</span>
    </div>
  )
}

// ============================================================================
// Progress card — N of M chapters complete for one editor
// ============================================================================

function ProgressCard({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="bg-white border border-slate-200 rounded-md p-3">
      <p className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-base font-medium text-slate-900 mb-2">
        {done} <span className="text-slate-400 font-normal text-sm">of {total}</span>
      </p>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Approval dot — a small letter pill that shows whether an editor approved
// a specific chapter
// ============================================================================

function ApprovalDot({ done, color, letter }: { done: boolean; color: string; letter: string }) {
  if (done) {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-medium"
        style={{ background: color }}
        title={`${letter} approved`}
      >
        {letter}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-200 text-slate-400 text-[10px] font-medium"
      title={`${letter} not yet approved`}
    >
      {letter}
    </span>
  )
}
