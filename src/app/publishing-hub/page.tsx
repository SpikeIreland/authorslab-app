'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TaylorPanel from '@/components/TaylorPanel'
import TaylorChatWidget from '@/components/TaylorChatWidget'
import BookPreviewPanel from '@/components/BookPreviewPanel'
import FrontMatterComponent from '@/components/FrontMatter'
import BackMatterComponent from '@/components/BackMatterSection'

// Publishing Journey Section Type
type PublishingSectionId =
  | 'cover-design'
  | 'front-matter'
  | 'back-matter'
  | 'formatting'
  | 'platforms'
  | 'marketing'
  | 'publishing-details'
  | 'pre-launch'

interface PublishingSection {
  id: PublishingSectionId
  title: string
  icon: string
  items: PublishingSectionItem[]
  isComplete: boolean
}

interface PublishingSectionItem {
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

interface CoverConcept {
  url: string
  prompt: string
}

interface PublishingProgress {
  assessment_completed: boolean
  cover_concepts?: CoverConcept[]
  selected_cover_url?: string
  publishing_plan?: string
  plan_pdf_url?: string
  front_matter?: {
    title_page?: { title?: string; subtitle?: string; author?: string; completed?: boolean }
    copyright_page?: { /* ... */ completed?: boolean }
    dedication?: { text?: string; completed?: boolean }
    acknowledgements?: { text?: string; completed?: boolean }
    epigraph?: { quote?: string; attribution?: string; completed?: boolean }
    preface?: { text?: string; completed?: boolean }
  }
  back_matter?: {  // ✅ ADD THIS
    author_bio?: {
      bio_text?: string
      author_tagline?: string
      profile_image_url?: string
      completed?: boolean
    }
    author_note?: { text?: string; completed?: boolean }
    next_book_preview?: {
      title?: string
      preview_text?: string
      completed?: boolean
    }
  }
}

interface FrontMatterData {
  title_page?: {
    completed?: boolean
  }
  copyright_page?: {
    completed?: boolean
  }
  dedication?: {
    completed?: boolean
  }
  acknowledgements?: {
    completed?: boolean
  }
  epigraph?: {
    completed?: boolean
  }
  preface?: {
    completed?: boolean
  }
}

function PublishingHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manuscriptId = searchParams.get('manuscriptId')

  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [publishingProgress, setPublishingProgress] = useState<PublishingProgress | null>(null)
  const [activeSection, setActiveSection] = useState<PublishingSectionId>('cover-design')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [authorFirstName, setAuthorFirstName] = useState('')

  // Function to reload publishing progress (called after assessment complete)
  async function loadPublishingProgress() {
    if (!manuscriptId) return

    const supabase = createClient()
    const { data: progressData } = await supabase
      .from('publishing_progress')
      .select('*')
      .eq('manuscript_id', manuscriptId)
      .single()

    if (progressData) {
      console.log('📊 Reloaded publishing progress:', progressData)
      setPublishingProgress(progressData)
    }
  }

  // Check access and load data
  useEffect(() => {
    async function checkAccess() {
      if (!manuscriptId) {
        router.push('/author-studio')
        return
      }

      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has access to Phase 4 (Publishing)
      const { hasPhaseAccess } = await import('@/lib/accessControl')
      const hasAccess = await hasPhaseAccess(user.id, 4)

      if (!hasAccess) {
        // User doesn't have access - redirect to upgrade page
        router.push(`/phase-complete?manuscriptId=${manuscriptId}`)
        return
      }

      // Check Phase 4 is active for this manuscript
      const { data: phase4 } = await supabase
        .from('editing_phases')
        .select('phase_status')
        .eq('manuscript_id', manuscriptId)
        .eq('phase_number', 4)
        .single()

      if (phase4?.phase_status !== 'active') {
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

      // Load publishing progress
      const { data: progressData } = await supabase
        .from('publishing_progress')
        .select('*')
        .eq('manuscript_id', manuscriptId)
        .single()

      if (progressData) {
        setPublishingProgress(progressData)
      }

      setHasAccess(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [manuscriptId, router])

  // Subscribe to publishing progress updates
  useEffect(() => {
    if (!manuscriptId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`publishing-progress-${manuscriptId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'publishing_progress',
          filter: `manuscript_id=eq.${manuscriptId}`
        },
        (payload) => {
          console.log('📊 Publishing progress updated:', payload.new)
          setPublishingProgress(payload.new as PublishingProgress)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [manuscriptId])

  // Add this function in PublishingHubContent component (after the other useEffects)
  async function handleCoverSelect(coverUrl: string) {
    console.log('🎨 Selecting cover:', coverUrl)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('publishing_progress')
      .update({ selected_cover_url: coverUrl })
      .eq('manuscript_id', manuscriptId)
      .select()

    if (error) {
      console.error('❌ Error selecting cover:', error)
      alert('Error selecting cover. Please try again.')
    } else {
      console.log('✅ Cover updated in database:', data)

      // Immediate state update (realtime will also update, but this is faster)
      if (data && data[0]) {
        setPublishingProgress(data[0] as PublishingProgress)
      }
    }
  }

  function isFrontMatterComplete(frontMatter: FrontMatterData | undefined): boolean {
    if (!frontMatter) return false
    return (frontMatter.title_page?.completed && frontMatter.copyright_page?.completed) || false
  }

  function isBackMatterComplete(backMatter: { author_bio?: { completed?: boolean } } | undefined): boolean {
    if (!backMatter) return false
    return backMatter.author_bio?.completed || false
  }

  // Define publishing sections based on questionnaire/progress
  const publishingSections: PublishingSection[] = [
    {
      id: 'cover-design',
      title: 'Cover Design',
      icon: '🎨',
      isComplete: !!publishingProgress?.selected_cover_url,
      items: [
        { id: 'concepts', title: 'Design Concepts', isComplete: (publishingProgress?.cover_concepts?.length || 0) > 0 },
        { id: 'final', title: 'Final Cover', isComplete: !!publishingProgress?.selected_cover_url },
      ]
    },
    {
      id: 'front-matter',
      title: 'Front Matter',
      icon: '📄',
      isComplete: isFrontMatterComplete(publishingProgress?.front_matter),
      items: [
        { id: 'title-page', title: 'Title Page', isComplete: publishingProgress?.front_matter?.title_page?.completed || false },
        { id: 'copyright', title: 'Copyright Page', isComplete: publishingProgress?.front_matter?.copyright_page?.completed || false },
        { id: 'dedication', title: 'Dedication', isComplete: publishingProgress?.front_matter?.dedication?.completed || false },
        { id: 'acknowledgements', title: 'Acknowledgements', isComplete: publishingProgress?.front_matter?.acknowledgements?.completed || false },
        { id: 'epigraph', title: 'Epigraph', isComplete: publishingProgress?.front_matter?.epigraph?.completed || false },
      ]
    },
    {
      id: 'back-matter',
      title: 'Back Matter',
      icon: '📑',
      isComplete: isBackMatterComplete(publishingProgress?.back_matter),
      items: [
        { id: 'author-bio', title: 'Author Bio', isComplete: publishingProgress?.back_matter?.author_bio?.completed || false },
        { id: 'author-note', title: 'Author Note', isComplete: publishingProgress?.back_matter?.author_note?.completed || false },
        { id: 'preview', title: 'Preview Next Book', isComplete: publishingProgress?.back_matter?.next_book_preview?.completed || false },
      ]
    },
    {
      id: 'formatting',
      title: 'Manuscript Formatting',
      icon: '📖',
      isComplete: false,
      items: [
        { id: 'interior', title: 'Interior Design', isComplete: false },
        { id: 'chapter-styling', title: 'Chapter Styling', isComplete: false },
        { id: 'print-format', title: 'Print Formatting', isComplete: false },
      ]
    },
    {
      id: 'platforms',
      title: 'Platform Preparation',
      icon: '🚀',
      isComplete: false,
      items: [
        { id: 'kdp', title: 'Amazon KDP', isComplete: false },
        { id: 'ingramspark', title: 'IngramSpark', isComplete: false },
        { id: 'd2d', title: 'Draft2Digital', isComplete: false },
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing Materials',
      icon: '📣',
      isComplete: false,
      items: [
        { id: 'description', title: 'Book Description', isComplete: false },
        { id: 'categories', title: 'Categories & Keywords', isComplete: false },
        { id: 'sample', title: 'Sample Chapter', isComplete: false },
      ]
    },
    {
      id: 'publishing-details',
      title: 'Publishing Details',
      icon: '📝',
      isComplete: false,
      items: [
        { id: 'isbn', title: 'ISBN Management', isComplete: false },
        { id: 'pricing', title: 'Pricing Strategy', isComplete: false },
        { id: 'distribution', title: 'Distribution Settings', isComplete: false },
        { id: 'copyright-info', title: 'Copyright Information', isComplete: false },
      ]
    },
    {
      id: 'pre-launch',
      title: 'Pre-Launch',
      icon: '✅',
      isComplete: false,
      items: [
        { id: 'checklist', title: 'Final Checklist', isComplete: false },
        { id: 'timeline', title: 'Launch Timeline', isComplete: false },
      ]
    },
  ]

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Publishing Hub...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess || !manuscript) {
    return null
  }

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
              {publishingProgress?.plan_pdf_url && (
                <button
                  onClick={() => window.open(publishingProgress.plan_pdf_url!, '_blank')}
                  className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>📄</span>
                  <span>Publishing Plan</span>
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

            {/* Phase Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Author Studio
              </Link>
              <Link
                href={`/publishing-hub?manuscriptId=${manuscriptId}`}
                className="text-teal-600 font-semibold border-b-2 border-teal-600"
              >
                Publishing
              </Link>
              <Link
                href="/marketing-hub"
                className="text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Marketing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Publishing Journey Navigation */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-72'} bg-white border-r border-gray-200 flex flex-col transition-all overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              {!isSidebarCollapsed && (
                <h2 className="font-bold text-gray-900 text-lg">Publishing Journey</h2>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? '→' : '←'}
              </button>
            </div>
          </div>

          {/* Publishing Sections List */}
          <div className="flex-1 overflow-y-auto">
            {publishingSections.map((section) => (
              <div key={section.id} className="border-b border-gray-100">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${activeSection === section.id
                    ? 'bg-teal-50 border-l-4 border-teal-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                >
                  <span className="text-2xl">{section.icon}</span>
                  {!isSidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${activeSection === section.id ? 'text-teal-900' : 'text-gray-900'
                          }`}>
                          {section.title}
                        </span>
                        {section.isComplete && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {section.items.filter(i => i.isComplete).length}/{section.items.length} complete
                      </div>
                    </div>
                  )}
                </button>

                {/* Sub-items (only show when section is active and sidebar is expanded) */}
                {!isSidebarCollapsed && activeSection === section.id && (
                  <div className="bg-gray-50">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className="w-full px-4 py-2 pl-14 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <span className={`text-xs ${item.isComplete ? 'text-green-500' : 'text-gray-400'}`}>
                          {item.isComplete ? '✓' : '○'}
                        </span>
                        <span className={item.isComplete ? 'text-gray-900' : 'text-gray-600'}>
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: Content Display */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-y-auto">
            {/* Book Preview Panel - Sticky at top */}
            <div className="sticky top-0 z-10 bg-gray-50">
              <BookPreviewPanel
                manuscript={manuscript}
                publishingProgress={publishingProgress}
                publishingSections={publishingSections}
              />
            </div>

            {/* Section Content */}
            <div className="px-8 pb-8">
              {renderSectionContent(activeSection, publishingProgress, manuscript, manuscriptId!, handleCoverSelect, authorFirstName)}
            </div>
          </div>
        </div>

        {/* RIGHT: Taylor Assessment or Chat (Conditional) */}
        {publishingProgress?.assessment_completed ? (
          // Show Chat if assessment is complete
          <TaylorChatWidget manuscriptId={manuscriptId!} />
        ) : (
          // Show Assessment if not complete
          <TaylorPanel manuscriptId={manuscriptId!} />
        )}
      </div>
    </div>
  )
}

// Render content for each section
function renderSectionContent(
  sectionId: PublishingSectionId,
  progress: PublishingProgress | null,
  manuscript: Manuscript,
  manuscriptId: string,
  onCoverSelect: (coverUrl: string) => Promise<void>,
  authorFirstName: string
) {
  switch (sectionId) {
    case 'cover-design':
      return (
        <CoverDesignSection
          progress={progress}
          manuscriptId={manuscriptId}
          onCoverSelect={onCoverSelect}
        />
      )

    case 'front-matter':
      return (
        <FrontMatterComponent
          manuscript={manuscript}
          publishingProgress={progress}
          manuscriptId={manuscriptId}
          authorFirstName={authorFirstName}
        />
      )

    case 'back-matter':
      return (
        <BackMatterComponent
          manuscript={manuscript}
          publishingProgress={progress}
          manuscriptId={manuscriptId}
          authorFirstName={authorFirstName}
        />
      )

    case 'formatting':
      return <FormattingSection manuscript={manuscript} />

    case 'platforms':
      return <PlatformsSection />

    case 'marketing':
      return <MarketingSection manuscript={manuscript} />

    case 'publishing-details':
      return <PublishingDetailsSection manuscript={manuscript} />

    case 'pre-launch':
      return <PreLaunchSection />

    default:
      return <div className="text-center py-12 text-gray-500">Select a section to begin</div>
  }
}

function CoverDesignSection({
  progress,
  manuscriptId,
  onCoverSelect
}: {
  progress: PublishingProgress | null
  manuscriptId: string
  onCoverSelect: (coverUrl: string) => Promise<void>
}) {
  const [isSelecting, setIsSelecting] = useState(false)

  const coverConcepts = progress?.cover_concepts || []
  const selectedCover = progress?.selected_cover_url

  async function handleSelectCover(coverUrl: string) {
    setIsSelecting(true)
    await onCoverSelect(coverUrl)
    setIsSelecting(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center text-3xl">
            🎨
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Cover Design</h2>
            <p className="text-gray-600">Create and select your professional book cover</p>
          </div>
        </div>

        {coverConcepts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Design Your Cover?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Chat with Taylor to generate four professional cover concepts for your book.
            </p>
            <div className="inline-block px-6 py-3 bg-teal-100 text-teal-700 rounded-lg font-semibold">
              💬 Say &quot;create my cover&quot; to Taylor →
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {coverConcepts.map((cover: CoverConcept, index: number) => {
                const isThisCoverSelected = selectedCover === cover.url

                return (
                  <div
                    key={index}
                    className={`relative rounded-xl overflow-hidden border-4 transition-all ${isThisCoverSelected
                      ? 'border-teal-500 shadow-2xl'
                      : 'border-gray-200 hover:border-teal-300'
                      }`}
                  >
                    <img
                      src={cover.url}
                      alt={`Cover concept ${index + 1}`}
                      className="w-full aspect-[2/3] object-cover"
                    />
                    {isThisCoverSelected && (
                      <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <span>✓</span>
                        <span>Selected</span>
                      </div>
                    )}
                    {!isThisCoverSelected && (
                      <button
                        onClick={() => handleSelectCover(cover.url)}
                        disabled={isSelecting}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSelecting ? 'Selecting...' : 'Select This Cover'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {!selectedCover && (
              <div className="text-center py-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  👆 Select your favorite cover to continue
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FrontMatterSection({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl">
            📄
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Front Matter</h2>
            <p className="text-gray-600">Title page, copyright, dedication, and more</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Title Page</h3>
                <p className="text-sm text-gray-600 mt-1">Your book&apos;s title and author name</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Copyright Page</h3>
                <p className="text-sm text-gray-600 mt-1">Legal information and copyright notice</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Dedication</h3>
                <p className="text-sm text-gray-600 mt-1">Dedicate your book to someone special</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Acknowledgements</h3>
                <p className="text-sm text-gray-600 mt-1">Thank those who helped make your book possible</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Table of Contents</h3>
                <p className="text-sm text-gray-600 mt-1">Auto-generated from your chapters</p>
              </div>
              <div className="text-green-500 text-2xl">✓</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <p className="text-teal-800 text-sm">
            💬 <strong>Tip:</strong> Ask Taylor for help creating any of these sections!
          </p>
        </div>
      </div>
    </div>
  )
}

function BackMatterSection({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl">
            📑
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Back Matter</h2>
            <p className="text-gray-600">Author bio, notes, and additional content</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Author Bio</h3>
                <p className="text-sm text-gray-600 mt-1">Tell readers about yourself</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Author Note</h3>
                <p className="text-sm text-gray-600 mt-1">Share your thoughts with readers</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Preview Next Book</h3>
                <p className="text-sm text-gray-600 mt-1">Hook readers with your next story</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormattingSection({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl">
            📖
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manuscript Formatting</h2>
            <p className="text-gray-600">Prepare your book for different platforms</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Available Formats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-semibold">Kindle/eBook</div>
                <div className="text-xs text-gray-600">MOBI format</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">📖</div>
                <div className="font-semibold">EPUB</div>
                <div className="text-xs text-gray-600">Universal eBook</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold">Print PDF</div>
                <div className="text-xs text-gray-600">6x9 or custom</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">🌐</div>
                <div className="font-semibold">Web</div>
                <div className="text-xs text-gray-600">HTML format</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <p className="text-yellow-800 font-semibold">
              ⏳ <strong>Coming Soon:</strong> One-click formatting for all major publishing platforms
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlatformsSection() {
  const platforms = [
    { name: 'Amazon KDP', icon: 'A', color: 'bg-[#ff9900]', status: 'Setup Ready' },
    { name: 'IngramSpark', icon: 'IS', color: 'bg-blue-700', status: 'Coming Soon' },
    { name: 'Draft2Digital', icon: 'D2D', color: 'bg-green-500', status: 'Coming Soon' },
    { name: 'Apple Books', icon: '🍎', color: 'bg-gray-800', status: 'Coming Soon' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-3xl">
            🚀
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Platform Preparation</h2>
            <p className="text-gray-600">Get ready to publish on major platforms</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl font-bold`}>
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{platform.name}</h3>
                  <p className="text-sm text-yellow-600 font-semibold">⏳ {platform.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <p className="text-teal-800 text-sm">
            💬 <strong>Tip:</strong> Ask Taylor for platform-specific publishing guides!
          </p>
        </div>
      </div>
    </div>
  )
}

function MarketingSection({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-3xl">
            📣
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Marketing Materials</h2>
            <p className="text-gray-600">Metadata and promotional content</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Book Description</h3>
                <p className="text-sm text-gray-600 mt-1">Compelling blurb that sells your story</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Categories & Keywords</h3>
                <p className="text-sm text-gray-600 mt-1">Help readers discover your book</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Sample Chapter Selection</h3>
                <p className="text-sm text-gray-600 mt-1">Choose which chapters readers can preview</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PublishingDetailsSection({ manuscript }: { manuscript: Manuscript }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center text-3xl">
            📝
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Publishing Details</h2>
            <p className="text-gray-600">Legal, pricing, and distribution settings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">ISBN Management</h3>
                <p className="text-sm text-gray-600 mt-1">Acquire and assign ISBNs</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Pricing Strategy</h3>
                <p className="text-sm text-gray-600 mt-1">Set competitive prices for each format</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Distribution Settings</h3>
                <p className="text-sm text-gray-600 mt-1">Wide distribution or exclusive?</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Copyright Information</h3>
                <p className="text-sm text-gray-600 mt-1">Register and protect your work</p>
              </div>
              <div className="text-gray-400 text-2xl">→</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreLaunchSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center text-3xl">
            ✅
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Pre-Launch</h2>
            <p className="text-gray-600">Final checks before publication</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-300">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Launch Checklist</h3>
            <div className="space-y-2">
              {[
                'Cover design finalized',
                'All front and back matter complete',
                'Manuscript formatted for all platforms',
                'Platform accounts set up',
                'Marketing materials ready',
                'Pricing and distribution configured',
                'ISBN assigned',
                'Copyright registered',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <input type="checkbox" className="w-5 h-5 text-pink-500 rounded" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Launch Timeline</h3>
            <p className="text-gray-600 text-sm mb-4">
              Plan your publication date and promotional activities
            </p>
            <button className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors">
              Create Launch Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function PublishingHub() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PublishingHubContent />
    </Suspense>
  )
}