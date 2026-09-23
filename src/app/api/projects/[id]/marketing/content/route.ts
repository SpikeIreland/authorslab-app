import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { LAUNCH_TEMPLATE } from '@/lib/marketing/launchTemplate'

// Riley's Content work — the things the author actually posts and sends.
//
//   GET  — read the saved content pack (null when none yet)
//   POST — write one from the audience profile + the pitch + the book's prose
//   PUT  — save the author's edits
//
// Content depends on BOTH Audience and Pitch. Social posts are written for
// the channels named in the audience profile rather than a generic list, and
// the email sequence is pegged to the same milestones the Launch plan shows,
// so the two tabs describe one campaign instead of two.
//
// Stored on project_marketing.content (jsonb) — inherits that table's row
// policies, scoped by manuscript → author_profiles.auth_user_id.

export interface SocialPost { channel: string; body: string; note: string }
export interface SequenceEmail { label: string; timing: string; subject: string; body: string }
export interface OutreachNote { target: string; subject: string; body: string }
export interface ContentPack {
  social: SocialPost[]
  emails: SequenceEmail[]
  outreach: OutreachNote | null
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
    .select('id, title, genre')
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
    .select('content, audience, pitch')
    .eq('manuscript_id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // The UI explains which prerequisite is missing before the author clicks.
  return NextResponse.json({
    content: data?.content ?? null,
    hasAudience: Boolean(data?.audience),
    hasPitch: Boolean(data?.pitch),
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
    .select('audience, pitch')
    .eq('manuscript_id', id)
    .maybeSingle()

  const audience = marketing?.audience as
    | { primaryReader?: string; readerDescription?: string; channels?: { name: string; kind: string; note: string }[]; hooks?: string[] }
    | null | undefined
  const pitch = marketing?.pitch as
    | { oneLiner?: string; compLine?: string; backCover?: string }
    | null | undefined

  if (!audience?.primaryReader) {
    return NextResponse.json({ error: 'audience_required' }, { status: 409 })
  }
  if (!pitch?.oneLiner) {
    return NextResponse.json({ error: 'pitch_required' }, { status: 409 })
  }

  const channelList = (audience.channels ?? [])
    .map(c => `- ${c.name} (${c.kind})${c.note ? ` — ${c.note}` : ''}`)
    .join('\n')

  // Peg the sequence to the milestones the Launch plan already shows.
  const milestones = LAUNCH_TEMPLATE
    .map(m => `- ${m.label}`)
    .join('\n')

  const prompt = `You are Riley, the Marketing lead at AuthorsLab, writing the actual posts and emails an indie author will send for their book.

Book: ${manuscript.title}${manuscript.genre ? ` (${manuscript.genre})` : ''}

The agreed reader:
${audience.primaryReader}
${audience.readerDescription ?? ''}

The agreed pitch — stay consistent with these lines, don't invent new positioning:
One line: ${pitch.oneLiner}
${pitch.compLine ? `Shelf comparison: ${pitch.compLine}` : ''}
${pitch.backCover ? `Back cover: ${pitch.backCover}` : ''}
${audience.hooks?.length ? `Angles: ${audience.hooks.join(' | ')}` : ''}

Channels this reader actually uses — write one post per channel, in that channel's native register:
${channelList || '- No channels listed; write for one general social post and skip the rest.'}

The author's launch timeline has these milestones:
${milestones}

Write:
1. One social post per channel above. Match how people actually post there — a subreddit post is not an Instagram caption. No hashtag soup. Never fake reviews, sales figures, or awards.
2. A four-email sequence to the author's list, pegged to the milestones above. Real subject lines, not "Big news!".
3. One outreach note the author can send to a podcast host or book blogger from the channels above — short, specific, and easy to say yes to.

Write in the author's register, for this reader. No stock marketing phrases.

Respond with ONLY a JSON object, no prose, no code fence:
{
  "social": [{"channel": "name from the list above", "body": "the post", "note": "one line on when/how to post it"}],
  "emails": [{"label": "which milestone", "timing": "when to send", "subject": "subject line", "body": "the email"}],
  "outreach": {"target": "which channel or kind of host", "subject": "subject line", "body": "the note"}
}`

  let pack: ContentPack
  try {
    const anthropic = new Anthropic({ apiKey })
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
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
    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<ContentPack>

    if (!Array.isArray(parsed.social) && !Array.isArray(parsed.emails)) {
      throw new Error('model reply had neither social posts nor emails')
    }

    pack = {
      social: Array.isArray(parsed.social) ? parsed.social.slice(0, 8) : [],
      emails: Array.isArray(parsed.emails) ? parsed.emails.slice(0, 6) : [],
      outreach: parsed.outreach && parsed.outreach.body ? parsed.outreach : null,
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, content: pack, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ content: pack })
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

  const body = await req.json().catch(() => null) as { content?: ContentPack } | null
  if (!body?.content || (!Array.isArray(body.content.social) && !Array.isArray(body.content.emails))) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const content: ContentPack = { ...body.content, editedAt: new Date().toISOString() }

  const { error: saveError } = await supabase
    .from('project_marketing')
    .upsert(
      { manuscript_id: id, content, updated_at: new Date().toISOString() },
      { onConflict: 'manuscript_id' },
    )
  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ content })
}
