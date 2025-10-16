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
              📚 AuthorLab.ai
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
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-200/20 border-2 border-yellow-400 text-yellow-700 rounded-full text-sm font-bold">
              ✍️ Professional AI-Powered Writing Studio
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Write With Your
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              AI Partner
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of writing: get professional AI analysis that transforms how you see your manuscript, with insights that make your story stronger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all">
                Get Started Free
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
              <span>Real-time feedback</span>
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

      {/* How It Works - Quick Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Your Complete Writing Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Four collaborative phases that transform your manuscript from first draft to published book
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Phase 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Developmental</h3>
                <p className="text-gray-600 text-center text-sm mb-4">Story structure & character development</p>
                <div className="text-center">
                  <span className="text-2xl">🎯</span>
                  <p className="text-xs text-gray-500 mt-2">Meet Alex</p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Line Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-4">Prose polish & sentence flow</p>
                <div className="text-center">
                  <span className="text-2xl">✨</span>
                  <p className="text-xs text-gray-500 mt-2">Meet Sam</p>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-500">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Copy Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-4">Grammar & technical accuracy</p>
                <div className="text-center">
                  <span className="text-2xl">🔍</span>
                  <p className="text-xs text-gray-500 mt-2">Meet Jordan</p>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-yellow-500">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Publishing</h3>
                <p className="text-gray-600 text-center text-sm mb-4">Format & launch preparation</p>
                <div className="text-center">
                  <span className="text-2xl">🚀</span>
                  <p className="text-xs text-gray-500 mt-2">Your Book</p>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Writing Partner</h3>
              <p className="text-gray-700">
                Select any text and get instant feedback on dialogue, pacing, character development, and story structure as you write.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Context-Aware AI</h3>
              <p className="text-gray-700">
                AI understands your entire manuscript, character arcs, and plot threads to give relevant, story-specific advice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🛡️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h3>
              <p className="text-gray-700">
                Your manuscripts are protected with enterprise-grade security. Your creative work stays completely confidential.
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
              Start free or jump straight into your complete writing journey
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Analysis */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Analysis</h3>
                <div className="text-5xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600 mb-6">Professional AI feedback report</p>
                <Link href="/free-analysis">
                  <Button variant="outline" className="w-full py-6">
                    Get Free Analysis
                  </Button>
                </Link>
              </div>

              {/* Author Package */}
              <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-yellow-400 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 mt-4">Complete Package</h3>
                <div className="text-5xl font-bold text-white mb-4">$399</div>
                <p className="text-blue-100 mb-6">From first draft to published book</p>
                <Link href="/signup">
                  <Button className="w-full py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600">
                    Start Your Journey
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

      {/* Meet the Editors Preview */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Meet Your AI Editorial Team
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Three specialists, each expert in their craft
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alex</h3>
              <p className="text-gray-600 mb-2">Developmental Editor</p>
              <p className="text-sm text-gray-500">Story structure & character development</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                ✨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sam</h3>
              <p className="text-gray-600 mb-2">Line Editor</p>
              <p className="text-sm text-gray-500">Prose polish & style refinement</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                🔍
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jordan</h3>
              <p className="text-gray-600 mb-2">Copy Editor</p>
              <p className="text-sm text-gray-500">Grammar & technical accuracy</p>
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
              Join the future of collaborative writing. Experience what it&apos;s like to have a professional editor, writing coach, and creative partner available 24/7.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/free-analysis">
                <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Get Free Analysis
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-lg px-8 py-6">
                  Start Complete Journey - $399
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