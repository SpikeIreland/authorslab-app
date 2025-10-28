'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

// Import types and helpers
import type {
  Manuscript,
  EditingPhase,
  Chapter,
  ManuscriptIssue,
  EditorChatMessage,
  PhaseNumber,
  EditorName
} from '@/types/database'

import {
  getActivePhase,
  getChatHistory,
  saveChatMessage,
  approveChapter,
  areAllChaptersApproved,
  createApprovedSnapshot,
  transitionToNextPhase
} from '@/lib/supabase/helpers'

import { EDITOR_CONFIG, ISSUE_CATEGORIES } from '@/types/database'

// Webhook URLs
const WEBHOOKS = {
  alexFullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-full-manuscript-analysis',
  alexChapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chapter-analysis',
  alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat',
  samFullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-full-manuscript-analysis',
  samChapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-chapter-analysis',
  samChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-chat',
}

interface ChatMessage {
  sender: string
  message: string
}

type ChapterEditingStatus = 'not_started' | 'analyzing' | 'ready'

function StudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Core State
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [activePhase, setActivePhase] = useState<EditingPhase | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading your studio...')

  // Phase/Editor State (derived from activePhase)
  const currentPhase = activePhase?.phase_number || 1
  const editorName = activePhase?.editor_name || 'Alex'
  const editorColor = activePhase?.editor_color || 'green'

  // Editor State
  const [editorContent, setEditorContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  // Chapter Editing Status
  const [chapterEditingStatus, setChapterEditingStatus] = useState<{ [key: number]: ChapterEditingStatus }>({})
  const [analyzingMessage, setAnalyzingMessage] = useState('')

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  // Issues State
  const [chapterIssues, setChapterIssues] = useState<ManuscriptIssue[]>([])
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [issueFilter, setIssueFilter] = useState<string>('all')

  // Analysis State
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [fullAnalysisInProgress, setFullAnalysisInProgress] = useState(false)

  // Author name
  const [authorFirstName, setAuthorFirstName] = useState<string>('')

  // Sidebar collapsed
  const [isChapterSidebarCollapsed, setIsChapterSidebarCollapsed] = useState(false)

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isThinking])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Update word count when content changes
  useEffect(() => {
    const text = editorContent.replace(/<[^>]*>/g, '')
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    setWordCount(words.length)
  }, [editorContent])

  // Initialize Studio
  const initializeStudio = useCallback(async () => {
    const manuscriptId = searchParams.get('manuscriptId')

    if (!manuscriptId) {
      console.error('No manuscript ID provided')
      router.push('/onboarding')
      return
    }

    try {
      setLoadingMessage('Loading manuscript...')
      const supabase = createClient()

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Auth error:', userError)
        router.push('/login')
        return
      }

      // Get author profile
      const { data: authorProfile } = await supabase
        .from('author_profiles')
        .select('id, first_name')
        .eq('auth_user_id', user.id)
        .single()

      if (!authorProfile) {
        console.error('No author profile found')
        router.push('/onboarding')
        return
      }

      setAuthorFirstName(authorProfile.first_name || 'there')

      // Load manuscript
      const { data: manuscriptData, error: manuscriptError } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', manuscriptId)
        .eq('author_id', authorProfile.id)
        .single()

      if (manuscriptError || !manuscriptData) {
        console.error('Manuscript error:', manuscriptError)
        throw new Error('Manuscript not found')
      }

      setManuscript(manuscriptData)

      // Check if analysis is complete
      if (manuscriptData.full_analysis_text) {
        setAnalysisComplete(true)
      }

      // Load active phase (PRIMARY ORCHESTRATOR!)
      const phase = await getActivePhase(supabase, manuscriptId)
      
      if (!phase) {
        console.error('No active phase found')
        throw new Error('No active phase')
      }

      setActivePhase(phase)
      console.log(`✅ Active phase: ${phase.phase_name} (${phase.editor_name})`)

      // Load chapters
      setLoadingMessage('Loading chapters...')
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .order('chapter_number', { ascending: true })

      if (chaptersError) {
        console.error('Chapters error:', chaptersError)
      }

      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData)

        // Initialize chapter editing status
        const initialStatus: { [key: number]: ChapterEditingStatus } = {}
        chaptersData.forEach(ch => {
          initialStatus[ch.chapter_number] = 'not_started'
        })
        setChapterEditingStatus(initialStatus)

        // Load first chapter
        loadChapter(0, chaptersData)
      }

      // Load chat history for active phase
      setLoadingMessage('Loading chat history...')
      const history = await getChatHistory(supabase, manuscriptId, phase.phase_number)
      
      if (history && history.length > 0) {
        const messages = history.map(msg => ({
          sender: msg.sender,
          message: msg.message
        }))
        setChatMessages(messages)
        console.log(`✅ Restored ${history.length} chat messages`)
      } else {
        // Show initial greeting for this phase
        showInitialGreeting(phase, manuscriptData, authorProfile.first_name)
      }

      setIsLoading(false)

    } catch (error) {
      console.error('Error initializing studio:', error)
      setIsLoading(false)
      // Could show error state here
    }
  }, [searchParams, router])

  useEffect(() => {
    initializeStudio()
  }, [initializeStudio])

  // Show initial greeting based on phase
  function showInitialGreeting(phase: EditingPhase, manuscript: Manuscript, firstName: string) {
    if (phase.phase_number === 1) {
      // Alex's greeting
      if (manuscript.full_analysis_text) {
        addChatMessage('Alex', `Hi ${firstName}! Welcome back. What do you want to work on today? Click on any chapter and let's get started.`)
      } else {
        addChatMessage('Alex', 
          `Welcome! I'm Alex, your developmental editor. I can see you've uploaded "${manuscript.title}" with ${chapters.length} chapters.\n\n` +
          `Before we dive in, let me read your manuscript and create a comprehensive analysis. This will take about 3-4 minutes.\n\n` +
          `Click the button below when you're ready!`
        )
      }
    } else if (phase.phase_number === 2) {
      // Sam's greeting
      addChatMessage('Sam',
        `Hey ${firstName}! I'm Sam, your line editor. ✨\n\n` +
        `I've already reviewed the fantastic structural work you and Alex accomplished together on "${manuscript.title}". ` +
        `Now let's make every sentence sing!\n\n` +
        `Give me just a couple of minutes to read through your approved manuscript and I'll share my initial thoughts. In the meantime, feel free to look around! 📚`
      )
    }
    // Add greetings for Jordan, Taylor, Quinn as needed
  }

  // Load chapter into editor
  function loadChapter(index: number, chaptersList?: Chapter[]) {
    const chaptersToUse = chaptersList || chapters
    const chapter = chaptersToUse[index]
    
    if (!chapter) return

    setCurrentChapterIndex(index)
    setEditorContent(chapter.content)
    setHasUnsavedChanges(false)

    // Load issues for this chapter if ready
    const editStatus = chapterEditingStatus[chapter.chapter_number]
    if (editStatus === 'ready') {
      loadChapterIssues(chapter.chapter_number)
    } else {
      setChapterIssues([])
    }
  }

  // Load issues for a chapter
  async function loadChapterIssues(chapterNumber: number) {
    if (!manuscript?.id || !activePhase) return

    const supabase = createClient()
    
    const { data: issues, error } = await supabase
      .from('manuscript_issues')
      .select('*')
      .eq('manuscript_id', manuscript.id)
      .eq('chapter_number', chapterNumber)
      .eq('phase_number', activePhase.phase_number)
      .order('severity', { ascending: false })

    if (error) {
      console.error('Error loading issues:', error)
      return
    }

    setChapterIssues(issues || [])
    console.log(`Loaded ${issues?.length || 0} issues for chapter ${chapterNumber}`)
  }

  // Add chat message (and persist to database)
  async function addChatMessage(sender: string, message: string, chapterNumber?: number) {
    // Add to local state immediately for responsiveness
    setChatMessages(prev => [...prev, { sender, message }])

    // Persist to database
    if (manuscript?.id && activePhase) {
      await saveChatMessage(
        createClient(),
        manuscript.id,
        activePhase.phase_number,
        sender as EditorChatMessage['sender'],
        message,
        chapterNumber
      )
    }
  }

  // Handle chat submission
  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!userInput.trim() || !manuscript || !activePhase) return

    const message = userInput.trim()
    setUserInput('')
    
    // Add user message
    await addChatMessage('Author', message, chapters[currentChapterIndex]?.chapter_number)

    // Show thinking state
    setIsThinking(true)

    try {
      // Determine which chat webhook to use
      const chatWebhook = activePhase.phase_number === 2 ? WEBHOOKS.samChat : WEBHOOKS.alexChat

      const response = await fetch(chatWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          manuscriptId: manuscript.id,
          chapterNumber: chapters[currentChapterIndex]?.chapter_number,
          chapterContent: editorContent
        })
      })

      const data = await response.json()
      const editorResponse = data.response || data.output || "I'm having trouble connecting. Let me help based on what I see."

      setIsThinking(false)
      await addChatMessage(editorName, editorResponse)

    } catch (error) {
      console.error('Chat error:', error)
      setIsThinking(false)
      await addChatMessage(editorName, "I'm having trouble connecting. Let me help based on what I see in your manuscript.")
    }
  }

  // Save chapter changes
  async function saveChanges() {
    if (!manuscript || !chapters[currentChapterIndex]) return

    const supabase = createClient()
    const currentChapter = chapters[currentChapterIndex]

    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          content: editorContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentChapter.id)

      if (error) throw error

      setHasUnsavedChanges(false)
      await addChatMessage(editorName, '✅ Changes saved successfully!')

    } catch (error) {
      console.error('Save error:', error)
      await addChatMessage(editorName, '❌ Error saving changes. Please try again.')
    }
  }

  // Approve chapter for current phase
  async function handleApproveChapter() {
    if (!manuscript || !activePhase || !chapters[currentChapterIndex]) return

    const supabase = createClient()
    const currentChapter = chapters[currentChapterIndex]

    try {
      // Approve chapter using helper
      const success = await approveChapter(
        supabase,
        currentChapter.id,
        activePhase.phase_number as PhaseNumber,
        editorContent
      )

      if (!success) {
        throw new Error('Failed to approve chapter')
      }

      console.log(`✅ Chapter ${currentChapter.chapter_number} approved for Phase ${activePhase.phase_number}`)

      // Update local state
      const phaseColumn = `phase_${activePhase.phase_number}_approved_at` as keyof Chapter
      const updatedChapters = [...chapters]
      updatedChapters[currentChapterIndex] = {
        ...updatedChapters[currentChapterIndex],
        [phaseColumn]: new Date().toISOString()
      }
      setChapters(updatedChapters)
      setHasUnsavedChanges(false)

      const chapterLabel = currentChapter.chapter_number === 0 
        ? 'Prologue' 
        : `Chapter ${currentChapter.chapter_number}`

      await addChatMessage(editorName, `✅ ${chapterLabel} approved! Great work.`)

      // Check if all chapters are now approved
      const allApproved = await areAllChaptersApproved(
        supabase,
        manuscript.id,
        activePhase.phase_number as PhaseNumber
      )

      if (allApproved) {
        // All chapters approved - handle phase completion
        await handlePhaseComplete()
      } else if (currentChapterIndex < chapters.length - 1) {
        // Move to next chapter
        setTimeout(() => loadChapter(currentChapterIndex + 1), 1000)
      }

    } catch (error) {
      console.error('Approve error:', error)
      await addChatMessage(editorName, '❌ Error approving chapter. Please try again.')
    }
  }

  // Handle phase completion
  async function handlePhaseComplete() {
    if (!manuscript || !activePhase) return

    const supabase = createClient()

    try {
      console.log(`🎉 All chapters approved for Phase ${activePhase.phase_number}!`)

      // 1. Create approved snapshot
      const snapshotCreated = await createApprovedSnapshot(
        supabase,
        manuscript.id,
        activePhase.phase_number as PhaseNumber,
        activePhase.editor_name
      )

      if (!snapshotCreated) {
        console.error('Failed to create snapshot')
      }

      // 2. Transition to next phase
      const transitioned = await transitionToNextPhase(
        supabase,
        manuscript.id,
        activePhase.phase_number as PhaseNumber
      )

      if (!transitioned) {
        throw new Error('Failed to transition phases')
      }

      // 3. Show completion message
      setTimeout(() => {
        addChatMessage(
          editorName,
          getPhaseCompletionMessage(activePhase.phase_number, chapters.length)
        )
      }, 1500)

      // 4. Reload to show new phase
      setTimeout(() => {
        window.location.reload()
      }, 3000)

    } catch (error) {
      console.error('Error completing phase:', error)
      await addChatMessage(editorName, '✅ All chapters approved! There was an issue with the transition, but your work is safe.')
    }
  }

  // Get phase completion message
  function getPhaseCompletionMessage(phaseNumber: number, chapterCount: number): string {
    if (phaseNumber === 1) {
      return `🎉 **Incredible work, ${authorFirstName}!**\n\n` +
        `You've successfully approved all ${chapterCount} chapters. Your story structure is solid, ` +
        `your character arcs are clear, and the pacing flows beautifully.\n\n` +
        `**What happens next?**\n` +
        `You're ready for **Phase 2: Line Editing with Sam**. Sam will work at the sentence level, ` +
        `polishing your prose and making sure every word sings.\n\n` +
        `The page will reload in a moment to begin Phase 2...\n\n` +
        `*— Alex, Your Developmental Editor* 👔`
    } else if (phaseNumber === 2) {
      return `✨ **Beautiful work, ${authorFirstName}!**\n\n` +
        `Your prose is polished and shining. Every sentence flows, your dialogue sparkles, ` +
        `and your voice is consistent and compelling.\n\n` +
        `**Next up: Phase 3 with Jordan** for the final technical polish!\n\n` +
        `*— Sam, Your Line Editor* ✨`
    }
    
    return `Phase ${phaseNumber} complete! Moving to next phase...`
  }

  // Analyze chapter on demand
  async function analyzeChapter(chapterNumber: number) {
    if (!manuscript || !activePhase) return

    const chapter = chapters.find(ch => ch.chapter_number === chapterNumber)
    if (!chapter) return

    // Update status
    setChapterEditingStatus(prev => ({
      ...prev,
      [chapterNumber]: 'analyzing'
    }))

    const chapterLabel = chapter.chapter_number === 0 ? 'Prologue' : chapter.title

    await addChatMessage(
      editorName,
      `📖 Let me analyze "${chapterLabel}". This will just take a moment...`
    )

    // Show analyzing messages
    const messages = [
      'Reading through carefully...',
      'Taking notes...',
      'Organizing my thoughts...',
      'Almost done...'
    ]
    
    let msgIndex = 0
    setAnalyzingMessage(messages[0])
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length
      setAnalyzingMessage(messages[msgIndex])
    }, 4000)

    try {
      // Trigger chapter analysis
      const analysisWebhook = activePhase.phase_number === 2 
        ? WEBHOOKS.samChapterAnalysis 
        : WEBHOOKS.alexChapterAnalysis

      await fetch(analysisWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manuscriptId: manuscript.id,
          chapterNumber: chapterNumber,
          userId: manuscript.author_id
        })
      }).catch(() => console.log('✅ Analysis webhook triggered'))

      clearInterval(msgInterval)

      // Poll for issues
      pollForChapterIssues(chapterNumber)

    } catch (error) {
      clearInterval(msgInterval)
      console.error('Error analyzing chapter:', error)
      await addChatMessage(editorName, '❌ Had trouble analyzing. Please try again.')
    }
  }

  // Poll for chapter issues to appear
  function pollForChapterIssues(chapterNumber: number) {
    let attempts = 0
    const maxAttempts = 20

    const pollInterval = setInterval(async () => {
      attempts++

      await loadChapterIssues(chapterNumber)

      if (chapterIssues.length > 0 || attempts >= maxAttempts) {
        clearInterval(pollInterval)
        
        setChapterEditingStatus(prev => ({
          ...prev,
          [chapterNumber]: 'ready'
        }))

        if (chapterIssues.length > 0) {
          await addChatMessage(
            editorName,
            `✅ I've got some thoughts on this chapter. Check the sidebar!`
          )
        } else {
          await addChatMessage(
            editorName,
            `✅ Analysis complete! This chapter looks good.`
          )
        }
      }
    }, 2000)
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
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Setting Up Your Studio</h3>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!manuscript || !activePhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Studio</h3>
          <p className="text-gray-600 mb-6">Unable to load your manuscript. Please try again.</p>
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

  const currentChapter = chapters[currentChapterIndex]
  const currentEditingStatus = currentChapter ? chapterEditingStatus[currentChapter.chapter_number] : 'not_started'

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className={`bg-${editorColor}-600 text-white p-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">{manuscript.title}</h1>
              <p className="text-sm opacity-90">
                Phase {currentPhase}: {EDITOR_CONFIG[currentPhase as PhaseNumber].phaseName} with {editorName}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Chapter Navigation */}
        <div className={`${isChapterSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!isChapterSidebarCollapsed && (
              <h2 className="font-bold text-gray-900">Chapters ({chapters.length})</h2>
            )}
            <button
              onClick={() => setIsChapterSidebarCollapsed(!isChapterSidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {isChapterSidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {chapters.map((chapter, index) => {
              const editStatus = chapterEditingStatus[chapter.chapter_number]
              const phaseColumn = `phase_${currentPhase}_approved_at` as keyof Chapter
              const isApproved = !!chapter[phaseColumn]
              
              return (
                <button
                  key={chapter.id}
                  onClick={() => !isLocked && loadChapter(index)}
                  disabled={isLocked}
                  className={`w-full p-3 rounded-lg mb-2 text-left transition ${
                    isLocked
                      ? 'opacity-50 cursor-not-allowed'
                      : index === currentChapterIndex
                        ? `bg-${editorColor}-50 border-2 border-${editorColor}-500`
                        : 'bg-white border border-gray-200 hover:border-${editorColor}-300'
                  }`}
                >
                  {!isChapterSidebarCollapsed ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {isApproved ? (
                          <span className={`text-${editorColor}-600 text-lg`}>✓</span>
                        ) : editStatus === 'analyzing' ? (
                          <div className={`w-4 h-4 border-2 border-${editorColor}-500 border-t-transparent rounded-full animate-spin`}></div>
                        ) : editStatus === 'ready' ? (
                          <span className={`text-${editorColor}-600 text-lg`}>●</span>
                        ) : (
                          <span className="text-gray-300 text-lg">○</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">
                          {chapter.chapter_number === 0 ? 'Prologue' : `Chapter ${chapter.chapter_number}`}
                        </div>
                        <div className="font-semibold text-sm">{chapter.title}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {chapter.chapter_number === 0 ? 'P' : chapter.chapter_number}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* CENTER: Editor */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold">{currentChapter?.title || 'Loading...'}</h3>
            <div className="flex gap-2">
              {currentEditingStatus === 'not_started' && analysisComplete && (
                <button
                  onClick={() => analyzeChapter(currentChapter.chapter_number)}
                  className={`px-4 py-2 bg-${editorColor}-600 text-white rounded-lg hover:bg-${editorColor}-700`}
                >
                  Start Editing
                </button>
              )}
              
              {chapterIssues.length > 0 && (
                <button
                  onClick={() => setShowIssuesPanel(!showIssuesPanel)}
                  className={`px-4 py-2 rounded-lg ${
                    showIssuesPanel
                      ? `bg-${editorColor}-600 text-white`
                      : `bg-${editorColor}-50 text-${editorColor}-700 border border-${editorColor}-300`
                  }`}
                >
                  Notes ({chapterIssues.length})
                </button>
              )}

              <button
                onClick={saveChanges}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg ${
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>

              {currentEditingStatus === 'ready' && (
                <button
                  onClick={handleApproveChapter}
                  className={`px-4 py-2 bg-${editorColor}-600 text-white rounded-lg hover:bg-${editorColor}-700`}
                >
                  Approve
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <textarea
              value={editorContent}
              onChange={(e) => {
                setEditorContent(e.target.value)
                setHasUnsavedChanges(true)
              }}
              className="w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${editorColor}-500 font-serif text-lg leading-relaxed"
              disabled={isLocked}
            />
          </div>

          <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
            Words: {wordCount.toLocaleString()}
            {hasUnsavedChanges && <span className="mx-2 text-blue-600">• Unsaved changes</span>}
          </div>
        </div>

        {/* RIGHT: Chat Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className={`p-4 bg-${editorColor}-600 text-white`}>
            <h2 className="text-xl font-bold">{editorName}</h2>
            <p className="text-sm opacity-90">{EDITOR_CONFIG[currentPhase as PhaseNumber].phaseName}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender === 'Author'
                    ? 'bg-blue-50 border-blue-200 ml-8'
                    : `bg-${editorColor}-50 border-${editorColor}-200 mr-8`
                } border rounded-lg p-3`}
              >
                <div className="font-semibold text-sm mb-1">{msg.sender}</div>
                <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
              </div>
            ))}
            
            {isThinking && (
              <div className={`bg-${editorColor}-50 border-${editorColor}-200 border rounded-lg p-3 mr-8`}>
                <div className="font-semibold text-sm mb-1">{editorName}</div>
                <div className="text-sm">Thinking...</div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Ask ${editorName}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${editorColor}-500"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isThinking}
                className={`px-4 py-2 bg-${editorColor}-600 text-white rounded-lg hover:bg-${editorColor}-700 disabled:opacity-50`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Issues Panel Overlay */}
      {showIssuesPanel && (
        <div className="absolute right-96 top-20 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold">Editor Notes</h3>
            <button
              onClick={() => setShowIssuesPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-gray-200 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setIssueFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm ${
                issueFilter === 'all'
                  ? `bg-${editorColor}-600 text-white`
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({chapterIssues.length})
            </button>
            
            {ISSUE_CATEGORIES[currentPhase as PhaseNumber].map(category => (
              <button
                key={category}
                onClick={() => setIssueFilter(category)}
                className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                  issueFilter === category
                    ? `bg-${editorColor}-600 text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category.replace('_', ' ')} ({chapterIssues.filter(i => i.element_type === category).length})
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className={`border-l-4 border-${editorColor}-500 bg-gray-50 p-3 rounded`}
              >
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {issue.element_type.replace('_', ' ')}
                </div>
                <div className="text-sm text-gray-900 mb-2">{issue.issue_description}</div>
                <div className="text-sm text-gray-600 italic">{issue.editor_suggestion}</div>
              </div>
            ))}
            
            {filteredIssues.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No notes in this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AuthorStudioPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudioContent />
    </Suspense>
  )
}