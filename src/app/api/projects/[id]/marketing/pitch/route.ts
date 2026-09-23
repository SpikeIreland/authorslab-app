import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// Riley's Pitch work for a project — the book in five containers.
//
//   GET  — read the saved pitch (null when none yet)
//   POST — write one from the audience profile + the book's own prose
//   PUT  — save the author's edits
//
// Pitch DEPENDS on Audience: a pitch written without knowing who it is for
// is just a summary. POST refuses with 409 `audience_required` when the
// profile is missing, and the UI sends the author to the Audience section.
//
// Stored on project_marketing.pitch (jsonb), which inherits that table's
// row policies — scoped by manuscript → author_profiles.auth_user_id.

export interface PitchProfile {
  oneLiner: string
  compLine: string
  backCover: string
  longPitch: string
  spokenIntro: string
  generatedAt: string
  editedAt?: string
}

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
    .select('id, title, genre, current_word_count')
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
    .select('pitch, audience')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // hasAudience lets the UI explain the dependency before the author clicks.
  return NextResponse.json({
    pitch: data?.pitch ?? null,
    hasAudience: Boolean(data?.audience),
  })
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

  const { data: marketing } = await supabase
    .from('project_marketing')
    .select('audience')
    .eq('manuscript_id', id)
    .maybeSingle()

  const audience = marketing?.audience as
    | { primaryReader?: string; readerDescription?: string; comps?: { title: string; author: string }[]; hooks?: string[] }
    | null
    | undefined

  if (!audience?.primaryReader) {
    return NextResponse.json({ error: 'audience_required' }, { status: 409 })
  }

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

  const compTitles = (audience.comps ?? [])
    .map(c => `${c.title}${c.author ? ` by ${c.author}` : ''}`)
    .join('; ')

  const prompt = `You are Riley, the Marketing lead at AuthorsLab, writing the pitch for an indie author's book.

Book: ${manuscript.title}${manuscript.genre ? ` (${manuscript.genre})` : ''}${manuscript.current_word_count ? `, ~${manuscript.current_word_count.toLocaleString()} words` : ''}

This book's agreed audience — write every line FOR this reader:
${audience.primaryReader}
${audience.readerDescription ?? ''}
${compTitles ? `Books they already own: ${compTitles}` : ''}
${audience.hooks?.length ? `Angles the author is leading with:\n${audience.hooks.map(h => `- ${h}`).join('\n')}` : ''}

${opening ? `The book's opening pages — match this voice, don't invent a different one:\n\n"""\n${opening}\n"""\n` : ''}

Write the pitch in five containers. Use the book's actual voice and actual specifics. No stock phrases ("a gripping tale", "will keep you turning pages", "in a world where"). No spoilers past the first act. Never claim awards, reviews, or sales.

Respond with ONLY a JSON object, no prose, no code fence:
{
  "oneLiner": "one sentence, under 25 words, that makes the right reader stop scrolling",
  "compLine": "an X-meets-Y line using books this audience actually owns",
  "backCover": "the back-cover blurb, 120-170 words, in the book's voice",
  "longPitch": "250-320 words for a blogger, journalist or agent - what it is, who it's for, why now",
  "spokenIntro": "30 seconds the author can say out loud on a podcast, written the way people actually talk"
}`

  let pitch: PitchProfile
  try {
    const anthropic = new Anthropic({ apiKey })
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no JSON object in model reply')
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<PitchProfile>

    if (!parsed.oneLiner || !parsed.backCover) {
      throw new Error('model reply missing oneLiner or backCover')
    }

    pitch = {
      oneLiner: String(parsed.oneLiner),
      compLine: String(parsed.compLine ?? ''),
      backCover: String(parsed.backCover),
      longPitch: String(parsed.longPitch ?? ''),
      spokenIntro: String(parsed.spokenIntro ?? ''),
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, pitch, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ pitch })
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

  const body = await req.json().catch(() => null) as { pitch?: PitchProfile } | null
  if (!body?.pitch?.oneLiner) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const pitch: PitchProfile = { ...body.pitch, editedAt: new Date().toISOString() }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, pitch, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ pitch })
}
