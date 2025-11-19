'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BookPreviewPanelProps {
    manuscript: {
        title: string
        genre: string
        current_word_count: number
        total_chapters: number
    }
    publishingProgress: {
        selected_cover_url?: string
        cover_concepts?: Array<{ url: string }>
    } | null
    publishingSections: Array<{
        id: string
        title: string
        icon: string
        isComplete: boolean
        items: Array<{ isComplete: boolean }>
    }>
}

export default function BookPreviewPanel({
    manuscript,
    publishingProgress,
    publishingSections
}: BookPreviewPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const selectedCover = publishingProgress?.selected_cover_url
    const hasCoverConcepts = (publishingProgress?.cover_concepts?.length || 0) > 0

    // Calculate overall progress
    const totalItems = publishingSections.reduce((sum, section) => sum + section.items.length, 0)
    const completedItems = publishingSections.reduce(
        (sum, section) => sum + section.items.filter(item => item.isComplete).length,
        0
    )
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    if (isExpanded) {
        // Full preview modal
        return (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-[101]">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Your Book Preview</h2>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Cover */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Cover Design</h3>
                                {selectedCover ? (
                                    <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-teal-500">
                                        <img
                                            src={selectedCover}
                                            alt="Book cover"
                                            className="w-full aspect-[2/3] object-cover"
                                        />
                                    </div>
                                ) : hasCoverConcepts ? (
                                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-8 text-center aspect-[2/3] flex items-center justify-center">
                                        <div>
                                            <div className="text-4xl mb-2">🎨</div>
                                            <p className="text-yellow-800 font-semibold">Cover Not Selected</p>
                                            <p className="text-yellow-700 text-sm mt-1">Choose from your concepts</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-8 text-center aspect-[2/3] flex items-center justify-center">
                                        <div>
                                            <div className="text-4xl mb-2">📖</div>
                                            <p className="text-gray-600 font-semibold">No Cover Yet</p>
                                            <p className="text-gray-500 text-sm mt-1">Create concepts with Taylor</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div>
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-900 mb-2">Book Details</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Title:</span>
                                            <p className="font-semibold text-gray-900">{manuscript.title}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Genre:</span>
                                            <p className="font-semibold text-gray-900">{manuscript.genre}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Word Count:</span>
                                            <p className="font-semibold text-gray-900">{manuscript.current_word_count.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Chapters:</span>
                                            <p className="font-semibold text-gray-900">{manuscript.total_chapters}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-900 mb-3">Publishing Progress</h3>
                                    <div className="bg-gray-100 rounded-full h-3 mb-2">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {completedItems} of {totalItems} items complete ({progressPercentage}%)
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">Section Status</h3>
                                    <div className="space-y-2">
                                        {publishingSections.map((section) => {
                                            const sectionComplete = section.items.filter(i => i.isComplete).length
                                            const sectionTotal = section.items.length

                                            return (
                                                <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{section.icon}</span>
                                                        <span className="text-sm font-medium text-gray-900">{section.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-600">
                                                            {sectionComplete}/{sectionTotal}
                                                        </span>
                                                        {section.isComplete && (
                                                            <span className="text-green-500 text-sm">✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Compact preview bar (default)
    return (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b-2 border-teal-200 px-8 py-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Cover Thumbnail */}
                    <div className="relative">
                        {selectedCover ? (
                            <div className="w-16 h-24 rounded-lg overflow-hidden shadow-lg border-2 border-teal-500">
                                <img
                                    src={selectedCover}
                                    alt="Book cover"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : hasCoverConcepts ? (
                            <div className="w-16 h-24 rounded-lg bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                        ) : (
                            <div className="w-16 h-24 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                                <span className="text-2xl">📖</span>
                            </div>
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{manuscript.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>{manuscript.genre}</span>
                            <span className="text-gray-400">•</span>
                            <span>{manuscript.current_word_count.toLocaleString()} words</span>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="hidden lg:block">
                        <div className="text-sm text-gray-600 mb-1">Publishing Progress</div>
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-200 rounded-full h-2 w-32">
                                <div
                                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-teal-600">{progressPercentage}%</span>
                        </div>
                    </div>
                </div>

                {/* View Full Preview Button */}
                <button
                    onClick={() => setIsExpanded(true)}
                    className="ml-6 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-sm flex items-center gap-2 text-sm"
                >
                    <span>📖</span>
                    <span>View Full Preview</span>
                </button>
            </div>

            {/* Quick Status Indicators */}
            <div className="flex items-center gap-4 mt-3 text-xs">
                {publishingSections.slice(0, 4).map((section) => {
                    const sectionComplete = section.items.filter(i => i.isComplete).length
                    const sectionTotal = section.items.length

                    return (
                        <div key={section.id} className="flex items-center gap-2">
                            <span>{section.icon}</span>
                            <span className={section.isComplete ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                {section.title}
                            </span>
                            <span className="text-gray-500">
                                ({sectionComplete}/{sectionTotal})
                            </span>
                            {section.isComplete && <span className="text-green-500">✓</span>}
                        </div>
                    )
                })}
                {publishingSections.length > 4 && (
                    <span className="text-gray-500">+{publishingSections.length - 4} more</span>
                )}
            </div>
        </div>
    )
}