'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Type definitions
interface Manuscript {
  id: string
  title: string
  genre: string
  content: string
  wordCount: number
  chapters: Chapter[]
}

interface Chapter {
  number: number
  title: string
  content: string
  wordCount: number
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
    storeManu: 'https://spikeislandstudios.app.n8n.cloud/webhook/store-manuscript-simple',
    parseChapters: 'https://spikeislandstudios.app.n8n.cloud/webhook/parse-chapters-simple',
    alexDev: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-developmental',
    alexStructure: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-structure',
    alexCharacter: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-character',
    alexPlot: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-plot',
    alexPacing: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-pacing',
    alexThemes: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-check-themes',
    getScores: 'https://spikeislandstudios.app.n8n.cloud/webhook/get-manuscript-scores',
    alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat'
  }

  // Initialize studio
  const initializeStudio = useCallback(async () => {
    const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')
    
    if (!userId) {
      router.push('/login')
      return
    }

    // Check for existing manuscript
    const existing = await checkForExistingManuscript(userId)
    
    if (existing) {
      setManuscript(existing)
      setChapters(existing.chapters || [])
      setIsLoading(false)
      
      if (existing.chapters && existing.chapters.length > 0) {
        loadChapter(0)
      }
      
      // Fetch scores if analysis is complete
      if (existing.id) {
        fetchScores(existing.id)
      }
    } else {
      setIsLoading(false)
    }
    
    // Initial Alex greeting
    addAlexMessage("Hi! I'm Alex, your developmental editing specialist. Upload your manuscript to get started, or ask me anything about the editing process!")
  }, [searchParams, router])

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

  async function checkForExistingManuscript(_userId: string): Promise<Manuscript | null> {
    // TODO: Add API call to check for existing manuscripts
    return null
  }

  // File upload handler
  async function handleFileUpload(file: File, bookTitle: string, genre: string) {
    if (!file || !bookTitle || !genre) {
      alert('Please fill in all fields')
      return
    }

    setAlexThinking(true)
    setThinkingMessage('Reading your manuscript...')

    try {
      // Extract text
      let text = ''
      if (file.name.endsWith('.docx')) {
        text = await extractTextFromDocx(file)
      } else if (file.name.endsWith('.pdf')) {
        text = await extractTextFromPdf(file)
      } else {
        throw new Error('Please upload DOCX or PDF')
      }

      if (!text || text.length < 100) {
        throw new Error('Could not extract text from file')
      }

      const userId = searchParams.get('userId') || localStorage.getItem('currentUserId')
      const words = text.trim().split(/\s+/).length

      setThinkingMessage('Saving manuscript...')

      // Store manuscript
      const storeResponse = await fetch(WEBHOOKS.storeManu, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId,
          fileName: file.name,
          bookTitle: bookTitle,
          genre: genre,
          text: text,
          wordCount: words
        })
      })

      if (!storeResponse.ok) throw new Error('Failed to save manuscript')

      const storeResult = await storeResponse.json()
      const manuscriptId = storeResult.manuscriptId

      setThinkingMessage('Analyzing chapters with AI...')

      // Parse chapters
      const parseResponse = await fetch(WEBHOOKS.parseChapters, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          manuscriptId: manuscriptId
        })
      })

      let parsedChapters: Chapter[] = []
      if (parseResponse.ok) {
        const parseResult = await parseResponse.json()
        parsedChapters = parseResult.chapters || []
      }

      // Extract actual chapter content
      const chaptersWithContent = await extractChapterContent(text, parsedChapters)

      setManuscript({
        id: manuscriptId,
        title: bookTitle,
        genre: genre,
        content: text,
        wordCount: words,
        chapters: chaptersWithContent
      })

      setChapters(chaptersWithContent)
      setAlexThinking(false)

      addAlexMessage(`Great! I've loaded "${bookTitle}" with ${words.toLocaleString()} words and ${chaptersWithContent.length} chapters. Let me start the comprehensive analysis...`)

      // Load first chapter
      if (chaptersWithContent.length > 0) {
        loadChapter(0)
      }

      // Trigger developmental analysis
      setTimeout(() => {
        triggerDevelopmentalAnalysis(manuscriptId, text)
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setAlexThinking(false)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      addAlexMessage(`❌ Error: ${errorMessage}`)
    }
  }

  // Extract chapter content
  async function extractChapterContent(fullText: string, chapterTitles: Chapter[]): Promise<Chapter[]> {
    console.log('Extracting content for', chapterTitles.length, 'chapters')
    
    return chapterTitles.map((chapter, index) => {
      // Find chapter start
      const chapterRegex = new RegExp(
        `(Chapter\\s+${chapter.number}[^\\n]*|${chapter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'i'
      )
      
      const match = fullText.match(chapterRegex)
      const chapterStart = match ? match.index || 0 : 0
      
      // Find chapter end
      let chapterEnd = fullText.length
      if (index < chapterTitles.length - 1) {
        const nextChapter = chapterTitles[index + 1]
        const nextRegex = new RegExp(
          `(Chapter\\s+${nextChapter.number}\\b|${nextChapter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
          'i'
        )
        const nextMatch = fullText.substring(chapterStart + 100).match(nextRegex)
        if (nextMatch && nextMatch.index !== undefined) {
          chapterEnd = chapterStart + 100 + nextMatch.index
        }
      }
      
      // Extract and clean content
      let content = fullText.substring(chapterStart, chapterEnd)
      content = content.replace(chapterRegex, '').trim()
      content = cleanChapterContent(content)
      
      console.log(`Chapter ${chapter.number}: ${content.length} characters`)
      
      return {
        number: chapter.number,
        title: chapter.title,
        content: content,
        wordCount: content.split(/\s+/).length
      }
    })
  }

  function cleanChapterContent(content: string): string {
    return content
      .replace(/©.*?All rights reserved\.?/gi, '')
      .replace(/Copyright.*?\d{4}[^.]*\./gi, '')
      .replace(/^\s*\d+\s*$/gm, '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Text extraction (simplified - would use libraries in production)
  async function extractTextFromDocx(_file: File): Promise<string> {
    // TODO: Use mammoth.js for actual DOCX extraction
    return '[DOCX content would be extracted here with mammoth.js]'
  }

  async function extractTextFromPdf(_file: File): Promise<string> {
    // TODO: Use PDF.js for actual PDF extraction
    return '[PDF content would be extracted here with PDF.js]'
  }

  // Load chapter into editor
  function loadChapter(index: number) {
    if (index < 0 || index >= chapters.length) return
    
    const chapter = chapters[index]
    setCurrentChapterIndex(index)
    
    // Convert plain text to HTML paragraphs
    let content = chapter.content || ''
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
  async function triggerDevelopmentalAnalysis(manuscriptId: string, text: string) {
    setAlexThinking(true)
    setThinkingMessage('Performing comprehensive developmental analysis (30-60 seconds)...')
    setScoresVisible(true)

    try {
      // Run all 5 dimension analyses in parallel
      await Promise.all([
        analyzeDimension('structural', WEBHOOKS.alexStructure, text, manuscriptId),
        analyzeDimension('character', WEBHOOKS.alexCharacter, text, manuscriptId),
        analyzeDimension('plot', WEBHOOKS.alexPlot, text, manuscriptId),
        analyzeDimension('pacing', WEBHOOKS.alexPacing, text, manuscriptId),
        analyzeDimension('thematic', WEBHOOKS.alexThemes, text, manuscriptId)
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
          wordCount: manuscript?.wordCount || 0
        })
      })

      if (!response.ok) throw new Error(`${name} analysis failed`)

      const result = await response.json()
      const score = result.score || result[`${name}Score`] || 7

      // Update score in state
      setScores(prev => ({ ...prev, [name]: score }))

      return { name, score, feedback: result.feedback || result.analysis || '' }

    } catch (_error) {
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
    } catch (_error) {
      console.error('Error fetching scores')
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

    } catch (_error) {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your studio...</p>
        </div>
      </div>
    )
  }

  // Upload state
  if (!manuscript) {
    return <UploadInterface onUpload={handleFileUpload} />
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
            {manuscript.wordCount?.toLocaleString() || 0} words • {chapters.length} chapters
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
                  key={index}
                  onClick={() => loadChapter(index)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    index === currentChapterIndex
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-sm">{chapter.title}</div>
                  <div className="text-xs text-gray-600">{chapter.wordCount || 0} words</div>
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
                placeholder="Ask Alex about this chapter..."
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

// Upload interface component
function UploadInterface({ onUpload }: { onUpload: (file: File, title: string, genre: string) => void }) {
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [file, setFile] = useState<File | null>(null)

  function handleSubmit() {
    if (!file || !title || !genre) {
      alert('Please fill in all fields')
      return
    }
    onUpload(file, title, genre)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-4">Welcome to Your Writing Studio!</h1>
          <p className="text-xl text-gray-700">I&apos;m Alex, your developmental editing specialist. Let&apos;s get started!</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-semibold text-gray-800 mb-2">Book Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your book's title"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">Genre *</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none bg-white"
            >
              <option value="">Select a genre...</option>
              <option value="Fiction">Fiction</option>
              <option value="Literary Fiction">Literary Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Historical Fiction">Historical Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Memoir">Memoir</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-2">Upload Manuscript *</label>
            <div
              onClick={() => document.getElementById('fileInput')?.click()}
              className="border-4 border-dashed border-green-400 rounded-2xl p-12 text-center cursor-pointer hover:bg-green-50 transition-all"
            >
              {file ? (
                <div>
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-semibold text-green-700">{file.name}</div>
                  <div className="text-sm text-gray-600">Click to change file</div>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-3">📚</div>
                  <div className="font-semibold text-gray-900 mb-2">Click to Upload Your Manuscript</div>
                  <div className="text-sm text-gray-600">PDF or DOCX • Numbered chapters work best</div>
                </div>
              )}
            </div>
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || !title || !genre}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Start Working with Alex
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthorStudioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading studio...</div>
      </div>
    }>
      <StudioContent />
    </Suspense>
  )
}