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

  const [isLoading, setIsLoading] = useState(true)
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [marketingProgress, setMarketingProgress] = useState<MarketingProgress | null>(null)
  const [activeSection, setActiveSection] = useState<MarketingSectionId>('blurb')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [authorFirstName, setAuthorFirstName] = useState('')

  // ✅ NEW: Preview mode state
  const [isPreviewMode, setIsPreviewMode] = useState(true)

  // Check access and load data
  useEffect(() => {
    async function checkAccess() {
      if (!manuscriptId) {
        // No manuscript - show generic preview
        setIsLoading(false)
        setIsPreviewMode(true)
        return
      }

      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Not logged in - show preview mode
        setIsLoading(false)
        setIsPreviewMode(true)
        return
      }

      // ✅ Check if admin or beta tester (full access)
      const { data: profile } = await supabase
        .from('author_profiles')
        .select('role, is_beta_tester, first_name')
        .eq('user_id', user.id)
        .single()

      const hasFullAccess = profile?.role === 'admin' || profile?.is_beta_tester === true
      setAuthorFirstName(profile?.first_name || '')

      // Check Phase 5 status
      const { data: phase5 } = await supabase
        .from('editing_phases')
        .select('phase_status')
        .eq('manuscript_id', manuscriptId)
        .eq('phase_number', 5)
        .maybeSingle()

      const phaseActive = phase5?.phase_status === 'active'

      // ✅ Set preview mode based on access
      setIsPreviewMode(!phaseActive && !hasFullAccess)

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
        if (!authorFirstName) {
          setAuthorFirstName(authorProfile?.first_name || '')
        }
      }

      // Load marketing progress (if table exists)
      try {
        const { data: progressData } = await supabase
          .from('marketing_progress')
          .select('*')
          .eq('manuscript_id', manuscriptId)
          .maybeSingle()

        if (progressData) {
          setMarketingProgress(progressData)
        }
      } catch (error) {
        // Table may not exist yet - that's ok
        console.log('Marketing progress table not available yet')
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [manuscriptId, router])

  // Subscribe to marketing progress updates
  useEffect(() => {
    if (!manuscriptId || isPreviewMode) return

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
  }, [manuscriptId, isPreviewMode])

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
      description: 'Optimize discoverability',
      isComplete: marketingProgress?.keywords_completed || false,
      items: [
        { id: 'keywords', title: 'Amazon Keywords (7)', isComplete: !!marketingProgress?.keywords?.length },
        { id: 'categories', title: 'BISAC Categories', isComplete: !!marketingProgress?.categories?.length },
      ]
    },
    {
      id: 'audience',
      title: 'Target Audience',
      icon: '🎯',
      description: 'Define your ideal readers',
      isComplete: marketingProgress?.author_bio_completed || false,
      items: [
        { id: 'reader-profile', title: 'Reader Profile', isComplete: false },
        { id: 'comp-titles', title: 'Comparable Titles', isComplete: false },
        { id: 'author-bio', title: 'Author Bio', isComplete: !!marketingProgress?.author_bio_short },
      ]
    },
    {
      id: 'social-media',
      title: 'Social Media',
      icon: '📱',
      description: 'Content for all platforms',
      isComplete: marketingProgress?.social_completed || false,
      items: [
        { id: 'posts', title: 'Post Templates', isComplete: !!marketingProgress?.social_media_posts },
        { id: 'calendar', title: 'Content Calendar', isComplete: !!marketingProgress?.content_calendar },
        { id: 'graphics', title: 'Graphics Kit', isComplete: false },
      ]
    },
    {
      id: 'launch-plan',
      title: 'Launch Strategy',
      icon: '🚀',
      description: 'Your path to launch day',
      isComplete: marketingProgress?.launch_completed || false,
      items: [
        { id: 'timeline', title: 'Launch Timeline', isComplete: !!marketingProgress?.launch_timeline },
        { id: 'checklist', title: 'Launch Checklist', isComplete: !!marketingProgress?.launch_checklist },
        { id: 'email', title: 'Email Sequences', isComplete: false },
      ]
    },
    {
      id: 'resources',
      title: 'Marketing Resources',
      icon: '📚',
      description: 'Tools and templates',
      isComplete: false,
      items: [
        { id: 'press-kit', title: 'Press Kit', isComplete: false },
        { id: 'media-assets', title: 'Media Assets', isComplete: false },
        { id: 'promo-plan', title: 'Promo Strategy', isComplete: false },
      ]
    },
  ]

  const currentSection = marketingSections.find(s => s.id === activeSection)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Marketing Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ✅ Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xl">🔮</span>
            <span className="font-semibold">Preview Mode</span>
            <span className="text-orange-100 hidden sm:inline">—</span>
            <span className="hidden sm:inline">Complete Phase 4 (Publishing) to unlock Marketing with Quinn</span>
            {manuscriptId && (
              <Link
                href={`/publishing-hub?manuscriptId=${manuscriptId}`}
                className="ml-4 px-4 py-1 bg-white text-orange-600 rounded-full text-sm font-bold hover:bg-orange-50 transition-colors"
              >
                Return to Publishing →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <div className="flex items-center gap-4">
              {/* Sales Demo Link */}
              <Link
                href={manuscriptId ? `/marketing-hub-demo?manuscriptId=${manuscriptId}` : '/marketing-hub-demo'}
                className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <span>🎬</span>
                <span>View Sales Demo</span>
              </Link>

              {marketingProgress?.plan_pdf_url && !isPreviewMode && (
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {manuscript?.title || 'Marketing Hub'}
                  {isPreviewMode && <span className="text-sm font-normal text-orange-500 ml-2">(Preview)</span>}
                </h1>
                {manuscript && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{manuscript.genre}</span>
                    <span className="text-gray-400">•</span>
                    <span>{manuscript.current_word_count.toLocaleString()} words</span>
                    <span className="text-gray-400">•</span>
                    <span>{manuscript.total_chapters} chapters</span>
                  </div>
                )}
              </div>
            </div>

            {/* Phase Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href={manuscriptId ? `/author-studio?manuscriptId=${manuscriptId}&phase=3` : '/author-studio'}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Author Studio
              </Link>
              <Link
                href={manuscriptId ? `/publishing-hub?manuscriptId=${manuscriptId}` : '/publishing-hub'}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Publishing
              </Link>
              <Link
                href={manuscriptId ? `/marketing-hub?manuscriptId=${manuscriptId}` : '/marketing-hub'}
                className="text-orange-600 font-semibold border-b-2 border-orange-600"
              >
                Marketing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className={`flex-1 flex overflow-hidden ${isPreviewMode ? 'opacity-90' : ''}`}>
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
                onClick={() => !isPreviewMode && setActiveSection(section.id)}
                disabled={isPreviewMode}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${activeSection === section.id
                  ? 'bg-orange-50 border-l-4 border-orange-500'
                  : 'hover:bg-gray-50'
                  } ${isPreviewMode ? 'cursor-default' : 'cursor-pointer'}`}
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
                  <p className="text-xs text-gray-600">
                    {isPreviewMode ? 'Available after Publishing' : 'Ready to strategize'}
                  </p>
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

          {/* Content Area */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-200">
            {isPreviewMode ? (
              // ✅ Preview Mode Content
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                  🔒
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Marketing Hub Preview
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Complete your publishing journey with Taylor to unlock the Marketing Hub.
                  Quinn will then help you create compelling marketing materials and launch your book successfully.
                </p>

                {/* What's included preview */}
                <div className="max-w-lg mx-auto text-left bg-orange-50 rounded-xl p-6 mb-6">
                  <p className="text-sm font-semibold text-orange-800 mb-3">What you&apos;ll get with Quinn:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">📝</span> Professional book descriptions & blurbs
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">🔍</span> Optimized keywords & categories
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">📱</span> Ready-to-post social media content
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">🚀</span> Complete launch strategy & timeline
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">✉️</span> Email campaign templates
                    </li>
                  </ul>
                </div>

                {manuscriptId && (
                  <Link
                    href={`/publishing-hub?manuscriptId=${manuscriptId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
                  >
                    <span>📚</span>
                    <span>Continue with Publishing</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            ) : (
              // Active Mode - Placeholder Content
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
            )}
          </div>

          {/* Assessment CTA (if not completed and not in preview mode) */}
          {!isPreviewMode && !marketingProgress?.assessment_completed && (
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

        {/* RIGHT: Quinn Chat Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🚀
              </div>
              <div className="text-white">
                <h3 className="font-bold">Quinn</h3>
                <p className="text-sm text-orange-100">
                  {isPreviewMode ? 'Available after Publishing' : 'The Creative Strategist'}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            {isPreviewMode ? (
              // Preview Mode Chat
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">
                  🔒
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Quinn is Waiting</h4>
                <p className="text-gray-600 text-sm mb-6 max-w-xs">
                  Complete your publishing setup with Taylor, then Quinn will be ready to help with marketing.
                </p>
                {manuscriptId && (
                  <Link
                    href={`/publishing-hub?manuscriptId=${manuscriptId}`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                  >
                    Continue Publishing →
                  </Link>
                )}
              </>
            ) : (
              // Active Mode Chat Placeholder
              <>
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
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isPreviewMode ? "Unlock to chat with Quinn..." : "Ask Quinn about marketing..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                disabled={isPreviewMode}
              />
              <button
                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPreviewMode}
              >
                Send
              </button>
            </div>
            {isPreviewMode && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Complete Publishing to unlock Quinn
              </p>
            )}
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