'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | 'loading'
  | 'welcome'
  | 'q1'
  | 'q1-loading'
  | 'q2'
  | 'q3'
  | 'q3-upload'
  | 'q4'
  | 'q5'
  | 'matching'
  | 'done'

type BookTypeSignal = 'memoir-personal' | 'ideas-argument' | 'neutral'
type GhostWriter = 'ivy' | 'reid'
type MessageSender = 'eden' | 'author' | 'ghost'

interface Message {
  id: string
  sender: MessageSender
  text: string
  ghost?: GhostWriter // which ghost writer sent this (when sender === 'ghost')
}

interface AuthorProfile {
  id: string
  first_name: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2)
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

// ─── Avatar components ────────────────────────────────────────────────────────

function EdenAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[#8FAF8A] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-semibold">E</span>
    </div>
  )
}

function GhostAvatar({ ghost }: { ghost: GhostWriter }) {
  const isIvy = ghost === 'ivy'
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isIvy ? 'bg-amber-400' : 'bg-[#4a7a4a]'
      }`}
    >
      <span className="text-white text-sm font-semibold">{isIvy ? 'I' : 'R'}</span>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function ChatMessage({ message, ghost }: { message: Message; ghost: GhostWriter | null }) {
  const isAuthor = message.sender === 'author'

  if (isAuthor) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-[#2C2C2C] text-sm leading-relaxed"
          style={{ backgroundColor: 'rgba(143, 175, 138, 0.2)' }}
        >
          {message.text}
        </div>
      </div>
    )
  }

  const isGhost = message.sender === 'ghost'
  const senderGhost = message.ghost ?? ghost

  return (
    <div className="flex items-start gap-3">
      {isGhost && senderGhost ? (
        <GhostAvatar ghost={senderGhost} />
      ) : (
        <EdenAvatar />
      )}
      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#8FAF8A] text-[#2C2C2C] text-sm leading-relaxed">
        {message.text}
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ ghost }: { ghost: GhostWriter | null }) {
  return (
    <div className="flex items-start gap-3">
      {ghost ? <GhostAvatar ghost={ghost} /> : <EdenAvatar />}
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[#8FAF8A]">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF8A] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF8A] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF8A] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// ─── Choice button ────────────────────────────────────────────────────────────

function ChoiceButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-5 py-2.5 rounded-xl border-2 border-[#8FAF8A] text-[#2C2C2C] text-sm font-medium hover:bg-[#8FAF8A] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function GhostWriterContent() {
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = useState<Stage>('loading')
  const [messages, setMessages] = useState<Message[]>([])
  const [showTyping, setShowTyping] = useState(false)

  // Form inputs
  const [q1Text, setQ1Text] = useState('')
  const [q4Text, setQ4Text] = useState('')

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Matching signals (refs to avoid stale closures in async flows)
  const bookTypeSignalRef = useRef<BookTypeSignal>('neutral')
  const bookTitleRef = useRef<string>('')
  const q2SignalRef = useRef<'ivy' | 'reid' | null>(null)
  const uploadedFilePathRef = useRef<string | null>(null)
  const matchedGhostRef = useRef<GhostWriter | null>(null)

  // User
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null)
  const authorProfileRef = useRef<AuthorProfile | null>(null)

  // Display ghost writer identity once revealed
  const [revealedGhost, setRevealedGhost] = useState<GhostWriter | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  // ── Auth & access check ──────────────────────────────────────────────────

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('author_profiles')
        .select('id, first_name, has_ghostwriter_access, is_beta_tester')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile) { router.push('/login'); return }

      if (!profile.has_ghostwriter_access && !profile.is_beta_tester) {
        router.push('/checkout')
        return
      }

      const ap = { id: profile.id, first_name: profile.first_name || 'there' }
      setAuthorProfile(ap)
      authorProfileRef.current = ap

      // Show welcome message
      addEdenMessage(
        "Hi, I'm Eden. Before you meet your writing partner, I'd like to ask you a few questions — nothing complicated, just enough to understand you and your book. There are no wrong answers. This will take about two minutes."
      )
      setStage('welcome')
    }

    checkAccess()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Message helpers ──────────────────────────────────────────────────────

  function addMessage(sender: MessageSender, text: string, ghost?: GhostWriter) {
    setMessages((prev) => [...prev, { id: makeId(), sender, text, ghost }])
  }

  function addEdenMessage(text: string) {
    addMessage('eden', text)
  }

  function addAuthorMessage(text: string) {
    addMessage('author', text)
  }

  function addGhostMessage(ghost: GhostWriter, text: string) {
    addMessage('ghost', text, ghost)
  }

  async function edenSays(text: string, pauseBefore = 600) {
    setShowTyping(true)
    await delay(pauseBefore)
    setShowTyping(false)
    addEdenMessage(text)
  }

  // ── Q1 — What is your book about? ────────────────────────────────────────

  async function handleQ1Submit() {
    if (!q1Text.trim()) return
    const description = q1Text.trim()
    addAuthorMessage(description)
    setStage('q1-loading')

    try {
      // Run both Claude calls in parallel
      const [reflectRes, detectRes] = await Promise.all([
        fetch('/api/ghostwriter/eden-reflect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookDescription: description }),
        }),
        fetch('/api/ghostwriter/detect-book-type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookDescription: description }),
        }),
      ])

      const { reflection } = await reflectRes.json()
      const { signal, title } = await detectRes.json()

      bookTypeSignalRef.current = signal as BookTypeSignal
      bookTitleRef.current = title as string

      setShowTyping(true)
      await delay(600)
      setShowTyping(false)
      addEdenMessage(reflection || "That's a book worth writing.")

      await edenSays("Is this based on your own life, or is it a story you're telling?", 900)
      setStage('q2')
    } catch {
      // Fallback gracefully
      bookTypeSignalRef.current = 'neutral'
      await edenSays("Is this based on your own life, or is it a story you're telling?")
      setStage('q2')
    }
  }

  // ── Q2 — Life-based or fiction? ──────────────────────────────────────────

  async function handleQ2Choice(choice: 'My own life' | "A story I'm telling" | 'Both') {
    addAuthorMessage(choice)

    const bridges: Record<string, string> = {
      'My own life': 'Personal stories are often the most powerful ones.',
      "A story I'm telling": 'Stories we carry for others matter too.',
      'Both': 'Those are often the richest books of all.',
    }

    q2SignalRef.current = choice === "A story I'm telling" ? 'reid' : 'ivy'

    await edenSays(bridges[choice], 500)
    await edenSays(
      'Do you have anything written already — even rough notes or journal entries?',
      800
    )
    setStage('q3')
  }

  // ── Q3 — Existing material? ──────────────────────────────────────────────

  async function handleQ3Choice(hasIt: boolean) {
    addAuthorMessage(hasIt ? 'Yes' : 'Not yet')

    if (hasIt) {
      await edenSays("That's a great start — more than you might think.", 500)
      setStage('q3-upload')
    } else {
      await edenSays("Perfect. We'll build it together from scratch.", 500)
      await edenSays('What does finishing this book mean to you?', 900)
      setStage('q4')
    }
  }

  async function handleFileSelect(file: File) {
    const allowed = ['.pdf', '.docx', '.txt', '.md']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(ext)) {
      setUploadError('Please upload a .pdf, .docx, .txt, or .md file.')
      return
    }

    setUploadError('')
    setIsUploading(true)
    setUploadedFile(file)

    try {
      const profile = authorProfileRef.current
      if (!profile) throw new Error('No profile')

      const path = `${profile.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('ghostwriter-uploads')
        .upload(path, file, { upsert: false })

      if (error) throw error

      uploadedFilePathRef.current = path
      setIsUploading(false)

      await edenSays('What does finishing this book mean to you?', 800)
      setStage('q4')
    } catch {
      setIsUploading(false)
      setUploadError('Upload failed. You can continue without it.')
      // Still proceed after a moment
      await delay(1500)
      await edenSays('What does finishing this book mean to you?', 800)
      setStage('q4')
    }
  }

  // ── Q4 — What does finishing mean to you? ────────────────────────────────

  async function handleQ4Submit() {
    if (!q4Text.trim()) return
    addAuthorMessage(q4Text.trim())

    await edenSays('Thank you for telling me that.', 600)
    await edenSays(
      'One last question — would you prefer to work with a male or female writing partner?',
      1000
    )
    setStage('q5')
  }

  // ── Q5 — Gender preference ───────────────────────────────────────────────

  async function handleQ5Choice(choice: 'Female' | 'Male' | 'No preference') {
    addAuthorMessage(choice)

    const q5Signal: 'ivy' | 'reid' | null =
      choice === 'Female' ? 'ivy' : choice === 'Male' ? 'reid' : null

    await edenSays('Got it.', 400)
    setStage('matching')
    await delay(300)
    await runMatching(q5Signal)
  }

  // ── Matching logic ───────────────────────────────────────────────────────

  const runMatching = useCallback(async (q5Signal: 'ivy' | 'reid' | null) => {
    // 1.5s pause with Eden avatar pulsing (matching stage handles the animation)
    await delay(1500)

    let ivyScore = 0
    let reidScore = 0

    if (bookTypeSignalRef.current === 'memoir-personal') ivyScore += 2
    if (bookTypeSignalRef.current === 'ideas-argument') reidScore += 2
    if (q2SignalRef.current === 'ivy') ivyScore += 1
    if (q2SignalRef.current === 'reid') reidScore += 1
    if (q5Signal === 'ivy') ivyScore += 2
    if (q5Signal === 'reid') reidScore += 2

    // Ties go to Ivy
    const ghost: GhostWriter = ivyScore >= reidScore ? 'ivy' : 'reid'
    matchedGhostRef.current = ghost

    // Eden reveal
    if (ghost === 'ivy') {
      addEdenMessage(
        "I think you should work with Ivy. She's patient, she's perceptive, and she's very good at finding the story inside the story. I think you'll get on well."
      )
    } else {
      addEdenMessage(
        "I think you should work with Reid. He's structured, direct, and he'll help you build something with real architecture. He'll know where your book is going before you do."
      )
    }

    setRevealedGhost(ghost)
    await delay(2000)

    // Ghost writer hello
    const firstName = authorProfileRef.current?.first_name || 'there'
    if (ghost === 'ivy') {
      addGhostMessage('ivy', `Hi ${firstName}. I've been looking forward to this. Let's find your story.`)
    } else {
      addGhostMessage('reid', `Good to meet you, ${firstName}. Let's figure out what we're building.`)
    }

    await delay(1200)

    // Save to Supabase (fire and don't block UI)
    saveGhostWriterProfile(ghost)

    // Ghost writer's first question
    const hasUpload = !!uploadedFilePathRef.current
    if (hasUpload) {
      if (ghost === 'ivy') {
        addGhostMessage('ivy', "I've had a look at what you uploaded. There's more here than you might realise. Let me show you what I found.")
      } else {
        addGhostMessage('reid', "I've reviewed your material. Here's what we're working with and what's missing.")
      }
    } else {
      if (ghost === 'ivy') {
        addGhostMessage('ivy', "Do you have anything written already — a chapter, some notes, even a journal entry? Anything at all is useful. If not, that's completely fine.")
      } else {
        addGhostMessage('reid', "Before we start — do you have any existing material? A draft, an outline, notes? Upload whatever you have and I'll tell you what we're working with.")
      }
    }

    setStage('done')
  }, [])

  // ── Save profile to Supabase ─────────────────────────────────────────────

  async function saveGhostWriterProfile(ghost: GhostWriter) {
    const profile = authorProfileRef.current
    if (!profile) return

    try {
      await supabase
        .from('author_profiles')
        .update({
          ghostwriter_agent: ghost,
          ghostwriter_onboarding_completed: true,
          ghostwriter_onboarding_completed_at: new Date().toISOString(),
          ghostwriter_book_title: bookTitleRef.current || null,
        })
        .eq('id', profile.id)
    } catch (err) {
      console.error('Failed to save ghostwriter profile:', err)
    }
  }

  // ── Input area renderer ──────────────────────────────────────────────────

  function renderInput() {
    switch (stage) {
      case 'loading':
        return null

      case 'welcome':
        return (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setStage('q1')
                edenSays("What's your book about?", 400)
              }}
              className="px-8 py-3 rounded-xl bg-[#8FAF8A] text-white font-medium text-sm hover:bg-[#7a9e75] transition-colors"
            >
              Let&apos;s begin
            </button>
          </div>
        )

      case 'q1':
        return (
          <div className="space-y-3">
            <textarea
              value={q1Text}
              onChange={(e) => setQ1Text(e.target.value)}
              placeholder="Tell me about your book..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#8FAF8A] bg-white text-[#2C2C2C] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8FAF8A] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleQ1Submit()
              }}
            />
            <div className="flex justify-end">
              <button
                onClick={handleQ1Submit}
                disabled={!q1Text.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#8FAF8A] text-white text-sm font-medium hover:bg-[#7a9e75] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 'q1-loading':
        return (
          <div className="flex justify-center py-2">
            <span className="text-xs text-gray-400">Eden is thinking...</span>
          </div>
        )

      case 'q2':
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            {(['My own life', "A story I'm telling", 'Both'] as const).map((c) => (
              <ChoiceButton key={c} label={c} onClick={() => handleQ2Choice(c)} />
            ))}
          </div>
        )

      case 'q3':
        return (
          <div className="flex gap-3 justify-center">
            <ChoiceButton label="Yes" onClick={() => handleQ3Choice(true)} />
            <ChoiceButton label="Not yet" onClick={() => handleQ3Choice(false)} />
          </div>
        )

      case 'q3-upload':
        return (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#8FAF8A] rounded-xl p-6 text-center cursor-pointer hover:bg-[#8FAF8A]/5 transition-colors"
            >
              {uploadedFile ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#2C2C2C]">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {isUploading ? 'Uploading...' : 'Uploaded'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#2C2C2C] mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">.pdf, .docx, .txt, .md</p>
                </>
              )}
            </div>
            {uploadError && (
              <p className="text-xs text-red-500 text-center">{uploadError}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
            />
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  await edenSays('What does finishing this book mean to you?', 600)
                  setStage('q4')
                }}
                className="text-xs text-gray-400 underline hover:text-gray-600"
              >
                Continue without uploading
              </button>
            </div>
          </div>
        )

      case 'q4':
        return (
          <div className="space-y-3">
            <textarea
              value={q4Text}
              onChange={(e) => setQ4Text(e.target.value)}
              placeholder="What would it mean to you..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#8FAF8A] bg-white text-[#2C2C2C] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8FAF8A] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleQ4Submit()
              }}
            />
            <div className="flex justify-end">
              <button
                onClick={handleQ4Submit}
                disabled={!q4Text.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#8FAF8A] text-white text-sm font-medium hover:bg-[#7a9e75] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )

      case 'q5':
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            {(['Female', 'Male', 'No preference'] as const).map((c) => (
              <ChoiceButton key={c} label={c} onClick={() => handleQ5Choice(c)} />
            ))}
          </div>
        )

      case 'matching':
        return (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-[#8FAF8A] flex items-center justify-center animate-pulse">
              <span className="text-white text-lg font-semibold">E</span>
            </div>
            <p className="text-xs text-gray-400">Finding your match...</p>
          </div>
        )

      case 'done':
        return null

      default:
        return null
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#8FAF8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F4' }}>
      {/* Header */}
      <div className="text-center pt-10 pb-4 flex-shrink-0">
        <div className="inline-flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8FAF8A] flex items-center justify-center">
            <span className="text-white text-xs font-semibold">E</span>
          </div>
          <span className="text-sm font-medium text-[#2C2C2C]">Eden</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-[680px] mx-auto space-y-4 pt-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} ghost={revealedGhost} />
          ))}
          {showTyping && <TypingIndicator ghost={null} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      {renderInput() && (
        <div
          className="flex-shrink-0 border-t px-4 py-5"
          style={{ backgroundColor: '#FAF8F4', borderColor: 'rgba(143,175,138,0.25)' }}
        >
          <div className="max-w-[680px] mx-auto">{renderInput()}</div>
        </div>
      )}
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function GhostWriterPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#FAF8F4' }}
        >
          <div className="w-6 h-6 rounded-full border-2 border-[#8FAF8A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <GhostWriterContent />
    </Suspense>
  )
}
