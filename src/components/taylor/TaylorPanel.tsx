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
    // Presence only — signed URLs expire, so the plan is signed at click time
    // (openSignedFile in TaylorChatView), never held in state. Realtime still
    // works: what it actually tells us is that the plan now exists.
    const [hasPublishingPlan, setHasPublishingPlan] = useState(false)

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

        try {
            // Use maybeSingle() to avoid 406 errors when row doesn't exist
            const { data, error } = await supabase
                .from('publishing_progress')
                .select('assessment_completed, plan_pdf_url')
                .eq('manuscript_id', manuscriptId)
                .maybeSingle()

            if (error) {
                console.error('❌ Error checking assessment status:', error.message)
            } else if (data) {
                console.log('📊 Initial assessment status:', data.assessment_completed)
                setAssessmentCompleted(data.assessment_completed || false)
                setHasPublishingPlan(!!data.plan_pdf_url)
            } else {
                console.log('⚠️ No publishing_progress row found for manuscript')
            }
        } catch (err) {
            console.error('❌ Exception checking assessment status:', err)
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
                        setHasPublishingPlan(!!payload.new.plan_pdf_url)
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
    // Uses polling to ensure we catch the database update
    // ============================================

    async function handleAssessmentComplete() {
        console.log('🔄 Assessment complete callback triggered - starting polling...')

        const supabase = createClient()
        const maxAttempts = 10
        const delayMs = 1500

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔍 Polling attempt ${attempt}/${maxAttempts}...`)

            // Wait before checking (gives workflow time to update DB)
            await new Promise(resolve => setTimeout(resolve, delayMs))

            try {
                // Use maybeSingle() instead of single() to avoid 406 errors
                const { data, error } = await supabase
                    .from('publishing_progress')
                    .select('assessment_completed, plan_pdf_url')
                    .eq('manuscript_id', manuscriptId)
                    .maybeSingle()

                if (error) {
                    console.error(`❌ Attempt ${attempt} error:`, error.message, error.code)
                    continue
                }

                if (!data) {
                    console.log(`⚠️ Attempt ${attempt}: No publishing_progress row found`)
                    continue
                }

                console.log(`📊 Attempt ${attempt} result:`, {
                    assessment_completed: data.assessment_completed,
                    plan_pdf_url: data.plan_pdf_url ? 'present' : 'null'
                })

                if (data.assessment_completed === true) {
                    console.log('✅ Assessment confirmed complete! Switching to chat view...')
                    setAssessmentCompleted(true)
                    setHasPublishingPlan(!!data.plan_pdf_url)
                    return // Success - exit the function
                }
            } catch (err) {
                console.error(`❌ Attempt ${attempt} exception:`, err)
            }
        }

        // If we get here, polling timed out
        console.error('⚠️ Polling timed out - assessment_completed still false after', maxAttempts, 'attempts')
        console.log('💡 Try refreshing the page manually')
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
                    hasPublishingPlan={hasPublishingPlan}
                />
            )}
        </div>
    )
}