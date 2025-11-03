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
            Start with a free analysis or get the complete 3-phase professional editing package. Publishing and marketing phases launching Q1 2025.
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
                  <span className="text-gray-400">No line or copy editing phases</span>
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

            {/* Complete 3-Phase Package - Featured */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-green-400 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ AVAILABLE NOW
                </span>
              </div>

              <div className="text-center mb-6 mt-4">
                <div className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold mb-4">
                  Professional Editing
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">3-Phase Editing Package</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-white">$299</span>
                </div>
                <p className="text-blue-100">Complete professional editing for your manuscript</p>
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
                  <span className="text-white">Real-time collaborative workspace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white">Chapter-by-chapter interactive editing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white">3 downloadable manuscript versions (PDF)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1 flex-shrink-0 text-xl">✓</span>
                  <span className="text-white">Work at your own pace</span>
                </li>
              </ul>

              <Link href="/signup" className="block">
                <Button className="w-full text-base py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                  Start Editing Now
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-blue-200">One-time payment · No subscriptions · Priority support</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-bold mb-4">
                Coming Q4 2025
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Complete Your Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We&apos;re building two additional phases to take you from edited manuscript to published, promoted book
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Phase 4 - Publishing */}
              <div className="bg-white rounded-2xl p-8 border-2 border-teal-300 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    📚
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Phase 4: Publishing</h3>
                    <p className="text-teal-600 font-semibold">Format & Launch Prep · Taylor</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 mt-1">→</span>
                    <span className="text-gray-700">Professional manuscript formatting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 mt-1">→</span>
                    <span className="text-gray-700">Print & e-book file preparation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 mt-1">→</span>
                    <span className="text-gray-700">Cover design guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-teal-600 mt-1">→</span>
                    <span className="text-gray-700">Publishing platform strategy</span>
                  </li>
                </ul>

                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                  <p className="text-sm text-teal-800 font-semibold">
                    🎯 Launching Q1 2025 · Add-on pricing TBD
                  </p>
                </div>
              </div>

              {/* Phase 5 - Marketing */}
              <div className="bg-white rounded-2xl p-8 border-2 border-orange-300 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Phase 5: Marketing</h3>
                    <p className="text-orange-600 font-semibold">Strategy & Promotion · Quinn</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-gray-700">Author platform building</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-gray-700">Target reader identification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-gray-700">Social media content calendar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 mt-1">→</span>
                    <span className="text-gray-700">Book launch campaign</span>
                  </li>
                </ul>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-orange-800 font-semibold">
                    🎯 Launching Q1 2025 · Add-on pricing TBD
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600">
                Want early access? <Link href="/signup" className="text-blue-600 hover:underline font-semibold">Join now</Link> and get notified when these phases launch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
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
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">3-Phase Package</th>
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
                      <td className="px-6 py-4 text-sm text-gray-700">3 Downloadable Manuscript Versions</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Work at Your Own Pace</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold text-xl bg-blue-50">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Publishing Prep (Phase 4)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-orange-400 text-xs bg-blue-50">Coming Q4</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Marketing Strategy (Phase 5)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-orange-400 text-xs bg-blue-50">Coming Q4</td>
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
                  Yes! The 3-Phase Editing Package is a single payment of $299 that covers your complete professional editing journey through developmental, line, and copy editing. No hidden fees, no subscriptions.
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
                  How long does the 3-phase editing process take?
                </h3>
                <p className="text-gray-600">
                  You work at your own pace! Most authors complete all three phases in 2-4 weeks, but you can take as much time as you need. There are no deadlines or time limits.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I upgrade from the free analysis to the full package?
                </h3>
                <p className="text-gray-600">
                  Absolutely! After receiving your free analysis, you can upgrade to the complete 3-Phase Editing Package at any time. We&apos;ll pick up right where we left off with your manuscript.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  When will publishing and marketing phases be available?
                </h3>
                <p className="text-gray-600">
                  Phase 4 (Publishing with Taylor) and Phase 5 (Marketing with Quinn) are launching in Q1 2025. If you purchase the 3-Phase Package now, you&apos;ll be first to know when these become available and receive special early access pricing.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What if I need help during the process?
                </h3>
                <p className="text-gray-600">
                  All 3-Phase Editing Package customers receive priority support throughout their entire journey. You can reach out anytime with questions through our support system, and we&apos;ll help you keep moving forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Editing Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start with a free analysis to see the quality of our AI editors, or jump straight into the complete 3-phase professional editing package.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                Start 3-Phase Journey - $299
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}