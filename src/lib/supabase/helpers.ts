// src/lib/supabase/helpers.ts
// Helper functions for common database queries

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  EditingPhase,
  EditorChatMessage,
  Chapter,
  PhaseNumber,
  EditorName
} from '@/types/database'

/**
 * Get the currently active phase for a manuscript
 */
export async function getActivePhase(
  supabase: SupabaseClient,
  manuscriptId: string
): Promise<EditingPhase | null> {
  const { data, error } = await supabase
    .from('editing_phases')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .eq('phase_status', 'active')
    .single()

  if (error) {
    console.error('Error fetching active phase:', error)
    return null
  }

  return data
}

/**
 * Get all phases for a manuscript
 */
export async function getAllPhases(
  supabase: SupabaseClient,
  manuscriptId: string
): Promise<EditingPhase[]> {
  const { data, error } = await supabase
    .from('editing_phases')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .order('phase_number', { ascending: true })

  if (error) {
    console.error('Error fetching phases:', error)
    return []
  }

  return data || []
}

/**
 * Get chat history for a specific phase
 */
export async function getChatHistory(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: number
): Promise<EditorChatMessage[]> {
  const { data, error } = await supabase
    .from('editor_chat_history')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .eq('phase_number', phaseNumber)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat history:', error)
    return []
  }

  return data || []
}

/**
 * Save a chat message
 */
export async function saveChatMessage(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: number,
  sender: EditorChatMessage['sender'],
  message: string,
  chapterNumber?: number
): Promise<boolean> {
  const { error } = await supabase
    .from('editor_chat_history')
    .insert({
      manuscript_id: manuscriptId,
      phase_number: phaseNumber,
      sender,
      message,
      chapter_number: chapterNumber || null
    })

  if (error) {
    console.error('Error saving chat message:', error)
    return false
  }

  return true
}

/**
 * Check if all chapters are approved for a phase
 */
export async function areAllChaptersApproved(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: PhaseNumber
): Promise<boolean> {
  const phaseColumn = `phase_${phaseNumber}_approved_at` as keyof Chapter

  // Get total chapters
  const { count: totalCount } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId)

  // Get approved chapters
  const { count: approvedCount } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId)
    .not(phaseColumn, 'is', null)

  return totalCount === approvedCount && totalCount !== null && totalCount > 0
}

/**
 * Approve a chapter for the current phase
 */
export async function approveChapter(
  supabase: SupabaseClient,
  chapterId: string,
  phaseNumber: PhaseNumber,
  content: string
): Promise<boolean> {
  const phaseColumn = `phase_${phaseNumber}_approved_at`

  const { error } = await supabase
    .from('chapters')
    .update({
      [phaseColumn]: new Date().toISOString(),
      content: content,
      updated_at: new Date().toISOString()
    })
    .eq('id', chapterId)

  if (error) {
    console.error('Error approving chapter:', error)
    return false
  }

  return true
}

/**
 * Create an approved snapshot when phase completes
 */
export async function createApprovedSnapshot(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: PhaseNumber,
  editorName: EditorName
): Promise<boolean> {
  try {
    // Get all chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('chapter_number, title, content')
      .eq('manuscript_id', manuscriptId)
      .order('chapter_number', { ascending: true })

    if (chaptersError || !chapters) {
      console.error('Error fetching chapters:', chaptersError)
      return false
    }

    // Collate into single document
    const collatedContent = chapters
      .map(ch => {
        const label = ch.chapter_number === 0 ? 'Prologue' : `Chapter ${ch.chapter_number}`
        return `# ${label}: ${ch.title}\n\n${ch.content}`
      })
      .join('\n\n---\n\n')

    const wordCount = collatedContent.split(/\s+/).length

    // Create version record
    const { error } = await supabase
      .from('manuscript_versions')
      .insert({
        manuscript_id: manuscriptId,
        phase_number: phaseNumber,
        version_type: 'approved_snapshot',
        content: collatedContent,
        word_count: wordCount,
        created_by_editor: editorName,
        notes: `${editorName} phase complete - all chapters approved`
      })

    if (error) {
      console.error('Error creating approved snapshot:', error)
      return false
    }

    console.log(`✅ Created approved snapshot for Phase ${phaseNumber}`)
    return true
  } catch (error) {
    console.error('Error in createApprovedSnapshot:', error)
    return false
  }
}

/**
 * Transition to the next phase
 */
export async function transitionToNextPhase(
  supabase: SupabaseClient,
  manuscriptId: string,
  currentPhase: PhaseNumber
): Promise<boolean> {
  try {
    // Check if all chapters approved
    const allApproved = await areAllChaptersApproved(supabase, manuscriptId, currentPhase)
    
    if (!allApproved) {
      console.warn(`Not all chapters approved for Phase ${currentPhase}`)
      return false
    }

    // Get total chapters for progress tracking
    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', manuscriptId)

    // Complete current phase
    await supabase
      .from('editing_phases')
      .update({
        phase_status: 'complete',
        completed_at: new Date().toISOString(),
        chapters_approved: totalChapters || 0,
        updated_at: new Date().toISOString()
      })
      .eq('manuscript_id', manuscriptId)
      .eq('phase_number', currentPhase)

    // Activate next phase
    const nextPhase = (currentPhase + 1) as PhaseNumber
    
    await supabase
      .from('editing_phases')
      .update({
        phase_status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('manuscript_id', manuscriptId)
      .eq('phase_number', nextPhase)

    // Update manuscript current phase
    await supabase
      .from('manuscripts')
      .update({
        current_phase_number: nextPhase,
        updated_at: new Date().toISOString()
      })
      .eq('id', manuscriptId)

    console.log(`✅ Transitioned from Phase ${currentPhase} to Phase ${nextPhase}`)
    return true
  } catch (error) {
    console.error('Error transitioning phases:', error)
    return false
  }
}

/**
 * Get the approved snapshot from a specific phase
 */
export async function getApprovedSnapshot(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: PhaseNumber
): Promise<string | null> {
  const { data, error } = await supabase
    .from('manuscript_versions')
    .select('content')
    .eq('manuscript_id', manuscriptId)
    .eq('phase_number', phaseNumber)
    .eq('version_type', 'approved_snapshot')
    .single()

  if (error) {
    console.error(`Error fetching Phase ${phaseNumber} snapshot:`, error)
    return null
  }

  return data?.content || null
}