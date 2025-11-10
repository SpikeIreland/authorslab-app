'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import TaylorChatWidget from '@/components/TaylorChatWidget'

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
        setPublishingPlan(data)
      }
    }

    loadPublishingPlan()
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
              <Link href="/author-studio" className="text-gray-700 hover:text-blue-900 font-medium">
                Writing Studio
              </Link>
              <Link href="/publishing-hub" className="text-blue-900 font-semibold border-b-2 border-blue-900">
                Publishing
              </Link>
              <Link href="/marketing-hub" className="text-gray-700 hover:text-blue-900 font-medium">
                Marketing
              </Link>
            </nav>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
              JS
            </div>
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

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-3xl mb-4">
              📚
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Platform Strategy</h3>
            <p className="text-gray-600">
              Choose the right publishing platforms based on your goals, whether wide distribution or Amazon exclusivity.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-3xl mb-4">
              🎨
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Professional Assets</h3>
            <p className="text-gray-600">
              Create eye-catching covers, optimize metadata, and format files perfectly for every platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-3xl mb-4">
              🚀
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Launch Support</h3>
            <p className="text-gray-600">
              Step-by-step guidance through account setup, file uploads, pricing strategy, and launch day.
            </p>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="bg-white rounded-2xl p-12 shadow-lg">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Publishing Journey Starts Here
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              You&apos;ve unlocked Phase 4 with Taylor, your publishing specialist.
              Publishing tools are currently in development and will be available soon.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              In the meantime, you can continue refining your manuscript in the Author Studio
              or explore our marketing hub if you&apos;ve also purchased Phase 5.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href={`/author-studio?manuscriptId=${manuscriptId}`}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all"
              >
                Return to Author Studio
              </Link>
              <Link
                href="/dashboard"
                className="bg-white text-teal-600 border-2 border-teal-600 px-8 py-3 rounded-xl font-bold hover:bg-teal-50 transition-all"
              >
                Go to Dashboard
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