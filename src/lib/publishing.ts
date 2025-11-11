import { createClient } from '@/lib/supabase/client'
import type {
    PublishingProgress,
    AssessmentAnswers,
    CoverDesign
} from '@/types/database'

/**
 * Initializes publishing_progress for a manuscript when Phase 4 starts
 * This should be called when:
 * 1. User clicks "Start Phase 4 with Taylor" button
 * 2. Phase 4 becomes active in editing_phases
 * 
 * @param manuscriptId - The manuscript UUID
 * @returns The created or existing publishing_progress record
 */
export async function initializePublishingProgress(
    manuscriptId: string
): Promise<PublishingProgress | null> {
    const supabase = createClient()

    try {
        // Check if publishing_progress already exists
        const { data: existing, error: fetchError } = await supabase
            .from('publishing_progress')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (existing) {
            console.log('✅ Publishing progress already exists:', existing.id)
            return existing as PublishingProgress
        }

        // Create new publishing_progress record
        const { data: newProgress, error: insertError } = await supabase
            .from('publishing_progress')
            .insert({
                manuscript_id: manuscriptId,
                current_step: 'assessment',
                assessment_completed: false,
                completed_steps: [],
                cover_designs: [],
                formatted_files: {},
                metadata: {},
                step_data: {},
                assessment_answers: {}
            })
            .select()
            .single()

        if (insertError) {
            console.error('❌ Error creating publishing_progress:', insertError)
            return null
        }

        console.log('✅ Created new publishing_progress:', newProgress.id)
        return newProgress as PublishingProgress

    } catch (error) {
        console.error('❌ Error in initializePublishingProgress:', error)
        return null
    }
}

/**
 * Gets the current publishing progress for a manuscript
 * 
 * @param manuscriptId - The manuscript UUID
 * @returns The publishing_progress record or null
 */
export async function getPublishingProgress(
    manuscriptId: string
): Promise<PublishingProgress | null> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('publishing_progress')
            .select('*')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (error) {
            console.error('❌ Error fetching publishing_progress:', error)
            return null
        }

        return data as PublishingProgress

    } catch (error) {
        console.error('❌ Error in getPublishingProgress:', error)
        return null
    }
}

/**
 * Marks the assessment as complete and moves to next step
 * 
 * @param manuscriptId - The manuscript UUID
 * @param answers - The assessment answers
 * @param publishingPlan - The generated publishing plan
 * @returns Success boolean
 */
export async function completeAssessment(
    manuscriptId: string,
    answers: AssessmentAnswers,
    publishingPlan: string
): Promise<boolean> {
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('publishing_progress')
            .update({
                assessment_completed: true,
                assessment_completed_at: new Date().toISOString(),
                assessment_answers: answers,
                publishing_plan: publishingPlan,
                current_step: 'cover-design',
                completed_steps: ['assessment']
            })
            .eq('manuscript_id', manuscriptId)

        if (error) {
            console.error('❌ Error completing assessment:', error)
            return false
        }

        console.log('✅ Assessment marked complete, moved to cover-design step')
        return true

    } catch (error) {
        console.error('❌ Error in completeAssessment:', error)
        return false
    }
}

/**
 * Adds a new cover design option
 * 
 * @param manuscriptId - The manuscript UUID
 * @param coverUrl - URL to the generated cover image
 * @param prompt - The prompt used to generate the cover
 * @returns Success boolean
 */
export async function addCoverDesign(
    manuscriptId: string,
    coverUrl: string,
    prompt: string
): Promise<boolean> {
    const supabase = createClient()

    try {
        // Fetch current cover designs
        const { data: progress } = await supabase
            .from('publishing_progress')
            .select('cover_designs')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (!progress) {
            console.error('❌ Publishing progress not found')
            return false
        }

        const existingCovers = (progress.cover_designs as CoverDesign[]) || []
        const newCover: CoverDesign = {
            id: existingCovers.length + 1,
            url: coverUrl,
            prompt: prompt,
            selected: false,
            created_at: new Date().toISOString()
        }

        // Update with new cover
        const { error } = await supabase
            .from('publishing_progress')
            .update({
                cover_designs: [...existingCovers, newCover]
            })
            .eq('manuscript_id', manuscriptId)

        if (error) {
            console.error('❌ Error adding cover design:', error)
            return false
        }

        console.log('✅ Added new cover design:', newCover.id)
        return true

    } catch (error) {
        console.error('❌ Error in addCoverDesign:', error)
        return false
    }
}

/**
 * Selects a cover design
 * 
 * @param manuscriptId - The manuscript UUID
 * @param coverId - The ID of the cover to select
 * @returns Success boolean
 */
export async function selectCover(
    manuscriptId: string,
    coverId: number
): Promise<boolean> {
    const supabase = createClient()

    try {
        // Fetch current cover designs
        const { data: progress } = await supabase
            .from('publishing_progress')
            .select('cover_designs')
            .eq('manuscript_id', manuscriptId)
            .single()

        if (!progress) {
            console.error('❌ Publishing progress not found')
            return false
        }

        const existingCovers = (progress.cover_designs as CoverDesign[]) || []

        // Update selected status
        const updatedCovers: CoverDesign[] = existingCovers.map((cover) => ({
            ...cover,
            selected: cover.id === coverId
        }))

        // Update database
        const { error } = await supabase
            .from('publishing_progress')
            .update({
                cover_designs: updatedCovers,
                selected_cover_id: coverId,
                cover_selected_at: new Date().toISOString(),
                current_step: 'formatting',
                completed_steps: ['assessment', 'cover-design']
            })
            .eq('manuscript_id', manuscriptId)

        if (error) {
            console.error('❌ Error selecting cover:', error)
            return false
        }

        console.log('✅ Cover selected, moved to formatting step')
        return true

    } catch (error) {
        console.error('❌ Error in selectCover:', error)
        return false
    }
}