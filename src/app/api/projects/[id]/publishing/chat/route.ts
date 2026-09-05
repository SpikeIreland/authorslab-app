import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

interface BookMetadata {
  title?: string
  subtitle?: string
  description?: string
  categories?: string[]
  keywords?: string[]
}

// Morgan is the Publishing lead — book metadata, ISBN, pricing, platforms,
// launch coordination. The system prompt is enriched with the project's
// metadata so Morgan can advise specifically.
function buildMorganSystemPrompt(args: {
  title: string
  genre: string
  metadata: BookMetadata
}): string {
  const { title, genre, metadata } = args
  const projectMeta = genre ? `${title} (${genre})` : title

  const description = (metadata.description ?? '').trim()
  const descriptionWordCount = description ? description.split(/\s+/).length : 0
  const descriptionPreview = description.length > 200
    ? description.slice(0, 200) + '…'
    : description

  return `You are Morgan, the Publishing lead at AuthorsLab. Your role is to help the author with the logistical work of publishing — book metadata (title, subtitle, description, keywords, categories), ISBN choice, pricing, platform setup (Amazon KDP, IngramSpark, Apple Books, Kobo), and launch coordination.

You are working on the project: ${projectMeta}.

Current metadata draft:
- Title: ${metadata.title || 'not set'}
- Subtitle: ${metadata.subtitle || 'not set'}
- Description: ${description ? `${descriptionWordCount} words — "${descriptionPreview}"` : 'not yet drafted'}
- Categories: ${(metadata.categories ?? []).length > 0 ? (metadata.categories ?? []).join(', ') : 'none selected'}
- Keywords: ${(metadata.keywords ?? []).length} of 7 max ${(metadata.keywords ?? []).length > 0 ? `(${(metadata.keywords ?? []).join(', ')})` : ''}

The author can see a metadata form in the centre with these fields. Reference what's there or what's missing naturally.

Voice: warm, practical, knowledgeable. You speak like someone who has helped many authors navigate the publishing maze. Direct and clear — these are decisions with real money implications. Brief is better than long. Plain prose, never markdown headings or bullet points.

If asked about other parts of the journey — editing (Alex/Sam/Jordan), design (Taylor), marketing (Riley), Wright (Eliot/Ivy/Reid) — point the author to those agents.

Help the author make good decisions efficiently: which categories will get them found in their genre, what keywords matter, whether to use KDP Select exclusivity, what to price an eBook competitively. Be honest about platform trade-offs — KDP Select gives you reach but locks you in; expanded distribution is more work but bigger long-term.`
}

// POST /api/projects/[id]/publishing/chat
// Body: { message: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as { message?: string } | null
  if (!body?.message?.trim()) {
    return NextResponse.json({ error: 'missing message' }, { status: 400 })
  }
  const userMessage = body.message.trim()

  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  const { data: manuscript, error: msError } = await supabase
    .from('manuscripts')
    .select('id, title, genre, author_id')
    .eq('id', id)
    .single()
  if (msError || !manuscript || manuscript.author_id !== profile.id) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Pull current metadata for context.
  const { data: progress } = await supabase
    .from('publishing_progress')
    .select('metadata')
    .eq('manuscript_id', id)
    .maybeSingle()
  const metadata: BookMetadata = (progress?.metadata as BookMetadata) ?? {}

  // Persist user message first.
  const { error: insertUserError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'publishing',
      role: 'user',
      content: userMessage,
    })
  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 })
  }

  const { data: history, error: historyError } = await supabase
    .from('project_tab_messages')
    .select('role, content')
    .eq('manuscript_id', id)
    .eq('tab_id', 'publishing')
    .order('created_at', { ascending: true })
  if (historyError || !history) {
    return NextResponse.json({ error: historyError?.message ?? 'history_failed' }, { status: 500 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = buildMorganSystemPrompt({
    title: manuscript.title ?? 'Untitled project',
    genre: manuscript.genre ?? '',
    metadata,
  })

  let assistantReply: string
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    assistantReply = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    if (!assistantReply) {
      assistantReply = 'Sorry — try that again?'
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'anthropic_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: insertAssistantError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'publishing',
      role: 'assistant',
      content: assistantReply,
    })
  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 })
  }

  return NextResponse.json({ reply: assistantReply })
}
