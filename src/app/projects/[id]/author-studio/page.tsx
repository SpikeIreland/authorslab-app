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
    return <p className="p-8 text-sm text-muted">Loading…</p>
  }

  if (error || !state) {
    return (
      <div className="p-8 max-w-md">
        <p className="text-sm text-status-high">{error ?? 'Failed to load.'}</p>
        <Link
          href={`/author-studio?manuscriptId=${projectId}`}
          className="inline-block mt-4 px-4 py-2 bg-sage-deep hover:bg-sage-deep/90 text-white rounded-md text-sm font-medium"
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
          <p className="text-[10px] uppercase tracking-wider font-medium text-faint mb-2">
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
            className="px-4 py-2 bg-sage-deep hover:bg-sage-deep/90 text-white rounded-md text-sm font-medium"
          >
            {ctaLabel}
          </Link>
          {state.open_issues_count > 0 && (
            <span className="text-xs text-muted">
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
              color="#4A8340"
            />
            <ProgressCard
              label="Line"
              done={state.approved_for_line}
              total={state.total_chapters}
              color="#D08A4F"
            />
            <ProgressCard
              label="Copy"
              done={state.approved_for_copy}
              total={state.total_chapters}
              color="#0B7A5C"
            />
          </section>
        )}

        {/* Chapter status table */}
        {state.chapters.length === 0 ? (
          <section className="bg-ivory border border-line rounded-md p-6 text-center">
            <p className="text-sm text-ink font-medium mb-1">No chapters yet</p>
            <p className="text-xs text-muted mb-4">
              Open Author Studio to upload or build out your manuscript&rsquo;s chapters.
            </p>
            <Link
              href={studioHref}
              className="inline-block px-3 py-1.5 border border-line rounded-md text-xs font-medium text-ink hover:bg-paper-warm"
            >
              Open Author Studio →
            </Link>
          </section>
        ) : (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-medium text-ink">Chapters</h2>
              <p className="text-[11px] text-muted">
                D · L · C indicate approvals from Alex, Sam, and Jordan
              </p>
            </div>
            <div className="border border-line rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ivory border-b border-line">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted w-12">#</th>
                    <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted">Title</th>
                    <th className="text-right px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted w-24">Words</th>
                    <th className="text-center px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted w-32">D · L · C</th>
                    <th className="text-right px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {state.chapters.map(ch => (
                    <tr key={ch.id} className="border-t border-line-soft hover:bg-paper-warm">
                      <td className="px-3 py-2 text-muted text-xs">
                        {ch.chapter_number === 0 ? 'P' : ch.chapter_number}
                      </td>
                      <td className="px-3 py-2 text-ink">
                        <div className="flex items-center gap-2">
                          <span>{ch.title}</span>
                          {ch.has_unresolved_issues && (
                            <span className="inline-block w-1.5 h-1.5 bg-status-warn rounded-full" title="Unresolved issues" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-muted text-xs">
                        {ch.word_count ? ch.word_count.toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <ApprovalDot done={ch.dev_approved} color="#4A8340" letter="D" />
                          <ApprovalDot done={ch.line_approved} color="#D08A4F" letter="L" />
                          <ApprovalDot done={ch.copy_approved} color="#0B7A5C" letter="C" />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`${studioHref}&chapterId=${ch.id}`}
                          className="text-xs text-muted hover:text-ink"
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
        <p className="mt-6 text-xs text-muted leading-relaxed max-w-md">
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
      <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-sage-bg border border-sage-deep/40">
        {avatar}
        <span className="text-xs text-ink font-medium">{editor.name}</span>
        <span className="text-[11px] text-sage-deep">{editor.role} ✓</span>
      </div>
    )
  }

  if (editor.status === 'active') {
    return (
      <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-sage-bg border border-sage">
        {avatar}
        <span className="text-xs text-ink font-medium">{editor.name}</span>
        <span className="text-[11px] text-sage-deep">{editor.role}</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 pl-1 pr-3 py-0.5 rounded-full bg-ivory border border-line opacity-70">
      {avatar}
      <span className="text-xs text-ink">{editor.name}</span>
      <span className="text-[11px] text-muted">{editor.role}</span>
    </div>
  )
}

// ============================================================================
// Progress card — N of M chapters complete for one editor
// ============================================================================

function ProgressCard({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="bg-white border border-line rounded-md p-3">
      <p className="text-[10px] uppercase tracking-wider font-medium text-muted mb-1">{label}</p>
      <p className="text-base font-medium text-ink mb-2">
        {done} <span className="text-faint font-normal text-sm">of {total}</span>
      </p>
      <div className="h-1.5 bg-paper-warm rounded-full overflow-hidden">
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
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-line text-faint text-[10px] font-medium"
      title={`${letter} not yet approved`}
    >
      {letter}
    </span>
  )
}
