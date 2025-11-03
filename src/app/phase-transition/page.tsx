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
  const fromPhaseParam = searchParams.get('fromPhase')
  const toPhaseParam = searchParams.get('toPhase')

  // Parse phase numbers
  const fromPhase = fromPhaseParam ? parseInt(fromPhaseParam) : 1
  const toPhase = toPhaseParam ? parseInt(toPhaseParam) : 2

  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isGeneratingVersion, setIsGeneratingVersion] = useState(false)
  const [versionGenerated, setVersionGenerated] = useState(false)

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

  async function handlePhaseTransition() {
    if (!manuscriptId) return

    setIsTransitioning(true)
    const supabase = createClient()

    try {
      // Verify auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Not authenticated')
        router.push('/login')
        return
      }

      // Get author info for version generation email
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
        .eq('id', manuscriptId)
        .single()

      // Extract author profile
      const authorProfile = Array.isArray(manuscriptData?.author_profiles)
        ? manuscriptData.author_profiles[0]
        : manuscriptData?.author_profiles

      // Get editor name based on fromPhase
      const editorNames = ['', 'Alex', 'Sam', 'Jordan', 'Taylor', 'Quinn']
      const editorName = editorNames[fromPhase] || 'Editor'

      // Step 1: Generate manuscript version + send email
      setIsGeneratingVersion(true)
      console.log(`📦 Generating Phase ${fromPhase} manuscript version...`)

      try {
        const versionResponse = await fetch(
          'https://spikeislandstudios.app.n8n.cloud/webhook/generate-manuscript-version',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manuscriptId: manuscriptId,
              phaseNumber: fromPhase,
              editorName: editorName,
              authorEmail: authorProfile?.email,
              authorFirstName: authorProfile?.first_name,
              manuscriptTitle: manuscriptData?.title
            })
          }
        )

        if (versionResponse.ok) {
          console.log('✅ Version generated and email sent!')
          setVersionGenerated(true)
        } else {
          console.warn('⚠️ Version generation had issues, but continuing...')
        }
      } catch (versionError) {
        console.error('Version generation error:', versionError)
        // Don't block transition if version generation fails
      }

      setIsGeneratingVersion(false)

      // Wait a moment for the success message to show
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Step 2: Mark current phase complete
      const { error: completeError } = await supabase
        .from('editing_phases')
        .update({
          phase_status: 'complete',
          completed_at: new Date().toISOString()
        })
        .eq('manuscript_id', manuscriptId)
        .eq('phase_number', fromPhase)

      if (completeError) throw completeError

      // Step 3: Mark next phase active
      const { error: activateError } = await supabase
        .from('editing_phases')
        .update({
          phase_status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('manuscript_id', manuscriptId)
        .eq('phase_number', toPhase)

      if (activateError) throw activateError

      // Step 4: Update manuscript phase number
      const { error: manuscriptError } = await supabase
        .from('manuscripts')
        .update({
          current_phase_number: toPhase,
          status: 'editing'
        })
        .eq('id', manuscriptId)

      if (manuscriptError) throw manuscriptError

      console.log(`✅ Transitioned from Phase ${fromPhase} to Phase ${toPhase}`)

      // Redirect to Author Studio
      router.push(`/author-studio?manuscriptId=${manuscriptId}`)

    } catch (error) {
      console.error('Error transitioning phases:', error)
      setIsTransitioning(false)
      alert('There was an error with the transition. Please try again.')
    }
  }

  // Get editor details based on phase
  const getEditorDetails = (phase: number) => {
    const editors = [
      { name: '', emoji: '', color: '', role: '' },
      { name: 'Alex', emoji: '👔', color: 'green', role: 'Developmental Editor' },
      { name: 'Sam', emoji: '✨', color: 'purple', role: 'Line Editor' },
      { name: 'Jordan', emoji: '🔍', color: 'blue', role: 'Copy Editor' },
      { name: 'Taylor', emoji: '📚', color: 'teal', role: 'Publishing Editor' },
      { name: 'Quinn', emoji: '🚀', color: 'orange', role: 'Marketing Strategist' }
    ]
    return editors[phase] || editors[1]
  }

  const fromEditor = getEditorDetails(fromPhase)
  const toEditor = getEditorDetails(toPhase)

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
          {fromPhase === 1 && (
            <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full text-lg font-bold mb-4">
              🎉 Phase 1 Complete!
            </div>
          )}
          {fromPhase === 2 && (
            <div className="inline-block bg-purple-100 text-purple-800 px-6 py-3 rounded-full text-lg font-bold mb-4">
              ✨ Phase 2 Complete!
            </div>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {fromPhase === 1 && "Your Story Structure is Solid"}
            {fromPhase === 2 && "Your Prose is Polished"}
          </h1>

          <p className="text-xl text-gray-600">
            {manuscript?.title} - {fromPhase === 1 ? "Developmental" : fromPhase === 2 ? "Line" : "Copy"} Editing Complete
          </p>
        </div>

        {/* The Handoff */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Current Editor's Farewell */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${fromPhase === 1 ? 'border-green-200' : fromPhase === 2 ? 'border-purple-200' : 'border-blue-200'
            }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${fromPhase === 1
                  ? 'from-green-400 to-green-600'
                  : fromPhase === 2
                    ? 'from-purple-400 to-purple-600'
                    : 'from-blue-400 to-blue-600'
                } rounded-full flex items-center justify-center text-3xl`}>
                {fromEditor.emoji}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{fromEditor.name}</h3>
                <p className={`font-semibold ${fromPhase === 1 ? 'text-green-600' : fromPhase === 2 ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                  {fromEditor.role}
                </p>
              </div>
            </div>

            <div className={`rounded-xl p-6 mb-6 ${fromPhase === 1 ? 'bg-green-50' : fromPhase === 2 ? 'bg-purple-50' : 'bg-blue-50'
              }`}>
              {fromPhase === 1 && (
                <>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    &ldquo;We&apos;ve done incredible work together. Your story structure is strong, your character arcs are clear, and the pacing flows beautifully.&rdquo;
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    &ldquo;I&apos;m handing you off to Sam now, who&apos;s going to polish your prose until it absolutely shines. You&apos;re in excellent hands!&rdquo;
                  </p>
                </>
              )}
              {fromPhase === 2 && (
                <>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    &ldquo;Your prose is singing now! We&apos;ve refined the word choice, smoothed out the rhythm, and made sure every sentence lands with impact.&rdquo;
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    &ldquo;Now it&apos;s time for Jordan to ensure every technical detail is perfect. They&apos;re meticulous and will catch anything we might have missed!&rdquo;
                  </p>
                </>
              )}
            </div>

            {fromPhase === 1 && (
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
            )}
            {fromPhase === 2 && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Word choice refined</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Rhythm perfected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Dialogue polished</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Voice strengthened</span>
                </div>
              </div>
            )}
          </div>

          {/* Next Editor's Introduction */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${toPhase === 2 ? 'border-purple-200' : toPhase === 3 ? 'border-blue-200' : 'border-teal-200'
            }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${toPhase === 2
                  ? 'from-purple-400 to-purple-600'
                  : toPhase === 3
                    ? 'from-blue-400 to-blue-600'
                    : 'from-teal-400 to-teal-600'
                } rounded-full flex items-center justify-center text-3xl`}>
                {toEditor.emoji}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{toEditor.name}</h3>
                <p className={`font-semibold ${toPhase === 2 ? 'text-purple-600' : toPhase === 3 ? 'text-blue-600' : 'text-teal-600'
                  }`}>
                  {toEditor.role}
                </p>
              </div>
            </div>

            <div className={`rounded-xl p-6 mb-6 ${toPhase === 2 ? 'bg-purple-50' : toPhase === 3 ? 'bg-blue-50' : 'bg-teal-50'
              }`}>
              {toPhase === 2 && (
                <>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    &ldquo;Hey! I&apos;ve read what you and Alex accomplished together—impressive work. Now let&apos;s make your prose sing.&rdquo;
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    &ldquo;I focus on the craft of writing: word choice, rhythm, flow, and voice. Every sentence will be polished to perfection.&rdquo;
                  </p>
                </>
              )}
              {toPhase === 3 && (
                <>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    &ldquo;Hello! I&apos;m Jordan, your copy editor. I&apos;m here to ensure your manuscript is technically flawless.&rdquo;
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    &ldquo;Sam&apos;s done beautiful work on your prose—now I&apos;ll make sure every comma is in the right place, every detail is consistent, and your manuscript meets professional standards.&rdquo;
                  </p>
                </>
              )}
            </div>

            {toPhase === 2 && (
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
            )}
            {toPhase === 3 && (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Grammar perfection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Punctuation accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Consistency checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span>Style guide compliance</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What Changes Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What Changes in Phase {toPhase}?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {toPhase === 2 && (
              <>
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
              </>
            )}
            {toPhase === 3 && (
              <>
                <div>
                  <div className="text-3xl mb-3">🔬</div>
                  <h3 className="font-bold text-gray-900 mb-2">Technical Precision</h3>
                  <p className="text-gray-600 text-sm">
                    We shift from prose polish to technical correctness: grammar, punctuation, and consistency.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-3">📐</div>
                  <h3 className="font-bold text-gray-900 mb-2">Professional Standards</h3>
                  <p className="text-gray-600 text-sm">
                    Jordan ensures your manuscript meets Chicago Manual of Style and industry standards.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="font-bold text-gray-900 mb-2">Final Polish</h3>
                  <p className="text-gray-600 text-sm">
                    Catching every technical detail so your manuscript is publication-ready.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transition Button */}
        <div className="text-center">
          <button
            onClick={handlePhaseTransition}
            disabled={isTransitioning}
            className={`px-12 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${toPhase === 2
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white'
                : toPhase === 3
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white'
                  : 'bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white'
              }`}
          >
            {isGeneratingVersion ? (
              <>
                <span className="inline-block animate-spin mr-2">📦</span>
                Preparing Your Manuscript...
              </>
            ) : versionGenerated ? (
              <>
                <span className="mr-2">✅</span>
                Email Sent! Starting Phase {toPhase}...
              </>
            ) : isTransitioning ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Starting Phase {toPhase}...
              </>
            ) : (
              <>
                Begin Phase {toPhase} with {toEditor.name} {toEditor.emoji}
              </>
            )}
          </button>

          {isGeneratingVersion && (
            <p className={`text-sm mt-4 font-medium ${toPhase === 2 ? 'text-purple-600' : toPhase === 3 ? 'text-blue-600' : 'text-teal-600'
              }`}>
              Generating downloadable versions and sending to your email...
            </p>
          )}

          {versionGenerated && !isGeneratingVersion && (
            <p className="text-green-600 text-sm mt-4 font-medium">
              📧 Check your email for download links!
            </p>
          )}

          {!isGeneratingVersion && !versionGenerated && (
            <p className="text-gray-500 text-sm mt-4">
              Your approved manuscript will be emailed to you
            </p>
          )}
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