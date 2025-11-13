'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PublishingProgress } from '@/types/database'

interface PublishingElement {
    id: string
    label: string
    icon: string
    isComplete: boolean
    isActive: boolean
    isLocked: boolean
}

interface PublishingNavigationProps {
    manuscriptId: string
    isCollapsed: boolean
    onToggleCollapse: () => void
    selectedElement: string
    onSelectElement: (elementId: string) => void
}

export default function PublishingNavigation({
    manuscriptId,
    isCollapsed,
    onToggleCollapse,
    selectedElement,
    onSelectElement
}: PublishingNavigationProps) {
    const [publishingProgress, setPublishingProgress] = useState<PublishingProgress | null>(null)
    const [elements, setElements] = useState<PublishingElement[]>([])

    useEffect(() => {
        loadPublishingProgress()
        subscribeToUpdates()
    }, [manuscriptId])

    async function loadPublishingProgress() {
        const supabase = createClient()
        const { data } = await supabase
            .from('publishing_progress')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (data) {
            setPublishingProgress(data as PublishingProgress)
            generateElements(data as PublishingProgress)
        }
    }

    function subscribeToUpdates() {
        const supabase = createClient()
        const channel = supabase
            .channel(`publishing-nav-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    setPublishingProgress(payload.new as PublishingProgress)
                    generateElements(payload.new as PublishingProgress)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    function generateElements(progress: PublishingProgress) {
        const assessmentAnswers = progress.assessment_answers || {}

        // Base elements that always appear
        const baseElements: PublishingElement[] = [
            {
                id: 'overview',
                label: 'Publishing Overview',
                icon: '📚',
                isComplete: progress.assessment_completed,
                isActive: !progress.assessment_completed,
                isLocked: false
            },
            {
                id: 'cover-design',
                label: 'Cover Design',
                icon: '🎨',
                isComplete: !!progress.selected_cover_id,
                isActive: progress.assessment_completed && !progress.selected_cover_id,
                isLocked: !progress.assessment_completed
            }
        ]

        // Dynamic elements based on questionnaire
        const dynamicElements: PublishingElement[] = []

        // Front Matter
        dynamicElements.push({
            id: 'front-matter',
            label: 'Front Matter',
            icon: '📄',
            isComplete: !!progress.step_data?.front_matter_complete,
            isActive: progress.assessment_completed,
            isLocked: !progress.assessment_completed
        })

        // Back Matter
        dynamicElements.push({
            id: 'back-matter',
            label: 'Back Matter',
            icon: '📝',
            isComplete: !!progress.step_data?.back_matter_complete,
            isActive: progress.assessment_completed,
            isLocked: !progress.assessment_completed
        })

        // Multi-Platform Formatting
        dynamicElements.push({
            id: 'formatting',
            label: 'Multi-Platform Formatting',
            icon: '📖',
            isComplete: progress.formatting_completed_at !== null,
            isActive: progress.assessment_completed,
            isLocked: !progress.assessment_completed
        })

        // Platform-specific elements based on questionnaire
        const platforms = assessmentAnswers.platforms || []

        if (platforms.length > 0 && !platforms.includes('unsure')) {
            dynamicElements.push({
                id: 'platform-setup',
                label: 'Platform Setup',
                icon: '🚀',
                isComplete: !!progress.step_data?.platforms_configured,
                isActive: progress.assessment_completed,
                isLocked: !progress.assessment_completed
            })
        }

        // Metadata Manager
        dynamicElements.push({
            id: 'metadata',
            label: 'Metadata Manager',
            icon: '🏷️',
            isComplete: progress.metadata_completed_at !== null,
            isActive: progress.assessment_completed,
            isLocked: !progress.assessment_completed
        })

        // ISBN Management (if self-publishing)
        const publishingGoal = assessmentAnswers.publishing_goal
        if (publishingGoal && ['self-publish-all', 'self-publish-amazon', 'hybrid'].includes(publishingGoal)) {
            dynamicElements.push({
                id: 'isbn',
                label: 'ISBN Management',
                icon: '🔢',
                isComplete: !!progress.step_data?.isbn_assigned,
                isActive: progress.assessment_completed,
                isLocked: !progress.assessment_completed
            })
        }

        // Pre-Launch Checklist
        dynamicElements.push({
            id: 'pre-launch',
            label: 'Pre-Launch Checklist',
            icon: '✅',
            isComplete: progress.all_steps_completed_at !== null,
            isActive: progress.assessment_completed,
            isLocked: !progress.assessment_completed
        })

        setElements([...baseElements, ...dynamicElements])
    }

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    {!isCollapsed && (
                        <h2 className="font-bold text-gray-900">Publishing Journey</h2>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>
            </div>

            {/* Elements List */}
            <div className="flex-1 overflow-y-auto">
                {elements.map((element) => (
                    <button
                        key={element.id}
                        onClick={() => !element.isLocked && onSelectElement(element.id)}
                        disabled={element.isLocked}
                        className={`
              w-full text-left transition-colors
              ${isCollapsed ? 'p-3' : 'px-4 py-3'}
              ${selectedElement === element.id
                                ? 'bg-teal-50 border-l-4 border-teal-600'
                                : 'hover:bg-gray-50'
                            }
              ${element.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
                    >
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="relative">
                                <span className="text-xl">{element.icon}</span>
                                {element.isComplete && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                                {element.isActive && !element.isComplete && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 truncate">
                                        {element.label}
                                    </div>
                                    {element.isLocked && (
                                        <div className="text-xs text-gray-500">Complete assessment first</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}