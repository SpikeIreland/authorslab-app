'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MarketingHubPage() {
  const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annual'>('monthly')

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
              <Link href="/publishing-hub" className="text-gray-700 hover:text-blue-900 font-medium">
                Publishing
              </Link>
              <Link href="/marketing-hub" className="text-blue-900 font-semibold border-b-2 border-blue-900">
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
        <section className="bg-gradient-to-br from-purple-700 to-purple-600 text-white rounded-3xl p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)',
            }}></div>
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold mb-4">Marketing Hub</h1>
            <p className="text-xl opacity-95 mb-8">
              Reach your perfect readers with AI-powered marketing tools and targeted audience campaigns
            </p>
            <div className="inline-flex items-center gap-3 bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded-full font-semibold">
              🎯 Ready for Launch Marketing
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="bg-white rounded-3xl p-8 mb-12 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl font-extrabold text-purple-600 mb-2">12.4K</div>
              <div className="text-gray-600 font-medium">Total Reach</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl font-extrabold text-green-600 mb-2">8.7%</div>
              <div className="text-gray-600 font-medium">Engagement Rate</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl font-extrabold text-red-600 mb-2">3.2%</div>
              <div className="text-gray-600 font-medium">Conversion Rate</div>
            </div>
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl font-extrabold text-yellow-600 mb-2">284%</div>
              <div className="text-gray-600 font-medium">Marketing ROI</div>
            </div>
          </div>
        </section>

        {/* Marketing Tools */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Marketing Tools & Services</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Social Media */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#1da1f2] hover:border-[#0d8bd9] hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#1da1f2] rounded-xl flex items-center justify-center text-3xl mb-6">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Social Media Manager</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Automated posting, content scheduling, and audience engagement across all major platforms.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Multi-platform scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>AI-generated content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Hashtag optimization</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active - 3 platforms connected
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  Manage Posts
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Analytics
                </button>
              </div>
            </div>

            {/* Email Marketing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#ea4335] hover:border-[#d62516] hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#ea4335] rounded-xl flex items-center justify-center text-3xl mb-6">
                📧
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Marketing</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Build your author platform with targeted email campaigns and newsletters.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Automated drip campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Reader list segmentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Book launch sequences</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Setup Required
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  Setup Campaign
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Templates
                </button>
              </div>
            </div>

            {/* Content Creation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#fbbc04] hover:border-[#ea9a00] hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#fbbc04] rounded-xl flex items-center justify-center text-3xl mb-6">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Content Creation Studio</h3>
              <p className="text-gray-600 mb-4 text-sm">
                AI-powered content generation for book promotion and marketing materials.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Book quote graphics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Video trailers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Social media templates</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Ready to Create
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  Create Content
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Gallery
                </button>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#34a853] hover:border-[#2d9246] hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#34a853] rounded-xl flex items-center justify-center text-3xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marketing Analytics</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Track performance across all channels with detailed insights.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Cross-platform analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>ROI tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Audience insights</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Collecting Data
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  View Reports
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Export
                </button>
              </div>
            </div>

            {/* Advertising */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-600 hover:border-purple-700 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Paid Advertising</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Targeted campaigns on Amazon, Facebook, Instagram, and Google.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Amazon AMS campaigns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Facebook/Instagram ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Budget optimization</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Premium Feature
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  Start Campaign
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Learn More
                </button>
              </div>
            </div>

            {/* Influencer Network */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-500 hover:border-pink-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
              <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                👥
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Influencer Network</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Connect with book reviewers, bloggers, and influencers in your genre.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Reviewer matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Blogger outreach</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">→</span>
                  <span>Review management</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Premium Feature
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                  Find Reviewers
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  Network
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Templates */}
        <section className="bg-white rounded-3xl p-12 mb-12 shadow-lg">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Quick Campaign Builder</h2>
              <p className="text-gray-600">Launch professional marketing campaigns in minutes</p>
            </div>
            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center gap-2">
              ⚡ Create Custom Campaign
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-bold text-gray-900 mb-2">Book Launch Campaign</h3>
              <p className="text-sm text-gray-600 mb-4">Complete 30-day launch sequence</p>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                30-day campaign
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-bold text-gray-900 mb-2">Review Generation</h3>
              <p className="text-sm text-gray-600 mb-4">Build social proof with reviews</p>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                2-week campaign
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-4">📲</div>
              <h3 className="font-bold text-gray-900 mb-2">Social Media Blitz</h3>
              <p className="text-sm text-gray-600 mb-4">High-impact social campaign</p>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                7-day intensive
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">Amazon Optimization</h3>
              <p className="text-sm text-gray-600 mb-4">Boost your Amazon ranking</p>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                Ongoing optimization
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-3xl p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Marketing Packages</h2>
            <p className="text-gray-600 text-lg mb-8">Choose the right marketing package to reach your ideal readers</p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setPricingPeriod('monthly')}
                className={`px-6 py-2 border-2 rounded-lg font-semibold transition-all ${
                  pricingPeriod === 'monthly'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingPeriod('annual')}
                className={`px-6 py-2 border-2 rounded-lg font-semibold transition-all ${
                  pricingPeriod === 'annual'
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                }`}
              >
                Annual
                <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter Marketing</h3>
              <div className="text-5xl font-extrabold text-purple-600 mb-2">
                ${pricingPeriod === 'monthly' ? '49' : '39'}
              </div>
              <p className="text-gray-600 mb-8">
                {pricingPeriod === 'monthly' ? 'per month' : 'per month (billed annually)'}
              </p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Social media scheduling (2 platforms)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic content generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Email marketing (1,000 subscribers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic analytics dashboard</span>
                </li>
              </ul>
              <button className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all">
                Start Free Trial
              </button>
            </div>

            {/* Professional */}
            <div className="border-4 border-purple-600 rounded-2xl p-8 relative shadow-2xl transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-4">Professional Marketing</h3>
              <div className="text-5xl font-extrabold text-purple-600 mb-2">
                ${pricingPeriod === 'monthly' ? '149' : '119'}
              </div>
              <p className="text-gray-600 mb-8">
                {pricingPeriod === 'monthly' ? 'per month' : 'per month (billed annually)'}
              </p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Multi-platform social media</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Advanced AI content creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Email marketing (10,000 subscribers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Detailed analytics & ROI tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Unlimited campaign templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Basic paid advertising</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all">
                Choose Professional
              </button>
            </div>

            {/* Premium */}
            <div className="border-2 border-gray-300 rounded-2xl p-8 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Marketing</h3>
              <div className="text-5xl font-extrabold text-purple-600 mb-2">
                ${pricingPeriod === 'monthly' ? '299' : '239'}
              </div>
              <p className="text-gray-600 mb-8">
                {pricingPeriod === 'monthly' ? 'per month' : 'per month (billed annually)'}
              </p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Full-service paid advertising</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Influencer network access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Custom campaign development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Dedicated marketing manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Monthly strategy calls</span>
                </li>
              </ul>
              <button className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all">
                Choose Premium
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}