import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/how-it-works" className="text-gray-700 hover:text-blue-900 font-semibold transition-colors">
                How It Works
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-900 font-semibold transition-colors">
                Pricing
              </Link>
              <Link href="/editors" className="text-gray-700 hover:text-blue-900 font-semibold transition-colors">
                Our Editors
              </Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-900 font-semibold transition-colors">
                FAQ
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-900 font-semibold transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
            {/* Mobile menu button - can add hamburger menu later */}
            <Link href="/signup" className="md:hidden">
              <Button className="text-sm px-4 py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-gradient-to-r from-green-400/20 to-blue-400/20 border-2 border-green-400 text-green-700 rounded-full text-sm font-bold">
              ✨ 3-Phase Professional Editing Available Now
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Your Manuscript,
            <span className="block bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Professionally Edited
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Work with your AI editorial team: Alex refines your story structure, Sam polishes your prose, and Jordan perfects every technical detail.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="text-lg px-8 py-6 border-2">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Professional quality</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Your work stays private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Complete Editing Journey */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your Complete Editing Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Three professional editing phases available now, with publishing and marketing coming soon
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Phase 1 - Alex */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500 relative">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  AVAILABLE
                </div>
                <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Developmental</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Story structure & character arcs</p>
                <div className="text-center">
                  <span className="text-3xl">👔</span>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Alex</p>
                </div>
              </div>

              {/* Phase 2 - Sam */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500 relative">
                <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  AVAILABLE
                </div>
                <div className="w-14 h-14 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Line Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Prose polish & sentence flow</p>
                <div className="text-center">
                  <span className="text-3xl">✨</span>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Sam</p>
                </div>
              </div>

              {/* Phase 3 - Jordan */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500 relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  AVAILABLE
                </div>
                <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Copy Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Grammar & technical perfection</p>
                <div className="text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Jordan</p>
                </div>
              </div>

              {/* Phase 4 - Taylor */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-teal-400 relative opacity-90">
                <div className="absolute -top-3 -right-3 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  SOON
                </div>
                <div className="w-14 h-14 bg-teal-400 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Publishing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Format & launch prep</p>
                <div className="text-center">
                  <span className="text-3xl">📚</span>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Taylor</p>
                </div>
              </div>

              {/* Phase 5 - Quinn */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-orange-400 relative opacity-90">
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  SOON
                </div>
                <div className="w-14 h-14 bg-orange-400 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 mx-auto">
                  5
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Marketing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Strategy & promotion</p>
                <div className="text-center">
                  <span className="text-3xl">🚀</span>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Quinn</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/how-it-works">
                <Button variant="outline" className="text-base px-6 py-6">
                  Learn More About Our Process
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need to Write Better
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                ✍️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chapter-by-Chapter Editing</h3>
              <p className="text-gray-700">
                Work through your manuscript systematically with targeted feedback on each chapter from your AI editorial team.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Context-Aware AI</h3>
              <p className="text-gray-700">
                Each editor understands your entire manuscript, character arcs, and plot threads to give relevant, story-specific advice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                📥
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Downloadable Reports</h3>
              <p className="text-gray-700">
                Get comprehensive PDF reports at each phase completion, plus downloadable manuscript versions as you progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Professional editing for your entire manuscript
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Analysis */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Analysis</h3>
                <div className="text-5xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600 mb-6">Professional AI feedback report on your manuscript</p>
                <ul className="text-left space-y-2 mb-6 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Full manuscript analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Developmental insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>PDF report delivered</span>
                  </li>
                </ul>
                <Link href="/free-analysis">
                  <Button variant="outline" className="w-full py-6">
                    Get Free Analysis
                  </Button>
                </Link>
              </div>

              {/* Complete Editing Package */}
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-blue-400 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                    3 PHASES AVAILABLE
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-4">Complete Editing</h3>
                <div className="text-5xl font-bold text-white mb-4">$299</div>
                <p className="text-blue-100 mb-6">All three professional editing phases</p>
                <ul className="text-left space-y-2 mb-6 text-blue-100">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Phase 1: Developmental editing with Alex</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Phase 2: Line editing with Sam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Phase 3: Copy editing with Jordan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-1">⏳</span>
                    <span className="text-blue-200">Publishing prep (coming soon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-1">⏳</span>
                    <span className="text-blue-200">Marketing strategy (coming soon)</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                    Start Editing Journey
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-12">
              <Link href="/pricing" className="text-blue-600 hover:underline font-semibold text-lg">
                See Full Pricing Details →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Meet Your Editorial Team */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Meet Your AI Editorial Team
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Five specialists, each expert in their craft
          </p>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Alex */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                👔
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alex</h3>
              <p className="text-gray-600 mb-2 font-semibold">Developmental Editor</p>
              <p className="text-sm text-gray-500">Story structure & character development</p>
              <div className="mt-3">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  AVAILABLE NOW
                </span>
              </div>
            </div>

            {/* Sam */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sam</h3>
              <p className="text-gray-600 mb-2 font-semibold">Line Editor</p>
              <p className="text-sm text-gray-500">Prose polish & style refinement</p>
              <div className="mt-3">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                  AVAILABLE NOW
                </span>
              </div>
            </div>

            {/* Jordan */}
            <div className="text-center relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                🔍
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jordan</h3>
              <p className="text-gray-600 mb-2 font-semibold">Copy Editor</p>
              <p className="text-sm text-gray-500">Grammar & technical accuracy</p>
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  AVAILABLE NOW
                </span>
              </div>
            </div>

            {/* Taylor */}
            <div className="text-center relative opacity-90">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Taylor</h3>
              <p className="text-gray-600 mb-2 font-semibold">Publishing Specialist</p>
              <p className="text-sm text-gray-500">Format prep & launch strategy</p>
              <div className="mt-3">
                <span className="inline-block bg-teal-50 text-teal-600 text-xs font-bold px-3 py-1 rounded-full border border-teal-300">
                  COMING Q4 2025
                </span>
              </div>
            </div>

            {/* Quinn */}
            <div className="text-center relative opacity-90">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quinn</h3>
              <p className="text-gray-600 mb-2 font-semibold">Marketing Strategist</p>
              <p className="text-sm text-gray-500">Platform building & book promotion</p>
              <div className="mt-3">
                <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-300">
                  COMING Q4 2025
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/editors">
              <Button variant="outline" className="px-8 py-6">
                Meet the Full Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Writing?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join authors who are experiencing professional editing with AI. Three complete editing phases available now, with publishing and marketing coming soon.
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

            {/* Quick Links */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link href="/how-it-works" className="text-blue-200 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="/pricing" className="text-blue-200 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="/editors" className="text-blue-200 hover:text-white transition-colors">
                  Our Editors
                </Link>
                <Link href="/faq" className="text-blue-200 hover:text-white transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}