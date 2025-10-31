'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Manuscript {
  id: string
  title: string
  status: string
}

function TransitionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const manuscriptId = searchParams.get('manuscriptId')

  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingPhase2, setIsStartingPhase2] = useState(false)

  const loadManuscript = useCallback(async () => {
    if (!manuscriptId) {
      router.push('/author-studio')
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('manuscripts')
      .select('*')
      .eq('id', manuscriptId)
      .single()

    if (error || !data) {
      console.error('Error loading manuscript:', error)
      router.push('/author-studio')
      return
    }

    setManuscript(data)
    setIsLoading(false)
  }, [manuscriptId, router])

  useEffect(() => {
    loadManuscript()
  }, [loadManuscript])

  async function beginPhase2() {
    if (!manuscriptId) return

    setIsStartingPhase2(true)
    const supabase = createClient()

    try {
      // Verify auth before proceeding
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Not authenticated')
        router.push('/login')
        return
      }

      // Use the new architecture: transition via editing_phases
      const { error: transitionError } = await supabase.rpc('transition_to_next_phase', {
        p_manuscript_id: manuscriptId
      })

      if (transitionError) {
        console.error('Transition error:', transitionError)
        throw transitionError
      }

      console.log('✅ Transitioned from Phase 1 to Phase 2')

      // Redirect to Author Studio (it will automatically load Phase 2)
      router.push(`/author-studio?manuscriptId=${manuscriptId}`)

    } catch (error) {
      console.error('Error starting Phase 2:', error)
      setIsStartingPhase2(false)
      alert('There was an error starting Phase 2. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transition...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            AuthorsLab.ai
          </Link>
        </div>
      </header>

      {/* Main Transition Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Celebration Banner */}
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-bold mb-4">
            🎉 Phase 1 Complete!
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Story Structure is Solid
          </h1>
          <p className="text-xl text-gray-600">
            {manuscript?.title} - Developmental Editing Complete
          </p>
        </div>

        {/* The Handoff */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Alex's Farewell */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-3xl">
                👔
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Alex</h3>
                <p className="text-green-600 font-semibold">Developmental Editor</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-6">
              <p className="text-gray-800 leading-relaxed mb-4">
                &ldquo;We&apos;ve done incredible work together. Your story structure is strong, your character arcs are clear, and the pacing flows beautifully.&rdquo;
              </p>
              <p className="text-gray-800 leading-relaxed">
                &ldquo;I&apos;m handing you off to Sam now, who&apos;s going to polish your prose until it absolutely shines. You&apos;re in excellent hands!&rdquo;
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Structure refined</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Characters developed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Plot tightened</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Pacing optimized</span>
              </div>
            </div>
          </div>

          {/* Sam's Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                ✨
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sam</h3>
                <p className="text-purple-600 font-semibold">Line Editor</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6 mb-6">
              <p className="text-gray-800 leading-relaxed mb-4">
                &ldquo;Hey! I&apos;ve read what you and Alex accomplished together—impressive work. Now let&apos;s make your prose sing.&rdquo;
              </p>
              <p className="text-gray-800 leading-relaxed">
                &ldquo;I focus on the craft of writing: word choice, rhythm, flow, and voice. Every sentence will be polished to perfection.&rdquo;
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">→</span>
                <span>Sentence-level refinement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">→</span>
                <span>Word choice precision</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">→</span>
                <span>Dialogue enhancement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">→</span>
                <span>Voice consistency</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Different in Phase 2 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Changes in Phase 2?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 mb-2">Microscopic Focus</h3>
              <p className="text-gray-600 text-sm">
                We zoom in from story structure to individual sentences and word choices.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-gray-900 mb-2">Prose Crafting</h3>
              <p className="text-gray-600 text-sm">
                Sam helps you find the perfect word, smooth the rhythm, and strengthen your voice.
              </p>
            </div>

            <div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Same Workspace</h3>
              <p className="text-gray-600 text-sm">
                The Author Studio interface stays the same—just with Sam&apos;s line-editing expertise.
              </p>
            </div>
          </div>
        </div>

        {/* Begin Phase 2 Button */}
        <div className="text-center">
          <button
            onClick={beginPhase2}
            disabled={isStartingPhase2}
            className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-12 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartingPhase2 ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Starting Phase 2...
              </>
            ) : (
              <>
                Begin Phase 2 with Sam ✨
              </>
            )}
          </button>

          <p className="text-gray-500 text-sm mt-4">
            You can always return to view your Phase 1 analysis
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PhaseTransitionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TransitionContent />
    </Suspense>
  )
}