// ============================================
// Taylor Panel - Main Container Component
// Orchestrates Assessment and Chat views
// ============================================

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AssessmentView from './AssessmentView'
import TaylorChatView from './TaylorChatView'
import { TaylorPanelProps } from './taylorTypes'

export default function TaylorPanel({ manuscriptId }: TaylorPanelProps) {
    const [assessmentCompleted, setAssessmentCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [publishingPlanUrl, setPublishingPlanUrl] = useState<string | null>(null)

    useEffect(() => {
        checkAssessmentStatus()
        const cleanup = subscribeToProgressUpdates()
        return cleanup
    }, [manuscriptId])

    // ============================================
    // Check Initial Assessment Status
    // ============================================

    async function checkAssessmentStatus() {
        const supabase = createClient()
        const { data } = await supabase
            .from('publishing_progress')
            .select('assessment_completed, plan_pdf_url')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (data) {
            setAssessmentCompleted(data.assessment_completed || false)
            setPublishingPlanUrl(data.plan_pdf_url)
        }
        setIsLoading(false)
    }

    // ============================================
    // Realtime Subscription for Progress Updates
    // ============================================

    function subscribeToProgressUpdates() {
        const supabase = createClient()
        const channel = supabase
            .channel(`taylor-panel-progress-${manuscriptId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'publishing_progress',
                    filter: `manuscript_id=eq.${manuscriptId}`
                },
                (payload) => {
                    console.log('📊 Taylor: Publishing progress updated via realtime')
                    if (payload.new.assessment_completed === true) {
                        setAssessmentCompleted(true)
                        setPublishingPlanUrl(payload.new.plan_pdf_url)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    // ============================================
    // ✅ FIX: Callback for Assessment Completion
    // This provides a fallback when realtime subscription doesn't fire
    // ============================================

    async function handleAssessmentComplete() {
        console.log('🔄 Assessment complete callback triggered - refreshing status...')

        // Small delay to ensure database has been updated
        await new Promise(resolve => setTimeout(resolve, 1000))

        const supabase = createClient()
        const { data } = await supabase
            .from('publishing_progress')
            .select('assessment_completed, plan_pdf_url')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (data) {
            console.log('✅ Refreshed assessment status:', data.assessment_completed)
            setAssessmentCompleted(data.assessment_completed || false)
            setPublishingPlanUrl(data.plan_pdf_url)
        }
    }

    // ============================================
    // Render: Loading State
    // ============================================

    if (isLoading) {
        return (
            <div className="w-96 bg-white border-l border-gray-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // ============================================
    // Render: Main Panel
    // ============================================

    return (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Taylor Header */}
            <div className="p-4 border-b border-gray-200 bg-teal-50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-2xl">
                        📚
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Taylor</h3>
                        <p className="text-xs text-gray-600">Publishing Specialist</p>
                    </div>
                </div>
            </div>

            {/* Conditional Content: Assessment or Chat */}
            {!assessmentCompleted ? (
                <AssessmentView
                    manuscriptId={manuscriptId}
                    onAssessmentComplete={handleAssessmentComplete}
                />
            ) : (
                <TaylorChatView
                    manuscriptId={manuscriptId}
                    planPdfUrl={publishingPlanUrl}
                />
            )}
        </div>
    )
}