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

Return the result through the save_pitch tool.`

  let pitch: PitchProfile
  try {
    const anthropic = new Anthropic({ apiKey })
    // Structured tool output — backCover, longPitch and spokenIntro are
    // multi-sentence prose with quotes and line breaks, which is where a
    // hand-written JSON reply breaks.
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      tools: [{
        name: 'save_pitch',
        description: 'Save the five pitch containers for this book.',
        input_schema: {
          type: 'object',
          properties: {
            oneLiner: { type: 'string', description: 'One sentence, under 25 words, that makes the right reader stop scrolling.' },
            compLine: { type: 'string', description: 'An X-meets-Y line using books this audience actually owns.' },
            backCover: { type: 'string', description: "The back-cover blurb, 120-170 words, in the book's voice." },
            longPitch: { type: 'string', description: '250-320 words for a blogger, journalist or agent: what it is, who it is for, why now.' },
            spokenIntro: { type: 'string', description: '30 seconds the author can say out loud on a podcast, written the way people actually talk.' },
          },
          required: ['oneLiner', 'compLine', 'backCover', 'longPitch', 'spokenIntro'],
        },
      }],
      tool_choice: { type: 'tool', name: 'save_pitch' },
      messages: [{ role: 'user', content: prompt }],
    })

    const block = res.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )
    if (!block) throw new Error('model did not return the structured result')
    const parsed = block.input as Partial<PitchProfile>

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
