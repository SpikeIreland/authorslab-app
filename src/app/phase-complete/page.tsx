'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ManuscriptVersion {
  id: string
  manuscript_id: string
  phase_number: number
  version_type: string
  word_count: number
  file_url: string | null
  created_by_editor: string
  created_at: string
}

interface Manuscript {
  id: string
  title: string
  current_phase_number: number
}

function PhaseCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manuscriptId = searchParams.get('manuscriptId')

  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [versions, setVersions] = useState<ManuscriptVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!manuscriptId) {
      router.push('/author-studio')
      return
    }

    const supabase = createClient()

    // Load manuscript
    const { data: manuscriptData, error: manuscriptError } = await supabase
      .from('manuscripts')
      .select('id, title, current_phase_number')
      .eq('id', manuscriptId)
      .single()

    if (manuscriptError || !manuscriptData) {
      console.error('Error loading manuscript:', manuscriptError)
      router.push('/author-studio')
      return
    }

    setManuscript(manuscriptData)

    // Load approved versions with PDFs only
    const { data: versionsData, error: versionsError } = await supabase
      .from('manuscript_versions')
      .select('*')
      .eq('manuscript_id', manuscriptId)
      .eq('version_type', 'approved_snapshot')
      .not('file_url', 'is', null)
      .order('phase_number', { ascending: true })

    if (!versionsError && versionsData) {
      setVersions(versionsData)
    }

    setIsLoading(false)
  }, [manuscriptId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    )
  }

  if (!manuscript) {
    return null
  }

  const getEditorName = (phaseNumber: number): string => {
    const editors = ['', 'Alex', 'Sam', 'Jordan', 'Taylor', 'Quinn']
    return editors[phaseNumber] || 'Editor'
  }

  const getEditorColor = (phaseNumber: number): string => {
    const colors = ['', 'green', 'purple', 'blue', 'teal', 'orange']
    return colors[phaseNumber] || 'gray'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <Link
              href={`/author-studio?manuscriptId=${manuscriptId}`}
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Back to Studio
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Celebration */}
        <section className="text-center mb-12">
          <div className="inline-block animate-bounce text-8xl mb-6">🎉</div>
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            You&apos;ve completed all three editing phases
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your manuscript &quot;<strong>{manuscript.title}</strong>&quot; has been professionally edited by Alex, Sam, and Jordan. 
            It&apos;s now polished, refined, and ready for the next chapter of your publishing journey.
          </p>
        </section>

        {/* Download Versions */}
        <section className="bg-white rounded-3xl p-12 mb-12 shadow-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-3 text-center">
            📖 Your Manuscript Versions
          </h2>
          <p className="text-gray-600 text-lg mb-8 text-center max-w-2xl mx-auto">
            Download your professionally edited manuscripts from each phase. Perfect for backup, sharing with beta readers, or comparing your progress.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {versions.map((version) => {
              const editorName = getEditorName(version.phase_number)
              const color = getEditorColor(version.phase_number)
              
              return (
                <div
                  key={version.id}
                  className={`border-2 border-${color}-500 bg-${color}-50 rounded-2xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Phase {version.phase_number}: {editorName}
                    </h3>
                    <div className={`w-12 h-12 bg-${color}-500 rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                      {version.phase_number}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {version.word_count.toLocaleString()} words
                  </p>
                  
                  <p className="text-gray-500 text-xs mb-6">
                    Completed: {new Date(version.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>

                  {version.file_url && (
                    <a
                      href={version.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full bg-${color}-600 text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-${color}-700 transition-all`}
                    >
                      📄 Download PDF
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Continue Editing */}
        <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 mb-12 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              ✏️ Continue Refining
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Want to make more changes? You can always return to any editor and continue working on your manuscript.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Alex */}
            <div className="bg-white rounded-2xl p-6 border-2 border-green-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                🌳
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Alex</h3>
              <p className="text-gray-600 text-sm text-center mb-6">Developmental Editor</p>
              <button
                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=1`)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                Work with Alex
              </button>
            </div>

            {/* Sam */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sam</h3>
              <p className="text-gray-600 text-sm text-center mb-6">Line Editor</p>
              <button
                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=2`)}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Work with Sam
              </button>
            </div>

            {/* Jordan */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Jordan</h3>
              <p className="text-gray-600 text-sm text-center mb-6">Copy Editor</p>
              <button
                onClick={() => router.push(`/author-studio?manuscriptId=${manuscriptId}&phase=3`)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                Work with Jordan
              </button>
            </div>
          </div>
        </section>

        {/* Upgrade Options - Publishing & Marketing */}
        <section className="bg-gradient-to-br from-teal-50 to-orange-50 rounded-3xl p-12 shadow-xl border-2 border-teal-300">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              🚀 Ready to Publish?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your manuscript is professionally edited and ready for the next phase. Choose how you want to bring your book to market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Publishing Only */}
            <div className="bg-white rounded-2xl p-8 border-2 border-teal-500 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 4: Publishing</h3>
              <div className="text-4xl font-bold text-teal-600 mb-4">$299</div>
              <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>AI cover design (3 options)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>Multi-format conversion (Kindle, EPUB, Print)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>Platform setup guides (KDP, IngramSpark)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>Metadata optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>ISBN assignment</span>
                </li>
              </ul>
              <button 
                onClick={() => {
                  const stripeUrl = `https://buy.stripe.com/aFa14g1fycWtgX00NS1wY08?client_reference_id=${manuscriptId}`
                  window.location.href = stripeUrl
                }}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all"
              >
                Get Publishing Package
              </button>
            </div>

            {/* Bundle - Recommended */}
            <div className="bg-white rounded-2xl p-8 border-4 border-orange-500 hover:shadow-2xl transition-all transform md:scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <div className="text-4xl mb-4 mt-4">🎁</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Package</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-4xl font-bold text-orange-600">$449</div>
                <div className="text-gray-500 text-sm line-through">$498</div>
              </div>
              <p className="text-green-600 font-semibold mb-4">Save $49!</p>
              <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span><strong>Everything in Publishing</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Marketing strategy with Quinn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Social media campaign plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Email marketing templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Launch timeline & checklist</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Author platform guidance</span>
                </li>
              </ul>
              <button 
                onClick={() => {
                  const stripeUrl = `https://buy.stripe.com/3cI8wI5vOg8FeOS0NS1wY09?client_reference_id=${manuscriptId}`
                  window.location.href = stripeUrl
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Get Complete Package
              </button>
            </div>

            {/* Marketing Only */}
            <div className="bg-white rounded-2xl p-8 border-2 border-orange-500 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Phase 5: Marketing</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">$199</div>
              <ul className="space-y-3 mb-6 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Marketing strategy consultation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Social media content calendar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Email campaign templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Launch timeline creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">✓</span>
                  <span>Target audience identification</span>
                </li>
              </ul>
              <button 
                onClick={() => {
                  const stripeUrl = `https://buy.stripe.com/cNi14g9M4bSp5eicwA1wY0a?client_reference_id=${manuscriptId}`
                  window.location.href = stripeUrl
                }}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
              >
                Get Marketing Package
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Not ready yet? You can always purchase these later from your dashboard.
          </p>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-green-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
          >
            Return to Dashboard
          </Link>
        </section>
      </main>
    </div>
  )
}

export default function PhaseCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PhaseCompleteContent />
    </Suspense>
  )
}