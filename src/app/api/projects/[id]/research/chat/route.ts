import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// The Companion is the same agent the author meets on Home. Inside a
// project's Research tab, the system prompt is enriched with the project's
// metadata so the agent can engage specifically with this book.
function buildResearchCompanionPrompt(args: {
  title: string
  genre: string
  wordCount: number | null
  summary: string | null
  keyPoints: string | null
}): string {
  const { title, genre, wordCount, summary, keyPoints } = args

  const wordCountLine = wordCount
    ? `${wordCount.toLocaleString()} words`
    : 'word count not yet known'

  const summaryBlock = summary
    ? `Project summary (from a prior analysis):\n${summary}`
    : 'No project summary has been generated yet.'

  const keyPointsBlock = keyPoints
    ? `Key points from the analysis:\n${keyPoints}`
    : ''

  return `You are the Companion — the same warm, perceptive thinking partner the author meets on the AuthorsLab Home page. Here, on this project's Research tab, you have additional context: you know what they are working on.

Project context:
- Title: ${title}
- Genre: ${genre || 'not specified'}
- Length: ${wordCountLine}

${summaryBlock}
${keyPointsBlock}

Use this context naturally — don't recite it back, just let it inform your responses. If the author asks about a character, theme, or aspect of their book that isn't in your loaded context, ask gently rather than guess.

Your role: help the author research, think through, and develop their work. Other agents on the AuthorsLab team handle other things — Riley (matching to a ghostwriter), Ivy and Reid (ghostwriting), Alex (developmental editing), Sam (line editing), Jordan (copy editing), Taylor (design), Morgan (publishing logistics), Kai (marketing). When a question is firmly in someone else's specialty, point the author to that agent. Otherwise, dig in.

If the author is researching a topic for their book — a historical period, a profession, a setting, a craft technique — engage deeply but stay practical. They need usable material, not a tutorial.

Voice: warm, conversational, attentive. You speak like a thoughtful friend who happens to read a lot. Brief is better than long. Plain prose, never markdown headings or bullet points.`
}

// POST /api/projects/[id]/research/chat
// Body: { message: string }
// Saves the user message, calls Anthropic with the project-aware Companion
// system prompt and the conversation history, persists the reply, returns it.
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

  // Verify ownership and pull project context for the system prompt.
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
    .select('id, title, genre, current_word_count, manuscript_summary, full_analysis_key_points, author_id')
    .eq('id', id)
    .single()
  if (msError || !manuscript || manuscript.author_id !== profile.id) {
    return NextResponse.json({ error: 'project_not_found' }, { status: 404 })
  }

  // Persist the user message first so it survives even if the model fails.
  const { error: insertUserError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'research',
      role: 'user',
      content: userMessage,
    })
  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 })
  }

  // Load full conversation history for context.
  const { data: history, error: historyError } = await supabase
    .from('project_tab_messages')
    .select('role, content')
    .eq('manuscript_id', id)
    .eq('tab_id', 'research')
    .order('created_at', { ascending: true })
  if (historyError || !history) {
    return NextResponse.json({ error: historyError?.message ?? 'history_failed' }, { status: 500 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = buildResearchCompanionPrompt({
    title: manuscript.title ?? 'Untitled project',
    genre: manuscript.genre ?? '',
    wordCount: manuscript.current_word_count ?? null,
    summary: manuscript.manuscript_summary ?? null,
    keyPoints: manuscript.full_analysis_key_points ?? null,
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
      assistantReply = "I'm here. Tell me a bit more about what you're thinking?"
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'anthropic_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Persist the assistant reply.
  const { error: insertAssistantError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'research',
      role: 'assistant',
      content: assistantReply,
    })
  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 })
  }

  return NextResponse.json({ reply: assistantReply })
}
