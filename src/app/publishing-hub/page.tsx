'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PublishingHubPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              📚 AuthorsLab.ai
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-900 font-medium">
                Dashboard
              </Link>
              <Link href="/author-studio" className="text-gray-700 hover:text-blue-900 font-medium">
                Writing Studio
              </Link>
              <Link href="/publishing-hub" className="text-blue-900 font-semibold border-b-2 border-blue-900">
                Publishing
              </Link>
              <Link href="/marketing-hub" className="text-gray-700 hover:text-blue-900 font-medium">
                Marketing
              </Link>
            </nav>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
              JS
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}></div>
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-4">Publishing Hub</h1>
            <p className="text-xl opacity-95 mb-8">
              Transform your polished manuscript into a professionally published book across multiple platforms
            </p>
            <div className="inline-flex items-center gap-3 bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-full font-semibold">
              📖 Ready for Publishing Phase
            </div>
          </div>
        </section>

        {/* Publishing Progress */}
        <section className="bg-white rounded-3xl p-12 mb-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Your Publishing Journey</h2>
            <p className="text-gray-600 text-lg">Track your progress from finished manuscript to published book</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Progress Line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gray-300"></div>

            {/* Step 1 */}
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                ✓
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manuscript Complete</h3>
              <p className="text-gray-600 text-sm">All 4 editing phases finished</p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg animate-pulse">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cover & Format</h3>
              <p className="text-gray-600 text-sm">Design and format for platforms</p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 text-gray-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Platform Setup</h3>
              <p className="text-gray-600 text-sm">Configure publishing accounts</p>
            </div>

            {/* Step 4 */}
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 text-gray-400 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Launch</h3>
              <p className="text-gray-600 text-sm">Publish and promote</p>
            </div>
          </div>
        </section>

        {/* Publishing Tools */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Publishing Tools</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cover Designer */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-500 hover:border-purple-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Cover Designer</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Generate professional book covers using AI based on your genre, themes, and preferences.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Available - 3 designs ready
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-all">
                  View Designs
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  New
                </button>
              </div>
            </div>

            {/* Formatting */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-500 hover:border-green-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                📖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Platform Formatting</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Automatically format your manuscript for Kindle, print, EPUB, and other formats.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                In Progress - 60% complete
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-all">
                  View Progress
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Preview
                </button>
              </div>
            </div>

            {/* Platform Publisher */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-500 hover:border-red-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Platform Publisher</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Direct integration with Amazon KDP, IngramSpark, and other platforms.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Pending - Awaiting cover & format
              </div>
              <div className="flex gap-2">
                <button disabled className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Guide
                </button>
              </div>
            </div>

            {/* Metadata Manager */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-yellow-500 hover:border-yellow-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                📝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Metadata Manager</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Optimize your book&apos;s title, description, keywords, and categories.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Ready for optimization
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-all">
                  Optimize Now
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Tips
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Publishing Platforms */}
        <section className="bg-white rounded-3xl p-12 mb-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Publishing Platforms</h2>
          <p className="text-gray-600 text-lg mb-8">Connect to major publishing platforms and manage your book distribution from one place.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Amazon KDP */}
            <div className="border-2 border-green-500 bg-green-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-[#ff9900] rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                A
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Amazon KDP</h3>
              <p className="text-green-600 font-semibold text-sm mb-4">✓ Connected & Configured</p>
              <button className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-all">
                Manage Account
              </button>
            </div>

            {/* IngramSpark */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-700 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                IS
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">IngramSpark</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Available for Setup</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Connect Account
              </button>
            </div>

            {/* Draft2Digital */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                D2D
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Draft2Digital</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Available for Setup</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Connect Account
              </button>
            </div>

            {/* Lulu */}
            <div className="border-2 border-yellow-500 bg-yellow-50 rounded-xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                LU
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lulu Publishing</h3>
              <p className="text-yellow-600 font-semibold text-sm mb-4">⏳ Available for Setup</p>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                Connect Account
              </button>
            </div>
          </div>
        </section>

        {/* Publishing Packages */}
        <section className="bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Publishing Packages</h2>
            <p className="text-gray-600 text-lg">Choose the right publishing package for your goals and budget</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* DIY Package */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">DIY Publishing</h3>
              <div className="text-5xl font-extrabold text-blue-900 mb-6">Free</div>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic formatting tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>1 cover design template</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Amazon KDP setup guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic metadata optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
              <button 
                onClick={() => setSelectedPackage('diy')}
                className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Professional Package */}
            <div className="border-4 border-yellow-400 rounded-2xl p-8 relative shadow-2xl transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-4">Professional Publishing</h3>
              <div className="text-5xl font-extrabold text-blue-900 mb-6">$299</div>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Professional formatting (all formats)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>3 custom AI-generated covers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Multi-platform setup & upload</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Advanced metadata optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>ISBN assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Marketing materials package</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <button 
                onClick={() => setSelectedPackage('professional')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                Choose Professional
              </button>
            </div>

            {/* Premium Package */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Publishing</h3>
              <div className="text-5xl font-extrabold text-blue-900 mb-6">$599</div>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Custom cover by human designer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Print & hardcover formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Advanced platform optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Book trailer creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>90-day marketing campaign</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Dedicated publishing manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>White-glove service</span>
                </li>
              </ul>
              <button 
                onClick={() => setSelectedPackage('premium')}
                className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all"
              >
                Choose Premium
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}