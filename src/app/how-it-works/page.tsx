import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorLab.ai
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 font-semibold">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-900 font-semibold">
                Sign In
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold">
              🎯 Your Complete Writing Journey
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            From First Draft to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Published Book
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our 4-phase AI-powered editing process transforms your manuscript into a publication-ready book. Here&apos;s exactly how it works.
          </p>
        </div>
      </section>

      {/* The 4 Phases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            
            {/* Phase 1: Developmental Editing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Developmental Editing</h2>
                  <p className="text-green-600 font-semibold">Story Structure & Big Picture</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 1:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">📖 Story Analysis</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Overall plot structure evaluation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Character arc development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Pacing and tension assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>Theme identification and strengthening</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Comprehensive manuscript analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Chapter-by-chapter feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Character development suggestions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Plot hole identification</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">
                    <strong>Timeline:</strong> 2-3 days for most manuscripts | <strong>AI Editor:</strong> Alex (Developmental Specialist)
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2: Line Editing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Line Editing</h2>
                  <p className="text-purple-600 font-semibold">Prose Polish & Flow</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 2:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">✍️ Sentence-Level Work</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span>Sentence structure optimization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span>Word choice enhancement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span>Voice consistency check</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span>Rhythm and flow improvement</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Line-by-line editing suggestions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Dialogue enhancement tips</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Awkward phrasing fixes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Style consistency report</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">
                    <strong>Timeline:</strong> 3-5 days for most manuscripts | <strong>AI Editor:</strong> Sam (Line Editing Specialist)
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3: Copy Editing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Copy Editing</h2>
                  <p className="text-red-600 font-semibold">Grammar & Technical Accuracy</p>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 3:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🔍 Technical Polish</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✓</span>
                        <span>Grammar and punctuation correction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✓</span>
                        <span>Spelling and typo elimination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✓</span>
                        <span>Consistency checking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">✓</span>
                        <span>Fact verification where applicable</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">→</span>
                        <span>Clean, error-free manuscript</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">→</span>
                        <span>Style guide compliance check</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">→</span>
                        <span>Formatting consistency</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1">→</span>
                        <span>Publication-ready text</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">
                    <strong>Timeline:</strong> 2-3 days for most manuscripts | <strong>AI Editor:</strong> Jordan (Copy Editing Specialist)
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4: Publishing Preparation */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Publishing Preparation</h2>
                  <p className="text-yellow-600 font-semibold">Format & Launch</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-2xl p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 4:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">📚 Publishing Ready</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">✓</span>
                        <span>Professional formatting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">✓</span>
                        <span>E-book and print layout</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">✓</span>
                        <span>Cover design guidance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">✓</span>
                        <span>Platform submission prep</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span>Print-ready PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span>E-book files (EPUB, MOBI)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span>Marketing materials templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">→</span>
                        <span>Launch checklist</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600">
                    <strong>Timeline:</strong> 3-5 days for formatting and prep | <strong>Support:</strong> Full Publishing Team
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Total Journey Timeline</h2>
            <p className="text-xl text-gray-600 mb-12">
              From manuscript upload to published book
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">2-3 days</div>
                  <div className="text-sm text-gray-600">Phase 1</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">3-5 days</div>
                  <div className="text-sm text-gray-600">Phase 2</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">2-3 days</div>
                  <div className="text-sm text-gray-600">Phase 3</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">3-5 days</div>
                  <div className="text-sm text-gray-600">Phase 4</div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-4xl font-bold text-blue-900 mb-2">10-16 days</div>
                <div className="text-gray-600">Average total time to publication-ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Manuscript?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start with a free manuscript analysis and see what&apos;s possible for your book.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button className="text-lg px-8 py-6">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Start Full Journey - $399
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}