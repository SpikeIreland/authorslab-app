'use client'

export const dynamic = 'force-dynamic'

/**
 * THE COVER STUDIO — publisher side · /publisher/[projectId]/cover
 *
 * Paul's framing: one shared surface that renders differently for each party.
 * This is the publisher's render. The author's Design tab — generation, the
 * composer, the concept lifecycle — belongs to `design` and is untouched here;
 * this page reads the same assets and the same selection column, and adds the
 * one thing only a publisher does: decide.
 *
 * "Flip between design ideas" is the interaction Paul asked for: every concept
 * is clickable and becomes the large view, so a publisher can put two
 * directions side by side in their own eye before committing.
 *
 * ─── Honest about what is real ───────────────────────────────────────────────
 * Artwork and the author's selection are REAL, read through the publisher
 * route. The decision and the note to the designer are session-only — there is
 * no publisher-approval row and no publisher-notes table yet (both couriered).
 * So nothing here claims the designer has been notified, because they haven't.
 */

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { VIEWING_FIRM } from '../../_data/firm'
// ─── 1. Types ─────────────────────────────────────────────────────────────────

interface PublisherCover {
  id: string
  url: string | null
  kind: string | null
  layout: string | null
  createdAt: string
  isSelected: boolean
}

type Decision = 'undecided' | 'approved' | 'revisions'

// ─── 2. Page ──────────────────────────────────────────────────────────────────

export default function CoverStudioPage() {
  const params = useParams<{ projectId: string }>()
  const router = useRouter()
  const projectId = params?.projectId ?? ''

  const [covers, setCovers] = useState<PublisherCover[] | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [decision, setDecision] = useState<Decision>('undecided')
  const [notes, setNotes] = useState<{ id: string; body: string }[]>([])
  const [draft, setDraft] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!projectId) return
      try {
        const res = await fetch(
          `/api/publisher/projects/${projectId}/covers?include=all`
        )
        if (cancelled) return
        if (!res.ok) {
          setFailed(true)
          setCovers([])
          return
        }
        const json = (await res.json()) as { covers?: PublisherCover[] }
        if (cancelled) return
        const list = (json.covers ?? []).filter((c) => c.url)
        setCovers(list)
        const sel = list.find((c) => c.isSelected) ?? list[0] ?? null
        setViewingId(sel?.id ?? null)
      } catch {
        if (!cancelled) {
          setFailed(true)
          setCovers([])
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [projectId])

  const { portraits, jackets, selected, viewing } = useMemo(() => {
    const all = covers ?? []
    return {
      portraits: all.filter((c) => c.layout !== 'wraparound'),
      jackets: all.filter((c) => c.layout === 'wraparound'),
      selected: all.find((c) => c.isSelected) ?? null,
      viewing: all.find((c) => c.id === viewingId) ?? null,
    }
  }, [covers, viewingId])

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#3F3F3F]">
      <StudioHeader onBack={() => router.push(`/publisher/${projectId}`)} />

      <main className="max-w-[1200px] mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="text-[11px] tracking-[0.16em] uppercase text-[#8A8A8A]">
            Cover
          </div>
          <h1
            className="text-[34px] leading-tight text-[#1A1A1A] mt-1"
            style={{ fontFamily: 'Iowan Old Style, Palatino, Georgia, serif' }}
          >
            The cover studio
          </h1>
        </div>

        {covers === null ? (
          <div className="py-20 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#E8E5E0] border-t-[#1E3A5F] rounded-full animate-spin" />
          </div>
        ) : covers.length === 0 ? (
          <EmptyStudio failed={failed} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-10 items-start">
            <div>
              <LargeView cover={viewing} selectedId={selected?.id ?? null} />

              <ConceptRow
                label="Concepts"
                covers={portraits}
                viewingId={viewingId}
                onView={setViewingId}
              />

              {jackets.length > 0 && (
                <ConceptRow
                  label="Full jacket"
                  covers={jackets}
                  viewingId={viewingId}
                  onView={setViewingId}
                  wide
                />
              )}
            </div>

            <DecisionPanel
              hasSelection={selected !== null}
              decision={decision}
              onDecision={setDecision}
              notes={notes}
              draft={draft}
              onDraft={setDraft}
              onAddNote={() => {
                const body = draft.trim()
                if (!body) return
                setNotes((prev) => [
                  ...prev,
                  { id: Math.random().toString(36).slice(2), body },
                ])
                setDraft('')
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}

// ─── 3. Chrome ────────────────────────────────────────────────────────────────

function StudioHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="border-b border-[#E8E5E0] bg-white">
      <div className="max-w-[1200px] mx-auto px-8 py-4 flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#1E3A5F] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 rounded-[3px] px-1"
        >
          &larr; Back to the project
        </button>
        <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A]">
          Cover studio
        </div>
        <div className="flex items-center gap-3 px-3.5 py-1.5 border border-[#E8E5E0] rounded-full bg-[#FAFAF8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F]" aria-hidden />
          <span className="text-[12px] text-[#1A1A1A]">{VIEWING_FIRM}</span>
        </div>
      </div>
    </header>
  )
}

function EmptyStudio({ failed }: { failed: boolean }) {
  return (
    <div className="py-16 text-center max-w-[520px] mx-auto">
      <p className="text-[15px] text-[#3F3F3F] leading-relaxed">
        {failed
          ? 'The cover artwork could not be loaded just now. Please try again.'
          : 'Cover design hasn’t started on this book yet. Taylor’s concepts will appear here for the author to choose from, and for you to approve.'}
      </p>
    </div>
  )
}

// ─── 4. The large view ────────────────────────────────────────────────────────

function LargeView({
  cover,
  selectedId,
}: {
  cover: PublisherCover | null
  selectedId: string | null
}) {
  if (!cover) return null
  const isTheSelection = cover.id === selectedId
  const wide = cover.layout === 'wraparound'

  return (
    <div>
      <div
        className={`bg-white border border-[#E8E5E0] rounded-[4px] overflow-hidden ${
          wide ? 'max-w-full' : 'max-w-[380px]'
        }`}
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover.url ?? ''}
          alt={isTheSelection ? "The author's selected cover" : 'Cover concept'}
          className={`w-full block ${wide ? 'aspect-[2/1] object-contain bg-[#FAFAF8]' : 'aspect-[2/3] object-cover'}`}
        />
      </div>
      <div className="mt-3 text-[13px]">
        {isTheSelection ? (
          <span className="text-[#1E3A5F]">
            Selected by the author &mdash; awaiting your approval
          </span>
        ) : wide ? (
          <span className="text-[#8A8A8A]">Full jacket &mdash; front, spine and back</span>
        ) : (
          <span className="text-[#8A8A8A]">A concept the author did not select</span>
        )}
      </div>
    </div>
  )
}

// ─── 5. Concept rows — click to flip the large view ───────────────────────────

function ConceptRow({
  label,
  covers,
  viewingId,
  onView,
  wide = false,
}: {
  label: string
  covers: PublisherCover[]
  viewingId: string | null
  onView: (id: string) => void
  wide?: boolean
}) {
  if (covers.length === 0) return null
  return (
    <div className="mt-8">
      <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-3">
        {covers.map((c) => {
          const active = c.id === viewingId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onView(c.id)}
              aria-pressed={active}
              className={`rounded-[3px] overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 ${
                active ? 'border-[#1E3A5F]' : 'border-transparent hover:border-[#B8B8B8]'
              }`}
              style={{ width: wide ? 168 : 84 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.url ?? ''}
                alt=""
                className={`w-full block ${wide ? 'aspect-[2/1] object-cover' : 'aspect-[2/3] object-cover'}`}
              />
              {c.isSelected && (
                <div className="text-[10px] text-white bg-[#1E3A5F] text-center py-0.5">
                  Author&rsquo;s choice
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── 6. The publisher's decision ──────────────────────────────────────────────

function DecisionPanel({
  hasSelection,
  decision,
  onDecision,
  notes,
  draft,
  onDraft,
  onAddNote,
}: {
  hasSelection: boolean
  decision: Decision
  onDecision: (d: Decision) => void
  notes: { id: string; body: string }[]
  draft: string
  onDraft: (v: string) => void
  onAddNote: () => void
}) {
  return (
    <aside className="bg-white border border-[#E8E5E0] rounded-[4px] p-6">
      <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
        Your decision
      </div>

      <p className="text-[14px] leading-relaxed text-[#3F3F3F] mb-5">
        {hasSelection
          ? 'The author has chosen a cover. It carries your imprint if you approve it.'
          : 'The author has not chosen a cover yet. You can still leave the designer a note.'}
      </p>

      {decision === 'approved' && (
        <div className="mb-4 text-[13px] text-[#2E4A3C] border border-[#2E4A3C]/30 bg-[#2E4A3C]/5 px-3.5 py-2.5 rounded-[3px]">
          Approved
        </div>
      )}
      {decision === 'revisions' && (
        <div className="mb-4 text-[13px] text-[#8A5A2B] border border-[#8A5A2B]/30 bg-[#8A5A2B]/5 px-3.5 py-2.5 rounded-[3px]">
          Revisions requested
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={!hasSelection || decision === 'approved'}
          onClick={() => onDecision('approved')}
          className="text-[13px] px-4 py-2.5 rounded-[3px] border border-[#1E3A5F] text-white bg-[#1E3A5F] hover:bg-[#17304F] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/40"
        >
          Approve this cover
        </button>
        <button
          type="button"
          disabled={!hasSelection || decision === 'approved'}
          onClick={() => onDecision('revisions')}
          className="text-[13px] px-4 py-2.5 rounded-[3px] border border-[#E8E5E0] text-[#3F3F3F] hover:bg-[#F7F7F5] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
        >
          Request revisions
        </button>
      </div>

      <div className="mt-7 pt-6 border-t border-[#E8E5E0]">
        <div className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] mb-3">
          Notes to the designer
        </div>

        {notes.length > 0 && (
          <div className="space-y-2.5 mb-4">
            {notes.map((n) => (
              <div
                key={n.id}
                className="text-[13px] leading-[1.55] text-[#2A2A2A] border border-[#E8E5E0] rounded-[3px] px-3 py-2.5"
              >
                {n.body}
              </div>
            ))}
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          rows={4}
          placeholder="A note to Taylor&hellip;"
          className="w-full text-[13px] px-3 py-2.5 border border-[#E8E5E0] rounded-[3px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 focus:border-[#1E3A5F] resize-none"
        />
        <button
          type="button"
          onClick={onAddNote}
          disabled={!draft.trim()}
          className="mt-2.5 w-full text-[13px] px-4 py-2 rounded-[3px] border border-[#E8E5E0] text-[#3F3F3F] hover:bg-[#F7F7F5] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30"
        >
          Add note
        </button>
      </div>
    </aside>
  )
}
