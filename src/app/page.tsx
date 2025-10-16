import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-width-5xl mx-auto">
            {/* Badge */}
            <div className="mb-8 text-center">
              <span className="inline-block rounded-full border-2 border-yellow-400 bg-yellow-400/20 px-6 py-2 text-sm font-bold text-yellow-300">
                ✨ AI-Powered Author Services
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-center text-5xl font-extrabold leading-tight text-white md:text-7xl">
              Transform Your Manuscript with
              <span className="mt-2 block bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                Professional AI Editors
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-3xl text-center text-xl leading-relaxed text-blue-100 md:text-2xl">
              Meet Alex, Sam, and Jordan - your AI editing team who work together to transform your manuscript through developmental editing, line polishing, and final copyediting.
            </p>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/free-analysis">
                <Button className="px-8 py-6 text-lg shadow-2xl">
                  Get Free Manuscript Analysis
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" className="border-white/30 bg-white/10 px-8 py-6 text-lg text-white hover:bg-white/20">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>4-Phase Editing Process</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <span>3 AI Editing Specialists</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>100% Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple 3 Steps */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mb-16 text-xl text-gray-600">
              From manuscript to published book in three simple steps
            </p>

            <div className="grid gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-bold text-white shadow-lg mx-auto">
                  1
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Upload Your Manuscript
                </h3>
                <p className="text-gray-600">
                  Submit your manuscript and get a free AI analysis within minutes. See exactly what Alex, Sam, and Jordan can do for your story.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-3xl font-bold text-white shadow-lg mx-auto">
                  2
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Work With Your AI Team
                </h3>
                <p className="text-gray-600">
                  Alex strengthens your story structure, Sam polishes your prose, and Jordan ensures technical perfection through our 4-phase process.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-3xl font-bold text-white shadow-lg mx-auto">
                  3
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  Publish Your Book
                </h3>
                <p className="text-gray-600">
                  Get your manuscript publication-ready with formatting, cover design guidance, and launch strategy - all included in our complete package.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your AI Editing Team */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Meet Your AI Editing Team
              </h2>
              <p className="text-xl text-gray-600">
                Three specialized AI editors, each with their own personality and expertise
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Alex */}
              <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-5xl mx-auto">
                  ✨
                </div>
                <h3 className="mb-2 text-center text-2xl font-bold text-gray-900">
                  Alex
                </h3>
                <p className="mb-4 text-center font-semibold text-green-600">
                  The Creative Catalyst
                </p>
                <p className="mb-4 text-center text-gray-600">
                  Developmental Editor
                </p>
                <p className="mb-6 text-gray-700">
                  Alex is enthusiastic and emotionally intelligent, helping you strengthen story structure, character arcs, and thematic depth. Loves celebrating creative breakthroughs!
                </p>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm italic text-green-800">
                    &quot;I love how your protagonist evolves here! This emotional beat is powerful.&quot;
                  </p>
                </div>
              </div>

              {/* Sam */}
              <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-5xl mx-auto">
                  ✏️
                </div>
                <h3 className="mb-2 text-center text-2xl font-bold text-gray-900">
                  Sam
                </h3>
                <p className="mb-4 text-center font-semibold text-purple-600">
                  The Precision Perfectionist
                </p>
                <p className="mb-4 text-center text-gray-600">
                  Line Editor
                </p>
                <p className="mb-6 text-gray-700">
                  Sam is thoughtful and meticulous, refining prose flow, sentence structure, and readability. Ensures every word serves your story with precision and clarity.
                </p>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="text-sm italic text-purple-800">
                    &quot;This sentence could flow more smoothly. What if we restructured it like this?&quot;
                  </p>
                </div>
              </div>

              {/* Jordan */}
              <div className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-5xl mx-auto">
                  🔍
                </div>
                <h3 className="mb-2 text-center text-2xl font-bold text-gray-900">
                  Jordan
                </h3>
                <p className="mb-4 text-center font-semibold text-blue-600">
                  The Detail Guardian
                </p>
                <p className="mb-4 text-center text-gray-600">
                  Copy Editor
                </p>
                <p className="mb-6 text-gray-700">
                  Jordan is sharp-eyed and systematic, catching grammar, consistency issues, and technical errors. Nothing escapes their attention to detail!
                </p>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm italic text-blue-800">
                    &quot;I&apos;ve spotted a few consistency issues we should address in chapter three.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/meet-the-team">
                <Button variant="outline" className="px-8 py-4">
                  Learn More About Your AI Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Phase Journey */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                The Complete 4-Phase Journey
              </h2>
              <p className="text-xl text-gray-600">
                From raw manuscript to published book - all in one complete package
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Phase 1 */}
              <div className="rounded-2xl border-l-8 border-green-500 bg-gradient-to-br from-green-50 to-white p-8 shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Developmental Editing
                    </h3>
                    <p className="text-green-600 font-semibold">With Alex</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  Strengthen story structure, character development, plot coherence, and thematic depth.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Story structure analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Character arc development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Plot coherence & pacing</span>
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="rounded-2xl border-l-8 border-purple-500 bg-gradient-to-br from-purple-50 to-white p-8 shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-2xl font-bold text-white">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Line Editing
                    </h3>
                    <p className="text-purple-600 font-semibold">With Sam</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  Polish prose, refine sentence structure, and enhance readability throughout your manuscript.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Prose flow optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Sentence clarity & structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Style consistency</span>
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="rounded-2xl border-l-8 border-blue-500 bg-gradient-to-br from-blue-50 to-white p-8 shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Copy Editing
                    </h3>
                    <p className="text-blue-600 font-semibold">With Jordan</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  Perfect grammar, punctuation, consistency, and technical accuracy for publication.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Grammar & punctuation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Consistency checking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Technical accuracy</span>
                  </li>
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="rounded-2xl border-l-8 border-yellow-500 bg-gradient-to-br from-yellow-50 to-white p-8 shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-white">
                    4
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Publishing Prep
                    </h3>
                    <p className="text-yellow-600 font-semibold">Complete Team</p>
                  </div>
                </div>
                <p className="mb-4 text-gray-700">
                  Format for publication, design guidance, and launch strategy to get your book into readers&apos; hands.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">✓</span>
                    <span>Professional formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">✓</span>
                    <span>Cover design guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">✓</span>
                    <span>Launch strategy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600">
                Start with a free analysis, then choose the package that fits your goals
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Free Analysis */}
              <div className="rounded-2xl bg-white p-8 shadow-lg border-2 border-gray-200">
                <div className="mb-4">
                  <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                    Try It Free
                  </span>
                </div>
                <h3 className="mb-2 text-3xl font-bold text-gray-900">
                  Free Analysis
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                </div>
                <p className="mb-6 text-gray-600">
                  Get a comprehensive AI analysis of your manuscript to see what Alex, Sam, and Jordan can do for your story.
                </p>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span className="text-gray-700">Complete manuscript analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span className="text-gray-700">Developmental insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span className="text-gray-700">Detailed PDF report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span className="text-gray-700">No credit card required</span>
                  </li>
                </ul>
                <Link href="/free-analysis">
                  <Button variant="outline" className="w-full py-6 text-lg">
                    Get Free Analysis
                  </Button>
                </Link>
              </div>

              {/* Complete Package */}
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-2xl text-white">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-6 py-2 text-sm font-bold text-gray-900">
                  ⭐ Most Popular
                </div>
                <div className="mb-4">
                  <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold">
                    Complete Package
                  </span>
                </div>
                <h3 className="mb-2 text-3xl font-bold">
                  Author Studio
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">$399</span>
                  <span className="ml-2 text-lg opacity-90">one-time</span>
                </div>
                <p className="mb-6 opacity-95">
                  Complete 4-phase editing journey from raw manuscript to published book with Alex, Sam, and Jordan.
                </p>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>All 4 editing phases included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>Work with Alex, Sam & Jordan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>Interactive editing workspace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>Publishing preparation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>Launch strategy guidance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-300">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-yellow-400 py-6 text-lg text-gray-900 hover:bg-yellow-300">
                    Start Your Journey
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/pricing" className="text-blue-600 hover:underline font-semibold">
                View detailed pricing breakdown →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                What Authors Are Saying
              </h2>
              <p className="text-xl text-gray-600">
                Join hundreds of authors who&apos;ve transformed their manuscripts
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="rounded-2xl bg-gray-50 p-8 shadow-lg">
                <div className="mb-4 flex gap-1 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="mb-6 text-gray-700 italic">
                  &quot;Alex helped me see plot holes I didn&apos;t even know existed. The developmental editing phase completely transformed my story structure.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah K.</p>
                    <p className="text-sm text-gray-600">Fantasy Author</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="rounded-2xl bg-gray-50 p-8 shadow-lg">
                <div className="mb-4 flex gap-1 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="mb-6 text-gray-700 italic">
                  &quot;Sam&apos;s line editing was incredible. Every sentence flows better now. The precision and attention to prose quality is exactly what I needed.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center text-xl font-bold text-purple-700">
                    MT
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael T.</p>
                    <p className="text-sm text-gray-600">Literary Fiction</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="rounded-2xl bg-gray-50 p-8 shadow-lg">
                <div className="mb-4 flex gap-1 text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
                <p className="mb-6 text-gray-700 italic">
                  &quot;Jordan caught so many consistency issues I would have missed. Having all three editors work on my manuscript was worth every penny.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-700">
                    JL
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jennifer L.</p>
                    <p className="text-sm text-gray-600">Mystery Thriller</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  How is this different from traditional editing services?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  Traditional editing services provide static reports. With AuthorLab.ai, you work interactively with Alex, Sam, and Jordan through our editing workspace. Make changes in real-time, ask questions, and get immediate feedback throughout the entire process.
                </p>
              </details>

              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  How long does the complete process take?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  The timeline depends on your manuscript length and how quickly you implement feedback. Most authors complete all 4 phases in 4-8 weeks. You control the pace - work as fast or as slow as you need.
                </p>
              </details>

              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  What makes Alex, Sam, and Jordan different?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  Each AI editor has distinct expertise and personality. Alex focuses on creative story development, Sam refines prose and flow, and Jordan ensures technical perfection. Working with all three gives you comprehensive editing coverage.
                </p>
              </details>

              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  Is my manuscript kept confidential?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  Absolutely. Your manuscript is 100% confidential and secure. We use enterprise-grade encryption, and your work is never shared or used for any purpose other than providing you with editing services.
                </p>
              </details>

              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  What if I&apos;m not satisfied?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  We offer a 30-day satisfaction guarantee. If you&apos;re not happy with the quality of editing in the first phase, we&apos;ll refund your investment. Try our free analysis first to see the quality of AI feedback.
                </p>
              </details>

              <details className="group rounded-xl bg-white p-6 shadow-lg">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 list-none flex justify-between items-center">
                  Do you offer payment plans?
                  <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-700">
                  Currently, the $399 Author Studio package is a one-time payment. We&apos;re working on payment plan options - contact us if you&apos;d like to be notified when they&apos;re available.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Ready to Transform Your Manuscript?
            </h2>
            <p className="mb-10 text-xl opacity-95">
              Start with a free analysis or dive straight into the complete editing journey with Alex, Sam, and Jordan.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/free-analysis">
                <Button className="px-8 py-6 text-lg shadow-2xl">
                  Get Free Analysis
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="border-white/30 bg-white/10 px-8 py-6 text-lg text-white hover:bg-white/20">
                  Start Full Journey - $399
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}