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
              📚 AuthorsLab.ai
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-blue-900 font-semibold border-b-2 border-blue-900">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 font-semibold">
                Pricing
              </Link>
              <Link href="/editors" className="text-gray-700 hover:text-blue-900 font-semibold">
                Our Editors
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-900 font-semibold">
                FAQ
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
            <span className="px-4 py-2 bg-gradient-to-r from-green-400/20 to-blue-400/20 border-2 border-green-400 text-green-700 rounded-full text-sm font-bold">
              🎯 Your Complete Writing Journey
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            From First Draft to
            <span className="block bg-gradient-to-r from-green-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Published Book
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our 5-phase AI-powered editing process transforms your manuscript into a published book. Three phases available now, with publishing and marketing launching Q4 2025.
          </p>
        </div>
      </section>

      {/* The 5 Phases */}
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
                  <p className="text-green-600 font-semibold">Story Structure & Big Picture · Meet Alex 👔</p>
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
                        <span>Comprehensive manuscript analysis PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Chapter-by-chapter developmental notes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Interactive chat with Alex about your story</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">→</span>
                        <span>Downloadable approved manuscript version</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-green-300">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Available Now | <strong>AI Editor:</strong> Alex (Developmental Specialist) | <strong>Work at your own pace</strong>
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
                  <p className="text-purple-600 font-semibold">Prose Polish & Flow · Meet Sam ✨</p>
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
                        <span>Rhythm and dialogue flow</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Line-by-line prose editing notes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Detailed line editing report PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Interactive chat with Sam about word choice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">→</span>
                        <span>Downloadable polished manuscript version</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-purple-300">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Available Now | <strong>AI Editor:</strong> Sam (Line Editing Specialist) | <strong>Work at your own pace</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3: Copy Editing */}
            <div className="mb-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Copy Editing</h2>
                  <p className="text-blue-600 font-semibold">Grammar & Technical Accuracy · Meet Jordan 🔍</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 3:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🔍 Technical Polish</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Grammar and punctuation correction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Spelling and typo elimination</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Consistency checking (names, dates, details)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">✓</span>
                        <span>Style guide compliance</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Technical editing notes per chapter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Copy editing report PDF</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Interactive chat with Jordan about technical details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">→</span>
                        <span>Publication-ready manuscript download</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-300">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Available Now | <strong>AI Editor:</strong> Jordan (Copy Editing Specialist) | <strong>Work at your own pace</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4: Publishing Preparation */}
            <div className="mb-20 opacity-95">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Publishing Preparation</h2>
                  <p className="text-teal-600 font-semibold">Format & Launch Support · Meet Taylor 📚</p>
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-8 border-2 border-teal-200">
                <div className="bg-teal-100 border-l-4 border-teal-500 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-teal-900 mb-3 text-lg flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Why This Approach Is Better For You
                  </h4>
                  <p className="text-teal-800 leading-relaxed">
                    Unlike traditional publishing services that take your rights and charge thousands, Taylor gives you professional-grade publishing tools and guidance while YOU keep 100% ownership, control, and royalties. Your book, your rights, your success.
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens in Phase 4:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">📚 What Taylor Prepares For You</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>Professional EPUB files for all ebook platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>Print-ready PDFs (multiple trim sizes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>AI-generated cover designs (ebook & print)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>Optimized book description & metadata</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>Keyword research & category recommendations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>File validation & quality checks</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 What You Do (With Taylor&apos;s Guidance)</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Review and select your favorite cover design</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Approve formatting previews</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Create free accounts on publishing platforms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Upload files following Taylor&apos;s video tutorials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Set your pricing and distribution</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">→</span>
                        <span>Click &quot;Publish&quot; - your book goes live!</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-lg border-2 border-teal-300 p-6">
                  <h4 className="font-bold text-gray-900 mb-3">📖 Supported Publishing Platforms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Amazon KDP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>IngramSpark</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Draft2Digital</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Apple Books</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Google Play</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Kobo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Barnes & Noble</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-600">✓</span>
                      <span>Lulu</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-teal-100 to-teal-50 rounded-lg border border-teal-300 p-6">
                  <h4 className="font-bold text-teal-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    You Keep 100% Ownership & Control
                  </h4>
                  <ul className="space-y-2 text-teal-800 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span><strong>All rights remain yours</strong> - no contracts giving away ownership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span><strong>You keep all royalties</strong> after platform fees (typically 60-70% of sales price)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span><strong>You set your own prices</strong> - change them anytime you want</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span><strong>You control distribution</strong> - choose which countries and platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span><strong>You can update anytime</strong> - upload new versions whenever you want</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border border-teal-300">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Launching Q4 2025 | <strong>Publishing Specialist:</strong> Taylor | <strong>Estimated Timeline:</strong> Files ready in 3-5 days
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 5: Marketing Strategy */}
            <div className="mb-20 opacity-95">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Marketing Strategy</h2>
                  <p className="text-orange-600 font-semibold">Platform Building & Promotion · Meet Quinn 🚀</p>
                </div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Will Happen in Phase 5:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🚀 Marketing Launch</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">✓</span>
                        <span>Author platform building strategy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">✓</span>
                        <span>Target reader identification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">✓</span>
                        <span>Social media content calendar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">✓</span>
                        <span>Book launch timeline and tactics</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 You Will Receive</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Comprehensive marketing plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Social media post templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Email campaign strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span>Book promotion best practices guide</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-orange-300">
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Launching Q4 2025 | <strong>Marketing Specialist:</strong> Quinn (Marketing Strategist)
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What's Available Now vs Coming Soon */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Your Journey Starts Today</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Available Now */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-green-400">
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                  AVAILABLE NOW
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3-Phase Professional Editing</h3>
                <p className="text-gray-600 mb-6">
                  Start editing your manuscript today with our complete 3-phase editing system.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Phase 1:</strong> Developmental editing with Alex</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Phase 2:</strong> Line editing with Sam</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-700"><strong>Phase 3:</strong> Copy editing with Jordan</span>
                  </li>
                </ul>
                <div className="text-3xl font-bold text-gray-900 mb-2">$299</div>
                <p className="text-sm text-gray-600 mb-6">Complete editing package · Work at your own pace</p>
                <Link href="/signup">
                  <Button className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    Start Editing Now
                  </Button>
                </Link>
              </div>

              {/* Coming Soon */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-300 opacity-95">
                <div className="inline-block bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                  COMING Q4 2025
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Publishing & Marketing Hub</h3>
                <p className="text-gray-600 mb-6">
                  Complete your journey from edited manuscript to published, promoted book.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 text-xl">⏳</span>
                    <span className="text-gray-700"><strong>Phase 4:</strong> Publishing prep with Taylor</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 text-xl">⏳</span>
                    <span className="text-gray-700"><strong>Phase 5:</strong> Marketing strategy with Quinn</span>
                  </li>
                </ul>
                <div className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</div>
                <p className="text-sm text-gray-600 mb-6">Be the first to know when we launch</p>
                <Button variant="outline" className="w-full py-6 text-lg border-2 border-teal-300 hover:bg-teal-50" disabled>
                  Notify Me When Available
                </Button>
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
              <Button className="text-lg px-8 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Start 3-Phase Journey - $299
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}