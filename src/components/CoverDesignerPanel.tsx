'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { selectCover } from '@/lib/publishing'
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

        const channel = supabase
            .channel('cover-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    if (payload.new.cover_designs) {
                        setCovers(payload.new.cover_designs as CoverDesign[])
                        setSelectedCoverId(payload.new.selected_cover_url)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [manuscriptId])

    async function loadCovers() {
        console.log('🎨 CoverDesignerPanel: Loading covers for', manuscriptId)

        const supabase = createClient()

        const { data, error } = await supabase
            .from('publishing_progress')
            .select('cover_concepts, selected_cover_url')  // ✅ Correct column
            .eq('manuscript_id', manuscriptId)
            .single()

        console.log('🎨 CoverDesignerPanel data:', data)
        console.log('🎨 CoverDesignerPanel error:', error)

        if (data) {
            console.log('📦 Raw cover_concepts:', data.cover_concepts)
            console.log('📦 Type:', typeof data.cover_concepts)
            console.log('📦 Is Array:', Array.isArray(data.cover_concepts))

            setCovers((data.cover_concepts as CoverDesign[]) || [])
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
                        Chat with Taylor and say &quot;create my cover&quot; to generate professional cover designs!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-teal-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
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

            {/* Cover Grid */}
            <div className="grid grid-cols-2 gap-6">
                {covers.map((cover) => {
                    // ✅ Add this line at the top of the map function
                    const isSelected = cover.url === selectedCoverId

                    return (
                        <div
                            key={cover.id}
                            className={`
                    relative group rounded-xl overflow-hidden border-4 transition-all
                    ${isSelected ? 'border-teal-600 shadow-2xl' : 'border-gray-200 hover:border-teal-400'}
                `}
                        >
                            {/* Cover Image */}
                            <div className="aspect-[2/3] relative">
                                <img
                                    src={cover.url}
                                    alt={`Cover option ${cover.id}`}
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
                                {isSelected && (
                                    <button
                                        onClick={() => handleSelectCover(cover.url)}
                                        disabled={isSelecting}
                                        className="px-6 py-3 bg-white text-teal-600 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
                                    >
                                        Selected ✓
                                    </button>
                                )}
                            </div>

                            {/* Cover Number */}
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                                Option {cover.id}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Regenerate Button */}
            {covers.length > 0 && !selectedCoverId && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            // Trigger Taylor chat to ask for regeneration
                            // This could open chat with pre-filled message
                            alert('Ask Taylor in the chat: "Can you generate more cover options?"')
                        }}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                    >
                        Not quite right? Ask Taylor for more options
                    </button>
                </div>
            )}
        </div>
    )
}