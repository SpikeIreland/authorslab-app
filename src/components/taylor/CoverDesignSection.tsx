// ============================================
// Cover Design Section Component
// Shows cover concepts or generation progress
// ============================================

'use client'

import { useState } from 'react'

interface CoverConcept {
    url: string
    prompt: string
}

interface PublishingProgress {
    cover_concepts?: CoverConcept[]
    selected_cover_url?: string
    cover_generation_status?: 'generating' | 'complete' | 'failed' | null
}

interface CoverDesignSectionProps {
    progress: PublishingProgress | null
    manuscriptId: string
    onCoverSelect: (coverUrl: string) => Promise<void>
}

export default function CoverDesignSection({
    progress,
    manuscriptId,
    onCoverSelect
}: CoverDesignSectionProps) {
    const [isSelecting, setIsSelecting] = useState(false)

    const coverConcepts = progress?.cover_concepts || []
    const selectedCover = progress?.selected_cover_url
    const generationStatus = progress?.cover_generation_status

    async function handleSelectCover(coverUrl: string) {
        setIsSelecting(true)
        await onCoverSelect(coverUrl)
        setIsSelecting(false)
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-300">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-teal-500 rounded-xl flex items-center justify-center text-3xl">
                        🎨
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Cover Design</h2>
                        <p className="text-gray-600">Create and select your professional book cover</p>
                    </div>
                </div>

                {/* Content based on state */}
                {generationStatus === 'generating' ? (
                    // ============================================
                    // GENERATING STATE - Show spinner
                    // ============================================
                    <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            {/* Outer spinning ring */}
                            <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                            {/* Inner icon */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                🎨
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Creating Your Cover Designs
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                            Taylor is generating 4 unique cover concepts using AI. This can typically take up to 5 minutes.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-teal-600">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Generating covers...</span>
                        </div>

                        {/* Progress steps */}
                        <div className="mt-8 max-w-sm mx-auto">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="text-teal-600 font-semibold">● Preparing</span>
                                <span className="text-teal-600 font-semibold">● Generating</span>
                                <span className="text-gray-400">○ Uploading</span>
                                <span className="text-gray-400">○ Complete</span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full animate-pulse" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    </div>

                ) : generationStatus === 'failed' ? (
                    // ============================================
                    // FAILED STATE
                    // ============================================
                    <div className="text-center py-12 bg-red-50 rounded-xl">
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Cover Generation Failed</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Something went wrong while creating your covers. Please try again.
                        </p>
                        <div className="inline-block px-6 py-3 bg-teal-100 text-teal-700 rounded-lg font-semibold">
                            💬 Say &quot;create my cover&quot; to Taylor to try again →
                        </div>
                    </div>

                ) : coverConcepts.length === 0 ? (
                    // ============================================
                    // EMPTY STATE - No covers yet
                    // ============================================
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Design Your Cover?</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Chat with Taylor to generate four professional cover concepts for your book.
                        </p>
                        <div className="inline-block px-6 py-3 bg-teal-100 text-teal-700 rounded-lg font-semibold">
                            💬 Say &quot;create my cover&quot; to Taylor →
                        </div>
                    </div>

                ) : (
                    // ============================================
                    // COVERS READY - Show grid
                    // ============================================
                    <div>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {coverConcepts.map((cover: CoverConcept, index: number) => {
                                const isThisCoverSelected = selectedCover === cover.url

                                return (
                                    <div
                                        key={index}
                                        className={`relative rounded-xl overflow-hidden border-4 transition-all ${isThisCoverSelected
                                            ? 'border-teal-500 shadow-2xl'
                                            : 'border-gray-200 hover:border-teal-300'
                                            }`}
                                    >
                                        <img
                                            src={cover.url}
                                            alt={`Cover concept ${index + 1}`}
                                            className="w-full aspect-[2/3] object-cover"
                                        />
                                        {isThisCoverSelected && (
                                            <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                                <span>✓</span>
                                                <span>Selected</span>
                                            </div>
                                        )}
                                        {!isThisCoverSelected && (
                                            <button
                                                onClick={() => handleSelectCover(cover.url)}
                                                disabled={isSelecting}
                                                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSelecting ? 'Selecting...' : 'Select This Cover'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Selection prompt */}
                        {!selectedCover && (
                            <div className="text-center py-4 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-800 font-semibold">
                                    👆 Select your favorite cover to continue
                                </p>
                            </div>
                        )}

                        {/* Regenerate option */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">
                                Not happy with these options?
                                <span className="text-teal-600 font-medium"> Ask Taylor to generate more variations.</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}