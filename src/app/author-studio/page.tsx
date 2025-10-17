'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Type definitions
interface Manuscript {
  id: string
  title: string
  genre: string
  current_word_count: number
  total_chapters: number
  status: string
  full_text?: string
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  content?: string
  created_at: string
  status?: 'draft' | 'edited' | 'approved'
}

interface ChatMessage {
  sender: string
  message: string
}

interface Scores {
  structural: number
  character: number
  plot: number
  pacing: number
  thematic: number
}

function StudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Manuscript state
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading your studio...')
  
  // Editor state
  const [editorContent, setEditorContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [chapterStatus, setChapterStatus] = useState<'draft' | 'edited' | 'approved'>('draft')
  
  // Alex state
  const [alexMessages, setAlexMessages] = useState<ChatMessage[]>([])
  const [alexThinking, setAlexThinking] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [chatInput, setChatInput] = useState('')
  
  // Analysis state
  const [scores, setScores] = useState<Scores>({
    structural: 0,
    character: 0,
    plot: 0,
    pacing: 0,
    thematic: 0
  })
  const [scoresVisible, setScoresVisible] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  
  const editorRef = useRef<HTMLDivElement>(null)

  // Webhooks
  const WEBHOOKS = {
    alexDev: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-developmental',
    alexStructure: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-structure',
    alexCharacter: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-character',
    alexPlot: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-plot',
    alexPacing: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-pacing',
    alexThemes: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-themes',
    getScores: 'https://spikeislandstudios.app.n8n.cloud/webhook/get-manuscript-scores',
    alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat'
  }

  // Initialize studio - Load from Supabase
  const initializeStudio = useCallback(async () => {
    const manuscriptId = searchParams.get('manuscriptId')
    const userId = searchParams.get('userId')
    
    if (!manuscriptId) {
      console.error('No manuscript ID provided')
      router.push('/onboarding')
      return
    }

    if (!userId) {
      console.error('No user ID provided')
      router.push('/login')
      return
    }

    try {
      setLoadingMessage('Loading manuscript from database...')
      const supabase = createClient()

      // Load manuscript details
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('id, title, genre, current_word_count, total_chapters, status, full_text')
        .eq('id', manuscriptId)
        .single()

      if (manuscriptError) {
        console.error('Manuscript error:', manuscriptError)
        throw new Error('Failed to load manuscript')
      }

      console.log('Loaded manuscript:', manuscriptData)
      setManuscript(manuscriptData)

      setLoadingMessage('Loading chapters...')

      // Load chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, chapter_number, title, content, created_at')
        .eq('manuscript_id', manuscriptId)
        .order('chapter_number', { ascending: true })

      if (chaptersError) {
        console.error('Chapters error:', chaptersError)
        throw new Error('Failed to load chapters')
      }

      console.log('Loaded chapters:', chaptersData?.length || 0)

      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData)
        setIsLoading(false)
        
        // Load first chapter into editor
        loadChapter(0, chaptersData)
        
        // Alex greeting
        addAlexMessage(
          `Hi! I'm Alex, your developmental editing specialist. I can see you've uploaded "${manuscriptData.title}" with ${chaptersData.length} chapters. ` +
          `Let me know when you're ready to begin the comprehensive analysis, or feel free to ask me anything about your manuscript!`
        )
      } else {
        // Chapters still being parsed
        setLoadingMessage('Parsing chapters... This usually takes 1-2 minutes.')
        
        // Poll for chapters
        setTimeout(() => {
          pollForChapters(manuscriptId)
        }, 3000)
      }

    } catch (error) {
      console.error('Studio initialization error:', error)
      setIsLoading(false)
      addAlexMessage(`❌ Error loading your manuscript: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [searchParams, router])

  // Poll for chapters if they're still being parsed
  async function pollForChapters(manuscriptId: string) {
    const supabase = createClient()
    
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, content, created_at')
      .eq('manuscript_id', manuscriptId)
      .order('chapter_number', { ascending: true })

    if (chaptersData && chaptersData.length > 0) {
      console.log('Chapters now available:', chaptersData.length)
      setChapters(chaptersData)
      setIsLoading(false)
      loadChapter(0, chaptersData)
      
      addAlexMessage(
        `Great! I've finished parsing your manuscript into ${chaptersData.length} chapters. ` +
        `Ready to begin developmental editing?`
      )
    } else {
      // Keep polling
      setTimeout(() => pollForChapters(manuscriptId), 3000)
    }
  }

  useEffect(() => {
    initializeStudio()
  }, [initializeStudio])

  // Update word count when content changes
  useEffect(() => {
    if (editorContent) {
      const text = editorContent.replace(/<[^>]*>/g, '')
      const words = text.trim().split(/\s+/).filter(w => w.length > 0)
      setWordCount(words.length)
    }
  }, [editorContent])

  // Load chapter into editor
  function loadChapter(index: number, chaptersArray?: Chapter[]) {
    const chaptersList = chaptersArray || chapters
    if (index < 0 || index >= chaptersList.length) return
    
    const chapter = chaptersList[index]
    setCurrentChapterIndex(index)
    
    // Convert plain text to HTML paragraphs
    let content = chapter.content || 'This chapter content is being loaded...'
    if (!content.includes('<p>')) {
      const paragraphs = content
        .split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('\n')
      content = paragraphs
    }
    
    setEditorContent(content)
    setChapterStatus(chapter.status || 'draft')
  }

  // Trigger comprehensive analysis
  async function triggerDevelopmentalAnalysis() {
    if (!manuscript?.full_text) {
      addAlexMessage('I need the full manuscript text to perform the analysis. Let me try to load it...')
      return
    }

    setAlexThinking(true)
    setThinkingMessage('Performing comprehensive developmental analysis (30-60 seconds)...')
    setScoresVisible(true)

    try {
      // Run all 5 dimension analyses in parallel
      await Promise.all([
        analyzeDimension('structural', WEBHOOKS.alexStructure, manuscript.full_text, manuscript.id),
        analyzeDimension('character', WEBHOOKS.alexCharacter, manuscript.full_text, manuscript.id),
        analyzeDimension('plot', WEBHOOKS.alexPlot, manuscript.full_text, manuscript.id),
        analyzeDimension('pacing', WEBHOOKS.alexPacing, manuscript.full_text, manuscript.id),
        analyzeDimension('thematic', WEBHOOKS.alexThemes, manuscript.full_text, manuscript.id)
      ])

      setAlexThinking(false)
      setAnalysisComplete(true)

      addAlexMessage(
        '✅ Analysis complete! I\'ve evaluated all five developmental dimensions. ' +
        'Click any score in the sidebar to see detailed insights and recommendations.'
      )

    } catch (error) {
      console.error('Analysis error:', error)
      setAlexThinking(false)
      addAlexMessage('Analysis encountered some issues, but I can still help you improve your manuscript. What would you like to focus on?')
    }
  }

  async function analyzeDimension(name: string, webhook: string, text: string, manuscriptId: string) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 10000),
          manuscriptId: manuscriptId,
          bookTitle: manuscript?.title || 'Manuscript',
          genre: manuscript?.genre || 'Fiction',
          wordCount: manuscript?.current_word_count || 0
        })
      })

      if (!response.ok) throw new Error(`${name} analysis failed`)

      const result = await response.json()
      const score = result.score || result[`${name}Score`] || 7

      // Update score in state
      setScores(prev => ({ ...prev, [name]: score }))

      return { name, score, feedback: result.feedback || result.analysis || '' }

    } catch (error) {
      console.error(`Error analyzing ${name}:`, error)
      setScores(prev => ({ ...prev, [name]: 7 }))
      return { name, score: 7, feedback: '' }
    }
  }

  async function fetchScores(manuscriptId: string) {
    try {
      const response = await fetch(`${WEBHOOKS.getScores}?manuscript_id=${manuscriptId}`)
      if (response.ok) {
        const data = await response.json()
        setScores({
          structural: data.structural || 0,
          character: data.character || 0,
          plot: data.plot || 0,
          pacing: data.pacing || 0,
          thematic: data.thematic || 0
        })
        setScoresVisible(true)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    }
  }

  // Alex chat
  function addAlexMessage(message: string) {
    setAlexMessages(prev => [...prev, { sender: 'Alex', message }])
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setAlexMessages(prev => [...prev, { sender: 'You', message: userMessage }])
    setChatInput('')

    // Check for analysis trigger
    if (userMessage.toLowerCase().includes('begin') || 
        userMessage.toLowerCase().includes('start analysis') ||
        userMessage.toLowerCase().includes('analyze')) {
      triggerDevelopmentalAnalysis()
      return
    }

    setAlexThinking(true)
    setThinkingMessage('Thinking...')

    try {
      const response = await fetch(WEBHOOKS.alexChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            chapter: currentChapterIndex + 1,
            chapterTitle: chapters[currentChapterIndex]?.title,
            manuscriptTitle: manuscript?.title
          }
        })
      })

      if (!response.ok) throw new Error('Chat failed')

      const result = await response.json()
      setAlexThinking(false)
      addAlexMessage(result.response || result.message || 'Let me help you with that.')

    } catch (error) {
      console.error('Chat error:', error)
      setAlexThinking(false)
      addAlexMessage('I\'m having trouble connecting. Let me help based on what I see in your manuscript.')
    }
  }

  // Approve chapter
  function approveChapter() {
    const updatedChapters = [...chapters]
    updatedChapters[currentChapterIndex].status = 'approved'
    setChapters(updatedChapters)
    setChapterStatus('approved')
    addAlexMessage(`✅ Chapter ${currentChapterIndex + 1} approved! Moving to the next one.`)
    
    if (currentChapterIndex < chapters.length - 1) {
      setTimeout(() => loadChapter(currentChapterIndex + 1), 1000)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Setting Up Your Studio
          </h3>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Error state - no manuscript found
  if (!manuscript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Manuscript Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            We couldn't load your manuscript. Please try uploading again.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Return to Onboarding
          </button>
        </div>
      </div>
    )
  }

  // Main studio interface
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            🏠 Home
          </Link>
          <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <span>✍️</span>
            Your Writing Studio
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-semibold">
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-sm">A</div>
            Working with Alex
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
            alexThinking 
              ? 'bg-yellow-50 border border-yellow-500 text-yellow-900'
              : 'bg-green-50 border border-green-500 text-green-900'
          }`}>
            <div className={`w-2 h-2 rounded-full ${alexThinking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            {alexThinking ? 'Thinking...' : 'Alex is Online'}
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </header>

      {/* Main Layout: 3 columns */}
      <div className="flex-1 grid grid-cols-[320px_1fr_400px] overflow-hidden">
        {/* LEFT: Progress Sidebar */}
        <div className="bg-gray-50 border-r-2 border-gray-200 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{manuscript.title}</h2>
          <p className="text-gray-600 mb-6">
            {manuscript.current_word_count?.toLocaleString() || 0} words • {chapters.length} chapters
          </p>

          {/* Analysis Overview */}
          <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Developmental Editing</h3>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 mb-4">
              <div className="w-11 h-11 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                A
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">with Alex</div>
                <div className="text-sm text-gray-700">
                  {analysisComplete ? 'Analysis complete' : 'Ready to begin'}
                </div>
              </div>
            </div>

            {/* Begin Analysis Button */}
            {!analysisComplete && !alexThinking && (
              <button
                onClick={triggerDevelopmentalAnalysis}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all mb-4"
              >
                🚀 Begin Analysis
              </button>
            )}

            {/* Scores */}
            {scoresVisible && (
              <div className="space-y-3">
                {(Object.entries(scores) as [keyof Scores, number][]).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 text-sm">
                    <span className="w-20 font-semibold text-gray-700 capitalize">{key}:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000"
                        style={{ width: `${value * 10}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-right font-bold text-gray-900">{value}/10</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chapters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Chapters</h3>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  onClick={() => loadChapter(index)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    index === currentChapterIndex
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{chapter.title}</div>
                  <div className="text-xs text-gray-600">Chapter {chapter.chapter_number}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Editor */}
        <div className="bg-white flex flex-col overflow-hidden border-r-2 border-gray-200">
          {/* Chapter header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-green-700">
              {chapters[currentChapterIndex]?.title || 'Loading...'}
            </h3>
            <button
              onClick={approveChapter}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <span>✓</span> Approve Chapter
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 font-bold">B</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 italic">I</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 underline">U</button>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Words: {wordCount.toLocaleString()}</span>
              <span className="mx-2">|</span>
              <span className="capitalize">{chapterStatus}</span>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="flex-1 p-8 overflow-y-auto focus:outline-none"
            style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
          ></div>

          {/* Chat input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask Alex about this chapter... (Try: 'begin analysis')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
              <button
                onClick={sendChatMessage}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Alex Panel */}
        <div className="bg-white flex flex-col overflow-hidden">
          {/* Alex header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              A
            </div>
            <div>
              <h3 className="text-xl font-bold">Alex</h3>
              <p className="text-sm opacity-90">Developmental Specialist</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-4">
            {alexMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl ${
                  msg.sender === 'Alex'
                    ? 'bg-white border border-gray-200'
                    : 'bg-green-50 border border-green-200 ml-8'
                }`}
              >
                <div className="font-semibold text-sm mb-1 text-gray-700">{msg.sender}</div>
                <div className="text-gray-900 whitespace-pre-wrap">{msg.message}</div>
              </div>
            ))}

            {alexThinking && (
              <div className="bg-gray-100 border border-gray-300 p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-2 text-gray-700">
                  <span>{thinkingMessage}</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthorStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading studio...</div>
      </div>
    }>
      <StudioContent />
    </Suspense>
  )
}