import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Resolve the author profile for the currently signed-in user.
// Returns the profile id, or null if no session / no profile.
async function getAuthorProfileId(): Promise<{ profileId: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { profileId: null, error: 'unauthorized' }

  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (profileError || !profile) return { profileId: null, error: 'no_profile' }
  return { profileId: profile.id }
}

// GET /api/home/conversations
// List all conversations for the signed-in author, most recent first.
export async function GET() {
  const { profileId, error } = await getAuthorProfileId()
  if (!profileId) {
    return NextResponse.json({ error: error ?? 'unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error: queryError } = await supabase
    .from('home_conversations')
    .select('id, title, created_at, last_message_at')
    .eq('author_id', profileId)
    .order('last_message_at', { ascending: false })

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data ?? [] })
}

// POST /api/home/conversations
// Create a new (empty) conversation. Title can be supplied or defaulted.
export async function POST(req: NextRequest) {
  const { profileId, error } = await getAuthorProfileId()
  if (!profileId) {
    return NextResponse.json({ error: error ?? 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { title?: string }
  const title = body.title?.trim() || 'New conversation'

  const supabase = await createClient()
  const { data, error: insertError } = await supabase
    .from('home_conversations')
    .insert({ author_id: profileId, title })
    .select('id, title, created_at, last_message_at')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data })
}

// PATCH /api/home/conversations?id=<uuid>
// Rename a conversation.
export async function PATCH(req: NextRequest) {
  const { profileId, error } = await getAuthorProfileId()
  if (!profileId) {
    return NextResponse.json({ error: error ?? 'unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({})) as { title?: string }
  const title = body.title?.trim()
  if (!title) {
    return NextResponse.json({ error: 'missing title' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error: updateError } = await supabase
    .from('home_conversations')
    .update({ title })
    .eq('id', id)
    .eq('author_id', profileId)
    .select('id, title, created_at, last_message_at')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data })
}

// DELETE /api/home/conversations?id=<uuid>
// Delete a conversation and (via cascade) all of its messages.
export async function DELETE(req: NextRequest) {
  const { profileId, error } = await getAuthorProfileId()
  if (!profileId) {
    return NextResponse.json({ error: error ?? 'unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from('home_conversations')
    .delete()
    .eq('id', id)
    .eq('author_id', profileId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
