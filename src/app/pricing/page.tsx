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
              📚 AuthorLab.ai
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold">
                How It Works
              </Link>
              <Link href="/pricing" className="text-blue-900 font-semibold border-b-2 border-blue-900">
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
              💰 Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Writing Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you&apos;re exploring your options or ready to commit to your book, we have the perfect solution for you.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
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
                  <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Complete manuscript AI analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Professional insights report</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Developmental feedback overview</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">See what&apos;s possible</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1 flex-shrink-0">✗</span>
                  <span className="text-gray-400">No full editing included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1 flex-shrink-0">✗</span>
                  <span className="text-gray-400">No publishing support</span>
                </li>
              </ul>

              <Link href="/free-analysis" className="block">
                <Button variant="outline" className="w-full text-base py-6">
                  Get Free Analysis
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">No credit card required</p>
              </div>
            </div>

            {/* Complete Package Card - Featured */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-yellow-400 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ MOST POPULAR
                </span>
              </div>

              <div className="text-center mb-6 mt-4">
                <div className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold mb-4">
                  Complete Partnership
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Author Package</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-white">$399</span>
                </div>
                <p className="text-blue-100">From first draft to published book</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white font-semibold">Everything in Free Analysis, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white">Full 4-phase editing journey</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white">Real-time collaborative workspace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white">Chapter-by-chapter AI guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white">Publishing preparation & formatting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 mt-1 flex-shrink-0">✓</span>
                  <span className="text-white">Priority support throughout</span>
                </li>
              </ul>

              <Link href="/signup" className="block">
                <Button className="w-full text-base py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 font-bold">
                  Start Your Journey
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-blue-200">One-time payment • 10-16 day timeline</p>
              </div>
            </div>

            {/* Ghost Writer Card - Coming Soon */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 relative opacity-95">
              <div className="absolute top-4 right-4">
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                  COMING SOON
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-purple-100 text-purple-900 rounded-full text-sm font-bold mb-4">
                  Full Service
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ghost Writer Package</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-extrabold text-gray-900">$2,499</span>
                </div>
                <p className="text-gray-600">From concept to finished book</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-semibold">Everything in Author Package, plus:</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Complete book creation service</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">AI-assisted writing process</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Professional editing & polish</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Cover design & marketing guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-700">Full project management</span>
                </li>
              </ul>

              <Button disabled className="w-full text-base py-6 opacity-60 cursor-not-allowed">
                Coming Soon
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Join waitlist
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
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
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">Author Package</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Ghost Writer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Manuscript Analysis</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Developmental Editing (Phase 1)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Line Editing (Phase 2)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Copy Editing (Phase 3)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Publishing Preparation (Phase 4)</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Real-time Collaboration Workspace</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold bg-blue-50">✓</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">AI-Assisted Writing</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Cover Design</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-700">Marketing Materials</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-gray-300">—</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">✓</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">Price</td>
                      <td className="px-6 py-4 text-center text-lg font-bold text-gray-900">Free</td>
                      <td className="px-6 py-4 text-center text-lg font-bold text-blue-900 bg-blue-50">$399</td>
                      <td className="px-6 py-4 text-center text-lg font-bold text-gray-900">$2,499</td>
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
                  Is the $399 package a one-time payment?
                </h3>
                <p className="text-gray-600">
                  Yes! The Author Package is a single payment of $399 that covers your complete editing journey from manuscript to published book. No hidden fees, no subscriptions.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What&apos;s included in the free analysis?
                </h3>
                <p className="text-gray-600">
                  Our free manuscript analysis provides a comprehensive AI-powered report covering story structure, character development, pacing, and key improvement areas. It&apos;s a great way to see the quality of our feedback before committing to the full package.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  How long does the complete editing process take?
                </h3>
                <p className="text-gray-600">
                  Most manuscripts move from first upload to publication-ready in 10-16 days, depending on length and complexity. Each of the four phases has specific timelines outlined on our How It Works page.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Can I upgrade from the free analysis to the full package?
                </h3>
                <p className="text-gray-600">
                  Absolutely! After receiving your free analysis, you can upgrade to the complete Author Package at any time. We&apos;ll pick up right where we left off.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  What if I need help during the process?
                </h3>
                <p className="text-gray-600">
                  Author Package customers receive priority support throughout their entire journey. You can reach out anytime with questions, and we&apos;ll help you keep moving forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start with a free analysis or jump straight into your complete writing journey.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/free-analysis">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Get Free Analysis
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-lg px-8 py-6">
                Start Full Journey - $399
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}