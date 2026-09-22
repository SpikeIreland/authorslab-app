'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthorRow {
  first_name: string | null
  last_name: string | null
}

/**
 * Shape of GET /api/publisher/projects/[id], per sysadmin's contract in
 * handovers/sysadmin-ratifications-and-rulings-2026-09-22.md §2.1.
 *
 * The page used to read Supabase directly from the browser, which meant every
 * query ran under the viewer's RLS — and every policy behind these tables
 * requires the viewer to BE the author. A publisher therefore saw "Project not
 * available". Reading through the server route fixes that by construction.
 *
 * The three `?` fields below are NOT in the contract yet — asked for in
 * handovers/publisher-to-sysadmin-portal-field-ask-2026-09-22.md. Everything
 * renders correctly without them and lights up when they arrive.
 */
interface PhaseRow {
  phase_number: number
  phase_status: string | null
  editor_name: string | null
  chapters_analyzed?: number | null
  chapters_approved?: number | null
}

interface PublisherProject {
  id: string
  title: string
  genre: string | null
  current_word_count: number | null
  current_phase_number: number | null
  status: string | null
  updated_at: string
  author: AuthorRow
  cover_url: string | null
  phases: PhaseRow[]
  total_chapters?: number | null
  created_at?: string
}

interface CoverState {
  status: 'pending' | 'approved' | 'revisions'
  approvedAt: string | null
  revisionsNote: string
  messaging: boolean
  messageDraft: string
  messageSent: boolean
}

interface ThreadMessage {
  id: string
  sender: string
  role: string
  body: string
  when: string
  isSelf?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASE_NAMES: Record<number, string> = {
  1: 'Developmental',
  2: 'Line',
  3: 'Copy',
  4: 'Design',
  5: 'Marketing',
}

const PHASE_EDITORS: Record<number, { name: string; role: string }> = {
  1: { name: 'Alex', role: 'Developmental Editor' },
  2: { name: 'Sam', role: 'Line Editor' },
  3: { name: 'Jordan', role: 'Copy Editor' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatWordCount(n: number | null | undefined): string {
  if (!n) return '—'
  return n.toLocaleString('en-GB')
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublisherPortalPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params?.projectId ?? ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<PublisherProject | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/publisher/projects/${projectId}`)

        if (cancelled) return

        if (res.status === 404) {
          setError('Project not available — check the invitation link.')
          setLoading(false)
          return
        }
        if (!res.ok) {
          // A server-side failure is NOT a bad link, and must not be reported
          // as one — that was the original defect in a different costume.
          setError('Something went wrong loading the project. Please try again.')
          setLoading(false)
          return
        }

        const json = (await res.json()) as { project?: PublisherProject }
        if (cancelled) return

        if (!json.project) {
          setError('Something went wrong loading the project. Please try again.')
          setLoading(false)
          return
        }

        setProject(json.project)
        setLoading(false)
      } catch {
        if (cancelled) return
        setError('Something went wrong loading the project. Please try again.')
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F]">
      <PortalHeader />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : project ? (
        <PortalBody project={project} />
      ) : null}

      <PortalFooter />
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PortalHeader() {
  return (
    <header className="border-b border-[#E8E5E0] bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
        <div>
          <div
            className="text-[22px] leading-tight text-[#1A1A1A]"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            Publisher Portal
          </div>
          <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mt-1">
            AuthorsLab
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 border border-[#E8E5E0] rounded-full bg-[#FAFAF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F]" aria-hidden />
          <span className="text-[12px] text-[#8A8A8A]">Publisher:</span>
          <span className="text-[13px] text-[#1A1A1A] font-medium">[Your firm]</span>
        </div>
      </div>
    </header>
  )
}

function PortalFooter() {
  return (
    <footer className="mt-16 border-t border-[#E8E5E0] bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-6 text-[12px] text-[#8A8A8A] flex items-center justify-between">
        <div>Private preview — do not share.</div>
        <div>AuthorsLab · Publisher Portal</div>
      </div>
    </footer>
  )
}

// ─── States ───────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 py-24 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#E8E5E0] border-t-[#1E3A5F] rounded-full animate-spin" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-[720px] mx-auto px-8 py-24 text-center">
      <div
        className="text-[28px] text-[#1A1A1A] mb-3"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        Project not available
      </div>
      <p className="text-[15px] text-[#3F3F3F]">{message}</p>
    </div>
  )
}

// ─── Body ─────────────────────────────────────────────────────────────────────

function PortalBody({ project }: { project: PublisherProject }) {
  const authorName =
    `${project.author.first_name ?? ''} ${project.author.last_name ?? ''}`.trim() ||
    'the author'
  const authorFirst = project.author.first_name || 'the author'
  const phaseNum = project.current_phase_number ?? 1
  const phaseName = PHASE_NAMES[phaseNum] ?? 'Developmental'

  return (
    <>
      {/* Sub-header strip */}
      <div className="border-b border-[#E8E5E0] bg-white/60">
        <div className="max-w-[1200px] mx-auto px-8 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px] text-[#8A8A8A]">
          <span
            className="text-[#1A1A1A]"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            <em>{project.title}</em>
          </span>
          <span>by {authorName}</span>
          <span aria-hidden>·</span>
          <span>{formatWordCount(project.current_word_count)} words</span>
          <span aria-hidden>·</span>
          <span>{project.genre ?? '—'}</span>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-8 py-10 space-y-10">
        <ProjectHeaderCard
          project={project}
          authorName={authorName}
          phaseName={phaseName}
          phaseNum={phaseNum}
        />
        <EditorialStatusSection phases={project.phases} />
        <CoverProposalsSection />
        <MarketingPlanSection />
        <PublishingRouteSection />
        <CommunicationsThreadSection authorFirst={authorFirst} phases={project.phases} />
      </main>
    </>
  )
}

// ─── Section chrome ───────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] tracking-[0.16em] uppercase text-[#8A8A8A]">{eyebrow}</div>
      <h2
        className="text-[24px] text-[#1A1A1A] mt-1"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        {title}
      </h2>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-[#E8E5E0] rounded-[4px] ${className}`}
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}
    >
      {children}
    </div>
  )
}

// ─── 1. Project header card ───────────────────────────────────────────────────

function ProjectHeaderCard({
  project,
  authorName,
  phaseName,
  phaseNum,
}: {
  project: PublisherProject
  authorName: string
  phaseName: string
  phaseNum: number
}) {
  return (
    <Card className="p-10">
      <div className="text-[11px] tracking-[0.16em] uppercase text-[#8A8A8A] mb-3">
        Project overview
      </div>
      <h1
        className="text-[42px] leading-[1.1] text-[#1A1A1A] mb-3"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        {project.title}
      </h1>
      <div
        className="text-[17px] text-[#3F3F3F] italic mb-6"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        by {authorName}
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-4 text-[14px]">
        <MetaField label="Genre" value={project.genre ?? '—'} />
        <MetaField label="Word count" value={formatWordCount(project.current_word_count)} />
        {typeof project.total_chapters === 'number' && (
          <MetaField label="Chapters" value={String(project.total_chapters)} />
        )}
        <MetaField label="Current phase" value={`Phase ${phaseNum} — ${phaseName}`} />
      </div>

      <div className="mt-8 pt-6 border-t border-[#E8E5E0] text-[13px] text-[#8A8A8A]">
        {project.created_at
          ? `Invited by author on ${formatDate(project.created_at)}`
          : `Last activity ${formatDate(project.updated_at)}`}
      </div>
    </Card>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-1">{label}</div>
      <div className="text-[15px] text-[#1A1A1A]">{value}</div>
    </div>
  )
}

// ─── 2. Editorial status ──────────────────────────────────────────────────────

function EditorialStatusSection({ phases }: { phases: PhaseRow[] }) {
  const stepData = [1, 2, 3].map((n) => {
    const p = phases.find((row) => row.phase_number === n)
    const editor = PHASE_EDITORS[n]

    // Phase state comes from phase_status — the orchestrator's own field and
    // the single source of truth per the editing_phases table comment. The
    // page previously inferred it by counting chapter approval timestamps,
    // which the publisher-facing route deliberately does not expose.
    let status: 'pending' | 'in-progress' | 'complete' = 'pending'
    if (p?.phase_status === 'complete') status = 'complete'
    else if (p?.phase_status === 'active') status = 'in-progress'

    // Counts render ONLY when the route supplies them. Until then the step
    // shows its state and its editor, and says nothing it cannot support.
    const analyzed = p?.chapters_analyzed ?? null
    const approved = p?.chapters_approved ?? null

    return {
      number: n,
      editor: p?.editor_name || editor.name,
      role: editor.role,
      analyzed,
      approved,
      status,
    }
  })

  return (
    <section>
      <SectionHeading eyebrow="Editorial status" title="Where we are in the process" />
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stepData.map((s, i) => (
            <div key={s.number} className="relative">
              {i < stepData.length - 1 && (
                <div
                  className="hidden md:block absolute top-3 left-full w-full h-px bg-[#E8E5E0]"
                  aria-hidden
                />
              )}
              <StatusStep step={s} />
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E5E0] flex items-center justify-between">
          <div className="text-[13px] text-[#8A8A8A]">
            Editorial state reflects the latest pass by each editor.
          </div>
          <a
            href="#"
            className="text-[13px] text-[#1E3A5F] border border-[#E8E5E0] px-4 py-2 rounded-[3px] hover:bg-[#F7F7F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
          >
            Read the current draft &rarr;
          </a>
        </div>
      </Card>
    </section>
  )
}

function StatusStep({
  step,
}: {
  step: {
    number: number
    editor: string
    role: string
    analyzed: number | null
    approved: number | null
    status: 'pending' | 'in-progress' | 'complete'
  }
}) {
  const dotClass =
    step.status === 'complete'
      ? 'bg-[#1E3A5F]'
      : step.status === 'in-progress'
        ? 'bg-white border-2 border-[#1E3A5F]'
        : 'bg-white border-2 border-[#B8B8B8]'

  const statusLabel =
    step.status === 'complete'
      ? 'Complete'
      : step.status === 'in-progress'
        ? 'In progress'
        : 'Not yet started'

  return (
    <div className="pr-6">
      <div className="flex items-center gap-3 mb-3">
        <span className={`w-3 h-3 rounded-full ${dotClass}`} aria-hidden />
        <span className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Phase {step.number}
        </span>
      </div>
      <div
        className="text-[18px] text-[#1A1A1A] mb-1"
        style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
      >
        {step.editor}
      </div>
      <div className="text-[13px] text-[#8A8A8A] mb-3">{step.role}</div>
      {step.approved !== null && step.analyzed !== null && (
        <div className="text-[13px] text-[#3F3F3F]">
          {step.approved} of {step.analyzed} chapters approved
        </div>
      )}
      <div className="text-[12px] text-[#8A8A8A] mt-1">{statusLabel}</div>
    </div>
  )
}

// ─── 3. Cover proposals ───────────────────────────────────────────────────────

function CoverProposalsSection() {
  const covers = [
    {
      id: 'A' as const,
      label: 'Cover A',
      note: 'Restrained genre entry — signals literary sci-fi.',
      designer: 'Taylor — AuthorsLab design',
    },
    {
      id: 'B' as const,
      label: 'Cover B',
      note: 'Signals speculative; hooks the sci-fi shelf browser.',
      designer: 'Taylor — AuthorsLab design',
    },
    {
      id: 'C' as const,
      label: 'Cover C',
      note: 'Warmest option; hints at the character journey.',
      designer: 'Taylor — AuthorsLab design',
    },
  ]

  const [state, setState] = useState<Record<'A' | 'B' | 'C', CoverState>>({
    A: { status: 'pending', approvedAt: null, revisionsNote: '', messaging: false, messageDraft: '', messageSent: false },
    B: { status: 'pending', approvedAt: null, revisionsNote: '', messaging: false, messageDraft: '', messageSent: false },
    C: { status: 'pending', approvedAt: null, revisionsNote: '', messaging: false, messageDraft: '', messageSent: false },
  })

  const update = (id: 'A' | 'B' | 'C', patch: Partial<CoverState>) =>
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  return (
    <section>
      <SectionHeading eyebrow="Cover proposals" title="Three directions to consider" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {covers.map((c) => (
          <Card key={c.id} className="overflow-hidden flex flex-col">
            <CoverArt id={c.id} state={state[c.id]} />

            <div className="p-5 flex-1 flex flex-col">
              <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-1">
                {c.label}
              </div>
              <div className="text-[14px] text-[#1A1A1A] mb-4">{c.note}</div>

              {state[c.id].status === 'approved' && (
                <div className="mb-3 text-[12px] text-[#2E4A3C] border border-[#2E4A3C]/30 bg-[#2E4A3C]/5 px-3 py-2 rounded-[3px]">
                  Approved on {state[c.id].approvedAt}
                </div>
              )}
              {state[c.id].status === 'revisions' && (
                <div className="mb-3 text-[12px] text-[#8A5A2B] border border-[#8A5A2B]/30 bg-[#8A5A2B]/5 px-3 py-2 rounded-[3px]">
                  Revisions requested
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={state[c.id].status === 'approved'}
                  onClick={() =>
                    update(c.id, {
                      status: 'approved',
                      approvedAt: formatDate(new Date().toISOString()),
                    })
                  }
                  className="text-[12px] px-3 py-1.5 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={state[c.id].status === 'approved'}
                  onClick={() => update(c.id, { status: 'revisions' })}
                  className="text-[12px] px-3 py-1.5 rounded-[3px] border border-[#E8E5E0] text-[#3F3F3F] hover:bg-[#F7F7F5] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                >
                  Request revisions
                </button>
                <button
                  type="button"
                  onClick={() => update(c.id, { messaging: !state[c.id].messaging })}
                  className="text-[12px] px-3 py-1.5 rounded-[3px] border border-[#E8E5E0] text-[#3F3F3F] hover:bg-[#F7F7F5] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
                >
                  Message the designer
                </button>
              </div>

              {state[c.id].messaging && (
                <div className="mt-3">
                  <textarea
                    value={state[c.id].messageDraft}
                    onChange={(e) => update(c.id, { messageDraft: e.target.value, messageSent: false })}
                    rows={3}
                    className="w-full text-[13px] px-3 py-2 border border-[#E8E5E0] rounded-[3px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none"
                    placeholder="A note to the designer…"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        update(c.id, { messageDraft: '', messageSent: true })
                      }
                      disabled={!state[c.id].messageDraft.trim()}
                      className="text-[12px] px-3 py-1.5 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                    {state[c.id].messageSent && (
                      <span className="text-[12px] text-[#8A8A8A]">Message sent</span>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#E8E5E0] text-[11px] text-[#8A8A8A]">
                {c.designer}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function CoverArt({ id, state }: { id: 'A' | 'B' | 'C'; state: CoverState }) {
  const approvedOverlay =
    state.status === 'approved' ? (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-[#2E4A3C] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden>
            <path d="M5 12.5l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    ) : null

  if (id === 'A') {
    return (
      <div className="relative w-full aspect-[2/3] overflow-hidden" style={{ background: 'linear-gradient(160deg, #A8B8A0 0%, #8FA48A 55%, #7B9078 100%)' }}>
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div
            className="text-[24px] leading-[1.1] text-[#FAF9F5]"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            The Veil and<br />the Flame
          </div>
          <div className="mt-3 text-[10px] tracking-[0.24em] uppercase text-[#FAF9F5]/80">
            a novel
          </div>
        </div>
        {approvedOverlay}
      </div>
    )
  }
  if (id === 'B') {
    return (
      <div className="relative w-full aspect-[2/3] overflow-hidden" style={{ background: 'linear-gradient(180deg, #1B2A44 0%, #12203A 60%, #0D1930 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 rounded-full border border-[#C6B78E]/40"
            style={{ boxShadow: 'inset 0 0 40px rgba(198,183,142,0.15)' }}
          />
        </div>
        <div className="absolute inset-x-0 top-6 flex justify-center">
          <div className="text-[10px] tracking-[0.28em] uppercase text-[#C6B78E]/70">
            a novel
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-6 flex justify-center px-6">
          <div
            className="text-[22px] leading-[1.05] text-center text-[#FAF9F5] font-semibold tracking-wide uppercase"
            style={{ fontFamily: 'system-ui, -apple-system, "Helvetica Neue", sans-serif', letterSpacing: '0.06em' }}
          >
            The Veil<br />and the<br />Flame
          </div>
        </div>
        {approvedOverlay}
      </div>
    )
  }
  // C
  return (
    <div className="relative w-full aspect-[2/3] overflow-hidden" style={{ background: 'linear-gradient(180deg, #F5EBD8 0%, #EEDFC2 100%)' }}>
      <div className="absolute inset-x-0 top-8 flex justify-center">
        <svg viewBox="0 0 64 96" className="w-16 h-24" aria-hidden>
          <path
            d="M32 8 C 22 26, 46 34, 32 56 C 22 44, 20 68, 32 88 C 44 68, 42 44, 32 56 C 18 34, 42 26, 32 8 Z"
            fill="none"
            stroke="#B44A2B"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center px-6">
        <div
          className="text-[22px] leading-[1.1] text-center text-[#3B2A1E]"
          style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
        >
          The Veil and<br />the Flame
        </div>
        <div className="mt-2 text-[10px] tracking-[0.24em] uppercase text-[#8A6A46]">
          a novel
        </div>
      </div>
      {approvedOverlay}
    </div>
  )
}

// ─── 4. Marketing plan preview ────────────────────────────────────────────────

function MarketingPlanSection() {
  const readers = [
    'Readers of Emily St. John Mandel',
    'Book clubs seeking discussion-ready sci-fi',
    'Sci-fi shelf browsers who read one literary novel a year',
  ]
  const channels = [
    'Independent bookstore ARC campaign',
    'Sci-fi podcast tour (6 shows lined up)',
    'Substack essay series by the author',
    'Book club discussion kit',
  ]
  const comps = [
    'The Ministry for the Future',
    'Sea of Tranquility',
    'How High We Go in the Dark',
  ]

  return (
    <section>
      <SectionHeading eyebrow="Marketing plan" title="How this book reaches readers" />
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-2">
              Positioning
            </div>
            <p
              className="text-[16px] leading-[1.55] text-[#1A1A1A]"
              style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
            >
              Literary sci-fi with strong crossover potential to memoir readers and
              speculative-fiction book clubs.
            </p>

            <div className="mt-6">
              <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
                Target readers
              </div>
              <div className="flex flex-wrap gap-2">
                {readers.map((r) => (
                  <span
                    key={r}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-[#E8E5E0] text-[#3F3F3F] bg-[#FAFAF8]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
              Launch channels
            </div>
            <ul className="space-y-2">
              {channels.map((ch) => (
                <li
                  key={ch}
                  className="text-[14px] text-[#1A1A1A] pl-4 border-l border-[#1E3A5F]/40 py-1"
                >
                  {ch}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
                Comparable titles
              </div>
              <div className="space-y-1.5">
                {comps.map((t) => (
                  <div
                    key={t}
                    className="text-[14px] text-[#3F3F3F] italic"
                    style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E5E0]">
          <a
            href="#"
            className="text-[13px] text-[#1E3A5F] border border-[#E8E5E0] px-4 py-2 rounded-[3px] hover:bg-[#F7F7F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 inline-block"
          >
            Review the full plan →
          </a>
        </div>
      </Card>
    </section>
  )
}

// ─── 5. Publishing route selector ─────────────────────────────────────────────

function PublishingRouteSection() {
  const routes = [
    {
      id: 'traditional',
      title: 'Traditional',
      body:
        'AuthorsLab hands the fully-edited manuscript to your acquisitions team. Publisher owns rights, timeline, and route to market.',
    },
    {
      id: 'hybrid',
      title: 'Hybrid',
      body:
        'Publisher takes rights for print and premium channels; author retains audiobook and Substack rights.',
    },
    {
      id: 'self',
      title: 'Self-Publishing (with publisher endorsement)',
      body:
        'Author publishes independently under an AuthorsLab imprint carrying your firm’s imprimatur.',
    },
  ]

  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <section>
      <SectionHeading eyebrow="Publishing route" title="Choose how this book comes to market" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((r) => {
          const isSelected = selected === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelected(r.id)
                setConfirmed(false)
              }}
              className={`text-left p-6 rounded-[4px] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 ${
                isSelected
                  ? 'bg-white border-[#1E3A5F]'
                  : 'bg-white border-[#E8E5E0] hover:border-[#B8B8B8]'
              }`}
              style={{ boxShadow: isSelected ? 'inset 0 0 0 1px #1E3A5F' : '0 1px 0 rgba(0,0,0,0.02)' }}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 w-4 h-4 rounded-full border ${
                    isSelected ? 'border-[#1E3A5F]' : 'border-[#B8B8B8]'
                  } flex items-center justify-center flex-shrink-0`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />}
                </span>
                <div>
                  <div
                    className="text-[18px] text-[#1A1A1A] mb-2"
                    style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
                  >
                    {r.title}
                  </div>
                  <div className="text-[13px] leading-[1.55] text-[#3F3F3F]">{r.body}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            disabled={confirmed}
            className="text-[13px] px-5 py-2.5 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
          >
            Confirm route
          </button>
          {confirmed && (
            <span className="text-[13px] text-[#8A8A8A]">
              Route confirmed — the author has been notified.
            </span>
          )}
        </div>
      )}
    </section>
  )
}

// ─── 6. Communications thread ─────────────────────────────────────────────────

/**
 * The thread's editor messages are DERIVED from phase_status, not written as
 * fixed copy.
 *
 * Why: the hard-coded seed thread said "Structural pass complete on 32 of 36
 * chapters" and "Sentence-level pass beginning" while the Editorial Status
 * section two blocks above read Complete / Complete / Complete from live data.
 * Both were on screen at once in production. Getting the copy right once would
 * have fixed today's contradiction; deriving it makes the contradiction
 * impossible — constraint over sensor, per House Rules.
 *
 * Note the messages carry NO chapter counts. `manuscripts.total_chapters` (36)
 * and the chapter rows (37) disagree on the demo project, so any number
 * written here could contradict a number rendered elsewhere on the page.
 */

const EDITOR_LINES: Record<
  number,
  { complete: string; active: string; pending: string }
> = {
  1: {
    complete:
      'Developmental pass complete — every chapter signed off. The Chapter 12 timeline question is resolved.',
    active:
      'Structural pass underway. One question outstanding on the Chapter 12 timeline jump — details in the notes doc.',
    pending: 'Ready to begin the developmental pass on this manuscript.',
  },
  2: {
    complete:
      'Line edit complete. The voice holds all the way through; nothing structural outstanding.',
    active: 'Sentence-level pass in progress. Voice profile is strong and consistent.',
    pending: 'Queued behind the developmental pass.',
  },
  3: {
    complete: 'Copy pass complete and proofed. Clean manuscript, ready for your read.',
    active: 'Copy pass in progress — consistency and house style.',
    pending: 'Queued behind the line edit.',
  },
}

const RELATIVE_WHEN: Record<number, string> = {
  1: '3 weeks ago',
  2: '2 weeks ago',
  3: '6 days ago',
}

function CommunicationsThreadSection({
  authorFirst,
  phases,
}: {
  authorFirst: string
  phases: PhaseRow[]
}) {
  const initial: ThreadMessage[] = useMemo(() => {
    const editorMessages: ThreadMessage[] = [1, 2, 3].map((n) => {
      const p = phases.find((row) => row.phase_number === n)
      const lines = EDITOR_LINES[n]
      const body =
        p?.phase_status === 'complete'
          ? lines.complete
          : p?.phase_status === 'active'
            ? lines.active
            : lines.pending

      return {
        id: `phase-${n}`,
        sender: p?.editor_name || PHASE_EDITORS[n].name,
        role: PHASE_EDITORS[n].role,
        body,
        when: RELATIVE_WHEN[n],
      }
    })

    return [
      ...editorMessages,
      {
        id: 'seed-author',
        sender: authorFirst,
        role: 'Author',
        body:
          'Grateful to have your team in the loop. Happy to jump on a call to walk through the cover proposals.',
        when: 'yesterday',
      },
    ]
  }, [authorFirst, phases])

  const [messages, setMessages] = useState<ThreadMessage[]>(initial)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    setMessages(initial)
  }, [initial])

  function send() {
    const body = draft.trim()
    if (!body) return
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        sender: 'You',
        role: 'Publisher',
        body,
        when: 'just now',
        isSelf: true,
      },
    ])
    setDraft('')
  }

  return (
    <section>
      <SectionHeading eyebrow="Communications" title="Thread with the editorial team" />
      <Card className="p-8">
        <div className="space-y-5">
          {messages.map((m) => (
            <ThreadBubble key={m.id} m={m} />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E5E0]">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Write a message to the team&hellip;"
            className="w-full text-[14px] px-4 py-3 border border-[#E8E5E0] rounded-[3px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="text-[13px] px-5 py-2 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
            >
              Send
            </button>
          </div>
        </div>
      </Card>
    </section>
  )
}

function ThreadBubble({ m }: { m: ThreadMessage }) {
  const initial = m.sender.charAt(0).toUpperCase()
  return (
    <div className="flex gap-4">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-medium ${
          m.isSelf
            ? 'bg-[#1E3A5F] text-white'
            : 'bg-[#F7F7F5] text-[#3F3F3F] border border-[#E8E5E0]'
        }`}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[14px] text-[#1A1A1A] font-medium">{m.sender}</span>
          <span className="text-[12px] text-[#8A8A8A]">{m.role}</span>
          <span className="text-[12px] text-[#B8B8B8] ml-auto">{m.when}</span>
        </div>
        <div className="text-[14px] leading-[1.6] text-[#3F3F3F]">{m.body}</div>
      </div>
    </div>
  )
}
