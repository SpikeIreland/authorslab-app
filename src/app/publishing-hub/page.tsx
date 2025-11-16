'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TaylorPanel from '@/components/TaylorPanel'
import CoverDesignerPanel from '@/components/CoverDesignerPanel'
import BookBuilderPanel from '@/components/BookBuilderPanel'

interface PublishingPlan {
  publishing_plan: string | null
  assessment_completed: boolean
  plan_pdf_url: string | null
}

function PublishingHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manuscriptId = searchParams.get('manuscriptId')
  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [publishingPlan, setPublishingPlan] = useState<PublishingPlan | null>(null)
  const [showCoverDesigner, setShowCoverDesigner] = useState(false)

  // Check if user has access to Phase 4
  useEffect(() => {
    async function checkAccess() {
      if (!manuscriptId) {
        router.push('/author-studio')
        return
      }

      const supabase = createClient()
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

      setHasAccess(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [manuscriptId, router])

  // Load publishing plan and PDF URL
  useEffect(() => {
    async function loadPublishingPlan() {
      if (!manuscriptId) return

      const supabase = createClient()
      const { data } = await supabase
        .from('publishing_progress')
        .select('publishing_plan, assessment_completed, plan_pdf_url')
        .eq('manuscript_id', manuscriptId)
        .single()

      if (data) {
        console.log('📊 Loaded publishing plan:', data)
        setPublishingPlan(data)
      }
    }

    loadPublishingPlan()
  }, [manuscriptId])

  // Check if covers exist and show Cover Designer Panel
  useEffect(() => {
    async function checkProgress() {
      if (!manuscriptId) return

      console.log('🔍 Checking for covers...')

      const supabase = createClient()
      const { data, error } = await supabase
        .from('publishing_progress')
        .select('cover_concepts')
        .eq('manuscript_id', manuscriptId)
        .single()

      console.log('📊 Publishing progress query result:')
      console.log('  - Data:', data)
      console.log('  - Error:', error)
      console.log('  - cover_concepts:', data?.cover_concepts)
      console.log('  - Is Array:', Array.isArray(data?.cover_concepts))
      console.log('  - Length:', data?.cover_concepts?.length)

      if (data?.cover_concepts && Array.isArray(data.cover_concepts) && data.cover_concepts.length > 0) {
        console.log('✅ COVERS FOUND! Setting showCoverDesigner to TRUE')
        setShowCoverDesigner(true)
      } else {
        console.log('❌ No covers found, keeping showCoverDesigner FALSE')
        setShowCoverDesigner(false)
      }
    }

    checkProgress()
  }, [manuscriptId])

  // Subscribe to realtime updates for new covers
  useEffect(() => {
    if (!manuscriptId) return

    const supabase = createClient()

    console.log('🔌 Setting up publishing progress subscription for:', manuscriptId)

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
          console.log('📊 Publishing progress updated via realtime:', payload.new)

          // Check if covers were added
          if (payload.new.cover_concepts && Array.isArray(payload.new.cover_concepts) && payload.new.cover_concepts.length > 0) {
            console.log('✅ Covers detected in realtime update! Showing Cover Designer')
            setShowCoverDesigner(true)
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Publishing progress subscription status:', status)
      })

    return () => {
      console.log('🔌 Cleaning up publishing progress subscription')
      supabase.removeChannel(channel)
    }
  }, [manuscriptId])

  // Show loading while checking access
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                className="text-gray-700 hover:text-blue-900 font-medium"
              >
                Author Studio
              </Link>
              <Link href={`/publishing-hub?manuscriptId=${manuscriptId}`} className="text-blue-900 font-semibold border-b-2 border-blue-900">
                Publishing
              </Link>
              <Link href="/marketing-hub" className="text-gray-700 hover:text-blue-900 font-medium">
                Marketing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Book Builder Panel - Always at top */}
        {manuscriptId && <BookBuilderPanel manuscriptId={manuscriptId} />}

        {/* Cover Designer Panel - Shows when covers exist */}
        {showCoverDesigner && manuscriptId && (
          <section id="cover-designer-panel" className="mb-12">
            <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-purple-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl">
                  🎨
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900">Your Cover Designs</h2>
                  <p className="text-gray-600 text-lg">Select your favorite professional cover concept</p>
                </div>
              </div>
              <CoverDesignerPanel manuscriptId={manuscriptId} />
            </div>
          </section>
        )}

        {/* Publishing Tools */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Publishing Tools</h2>
          <p className="text-gray-600 text-lg mb-8">Professional tools to prepare your manuscript for publication.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cover Designer */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-500 hover:border-purple-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Cover Designer</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Generate professional book covers with AI based on your genre and themes.
              </p>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <p className="text-purple-900 text-sm font-semibold mb-2">Chat with Taylor:</p>
                <p className="text-purple-700 text-xs italic">&quot;Create some covers for my book&quot;</p>
              </div>
            </div>

            {/* File Formatting */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl transition-all opacity-60">
              <div className="w-16 h-16 bg-gray-400 rounded-xl flex items-center justify-center text-3xl mb-6">
                📄
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">File Formatting</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Convert your manuscript to EPUB, Kindle, and print-ready PDF formats.
              </p>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold">Coming Soon</p>
              </div>
            </div>

            {/* Metadata Manager */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl transition-all opacity-60">
              <div className="w-16 h-16 bg-gray-400 rounded-xl flex items-center justify-center text-3xl mb-6">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Metadata Manager</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Optimize your book title, description, keywords, and categories for discoverability.
              </p>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold">Coming Soon</p>
              </div>
            </div>

            {/* Platform Publisher */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl transition-all opacity-60">
              <div className="w-16 h-16 bg-gray-400 rounded-xl flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Platform Publisher</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Step-by-step guides for publishing to Amazon KDP, Draft2Digital, and more.
              </p>
              <div className="bg-gray-100 rounded-lg px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold">Coming Soon</p>
              </div>
            </div>
          </div>
        </section>

        {/* Publishing Plan Section */}
        {publishingPlan?.assessment_completed && publishingPlan?.plan_pdf_url && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-3xl p-12 shadow-xl border-2 border-teal-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center text-3xl">
                  📋
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Publishing Plan</h2>
                  <p className="text-gray-700 text-lg">
                    Your personalized roadmap to publishing success
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href={publishingPlan.plan_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg"
                >
                  📄 View Your Publishing Plan
                </a>
                <Link
                  href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                  className="bg-white text-teal-700 border-2 border-teal-300 px-8 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg"
                >
                  Return to Author Studio
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Welcome Section (if no plan yet) */}
        {!publishingPlan?.assessment_completed && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 shadow-xl border-2 border-blue-300">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                  Welcome to Your Publishing Hub
                </h2>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  You&apos;ve completed the editing process and your manuscript is ready to share with the world. Taylor, your publishing specialist, will guide you through every step of the publishing process.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Click the chat icon in the bottom right corner to start your personalized assessment, or explore the publishing tools above!
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    href={`/author-studio?manuscriptId=${manuscriptId}&phase=3`}
                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg"
                  >
                    Return to Author Studio
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Taylor Panel - Shows Assessment or Chat based on completion */}
      {manuscriptId && <TaylorPanel manuscriptId={manuscriptId} />}
    </div>
  )
}

export default function PublishingHubPage() {
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