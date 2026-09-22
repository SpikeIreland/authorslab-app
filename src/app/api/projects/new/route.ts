import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/projects/new
// Creates a fresh Write-path project with Wright as the active stage.
// Title and other metadata get filled in as Eliot's onboarding completes.
//
// status='ghostwriting' signals "Wright stage is active, no phase yet."
// Existing manuscripts use values like 'uploaded', 'editing', 'complete' —
// those are unaffected. As of 2026-09-22, the CHECK constraint on
// manuscripts.status includes 'ghostwriting' (migration
// add_ghostwriting_to_manuscripts_status_check); before that, this endpoint
// silently 500'd. current_phase_number is set NULL for pre-manuscript
// projects — the >=1 CHECK skips NULLs, and NULL is semantically correct
// for "no phase yet".
export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  // Insert a minimal manuscript record. The fields included match the
  // pattern used by /src/lib/supabase/queries.ts createManuscript() so the
  // existing schema is happy.
  const { data: manuscript, error: insertError } = await supabase
    .from('manuscripts')
    .insert({
      author_id: profile.id,
      title: 'Untitled project',
      genre: '',
      current_word_count: 0,
      full_text: '',
      total_chapters: 0,
      has_prologue: false,
      has_epilogue: false,
      status: 'ghostwriting',
      // 2026-09-22: `portal_phase: 0` removed. The column does not exist
      // on the manuscripts schema; it was phantom code in this endpoint
      // that never fired before Idea Mode landed (the status CHECK
      // constraint rejected 'ghostwriting' first). Once ghostwriting was
      // allowed via add_ghostwriting_to_manuscripts_status_check, the
      // insert made it further and died on `portal_phase` not existing.
      // Removed rather than added — nothing in the codebase reads it.
      current_phase_number: null,
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ id: manuscript.id })
}
