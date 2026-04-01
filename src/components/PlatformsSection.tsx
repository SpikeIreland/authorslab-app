// ============================================
// Platforms Section Component
// Shows publishing platform connection cards
// ============================================

'use client'

import { useState } from 'react'

interface PublishingProgress {
  platforms?: string[]
  // Add other fields as needed
}

interface PlatformsSectionProps {
  publishingProgress: PublishingProgress | null
  manuscriptTitle?: string
}

// Platform configuration with branding
const PLATFORM_CONFIG: Record<string, {
  name: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  description: string
  features: string[]
  setupTime: string
  cost: string
  link: string
}> = {
  'amazon-kdp': {
    name: 'Amazon KDP',
    icon: 'A',
    color: 'text-white',
    bgColor: 'bg-[#ff9900]',
    borderColor: 'border-[#ff9900]',
    description: 'Reach millions of readers on the world\'s largest bookstore',
    features: ['Kindle eBooks', 'Print-on-Demand', 'Kindle Unlimited'],
    setupTime: '~30 mins',
    cost: 'Free',
    link: 'https://kdp.amazon.com'
  },
  'ingramspark': {
    name: 'IngramSpark',
    icon: 'IS',
    color: 'text-white',
    bgColor: 'bg-blue-700',
    borderColor: 'border-blue-700',
    description: 'Professional distribution to bookstores and libraries worldwide',
    features: ['40,000+ Retailers', 'Library Distribution', 'Premium Print Quality'],
    setupTime: '~45 mins',
    cost: '$49 setup',
    link: 'https://www.ingramspark.com'
  },
  'lulu': {
    name: 'Lulu',
    icon: 'LU',
    color: 'text-white',
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-600',
    description: 'Simple self-publishing with global distribution options',
    features: ['Print & eBooks', 'Global Distribution', 'No Upfront Costs'],
    setupTime: '~20 mins',
    cost: 'Free',
    link: 'https://www.lulu.com'
  },
  'draft2digital': {
    name: 'Draft2Digital',
    icon: 'D2D',
    color: 'text-white',
    bgColor: 'bg-green-600',
    borderColor: 'border-green-600',
    description: 'Easy distribution to multiple retailers from one dashboard',
    features: ['Apple Books', 'Kobo', 'Barnes & Noble', '+ More'],
    setupTime: '~25 mins',
    cost: 'Free',
    link: 'https://www.draft2digital.com'
  },
  'apple-books': {
    name: 'Apple Books',
    icon: '🍎',
    color: 'text-white',
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-800',
    description: 'Reach Apple device users through Apple\'s bookstore',
    features: ['iOS & macOS', 'High Royalties', 'Clean Interface'],
    setupTime: '~30 mins',
    cost: 'Free',
    link: 'https://authors.apple.com'
  },
  'google-play': {
    name: 'Google Play Books',
    icon: 'G',
    color: 'text-white',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    description: 'Distribute through Google\'s massive ecosystem',
    features: ['Android Users', 'Google Search Discovery', 'Web Reader'],
    setupTime: '~20 mins',
    cost: 'Free',
    link: 'https://play.google.com/books/publish'
  },
  'barnes-noble': {
    name: 'Barnes & Noble Press',
    icon: 'B&N',
    color: 'text-white',
    bgColor: 'bg-green-800',
    borderColor: 'border-green-800',
    description: 'America\'s largest retail bookseller',
    features: ['Nook eBooks', 'Print Books', 'In-Store Potential'],
    setupTime: '~30 mins',
    cost: 'Free',
    link: 'https://press.barnesandnoble.com'
  },
  'kobo': {
    name: 'Kobo Writing Life',
    icon: 'K',
    color: 'text-white',
    bgColor: 'bg-teal-600',
    borderColor: 'border-teal-600',
    description: 'Popular internationally, especially in Canada and Europe',
    features: ['International Reach', 'Kobo Plus', 'Promotions'],
    setupTime: '~25 mins',
    cost: 'Free',
    link: 'https://www.kobo.com/writinglife'
  }
}

export default function PlatformsSection({ publishingProgress, manuscriptTitle }: PlatformsSectionProps) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  
  // Get user's selected platforms from assessment
  const selectedPlatforms = publishingProgress?.platforms || []
  
  // Separate into selected and other platforms
  const userPlatforms = selectedPlatforms.filter(p => PLATFORM_CONFIG[p])
  const otherPlatforms = Object.keys(PLATFORM_CONFIG).filter(p => !selectedPlatforms.includes(p))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-300">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
            🚀
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Publishing Platforms</h2>
            <p className="text-gray-600">Connect to your chosen platforms and start publishing</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-teal-50 rounded-xl border-l-4 border-teal-500">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-teal-900">Your publishing files are ready!</p>
              <p className="text-teal-700 text-sm mt-1">
                Taylor has prepared your manuscript files. Click on each platform below to get step-by-step guidance for uploading your book.
              </p>
            </div>
          </div>
        </div>

        {/* Your Selected Platforms */}
        {userPlatforms.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Your Selected Platforms
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {userPlatforms.map((platformId) => {
                const platform = PLATFORM_CONFIG[platformId]
                if (!platform) return null
                
                const isExpanded = expandedPlatform === platformId
                
                return (
                  <div
                    key={platformId}
                    className={`rounded-xl border-2 ${platform.borderColor} overflow-hidden transition-all hover:shadow-lg`}
                  >
                    {/* Platform Header */}
                    <div className={`${platform.bgColor} p-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                          {platform.icon}
                        </div>
                        <div className="text-white">
                          <h4 className="font-bold text-lg">{platform.name}</h4>
                          <p className="text-white/80 text-sm">{platform.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Platform Details */}
                    <div className="p-4 bg-white">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {platform.features.map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>⏱️ Setup: {platform.setupTime}</span>
                        <span>💰 Cost: {platform.cost}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedPlatform(isExpanded ? null : platformId)}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                        >
                          {isExpanded ? 'Hide Guide' : 'Setup Guide'}
                        </button>
                        <a
                          href={platform.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 px-4 py-2 ${platform.bgColor} text-white rounded-lg font-semibold hover:opacity-90 transition-colors text-sm text-center`}
                        >
                          Open Platform →
                        </a>
                      </div>
                      
                      {/* Expanded Guide */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-semibold text-gray-900 mb-2">Quick Start Guide:</h5>
                          <ol className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-teal-600">1.</span>
                              <span>Create a free account on {platform.name}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-teal-600">2.</span>
                              <span>Download your formatted files from Taylor</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-teal-600">3.</span>
                              <span>Upload your manuscript and cover files</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-teal-600">4.</span>
                              <span>Fill in your book details and metadata</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-teal-600">5.</span>
                              <span>Set your pricing and click Publish!</span>
                            </li>
                          </ol>
                          <p className="mt-3 text-xs text-gray-500">
                            💬 Ask Taylor for detailed guidance specific to {platform.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Other Available Platforms */}
        {otherPlatforms.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Other Available Platforms
            </h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {otherPlatforms.map((platformId) => {
                const platform = PLATFORM_CONFIG[platformId]
                if (!platform) return null
                
                return (
                  <div
                    key={platformId}
                    className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 ${platform.bgColor} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                        {platform.icon}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{platform.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{platform.description}</p>
                    <a
                      href={platform.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Learn more →
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Platforms Selected */}
        {userPlatforms.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Platforms Selected Yet</h3>
            <p className="text-gray-600 mb-4">
              Complete Taylor's assessment to choose your publishing platforms.
            </p>
            <p className="text-sm text-teal-600">
              💬 Chat with Taylor to get started
            </p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold text-gray-900">Need help choosing platforms?</p>
              <p className="text-sm text-gray-600">
                Ask Taylor for personalized recommendations based on your book and goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
