'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Webhook config ────────────────────────────────────────────────────────────

const GHOSTWRITER_WEBHOOKS = {
  edenMatch: 'https://spikeislandstudios.app.n8n.cloud/webhook/eden-match',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | 'loading'
  | 'welcome'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q3-upload'
  | 'q4'
  | 'q5'
  | 'matching'
  | 'done'

type GhostWriter = 'ivy' | 'reid'
type MessageSender = 'eden' | 'author' | 'ghost'

interface Message {
  id: string
  sender: MessageSender
  text: string
  ghost?: GhostWriter
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

// ─── Avatars ──────────────────────────────────────────────────────────────────

function EdenAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[#8FAF8A] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-semibold">E</span>
    </div>
  )
}

function GhostAvatar({ ghost }: { ghost: GhostWriter }) {
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        ghost === 'ivy' ? 'bg-[#D4956A]' : 'bg-[#5C7A6B]'
      }`}
    >
      <span className="text-white text-sm font-semibold">{ghost === 'ivy' ? 'I' : 'R'}</span>
    </div>
  )
}

// ─── Chat bubbles ─────────────────────────────────────────────────────────────

function ChatMessage({ message, ghost }: { message: Message; ghost: GhostWriter | null }) {
  if (message.sender === 'author') {
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

  const senderGhost = message.ghost ?? ghost

  return (
    <div className="flex items-start gap-3">
      {message.sender === 'ghost' && senderGhost ? (
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

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <EdenAvatar />
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

function ChoiceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-xl border-2 border-[#8FAF8A] text-[#2C2C2C] text-sm font-medium hover:bg-[#8FAF8A] hover:text-white transition-all"
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
  const [q1Text, setQ1Text] = useState('')
  const [q4Text, setQ4Text] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Collected answers — refs avoid stale closures in async flows
  const q1TextRef = useRef('')
  const q2ChoiceRef = useRef<'my_own_life' | 'a_story_im_telling' | 'both'>('my_own_life')
  const q4TextRef = useRef('')
  const q5ChoiceRef = useRef<'female' | 'male' | 'no_preference'>('no_preference')
  const uploadedFilePathRef = useRef<string | null>(null)
  const uploadedMaterialContentRef = useRef<string | null>(null)
  const bookBriefRef = useRef<Record<string, unknown>>({})
  const bookTitleRef = useRef('')

  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null)
  const authorProfileRef = useRef<AuthorProfile | null>(null)
  const [revealedGhost, setRevealedGhost] = useState<GhostWriter | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  // ── Auth + access check ───────────────────────────────────────────────────

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

      addEdenMessage(
        "Hi, I'm Eden. Before you meet your writing partner, I'd like to ask you a few questions — nothing complicated, just enough to understand you and your book. There are no wrong answers. This will take about two minutes."
      )
      setStage('welcome')
    }
    checkAccess()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Message helpers ───────────────────────────────────────────────────────

  function addMessage(sender: MessageSender, text: string, ghost?: GhostWriter) {
    setMessages((prev) => [...prev, { id: makeId(), sender, text, ghost }])
  }
  function addEdenMessage(text: string) { addMessage('eden', text) }
  function addAuthorMessage(text: string) { addMessage('author', text) }
  function addGhostMessage(ghost: GhostWriter, text: string) { addMessage('ghost', text, ghost) }

  async function edenSays(text: string, pauseBefore = 600) {
    setShowTyping(true)
    await delay(pauseBefore)
    setShowTyping(false)
    addEdenMessage(text)
  }

  // ── Q1 ────────────────────────────────────────────────────────────────────

  async function handleQ1Submit() {
    if (!q1Text.trim()) return
    const description = q1Text.trim()
    q1TextRef.current = description
    addAuthorMessage(description)
    await edenSays('Thank you for sharing that.', 500)
    await edenSays("Is this based on your own life, or is it a story you're telling?", 900)
    setStage('q2')
  }

  // ── Q2 ────────────────────────────────────────────────────────────────────

  async function handleQ2Choice(choice: 'My own life' | "A story I'm telling" | 'Both') {
    addAuthorMessage(choice)
    const q2Map = {
      'My own life': 'my_own_life' as const,
      "A story I'm telling": 'a_story_im_telling' as const,
      'Both': 'both' as const,
    }
    q2ChoiceRef.current = q2Map[choice]
    const bridges = {
      'My own life': 'Personal stories are often the most powerful ones.',
      "A story I'm telling": 'Stories we carry for others matter too.',
      'Both': 'Those are often the richest books of all.',
    }
    await edenSays(bridges[choice], 500)
    await edenSays('Do you have anything written already — even rough notes or journal entries?', 900)
    setStage('q3')
  }

  // ── Q3 ────────────────────────────────────────────────────────────────────

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
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!['.pdf', '.docx', '.txt', '.md'].includes(ext)) {
      setUploadError('Please upload a .pdf, .docx, .txt, or .md file.')
      return
    }
    setUploadError('')
    setIsUploading(true)
    setUploadedFile(file)

    try {
      const profile = authorProfileRef.current
      if (!profile) throw new Error('No profile')

      // Read text content for plain-text files so it can be sent to eden-match
      if (ext === '.txt' || ext === '.md') {
        uploadedMaterialContentRef.current = await file.text()
      }

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
      await delay(1500)
      await edenSays('What does finishing this book mean to you?', 800)
      setStage('q4')
    }
  }

  // ── Q4 ────────────────────────────────────────────────────────────────────

  async function handleQ4Submit() {
    if (!q4Text.trim()) return
    q4TextRef.current = q4Text.trim()
    addAuthorMessage(q4Text.trim())
    await edenSays('Thank you for telling me that.', 600)
    await edenSays('One last question — would you prefer to work with a male or female writing partner?', 1000)
    setStage('q5')
  }

  // ── Q5 ────────────────────────────────────────────────────────────────────

  async function handleQ5Choice(choice: 'Female' | 'Male' | 'No preference') {
    addAuthorMessage(choice)
    const q5Map = { 'Female': 'female' as const, 'Male': 'male' as const, 'No preference': 'no_preference' as const }
    q5ChoiceRef.current = q5Map[choice]
    await edenSays('Got it.', 400)
    setStage('matching')
    await delay(300)
    await runEdenMatch()
  }

  // ── Eden match webhook ────────────────────────────────────────────────────

  const runEdenMatch = useCallback(async () => {
    const profile = authorProfileRef.current
    if (!profile) return

    let assignedAgent: GhostWriter = 'ivy'
    let edenReflection = "That's a book worth writing."
    let bookTitle = ''
    let bookBrief: Record<string, unknown> = {}

    try {
      const res = await fetch(GHOSTWRITER_WEBHOOKS.edenMatch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorProfileId: profile.id,
          bookDescription: q1TextRef.current,
          q2Choice: q2ChoiceRef.current,
          q5Choice: q5ChoiceRef.current,
          uploadedMaterial: uploadedMaterialContentRef.current,
          q4Meaning: q4TextRef.current,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        assignedAgent = data.assignedAgent ?? 'ivy'
        edenReflection = data.edenReflection ?? edenReflection
        bookTitle = data.bookTitle ?? ''
        bookBrief = data.bookBrief ?? {}
      }
    } catch {
      // Graceful fallback — simple local signal
      assignedAgent =
        q5ChoiceRef.current === 'male' ? 'reid'
        : q5ChoiceRef.current === 'female' ? 'ivy'
        : q2ChoiceRef.current === 'a_story_im_telling' ? 'reid'
        : 'ivy'
      bookBrief = {
        description: q1TextRef.current,
        basis: q2ChoiceRef.current,
        hasMaterial: !!uploadedFilePathRef.current,
        meaning: q4TextRef.current,
        genderPreference: q5ChoiceRef.current,
      }
    }

    bookTitleRef.current = bookTitle
    bookBriefRef.current = bookBrief

    // Show Eden's reflection, then reveal
    await delay(1500)
    await edenSays(edenReflection, 300)

    if (assignedAgent === 'ivy') {
      await edenSays(
        "I think you should work with Ivy. She's patient, she's perceptive, and she's very good at finding the story inside the story. I think you'll get on well.",
        900
      )
    } else {
      await edenSays(
        "I think you should work with Reid. He's structured, direct, and he'll help you build something with real architecture. He'll know where your book is going before you do.",
        900
      )
    }

    setRevealedGhost(assignedAgent)
    await delay(1500)

    const firstName = authorProfileRef.current?.first_name || 'there'
    if (assignedAgent === 'ivy') {
      addGhostMessage('ivy', `Hi ${firstName}. I've been looking forward to this. Let's find your story.`)
    } else {
      addGhostMessage('reid', `Good to meet you, ${firstName}. Let's figure out what we're building.`)
    }

    await delay(1200)

    // Ghost writer's opening line — shown here for UX continuity; studio loads its own first message
    if (uploadedFilePathRef.current) {
      if (assignedAgent === 'ivy') {
        addGhostMessage('ivy', "I've had a look at what you uploaded. There's more here than you might realise. Let me show you what I found.")
      } else {
        addGhostMessage('reid', "I've reviewed your material. Here's what we're working with and what's missing.")
      }
    } else {
      if (assignedAgent === 'ivy') {
        addGhostMessage('ivy', "Do you have anything written already — a chapter, some notes, even a journal entry? Anything at all is useful. If not, that's completely fine.")
      } else {
        addGhostMessage('reid', "Before we start — do you have any existing material? A draft, an outline, notes? Upload whatever you have and I'll tell you what we're working with.")
      }
    }

    setStage('done')

    // Persist to Supabase in background, then redirect
    await saveAndCreateSession(assignedAgent)
    await delay(2500)
    router.push('/ghostwriter/studio')
  }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save profile + create session ─────────────────────────────────────────

  async function saveAndCreateSession(ghost: GhostWriter) {
    const profile = authorProfileRef.current
    if (!profile) return
    try {
      await Promise.all([
        supabase
          .from('author_profiles')
          .update({
            ghostwriter_agent: ghost,
            ghostwriter_onboarding_completed: true,
            ghostwriter_onboarding_completed_at: new Date().toISOString(),
            ghostwriter_book_title: bookTitleRef.current || null,
          })
          .eq('id', profile.id),
        supabase.from('ghostwriter_sessions').insert({
          author_id: profile.id,
          ghost_writer: ghost,
          phase: 1,
          phase_name: 'excavation',
          book_brief: {
            ...bookBriefRef.current,
            uploadedFilePath: uploadedFilePathRef.current ?? null,
          },
          status: 'active',
        }),
      ])
    } catch (err) {
      console.error('Failed to save ghostwriter session:', err)
    }
  }

  // ── Input area ────────────────────────────────────────────────────────────

  function renderInput() {
    switch (stage) {
      case 'loading':
        return null

      case 'welcome':
        return (
          <div className="flex justify-center">
            <button
              onClick={() => { setStage('q1'); edenSays("What's your book about?", 400) }}
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
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleQ1Submit() }}
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
                  <p className="text-xs text-gray-400">{isUploading ? 'Uploading...' : 'Uploaded'}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#2C2C2C] mb-1">Drop your file here or click to browse</p>
                  <p className="text-xs text-gray-400">.pdf, .docx, .txt, .md</p>
                </>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500 text-center">{uploadError}</p>}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
            />
            <div className="flex justify-center">
              <button
                onClick={async () => { await edenSays('What does finishing this book mean to you?', 600); setStage('q4') }}
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
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleQ4Submit() }}
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
        return (
          <div className="flex justify-center py-2">
            <button
              onClick={() => router.push('/ghostwriter/studio')}
              className="px-8 py-3 rounded-xl bg-[#8FAF8A] text-white font-medium text-sm hover:bg-[#7a9e75] transition-colors"
            >
              Open your studio →
            </button>
          </div>
        )

      default:
        return null
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#8FAF8A] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="text-center pt-10 pb-4 flex-shrink-0">
        <div className="inline-flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#8FAF8A] flex items-center justify-center">
            <span className="text-white text-xs font-semibold">E</span>
          </div>
          <span className="text-sm font-medium text-[#2C2C2C]">Eden</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-[680px] mx-auto space-y-4 pt-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} ghost={revealedGhost} />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

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

export default function GhostWriterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
          <div className="w-6 h-6 rounded-full border-2 border-[#8FAF8A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <GhostWriterContent />
    </Suspense>
  )
}
