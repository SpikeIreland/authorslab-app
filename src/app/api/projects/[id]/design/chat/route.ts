import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// Taylor is the Design lead — covers, layout, format, typography. Voice and
// behaviour mirror the AuthorsLab design language (warm, confident,
// designerly). Project context is injected at runtime.
function buildTaylorSystemPrompt(args: {
  title: string
  genre: string
  selectedConcept: string | null
}): string {
  const projectMeta = args.genre
    ? `${args.title} (${args.genre})`
    : args.title

  const conceptLine = args.selectedConcept
    ? `The author has currently selected "${args.selectedConcept}".`
    : 'The author has not yet picked a concept.'

  return `You are Taylor, the Design lead at AuthorsLab. Your role is to help the author design the visual identity of their book — covers, interior layout, front and back matter, typography choices. You bring a designer's eye: clear principles, a real opinion when asked, comparisons to known works that inform the choice.

You are working on the project: ${projectMeta}.

The author can see four cover concepts in the centre of the screen, labelled Concept 1 through Concept 4. ${conceptLine} Use that context naturally — refer to "concept 2" or "the sage one" rather than describing covers in the abstract.

Voice: warm, confident, observational. You speak like a designer who has done this many times. Direct about what works and what doesn't, but you ask before you redirect. Brief is better than long. Plain prose, never markdown headings or bullet points.

If asked about other parts of the journey — editing (Alex, Sam, Jordan), publishing logistics (Morgan), marketing (Kai) — point the author to those agents rather than answer outside your specialty.`
}

// POST /api/projects/[id]/design/chat
// Body: { message: string }
// Saves the user message, calls Anthropic with Taylor's system prompt and
// the conversation history, persists Taylor's reply, returns it.
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

  // Verify the project belongs to the signed-in author and gather context.
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

  // Pull the currently-selected cover concept so Taylor can reference it.
  const { data: progress } = await supabase
    .from('publishing_progress')
    .select('selected_cover_url')
    .eq('manuscript_id', id)
    .maybeSingle()
  const selectedConcept = progress?.selected_cover_url ?? null

  // Persist the user message first so it survives even if the model fails.
  const { error: insertUserError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'design',
      role: 'user',
      content: userMessage,
    })
  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 })
  }

  // Load full history (now including the new user message).
  const { data: history, error: historyError } = await supabase
    .from('project_tab_messages')
    .select('role, content')
    .eq('manuscript_id', id)
    .eq('tab_id', 'design')
    .order('created_at', { ascending: true })
  if (historyError || !history) {
    return NextResponse.json({ error: historyError?.message ?? 'history_failed' }, { status: 500 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = buildTaylorSystemPrompt({
    title: manuscript.title ?? 'Untitled project',
    genre: manuscript.genre ?? '',
    selectedConcept,
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
      assistantReply = "Sorry — give me a moment and try that again?"
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'anthropic_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Persist Taylor's reply.
  const { error: insertAssistantError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'design',
      role: 'assistant',
      content: assistantReply,
    })
  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 })
  }

  return NextResponse.json({ reply: assistantReply })
}
