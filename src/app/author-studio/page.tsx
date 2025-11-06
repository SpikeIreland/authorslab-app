'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { VersionsDropdown } from '@/components/VersionsDropdown'

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

import { EDITOR_CONFIG, ISSUE_CATEGORIES_BY_PHASE } from '@/types/database'

// Utility to highlight text in the editor
function highlightTextInEditor(quotedText: string, editorRef: HTMLElement | null) {
  if (!editorRef || !quotedText) return false;

  // Remove any existing highlights
  const existingHighlights = editorRef.querySelectorAll('.issue-highlight');
  existingHighlights.forEach(el => {
    const parent = el.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent || ''), el);
      parent.normalize(); // Merge adjacent text nodes
    }
  });

  // Find the text to highlight
  const walker = document.createTreeWalker(
    editorRef,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  let found = false;

  while ((node = walker.nextNode())) {
    const text = node.textContent || '';
    const index = text.indexOf(quotedText);

    if (index !== -1) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + quotedText.length);

      // Create highlight span
      const highlight = document.createElement('span');
      highlight.className = 'issue-highlight';
      highlight.style.backgroundColor = '#fef3c7'; // yellow-100
      highlight.style.borderRadius = '2px';
      highlight.style.padding = '2px 0';
      highlight.style.boxShadow = '0 0 0 2px #fbbf24'; // yellow-400 border

      range.surroundContents(highlight);

      // Scroll to highlight with offset for header
      setTimeout(() => {
        highlight.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);

      found = true;
      break;
    }
  }

  return found;
}

function getEditorColorClasses(color: string) {
  const colorMap = {
    green: {
      bg: 'bg-green-600',
      bgHover: 'hover:bg-green-700',
      bgLight: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-500',
      borderLight: 'border-green-300',
      borderColor: 'border-green-200',
      ring: 'focus:ring-green-500',
    },
    purple: {
      bg: 'bg-purple-600',
      bgHover: 'hover:bg-purple-700',
      bgLight: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-500',
      borderLight: 'border-purple-300',
      borderColor: 'border-purple-200',
      ring: 'focus:ring-purple-500',
    },
    blue: {
      bg: 'bg-blue-600',
      bgHover: 'hover:bg-blue-700',
      bgLight: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-500',
      borderLight: 'border-blue-300',
      borderColor: 'border-blue-200',
      ring: 'focus:ring-blue-500',
    },
    teal: {
      bg: 'bg-teal-600',
      bgHover: 'hover:bg-teal-700',
      bgLight: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-500',
      borderLight: 'border-teal-300',
      borderColor: 'border-teal-200',
      ring: 'focus:ring-teal-500',
    },
    orange: {
      bg: 'bg-orange-600',
      bgHover: 'hover:bg-orange-700',
      bgLight: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-500',
      borderLight: 'border-orange-300',
      borderColor: 'border-orange-200',
      ring: 'focus:ring-orange-500',
    },
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.green
}

// Helper function to get category color classes
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    // Phase 1 (Alex)
    'character': 'bg-green-100 text-green-700',
    'plot': 'bg-green-100 text-green-700',
    'pacing': 'bg-green-100 text-green-700',
    'structure': 'bg-green-100 text-green-700',
    'theme': 'bg-green-100 text-green-700',
    // Phase 2 (Sam)
    'word_choice': 'bg-purple-100 text-purple-700',
    'sentence_flow': 'bg-purple-100 text-purple-700',
    'dialogue': 'bg-purple-100 text-purple-700',
    'voice': 'bg-purple-100 text-purple-700',
    'clarity': 'bg-purple-100 text-purple-700',
    // Phase 3 (Jordan)
    'grammar': 'bg-blue-100 text-blue-700',
    'punctuation': 'bg-blue-100 text-blue-700',
    'consistency': 'bg-blue-100 text-blue-700',
    'formatting': 'bg-blue-100 text-blue-700',
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

// Helper function to get severity color classes
function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    'minor': 'text-gray-600',
    'moderate': 'text-orange-600 font-medium',
    'major': 'text-red-600 font-bold',
  }
  return colors[severity] || 'text-gray-600'
}

const WEBHOOKS = {
  alexFullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-full-manuscript-analysis',
  alexChapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chapter-analysis',
  alexChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/alex-chat',
  alexGenerateSummary: 'https://spikeislandstudios.app.n8n.cloud/webhook/generate-summary-points',
  alexGenerateChapterSummaries: 'https://spikeislandstudios.app.n8n.cloud/webhook/generate-chapter-summaries',
  samFullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-full-manuscript-analysis',
  samChapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-chapter-analysis',
  samChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/sam-chat',
  jordanFullAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/jordan-full-manuscript-analysis',
  jordanChapterAnalysis: 'https://spikeislandstudios.app.n8n.cloud/webhook/jordan-chapter-analysis',
  jordanChat: 'https://spikeislandstudios.app.n8n.cloud/webhook/jordan-chat',
}

interface ChatMessage {
  sender: 'Author' | 'system' | string
  message: string
}

type ChapterEditingStatus = 'not_started' | 'analyzing' | 'ready'

function StudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Core State
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [activePhase, setActivePhase] = useState<EditingPhase | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Loading your studio...')
  const [isSaving, setIsSaving] = useState(false)
  const pendingContentRef = useRef<string>('')
  const [authorName, setAuthorName] = useState<string>('Author')

  // Phase/Editor State (derived from activePhase)
  const currentPhase = activePhase?.phase_number || 1
  const editorName = activePhase?.editor_name || 'Alex'
  const editorColor = activePhase?.editor_color || 'green'
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Editor State
  const [editorContent, setEditorContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [editorPhases, setEditorPhases] = useState<EditingPhase[]>([])

  const editorPanelRef = useRef<HTMLDivElement>(null);


  // Chapter Editing Status
  const [chapterEditingStatus, setChapterEditingStatus] = useState<{ [key: number]: ChapterEditingStatus }>({})
  const [analyzingMessage, setAnalyzingMessage] = useState('')
  const [unsavedChapters, setUnsavedChapters] = useState<Set<number>>(new Set())

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  // Issues State
  const [chapterIssues, setChapterIssues] = useState<ManuscriptIssue[]>([])
  const [showIssuesPanel, setShowIssuesPanel] = useState(false)
  const [issueFilter, setIssueFilter] = useState<string>('all')
  const [discussingIssue, setDiscussingIssue] = useState<ManuscriptIssue | null>(null)

  // Analysis State
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [fullAnalysisInProgress, setFullAnalysisInProgress] = useState(false)
  const [thinkingMessage, setThinkingMessage] = useState('')
  const [fullReportPdfUrl, setFullReportPdfUrl] = useState<string | null>(null)

  const [showMeetNextEditorButton, setShowMeetNextEditorButton] = useState(false)

  // Author name
  const [authorFirstName, setAuthorFirstName] = useState<string>('')

  // Sidebar collapsed
  const [isChapterSidebarCollapsed, setIsChapterSidebarCollapsed] = useState(false)

  const triggerFullAnalysis = async () => {
    if (!manuscript) return

    setFullAnalysisInProgress(true)

    // Add immediate message BEFORE triggering the workflow
    await addChatMessage(
      editorName,
      `Perfect! I'm diving into your manuscript now. This will take about 5 minutes.\n\n` +
      `I'm analyzing:\n` +
      `• Story structure and plot\n` +
      `• Character development\n` +
      `• Pacing and flow\n` +
      `• Themes and motifs\n\n` +
      `You'll receive a comprehensive report by email when I'm done.\n\n` +
      `**While I read:** Check that your text and chapters loaded correctly, and save any edits you make. 📚`
    )

    try {
      // Update database status
      const supabase = createClient()
      await supabase
        .from('manuscripts')
        .update({
          analysis_started_at: new Date().toISOString(),
          status: 'analyzing'
        })
        .eq('id', manuscript.id)

      // Trigger all THREE workflows simultaneously
      await Promise.all([
        // 1. Full analysis (PDF report)
        fetch(WEBHOOKS.alexFullAnalysis, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscriptId: manuscript.id,
            userId: manuscript.author_id
          })
        }).catch(() => console.log('✅ Full analysis webhook triggered')),

        // 2. Generate summary + key points
        fetch(WEBHOOKS.alexGenerateSummary, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscriptId: manuscript.id,
            userId: manuscript.author_id
          })
        }).catch(() => console.log('✅ Summary webhook triggered')),

        // 3. Chapter summaries
        fetch(WEBHOOKS.alexGenerateChapterSummaries, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscriptId: manuscript.id,
            userId: manuscript.author_id
          })
        }).catch(() => console.log('✅ Chapter summaries webhook triggered'))
      ])

      console.log('✅ All analysis workflows triggered successfully')

      // Poll for completion
      pollForAnalysisCompletion()

    } catch (error) {
      console.error('Error triggering analysis:', error)
      setFullAnalysisInProgress(false)
      await addChatMessage(editorName, 'There was an issue starting the analysis. Please try again.')
    }
  }

  const pollForAnalysisCompletion = async () => {
    const supabase = createClient()
    let attempts = 0
    const maxAttempts = 100 // 5 minutes

    const pollInterval = setInterval(async () => {
      attempts++

      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('manuscript_summary, full_analysis_key_points, report_pdf_url')
        .eq('id', manuscript?.id)
        .single()

      // Check if summary exists (not full_analysis_completed_at)
      if (manuscriptData?.manuscript_summary && manuscriptData?.full_analysis_key_points) {
        clearInterval(pollInterval)
        setFullAnalysisInProgress(false)
        setAnalysisComplete(true)

        // Update local manuscript state
        setManuscript(prev => prev ? {
          ...prev,
          manuscript_summary: manuscriptData.manuscript_summary,
          full_analysis_key_points: manuscriptData.full_analysis_key_points,
          report_pdf_url: manuscriptData.report_pdf_url
        } : null)

        await addChatMessage(
          editorName,
          `✅ I've finished reading your manuscript! I'm genuinely excited about what you've created.\n\n` +
          `📧 Your comprehensive PDF report will arrive by email shortly (it takes about 15 minutes to generate).\n\n` +
          `**Ready to start editing?**\n` +
          `Click on any chapter and hit "Start Editing" to see my specific notes. We'll work through them together, one chapter at a time.`
        )
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval)
        setFullAnalysisInProgress(false)
        await addChatMessage(
          editorName,
          '⚠️ Analysis is taking longer than expected. Please refresh the page in a moment.'
        )
      }
    }, 3000) // Poll every 3 seconds
  }

  // Realtime subscription for PDF report completion
  useEffect(() => {
    if (!manuscript?.id) return

    console.log('📡 Subscribing to report updates for manuscript:', manuscript.id)

    const supabase = createClient()

    const channel = supabase
      .channel('report-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'editing_phases',
          filter: `manuscript_id=eq.${manuscript.id}`
        },
        async (payload) => {
          console.log('🔔 Editing phase update received:', payload)

          if (payload.new.report_pdf_url && payload.new.ai_read_completed_at) {
            console.log('✅ PDF Report ready (realtime)')

            // Reload ALL phases to update button states
            const { data: allPhases } = await supabase
              .from('editing_phases')
              .select('*')
              .eq('manuscript_id', manuscript.id)
              .order('phase_number', { ascending: true })

            if (allPhases) {
              setEditorPhases(allPhases)
              console.log('🔄 Updated phases with new report data')
            }

            // Add chat message when report is ready
            const editorName = payload.new.editor_name || 'Your editor'
            addChatMessage(
              editorName,
              `📧 Your comprehensive PDF report is ready! Check your email or click "${editorName}'s Report" above.`
            )
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔌 Unsubscribing from report updates')
      supabase.removeChannel(channel)
    }
  }, [manuscript?.id])

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

  // Sync contentEditable when chapter changes
  useEffect(() => {
    if (editorPanelRef.current && editorContent !== editorPanelRef.current.textContent) {
      editorPanelRef.current.textContent = editorContent
    }
  }, [currentChapterIndex, editorContent])

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
        .select('id, first_name, last_name')
        .eq('auth_user_id', user.id)
        .single()

      if (!authorProfile) {
        console.error('No author profile found')
        router.push('/onboarding')
        return
      }

      setAuthorFirstName(authorProfile.first_name || 'there')

      // Set full author name for header
      const fullName = `${authorProfile.first_name || ''} ${authorProfile.last_name || ''}`.trim()
      setAuthorName(fullName || 'Author')

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

      // Check if analysis is complete (summary + key points, not full PDF)
      if (manuscriptData.manuscript_summary && manuscriptData.full_analysis_key_points) {
        setAnalysisComplete(true)
        console.log('✅ Analysis already complete on page load')
      }

      // ========================================
      // NEW: Load ALL editing phases
      // ========================================
      setLoadingMessage('Loading phases...')
      const { data: allPhases } = await supabase
        .from('editing_phases')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .order('phase_number', { ascending: true })

      if (allPhases) {
        setEditorPhases(allPhases)
        console.log(`✅ Loaded ${allPhases.length} editing phases`)

        // Check if user requested a specific phase via URL parameter
        const phaseParam = searchParams.get('phase')
        let phaseToLoad

        if (phaseParam) {
          // User clicked "Return to [Editor]" from phase-complete page
          const targetPhaseNumber = parseInt(phaseParam)
          phaseToLoad = allPhases.find(p => p.phase_number === targetPhaseNumber)
          console.log(`🔄 Loading requested phase ${targetPhaseNumber}`)
        } else {
          // Normal flow - load the currently active phase
          phaseToLoad = allPhases.find(p => p.phase_status === 'active')
        }

        if (!phaseToLoad) {
          console.error('No phase found to load')
          throw new Error('No phase found')
        }

        setActivePhase(phaseToLoad)
        console.log(`✅ Loaded phase: ${phaseToLoad.phase_name} (${phaseToLoad.editor_name})`)
      } else {
        // Fallback to old method if allPhases query fails
        const phase = await getActivePhase(supabase, manuscriptId)

        if (!phase) {
          console.error('No active phase found')
          throw new Error('No active phase')
        }

        setActivePhase(phase)
        console.log(`✅ Active phase: ${phase.phase_name} (${phase.editor_name})`)
      }
      // ========================================
      // END NEW CODE
      // ========================================

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

      // Load first chapter
      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData)

        // Initialize chapter editing status for all chapters
        const initialStatus: { [key: number]: ChapterEditingStatus } = {}
        chaptersData.forEach(ch => {
          initialStatus[ch.chapter_number] = 'not_started'
        })
        setChapterEditingStatus(initialStatus)
        console.log('✅ Initialized editing status for', chaptersData.length, 'chapters')

        // Load the first chapter in the array
        setCurrentChapterIndex(0)
        const firstChapter = chaptersData[0]

        setEditorContent(firstChapter.content)
        setWordCount(firstChapter.content.split(/\s+/).filter((w: string) => w.length > 0).length)
        setHasUnsavedChanges(false)
      }

      // Load chat history for active phase
      setLoadingMessage('Loading chat history...')
      const activePhaseToUse = allPhases?.find(p => p.phase_status === 'active') || await getActivePhase(supabase, manuscriptId)

      if (activePhaseToUse) {
        const history = await getChatHistory(supabase, manuscriptId, activePhaseToUse.phase_number)

        if (history && history.length > 0) {
          const messages: ChatMessage[] = history.map(msg => ({
            sender: msg.sender === 'author' ? 'Author' : editorName,
            message: msg.message
          })) as ChatMessage[]  // ← Add type assertion
          setChatMessages(messages)
          console.log(`✅ Restored ${history.length} chat messages`)
        } else {
          // Show initial greeting for this phase
          showInitialGreeting(activePhaseToUse, manuscriptData, authorProfile.first_name, chaptersData?.length || 0)
        }
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

  function showInitialGreeting(phase: EditingPhase, manuscript: Manuscript, firstName: string, chapterCount: number) {
    if (phase.phase_number === 1) {
      // Alex's greeting
      if (manuscript.full_analysis_text) {
        addChatMessage('Alex', `Hi ${firstName}! Welcome back. What do you want to work on today? Click on any chapter and let's get started.`)
      } else {
        addChatMessage('Alex',
          `Welcome! I'm Alex, your developmental editor. I can see you've uploaded "${manuscript.title}" with ${chapterCount} chapters.\n\n` +
          `I'm ready to read your manuscript and create a comprehensive analysis. This will take about 5 minutes.\n\n` +
          `When you're ready, click the "Read My Manuscript" button above to begin! 📖`
        )
      }
    } else if (phase.phase_number === 2) {
      // Sam's greeting - check if he finished reading
      const samPhase = editorPhases.find(p => p.phase_number === 2)

      if (samPhase?.report_pdf_url) {
        // Sam finished reading
        addChatMessage('Sam',
          `Hey ${firstName}! I'm Sam, your line editor. ✨\n\n` +
          `I've already read through your approved manuscript and I'm excited about the prose work ahead! ` +
          `The structural foundation Alex helped you build is solid—now let's make every sentence shine.\n\n` +
          `📧 I've sent you a detailed line-editing report by email.\n\n` +
          `**Ready to start?** Click on any chapter to see my specific prose notes! 📚`
        )
      } else {
        // Sam is still reading
        addChatMessage('Sam',
          `Hey ${firstName}! I'm Sam, your line editor. ✨\n\n` +
          `I've reviewed the fantastic structural work you and Alex accomplished together on "${manuscript.title}". ` +
          `I'm currently doing a deep read of your prose—should be done in just a few minutes.\n\n` +
          `**While I read:** Feel free to browse your chapters. I'll let you know when I'm ready! 📚`
        )

        // Poll for Sam's reading completion
        pollForSamReading()
      }
    } else if (phase.phase_number === 3) {
      // Jordan's greeting (for future Phase 3)
      addChatMessage('Jordan',
        `Hi ${firstName}! I'm Jordan, your copy editor. 🔍\n\n` +
        `I've reviewed the excellent work you did with Alex and Sam. ` +
        `Now let's make sure every technical detail is perfect.\n\n` +
        `Click on any chapter to start! 📚`
      )
    }
  }

  const pollForSamReading = async () => {
    if (!manuscript) return

    const supabase = createClient()
    let attempts = 0
    const maxAttempts = 60 // 3 minutes (60 x 3 seconds)

    const pollInterval = setInterval(async () => {
      attempts++

      const { data: samPhase } = await supabase
        .from('editing_phases')
        .select('report_pdf_url')
        .eq('manuscript_id', manuscript.id)
        .eq('phase_number', 2)
        .single()

      if (samPhase?.report_pdf_url) {
        clearInterval(pollInterval)

        await addChatMessage('Sam',
          `✨ Done reading! Your prose has some really beautiful moments.\n\n` +
          `📧 I've sent you my line-editing report by email.\n\n` +
          `**Let's get started!** Click on any chapter to see my prose notes.`
        )

        // Reload phases to show report button in header
        const { data: allPhases } = await supabase
          .from('editing_phases')
          .select('*')
          .eq('manuscript_id', manuscript.id)
          .order('phase_number', { ascending: true })

        if (allPhases) {
          setEditorPhases(allPhases)
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval)
        await addChatMessage('Sam',
          `Almost done reading... Feel free to start browsing chapters while I finish up! ✨`
        )
      }
    }, 3000) // Poll every 3 seconds
  }

  // Edit chapter title
  async function handleEditChapterTitle(chapter: Chapter) {
    const newTitle = prompt(`Edit title for ${chapter.chapter_number === 0 ? 'Prologue' : `Chapter ${chapter.chapter_number}`}:`, chapter.title)

    if (newTitle && newTitle.trim() && newTitle !== chapter.title) {
      const supabase = createClient()
      const { error } = await supabase
        .from('chapters')
        .update({ title: newTitle.trim() })
        .eq('id', chapter.id)

      if (!error) {
        // Update local state
        setChapters(prev => prev.map(ch =>
          ch.id === chapter.id ? { ...ch, title: newTitle.trim() } : ch
        ))

        await addChatMessage(editorName, `✅ Chapter title updated to "${newTitle.trim()}"`)
      } else {
        console.error('Failed to update title:', error)
        await addChatMessage(editorName, '❌ Failed to update chapter title. Please try again.')
      }
    }
  }

  async function loadChapter(index: number) {
    if (isLocked) return

    // Clear auto-save timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      setAutoSaveTimer(null)
    }

    // Save current chapter if unsaved
    if (hasUnsavedChanges && currentChapter && pendingContentRef.current) {
      console.log('💾 Saving before switch')
      const supabase = createClient()
      await supabase
        .from('chapters')
        .update({
          content: pendingContentRef.current,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentChapter.id)

      pendingContentRef.current = ''
    }

    // Get chapter ID from state
    const chapterId = chapters[index]?.id
    if (!chapterId) return

    // Fetch FRESH chapter data from database
    const supabase = createClient()
    const { data: freshChapter, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()

    if (error || !freshChapter) {
      console.error('Failed to load chapter:', error)
      return
    }

    console.log('📖 Loaded fresh chapter from database:', freshChapter.chapter_number)

    setCurrentChapterIndex(index)
    setEditorContent(freshChapter.content)
    setWordCount(freshChapter.content.split(/\s+/).filter((w: string) => w.length > 0).length)
    setHasUnsavedChanges(false)

    const editStatus = chapterEditingStatus[freshChapter.chapter_number]
    if (editStatus === 'ready') {
      await loadChapterIssues(freshChapter.chapter_number)
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
      .neq('status', 'dismissed')  // ← Add this line to filter out dismissed issues
      .order('severity', { ascending: false })

    if (error) {
      console.error('Error loading issues:', error)
      return
    }

    setChapterIssues(issues || [])
    console.log(`Loaded ${issues?.length || 0} issues for chapter ${chapterNumber}`)
  }

  // Add chat message (and persist to database)
  async function addChatMessage(sender: ChatMessage['sender'], message: string, chapterNumber?: number) {
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
      const chatWebhook =
        activePhase.phase_number === 2 ? WEBHOOKS.samChat :
          activePhase.phase_number === 3 ? WEBHOOKS.jordanChat :
            WEBHOOKS.alexChat

      // Build the payload - include note context if discussing an issue
      const payload = {
        message: message,
        manuscriptId: manuscript.id,
        chapterNumber: chapters[currentChapterIndex]?.chapter_number,
        chapterContent: editorContent,
        ...(discussingIssue && {
          isNoteDiscussion: true,
          issueId: discussingIssue.id,
          noteContent: discussingIssue.issue_description,
          noteQuestion: discussingIssue.editor_suggestion,
          noteType: discussingIssue.element_type
        })
      }

      const response = await fetch(chatWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      const editorResponse = data.response || data.output || "I'm having trouble connecting. Let me help based on what I see."

      setIsThinking(false)
      await addChatMessage(editorName, editorResponse)

      // Clear the discussing issue after response
      setDiscussingIssue(null)

    } catch (error) {
      console.error('Chat error:', error)
      setIsThinking(false)
      await addChatMessage(editorName, "I'm having trouble connecting. Let me help based on what I see in your manuscript.")

      // Clear discussing issue even on error
      setDiscussingIssue(null)
    }
  }

  async function handleDiscussIssue(issue: ManuscriptIssue) {
    if (!manuscript || !activePhase) return

    // Close the issues panel
    setShowIssuesPanel(false)

    // Store the issue being discussed (don't send yet!)
    setDiscussingIssue(issue)

    // Add a system message showing what's being discussed
    await addChatMessage(
      'system',
      `📝 **Discussing ${editorName}'s Note:**\n\n` +
      `**Issue:** ${issue.issue_description}\n\n` +
      `**${editorName}'s question:** ${issue.editor_suggestion}\n\n` +
      `*What would you like to ask ${editorName} about this?*`
    )
    // Focus the chat input so author can type immediately
    chatInputRef.current?.focus()
  }

  // Handle dismissing an issue
  async function handleDismissIssue(issue: ManuscriptIssue) {
    const supabase = createClient()

    await supabase
      .from('manuscript_issues')
      .update({ status: 'dismissed' })
      .eq('id', issue.id)

    // Reload issues to remove dismissed one
    await loadChapterIssues(currentChapter.chapter_number)
  }

  async function saveChanges(isAutoSave = false) {
    if (!currentChapter || !manuscript || !hasUnsavedChanges) {
      console.log('Save blocked:', { currentChapter: !!currentChapter, manuscript: !!manuscript, hasUnsavedChanges })
      return
    }

    console.log('💾 Saving chapter:', currentChapter.chapter_number, 'Auto:', isAutoSave)

    if (!isAutoSave) setIsLocked(true)
    setIsSaving(true)

    try {
      const supabase = createClient()

      console.log('Updating chapter with content length:', editorContent.length)

      const { data, error } = await supabase
        .from('chapters')
        .update({
          content: editorContent,
          word_count: wordCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentChapter.id)
        .select()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Save successful:', data)

      setHasUnsavedChanges(false)
      setUnsavedChapters(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentChapter.chapter_number)
        return newSet
      })

      if (!isAutoSave) {
        const chapterLabel = currentChapter.chapter_number === 0
          ? 'Prologue'
          : `Chapter ${currentChapter.chapter_number}`

        await addChatMessage(editorName, `✅ ${chapterLabel}: "${currentChapter.title}" saved successfully!`)
      }

    } catch (error) {
      console.error('💥 Save error:', error)
      if (!isAutoSave) {
        await addChatMessage(editorName, '❌ Failed to save. Please try again.')
      }
    } finally {
      setIsSaving(false)
      if (!isAutoSave) setIsLocked(false)
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
        await handlePhaseCompletion()
      } else if (currentChapterIndex < chapters.length - 1) {
        // Move to next chapter
        setTimeout(() => loadChapter(currentChapterIndex + 1), 1000)
      }

    } catch (error) {
      console.error('Approve error:', error)
      await addChatMessage(editorName, '❌ Error approving chapter. Please try again.')
    }
  }

  async function handlePhaseCompletion() {
    if (!manuscript || !activePhase) return

    try {
      const supabase = createClient()

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

      // 2. Trigger next editor's reading
      if (activePhase.phase_number === 1) {
        // Completing Phase 1 → Trigger Sam's reading
        console.log('🚀 Starting Sam\'s manuscript reading...')

        fetch(WEBHOOKS.samFullAnalysis, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscriptId: manuscript.id,
            userId: manuscript.author_id
          })
        }).catch(() => console.log('✅ Sam reading triggered'))
      } else if (activePhase.phase_number === 2) {
        // Completing Phase 2 → Trigger Jordan's reading
        console.log('🚀 Starting Jordan\'s manuscript reading...')

        fetch(WEBHOOKS.jordanFullAnalysis, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manuscriptId: manuscript.id,
            userId: manuscript.author_id
          })
        }).catch(() => console.log('✅ Jordan reading triggered'))
      }

      // 3. Transition to next phase
      const transitioned = await transitionToNextPhase(
        supabase,
        manuscript.id,
        activePhase.phase_number as PhaseNumber
      )

      if (!transitioned) {
        throw new Error('Failed to transition phases')
      }

      // 4. Add farewell message
      await addChatMessage(
        editorName,
        getPhaseCompletionMessage(activePhase.phase_number, chapters.length)
      )

      // 5. Show "Meet [Next Editor]" button
      setShowMeetNextEditorButton(true)

    } catch (error) {
      console.error('Error completing phase:', error)
      await addChatMessage(editorName, '✅ All chapters approved! There was an issue with the transition, but your work is safe.')
    }
  }

  // Navigate to phase transition
  function handleMeetNextEditor() {
    router.push(`/phase-transition?manuscriptId=${manuscript?.id}&fromPhase=${activePhase?.phase_number}&toPhase=${(activePhase?.phase_number || 0) + 1}`)
  }


  function getPhaseCompletionMessage(phaseNumber: number, chapterCount: number): string {
    const firstName = authorFirstName || 'there'

    if (phaseNumber === 1) {
      return `🎉 **Incredible work, ${firstName}!**\n\n` +
        `You've successfully approved all ${chapterCount} chapters. Your story structure is solid, ` +
        `your character arcs are clear, and the pacing flows beautifully.\n\n` +
        `**What happens next?**\n` +
        `You're ready for **Phase 2: Line Editing with Sam**. Sam will work at the sentence level, ` +
        `polishing your prose and making sure every word sings.\n\n` +
        `Click the **"Meet Sam"** button above when you're ready for the handoff! 👋\n\n` +
        `*Your approved manuscript will be generated and emailed to you for safekeeping.*\n\n` +
        `*— Alex, Your Developmental Editor* 👔`
    } else if (phaseNumber === 2) {
      return `✨ **Beautiful work, ${firstName}!**\n\n` +
        `You've successfully approved all ${chapterCount} chapters. Your prose is polished and every ` +
        `sentence now sings with clarity and impact.\n\n` +
        `**What happens next?**\n` +
        `You're ready for **Phase 3: Copy Editing with Jordan**. Jordan will ensure every technical ` +
        `detail is perfect—grammar, punctuation, consistency, and professional polish.\n\n` +
        `Click the **"Meet Jordan"** button above when you're ready for the handoff! 👋\n\n` +
        `*Your line-edited manuscript will be generated and emailed to you for safekeeping.*\n\n` +
        `*— Sam, Your Line Editor* ✨`
    } else if (phaseNumber === 3) {
      return `🔍 **Excellent work, ${firstName}!**\n\n` +
        `You've successfully completed all three editing phases! Your manuscript is now:\n` +
        `- Structurally sound (Alex)\n` +
        `- Beautifully written (Sam)\n` +
        `- Technically flawless (Jordan)\n\n` +
        `**🎉 You're Ready!**\n` +
        `Click the **"View Completion Summary"** button above to see everything you've accomplished ` +
        `and download your manuscript versions!\n\n` +
        `*— Jordan, Your Copy Editor* 🔍`
    }

    // Default fallback
    return `🎉 **Great work, ${firstName}!**\n\n` +
      `You've completed this editing phase. Click the button above to meet your next editor!`
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
      `📖 Let me get my notes on "${chapterLabel}". This will just take a moment...`
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
      const analysisWebhook =
        activePhase.phase_number === 2 ? WEBHOOKS.samChapterAnalysis :
          activePhase.phase_number === 3 ? WEBHOOKS.jordanChapterAnalysis :
            WEBHOOKS.alexChapterAnalysis

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

      // Load issues and get the actual count
      const supabase = createClient()
      const { data: issues } = await supabase
        .from('manuscript_issues')
        .select('*')
        .eq('manuscript_id', manuscript!.id)
        .eq('chapter_number', chapterNumber)
        .eq('phase_number', activePhase!.phase_number)
        .neq('status', 'dismissed')

      const issueCount = issues?.length || 0

      console.log(`Polling attempt ${attempts}: Found ${issueCount} issues`)

      // Stop polling if we found issues OR reached max attempts
      if (issueCount > 0 || attempts >= maxAttempts) {
        clearInterval(pollInterval)

        // Update the chapter editing status
        setChapterEditingStatus(prev => ({
          ...prev,
          [chapterNumber]: 'ready'
        }))

        // Reload the issues into state
        await loadChapterIssues(chapterNumber)

        // Add chat message
        if (issueCount > 0) {
          await addChatMessage(
            editorName,
            `✅ I've got some thoughts on this chapter. Click the Notes Button!`
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Setting Up Your Studio</h3>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (!manuscript || !activePhase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
    <>
      {/* NEW: Fixed Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            📚 AuthorsLab.ai
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{authorFirstName || 'Author'}</span>

            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
          {/* TOP ROW: Logo and User Menu */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <Link href="/" className="text-lg font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              📚 AuthorsLab.ai
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {authorName}
              </span>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/login')
                }}
                className="text-sm px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: Manuscript Info (YOUR EXISTING CONTENT) */}
          <div className="flex items-center justify-between">
            {/* Left: Manuscript Title */}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${getEditorColorClasses(editorColor).bg} text-white flex items-center justify-center`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{manuscript.title}</h1>
                <p className={`text-sm ${getEditorColorClasses(editorColor).text} font-medium`}>
                  Phase {currentPhase}: {EDITOR_CONFIG[currentPhase as PhaseNumber].phaseName} with {editorName}
                </p>
              </div>
            </div>

            {/* Right: Editor Progress & Report Buttons */}
            <div className="flex items-center gap-6">

              {/* Editor Progress Indicators */}
              <div className="flex items-center gap-3">
                {/* Alex (Phase 1) */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentPhase > 1
                  ? 'bg-green-600 text-white'
                  : currentPhase === 1
                    ? 'bg-green-600 text-white ring-2 ring-green-300'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                  A
                </div>

                {/* Sam (Phase 2) */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentPhase > 2
                  ? 'bg-purple-600 text-white'
                  : currentPhase === 2
                    ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                  S
                </div>

                {/* Jordan (Phase 3) */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${currentPhase > 3
                  ? 'bg-blue-600 text-white'
                  : currentPhase === 3
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                  J
                </div>
              </div>

              {/* PDF Report Buttons - Always Visible */}
              <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                {/* Alex's Report Button */}
                {(() => {
                  const alexPhase = editorPhases.find(p => p.phase_number === 1)
                  const hasReport = alexPhase?.report_pdf_url
                  const isReading = alexPhase?.phase_status === 'active' && !alexPhase?.ai_read_completed_at
                  const phaseStarted = alexPhase?.phase_status !== 'pending'

                  if (!phaseStarted) {
                    // Phase not started yet
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-400 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>Alex Report</span>
                      </button>
                    )
                  } else if (isReading) {
                    // Alex is reading (PDF generating)
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-green-100 text-green-600 text-xs rounded-lg cursor-wait flex items-center gap-1.5"
                      >
                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </button>
                    )
                  } else if (hasReport) {
                    // Report is ready
                    return (
                      <button
                        onClick={() => {
                          if (alexPhase?.report_pdf_url) {
                            window.open(alexPhase.report_pdf_url, '_blank')
                          }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>📄</span>
                        <span>Alex Report</span>
                      </button>
                    )
                  } else {
                    // Phase complete but no report (error state)
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>⚠️</span>
                        <span>No Report</span>
                      </button>
                    )
                  }
                })()}

                {/* Sam's Report Button */}
                {(() => {
                  const samPhase = editorPhases.find(p => p.phase_number === 2)
                  const hasReport = samPhase?.report_pdf_url
                  const isReading = samPhase?.phase_status === 'active' && !samPhase?.ai_read_completed_at
                  const phaseStarted = samPhase?.phase_status !== 'pending'

                  if (!phaseStarted) {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-400 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>Sam Report</span>
                      </button>
                    )
                  } else if (isReading) {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-purple-100 text-purple-600 text-xs rounded-lg cursor-wait flex items-center gap-1.5"
                      >
                        <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </button>
                    )
                  } else if (hasReport) {
                    return (
                      <button
                        onClick={() => {
                          if (samPhase?.report_pdf_url) {
                            window.open(samPhase.report_pdf_url, '_blank')
                          }
                        }}
                        className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>📄</span>
                        <span>Sam Report</span>
                      </button>
                    )
                  } else {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>⚠️</span>
                        <span>No Report</span>
                      </button>
                    )
                  }
                })()}

                {/* Jordan's Report Button */}
                {(() => {
                  const jordanPhase = editorPhases.find(p => p.phase_number === 3)
                  const hasReport = jordanPhase?.report_pdf_url
                  const isReading = jordanPhase?.phase_status === 'active' && !jordanPhase?.ai_read_completed_at
                  const phaseStarted = jordanPhase?.phase_status !== 'pending'

                  if (!phaseStarted) {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-400 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>📄</span>
                        <span>Jordan Report</span>
                      </button>
                    )
                  } else if (isReading) {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-blue-100 text-blue-600 text-xs rounded-lg cursor-wait flex items-center gap-1.5"
                      >
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </button>
                    )
                  } else if (hasReport) {
                    return (
                      <button
                        onClick={() => {
                          if (jordanPhase?.report_pdf_url) {
                            window.open(jordanPhase.report_pdf_url, '_blank')
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>📄</span>
                        <span>Jordan Report</span>
                      </button>
                    )
                  } else {
                    return (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-gray-200 text-gray-500 text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>⚠️</span>
                        <span>No Report</span>
                      </button>
                    )
                  }
                })()}
              </div>

              {/* NEW: Versions Dropdown */}
              <div className="border-l border-gray-200 pl-6">
                <VersionsDropdown
                  manuscriptId={manuscript.id}
                  currentPhaseNumber={currentPhase}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Chapter Navigation */}
          <div className={`${isChapterSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all`}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
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

              {/* Phase Badges */}
              {!isChapterSidebarCollapsed && currentChapter && (
                <div className="flex gap-2 mt-2">
                  {/* D - Developmental */}
                  <div className={`px-2 py-1 rounded text-xs font-bold ${currentChapter.phase_1_approved_at
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    D
                  </div>

                  {/* L - Line Editing */}
                  <div className={`px-2 py-1 rounded text-xs font-bold ${currentChapter.phase_2_approved_at
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    L
                  </div>

                  {/* C - Copy Editing */}
                  <div className={`px-2 py-1 rounded text-xs font-bold ${currentChapter.phase_3_approved_at
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    C
                  </div>
                </div>
              )}
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
                    className={`group w-full p-3 rounded-lg mb-2 text-left transition ${isLocked
                      ? 'opacity-50 cursor-not-allowed'
                      : index === currentChapterIndex
                        ? `${getEditorColorClasses(editorColor).bgLight} border-2 ${getEditorColorClasses(editorColor).border}`
                        : `bg-white border border-gray-200 ${getEditorColorClasses(editorColor).borderLight}`
                      }`}
                  >
                    {!isChapterSidebarCollapsed ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {isApproved ? (
                            <span className={getEditorColorClasses(editorColor).text + ' text-lg'}>✓</span>
                          ) : editStatus === 'analyzing' ? (
                            <div className={`w-4 h-4 border-2 ${getEditorColorClasses(editorColor).border} border-t-transparent rounded-full animate-spin`}></div>
                          ) : editStatus === 'ready' ? (
                            <span className={getEditorColorClasses(editorColor).text + ' text-lg'}>●</span>
                          ) : unsavedChapters.has(chapter.chapter_number) ? (
                            <span className="text-blue-600 text-lg">●</span>
                          ) : (
                            <span className="text-gray-300 text-lg">○</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500">
                            {chapter.chapter_number === 0 ? 'Prologue' : `Chapter ${chapter.chapter_number}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="font-semibold text-sm flex-1">{chapter.title}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditChapterTitle(chapter)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition"
                              title="Edit chapter title"
                            >
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
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
                {/* Start Editing Button - Shows when not started */}
                {(() => {
                  console.log('🔍 Start Editing button check:', {
                    currentEditingStatus,
                    analysisComplete,
                    shouldShow: currentEditingStatus === 'not_started' && analysisComplete
                  })
                  return null
                })()}
                {currentEditingStatus === 'not_started' && analysisComplete && (
                  <button
                    onClick={() => analyzeChapter(currentChapter.chapter_number)}
                    className={`px-4 py-2 ${getEditorColorClasses(editorColor).bg} text-white rounded-lg ${getEditorColorClasses(editorColor).bgHover}`}
                  >
                    Start Editing
                  </button>
                )}

                {/* Retrieving Notes Button - Shows during analysis */}
                {currentEditingStatus === 'analyzing' && (
                  <button
                    disabled
                    className={`px-4 py-2 ${getEditorColorClasses(editorColor).bg} text-white rounded-lg opacity-75 cursor-wait flex items-center gap-2`}
                  >
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Retrieving Notes...
                  </button>
                )}

                {/* Notes Button - Shows when analysis complete and issues exist */}
                {chapterIssues.length > 0 && (
                  <button
                    onClick={() => setShowIssuesPanel(!showIssuesPanel)}
                    className={`px-4 py-2 rounded-lg ${showIssuesPanel
                      ? `${getEditorColorClasses(editorColor).bg} text-white`
                      : `${getEditorColorClasses(editorColor).bgLight} ${getEditorColorClasses(editorColor).text} border ${getEditorColorClasses(editorColor).borderLight}`
                      }`}
                  >
                    Notes ({chapterIssues.length})
                  </button>
                )}

                {/* Save Button - Always visible */}
                <button
                  onClick={() => saveChanges(false)}
                  disabled={!hasUnsavedChanges}
                  className={`px-4 py-2 rounded-lg ${hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Save
                </button>

                {/* Approve Button - Shows when ready */}
                {currentEditingStatus === 'ready' && !showMeetNextEditorButton && (
                  <button
                    onClick={handleApproveChapter}
                    className={`px-4 py-2 ${getEditorColorClasses(editorColor).bg} text-white rounded-lg ${getEditorColorClasses(editorColor).bgHover}`}
                  >
                    Approve
                  </button>
                )}

                {/* Meet Next Editor Button */}
                {showMeetNextEditorButton && (
                  <>
                    {activePhase?.phase_number === 1 && (
                      // Phase 1 complete - Meet Sam (Line Editor)
                      <button
                        onClick={handleMeetNextEditor}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-bold text-base transition-all shadow-lg animate-pulse"
                      >
                        👋 Meet Sam
                      </button>
                    )}

                    {activePhase?.phase_number === 2 && (
                      // Phase 2 complete - Meet Jordan (Copy Editor)
                      <button
                        onClick={handleMeetNextEditor}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-base transition-all shadow-lg animate-pulse"
                      >
                        👋 Meet Jordan
                      </button>
                    )}

                    {activePhase?.phase_number === 3 && (
                      // Phase 3 complete - Generate version then view summary
                      <button
                        onClick={async () => {
                          // Generate Phase 3 manuscript version
                          try {
                            console.log('📦 Generating Phase 3 manuscript version...')

                            // Get author info
                            const supabase = createClient()
                            const { data: manuscriptData } = await supabase
                              .from('manuscripts')
                              .select(`
            id,
            title,
            author_id,
            author_profiles!inner (
              email,
              first_name
            )
          `)
                              .eq('id', manuscript?.id)
                              .single()

                            const authorProfile = Array.isArray(manuscriptData?.author_profiles)
                              ? manuscriptData.author_profiles[0]
                              : manuscriptData?.author_profiles

                            await fetch(
                              'https://spikeislandstudios.app.n8n.cloud/webhook/generate-manuscript-version',
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  manuscriptId: manuscript?.id,
                                  phaseNumber: 3,
                                  editorName: 'Jordan',
                                  authorEmail: authorProfile?.email,
                                  authorFirstName: authorProfile?.first_name,
                                  manuscriptTitle: manuscript?.title
                                })
                              }
                            )

                            console.log('✅ Phase 3 version generation triggered')
                          } catch (error) {
                            console.error('Version generation error:', error)
                          }

                          // Navigate to completion page
                          router.push(`/phase-complete?manuscriptId=${manuscript?.id}`)
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 text-white rounded-lg font-bold text-base transition-all shadow-lg animate-pulse hover:shadow-xl"
                      >
                        🎉 View Completion Summary
                      </button>
                    )}

                    {activePhase?.phase_number === 4 && (
                      // Phase 4 complete - Go to Marketing Hub with Quinn
                      <button
                        onClick={() => router.push(`/marketing-hub?manuscriptId=${manuscript?.id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-bold text-base transition-all shadow-lg animate-pulse"
                      >
                        🚀 Start Marketing with Quinn
                      </button>
                    )}

                    {activePhase?.phase_number === 5 && (
                      // Phase 5 complete - All done! View completion summary
                      <button
                        onClick={() => router.push(`/phase-complete?manuscriptId=${manuscript?.id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 text-white rounded-lg font-bold text-base transition-all shadow-lg animate-pulse hover:shadow-xl"
                      >
                        🎉 View Completion Summary
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Toolbar Strip - Word Count and Status */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  Words: <span className="font-semibold text-gray-900">{wordCount.toLocaleString()}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    {isSaving ? 'Saving...' : 'Unsaved changes'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div
                ref={editorPanelRef}
                contentEditable={!isLocked}
                suppressContentEditableWarning
                onInput={(e) => {
                  const newContent = e.currentTarget.textContent || '';
                  setEditorContent(newContent);
                  pendingContentRef.current = newContent;  // Store immediately
                  setHasUnsavedChanges(true);
                  setUnsavedChapters(prev => new Set(prev).add(currentChapter.chapter_number));

                  // Clear existing timer
                  if (autoSaveTimer) clearTimeout(autoSaveTimer);

                  // Set new auto-save timer (3 seconds)
                  const timer = setTimeout(() => {
                    saveChanges(true);
                  }, 3000);

                  setAutoSaveTimer(timer);
                }}
                onPaste={(e) => {
                  // Paste as plain text only (prevents formatting issues)
                  e.preventDefault();
                  const text = e.clipboardData.getData('text/plain');
                  document.execCommand('insertText', false, text);
                }}
                className={`w-full h-full min-h-[500px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${getEditorColorClasses(editorColor).ring} font-serif text-lg leading-relaxed overflow-auto whitespace-pre-wrap ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                dangerouslySetInnerHTML={{ __html: editorContent.replace(/\n/g, '<br>').replace(/  /g, ' &nbsp;') }}
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>

          {/* RIGHT: Chat Panel */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Editor Header */}
            <div className={`p-4 ${getEditorColorClasses(editorColor).bg} text-white`}>
              <h2 className="text-xl font-bold">{editorName}</h2>
              <p className="text-sm opacity-90">{EDITOR_CONFIG[currentPhase as PhaseNumber].phaseName}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Show "Read my Manuscript" button if analysis not started */}
              {!analysisComplete && !fullAnalysisInProgress && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-3xl">
                      📖
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Hi! I&apos;m {editorName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Before we begin editing, I need to read your manuscript.
                    </p>
                  </div>

                  <button
                    onClick={triggerFullAnalysis}
                    className={`w-full ${getEditorColorClasses(editorColor).bg} text-white px-6 py-4 rounded-xl font-bold text-base ${getEditorColorClasses(editorColor).bgHover} transition-all shadow-md hover:shadow-lg`}
                  >
                    📖 Read My Manuscript
                  </button>

                  <p className="text-xs text-gray-500 mt-3">
                    This takes about 5 minutes. You&apos;ll get a comprehensive report by email.
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`${msg.sender === 'Author'
                    ? 'bg-blue-50 border-blue-200 ml-8'
                    : msg.sender === 'system'
                      ? 'bg-amber-50 border-amber-300 border-dashed'
                      : `${getEditorColorClasses(editorColor).bgLight} ${getEditorColorClasses(editorColor).borderColor} mr-8`
                    } border rounded-lg p-3`}
                >
                  {/* Only show sender name if not a system message */}
                  {msg.sender !== 'system' && (
                    <div className="font-semibold text-sm mb-1">{msg.sender}</div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                </div>
              ))}

              {/* Reading Progress Indicator */}
              {fullAnalysisInProgress && (
                <div className={`${getEditorColorClasses(editorColor).bgLight} ${getEditorColorClasses(editorColor).borderColor} border rounded-lg p-4 mr-8`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-lg">
                        📖
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{editorName}</div>
                      <div className="text-xs text-gray-600">Reading your manuscript...</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">{thinkingMessage}</div>
                </div>
              )}

              {/* Thinking indicator for chat */}
              {isThinking && !fullAnalysisInProgress && (
                <div className={`${getEditorColorClasses(editorColor).bgLight} ${getEditorColorClasses(editorColor).borderColor} border rounded-lg p-3 mr-8`}>
                  <div className="font-semibold text-sm mb-1">{editorName}</div>
                  <div className="text-sm">Thinking...</div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}  // ← ADD THIS LINE
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`Ask ${editorName}...`}
                  disabled={fullAnalysisInProgress}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${getEditorColorClasses(editorColor).ring} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isThinking || fullAnalysisInProgress}
                  className={`px-4 py-2 ${getEditorColorClasses(editorColor).bg} text-white rounded-lg ${getEditorColorClasses(editorColor).bgHover} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Issues Panel Overlay */}
        {
          showIssuesPanel && (
            <div className="absolute right-96 top-20 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">Editor Notes</h3>
                  <span className="text-xs text-gray-500">
                    ({filteredIssues.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Only show Clear highlights button for Sam (Phase 2) and Jordan (Phase 3) */}
                  {(currentPhase === 2 || currentPhase === 3) && (
                    <button
                      onClick={() => {
                        // Clear all highlights
                        const existingHighlights = document.querySelectorAll('.issue-highlight');
                        existingHighlights.forEach(el => {
                          const parent = el.parentNode;
                          if (parent) {
                            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
                            parent.normalize();
                          }
                        });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Clear highlights
                    </button>
                  )}
                  <button
                    onClick={() => setShowIssuesPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-3 border-b border-gray-200 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setIssueFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm ${issueFilter === 'all'
                    ? `${getEditorColorClasses(editorColor).bg} text-white`
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  All ({chapterIssues.length})
                </button>

                {ISSUE_CATEGORIES_BY_PHASE[currentPhase as PhaseNumber].map(category => (
                  <button
                    key={category}
                    onClick={() => setIssueFilter(category)}
                    className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${issueFilter === category
                      ? `${getEditorColorClasses(editorColor).bg} text-white`
                      : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {category.replace('_', ' ')} ({chapterIssues.filter(i => i.element_type === category).length})
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 border-b border-gray-200 ${issue.status === 'in_progress' ? 'bg-yellow-50' : ''}`}
                  >
                    {/* Conditional: Only show highlighting for Sam (Phase 2) and Jordan (Phase 3) */}
                    {(currentPhase === 2 || currentPhase === 3) && issue.quoted_text ? (
                      <div
                        onClick={() => {
                          if (issue.quoted_text && editorPanelRef.current) {
                            highlightTextInEditor(
                              issue.quoted_text,
                              editorPanelRef.current  // Changed from .parentElement
                            );
                          }
                        }}
                        className="cursor-pointer hover:bg-blue-50 -m-2 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(issue.element_type)}`}>
                            {issue.element_type}
                          </span>
                          <span className={`text-xs ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs text-blue-600 font-medium ml-auto">
                            👆 Click to highlight
                          </span>
                        </div>

                        {/* Show quoted text */}
                        <div className="mb-2 p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                          <div className="text-xs text-gray-600 mb-1 font-medium">Original text:</div>
                          <div className="text-sm italic text-gray-700">
                            &quot;{issue.quoted_text}&quot;
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Non-clickable header for Alex (Phase 1) or issues without quoted_text
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(issue.element_type)}`}>
                            {issue.element_type}
                          </span>
                          <span className={`text-xs ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>

                        {/* Show quoted text if available (for Sam) but not clickable */}
                        {issue.quoted_text && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border-l-2 border-gray-400">
                            <div className="text-xs text-gray-600 mb-1 font-medium">Reference:</div>
                            <div className="text-sm italic text-gray-700">
                              &quot;{issue.quoted_text}&quot;
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Issue description - always shown */}
                    <div className="text-sm text-gray-700 mb-3">
                      <strong>Issue:</strong> {issue.issue_description}
                    </div>

                    {/* Editor suggestion - always shown */}
                    {issue.editor_suggestion && (
                      <div className="text-sm text-gray-700 mb-3 p-2 bg-green-50 rounded border-l-2 border-green-400">
                        <strong>Suggestion:</strong> {issue.editor_suggestion}
                      </div>
                    )}

                    {/* Action buttons - always shown */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDiscussIssue(issue)}
                        className={`flex-1 px-3 py-1.5 ${getEditorColorClasses(editorColor).bg} text-white rounded text-xs font-medium ${getEditorColorClasses(editorColor).bgHover}`}
                      >
                        💬 Discuss
                      </button>
                      <button
                        onClick={() => handleDismissIssue(issue)}
                        className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400"
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  </div>
                ))}

                {filteredIssues.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No notes in this category
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >
    </>
  )
}

export default function AuthorStudioPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudioContent />
    </Suspense>
  )
}