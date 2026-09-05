import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { LAUNCH_TEMPLATE, launchCountdown } from '@/lib/marketing/launchTemplate'

// Riley is the Marketing lead — audience, pitch, launch plan, content,
// reviews, performance. The system prompt is enriched with the project's
// metadata, the chosen launch date, and which template tasks have been
// completed so Riley can advise specifically.
// (Persona renamed from Kai → Riley on 2026-09-05.)
function buildRileySystemPrompt(args: {
  title: string
  genre: string
  launchDate: string | null
  completedTaskIds: string[]
}): string {
  const { title, genre, launchDate, completedTaskIds } = args
  const projectMeta = genre ? `${title} (${genre})` : title

  const launchLine = launchDate
    ? `Launch date: ${new Date(launchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — ${launchCountdown(launchDate)}.`
    : 'No launch date has been set yet. Encourage the author to pick one when it feels natural — it anchors everything.'

  // List incomplete tasks so Riley knows what's outstanding.
  const completedSet = new Set(completedTaskIds)
  const outstanding: string[] = []
  for (const m of LAUNCH_TEMPLATE) {
    for (const t of m.tasks) {
      if (!completedSet.has(t.id)) {
        outstanding.push(`${m.label}: ${t.label}`)
      }
    }
  }
  const outstandingBlock = outstanding.length > 0
    ? `Outstanding launch tasks the author hasn't ticked yet:\n${outstanding.map(s => `- ${s}`).join('\n')}`
    : 'All template launch tasks are marked complete.'

  return `You are Riley, the Marketing lead at AuthorsLab. Your role is to help the author plan and execute their book launch and ongoing marketing — audience, pitch, launch plan, content, reviews, post-launch performance.

You are working on the project: ${projectMeta}.
${launchLine}

The author can see a launch plan timeline in the centre with milestones (4 weeks before, 2 weeks before, launch week, launch day, 1 week after) and tasks under each. Reference specific tasks naturally when relevant — "the email list task" or "the launch week social blitz".

${outstandingBlock}

Voice: warm, energetic, practical. You speak like a marketer who has launched many books and knows what actually moves the needle. Direct about what works — including being honest when something isn't worth the effort. Brief is better than long. Plain prose, never markdown headings or bullet points.

If asked about other parts of the journey — editing (Alex/Sam/Jordan), design (Taylor), publishing logistics (Morgan), Wright (Eliot/Ivy/Reid) — point the author to those agents.

You're at your most useful in launch week and the weeks leading up to it. Help the author prioritize: what matters most this week, what they can defer, what they should NOT do. Indie authors waste enormous energy on marketing that doesn't pay back — your job is to help them spend their time well.`
}

// POST /api/projects/[id]/marketing/chat
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

  // Verify ownership.
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

  // Pull marketing state for the system prompt.
  const { data: marketing } = await supabase
    .from('project_marketing')
    .select('launch_date, completed_task_ids')
    .eq('manuscript_id', id)
    .maybeSingle()

  // Persist the user message first so it survives even if the model fails.
  const { error: insertUserError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'marketing',
      role: 'user',
      content: userMessage,
    })
  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 })
  }

  // Load full conversation history.
  const { data: history, error: historyError } = await supabase
    .from('project_tab_messages')
    .select('role, content')
    .eq('manuscript_id', id)
    .eq('tab_id', 'marketing')
    .order('created_at', { ascending: true })
  if (historyError || !history) {
    return NextResponse.json({ error: historyError?.message ?? 'history_failed' }, { status: 500 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  const systemPrompt = buildRileySystemPrompt({
    title: manuscript.title ?? 'Untitled project',
    genre: manuscript.genre ?? '',
    launchDate: marketing?.launch_date ?? null,
    completedTaskIds: marketing?.completed_task_ids ?? [],
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
      assistantReply = "Give me a moment — try that again?"
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'anthropic_failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Persist Riley's reply.
  const { error: insertAssistantError } = await supabase
    .from('project_tab_messages')
    .insert({
      manuscript_id: id,
      tab_id: 'marketing',
      role: 'assistant',
      content: assistantReply,
    })
  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 })
  }

  return NextResponse.json({ reply: assistantReply })
}
