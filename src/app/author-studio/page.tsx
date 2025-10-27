'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, CheckCircle } from 'lucide-react'

// Add these component imports
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
  full_analysis_completed_at?: string
  analysis_started_at?: string
  developmental_phase_completed_at?: string  // 🆕 Add this
  line_editing_started_at?: string  // 🆕 Add this
  developmental_version?: string  // 🆕 Add this
  developmental_version_created_at?: string  // 🆕 Add this
  manuscript_summary?: string
  full_analysis_key_points?: string
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  content?: string
  created_at: string
  status?: 'draft' | 'edited' | 'approved'
  word_count?: number  // Add this line
}

interface ChatMessage {
  sender: string
  message: string
}

interface ManuscriptIssue {
  id: string
  manuscript_id: string
  chapter_number: number
  element_type: 'character' | 'plot' | 'pacing' | 'structure' | 'theme'
  severity: 'minor' | 'moderate' | 'major'
  issue_description: string
  alex_suggestion: string
  status: 'flagged' | 'in_progress' | 'resolved' | 'dismissed'
  location_in_text?: string
  created_at: string
  updated_at?: string
}

type ChapterEditingStatus = 'not_started' | 'analyzing' | 'ready'

function StudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authorFirstName, setAuthorFirstName] = useState<string>('')
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1)
  const [editorName, setEditorName] = useState('Alex')
  const [editorColor, setEditorColor] = useState('green')

  // Manuscript state
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading your studio...')
  const [isChapterSidebarCollapsed, setIsChapterSidebarCollapsed] = useState(false)

  // Editor state
  const [editorContent, setEditorContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [chapterStatus, setChapterStatus] = useState<'draft' | 'edited' | 'approved'>('draft')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Chapter editing state
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingChapterTitle, setEditingChapterTitle] = useState('')
  // Add this new state near the top with other state declarations
  const [unsavedChapterContent, setUnsavedChapterContent] = useState<{
    [chapterId: string]: string
  }>({})
  // Add this with your other state declarations
  const [analyzingMessage, setAnalyzingMessage] = useState<string>('Analyzing...')

  // Alex state
  const [alexMessages, setAlexMessages] = useState<ChatMessage[]>([])
  const [alexThinking, setAlexThinking] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [chatInput, setChatInput] = useState('')

  // Analysis state
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [fullReportPdfUrl, setFullReportPdfUrl] = useState<string | null>(null)
  const [showReportPanel, setShowReportPanel] = useState(false)

  // Chapter editing status state
  const [chapterEditingStatus, setChapterEditingStatus] = useState<{
    [chapterNumber: number]: ChapterEditingStatus
  }>({})
  const [chapterIssueCount, setChapterIssueCount] = useState<{
    [chapterNumber: number]: number
  }>({})

  // Track unsaved chapters
  const [unsavedChapters, setUnsavedChapters] = useState<Set<string>>(new Set())

  // Full analysis in progress state
  const [fullAnalysisInProgress, setFullAnalysisInProgress] = useState(false)

  // Issues state
  const [chapterIssues, setChapterIssues] = useState<ManuscriptIssue[]>([])
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<ManuscriptIssue | null>(null)
  const [issueFilter, setIssueFilter] = useState<'all' | 'character' | 'plot' | 'pacing' | 'structure' | 'theme'>('all')

  // Refs
  const editorRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const alexMessagesRef = useRef<HTMLDivElement>(null)

  // Handover banner state
  const [showPhase2Banner, setShowPhase2Banner] = useState(false)

  const WEBHOOKS = {
    fullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-full-manuscript-analysis',
    generateSummaryPoints: 'https://spikeislandstudios.app.n8n.cloud/webhook/generate-summary-points',
    chapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chapter-analysis',
    alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat',
    chapterSummaries: 'https://spikeislandstudios.app.n8n.cloud/webhook/generate-chapter-summaries'
  }

  // Scroll to bottom function
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [alexMessages, alexThinking])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChapters.size > 0) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [unsavedChapters])

  // Load chapter issues
  const loadChapterIssues = async (chapterNumber: number) => {
    const supabase = createClient()

    try {
      const { data: issues, error } = await supabase
        .from('manuscript_issues')
        .select('*')
        .eq('manuscript_id', manuscript?.id)
        .eq('chapter_number', chapterNumber)
        .order('severity', { ascending: false }) // Major issues first
        .order('created_at', { ascending: true })

      if (error) throw error

      setChapterIssues(issues || [])
      console.log(`Loaded ${issues?.length || 0} issues for chapter ${chapterNumber}`)

    } catch (error) {
      console.error('Error loading issues:', error)
      setChapterIssues([])
    }
  }

  // Helper function to add Alex messages to chat
  function addAlexMessage(message: string, sender: 'Alex' | 'user' = 'Alex') {
    setAlexMessages(prev => [...prev, { sender: sender === 'user' ? 'You' : 'Alex', message }])
  }

  // Update issue status
  async function updateIssueStatus(issueId: string, newStatus: 'flagged' | 'in_progress' | 'resolved' | 'dismissed') {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('manuscript_issues')
        .update({ status: newStatus })
        .eq('id', issueId)

      if (error) throw error

      // Reload issues to reflect changes
      await loadChapterIssues(chapters[currentChapterIndex].chapter_number)

      // Remove the addAlexMessage line that was causing the error

    } catch (error) {
      console.error('Error updating issue:', error)
    }
  }

  const discussIssue = async (issue: ManuscriptIssue) => {
    const userMessage = `Discussion Note: "${issue.issue_description}"`

    setAlexMessages(prev => [...prev, { sender: 'You', message: userMessage }])

    setTimeout(scrollToBottom, 100)

    setAlexThinking(true)
    setThinkingMessage('Thinking...')

    try {
      const response = await fetch(WEBHOOKS.alexChat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          authorFirstName: localStorage.getItem('currentUserFirstName') || 'the author', // ADD THIS
          context: {
            manuscriptId: manuscript?.id, // ✅ ADD THIS LINE
            chapter: currentChapterIndex + 1,
            chapterTitle: chapters[currentChapterIndex]?.title,
            chapterContent: editorContent,
            manuscriptTitle: manuscript?.title,
            analysisComplete: analysisComplete,
            currentChapterStatus: chapterStatus,
            issueDescription: issue.issue_description,
            alexSuggestion: issue.alex_suggestion,
            issueType: issue.element_type,
            issueSeverity: issue.severity
          }
        })
      })

      if (!response.ok) throw new Error('Chat failed')

      const result = await response.json()
      setAlexThinking(false)
      addAlexMessage(result.response || result.message || result.alexResponse || result.text || 'Let me help you with that.')

    } catch (error) {
      console.error('Chat error:', error)
      setAlexThinking(false)
      addAlexMessage('I\'m having trouble connecting. Let me help based on what I see in your manuscript.')
    }
  }

  const initializeStudio = useCallback(async () => {
    const manuscriptId = searchParams.get('manuscriptId')

    if (!manuscriptId) {
      console.error('No manuscript ID provided')
      router.push('/onboarding')
      return
    }

    try {
      setLoadingMessage('Loading manuscript from database...')
      const supabase = createClient()

      // 🆕 Get user from session instead of URL params
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Auth error:', userError)
        router.push('/login')
        return
      }

      // 🆕 Get author profile using the authenticated user ID
      const { data: authorProfile, error: profileError } = await supabase
        .from('author_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError || !authorProfile) {
        console.error('Author profile not found:', profileError)
        router.push('/onboarding')
        return
      }

      const authorProfileId = authorProfile.id

      // Load manuscript details - verify it belongs to this author
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', manuscriptId)
        .eq('author_id', authorProfileId)
        .maybeSingle()

      if (manuscriptError) {
        console.error('Manuscript error:', manuscriptError)
        throw new Error('Failed to load manuscript')
      }

      if (!manuscriptData) {
        throw new Error('Manuscript not found')
      }

      setManuscript(manuscriptData)

      // Check if Phase 1 is complete and Phase 2 hasn't started
      if (manuscriptData.developmental_phase_completed_at && !manuscriptData.line_editing_started_at) {
        setShowPhase2Banner(true)
      }

      // Detect which phase we're in
      const phase = searchParams.get('phase')
      if (phase === '2' || manuscriptData.line_editing_started_at) {
        setCurrentPhase(2)
        setEditorName('Sam')
        setEditorColor('purple')
        setShowPhase2Banner(false) // Hide banner if in Phase 2
      } else {
        setCurrentPhase(1)
        setEditorName('Alex')
        setEditorColor('green')
      }

      // Check if full analysis is already complete
      if (manuscriptData.full_analysis_completed_at) {
        setAnalysisComplete(true)
      }

      setLoadingMessage('Loading chapters...')

      // Load chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .order('chapter_number', { ascending: true })

      if (chaptersError) {
        console.error('Chapters query error:', chaptersError)
      }

      console.log('Loaded chapters:', chaptersData?.length || 0)

      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData)

        // Initialize chapter editing status
        const initialStatus: { [key: number]: ChapterEditingStatus } = {}
        chaptersData.forEach(ch => {
          initialStatus[ch.chapter_number] = 'not_started'
        })
        setChapterEditingStatus(initialStatus)

        setIsLoading(false)

        // Load first chapter into editor
        loadChapter(0, chaptersData)

        // Get author's first name from localStorage
        const firstName = localStorage.getItem('currentUserFirstName') || 'there'
        setAuthorFirstName(firstName)

        // Phase-specific greetings
        if (currentPhase === 2) {
          // Sam's greeting for Phase 2
          addAlexMessage(
            `Hey ${firstName}! I'm Sam, your line editor. ✨\n\n` +
            `I've read the fantastic work you and Alex did together on "${manuscriptData.title}". The structure is solid—now let's make every sentence shine!\n\n` +
            `**How We'll Work Together:**\n` +
            `Click on any chapter to start refining your prose. We'll focus on:\n` +
            `• **Word choice** - Finding the perfect word for maximum impact\n` +
            `• **Rhythm & flow** - Making sentences smooth and natural\n` +
            `• **Voice consistency** - Strengthening your unique style\n` +
            `• **Dialogue** - Making conversations feel authentic\n` +
            `• **Clarity** - Ensuring every sentence is crystal clear\n\n` +
            `Unlike Alex who focused on story structure, I work at the sentence level. Every word matters.\n\n` +
            `Ready to polish your prose? Click any chapter to begin! 📝`
          )
        } else {
          // Alex's greeting - Different based on analysis status
          if (manuscriptData.full_analysis_completed_at) {
            // Returning user - analysis already done
            addAlexMessage(
              `Hi ${firstName}! Welcome back. What do you want to work on today? Click on any chapter and let's get started.`
            )
          } else {
            // New user - needs initial instructions
            addAlexMessage(
              `Welcome! I'm Alex, your developmental editor. I can see you've uploaded "${manuscriptData.title}" with ${chaptersData.length} chapters.\n\n` +
              `Before we dive in, let me explain how we'll work together:\n\n` +
              `**Step 1: Manuscript Review**\n` +
              `First, I'll read your entire manuscript and create a comprehensive analysis report. You'll receive this by email and can review it anytime.\n\n` +
              `**Step 2: Chapter-by-Chapter Editing**\n` +
              `Once you're ready to edit, just click on any chapter and hit "Start Editing." I'll pull up my specific notes for that chapter and we'll work through them together.\n\n` +
              `**Before We Start:**\n` +
              `✏️ Check that all chapter titles are correct (click the ✏️ icon to edit)\n` +
              `🧹 Make sure you've removed page numbers, headers, and copyright text\n` +
              `📝 Edit any content that needs cleaning up in the main editor\n` +
              `💾 Click "Save" when you make changes\n\n` +
              `Once you're happy with everything, just click the button below or type **"Please read my manuscript"** and I'll dive in!`
            )
          }
        }
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

            // Initialize chapter editing status
            const initialStatus: { [key: number]: ChapterEditingStatus } = {}
            retryChapters.forEach(ch => {
              initialStatus[ch.chapter_number] = 'not_started'
            })
            setChapterEditingStatus(initialStatus)

            setIsLoading(false)
            loadChapter(0, retryChapters)

            addAlexMessage(
              `Great! I've finished parsing your manuscript into ${retryChapters.length} chapters. ` +
              `Ready to begin?`
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

  // Load chapter into editor
  function loadChapter(index: number, chaptersArray?: Chapter[]) {
    const chaptersList = chaptersArray || chapters
    if (index < 0 || index >= chaptersList.length) return

    const chapter = chaptersList[index]
    setCurrentChapterIndex(index)

    // Check if there's unsaved content for this chapter
    if (unsavedChapterContent[chapter.id]) {
      // Load the unsaved content instead of database content
      setEditorContent(unsavedChapterContent[chapter.id])
    } else {
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
    }

    setChapterStatus(chapter.status || 'draft')

    // Load issues for this chapter if analysis is ready
    const editStatus = chapterEditingStatus[chapter.chapter_number]
    if (editStatus === 'ready') {
      loadChapterIssues(chapter.chapter_number)
    } else {
      setChapterIssues([])
    }

    // Check if this chapter is in the unsaved set
    const isChapterUnsaved = unsavedChapters.has(chapter.id)
    setHasUnsavedChanges(isChapterUnsaved)
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

    // Mark as unsaved
    setUnsavedChapters(prev => new Set(prev).add(updatedChapters[index].id))

    addAlexMessage(`✏️ Chapter title updated. Don't forget to click Save!`)
  }

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

      // Remove from unsaved chapters set
      setUnsavedChapters(prev => {
        const newSet = new Set(prev)
        newSet.delete(chapters[currentChapterIndex].id)
        return newSet
      })

      // Clear the cached unsaved content
      setUnsavedChapterContent(prev => {
        const newCache = { ...prev }
        delete newCache[chapters[currentChapterIndex].id]
        return newCache
      })

      addAlexMessage('✅ Changes saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      addAlexMessage('❌ Error saving changes. Please try again.')
    }
  }

  // Analyze single chapter on-demand
  const analyzeChapter = async (chapterNumber: number) => {
    if (!manuscript?.id) return

    const chapter = chapters.find(ch => ch.chapter_number === chapterNumber)
    if (!chapter) return

    // Update status to analyzing
    setChapterEditingStatus(prev => ({
      ...prev,
      [chapterNumber]: 'analyzing'
    }))

    addAlexMessage(`📖 Let me grab my notes on "${chapter.title}". This will just take a moment...`)

    // Cycle through status messages
    const statusMessages = [
      'Looking through my notes...',
      'Getting them organized...',
      'Adding a few other things...',
      'Where\'s that note gone...?',
      '...',
      'Oh, Yes, there it is...',
      'Yep, Yep, Yep...',
      'I loved that bit!...',
      'Ha! Excellent!...',
      'Nice...',
      'I better get a cup of tea for this one...',
      '...',
      'Almost ready...'
    ]

    let messageIndex = 0
    setAnalyzingMessage(statusMessages[0])

    const statusInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % statusMessages.length
      setAnalyzingMessage(statusMessages[messageIndex])
    }, 4000)

    try {
      const response = await fetch(WEBHOOKS.chapterAnalysis, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: manuscript.id,
          chapterNumber: chapterNumber,
          userId: searchParams.get('userId')
        })
      })

      clearInterval(statusInterval)

      if (!response.ok) {
        throw new Error('Chapter analysis failed')
      }

      // Poll for issues to appear
      pollForChapterIssues(chapterNumber)

    } catch (error) {
      clearInterval(statusInterval)
      console.error('Error analyzing chapter:', error)
      addAlexMessage('❌ Had trouble pulling up my notes. Please try again.')
      setChapterEditingStatus(prev => ({
        ...prev,
        [chapterNumber]: 'not_started'
      }))
    }
  }

  const pollForChapterIssues = async (chapterNumber: number) => {
    const supabase = createClient()
    let attempts = 0
    const maxAttempts = 20 // 1 minute max

    const pollInterval = setInterval(async () => {
      attempts++

      const { data: issues } = await supabase
        .from('manuscript_issues')
        .select('id')
        .eq('manuscript_id', manuscript?.id)
        .eq('chapter_number', chapterNumber)

      if (issues && issues.length > 0) {
        clearInterval(pollInterval)
        setChapterEditingStatus(prev => ({
          ...prev,
          [chapterNumber]: 'ready'
        }))
        setChapterIssueCount(prev => ({
          ...prev,
          [chapterNumber]: issues.length
        }))

        // If this is the current chapter, load the issues
        if (chapters[currentChapterIndex]?.chapter_number === chapterNumber) {
          loadChapterIssues(chapterNumber)
        }

        addAlexMessage(`✅ Perfect! I jotted down ${issues.length} thoughts on this chapter. Click on the 'Notes' button at the top and we can work our way through them`)
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval)
        addAlexMessage('⚠️ Analysis is taking longer than expected. It should be ready soon - try refreshing in a moment.')
      }
    }, 3000)
  }

  const triggerFullAnalysis = async () => {
    setAlexThinking(true)
    setFullAnalysisInProgress(true)
    setThinkingMessage('📖 Starting to read...')

    setTimeout(() => setThinkingMessage('🎭 Oh, I like this opening...'), 3000)
    setTimeout(() => setThinkingMessage('📊 Getting into the story structure...'), 6000)
    setTimeout(() => setThinkingMessage('✨ Wow, this character arc is interesting...'), 9000)
    setTimeout(() => setThinkingMessage('🔍 Making notes on what\'s working really well...'), 12000)
    setTimeout(() => setThinkingMessage('📝 Almost done... pulling my thoughts together...'), 15000)

    try {
      // Trigger all THREE workflows simultaneously
      const [analysisResponse, summaryPointsResponse, chapterSummariesResponse] = await Promise.all([
        // Full analysis (PDF report)
        fetch(WEBHOOKS.fullAnalysis, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            manuscriptId: manuscript?.id,
            userId: searchParams.get('userId')
          })
        }),

        // Generate summary + key points (enables editing)
        fetch(WEBHOOKS.generateSummaryPoints, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            manuscriptId: manuscript?.id,
            userId: searchParams.get('userId')
          })
        }),

        // Chapter summaries (for chapter analysis context)
        fetch(WEBHOOKS.chapterSummaries, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            manuscriptId: manuscript?.id,
            userId: searchParams.get('userId')
          })
        })
      ])

      // Try to parse responses (but don't fail if CORS blocks)
      let analysisResult = null
      let summaryPointsResult = null
      let chapterSummariesResult = null

      try {
        analysisResult = await analysisResponse.json()
        console.log('✅ Full analysis response:', analysisResult)
      } catch (jsonError) {
        console.log('Could not parse analysis response (possibly CORS), but workflow may have completed')
      }

      try {
        summaryPointsResult = await summaryPointsResponse.json()
        console.log('✅ Summary + points response:', summaryPointsResult)
      } catch (jsonError) {
        console.log('Could not parse summary points response (possibly CORS), but workflow may have completed')
      }

      try {
        chapterSummariesResult = await chapterSummariesResponse.json()
        console.log('✅ Chapter summaries response:', chapterSummariesResult)
      } catch (jsonError) {
        console.log('Could not parse chapter summaries response (possibly CORS), but workflow may have completed')
      }

      setAlexThinking(false)

      // Poll database to check completion
      pollForAnalysisCompletion()

    } catch (error) {
      console.error('Analysis error:', error)

      // Even on CORS error, the workflows might have completed
      addAlexMessage('⏳ This is looking GREAT! Let me just make some notes')
      pollForAnalysisCompletion()
    }
  }

  // Poll database for analysis completion
  const pollForAnalysisCompletion = async () => {
    const supabase = createClient()
    let attempts = 0
    const maxAttempts = 60 // 3 minutes (every 3 seconds)

    const pollInterval = setInterval(async () => {
      attempts++

      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('full_analysis_completed_at, report_pdf_url')
        .eq('id', manuscript?.id)
        .single()

      if (manuscriptData?.full_analysis_completed_at) {
        clearInterval(pollInterval)
        setAlexThinking(false)
        setFullAnalysisInProgress(false)
        setAnalysisComplete(true)

        // Set the PDF URL if available
        if (manuscriptData.report_pdf_url) {
          setFullReportPdfUrl(manuscriptData.report_pdf_url)
        }

        addAlexMessage(
          `✅ I've finished reading your manuscript and I'm genuinely excited about what you've created here! I've sent you a comprehensive analysis report by email.\n\n` +
          `You can review the full report in your email.\n\n` +
          `**Ready to start editing?** Now you can click on any chapter and hit "Start Editing." I'll pull up my specific notes for that chapter and we'll work through them together.`
        )
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval)
        setAlexThinking(false)
        setFullAnalysisInProgress(false)
        addAlexMessage('⚠️ Analysis is taking longer than expected. Please check your email or refresh the page in a few minutes.')
      }
    }, 3000)
  }

  // Alex chat
  async function sendChatMessage() {
    if (!chatInput.trim()) return

    const userMessage = chatInput
    setAlexMessages(prev => [...prev, { sender: 'You', message: userMessage }])
    setChatInput('')

    setTimeout(scrollToBottom, 100)

    // Check for "read my manuscript" trigger
    const analysisKeywords = ['read my manuscript', 'please read my manuscript', 'start reading']
    const messageToCheck = userMessage.toLowerCase()
    const shouldTriggerAnalysis = analysisKeywords.some(keyword => messageToCheck.includes(keyword))

    if (shouldTriggerAnalysis) {
      if (fullAnalysisInProgress) {
        addAlexMessage("I'm already reading it! Give me about 3 minutes to get through everything. I'll let you know as soon as I'm done. ⏳")
        return
      }

      if (analysisComplete) {
        addAlexMessage("I've already read your manuscript! You can view my full report using the button above, or jump into any chapter by clicking 'Start Editing'. 📖")
        return
      }

      // All clear - trigger analysis
      triggerFullAnalysis()
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
          authorFirstName: localStorage.getItem('currentUserFirstName') || 'the author',
          context: {
            manuscriptId: manuscript?.id, // ✅ ADDED for consistency
            chapter: currentChapterIndex + 1,
            chapterTitle: chapters[currentChapterIndex]?.title,
            chapterContent: editorContent,
            manuscriptTitle: manuscript?.title,
            analysisComplete: analysisComplete,
            currentChapterStatus: chapterStatus
            // Note: issueDescription, alexSuggestion, issueType, issueSeverity 
            // are only sent by discussIssue when discussing a specific issue
          }
        })
      })

      if (!response.ok) throw new Error('Chat failed')

      const result = await response.json()
      setAlexThinking(false)
      addAlexMessage(result.response || result.message || result.alexResponse || result.text || 'Let me help you with that.')

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
      const currentChapter = chapters[currentChapterIndex]  // 🆕 Get the actual chapter object

      // Update the current chapter to approved
      const { error } = await supabase
        .from('chapters')
        .update({
          status: 'approved',
          content: editorContent
        })
        .eq('id', currentChapter.id)  // 🆕 Use currentChapter.id

      if (error) throw error

      // Update local state
      const updatedChapters = [...chapters]
      updatedChapters[currentChapterIndex].status = 'approved'
      setChapters(updatedChapters)
      setChapterStatus('approved')
      setHasUnsavedChanges(false)

      // Remove from unsaved chapters set
      setUnsavedChapters(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentChapter.id)  // 🆕 Use currentChapter.id
        return newSet
      })

      // 🆕 FIX: Use actual chapter number and title
      const chapterLabel = currentChapter.chapter_number === 0
        ? 'Prologue'
        : `Chapter ${currentChapter.chapter_number}`

      addAlexMessage(`✅ ${chapterLabel} approved! Great work.`)

      // CHECK IF ALL CHAPTERS ARE NOW APPROVED
      const allChaptersApproved = updatedChapters.every(ch => ch.status === 'approved')

      if (allChaptersApproved && manuscript?.id) {
        // All chapters approved - trigger Alex's sign-off
        await handleDevelopmentalPhaseComplete(updatedChapters)
      } else if (currentChapterIndex < chapters.length - 1) {
        // Move to next chapter if not all approved yet
        setTimeout(() => loadChapter(currentChapterIndex + 1), 1000)
      }
    } catch (error) {
      console.error('Approve error:', error)
      addAlexMessage('❌ Error approving chapter. Please try again.')
    }
  }

  async function handleDevelopmentalPhaseComplete(approvedChapters: Chapter[]) {
    const supabase = createClient()

    try {
      console.log('🎉 All chapters approved! Starting Phase 1 completion...', approvedChapters.length)

      // Collate all approved chapters into a single developmental version
      const developmentalVersion = approvedChapters
        .map(ch => {
          const chapterLabel = ch.chapter_number === 0 ? 'Prologue' : `Chapter ${ch.chapter_number}`
          return `# ${chapterLabel}: ${ch.title}\n\n${ch.content || ''}`
        })
        .join('\n\n---\n\n')

      // Update manuscript with phase completion data
      const { error: updateError } = await supabase
        .from('manuscripts')
        .update({
          developmental_phase_completed_at: new Date().toISOString(),
          developmental_version: developmentalVersion,
          developmental_version_created_at: new Date().toISOString(),
          status: 'developmental_complete'
        })
        .eq('id', manuscript?.id)

      if (updateError) throw updateError

      console.log('✅ Manuscript status updated to developmental_complete')

      // Show banner immediately
      setShowPhase2Banner(true)
      console.log('✅ Phase 2 banner flag set to true')

      // Alex's ceremonial sign-off message
      setTimeout(() => {
        addAlexMessage(
          `🎉 **Incredible work, ${authorFirstName}!**\n\n` +
          `You've successfully approved all ${approvedChapters.length} chapters. Your story structure is solid, your character arcs are clear, and the pacing flows beautifully.\n\n` +
          `I'm genuinely proud of what we've accomplished together. The foundations of your manuscript are now rock-solid.\n\n` +
          `**What happens next?**\n` +
          `You're ready for **Phase 2: Line Editing with Sam**. Sam will work at the sentence level, polishing your prose and making sure every word sings. While I focused on the *what* and *why* of your story, Sam focuses on the *how* - the craft of beautiful writing.\n\n` +
          `Take a moment to celebrate this milestone. Look at the top of your screen for the colorful banner to meet Sam and begin Phase 2!\n\n` +
          `*— Alex, Your Developmental Editor* 👔`
        )
      }, 1500)

      console.log('✅ Developmental phase complete - snapshot saved')

    } catch (error) {
      console.error('Error completing developmental phase:', error)
      addAlexMessage('✅ All chapters approved! There was an issue saving the final version, but your work is safe.')
    }
  }

  // Get filtered issues
  const filteredIssues = issueFilter === 'all'
    ? chapterIssues
    : chapterIssues.filter(issue => issue.element_type === issueFilter)

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

  // Get current chapter editing status and issue count
  const currentChapter = chapters[currentChapterIndex]
  const currentEditingStatus = currentChapter ? chapterEditingStatus[currentChapter.chapter_number] : 'not_started'
  const currentIssueCount = currentChapter ? chapterIssueCount[currentChapter.chapter_number] || 0 : 0
  const isLocked = fullAnalysisInProgress || !analysisComplete

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
            {authorFirstName ? `${authorFirstName}'s Writing Studio` : 'Your Writing Studio'}
          </div>
          <div className={`flex items-center gap-3 bg-gradient-to-r ${currentPhase === 2
            ? 'from-purple-500 to-purple-600'
            : 'from-green-500 to-green-600'
            } text-white px-4 py-2 rounded-full font-semibold`}>
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-sm">
              {currentPhase === 2 ? 'S' : 'A'}
            </div>
            Working with {editorName}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${alexThinking
            ? 'bg-yellow-50 border border-yellow-500 text-yellow-900'
            : currentPhase === 2
              ? 'bg-purple-50 border border-purple-500 text-purple-900'
              : 'bg-green-50 border border-green-500 text-green-900'
            }`}>
            <div className={`w-2 h-2 rounded-full ${alexThinking
              ? 'bg-yellow-500 animate-pulse'
              : currentPhase === 2
                ? 'bg-purple-500'
                : 'bg-green-500'
              }`}></div>
            {alexThinking ? 'Thinking...' : `${editorName} is Online`}
          </div>
          <div className={`w-10 h-10 bg-gradient-to-br ${currentPhase === 2
            ? 'from-purple-500 to-purple-600'
            : 'from-green-500 to-green-600'
            } rounded-full flex items-center justify-center text-white font-semibold`}>
            {currentPhase === 2 ? 'S' : 'A'}
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
            A
          </div>
        </div>
      </header>

      {/* 🆕 Phase 2 Transition Banner */}
      {
        showPhase2Banner && (
          <div className="bg-gradient-to-r from-green-500 via-purple-500 to-purple-600 text-white shadow-lg">
            <div className="container mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <div className="font-bold text-base">Phase 1 Complete! Ready for Phase 2?</div>
                    <div className="text-sm text-white/90">
                      All chapters approved. Time to meet Sam and polish your prose!
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/phase-transition?manuscriptId=${manuscript?.id}`}
                    className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md"
                  >
                    Meet Sam & Begin Phase 2 →
                  </Link>
                  <button
                    onClick={() => setShowPhase2Banner(false)}
                    className="text-white/80 hover:text-white text-2xl px-2 leading-none"
                    title="Dismiss banner"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Main Layout: Adjust columns based on panels open */}
      <div className={`flex-1 grid ${isChapterSidebarCollapsed
        ? (showIssuesPanel ? 'grid-cols-[60px_1fr_400px_400px]' : 'grid-cols-[60px_1fr_400px]')
        : (showIssuesPanel ? 'grid-cols-[320px_1fr_400px_400px]' : 'grid-cols-[320px_1fr_400px]')
        } overflow-hidden`}>

        {/* LEFT: Chapter Navigation - Collapsible */}
        <div className={`bg-gray-50 border-r-2 border-gray-200 overflow-y-auto transition-all duration-300 ${isChapterSidebarCollapsed ? 'p-2' : 'p-6'
          }`}>
          {/* Toggle Button */}
          <button
            onClick={() => setIsChapterSidebarCollapsed(!isChapterSidebarCollapsed)}
            className="w-full mb-4 p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center"
            title={isChapterSidebarCollapsed ? "Expand chapters" : "Collapse chapters"}
          >
            {isChapterSidebarCollapsed ? (
              <span className="text-lg">→</span>
            ) : (
              <span className="text-lg">←</span>
            )}
          </button>

          {!isChapterSidebarCollapsed ? (
            // Full sidebar view
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{manuscript.title}</h2>
              <p className="text-gray-600 mb-6">
                {manuscript.current_word_count?.toLocaleString() || 0} words • {chapters.length} chapters
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Chapters</h3>
                <div className="space-y-2">
                  {chapters.map((chapter, index) => {
                    const isUnsaved = unsavedChapters.has(chapter.id)
                    const editStatus = chapterEditingStatus[chapter.chapter_number]

                    return (
                      <div
                        key={chapter.id}
                        onClick={() => !isLocked && loadChapter(index)}
                        className={`p-3 rounded-lg border transition-all min-h-[80px] ${isLocked
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : index === currentChapterIndex
                            ? 'bg-green-50 border-green-500 shadow-sm cursor-pointer'
                            : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm cursor-pointer'
                          }`}
                      >
                        <div className="flex flex-col gap-2">
                          {/* Top row: Status + Number + Title + Edit */}
                          <div className="flex items-start gap-2">
                            {/* Analysis status indicator */}
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {editStatus === 'analyzing' && (
                                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {editStatus === 'ready' && (
                                <span className="text-green-600 text-lg">✓</span>
                              )}
                              {editStatus === 'not_started' && (
                                <span className="text-gray-300 text-lg">○</span>
                              )}
                            </div>

                            {/* Chapter number */}
                            <span className="text-xs font-semibold text-gray-500 flex-shrink-0 mt-1">
                              {chapter.chapter_number === 0 ? 'Pro' :
                                chapter.chapter_number === 999 ? 'Epi' :
                                  `Ch ${chapter.chapter_number}`}
                            </span>

                            {/* Unsaved indicator */}
                            {isUnsaved && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0 mt-2" title="Unsaved changes"></div>
                            )}

                            {/* Chapter title - clickable area */}
                            {editingChapterId === chapter.id ? (
                              <input
                                type="text"
                                value={editingChapterTitle}
                                onChange={(e) => setEditingChapterTitle(e.target.value)}
                                onBlur={() => saveChapterTitle(index)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveChapterTitle(index)
                                  if (e.key === 'Escape') setEditingChapterId(null)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 text-sm font-semibold border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-900 line-clamp-2 break-words">
                                {chapter.title}
                              </span>
                            )}

                            {/* Edit button */}
                            {!editingChapterId && index === currentChapterIndex && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingChapterId(chapter.id)
                                  setEditingChapterTitle(chapter.title)
                                }}
                                className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0"
                              >
                                ✏️
                              </button>
                            )}
                          </div>

                          {/* Bottom row: Editing stage indicators */}
                          <div className="flex items-center gap-1 pl-8">
                            {/* Developmental Editing */}
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${editStatus === 'ready'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-400'
                              }`} title="Developmental Editing">
                              D
                            </div>

                            {/* Copy Editing */}
                            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-300" title="Copy Editing (Coming Soon)">
                              C
                            </div>

                            {/* Line Editing */}
                            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-300" title="Line Editing (Coming Soon)">
                              L
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            // Collapsed sidebar view - just chapter numbers
            <div className="space-y-2">
              {chapters.map((chapter, index) => {
                const isUnsaved = unsavedChapters.has(chapter.id)
                const editStatus = chapterEditingStatus[chapter.chapter_number]

                return (
                  <button
                    key={chapter.id}
                    onClick={() => !isLocked && loadChapter(index)}
                    disabled={isLocked}
                    className={`w-full p-2 rounded-lg border transition-all relative ${isLocked
                      ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      : index === currentChapterIndex
                        ? 'bg-green-50 border-green-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
                      }`}
                    title={chapter.title}
                  >
                    {/* Unsaved indicator */}
                    {isUnsaved && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}

                    {/* Status indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        {editStatus === 'analyzing' && (
                          <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {editStatus === 'ready' && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                        {editStatus === 'not_started' && (
                          <span className="text-gray-300 text-sm">○</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {chapter.chapter_number === 0 ? 'P' :
                          chapter.chapter_number === 999 ? 'E' :
                            chapter.chapter_number}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* CENTER: Editor */}
        <div className="bg-white flex flex-col overflow-hidden border-r-2 border-gray-200">
          {/* Chapter header with buttons */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-green-700">
              {chapters[currentChapterIndex]?.title || 'Loading...'}
            </h3>
            <div className="flex gap-3">
              {/* Start Editing Button */}
              {currentEditingStatus === 'not_started' && (
                <button
                  onClick={() => analyzeChapter(currentChapter.chapter_number)}
                  disabled={fullAnalysisInProgress || !analysisComplete}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${fullAnalysisInProgress || !analysisComplete
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  title={
                    fullAnalysisInProgress
                      ? 'Please wait for Alex to finish reading the manuscript (approx. 5 minutes)'
                      : !analysisComplete
                        ? 'Please complete full analysis first by typing "Yes" to Alex'
                        : 'Start editing this chapter'
                  }
                >
                  <span>🚀</span>
                  {fullAnalysisInProgress ? 'Waiting for Full Analysis...' : 'Start Editing'}
                </button>
              )}

              {/* Analyzing Status */}
              {currentEditingStatus === 'analyzing' && (
                <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-yellow-700">{analyzingMessage}</span>
                </div>
              )}

              {/* Notes Button */}
              {currentEditingStatus === 'ready' && (
                <button
                  onClick={() => setShowIssuesPanel(!showIssuesPanel)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${showIssuesPanel
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-100'
                    }`}
                >
                  <span>📝</span>
                  Notes ({chapterIssues.length})
                </button>
              )}

              {/* Save Button - Always visible */}
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

              {/* Approve Button */}
              {currentEditingStatus === 'ready' && (
                <button
                  onClick={approveChapter}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <span>✓</span> Approve
                </button>
              )}
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
              const newContent = e.currentTarget.innerHTML
              setEditorContent(newContent)
              setHasUnsavedChanges(true)

              // Cache the unsaved content
              setUnsavedChapterContent(prev => ({
                ...prev,
                [chapters[currentChapterIndex].id]: newContent
              }))

              // Add to unsaved chapters set
              setUnsavedChapters(prev => new Set(prev).add(chapters[currentChapterIndex].id))
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

        {/* Issues Panel - Slides in when open */}
        {showIssuesPanel && currentEditingStatus === 'ready' && (
          <div className="bg-white border-r-2 border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Chapter Notes</h3>
                <p className="text-sm opacity-90">{filteredIssues.length} items to review</p>
              </div>
              <button
                onClick={() => setShowIssuesPanel(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs - Horizontal Scrollable */}
            <div className="border-b border-gray-200 bg-gray-50 p-3 filter-tabs-scroll">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <button
                  onClick={() => setIssueFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 ${issueFilter === 'all' ?
                    'bg-white border border-gray-300' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  All ({chapterIssues.length})
                </button>
                <button
                  onClick={() => setIssueFilter('character')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${issueFilter === 'character' ?
                    'bg-white border border-gray-300 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  Character ({chapterIssues.filter(i => i.element_type === 'character').length})
                </button>
                <button
                  onClick={() => setIssueFilter('plot')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${issueFilter === 'plot' ?
                    'bg-white border border-gray-300 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  Plot ({chapterIssues.filter(i => i.element_type === 'plot').length})
                </button>
                <button
                  onClick={() => setIssueFilter('pacing')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${issueFilter === 'pacing' ?
                    'bg-white border border-gray-300 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  Pacing ({chapterIssues.filter(i => i.element_type === 'pacing').length})
                </button>
                <button
                  onClick={() => setIssueFilter('structure')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${issueFilter === 'structure' ?
                    'bg-white border border-gray-300 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  Structure ({chapterIssues.filter(i => i.element_type === 'structure').length})
                </button>
                <button
                  onClick={() => setIssueFilter('theme')}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${issueFilter === 'theme' ?
                    'bg-white border border-gray-300 font-medium' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  Theme ({chapterIssues.filter(i => i.element_type === 'theme').length})
                </button>
              </div>
            </div>

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">✨</div>
                  <p className="font-medium">No issues found</p>
                  <p className="text-sm">
                    {issueFilter === 'all' ? 'This chapter looks great!' : `No ${issueFilter} issues`}
                  </p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(selectedIssue?.id === issue.id ? null : issue)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedIssue?.id === issue.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm'
                      }`}
                  >
                    {/* Issue Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${issue.severity === 'major' ? 'bg-red-500' :
                          issue.severity === 'moderate' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {issue.element_type}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          issue.status === 'dismissed' ? 'bg-gray-100 text-gray-600' :
                            'bg-orange-100 text-orange-700'
                        }`}>
                        {issue.status === 'flagged' ? 'New' : issue.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Issue Description */}
                    <p className="text-sm text-gray-900 font-medium mb-2 line-clamp-2">
                      {issue.issue_description}
                    </p>

                    {/* Preview of suggestion */}
                    {selectedIssue?.id !== issue.id && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {issue.alex_suggestion}
                      </p>
                    )}

                    {/* Expanded view when selected */}
                    {selectedIssue?.id === issue.id && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-semibold text-orange-700">For Discussion:</span>
                          <br />
                          {issue.alex_suggestion}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              discussIssue(issue)
                            }}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                          >
                            💬 Discuss
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateIssueStatus(issue.id, 'dismissed')
                            }}
                            className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all"
                          >
                            ✕ Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Stats */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {chapterIssues.filter(i => i.status === 'resolved').length} resolved
                </span>
                <span className="text-gray-600">
                  {chapterIssues.filter(i => i.status === 'flagged').length} remaining
                </span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT: Editor Panel (Alex/Sam) */}
        <div className="bg-white flex flex-col overflow-hidden">
          {/* Editor header with Report button */}
          <div className={`bg-gradient-to-r ${currentPhase === 2
            ? 'from-purple-500 to-purple-600'
            : 'from-green-500 to-green-600'
            } text-white p-5 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {currentPhase === 2 ? 'S' : 'A'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{editorName}</h3>
                <p className="text-sm opacity-90">
                  {currentPhase === 2 ? 'Line Editing Specialist' : 'Developmental Specialist'}
                </p>
              </div>
            </div>

            {/* Report Access Button */}
            {fullReportPdfUrl && (
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
                className={`p-4 rounded-xl ${msg.sender === editorName
                  ? 'bg-white border border-gray-200'
                  : currentPhase === 2
                    ? 'bg-purple-50 border border-purple-200 ml-8'
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
                    <div className={`w-2 h-2 ${currentPhase === 2 ? 'bg-purple-500' : 'bg-green-500'
                      } rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                    <div className={`w-2 h-2 ${currentPhase === 2 ? 'bg-purple-500' : 'bg-green-500'
                      } rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                    <div className={`w-2 h-2 ${currentPhase === 2 ? 'bg-purple-500' : 'bg-green-500'
                      } rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible div for scrolling to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* === ADD THE BUTTON HERE === */}
      {
        !analysisComplete && !fullAnalysisInProgress && (
          <div className="px-6 py-4 bg-green-50 border-t border-green-200">
            <button
              onClick={triggerFullAnalysis}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              📖 Please Read My Manuscript
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              This takes about 5 minutes and you&apos;ll get a comprehensive report by email.
            </p>
          </div>
        )
      }

      {/* Report Overlay Panel */}
      {
        showReportPanel && fullReportPdfUrl && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Alex Comprehensive Analysis</h3>
                    <p className="text-sm text-gray-600">Full Manuscript Report</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">

                  <a href={fullReportPdfUrl}
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
                  src={fullReportPdfUrl}
                  className="w-full h-full"
                  title="Alex's Comprehensive Analysis Report"
                />
              </div>
            </div>
          </div>
        )
      }
    </div >
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