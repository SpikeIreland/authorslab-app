'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MarketingHubDemoContent() {
    const [pricingPeriod, setPricingPeriod] = useState<'monthly' | 'annual'>('monthly')
    const searchParams = useSearchParams()
    const manuscriptId = searchParams.get('manuscriptId')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sales Demo Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-6">
                <div className="container mx-auto flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🎬</span>
                        <span className="font-semibold">Sales Demo Mode</span>
                        <span className="text-purple-200 hidden sm:inline">—</span>
                        <span className="text-purple-100 hidden sm:inline">Preview of upcoming Marketing Hub features</span>
                    </div>
                    <Link
                        href={manuscriptId ? `/marketing-hub?manuscriptId=${manuscriptId}` : '/marketing-hub'}
                        className="px-4 py-1.5 bg-white text-purple-700 rounded-full text-sm font-bold hover:bg-purple-50 transition-colors"
                    >
                        ← Back to Marketing Hub
                    </Link>
                </div>
            </div>

            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                            📚 AuthorsLab.ai
                        </Link>
                        <nav className="hidden md:flex items-center gap-8">
                            <span className="text-gray-400 font-medium cursor-not-allowed">
                                Dashboard
                            </span>
                            <span className="text-gray-400 font-medium cursor-not-allowed">
                                Writing Studio
                            </span>
                            <span className="text-gray-400 font-medium cursor-not-allowed">
                                Publishing
                            </span>
                            <span className="text-purple-700 font-semibold border-b-2 border-purple-700">
                                Marketing
                            </span>
                        </nav>
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                                DEMO MODE
                            </span>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-semibold">
                                S
                            </div>
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
                        <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
                            🚀 Phase 5: Quinn&apos;s Domain
                        </div>
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
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 font-medium">SAMPLE METRICS - WHAT AUTHORS CAN TRACK</p>
                    </div>
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
                                    <span>Newsletter templates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600">→</span>
                                    <span>Subscriber management</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600">→</span>
                                    <span>Automated sequences</span>
                                </li>
                            </ul>
                            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-4">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Setup Required
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                                    Create Campaign
                                </button>
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                                    Templates
                                </button>
                            </div>
                        </div>

                        {/* Content Studio */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-600 hover:border-purple-700 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🎨
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Content Studio</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Create stunning promotional graphics, videos, and marketing materials.
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
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-500 hover:border-orange-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
                            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                                🎯
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Paid Advertising</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Targeted campaigns on Amazon, Facebook, Instagram, and Google.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-700 mb-6">
                                <li className="flex items-start gap-2">
                                    <span className="text-purple-600">→</span>
                                    <span>Amazon Ads management</span>
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
                                    Launch Campaign
                                </button>
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Book Reviews */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-500 hover:border-amber-600 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2">
                            <div className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center text-3xl mb-6">
                                ⭐
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Review Network</h3>
                            <p className="text-gray-600 mb-4 text-sm">
                                Connect with book bloggers, reviewers, and build social proof.
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
                            <div className="text-4xl mb-4">📧</div>
                            <h3 className="font-bold text-gray-900 mb-2">Email Sequence</h3>
                            <p className="text-sm text-gray-600 mb-4">Nurture your subscriber list</p>
                            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                7-email sequence
                            </div>
                        </div>

                        <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
                            <div className="text-4xl mb-4">🎉</div>
                            <h3 className="font-bold text-gray-900 mb-2">Promo Blitz</h3>
                            <p className="text-sm text-gray-600 mb-4">Maximum visibility push</p>
                            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                3-day intensive
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="mb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Marketing Packages</h2>
                        <p className="text-xl text-gray-600 mb-6">Choose the right marketing power for your book</p>

                        {/* Pricing Toggle */}
                        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
                            <button
                                onClick={() => setPricingPeriod('monthly')}
                                className={`px-6 py-2 rounded-full font-semibold transition-all ${pricingPeriod === 'monthly'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-700 hover:text-purple-600'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPricingPeriod('annual')}
                                className={`px-6 py-2 rounded-full font-semibold transition-all ${pricingPeriod === 'annual'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-700 hover:text-purple-600'
                                    }`}
                            >
                                Annual <span className="text-green-500 text-sm ml-1">Save 20%</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
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
                                    <span>Everything in Starter</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>All social platforms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Advanced content studio</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Email marketing (10,000 subscribers)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Amazon Ads integration</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-1">✓</span>
                                    <span>Review network access</span>
                                </li>
                            </ul>
                            <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
                                Start Free Trial
                            </button>
                        </div>

                        {/* Premium */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all">
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

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white text-center">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-5xl mb-6">🚀</div>
                        <h2 className="text-3xl font-bold mb-4">Ready to Market Your Book?</h2>
                        <p className="text-orange-100 text-lg mb-8">
                            Quinn is being built to help you create compelling marketing materials,
                            reach your target readers, and launch your book successfully.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={manuscriptId ? `/marketing-hub?manuscriptId=${manuscriptId}` : '/marketing-hub'}
                                className="px-8 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
                            >
                                ← Back to Marketing Hub
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-8 py-4 bg-orange-700 text-white font-bold rounded-xl hover:bg-orange-800 transition-colors border-2 border-orange-400"
                            >
                                View All Packages
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-12">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-400">
                        📚 AuthorsLab.ai — This is a preview of upcoming Marketing Hub features
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default function MarketingHubDemo() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading demo...</p>
                </div>
            </div>
        }>
            <MarketingHubDemoContent />
        </Suspense>
    )
}