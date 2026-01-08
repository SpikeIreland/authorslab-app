import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
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
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold">
                How It Works
              </Link>
              <Link href="/pricing" className="text-blue-900 font-semibold border-b-2 border-blue-900">
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
              💰 Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Professional Editing,
            <span className="block bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Accessible Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start with a free analysis or get the complete 5-phase journey: editing, publishing, and marketing - all for one price.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Free Analysis Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-bold mb-4">
                  Try It Free
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Manuscript Analysis</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-gray-900">$0</span>
                </div>
                <p className="text-gray-600">Professional AI feedback report</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-gray-700">Complete manuscript AI analysis by Alex</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-gray-700">Comprehensive developmental insights PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-gray-700">Story structure & character analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-gray-700">See what&apos;s possible for your manuscript</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1 flex-shrink-0">✗</span>
                  <span className="text-gray-400">No interactive editing workspace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1 flex-shrink-0">✗</span>
                  <span className="text-gray-400">No publishing or marketing phases</span>
                </li>
              </ul>

              <Link href="/free-analysis" className="block">
                <Button variant="outline" className="w-full text-base py-6 border-2">
                  Get Free Analysis
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">No credit card required · Email delivery in 5 minutes</p>
              </div>
            </div>

            {/* Complete 5-Phase Package - Featured */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-green-400 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ COMPLETE JOURNEY
                </span>
              </div>

              <div className="text-center mb-6 mt-4">
                <h3 className="text-2xl font-bold text-white mb-2">Full Editorial Package</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-white">$299</span>
                </div>
                <p className="text-blue-100">All five phases included</p>
              </div>

              <div className="bg-blue-800/50 rounded-lg p-4 mb-6 border border-blue-400">
                <p className="text-sm text-blue-100 leading-relaxed">
                  <strong className="text-white">🎉 Beta Pricing:</strong> Be an early adopter!
                  This special $299 rate won&apos;t last - help us refine AuthorsLab with your feedback
                  and lock in this price before we launch publicly.
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl font-bold">✓</span>
                  <span className="text-white font-semibold">Everything in Free Analysis, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white"><strong>Phase 1:</strong> Developmental editing with Alex 👔</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white"><strong>Phase 2:</strong> Line editing with Sam ✨</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white"><strong>Phase 3:</strong> Copy editing with Jordan 🔍</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white"><strong>Phase 4:</strong> Publishing prep with Taylor 📚</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white"><strong>Phase 5:</strong> Marketing strategy with Quinn 🚀</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white">Real-time collaborative workspace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white">Work at your own pace</span>
                </li>
              </ul>

              <Link href="/signup" className="block">
                <Button className="w-full text-base py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                  Start Your Journey
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-blue-200">One-time payment · No subscriptions · Priority support</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What&apos;s Included
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Five specialized AI editors guide you from raw manuscript to published, marketed book
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Phase 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
                  👔
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Phase 1</h3>
                <p className="text-green-600 font-semibold text-center text-sm mb-3">Alex</p>
                <p className="text-gray-600 text-center text-sm">Story structure, character arcs, pacing</p>
              </div>

              {/* Phase 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-purple-500">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
                  ✨
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Phase 2</h3>
                <p className="text-purple-600 font-semibold text-center text-sm mb-3">Sam</p>
                <p className="text-gray-600 text-center text-sm">Prose polish, dialogue, voice</p>
              </div>

              {/* Phase 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Phase 3</h3>
                <p className="text-blue-600 font-semibold text-center text-sm mb-3">Jordan</p>
                <p className="text-gray-600 text-center text-sm">Grammar, consistency, accuracy</p>
              </div>

              {/* Phase 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-teal-500">
                <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
                  📚
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Phase 4</h3>
                <p className="text-teal-600 font-semibold text-center text-sm mb-3">Taylor</p>
                <p className="text-gray-600 text-center text-sm">Cover design, formatting, files</p>
              </div>

              {/* Phase 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-orange-500">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl mb-4 mx-auto">
                  🚀
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Phase 5</h3>
                <p className="text-orange-600 font-semibold text-center text-sm mb-3">Quinn</p>
                <p className="text-gray-600 text-center text-sm">Marketing plan, launch strategy</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/how-it-works">
                <Button variant="outline" className="px-8 py-6">
                  Learn More About Each Phase
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Feature Comparison
            </h2>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free Analysis</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">Complete Package</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Full Manuscript Analysis</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Developmental Insights PDF</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Phase 1: Developmental Editing (Alex)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Phase 2: Line Editing (Sam)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Phase 3: Copy Editing (Jordan)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Phase 4: Publishing Prep (Taylor)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Phase 5: Marketing Strategy (Quinn)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Interactive Editing Workspace</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Chapter-by-Chapter Collaboration</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Real-time Chat with AI Editors</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">AI-Generated Cover Designs</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Publication-Ready Files (PDF, EPUB)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Marketing Plan & Launch Strategy</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Work at Your Own Pace</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">Price</td>
                      <td className="px-6 py-4 text-center text-2xl font-bold text-gray-900">Free</td>
                      <td className="px-6 py-4 text-center text-2xl font-bold text-blue-900 bg-blue-50">$299</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Value You&apos;re Getting
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Traditional services vs. AuthorsLab
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Traditional Route</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Developmental editing: $1,500 - $3,000</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Line editing: $1,000 - $2,500</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Copy editing: $800 - $2,000</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Cover design: $300 - $1,000</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Formatting: $200 - $500</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="text-gray-600">Marketing consultant: $500 - $2,000</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-2xl font-bold text-gray-900">Total: $4,300 - $11,000+</p>
                    <p className="text-sm text-gray-500">Timeline: 3-6 months</p>
                  </div>
                </div>

                <div className="text-left bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">AuthorsLab</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">Developmental editing with Alex</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">Line editing with Sam</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">Copy editing with Jordan</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">AI cover design with Taylor</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">Professional formatting with Taylor</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-600">Marketing strategy with Quinn</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-green-200">
                    <p className="text-2xl font-bold text-green-600">Total: $299</p>
                    <p className="text-sm text-gray-500">Timeline: Work at your pace</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg text-gray-600">
                  You keep <strong>100% of your rights</strong> and <strong>all royalties</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Pricing Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Is the $299 package a one-time payment?
                </h3>
                <p className="text-gray-600">
                  Yes! The Complete Package is a single payment of $299 that covers your entire journey through all five phases: developmental editing, line editing, copy editing, publishing preparation, and marketing strategy. No hidden fees, no subscriptions.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What&apos;s included in the free analysis?
                </h3>
                <p className="text-gray-600">
                  Our free manuscript analysis provides a comprehensive AI-powered report from Alex, our developmental editor. You&apos;ll receive detailed feedback on story structure, character development, pacing, and key improvement areas - delivered to your email in about 5 minutes.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How long does the complete process take?
                </h3>
                <p className="text-gray-600">
                  You work at your own pace! Most authors complete all five phases in 3-6 weeks, but you can take as much time as you need. There are no deadlines or time limits.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I upgrade from the free analysis to the full package?
                </h3>
                <p className="text-gray-600">
                  Absolutely! After receiving your free analysis, you can upgrade to the Complete Package at any time. We&apos;ll pick up right where we left off with your manuscript.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Do I keep all rights to my book?
                </h3>
                <p className="text-gray-600">
                  Yes, 100%. AuthorsLab never takes any ownership of your work. You retain all rights, control all distribution decisions, and keep all royalties from your book sales.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What if I need help during the process?
                </h3>
                <p className="text-gray-600">
                  All Complete Package customers receive priority support throughout their entire journey. You can reach out anytime with questions through our support system, and we&apos;ll help you keep moving forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start with a free analysis to see the quality of our AI editors, or jump straight into the complete 5-phase journey.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                Start Complete Journey - $299
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}