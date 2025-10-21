'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Chapter editing state
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingChapterTitle, setEditingChapterTitle] = useState('')

  // Alex state
  const [alexMessages, setAlexMessages] = useState<ChatMessage[]>([])
  const [alexThinking, setAlexThinking] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [chatInput, setChatInput] = useState('')

  // Analysis state
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [initialReportPdfUrl, setInitialReportPdfUrl] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // Refs
  const editorRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const alexMessagesRef = useRef<HTMLDivElement>(null)

  // Webhooks
  const WEBHOOKS = {
    initialAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-initial-analysis',
    alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat'
  }

  // Scroll to bottom function
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [alexMessages, alexThinking])

  // Add this with your other functions (probably after useEffect hooks)
  const triggerFullAnalysis = async () => {
    if (!manuscript?.id) {
      console.error('No manuscript ID available for analysis');
      return;
    }

    const supabase = createClient();

    try {
      console.log('Triggering full manuscript analysis for:', manuscript.id);

      const response = await fetch('https://spikeislandstudios.app.n8n.cloud/webhook/alex-full-manuscript-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: manuscript.id,
          userId: searchParams.get('userId')
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis trigger failed: ${response.status}`);
      }

      console.log('Full manuscript analysis triggered successfully');

      // Update manuscript status in database to show analysis is running
      const { error } = await supabase
        .from('manuscripts')
        .update({
          status: 'analysis_running',
          analysis_started_at: new Date().toISOString()
        })
        .eq('id', manuscriptId);

      if (error) {
        console.error('Error updating manuscript status:', error);
      }

    } catch (error) {
      console.error('Error triggering full analysis:', error);
      toast.error('Failed to start analysis. Please refresh and try again.');
    }
  };

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
      console.log('Querying chapters for manuscript_id:', manuscriptId)

      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .order('chapter_number', { ascending: true })

      console.log('Chapters query result:', {
        data: chaptersData,
        error: chaptersError,
        count: chaptersData?.length || 0
      })

      if (chaptersError) {
        console.error('Chapters query error:', chaptersError)
      }

      console.log('Loaded chapters:', chaptersData?.length || 0)

      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData)
        setIsLoading(false)

        // Load first chapter into editor
        loadChapter(0, chaptersData)

        // Alex's NEW greeting
        addAlexMessage(
          `Welcome! I'm Alex, your developmental editor. I can see you've uploaded "${manuscriptData.title}" with ${chaptersData.length} chapters.\n\n` +
          `Before we dive in, let me explain how we'll work together:\n\n` +
          `📖 **Phase 1: Story Foundation** - We'll start by examining your story's core structure, ensuring your narrative foundation is solid.\n\n` +
          `👥 **Phase 2: Character Depth** - Next, we'll develop your characters, making sure they're compelling and authentic.\n\n` +
          `🎬 **Phase 3: Scene Craft** - Then we'll refine individual scenes for maximum impact.\n\n` +
          `✨ **Phase 4: Polish** - Finally, we'll polish your prose to publication quality.\n\n` +
          `But first, take a moment to:\n` +
          `✏️ Check that all chapter titles are correct (click the ✏️ icon to edit)\n` +
          `🧹 Make sure you've removed page numbers, headers, and copyright text\n` +
          `📝 Edit any content that needs cleaning up in the main editor\n` +
          `💾 Click "Save" when you make changes\n\n` +
          `Once you're happy with everything, just type **"Yes"** and I'll read your manuscript to get started!`
        )
      } else {
        // Chapters still being parsed
        const pollingMessages = [
          'Parsing chapters... Just a moment...',
          'Analyzing chapter structure...',
          'Almost there...',
          'Finalizing chapter data...'
        ]

        let messageIndex = 0
        setLoadingMessage(pollingMessages[0])

        const messageInterval = setInterval(() => {
          messageIndex = (messageIndex + 1) % pollingMessages.length
          setLoadingMessage(pollingMessages[messageIndex])
        }, 5000)

        let pollCount = 0
        const maxPolls = 20

        const pollInterval = setInterval(async () => {
          pollCount++
          console.log(`Polling for chapters (${pollCount}/${maxPolls})...`)

          const { data: retryChapters } = await supabase
            .from('chapters')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .order('chapter_number', { ascending: true })

          if (retryChapters && retryChapters.length > 0) {
            console.log('✅ Chapters now available:', retryChapters.length)
            clearInterval(pollInterval)
            clearInterval(messageInterval)
            setChapters(retryChapters)
            setIsLoading(false)
            loadChapter(0, retryChapters)

            addAlexMessage(
              `Great! I've finished parsing your manuscript into ${retryChapters.length} chapters. ` +
              `Ready to begin developmental editing?`
            )
          } else if (pollCount >= maxPolls) {
            console.warn('⚠️ Chapters not found after polling')
            clearInterval(pollInterval)
            clearInterval(messageInterval)
            setIsLoading(false)
            addAlexMessage(
              'Your manuscript was uploaded successfully, but chapters are still being processed. ' +
              'Please refresh the page in a moment to see your chapters.'
            )
          }
        }, 3000)
      }

    } catch (error) {
      console.error('Studio initialization error:', error)
      setIsLoading(false)
      addAlexMessage(`❌ Error loading your manuscript: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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

  // Add this useEffect with your other useEffect hooks
  useEffect(() => {
    // Check if we should auto-trigger the full analysis
    const shouldTriggerAnalysis =
      manuscript &&
      manuscript.id &&
      searchParams.get('userId') &&
      manuscript.status === 'chapters_parsed' &&
      !manuscript.full_analysis_completed_at &&
      manuscript.status !== 'analysis_running';

    if (shouldTriggerAnalysis) {
      console.log('Auto-triggering full manuscript analysis...');

      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        triggerFullAnalysis();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [manuscript, searchParams]);

  // Load chapter into editor
  function loadChapter(index: number, chaptersArray?: Chapter[]) {
    const chaptersList = chaptersArray || chapters
    if (index < 0 || index >= chaptersList.length) return

    const chapter = chaptersList[index]
    setCurrentChapterIndex(index)

    // Convert plain text to HTML paragraphs and clean up
    let content = chapter.content || 'This chapter content is being loaded...'

    // Remove "Chapter X - Title" prefix
    content = content.replace(/^Chapter\s+\d+\s*-\s*[^\n]+\n*/i, '')

    // Remove copyright footer patterns
    content = content.replace(/The Veil and the Flame\s*©.*?\d+\s*$/gmi, '')

    // Clean up extra whitespace
    content = content.trim()

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
    setHasUnsavedChanges(false)
  }

  // Chapter title editing functions
  function startEditingTitle(chapterId: string, currentTitle: string) {
    setEditingChapterId(chapterId)
    setEditingChapterTitle(currentTitle)
  }

  function saveChapterTitle(index: number) {
    const updatedChapters = [...chapters]
    updatedChapters[index].title = editingChapterTitle
    setChapters(updatedChapters)
    setEditingChapterId(null)
    setHasUnsavedChanges(true)
    addAlexMessage(`✏️ Chapter title updated. Don't forget to click Save!`)
  }

  // Save changes to Supabase
  async function saveChanges() {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: chapters[currentChapterIndex].title,
          content: editorContent
        })
        .eq('id', chapters[currentChapterIndex].id)

      if (error) throw error

      setHasUnsavedChanges(false)
      addAlexMessage('✅ Changes saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      addAlexMessage('❌ Error saving changes. Please try again.')
    }
  }

  // Trigger initial analysis
  async function triggerInitialAnalysis() {
    setAlexThinking(true)

    const analysisSteps = [
      { message: '📖 Reading your manuscript...', delay: 0 },
      { message: '🎭 Understanding your characters...', delay: 3000 },
      { message: '📊 Assessing the pace...', delay: 6000 },
      { message: '✨ Nice! I like what I see so far...', delay: 9000 },
      { message: '🔍 Analyzing story structure...', delay: 12000 },
      { message: '🎯 Identifying key strengths...', delay: 15000 },
    ]

    // Show progressive messages
    analysisSteps.forEach(step => {
      setTimeout(() => {
        setThinkingMessage(step.message)
      }, step.delay)
    })

    try {
      const response = await fetch(WEBHOOKS.initialAnalysis, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: manuscript?.id,
          manuscriptText: manuscript?.full_text,
          bookTitle: manuscript?.title,
          genre: manuscript?.genre,
          wordCount: manuscript?.current_word_count,
          totalChapters: chapters.length
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()

      setAlexThinking(false)
      setAnalysisComplete(true)
      setInitialReportPdfUrl(result.pdfUrl)

      addAlexMessage(
        `✅ I've finished reading your manuscript! Here are my initial impressions:\n\n` +
        `${result.summary || result.feedback?.hook || "I can see you have a compelling story here. I'm ready to help you develop it further."}\n\n` +
        `📊 Excitement Level: ${result.excitementStars || '⭐'.repeat(result.excitementLevel || 7)}\n\n` +
        `📄 I've created a detailed Initial Assessment Report that you can review anytime by clicking the "View Report" button above.\n\n` +
        `Ready to dive deeper into Phase 1?`
      )

    } catch (error) {
      console.error('Analysis error:', error)
      setAlexThinking(false)
      addAlexMessage('I had trouble completing the full analysis, but I can still help you. What would you like to focus on?')
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

    // Scroll to bottom after adding user message
    setTimeout(scrollToBottom, 100)

    // Check for "Yes" to trigger initial analysis
    if (userMessage.toLowerCase().includes('yes') && !analysisComplete) {
      triggerInitialAnalysis()
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
            manuscriptTitle: manuscript?.title,
            analysisComplete: analysisComplete
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
  async function approveChapter() {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          status: 'approved',
          content: editorContent
        })
        .eq('id', chapters[currentChapterIndex].id)

      if (error) throw error

      const updatedChapters = [...chapters]
      updatedChapters[currentChapterIndex].status = 'approved'
      setChapters(updatedChapters)
      setChapterStatus('approved')
      setHasUnsavedChanges(false)

      addAlexMessage(`✅ Chapter ${currentChapterIndex + 1} approved! Great work.`)

      if (currentChapterIndex < chapters.length - 1) {
        setTimeout(() => loadChapter(currentChapterIndex + 1), 1000)
      }
    } catch (error) {
      console.error('Approve error:', error)
      addAlexMessage('❌ Error approving chapter. Please try again.')
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

  // Error state
  if (!manuscript) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Manuscript Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            Unable to load your manuscript. Please try uploading again.
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
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${alexThinking
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

      {/* Add this near the top of your main content, maybe after the header */}
      {manuscript?.status === 'analysis_running' && !manuscript?.full_analysis_completed_at && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <BookOpen className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Analysis in Progress</AlertTitle>
          <AlertDescription className="text-green-700">
            Alex is reading your entire manuscript and creating your developmental editing roadmap.
            This takes about 6 minutes. You will receive an email when complete, and you can continue
            working on other things in the meantime.
          </AlertDescription>
        </Alert>
      )}

      {/* Show when analysis is complete */}
      {manuscript?.full_analysis_completed_at && (
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Analysis Complete!</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your developmental editing roadmap has been emailed to you. Ready to start editing?
            <Button
              onClick={() => {
                addAlexMessage('Great! Let\'s begin with structural editing. I\'ll guide you through each chapter.');
              }}
              className="ml-2 h-8"
              variant="outline"
            >
              Begin Structural Editing
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Layout: 3 columns */}
      <div className="flex-1 grid grid-cols-[320px_1fr_400px] overflow-hidden">
        {/* LEFT: Chapter Navigation */}
        <div className="bg-gray-50 border-r-2 border-gray-200 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{manuscript.title}</h2>
          <p className="text-gray-600 mb-6">
            {manuscript.current_word_count?.toLocaleString() || 0} words • {chapters.length} chapters
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Chapters</h3>
            <div className="space-y-2">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${index === currentChapterIndex
                    ? 'bg-green-50 border-green-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 flex-1"
                      onClick={() => loadChapter(index)}
                    >
                      <span className="text-xs font-semibold text-gray-500">
                        {chapter.chapter_number === 0 ? 'Prologue' :
                          chapter.chapter_number === 999 ? 'Epilogue' :
                            `Ch ${chapter.chapter_number}`}
                      </span>
                      {editingChapterId === chapter.id ? (
                        <input
                          type="text"
                          value={editingChapterTitle}
                          onChange={(e) => setEditingChapterTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => saveChapterTitle(index)}
                          onKeyPress={(e) => e.key === 'Enter' && saveChapterTitle(index)}
                          className="text-sm font-medium text-gray-900 border-b border-green-500 focus:outline-none flex-1"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {chapter.title}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingTitle(chapter.id, chapter.title);
                      }}
                      className="text-gray-400 hover:text-green-600 text-xs ml-2"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Editor */}
        <div className="bg-white flex flex-col overflow-hidden border-r-2 border-gray-200">
          {/* Chapter header with Save and Approve buttons */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-green-700">
              {chapters[currentChapterIndex]?.title || 'Loading...'}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={saveChanges}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${hasUnsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <span>💾</span> Save
              </button>
              <button
                onClick={approveChapter}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <span>✓</span> Approve Chapter
              </button>
            </div>
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
              {hasUnsavedChanges && <span className="mx-2 text-blue-600">• Unsaved</span>}
            </div>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="flex-1 p-8 overflow-y-auto focus:outline-none"
            style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={(e) => {
              setEditorContent(e.currentTarget.innerHTML)
              setHasUnsavedChanges(true)
            }}
          ></div>

          {/* Chat input */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask Alex anything..."
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
          {/* Alex header with Report button */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                A
              </div>
              <div>
                <h3 className="text-xl font-bold">Alex</h3>
                <p className="text-sm opacity-90">Developmental Specialist</p>
              </div>
            </div>

            {/* Report Access Button */}
            {initialReportPdfUrl && (
              <button
                onClick={() => setShowReportPanel(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <span>📄</span> View Report
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            ref={alexMessagesRef}
            className="flex-1 overflow-y-auto p-5 bg-gray-50 space-y-4"
          >
            {alexMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl ${msg.sender === 'Alex'
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

            {/* Invisible div for scrolling to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Report Overlay Panel */}
      {showReportPanel && initialReportPdfUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Alex Initial Analysis</h3>
                  <p className="text-sm text-gray-600">First Impressions Report</p>
                </div>
              </div>
              <div className="flex items-center gap-3">

                <a href={initialReportPdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <span>⬇️</span> Download PDF
                </a>
                <button
                  onClick={() => setShowReportPanel(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={initialReportPdfUrl}
                className="w-full h-full"
                title="Alex's Initial Analysis Report"
              />
            </div>
          </div>
        </div>
      )}
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