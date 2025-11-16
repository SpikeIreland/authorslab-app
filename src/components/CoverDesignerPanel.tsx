'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CoverDesign } from '@/types/database'

interface CoverDesignerPanelProps {
    manuscriptId: string
}

export default function CoverDesignerPanel({ manuscriptId }: CoverDesignerPanelProps) {
    const [covers, setCovers] = useState<CoverDesign[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCoverId, setSelectedCoverId] = useState<string | null>(null)
    const [isSelecting, setIsSelecting] = useState(false)

    // Load covers on mount
    useEffect(() => {
        loadCovers()
    }, [manuscriptId])

    // Subscribe to realtime updates
    useEffect(() => {
        const supabase = createClient()

        console.log(`🔌 Setting up cover updates subscription for: ${manuscriptId}`)

        const channel = supabase
            .channel(`cover-updates-${manuscriptId}`)  // ✅ Unique channel per manuscript
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    console.log('📡 Realtime update received:', payload)

                    if (payload.new.cover_concepts) {
                        console.log('✅ New covers detected, reloading...')
                        loadCovers()  // Reload from database to ensure correct structure
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Subscription status:', status)
            })

        return () => {
            console.log('🔌 Cleaning up cover updates subscription')
            supabase.removeChannel(channel)
        }
    }, [manuscriptId])

    async function loadCovers() {
        console.log('🎨 CoverDesignerPanel: Loading covers for', manuscriptId)

        const supabase = createClient()

        const { data, error } = await supabase
            .from('publishing_progress')
            .select('cover_concepts, selected_cover_url')
            .eq('manuscript_id', manuscriptId)
            .single()

        console.log('🎨 Query result - data:', data)
        console.log('🎨 Query result - error:', error)

        if (error) {
            console.error('❌ Error loading covers:', error)
            setIsLoading(false)
            return
        }

        if (data) {
            console.log('📦 Raw cover_concepts value:', data.cover_concepts)
            console.log('📦 Data type:', typeof data.cover_concepts)
            console.log('📦 Is Array:', Array.isArray(data.cover_concepts))

            // Handle different data structures
            let coverArray: CoverDesign[] = []

            if (Array.isArray(data.cover_concepts)) {
                console.log('✅ cover_concepts is an array')
                console.log('📦 Array length:', data.cover_concepts.length)
                console.log('📦 First item:', data.cover_concepts[0])
                coverArray = data.cover_concepts as CoverDesign[]
            } else if (data.cover_concepts && typeof data.cover_concepts === 'object') {
                console.log('⚠️ cover_concepts is an object, not array')
                console.log('📦 Object keys:', Object.keys(data.cover_concepts))

                // Check if it's wrapped in a "data" property
                if ('data' in data.cover_concepts && Array.isArray(data.cover_concepts.data)) {
                    console.log('📦 Found nested data array')
                    coverArray = data.cover_concepts.data as CoverDesign[]
                }
            } else {
                console.log('❌ cover_concepts is not in expected format')
            }

            console.log('📦 Final cover array:', coverArray)
            console.log('📦 Final cover count:', coverArray.length)

            setCovers(coverArray)
            setSelectedCoverId(data.selected_cover_url)
        }

        setIsLoading(false)
    }

    async function handleSelectCover(coverUrl: string) {
        setIsSelecting(true)

        const supabase = createClient()

        // Update the selected cover in the database
        const { error } = await supabase
            .from('publishing_progress')
            .update({
                selected_cover_url: coverUrl
            })
            .eq('manuscript_id', manuscriptId)

        if (!error) {
            // Update local state
            setSelectedCoverId(coverUrl)

            // Show success message
            alert('Cover selected successfully! 🎨')
        } else {
            console.error('Error selecting cover:', error)
            alert('Error selecting cover. Please try again.')
        }

        setIsSelecting(false)
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-300">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[2/3] bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (covers.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-300">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No Covers Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Chat with Taylor and ask to create covers to generate professional cover designs!
                    </p>
                    <button
                        onClick={loadCovers}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">🎨</div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Your Cover Designs
                        </h2>
                        <p className="text-gray-600">
                            {selectedCoverId ? 'Cover selected!' : 'Select your favorite design'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadCovers}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all text-sm"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Cover Grid */}
            <div className="grid grid-cols-2 gap-6">
                {covers.map((cover, index) => {
                    const isSelected = cover.url === selectedCoverId

                    return (
                        <div
                            key={cover.id || index}
                            className={`
                                relative group rounded-xl overflow-hidden border-4 transition-all
                                ${isSelected ? 'border-teal-600 shadow-2xl' : 'border-gray-200 hover:border-teal-400'}
                            `}
                        >
                            {/* Cover Image */}
                            <div className="aspect-[2/3] relative">
                                <img
                                    src={cover.url}
                                    alt={`Cover option ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Selected Badge */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                        ✓ Selected
                                    </div>
                                )}
                            </div>

                            {/* Hover Overlay with Button */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {!isSelected && (
                                    <button
                                        onClick={() => handleSelectCover(cover.url)}
                                        disabled={isSelecting}
                                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {isSelecting ? 'Selecting...' : 'Select This Cover'}
                                    </button>
                                )}
                            </div>

                            {/* Cover Details */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-white text-sm line-clamp-2">
                                    {cover.prompt || `Cover Option ${index + 1}`}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}