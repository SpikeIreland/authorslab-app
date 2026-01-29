'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Marketing Journey Section Type
type MarketingSectionId =
  | 'blurb'
  | 'keywords'
  | 'audience'
  | 'social-media'
  | 'launch-plan'
  | 'resources'

interface MarketingSection {
  id: MarketingSectionId
  title: string
  icon: string
  description: string
  items: MarketingSectionItem[]
  isComplete: boolean
}

interface MarketingSectionItem {
  id: string
  title: string
  isComplete: boolean
}

interface Manuscript {
  id: string
  title: string
  genre: string
  current_word_count: number
  total_chapters: number
}

interface MarketingProgress {
  assessment_completed: boolean
  assessment_answers?: {
    primary_goal?: string
    target_reader?: string
    launch_timeline?: string
    platforms?: string[]
    marketing_budget?: string
    existing_audience?: string
  }

  // Blurb
  blurb_short?: string
  blurb_long?: string
  blurb_tagline?: string
  blurb_completed: boolean

  // Keywords
  keywords?: Array<{ keyword: string; category: string; rationale: string }>
  categories?: string[]
  keywords_completed: boolean

  // Author Platform
  author_bio_short?: string
  author_bio_long?: string
  author_bio_completed: boolean

  // Social Media
  social_media_posts?: Record<string, string[]>
  content_calendar?: Array<{ date: string; platform: string; content: string }>
  social_completed: boolean

  // Launch Strategy
  launch_timeline?: Array<{ milestone: string; date: string; tasks: string[] }>
  launch_checklist?: Array<{ task: string; completed: boolean }>
  launch_date?: string
  launch_completed: boolean

  // Overall
  marketing_plan?: string
  plan_pdf_url?: string
  current_step?: string
  completed_steps?: string[]
}

function MarketingHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manuscriptId = searchParams.get('manuscriptId')

  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [marketingProgress, setMarketingProgress] = useState<MarketingProgress | null>(null)
  const [activeSection, setActiveSection] = useState<MarketingSectionId>('blurb')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [authorFirstName, setAuthorFirstName] = useState('')

  // Check access and load data
  useEffect(() => {
    async function checkAccess() {
      if (!manuscriptId) {
        console.log('❌ No manuscriptId - redirecting to author-studio')
        router.push('/author-studio')
        return
      }

      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('❌ No user - redirecting to login')
        router.push('/login')
        return
      }

      // Check if user has access to Phase 5 (Marketing)
      const { hasPhaseAccess } = await import('@/lib/accessControl')
      const hasAccess = await hasPhaseAccess(user.id, 5)

      if (!hasAccess) {
        console.log('❌ No Phase 5 access - redirecting to phase-complete')
        router.push(`/phase-complete?manuscriptId=${manuscriptId}`)
        return
      }

      // Check Phase 5 is active for this manuscript
      const { data: phase5 } = await supabase
        .from('editing_phases')
        .select('phase_status')
        .eq('manuscript_id', manuscriptId)
        .eq('phase_number', 5)
        .single()

      if (phase5?.phase_status !== 'active') {
        console.log('❌ Phase 5 not active - redirecting to phase-complete')
        router.push(`/phase-complete?manuscriptId=${manuscriptId}`)
        return
      }

      // Load manuscript
      const { data: manuscriptData } = await supabase
        .from('manuscripts')
        .select('id, title, genre, current_word_count, total_chapters, author_profiles!inner(first_name)')
        .eq('id', manuscriptId)
        .single()

      if (manuscriptData) {
        setManuscript(manuscriptData)
        const authorProfile = Array.isArray(manuscriptData.author_profiles)
          ? manuscriptData.author_profiles[0]
          : manuscriptData.author_profiles
        setAuthorFirstName(authorProfile?.first_name || '')
      }

      // Load marketing progress (if table exists)
      const { data: progressData } = await supabase
        .from('marketing_progress')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .single()

      if (progressData) {
        setMarketingProgress(progressData)
      }

      setHasAccess(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [manuscriptId, router])

  // Subscribe to marketing progress updates
  useEffect(() => {
    if (!manuscriptId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`marketing-progress-${manuscriptId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marketing_progress',
          filter: `manuscript_id=eq.${manuscriptId}`
        },
        (payload) => {
          console.log('📊 Marketing progress updated:', payload.new)
          setMarketingProgress(payload.new as MarketingProgress)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [manuscriptId])

  // Define marketing sections
  const marketingSections: MarketingSection[] = [
    {
      id: 'blurb',
      title: 'Book Description',
      icon: '📝',
      description: 'Compelling blurbs that sell your story',
      isComplete: marketingProgress?.blurb_completed || false,
      items: [
        { id: 'tagline', title: 'Tagline', isComplete: !!marketingProgress?.blurb_tagline },
        { id: 'short-blurb', title: 'Short Blurb (~150 words)', isComplete: !!marketingProgress?.blurb_short },
        { id: 'long-blurb', title: 'Long Blurb (~300 words)', isComplete: !!marketingProgress?.blurb_long },
      ]
    },
    {
      id: 'keywords',
      title: 'Keywords & Categories',
      icon: '🔍',
      description: 'Help readers discover your book',
      isComplete: marketingProgress?.keywords_completed || false,
      items: [
        { id: 'amazon-keywords', title: 'Amazon Keywords (7)', isComplete: (marketingProgress?.keywords?.length || 0) >= 7 },
        { id: 'categories', title: 'BISAC Categories', isComplete: (marketingProgress?.categories?.length || 0) > 0 },
      ]
    },
    {
      id: 'audience',
      title: 'Target Audience',
      icon: '🎯',
      description: 'Define your ideal reader',
      isComplete: !!marketingProgress?.assessment_answers?.target_reader,
      items: [
        { id: 'reader-profile', title: 'Reader Profile', isComplete: !!marketingProgress?.assessment_answers?.target_reader },
        { id: 'comp-titles', title: 'Comp Titles', isComplete: false },
      ]
    },
    {
      id: 'social-media',
      title: 'Social Media Content',
      icon: '📱',
      description: 'Ready-to-post content for all platforms',
      isComplete: marketingProgress?.social_completed || false,
      items: [
        { id: 'twitter', title: 'Twitter/X Posts', isComplete: false },
        { id: 'instagram', title: 'Instagram Captions', isComplete: false },
        { id: 'facebook', title: 'Facebook Posts', isComplete: false },
        { id: 'calendar', title: 'Content Calendar', isComplete: false },
      ]
    },
    {
      id: 'launch-plan',
      title: 'Launch Strategy',
      icon: '🚀',
      description: 'Your roadmap to a successful launch',
      isComplete: marketingProgress?.launch_completed || false,
      items: [
        { id: 'timeline', title: 'Launch Timeline', isComplete: false },
        { id: 'pre-launch', title: 'Pre-Launch Checklist', isComplete: false },
        { id: 'launch-week', title: 'Launch Week Plan', isComplete: false },
        { id: 'post-launch', title: 'Post-Launch Strategy', isComplete: false },
      ]
    },
    {
      id: 'resources',
      title: 'Marketing Resources',
      icon: '📚',
      description: 'Templates and guides',
      isComplete: false,
      items: [
        { id: 'email-templates', title: 'Email Templates', isComplete: false },
        { id: 'review-requests', title: 'Review Request Templates', isComplete: false },
        { id: 'media-kit', title: 'Author Media Kit', isComplete: false },
      ]
    },
  ]

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Marketing Hub...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess || !manuscript) {
    return null
  }

  // Get current section data
  const currentSection = marketingSections.find(s => s.id === activeSection)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <div className="flex items-center gap-4">
              {marketingProgress?.plan_pdf_url && (
                <button
                  onClick={() => window.open(marketingProgress.plan_pdf_url!, '_blank')}
                  className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>📄</span>
                  <span>Marketing Plan</span>
                </button>
              )}
            </div>
          </div>

          {/* Book Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{manuscript.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{manuscript.genre}</span>
                  <span className="text-gray-400">•</span>
                  <span>{manuscript.current_word_count.toLocaleString()} words</span>
                  <span className="text-gray-400">•</span>
                  <span>{manuscript.total_chapters} chapters</span>
                </div>
              </div>
            </div>

            {/* Phase Navigation - All links include manuscriptId */}
            <nav className="flex items-center gap-6">
              <Link
                href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Author Studio
              </Link>
              <Link
                href={`/publishing-hub?manuscriptId=${manuscriptId}`}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Publishing
              </Link>
              <Link
                href={`/marketing-hub?manuscriptId=${manuscriptId}`}
                className="text-orange-600 font-semibold border-b-2 border-orange-600"
              >
                Marketing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Marketing Journey Navigation */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-72'} bg-white border-r border-gray-200 flex flex-col transition-all overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              {!isSidebarCollapsed && (
                <h2 className="font-bold text-gray-900 text-lg">Marketing Journey</h2>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? '→' : '←'}
              </button>
            </div>
            {!isSidebarCollapsed && (
              <p className="text-sm text-gray-500">
                {marketingSections.filter(s => s.isComplete).length} of {marketingSections.length} complete
              </p>
            )}
          </div>

          {/* Section Navigation */}
          <nav className="flex-1 p-2">
            {marketingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${activeSection === section.id
                    ? 'bg-orange-50 border-l-4 border-orange-500'
                    : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${activeSection === section.id ? 'text-orange-700' : 'text-gray-700'
                          }`}>
                          {section.title}
                        </span>
                        {section.isComplete && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Quinn Status */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl">
                  🚀
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Quinn</p>
                  <p className="text-xs text-gray-600">Ready to strategize</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER: Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Section Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">{currentSection?.icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{currentSection?.title}</h2>
                <p className="text-gray-600">{currentSection?.description}</p>
              </div>
            </div>
          </div>

          {/* Placeholder Content - Will be replaced with actual components */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-200">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                🏗️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {currentSection?.title} - Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                This section is being built. Quinn will help you with {currentSection?.title.toLowerCase()} once it&apos;s ready.
              </p>

              {/* Section Items Preview */}
              <div className="max-w-md mx-auto text-left">
                <p className="text-sm font-semibold text-gray-700 mb-3">What you&apos;ll be able to do:</p>
                <ul className="space-y-2">
                  {currentSection?.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-gray-600">
                      <span className="text-orange-500">→</span>
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Assessment CTA (if not completed) */}
          {!marketingProgress?.assessment_completed && (
            <div className="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                  💬
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Start with Quinn&apos;s Marketing Assessment</h3>
                  <p className="text-orange-100 mb-4">
                    Tell Quinn about your goals, target readers, and timeline. This helps create a personalized marketing strategy for your book.
                  </p>
                  <button className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors">
                    Begin Assessment →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Quinn Chat Panel (Placeholder) */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🚀
              </div>
              <div className="text-white">
                <h3 className="font-bold">Quinn</h3>
                <p className="text-sm text-orange-100">The Creative Strategist</p>
              </div>
            </div>
          </div>

          {/* Chat Placeholder */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mb-4">
              💬
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Chat with Quinn</h4>
            <p className="text-gray-600 text-sm mb-6 max-w-xs">
              Quinn will help you create compelling marketing materials and launch strategies.
            </p>

            {/* Example starter prompts */}
            <div className="space-y-2 w-full">
              <button className="w-full p-3 text-left text-sm bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                📝 &quot;Help me write a compelling book blurb&quot;
              </button>
              <button className="w-full p-3 text-left text-sm bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                🔍 &quot;What keywords should I target?&quot;
              </button>
              <button className="w-full p-3 text-left text-sm bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                🚀 &quot;Create a launch timeline for me&quot;
              </button>
            </div>
          </div>

          {/* Chat Input Placeholder */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Quinn about marketing..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled
              />
              <button
                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                disabled
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Chat functionality coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function MarketingHub() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <MarketingHubContent />
    </Suspense>
  )
}