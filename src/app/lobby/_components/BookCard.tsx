'use client'

/**
 * BookCard — Library book card per AL-UX-004 §3.
 *
 * Composition:
 *   [ small typeset cover ] [ title + genre/words/updated ]
 *                           [ mini journey spine ]
 *                           [ Next line: persona avatar + sentence + Open → ]
 *
 * The card body is a Link to /projects/[id] — the "Open →" is a visual cue,
 * not a separate target.
 *
 * Top-right of the card carries a 3-dot menu (⋯) with per-card actions.
 * Currently only "Edit title" — the menu is deliberately kept as a menu
 * (not a single icon) so we can add more actions later (Archive, Duplicate,
 * Book settings, etc.) without another design pass.
 *
 * Edit title flow: menu → modal → local Supabase update → optimistic
 * parent state update via onTitleUpdate callback.
 */

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type LobbyProject,
  deriveStageStates,
  editorForPhase,
  activePersonaFor,
  nextActionFor,
  openHrefFor,
  relativeTime,
} from './derivations'
import { BookCover } from './BookCover'
import { MiniJourneySpine } from './MiniJourneySpine'
import { PersonaAvatar } from './PersonaAvatar'

interface BookCardProps {
  project: LobbyProject
  launched?: boolean
  onTitleUpdate?: (id: string, newTitle: string) => void
}

export function BookCard({ project, launched, onTitleUpdate }: BookCardProps) {
  const states = deriveStageStates(project)
  const editor = editorForPhase(project.current_phase_number)
  const persona = activePersonaFor(project)
  const next = nextActionFor(project)
  const href = openHrefFor(project)
  const updated = relativeTime(project.updated_at)

  const wordCount = project.word_count ? `${project.word_count.toLocaleString()} words` : null
  const meta = [project.genre, wordCount].filter(Boolean).join(' · ')

  // Live stage detail — e.g. "Line edit · Sam". If no live stage, no detail.
  const activeDetail = launched
    ? null
    : project.status === 'ghostwriting'
      ? 'Drafting with Eliot'
      : editor
        ? `${labelForActivePhase(project.current_phase_number)} · ${editor}`
        : null

  // ── Menu + modal state ────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState(project.title)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const menuWrapRef = useRef<HTMLDivElement | null>(null)

  // Close the popover on outside click.
  useEffect(() => {
    if (!menuOpen) return
    function onDocumentMouseDown(event: MouseEvent) {
      if (menuWrapRef.current && !menuWrapRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocumentMouseDown)
    return () => document.removeEventListener('mousedown', onDocumentMouseDown)
  }, [menuOpen])

  // Close modal on ESC.
  useEffect(() => {
    if (!modalOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) setModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, saving])

  const openEditModal = useCallback(() => {
    setTitleDraft(project.title)
    setSaveError(null)
    setMenuOpen(false)
    setModalOpen(true)
  }, [project.title])

  const closeModal = useCallback(() => {
    if (saving) return
    setModalOpen(false)
    setSaveError(null)
  }, [saving])

  const handleSave = useCallback(async () => {
    const newTitle = titleDraft.trim()
    if (!newTitle) {
      setSaveError('Title cannot be empty.')
      return
    }
    if (newTitle === project.title) {
      setModalOpen(false)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('manuscripts')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', project.id)
      if (error) throw error
      onTitleUpdate?.(project.id, newTitle)
      setModalOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [titleDraft, project.title, project.id, onTitleUpdate])

  return (
    <>
      <div className="relative">
        <Link
          href={href}
          className="group block rounded-lg transition-shadow"
          style={{
            background: 'var(--color-paper)',
            border: '1px solid var(--color-line)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <article className="p-5 flex gap-5">
            <BookCover
              id={project.id}
              title={project.title}
              coverUrl={project.cover_url}
              size="small"
            />

            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Title row — extra right padding so the 3-dot button never
                  overlaps the timestamp on narrow cards. */}
              <div className="flex items-baseline justify-between gap-3 pr-8">
                <h2
                  className="text-[19px] leading-tight truncate"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
                >
                  {project.title}
                </h2>
                <span
                  className="text-[11px] whitespace-nowrap"
                  style={{
                    color: launched ? 'var(--color-sage-deep)' : 'var(--color-muted)',
                    fontWeight: launched ? 500 : 400,
                  }}
                >
                  {launched ? '✓ Launched' : updated}
                </span>
              </div>

              {/* Meta */}
              {meta && (
                <p className="text-[12px] -mt-1.5" style={{ color: 'var(--color-muted)' }}>
                  {meta}
                </p>
              )}

              {/* Mini journey spine + live detail */}
              <MiniJourneySpine states={states} activeDetail={activeDetail ?? undefined} />

              {/* Next line */}
              <div
                className="flex items-center justify-between gap-3 pt-3"
                style={{ borderTop: '1px solid var(--color-line-soft)' }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <PersonaAvatar persona={persona} size={22} />
                  <p className="text-[13px] truncate" style={{ color: 'var(--color-ink)' }}>
                    {next}
                  </p>
                </div>
                <span
                  className="text-[12px] font-medium whitespace-nowrap transition-transform group-hover:translate-x-0.5"
                  style={{ color: 'var(--color-sage-deep)' }}
                >
                  {href.startsWith('/author-studio') ? 'Pick up where you left off' : 'Open'} →
                </span>
              </div>
            </div>
          </article>
        </Link>

        {/* 3-dot menu — sibling to Link so clicks don't propagate to the card. */}
        <div ref={menuWrapRef} className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            }}
            aria-label="Book options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              color: menuOpen ? 'var(--color-ink)' : 'var(--color-muted)',
              background: menuOpen ? 'rgba(0,0,0,0.04)' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="3" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13" cy="8" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute top-full right-0 mt-1 min-w-[9rem] rounded-md overflow-hidden"
              style={{
                background: 'var(--color-paper)',
                border: '1px solid var(--color-line)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation()
                  openEditModal()
                }}
                className="block w-full text-left px-3 py-2 text-[13px] transition-colors"
                style={{ color: 'var(--color-ink)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-ivory)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Edit title
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit title modal — at page level (fragment) so the fixed overlay
          isn't clipped by any parent's overflow. */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`edit-title-heading-${project.id}`}
        >
          <div
            className="w-full max-w-md rounded-lg overflow-hidden"
            style={{
              background: 'var(--color-paper)',
              border: '1px solid var(--color-line)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.16)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-5 border-b" style={{ borderColor: 'var(--color-line)' }}>
              <h2
                id={`edit-title-heading-${project.id}`}
                className="text-[18px] leading-tight"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-ink)' }}
              >
                Edit book title
              </h2>
              <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                The title threads through editorial reports, the cover brief and the marketing plan.
                Change it thoughtfully.
              </p>
            </div>

            <div className="p-5">
              <label
                htmlFor={`edit-title-input-${project.id}`}
                className="block text-[11px] uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-muted)', letterSpacing: '0.08em' }}
              >
                Title
              </label>
              <input
                id={`edit-title-input-${project.id}`}
                type="text"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSave()
                  }
                }}
                autoFocus
                disabled={saving}
                maxLength={200}
                className="w-full px-3 py-2.5 rounded-md text-[16px] focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--color-ink)',
                  background: 'var(--color-paper)',
                  border: '1px solid var(--color-line)',
                }}
              />
              {saveError && (
                <p className="text-[12px] mt-2" style={{ color: '#B45C4A' }}>
                  {saveError}
                </p>
              )}
            </div>

            <div
              className="p-4 flex items-center justify-end gap-2"
              style={{ borderTop: '1px solid var(--color-line-soft)' }}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-[13px] rounded-md transition-colors disabled:opacity-50"
                style={{ color: 'var(--color-muted)' }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = 'var(--color-ivory)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !titleDraft.trim() || titleDraft.trim() === project.title}
                className="px-4 py-2 text-[13px] rounded-md transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--color-sage-deep)',
                  color: 'var(--color-paper)',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function labelForActivePhase(phase: number | null): string {
  if (phase === 1) return 'Developmental'
  if (phase === 2) return 'Line edit'
  if (phase === 3) return 'Copy edit'
  if (phase === 4) return 'Design'
  if (phase === 5) return 'Marketing'
  return 'In progress'
}
