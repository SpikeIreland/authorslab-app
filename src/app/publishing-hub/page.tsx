'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TaylorChatWidget from '@/components/TaylorChatWidget'
import CoverDesignerPanel from '@/components/CoverDesignerPanel'

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

  const [showCoverDesigner, setShowCoverDesigner] = useState(false)

  useEffect(() => {
    async function checkProgress() {
      if (!manuscriptId) return

      const supabase = createClient()
      const { data } = await supabase
        .from('publishing_progress')
        .select('current_step, completed_steps')
        .eq('manuscript_id', manuscriptId)
        .single()

      if (data) {
        // Show cover designer if on cover-design step or if already completed
        const show =
          data.current_step === 'cover-design' ||
          data.completed_steps?.includes('cover-design')

        setShowCoverDesigner(show)
      }
    }

    checkProgress()
  }, [manuscriptId])

  // In the JSX, add the panel
  {
    {
      showCoverDesigner && manuscriptId && (
        <section className="mb-8">
          <CoverDesignerPanel manuscriptId={manuscriptId} />
        </section>
      )
    }
  }

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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-4">Publishing Hub</h1>
            <p className="text-xl opacity-95 mb-8">
              Transform your polished manuscript into a professionally published book across multiple platforms
            </p>
            <div className="inline-flex items-center gap-3 bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-full font-semibold">
              📖 Ready for Publishing Phase
            </div>

            {/* View Plan Button */}
            {publishingPlan?.assessment_completed && publishingPlan?.plan_pdf_url && (
              <div className="mt-8">
                <a
                  href={publishingPlan.plan_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <span className="text-2xl">📄</span>
                  <span>View Your Publishing Plan</span>
                </a>
              </div>
            )}
          </div>
        </section>

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
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Coming Soon
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Preview
                </button>
              </div>
            </div>

            {/* Formatting */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-500 hover:border-green-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                📖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Formatting</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Automatically format your manuscript for Kindle, print, EPUB, and other formats.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Coming Soon
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Preview
                </button>
              </div>
            </div>

            {/* Platform Publisher */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-500 hover:border-red-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Platform Publisher</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Direct integration with Amazon KDP, IngramSpark, and other platforms.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Coming Soon
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Guide
                </button>
              </div>
            </div>

            {/* Metadata Manager */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-yellow-500 hover:border-yellow-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Metadata Manager</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Optimize your book&apos;s title, description, keywords, and categories.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Coming Soon
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Tips
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Publishing Platforms */}
        <section className="bg-white rounded-3xl p-12 mb-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Publishing Platforms</h2>
          <p className="text-gray-600 text-lg mb-8">Connect to major publishing platforms and manage your book distribution from one place.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Amazon KDP */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-[#ff9900] rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                A
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Amazon KDP</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Coming Soon</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Setup Guide
              </button>
            </div>

            {/* IngramSpark */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-700 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                IS
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IngramSpark</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Coming Soon</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Setup Guide
              </button>
            </div>

            {/* Draft2Digital */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                D2D
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Draft2Digital</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Coming Soon</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Setup Guide
              </button>
            </div>

            {/* Lulu */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                LU
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lulu Publishing</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Coming Soon</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Setup Guide
              </button>
            </div>
          </div>
        </section>

        {/* Welcome Message */}
        <section className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-12 shadow-xl border-2 border-teal-300">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Publishing Journey!
            </h2>
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              You&apos;ve completed the editing process and your manuscript is ready to share with the world. Taylor, your publishing specialist, will guide you through every step of the publishing process.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Click the chat icon in the bottom right corner to start your personalized assessment, or explore the publishing tools and platforms above. Publishing tools are currently in development and will be available soon!
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
        </section>
      </main>

      {/* Taylor Chat Widget */}
      {manuscriptId && <TaylorChatWidget manuscriptId={manuscriptId} />}
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