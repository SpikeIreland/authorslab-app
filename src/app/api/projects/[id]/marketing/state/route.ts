import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects/[id]/marketing/state
// Returns the project's marketing state — launch date and which template
// tasks have been completed.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('project_marketing')
    .select('completed_task_ids')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // launch_date is deliberately absent: publisher ruled it dropped, not cached
  // (2026-09-29). Dates live in title_target_dates and are read from there.
  return NextResponse.json({
    completedTaskIds: data?.completed_task_ids ?? [],
  })
}

// PATCH /api/projects/[id]/marketing/state
// Body: { launchDate?: string | null, completedTaskIds?: string[] }
// Upserts the marketing state row. Either or both fields can be sent.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as
    | { completedTaskIds?: string[] }
    | null
  if (body === null) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  // Verify ownership.
  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('id', id)
    .eq('author_id', profile.id)
    .single()
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Read current row (if any) so a partial update preserves the other field.
  const { data: existing } = await supabase
    .from('project_marketing')
    .select('completed_task_ids')
    .eq('manuscript_id', id)
    .maybeSingle()

  const next = {
    manuscript_id: id,
    completed_task_ids: body.completedTaskIds !== undefined
      ? body.completedTaskIds
      : existing?.completed_task_ids ?? [],
    updated_at: new Date().toISOString(),
  }

  const { error: upsertError } = await supabase
    .from('project_marketing')
    .upsert(next, { onConflict: 'manuscript_id' })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({
    completedTaskIds: next.completed_task_ids,
  })
}
