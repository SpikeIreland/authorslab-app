import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// Riley's Audience work for a project.
//
//   GET  — read the saved audience profile (null when none yet)
//   POST — generate one from the manuscript itself, then save it
//   PUT  — save the author's edits
//
// Stored as jsonb on project_marketing.audience, which inherits that table's
// row policies (scoped by manuscript → author_profiles.auth_user_id). The
// sibling table marketing_campaigns is NOT used: its policy compares
// auth.uid() to author_id, which holds an author_profiles.id — a different
// id space, so the policy matches 0 rows of 11 and the table is unreachable
// through RLS. See marketing-hub's 2026-09-23 courier.

export interface AudienceComp { title: string; author: string; why: string }
export interface AudienceChannel { name: string; kind: string; note: string }
export interface AudienceProfile {
  primaryReader: string
  readerDescription: string
  comps: AudienceComp[]
  channels: AudienceChannel[]
  hooks: string[]
  avoid: string[]
  generatedAt: string
  editedAt?: string
}

// Confirm the caller owns this project. Returns the manuscript or null.
async function ownedManuscript(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  manuscriptId: string,
) {
  const { data: profile } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', userId)
    .single()
  if (!profile) return null

  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id, title, genre, current_word_count, total_chapters')
    .eq('id', manuscriptId)
    .eq('author_id', profile.id)
    .single()
  return manuscript ?? null
}

// ---------------------------------------------------------------- GET

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('project_marketing')
    .select('audience')
    .eq('manuscript_id', id)
    .maybeSingle()

  // Fail visible, not silently green: if the column is missing the estate
  // needs to know, rather than the tab quietly showing an empty state.
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ audience: data?.audience ?? null })
}

// ---------------------------------------------------------------- POST

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const manuscript = await ownedManuscript(supabase, user.id, id)
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  // Ground the profile in the book itself, not just its genre label.
  const { data: chapters } = await supabase
    .from('chapters')
    .select('content')
    .eq('manuscript_id', id)
    .not('content', 'is', null)
    .order('chapter_number', { ascending: true })
    .limit(3)

  const opening = (chapters ?? [])
    .map(c => (c.content as string | null) ?? '')
    .join('\n\n')
    .slice(0, 6000)

  const meta = [
    `Title: ${manuscript.title}`,
    manuscript.genre ? `Genre: ${manuscript.genre}` : null,
    manuscript.current_word_count ? `Length: ~${manuscript.current_word_count.toLocaleString()} words` : null,
    manuscript.total_chapters ? `Chapters: ${manuscript.total_chapters}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `You are Riley, the Marketing lead at AuthorsLab, building a reader-audience profile for an indie author's book so they can market it well.

${meta}

${opening ? `The opening pages:\n\n"""\n${opening}\n"""\n` : 'No manuscript text is available yet — work from the title and genre.'}

Produce a specific, useful audience profile. Ground it in what this book actually is — voice, tone, preoccupations — not in generic advice for the genre. Comparable titles must be real books a reader of THIS book would already own; say briefly why each one matches. Channels must be places that actually exist and that an indie author can reach without a publicist.

Respond with ONLY a JSON object, no prose, no code fence:
{
  "primaryReader": "one vivid line naming who this is for",
  "readerDescription": "2-3 sentences on what they read, what they want from a book like this, what makes them buy",
  "comps": [{"title": "...", "author": "...", "why": "one line"}],
  "channels": [{"name": "...", "kind": "subreddit|newsletter|podcast|goodreads-list|youtube|bookstore|other", "note": "how to approach it"}],
  "hooks": ["3-5 short angles to lead with when pitching this book"],
  "avoid": ["2-3 things that would waste this author's time or misrepresent the book"]
}
Give 4 comps and 5 channels.`

  let profile: AudienceProfile
  try {
    const anthropic = new Anthropic({ apiKey })
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    // Tolerate a stray code fence or leading prose.
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no JSON object in model reply')
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<AudienceProfile>

    if (!parsed.primaryReader) throw new Error('model reply missing primaryReader')

    profile = {
      primaryReader: String(parsed.primaryReader),
      readerDescription: String(parsed.readerDescription ?? ''),
      comps: Array.isArray(parsed.comps) ? parsed.comps.slice(0, 6) : [],
      channels: Array.isArray(parsed.channels) ? parsed.channels.slice(0, 8) : [],
      hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 6) : [],
      avoid: Array.isArray(parsed.avoid) ? parsed.avoid.slice(0, 4) : [],
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, audience: profile, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ audience: profile })
}

// ---------------------------------------------------------------- PUT

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const manuscript = await ownedManuscript(supabase, user.id, id)
  if (!manuscript) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null) as { audience?: AudienceProfile } | null
  if (!body?.audience?.primaryReader) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const audience: AudienceProfile = { ...body.audience, editedAt: new Date().toISOString() }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, audience, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ audience })
}
