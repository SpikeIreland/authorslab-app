import { createClient } from './client'

const supabase = createClient()

export interface AuthorProfile {
  id: string
  auth_user_id: string
  first_name: string
  last_name: string
  email: string
  onboarding_complete: boolean
}

export interface Manuscript {
  id: string
  author_id: string
  title: string
  genre: string
  current_word_count: number
  total_chapters: number
  expected_chapters: number
  has_prologue: boolean
  has_epilogue: boolean
  portal_phase: number
  status: string
  full_text: string
  created_at: string
  updated_at: string
}

export interface Chapter {
  id: number
  manuscript_id: string
  chapter_number: number
  title: string
  content: string
  word_count: number
  status: string
  created_at: string
  updated_at: string
}

export interface ManuscriptScores {
  id: string
  manuscript_id: string
  structural: number
  character_score: number
  plot: number
  pacing: number
  thematic: number
  analysis_date: string
}

// Get author profile by auth user ID
export async function getAuthorProfile(authUserId: string) {
  const { data, error } = await supabase
    .from('author_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()

  if (error) throw error
  return data as AuthorProfile
}

// Create author profile
export async function createAuthorProfile(profile: {
  auth_user_id: string
  email: string
  first_name: string
  last_name: string
}) {
  const { data, error } = await supabase
    .from('author_profiles')
    .insert({
      ...profile,
      onboarding_complete: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data as AuthorProfile
}

// Update author profile
export async function updateAuthorProfile(
  authUserId: string, 
  updates: Partial<AuthorProfile>
) {
  const { data, error } = await supabase
    .from('author_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('auth_user_id', authUserId)
    .select()
    .single()

  if (error) throw error
  return data as AuthorProfile
}

// Get manuscripts by author
export async function getManuscriptsByAuthor(authorId: string) {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('*')
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Manuscript[]
}

// Get single manuscript
export async function getManuscript(manuscriptId: string) {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('*')
    .eq('id', manuscriptId)
    .single()

  if (error) throw error
  return data as Manuscript
}

// Create manuscript
export async function createManuscript(manuscript: {
  author_id: string
  title: string
  genre: string
  current_word_count: number
  full_text: string
  total_chapters?: number
  expected_chapters?: number
  has_prologue?: boolean
  has_epilogue?: boolean
}) {
  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      ...manuscript,
      portal_phase: 1,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data as Manuscript
}

// Update manuscript
export async function updateManuscript(
  manuscriptId: string,
  updates: Partial<Manuscript>
) {
  const { data, error } = await supabase
    .from('manuscripts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', manuscriptId)
    .select()
    .single()

  if (error) throw error
  return data as Manuscript
}

// Get chapters by manuscript
export async function getChaptersByManuscript(manuscriptId: string) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .order('chapter_number', { ascending: true })

  if (error) throw error
  return data as Chapter[]
}

// Create chapter
export async function createChapter(chapter: {
  manuscript_id: string
  chapter_number: number
  title: string
  content: string
  word_count: number
}) {
  const { data, error } = await supabase
    .from('chapters')
    .insert({
      ...chapter,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data as Chapter
}

// Update chapter
export async function updateChapter(
  chapterId: number,
  updates: Partial<Chapter>
) {
  const { data, error } = await supabase
    .from('chapters')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', chapterId)
    .select()
    .single()

  if (error) throw error
  return data as Chapter
}

// Get manuscript scores
export async function getManuscriptScores(manuscriptId: string) {
  const { data, error } = await supabase
    .from('manuscript_scores')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data as ManuscriptScores | null
}

// Create or update manuscript scores
export async function upsertManuscriptScores(scores: {
  manuscript_id: string
  structural: number
  character_score: number
  plot: number
  pacing: number
  thematic: number
}) {
  const { data, error } = await supabase
    .from('manuscript_scores')
    .upsert({
      ...scores,
      analysis_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'manuscript_id'
    })
    .select()
    .single()

  if (error) throw error
  return data as ManuscriptScores
}