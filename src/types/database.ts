// src/types/database.ts
// Updated TypeScript interfaces for clean architecture

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
  genre: string | null
  total_chapters: number
  current_word_count: number
  has_prologue: boolean
  has_epilogue: boolean
  
  // Original Upload
  original_upload_text: string | null
  original_upload_url: string | null
  full_text: string | null // Keep for workflow compatibility
  
  // Analysis Data (shared across phases)
  manuscript_summary: string | null
  full_analysis_key_points: string | null
  full_analysis_text: string | null
  report_pdf_url: string | null
  
  // Status
  status: 'uploaded' | 'analyzing' | 'editing' | 'complete'
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
  editor_name: 'Alex' | 'Sam' | 'Jordan' | 'Taylor' | 'Quinn'
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
  version_type: 'approved_snapshot' | 'working_draft' | 'print_format' | 'epub' | 'mobi' | 'pdf_review'
  
  // Content
  content: string
  word_count: number
  
  // Metadata
  created_by_editor: string | null
  notes: string | null
  format_metadata: Record<string, any> | null
  
  // Timestamps
  created_at: string
}

export interface Chapter {
  id: string
  manuscript_id: string
  
  // Chapter Identity
  chapter_number: number
  title: string
  content: string
  word_count: number
  
  // Context for AI
  chapter_summary: string | null
  
  // Phase-Specific Approvals
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
  phase_number: number
  
  // Message
  sender: 'Alex' | 'Sam' | 'Jordan' | 'Taylor' | 'Quinn' | 'Author'
  message: string
  
  // Context
  chapter_number: number | null
  
  // Metadata
  created_at: string
}

// Helper Types
export type EditorName = 'Alex' | 'Sam' | 'Jordan' | 'Taylor' | 'Quinn'
export type EditorColor = 'green' | 'purple' | 'blue' | 'teal' | 'orange'
export type PhaseNumber = 1 | 2 | 3 | 4 | 5
export type PhaseStatus = 'pending' | 'active' | 'complete' | 'on_hold' | 'skipped'

// Editor Configuration
export const EDITOR_CONFIG: Record<PhaseNumber, { 
  name: EditorName
  color: EditorColor
  phaseName: string 
}> = {
  1: { name: 'Alex', color: 'green', phaseName: 'Developmental Editing' },
  2: { name: 'Sam', color: 'purple', phaseName: 'Line Editing' },
  3: { name: 'Jordan', color: 'blue', phaseName: 'Copy Editing' },
  4: { name: 'Taylor', color: 'teal', phaseName: 'Publishing Preparation' },
  5: { name: 'Quinn', color: 'orange', phaseName: 'Marketing Strategy' }
}

// Issue Categories by Phase
export const ISSUE_CATEGORIES: Record<PhaseNumber, string[]> = {
  1: ['character', 'plot', 'pacing', 'structure', 'theme'],
  2: ['word_choice', 'sentence_flow', 'dialogue', 'voice', 'clarity'],
  3: ['grammar', 'punctuation', 'consistency', 'formatting'],
  4: [], // No issues in publishing
  5: []  // No issues in marketing
}