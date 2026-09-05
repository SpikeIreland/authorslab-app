'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { N8N_WEBHOOKS } from '@/lib/n8n-config'

// ─── Webhook config ────────────────────────────────────────────────────────────

const GHOSTWRITER_WEBHOOKS = {
  ivyChat: N8N_WEBHOOKS.ivyChat,
  reidChat: N8N_WEBHOOKS.reidChat,
  gapAnalysis: N8N_WEBHOOKS.ghostwriterGapAnalysis,
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GhostWriter = 'ivy' | 'reid'
type SectionStatus = 'not_started' | 'needs_material' | 'ready_to_write' | 'drafted'

interface Session {
  id: string
  ghost_writer: GhostWriter
  phase: number
  phase_name: string
  book_brief: Record<string, unknown>
  status: string
}

interface Section {
  id: string
  session_id: string
  title: string
  status: SectionStatus
  raw_material: string | null
  draft_content: string | null
  order_index: number
  word_count: number
}

interface ChatMsg {
  id: string
  session_id: string
  sender: GhostWriter | 'author'
  message: string
  section_id: string | null
  created_at: string
}

interface AuthorProfile {
  id: string
  first_name: string
}

// Per-message metadata surfaced in the chat panel — tracks draft insertions
// that arrived alongside a ghost reply.
interface ChatMsgMeta {
  insertedInto?: string // section title the draftInsert was written into
  pendingInsert?: string // draftInsert text held until author selects a section
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusIcon(status: SectionStatus) {
  const icons: Record<SectionStatus, string> = {
    not_started: '⚪',
    needs_material: '🟡',
    ready_to_write: '🟢',
    drafted: '✅',
  }
  return icons[status]
}

function computeWordCount(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function GhostAvatar({ ghost, size = 'md' }: { ghost: GhostWriter; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center flex-shrink-0 ${
        ghost === 'ivy' ? 'bg-[#D4956A]' : 'bg-[#5C7A6B]'
      }`}
    >
      <span className="text-white font-semibold">{ghost === 'ivy' ? 'I' : 'R'}</span>
    </div>
  )
}

// ─── Chat bubbles ─────────────────────────────────────────────────────────────

function AuthorBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-[#2C2C2C] text-sm leading-relaxed"
        style={{ backgroundColor: 'rgba(143, 175, 138, 0.2)' }}
      >
        {text}
      </div>
    </div>
  )
}

function GhostBubble({
  ghost,
  text,
  meta,
  onInsertHere,
  selectedSectionTitle,
}: {
  ghost: GhostWriter
  text: string
  meta?: ChatMsgMeta
  onInsertHere?: () => void
  selectedSectionTitle?: string | null
}) {
  const border = ghost === 'ivy' ? 'border-[#D4956A]/40' : 'border-[#5C7A6B]/40'
  const ghostName = ghost === 'ivy' ? 'Ivy' : 'Reid'
  return (
    <div className="flex items-start gap-2.5">
      <GhostAvatar ghost={ghost} size="sm" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div
          className={`max-w-[95%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border ${border} text-[#2C2C2C] text-sm leading-relaxed`}
        >
          {text}
        </div>
        {meta?.insertedInto && (
          <p className="text-xs italic text-gray-400 pl-1">
            Written into {meta.insertedInto}
          </p>
        )}
        {meta?.pendingInsert && !meta.insertedInto && (
          <div className="pl-1 space-y-1.5">
            <p className="text-xs italic text-gray-400">
              {selectedSectionTitle
                ? `${ghostName} has a draft ready.`
                : `${ghostName} has a draft ready. Select a section to insert it.`}
            </p>
            {selectedSectionTitle && onInsertHere && (
              <button
                onClick={onInsertHere}
                className="text-xs px-2.5 py-1 rounded-md bg-[#8FAF8A]/15 text-[#5C7A6B] hover:bg-[#8FAF8A]/25 transition-colors"
              >
                Insert into {selectedSectionTitle}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ChatTypingIndicator({ ghost }: { ghost: GhostWriter }) {
  const dotColor = ghost === 'ivy' ? 'bg-[#D4956A]' : 'bg-[#5C7A6B]'
  const border = ghost === 'ivy' ? 'border-[#D4956A]/40' : 'border-[#5C7A6B]/40'
  return (
    <div className="flex items-start gap-2.5">
      <GhostAvatar ghost={ghost} size="sm" />
      <div className={`px-4 py-3 rounded-2xl rounded-tl-sm bg-white border ${border}`}>
        <div className="flex gap-1 items-center h-4">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce [animation-delay:0ms]`} />
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce [animation-delay:150ms]`} />
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-bounce [animation-delay:300ms]`} />
        </div>
      </div>
    </div>
  )
}

// ─── Sortable section row ─────────────────────────────────────────────────────

interface SortableSectionRowProps {
  section: Section
  isSelected: boolean
  isNew: boolean
  isRenaming: boolean
  renameValue: string
  onRenameChange: (value: string) => void
  onRenameCommit: () => void
  onRenameCancel: () => void
  onSelect: () => void
  onStartRename: () => void
  onDelete: () => void
}

function SortableSectionRow({
  section,
  isSelected,
  isNew,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onSelect,
  onStartRename,
  onDelete,
}: SortableSectionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative w-full transition-colors ${
        isSelected ? 'bg-[#8FAF8A]/10' : 'hover:bg-[#8FAF8A]/5'
      } ${isNew ? 'animate-[slideDown_0.4s_ease-out]' : ''}`}
    >
      <div className="flex items-start gap-1.5 px-2 py-2.5">
        {/* Drag handle */}
        <button
          {...listeners}
          className="flex-shrink-0 mt-0.5 p-0.5 rounded cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
        </button>

        {/* Status icon + selectable body */}
        <button
          onClick={onSelect}
          className="flex-shrink-0 mt-0.5 text-base leading-none"
          title="Open section"
        >
          {statusIcon(section.status)}
        </button>

        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameCommit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onRenameCommit()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  onRenameCancel()
                }
              }}
              className="w-full text-sm text-[#2C2C2C] bg-white border border-[#8FAF8A]/60 rounded px-1.5 py-0.5 focus:outline-none"
            />
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isSelected) {
                  onStartRename()
                } else {
                  onSelect()
                }
              }}
              className="text-left w-full text-sm text-[#2C2C2C] truncate"
              title={isSelected ? 'Click again to rename' : section.title}
            >
              {section.title}
            </button>
          )}
          {section.word_count > 0 && !isRenaming && (
            <p className="text-xs text-gray-400 mt-0.5">{section.word_count.toLocaleString()} words</p>
          )}
        </div>

        {/* Delete on hover */}
        {!isRenaming && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="flex-shrink-0 mt-0.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#D4956A]"
            title="Delete section"
            aria-label="Delete section"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GhostWriterStudio() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [chatMeta, setChatMeta] = useState<Record<string, ChatMsgMeta>>({})

  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [newSectionId, setNewSectionId] = useState<string | null>(null) // drives entrance animation

  // Section CRUD UI state
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Autosave state
  const [savedFlash, setSavedFlash] = useState(false)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{ sectionId: string; content: string } | null>(null)
  const lastSavedContentRef = useRef<Record<string, string>>({}) // sectionId -> last saved text

  const sessionRef = useRef<Session | null>(null)
  const authorProfileRef = useRef<AuthorProfile | null>(null)
  const chatMessagesRef = useRef<ChatMsg[]>([])
  const selectedSectionRef = useRef<Section | null>(null)
  const sectionsRef = useRef<Section[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // DnD sensors
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, showTyping])

  // Keep refs in sync
  useEffect(() => {
    selectedSectionRef.current = selectedSection
  }, [selectedSection])

  useEffect(() => {
    sectionsRef.current = sections
  }, [sections])

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: profile } = await supabase
          .from('author_profiles')
          .select('id, first_name, has_ghostwriter_access, is_beta_tester')
          .eq('auth_user_id', user.id)
          .single()

        if (!profile) { router.push('/login'); return }

        if (!profile.has_ghostwriter_access && !profile.is_beta_tester) {
          router.push('/pricing')
          return
        }

        const ap = { id: profile.id, first_name: profile.first_name || 'there' }
        setAuthorProfile(ap)
        authorProfileRef.current = ap

        // Load most recent active session
        const { data: sessionData, error: sessionError } = await supabase
          .from('ghostwriter_sessions')
          .select('*')
          .eq('author_id', profile.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (sessionError || !sessionData) {
          setLoadError("No Wright project open yet. Eliot is ready to help you begin one.")
          setLoading(false)
          return
        }

        setSession(sessionData)
        sessionRef.current = sessionData

        // Load sections + chat in parallel
        const [sectionsRes, chatRes] = await Promise.all([
          supabase
            .from('ghostwriter_sections')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('order_index', { ascending: true }),
          supabase
            .from('ghostwriter_chat')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('created_at', { ascending: true }),
        ])

        const loadedSections = (sectionsRes.data ?? []) as Section[]
        setSections(loadedSections)
        // Seed lastSavedContentRef so we don't spuriously flash "Saved"
        loadedSections.forEach((s) => {
          lastSavedContentRef.current[s.id] = s.draft_content ?? ''
        })

        const existingChat = chatRes.data ?? []
        chatMessagesRef.current = existingChat
        setChatMessages(existingChat)

        // Seed the Wright partner's first message if chat is empty
        if (existingChat.length === 0) {
          await seedFirstMessage(sessionData, profile.id)
        }

        setLoading(false)
      } catch (err) {
        console.error('Studio load error:', err)
        setLoadError('Something went wrong loading your studio. Please refresh.')
        setLoading(false)
      }
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Seed first ghost message ──────────────────────────────────────────────

  async function seedFirstMessage(sess: Session, authorId: string) {
    const ghost = sess.ghost_writer
    const brief = sess.book_brief as Record<string, unknown>
    const hasMaterial = !!brief?.hasMaterial

    const text = hasMaterial
      ? ghost === 'ivy'
        ? "I've had a look at what you uploaded. There's more here than you might realise. Let me show you what I found."
        : "I've reviewed your material. Here's what we're working with and what's missing."
      : ghost === 'ivy'
        ? "Do you have anything written already — a chapter, some notes, even a journal entry? Anything at all is useful. If not, that's completely fine."
        : "Before we start — do you have any existing material? A draft, an outline, notes? Upload whatever you have and I'll tell you what we're working with."

    const { data: newMsg } = await supabase
      .from('ghostwriter_chat')
      .insert({ session_id: sess.id, sender: ghost, message: text, section_id: null })
      .select()
      .single()

    if (newMsg) {
      chatMessagesRef.current = [newMsg]
      setChatMessages([newMsg])
    }

    // Suppress unused var warning — authorId reserved for future per-author routing
    void authorId
  }

  // ── Section update handler (existing SECTION-tag mechanism) ───────────────

  async function handleSectionUpdate(
    sectionUpdate: {
      action: 'created' | 'update'
      section?: { id: string; title: string; status: SectionStatus; order_index: number }
      sectionId?: string
      status?: SectionStatus
    },
    sessionId: string
  ) {
    if (sectionUpdate.action === 'created' && sectionUpdate.section) {
      const { title, status } = sectionUpdate.section
      const orderIndex = sectionsRef.current.length

      const { data: newSection } = await supabase
        .from('ghostwriter_sections')
        .insert({ session_id: sessionId, title, status, order_index: orderIndex })
        .select()
        .single()

      if (newSection) {
        setSections((prev) => [...prev, newSection as Section])
        lastSavedContentRef.current[newSection.id] = ''
        setNewSectionId(newSection.id)
        setTimeout(() => setNewSectionId(null), 700)
      }
    } else if (sectionUpdate.action === 'update' && sectionUpdate.sectionId && sectionUpdate.status) {
      await supabase
        .from('ghostwriter_sections')
        .update({ status: sectionUpdate.status })
        .eq('id', sectionUpdate.sectionId)

      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionUpdate.sectionId ? { ...s, status: sectionUpdate.status! } : s
        )
      )
    }
  }

  // ── Autosave ──────────────────────────────────────────────────────────────

  const flashSaved = useCallback(() => {
    setSavedFlash(true)
    if (savedFlashTimerRef.current) clearTimeout(savedFlashTimerRef.current)
    savedFlashTimerRef.current = setTimeout(() => setSavedFlash(false), 1000)
  }, [])

  const persistDraft = useCallback(
    async (sectionId: string, content: string) => {
      const wc = computeWordCount(content)
      const { error } = await supabase
        .from('ghostwriter_sections')
        .update({
          draft_content: content,
          word_count: wc,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId)

      if (error) {
        console.error('Autosave failed:', error)
        return false
      }

      lastSavedContentRef.current[sectionId] = content
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, draft_content: content, word_count: wc } : s))
      )
      // Keep selectedSection in sync if this is the one being edited
      setSelectedSection((prev) =>
        prev && prev.id === sectionId ? { ...prev, draft_content: content, word_count: wc } : prev
      )
      flashSaved()
      return true
    },
    [supabase, flashSaved]
  )

  // Flush any pending debounced save immediately (e.g. before switching sections)
  const flushPendingSave = useCallback(async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    const pending = pendingSaveRef.current
    if (pending) {
      pendingSaveRef.current = null
      await persistDraft(pending.sectionId, pending.content)
    }
  }, [persistDraft])

  const handleDraftChange = useCallback(
    (value: string) => {
      const current = selectedSectionRef.current
      if (!current) return

      // Update local state immediately so UI stays responsive
      const wc = computeWordCount(value)
      setSelectedSection({ ...current, draft_content: value, word_count: wc })
      setSections((prev) =>
        prev.map((s) => (s.id === current.id ? { ...s, draft_content: value, word_count: wc } : s))
      )

      // Debounce persistence — 800ms after last keystroke
      pendingSaveRef.current = { sectionId: current.id, content: value }
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = setTimeout(() => {
        const pending = pendingSaveRef.current
        if (!pending) return
        // Only save if content actually differs from last-saved snapshot
        if (lastSavedContentRef.current[pending.sectionId] === pending.content) {
          pendingSaveRef.current = null
          return
        }
        pendingSaveRef.current = null
        persistDraft(pending.sectionId, pending.content)
      }, 800)
    },
    [persistDraft]
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
      if (savedFlashTimerRef.current) clearTimeout(savedFlashTimerRef.current)
    }
  }, [])

  // ── Section CRUD ──────────────────────────────────────────────────────────

  const handleSelectSection = useCallback(
    async (sec: Section) => {
      // If we have a pending save on a different section, flush it first
      const current = selectedSectionRef.current
      if (current && current.id !== sec.id) {
        await flushPendingSave()
      }
      setSelectedSection(sec)
    },
    [flushPendingSave]
  )

  const handleCreateSection = useCallback(async () => {
    const title = newSectionTitle.trim()
    const sess = sessionRef.current
    if (!title || !sess) {
      setIsAddingSection(false)
      setNewSectionTitle('')
      return
    }

    const orderIndex = sectionsRef.current.length

    // Optimistic insert
    const tempId = `temp-${Date.now()}`
    const optimistic: Section = {
      id: tempId,
      session_id: sess.id,
      title,
      status: 'not_started',
      raw_material: null,
      draft_content: '',
      order_index: orderIndex,
      word_count: 0,
    }
    setSections((prev) => [...prev, optimistic])
    setNewSectionTitle('')
    setIsAddingSection(false)

    const { data: created, error } = await supabase
      .from('ghostwriter_sections')
      .insert({
        session_id: sess.id,
        title,
        status: 'not_started',
        order_index: orderIndex,
        raw_material: null,
        draft_content: '',
      })
      .select()
      .single()

    if (error || !created) {
      console.error('Failed to create section:', error)
      // Roll back
      setSections((prev) => prev.filter((s) => s.id !== tempId))
      return
    }

    // Swap optimistic row for the real one
    setSections((prev) => prev.map((s) => (s.id === tempId ? (created as Section) : s)))
    lastSavedContentRef.current[created.id] = created.draft_content ?? ''
    setNewSectionId(created.id)
    setTimeout(() => setNewSectionId(null), 700)
    setSelectedSection(created as Section)
  }, [newSectionTitle, supabase])

  const handleStartRename = useCallback((sec: Section) => {
    setRenamingSectionId(sec.id)
    setRenameValue(sec.title)
  }, [])

  const handleCancelRename = useCallback(() => {
    setRenamingSectionId(null)
    setRenameValue('')
  }, [])

  const handleCommitRename = useCallback(async () => {
    const id = renamingSectionId
    if (!id) return
    const nextTitle = renameValue.trim()
    const original = sectionsRef.current.find((s) => s.id === id)
    setRenamingSectionId(null)
    setRenameValue('')
    if (!original || !nextTitle || nextTitle === original.title) return

    // Optimistic
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: nextTitle } : s)))
    setSelectedSection((prev) => (prev && prev.id === id ? { ...prev, title: nextTitle } : prev))

    const { error } = await supabase
      .from('ghostwriter_sections')
      .update({ title: nextTitle, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Rename failed:', error)
      // Roll back
      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: original.title } : s)))
      setSelectedSection((prev) =>
        prev && prev.id === id ? { ...prev, title: original.title } : prev
      )
    }
  }, [renamingSectionId, renameValue, supabase])

  const handleDeleteSection = useCallback(
    async (sec: Section) => {
      const ok = window.confirm(`Delete "${sec.title}"? Its content will be permanently lost.`)
      if (!ok) return

      const snapshot = sectionsRef.current
      // Optimistic remove
      setSections((prev) => prev.filter((s) => s.id !== sec.id))
      if (selectedSectionRef.current?.id === sec.id) {
        setSelectedSection(null)
      }

      const { error } = await supabase.from('ghostwriter_sections').delete().eq('id', sec.id)
      if (error) {
        console.error('Delete failed:', error)
        // Roll back
        setSections(snapshot)
      } else {
        delete lastSavedContentRef.current[sec.id]
      }
    },
    [supabase]
  )

  const handleReorder = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = sectionsRef.current.findIndex((s) => s.id === active.id)
      const newIndex = sectionsRef.current.findIndex((s) => s.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return

      const snapshot = sectionsRef.current
      const reordered = arrayMove(snapshot, oldIndex, newIndex).map((s, i) => ({
        ...s,
        order_index: i,
      }))
      setSections(reordered)

      // Persist all new order_index values
      try {
        await Promise.all(
          reordered.map((s) =>
            supabase
              .from('ghostwriter_sections')
              .update({ order_index: s.order_index })
              .eq('id', s.id)
          )
        )
      } catch (err) {
        console.error('Reorder persist failed:', err)
        setSections(snapshot)
      }
    },
    [supabase]
  )

  // ── Insert draft (from chat webhook) ──────────────────────────────────────

  const insertDraftIntoSection = useCallback(
    async (sectionId: string, draft: string, ghostMsgId: string) => {
      const target = sectionsRef.current.find((s) => s.id === sectionId)
      if (!target) return

      const existing = target.draft_content ?? ''
      const separator = existing.trim().length > 0 ? '\n\n' : ''
      const nextContent = `${existing}${separator}${draft}`

      const ok = await persistDraft(sectionId, nextContent)
      if (ok) {
        setChatMeta((prev) => ({
          ...prev,
          [ghostMsgId]: { insertedInto: target.title },
        }))
      }
    },
    [persistDraft]
  )

  // Handler passed to GhostBubble for pending-insert click
  const handleInsertPending = useCallback(
    async (ghostMsgId: string) => {
      const meta = chatMeta[ghostMsgId]
      const current = selectedSectionRef.current
      if (!meta?.pendingInsert || !current) return
      await insertDraftIntoSection(current.id, meta.pendingInsert, ghostMsgId)
    },
    [chatMeta, insertDraftIntoSection]
  )

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = chatInput.trim()
    if (!text || isSending) return

    const sess = sessionRef.current
    const profile = authorProfileRef.current
    if (!sess || !profile) return

    setChatInput('')
    setIsSending(true)

    // Persist author message
    const { data: authorMsg } = await supabase
      .from('ghostwriter_chat')
      .insert({
        session_id: sess.id,
        sender: 'author',
        message: text,
        section_id: selectedSectionRef.current?.id ?? null,
      })
      .select()
      .single()

    if (authorMsg) {
      const updated = [...chatMessagesRef.current, authorMsg]
      chatMessagesRef.current = updated
      setChatMessages(updated)
    }

    setShowTyping(true)

    try {
      const webhookUrl = sess.ghost_writer === 'ivy'
        ? GHOSTWRITER_WEBHOOKS.ivyChat
        : GHOSTWRITER_WEBHOOKS.reidChat

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sess.id,
          authorProfileId: profile.id,
          authorFirstName: profile.first_name,
          message: text,
          chatHistory: chatMessagesRef.current.map((m) => ({
            sender: m.sender,
            message: m.message,
          })),
          bookBrief: sess.book_brief,
          currentSectionId: selectedSectionRef.current?.id ?? null,
        }),
      })

      const data = await res.json()
      const reply: string = data.reply ?? "I'm thinking about that — give me a moment."
      const draftInsert: string | null | undefined = data.draftInsert

      // Handle section surfacing — null sectionUpdate is a no-op
      if (data.sectionUpdate) {
        await handleSectionUpdate(data.sectionUpdate, sess.id)
      }

      setShowTyping(false)

      const { data: ghostMsg } = await supabase
        .from('ghostwriter_chat')
        .insert({
          session_id: sess.id,
          sender: sess.ghost_writer,
          message: reply,
          section_id: selectedSectionRef.current?.id ?? null,
        })
        .select()
        .single()

      if (ghostMsg) {
        const updated = [...chatMessagesRef.current, ghostMsg]
        chatMessagesRef.current = updated
        setChatMessages(updated)

        // Handle draft auto-insertion
        if (typeof draftInsert === 'string' && draftInsert.trim().length > 0) {
          const currentSection = selectedSectionRef.current
          if (currentSection) {
            await insertDraftIntoSection(currentSection.id, draftInsert, ghostMsg.id)
          } else {
            setChatMeta((prev) => ({
              ...prev,
              [ghostMsg.id]: { pendingInsert: draftInsert },
            }))
          }
        }
      }
    } catch {
      setShowTyping(false)
      const fallback = sess.ghost_writer === 'ivy'
        ? "I'm here — can you tell me more about that?"
        : "Understood. Let me think through that."

      const { data: ghostMsg } = await supabase
        .from('ghostwriter_chat')
        .insert({ session_id: sess.id, sender: sess.ghost_writer, message: fallback, section_id: null })
        .select()
        .single()

      if (ghostMsg) {
        const updated = [...chatMessagesRef.current, ghostMsg]
        chatMessagesRef.current = updated
        setChatMessages(updated)
      }
    } finally {
      setIsSending(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInput, isSending, supabase, insertDraftIntoSection])

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#8FAF8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="text-center space-y-4">
          <p className="text-[#2C2C2C] text-sm">{loadError}</p>
          <button
            onClick={() => router.push('/wright')}
            className="px-6 py-2.5 rounded-xl bg-[#8FAF8A] text-white text-sm font-medium hover:bg-[#7a9e75] transition-colors"
          >
            Start a project
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  const ghost = session.ghost_writer
  const ghostName = ghost === 'ivy' ? 'Ivy' : 'Reid'
  const ghostAccent = ghost === 'ivy' ? '#D4956A' : '#5C7A6B'
  const firstName = authorProfile?.first_name ?? 'there'

  const draftValue = selectedSection?.draft_content ?? ''

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FAF8F4' }}>

      {/* Top bar */}
      <header
        className="flex-shrink-0 h-12 flex items-center justify-between px-5 border-b"
        style={{ borderColor: 'rgba(143,175,138,0.25)' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="flex items-baseline gap-1.5 hover:opacity-70 transition-opacity"
            title="Back to AuthorsLab home"
          >
            <span
              className="text-[15px] leading-none font-normal text-[#2C2C2C]"
              style={{ fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif" }}
            >
              AuthorsLab
            </span>
            <span className="text-[10px] italic text-gray-400">Wright</span>
          </Link>
          <span aria-hidden="true" className="text-gray-300">·</span>
          <div className="flex items-center gap-2">
            <GhostAvatar ghost={ghost} size="sm" />
            <span className="text-sm font-medium text-[#2C2C2C]">{ghostName}</span>
            <span className="text-xs text-gray-400">
              · Phase {session.phase} — {session.phase_name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/lobby"
            className="text-xs text-gray-400 hover:text-[#5C7A6B] transition-colors"
          >
            ← Library
          </Link>
          <Link
            href="/wright"
            className="text-xs text-gray-400 hover:text-[#5C7A6B] transition-colors"
          >
            Start new project
          </Link>
          <span className="text-xs text-gray-400">{firstName}&apos;s studio</span>
        </div>
      </header>

      {/* Three panels */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: section map ── */}
        <aside
          className="w-56 flex-shrink-0 flex flex-col border-r overflow-hidden"
          style={{ borderColor: 'rgba(143,175,138,0.25)' }}
        >
          <div
            className="px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: 'rgba(143,175,138,0.25)' }}
          >
            <p className="text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider">Sections</p>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {sections.length === 0 && !isAddingSection ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sections will appear here as your book takes shape.
                </p>
              </div>
            ) : (
              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map((sec) => (
                    <SortableSectionRow
                      key={sec.id}
                      section={sec}
                      isSelected={selectedSection?.id === sec.id}
                      isNew={newSectionId === sec.id}
                      isRenaming={renamingSectionId === sec.id}
                      renameValue={renameValue}
                      onRenameChange={setRenameValue}
                      onRenameCommit={handleCommitRename}
                      onRenameCancel={handleCancelRename}
                      onSelect={() => handleSelectSection(sec)}
                      onStartRename={() => handleStartRename(sec)}
                      onDelete={() => handleDeleteSection(sec)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Add section */}
          <div
            className="flex-shrink-0 border-t px-3 py-2"
            style={{ borderColor: 'rgba(143,175,138,0.25)' }}
          >
            {isAddingSection ? (
              <div className="space-y-1.5">
                <input
                  autoFocus
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateSection()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsAddingSection(false)
                      setNewSectionTitle('')
                    }
                  }}
                  placeholder="Section title"
                  className="w-full text-sm text-[#2C2C2C] bg-white border border-[#8FAF8A]/60 rounded px-2 py-1.5 focus:outline-none placeholder-gray-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingSection(false)
                      setNewSectionTitle('')
                    }}
                    className="text-xs text-gray-400 hover:text-[#2C2C2C]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSection}
                    disabled={!newSectionTitle.trim()}
                    className="text-xs px-2 py-1 rounded bg-[#8FAF8A] text-white disabled:opacity-40 hover:bg-[#7a9e75] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSection(true)}
                className="w-full text-left text-xs text-gray-500 hover:text-[#5C7A6B] px-1 py-1 transition-colors"
              >
                + New section
              </button>
            )}
          </div>
        </aside>

        {/* ── Centre: content area ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {selectedSection ? (
            <>
              {/* Section header */}
              <div
                className="flex-shrink-0 px-10 pt-6 pb-4 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(143,175,138,0.15)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl leading-none flex-shrink-0">{statusIcon(selectedSection.status)}</span>
                  <h1 className="text-xl font-medium text-[#2C2C2C] truncate">{selectedSection.title}</h1>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {selectedSection.word_count.toLocaleString()} words
                  </span>
                  <span
                    className={`text-xs text-[#5C7A6B] transition-opacity duration-300 ${
                      savedFlash ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    Saved ✓
                  </span>
                </div>
              </div>

              {/* Editable top half + preview bottom half */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top: textarea */}
                <div className="flex-1 min-h-0 overflow-y-auto px-10 py-6">
                  <div className="max-w-2xl mx-auto h-full">
                    <textarea
                      key={selectedSection.id}
                      value={draftValue}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      placeholder={`Start writing, or ask ${ghostName} to draft…`}
                      className="w-full h-full min-h-[200px] resize-none bg-transparent text-sm text-[#2C2C2C] leading-relaxed focus:outline-none border border-transparent focus:border-[#8FAF8A]/40 rounded-md p-3 placeholder-gray-400 transition-colors"
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="flex-shrink-0 border-t"
                  style={{ borderColor: 'rgba(143,175,138,0.25)' }}
                />

                {/* Bottom: live markdown preview */}
                <div className="flex-1 min-h-0 overflow-y-auto px-10 py-6">
                  <div className="max-w-2xl mx-auto">
                    {draftValue.trim().length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        Preview appears here as you write.
                      </p>
                    ) : (
                      <div className="wright-preview text-[#2C2C2C] text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{draftValue}</ReactMarkdown>
                      </div>
                    )}

                    {selectedSection.raw_material && (
                      <div className="mt-10 pt-6 border-t" style={{ borderColor: 'rgba(143,175,138,0.2)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                          Raw material
                        </p>
                        <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap opacity-60">
                          {selectedSection.raw_material}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: ghostAccent }}
                >
                  <span className="text-white text-xl font-semibold">
                    {ghost === 'ivy' ? 'I' : 'R'}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-1">Your book is taking shape</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Chat with {ghostName} on the right. Sections will appear here as you work together.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ── Right: chat ── */}
        <aside
          className="w-80 flex-shrink-0 flex flex-col border-l overflow-hidden"
          style={{ borderColor: 'rgba(143,175,138,0.25)' }}
        >
          {/* Chat header */}
          <div
            className="flex-shrink-0 px-4 py-3 border-b flex items-center gap-2.5"
            style={{ borderColor: 'rgba(143,175,138,0.25)' }}
          >
            <GhostAvatar ghost={ghost} size="sm" />
            <div>
              <p className="text-sm font-medium text-[#2C2C2C]">{ghostName}</p>
              {selectedSection && (
                <p className="text-xs text-gray-400 truncate max-w-[180px]">
                  {selectedSection.title}
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chatMessages.map((msg) =>
              msg.sender === 'author' ? (
                <AuthorBubble key={msg.id} text={msg.message} />
              ) : (
                <GhostBubble
                  key={msg.id}
                  ghost={msg.sender as GhostWriter}
                  text={msg.message}
                  meta={chatMeta[msg.id]}
                  selectedSectionTitle={selectedSection?.title ?? null}
                  onInsertHere={() => handleInsertPending(msg.id)}
                />
              )
            )}
            {showTyping && <ChatTypingIndicator ghost={ghost} />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 border-t p-3"
            style={{ borderColor: 'rgba(143,175,138,0.25)' }}
          >
            <div className="flex gap-2 items-end">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Message ${ghostName}...`}
                rows={2}
                disabled={isSending}
                className="flex-1 px-3 py-2 rounded-xl border text-sm text-[#2C2C2C] placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
                style={{ borderColor: 'rgba(143,175,138,0.4)', backgroundColor: 'white' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || isSending}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-base transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: ghostAccent }}
              >
                ↑
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">⌘ Enter to send</p>
          </div>
        </aside>

      </div>

      {/* Preview styling — kept minimal, matches Manuscript Room tokens */}
      <style jsx global>{`
        .wright-preview h1,
        .wright-preview h2,
        .wright-preview h3,
        .wright-preview h4 {
          font-weight: 500;
          color: #2C2C2C;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        .wright-preview h1 { font-size: 1.5rem; }
        .wright-preview h2 { font-size: 1.25rem; }
        .wright-preview h3 { font-size: 1.1rem; }
        .wright-preview p {
          margin: 0 0 0.9em;
          line-height: 1.65;
        }
        .wright-preview ul,
        .wright-preview ol {
          margin: 0 0 0.9em 1.5em;
          line-height: 1.65;
        }
        .wright-preview ul { list-style: disc; }
        .wright-preview ol { list-style: decimal; }
        .wright-preview li { margin: 0.15em 0; }
        .wright-preview blockquote {
          border-left: 3px solid rgba(143, 175, 138, 0.5);
          padding: 0.1em 0 0.1em 1em;
          margin: 0.75em 0;
          color: #5C7A6B;
          font-style: italic;
        }
        .wright-preview code {
          background: rgba(143, 175, 138, 0.12);
          padding: 0.1em 0.35em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .wright-preview pre {
          background: rgba(143, 175, 138, 0.08);
          padding: 0.75em 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.75em 0;
        }
        .wright-preview pre code {
          background: transparent;
          padding: 0;
        }
        .wright-preview a {
          color: #5C7A6B;
          text-decoration: underline;
          text-decoration-color: rgba(143, 175, 138, 0.5);
        }
        .wright-preview strong { font-weight: 600; color: #2C2C2C; }
        .wright-preview em { font-style: italic; }
        .wright-preview hr {
          border: none;
          border-top: 1px solid rgba(143, 175, 138, 0.35);
          margin: 1.5em 0;
        }
        .wright-preview table {
          border-collapse: collapse;
          margin: 0.75em 0;
          font-size: 0.9em;
        }
        .wright-preview th,
        .wright-preview td {
          border: 1px solid rgba(143, 175, 138, 0.35);
          padding: 0.4em 0.75em;
          text-align: left;
        }
        .wright-preview th {
          background: rgba(143, 175, 138, 0.1);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
