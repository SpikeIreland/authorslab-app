import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-yellow-400/20 border-2 border-yellow-400 text-yellow-300 rounded-full text-sm font-bold">
              ✍️ Professional Writing Studio
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Write With Your
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              AI Partner
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of writing: get professional AI analysis that transforms how you see your manuscript, with insights that make your story stronger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup">
              <Button className="text-lg px-8 py-6 shadow-2xl">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-blue-200">
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Real-time feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Professional quality</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Your work stays private</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Everything You Need to Write Better
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                ✍️
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-Time Writing Partner</h3>
              <p className="text-blue-200">
                Select any text and get instant feedback on dialogue, pacing, character development, and story structure as you write.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Context-Aware AI</h3>
              <p className="text-blue-200">
                AI understands your entire manuscript, character arcs, and plot threads to give relevant, story-specific advice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🛡️
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure & Private</h3>
              <p className="text-blue-200">
                Your manuscripts are protected with enterprise-grade security. Your creative work stays completely confidential.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Writing?
          </h2>
          <p className="text-xl text-blue-200 mb-8">
            Join the future of collaborative writing. Start your journey today.
          </p>
          <Link href="/signup">
            <Button className="text-lg px-8 py-6 shadow-2xl">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}