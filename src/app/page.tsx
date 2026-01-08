import Link from 'next/link'
import Image from 'next/image'
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
            <Link href="/signup" className="md:hidden">
              <Button className="text-sm px-4 py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Two Column */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-gradient-to-r from-green-400/20 to-blue-400/20 border-2 border-green-400 text-green-700 rounded-full text-sm font-bold">
                  ✨ Professional AI Editing Now Available
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                From Raw Manuscript to
                <span className="block bg-gradient-to-r from-green-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Published Book
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Your AI editorial team guides you through every step: developmental editing, line editing, copy editing, publishing prep, and marketing strategy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/signup">
                  <Button className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all w-full sm:w-auto">
                    Start Your Journey - $299
                  </Button>
                </Link>
                <Link href="/free-analysis">
                  <Button variant="outline" className="text-lg px-8 py-6 border-2 w-full sm:w-auto">
                    Get Free Analysis
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>5 expert AI editors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Days, not months</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>You keep all rights</span>
                </div>
              </div>
            </div>

            {/* Right Column - Book Mockup */}
            <div className="relative flex justify-center">
              <div className="relative">
                <Image
                  src="/images/book-mockup.png"
                  alt="Your professionally edited and published book"
                  width={500}
                  height={600}
                  className="drop-shadow-2xl"
                  priority
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">This could be YOUR book</p>
                  <p className="text-xs text-gray-500">Edited, formatted & ready to publish</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Result Section */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The Result: A Professionally Published Book
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Your creativity. AI precision. A finished book you&apos;re proud of.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-white mb-2">Professionally Edited</h3>
                <p className="text-blue-100">Three phases of expert editing: developmental, line, and copy editing</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-white mb-2">Publication Ready</h3>
                <p className="text-blue-100">Custom cover design, interior formatting, and all front/back matter</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">Launch Strategy</h3>
                <p className="text-blue-100">Marketing plan, book description, and platform strategy</p>
              </div>
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
                Your Complete Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Five specialized AI editors, each expert in their phase
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Phase 1 - Alex */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green-500 relative">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PHASE 1
                </div>
                <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                  👔
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Developmental</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Story structure & character arcs</p>
                <div className="text-center">
                  <p className="text-xs text-green-600 font-semibold">Alex</p>
                </div>
              </div>

              {/* Phase 2 - Sam */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500 relative">
                <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PHASE 2
                </div>
                <div className="w-14 h-14 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                  ✨
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Line Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Prose polish & sentence flow</p>
                <div className="text-center">
                  <p className="text-xs text-purple-600 font-semibold">Sam</p>
                </div>
              </div>

              {/* Phase 3 - Jordan */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500 relative">
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PHASE 3
                </div>
                <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Copy Editing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Grammar & technical perfection</p>
                <div className="text-center">
                  <p className="text-xs text-blue-600 font-semibold">Jordan</p>
                </div>
              </div>

              {/* Phase 4 - Taylor */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-teal-500 relative">
                <div className="absolute -top-3 -right-3 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PHASE 4
                </div>
                <div className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                  📚
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Publishing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Cover, format & launch prep</p>
                <div className="text-center">
                  <p className="text-xs text-teal-600 font-semibold">Taylor</p>
                </div>
              </div>

              {/* Phase 5 - Quinn */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-orange-500 relative">
                <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  PHASE 5
                </div>
                <div className="w-14 h-14 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 mx-auto">
                  🚀
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Marketing</h3>
                <p className="text-gray-600 text-center text-sm mb-3">Strategy & promotion</p>
                <div className="text-center">
                  <p className="text-xs text-orange-600 font-semibold">Quinn</p>
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

      {/* The Experience - Author Studio Screenshot */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Experience: Your Author Studio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Work directly with your AI editors in a collaborative workspace designed for authors
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 shadow-2xl">
              <Image
                src="/images/studio-screenshot.png"
                alt="AuthorsLab Author Studio - Chat interface with AI editor"
                width={1200}
                height={700}
                className="rounded-xl shadow-lg"
              />
            </div>

            {/* Callout badges */}
            <div className="absolute top-8 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-200 hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">💬 Real-time conversation</p>
              <p className="text-xs text-gray-500">Chat naturally with your editor</p>
            </div>

            <div className="absolute top-1/3 -right-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-200 hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">📝 Context-aware feedback</p>
              <p className="text-xs text-gray-500">Editors know your whole manuscript</p>
            </div>

            <div className="absolute bottom-8 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-200 hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">📊 Chapter-by-chapter editing</p>
              <p className="text-xs text-gray-500">Systematic, thorough process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Testimonial */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              What Authors Are Saying
            </h2>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100">
              <div className="text-5xl mb-6">&ldquo;</div>
              <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                As a published author, I was skeptical that AI could provide meaningful editorial feedback. AuthorsLab proved me wrong. The editors understand story structure, character development, and prose style at a level I didn&apos;t think was possible. It&apos;s like having a professional editorial team available 24/7.
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                  CL
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Carl Lyons</p>
                  <p className="text-gray-600">Published Author & AuthorsLab Co-founder</p>
                </div>
              </div>
            </div>

            {/* Future testimonials placeholder */}
            <p className="text-gray-500 mt-8 text-sm">
              More author stories coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Professional editing that doesn&apos;t cost thousands
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Analysis */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Analysis</h3>
              <div className="text-5xl font-bold text-gray-900 mb-4">$0</div>
              <p className="text-gray-600 mb-6">See what your manuscript needs</p>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Full manuscript analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Developmental insights</span>
                </li>
                <li className="flex items-start gap-3">
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

            {/* Complete Journey */}
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-blue-400 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                  COMPLETE JOURNEY
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 mt-4">Full Editorial Package</h3>
              <div className="text-5xl font-bold text-white mb-4">$299</div>
              <p className="text-blue-100 mb-6">All five phases included</p>
              <ul className="text-left space-y-3 mb-8 text-blue-100">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Developmental editing with Alex</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Line editing with Sam</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Copy editing with Jordan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Publishing prep with Taylor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Marketing strategy with Quinn</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-gray-600">
            <p>Traditional editing costs $2,000 - $10,000+. AuthorsLab: <strong>$299</strong>.</p>
          </div>

          <div className="mt-6">
            <Link href="/pricing" className="text-blue-600 hover:underline font-semibold text-lg">
              See Full Pricing Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Meet Your Editorial Team */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Meet Your AI Editorial Team
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Five specialists, each expert in their craft
            </p>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Alex */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                  👔
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Alex</h3>
                <p className="text-green-600 font-semibold text-sm mb-2">Developmental Editor</p>
                <p className="text-sm text-gray-500">Story structure & character development</p>
              </div>

              {/* Sam */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Sam</h3>
                <p className="text-purple-600 font-semibold text-sm mb-2">Line Editor</p>
                <p className="text-sm text-gray-500">Prose polish & style refinement</p>
              </div>

              {/* Jordan */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Jordan</h3>
                <p className="text-blue-600 font-semibold text-sm mb-2">Copy Editor</p>
                <p className="text-sm text-gray-500">Grammar & technical accuracy</p>
              </div>

              {/* Taylor */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                  📚
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Taylor</h3>
                <p className="text-teal-600 font-semibold text-sm mb-2">Publishing Specialist</p>
                <p className="text-sm text-gray-500">Cover design & formatting</p>
              </div>

              {/* Quinn */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                  🚀
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Quinn</h3>
                <p className="text-orange-600 font-semibold text-sm mb-2">Marketing Strategist</p>
                <p className="text-sm text-gray-500">Launch strategy & promotion</p>
              </div>
            </div>

            <div className="mt-12">
              <Link href="/editors">
                <Button variant="outline" className="px-8 py-6">
                  Learn More About Each Editor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section - Placeholder for Carl's Story */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            See How It Works
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Watch Carl&apos;s journey from manuscript to published author
          </p>

          {/* Video Placeholder */}
          <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div>
            <div className="relative text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
              </div>
              <p className="text-white font-semibold">Video Coming Soon</p>
              <p className="text-blue-200 text-sm">Carl&apos;s Author Story</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your Story Deserves to Be Told
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Professional editing shouldn&apos;t cost $5,000 or take 6 months. Start your journey today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/free-analysis">
                <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Get Free Analysis
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-lg px-8 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-gray-900 hover:from-green-500 hover:to-blue-500 font-bold">
                  Start Your Journey - $299
                </Button>
              </Link>
            </div>

            {/* Footer Links */}
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