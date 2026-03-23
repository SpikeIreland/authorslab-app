'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Webhook config ────────────────────────────────────────────────────────────

const GHOSTWRITER_WEBHOOKS = {
  ivyChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/ivy-chat',
  reidChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/reid-chat',
  gapAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/ghostwriter-gap-analysis',
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

function GhostBubble({ ghost, text }: { ghost: GhostWriter; text: string }) {
  const border = ghost === 'ivy' ? 'border-[#D4956A]/40' : 'border-[#5C7A6B]/40'
  return (
    <div className="flex items-start gap-2.5">
      <GhostAvatar ghost={ghost} size="sm" />
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border ${border} text-[#2C2C2C] text-sm leading-relaxed`}
      >
        {text}
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

  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [newSectionId, setNewSectionId] = useState<string | null>(null) // drives entrance animation

  const sessionRef = useRef<Session | null>(null)
  const authorProfileRef = useRef<AuthorProfile | null>(null)
  const chatMessagesRef = useRef<ChatMsg[]>([])
  const selectedSectionRef = useRef<Section | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, showTyping])

  // Keep selectedSectionRef in sync
  useEffect(() => {
    selectedSectionRef.current = selectedSection
  }, [selectedSection])

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
          setLoadError("We couldn't find your Ghost Writing session. Please complete onboarding first.")
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

        setSections(sectionsRes.data ?? [])

        const existingChat = chatRes.data ?? []
        chatMessagesRef.current = existingChat
        setChatMessages(existingChat)

        // Seed the ghost writer's first message if chat is empty
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

  // ── Section update handler ────────────────────────────────────────────────

  const sectionsRef = useRef<Section[]>([])
  useEffect(() => { sectionsRef.current = sections }, [sections])

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
      const orderIndex = sectionsRef.current.length // use actual count as order_index

      const { data: newSection } = await supabase
        .from('ghostwriter_sections')
        .insert({ session_id: sessionId, title, status, order_index: orderIndex })
        .select()
        .single()

      if (newSection) {
        setSections((prev) => [...prev, newSection as Section])
        setNewSectionId(newSection.id)
        // Clear animation flag after transition completes
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
  }, [chatInput, isSending, supabase])

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
            onClick={() => router.push('/ghostwriter')}
            className="px-6 py-2.5 rounded-xl bg-[#8FAF8A] text-white text-sm font-medium hover:bg-[#7a9e75] transition-colors"
          >
            Back to onboarding
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FAF8F4' }}>

      {/* Top bar */}
      <header
        className="flex-shrink-0 h-12 flex items-center justify-between px-5 border-b"
        style={{ borderColor: 'rgba(143,175,138,0.25)' }}
      >
        <div className="flex items-center gap-2.5">
          <GhostAvatar ghost={ghost} size="sm" />
          <span className="text-sm font-medium text-[#2C2C2C]">{ghostName}</span>
          <span className="text-xs text-gray-400">
            · Phase {session.phase} — {session.phase_name}
          </span>
        </div>
        <span className="text-xs text-gray-400">{firstName}&apos;s studio</span>
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
          <div className="flex-1 overflow-y-auto py-2">
            {sections.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Sections will appear here as your book takes shape.
                </p>
              </div>
            ) : (
              sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec)}
                  className={`w-full text-left px-4 py-2.5 transition-colors ${
                    selectedSection?.id === sec.id
                      ? 'bg-[#8FAF8A]/10'
                      : 'hover:bg-[#8FAF8A]/5'
                  } ${
                    newSectionId === sec.id
                      ? 'animate-[slideDown_0.4s_ease-out]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none flex-shrink-0">{statusIcon(sec.status)}</span>
                    <span className="text-sm text-[#2C2C2C] truncate">{sec.title}</span>
                  </div>
                  {sec.word_count > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 pl-6">{sec.word_count.toLocaleString()} words</p>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Centre: content area ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedSection ? (
            <div className="flex-1 overflow-y-auto px-10 py-8">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-2xl leading-none">{statusIcon(selectedSection.status)}</span>
                  <h1 className="text-xl font-medium text-[#2C2C2C]">{selectedSection.title}</h1>
                </div>

                {selectedSection.draft_content && (
                  <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Draft</p>
                    <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap">
                      {selectedSection.draft_content}
                    </div>
                  </div>
                )}

                {selectedSection.raw_material && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Raw material</p>
                    <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap opacity-60">
                      {selectedSection.raw_material}
                    </div>
                  </div>
                )}

                {!selectedSection.draft_content && !selectedSection.raw_material && (
                  <div className="text-center mt-20">
                    <p className="text-sm text-gray-400">
                      This section is waiting to be written.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Chat with {ghostName} to get started.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                <GhostBubble key={msg.id} ghost={msg.sender as GhostWriter} text={msg.message} />
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
    </div>
  )
}
