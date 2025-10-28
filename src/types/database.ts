// ============================================
// src/types/database.ts - Updated Interfaces
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js'

// Core Tables

export interface AuthorProfile {
  id: string
  auth_user_id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  genre: string | null
  writing_experience: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Manuscript {
  id: string
  author_id: string

  // Basic Metadata
  title: string
  genre: string
  total_chapters: number
  current_word_count: number
  has_prologue: boolean
  has_epilogue: boolean

  // Original Upload
  original_upload_text: string | null
  original_upload_url: string | null
  full_text: string // Keep for backward compatibility during transition

  // Analysis Data
  manuscript_summary: string | null
  full_analysis_key_points: string | null
  full_analysis_text: string | null
  report_pdf_url: string | null

  // Status
  status: string // 'uploaded', 'analyzing', 'editing', 'complete'
  current_phase_number: number // 1-5

  // Timestamps
  created_at: string
  updated_at: string
}

export interface EditingPhase {
  id: string
  manuscript_id: string

  // Phase Identity
  phase_number: number // 1-5
  phase_name: 'developmental' | 'line_editing' | 'copy_editing' | 'publishing' | 'marketing'

  // Editor Configuration
  editor_name: 'Alex' | 'Sam' | 'Jordan' | 'Publishing Agent' | 'Marketing Agent'
  editor_color: 'green' | 'purple' | 'blue' | 'teal' | 'orange'
  editor_avatar_url: string | null

  // Phase Status
  phase_status: 'pending' | 'active' | 'complete' | 'on_hold' | 'skipped'

  // Timestamps
  started_at: string | null
  completed_at: string | null
  ai_read_completed_at: string | null

  // Progress Tracking
  chapters_analyzed: number
  chapters_approved: number

  // Metadata
  created_at: string
  updated_at: string
}

export interface ManuscriptVersion {
  id: string
  manuscript_id: string

  // Version Identity
  phase_number: number
  version_type: 'approved_snapshot' | 'working_draft' | 'print_format'

  // Content
  content: string
  word_count: number

  // Metadata
  created_by_editor: string | null
  notes: string | null

  // Timestamps
  created_at: string
}

export interface Chapter {
  id: string
  manuscript_id: string

  // Chapter Identity
  chapter_number: number // 0 for prologue, 999 for epilogue
  title: string

  // Content
  content: string
  word_count: number

  // Phase Approvals
  phase_1_approved_at: string | null
  phase_2_approved_at: string | null
  phase_3_approved_at: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface ManuscriptIssue {
  id: string
  manuscript_id: string

  // Issue Identity
  chapter_number: number
  phase_number: number

  // Issue Type (phase-specific categories)
  element_type:
  // Phase 1 (Alex): Developmental
  | 'character' | 'plot' | 'pacing' | 'structure' | 'theme'
  // Phase 2 (Sam): Line Editing
  | 'word_choice' | 'sentence_flow' | 'dialogue' | 'voice' | 'clarity'
  // Phase 3 (Jordan): Copy Editing
  | 'grammar' | 'punctuation' | 'consistency' | 'formatting'

  severity: 'minor' | 'moderate' | 'major'

  // Issue Content
  issue_description: string
  editor_suggestion: string
  quoted_text: string | null

  // Location (optional)
  start_position: number | null
  end_position: number | null

  // Status Tracking
  status: 'flagged' | 'in_progress' | 'resolved' | 'dismissed'
  resolved_at: string | null

  // Timestamps
  created_at: string
  updated_at: string
}

export interface EditorChatMessage {
  id: string
  manuscript_id: string

  // Phase Context
  phase_number: number
  chapter_number: number | null

  // Message
  sender: 'author' | 'editor'
  message: string

  // Metadata
  created_at: string
}

export interface Subscription {
  id: string
  author_id: string

  // Plan Details
  plan_type: 'free' | 'basic' | 'professional' | 'enterprise'
  billing_cycle: 'monthly' | 'annual' | null

  // Status
  status: 'active' | 'canceled' | 'expired' | 'payment_failed'

  // Limits
  manuscripts_allowed: number | null // NULL = unlimited
  manuscripts_used: number

  // Stripe Integration
  stripe_customer_id: string | null
  stripe_subscription_id: string | null

  // Billing
  current_period_start: string | null
  current_period_end: string | null

  // Timestamps
  created_at: string
  updated_at: string
  canceled_at: string | null
}

export interface Payment {
  id: string
  author_id: string
  subscription_id: string | null
  manuscript_id: string | null

  // Payment Details
  amount_cents: number
  currency: string
  payment_type: 'subscription' | 'one_time' | 'refund'

  // Stripe
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null

  // Status
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'

  // Timestamps
  created_at: string
  succeeded_at: string | null
}

export interface Invoice {
  id: string
  author_id: string
  payment_id: string

  // Invoice Details
  invoice_number: string
  amount_cents: number
  currency: string

  // PDF
  invoice_pdf_url: string | null

  // Status
  status: 'generated' | 'sent' | 'paid'

  // Timestamps
  created_at: string
  sent_at: string | null
  paid_at: string | null
}

// ============================================
// Helper Types & Utilities
// ============================================

export type EditorName = 'Alex' | 'Sam' | 'Jordan' | 'Publishing Agent' | 'Marketing Agent'
export type EditorColor = 'green' | 'purple' | 'blue' | 'teal' | 'orange'
export type PhaseNumber = 1 | 2 | 3 | 4 | 5
export type PhaseStatus = 'pending' | 'active' | 'complete' | 'on_hold' | 'skipped'

// Editor Configuration Map
export const EDITOR_CONFIG: Record<PhaseNumber, { name: EditorName; color: EditorColor; phaseName: string }> = {
  1: { name: 'Alex', color: 'green', phaseName: 'Developmental Editing' },
  2: { name: 'Sam', color: 'purple', phaseName: 'Line Editing' },
  3: { name: 'Jordan', color: 'blue', phaseName: 'Copy Editing' },
  4: { name: 'Publishing Agent', color: 'teal', phaseName: 'Publishing Preparation' },
  5: { name: 'Marketing Agent', color: 'orange', phaseName: 'Marketing Strategy' }
}

// Issue Categories by Phase
export const ISSUE_CATEGORIES_BY_PHASE: Record<PhaseNumber, string[]> = {
  1: ['character', 'plot', 'pacing', 'structure', 'theme'],
  2: ['word_choice', 'sentence_flow', 'dialogue', 'voice', 'clarity'],
  3: ['grammar', 'punctuation', 'consistency', 'formatting'],
  4: [], // No issues in publishing phase
  5: []  // No issues in marketing phase
}

// ============================================
// Database Query Helpers
// ============================================

// Get active phase for a manuscript
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

// Get all phases for a manuscript
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

// Get chat history for current phase
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

// Save chat message
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

// Check if all chapters approved for a phase
export async function areAllChaptersApproved(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: PhaseNumber
): Promise<boolean> {
  const phaseColumn = `phase_${phaseNumber}_approved_at`

  const { data: totalChapters } = await supabase
    .from('chapters')
    .select('id', { count: 'exact' })
    .eq('manuscript_id', manuscriptId)

  const { data: approvedChapters } = await supabase
    .from('chapters')
    .select('id', { count: 'exact' })
    .eq('manuscript_id', manuscriptId)
    .not(phaseColumn, 'is', null)

  return totalChapters?.length === approvedChapters?.length
}

// Approve chapter for current phase
export async function approveChapterForPhase(
  supabase: SupabaseClient,
  chapterId: string,
  phaseNumber: PhaseNumber
): Promise<boolean> {
  const phaseColumn = `phase_${phaseNumber}_approved_at`

  const { error } = await supabase
    .from('chapters')
    .update({ [phaseColumn]: new Date().toISOString() })
    .eq('id', chapterId)

  if (error) {
    console.error('Error approving chapter:', error)
    return false
  }

  return true
}

// Create approved snapshot (called when phase completes)
export async function createApprovedSnapshot(
  supabase: SupabaseClient,
  manuscriptId: string,
  phaseNumber: PhaseNumber,
  editorName: EditorName
): Promise<boolean> {
  // Get all chapters for this manuscript
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('chapter_number, title, content')
    .eq('manuscript_id', manuscriptId)
    .order('chapter_number', { ascending: true })

  if (chaptersError || !chapters) {
    console.error('Error fetching chapters for snapshot:', chaptersError)
    return false
  }

  // Collate into single document
  const collatedContent = chapters
    .map(ch => {
      const chapterLabel = ch.chapter_number === 0 ? 'Prologue' : `Chapter ${ch.chapter_number}`
      return `# ${chapterLabel}: ${ch.title}\n\n${ch.content}`
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
      created_by_editor: editorName
    })

  if (error) {
    console.error('Error creating approved snapshot:', error)
    return false
  }

  return true
}

// Backward compatibility alias
export const ISSUE_CATEGORIES = ISSUE_CATEGORIES_BY_PHASE