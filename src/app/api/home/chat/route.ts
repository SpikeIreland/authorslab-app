import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

// The Companion is the creative thinking partner on the Home tab. Voice and
// behaviour are intentionally narrow — see /docs/DESIGN_DECISIONS.md.
const COMPANION_SYSTEM_PROMPT = `You are a creative companion for an author using AuthorsLab — a platform that helps writers go from idea to published book. The author is at the earliest stage of thinking: they have an idea, a question, or just want to think out loud about something they're working on.

Your role is not to be a ghostwriter, an editor, or a publishing expert. Those are other people on the AuthorsLab team — Riley, Ivy, Reid, Alex, Sam, Jordan, Taylor, Morgan, Kai. Your role is to be a warm, perceptive thinking partner. You ask good questions. You reflect back what you hear with care. You point out interesting tensions or possibilities the author might not have noticed. You're never prescriptive. You help the author think.

When the author has an idea that feels concrete enough to develop further, you can suggest they "make it a project" — that promotes this conversation into a real project that takes them into the rest of AuthorsLab. Don't push it; let the author decide when an idea is ready.

Voice: warm, conversational, attentive. You speak like a thoughtful friend who happens to read a lot. You don't lecture. You don't list. You don't perform expertise. You're curious and present. Brief is better than long. Plain prose, never markdown headings or bullet points.

If asked about specific craft questions, give a brief real answer — but always invite further conversation rather than delivering a complete tutorial. The depth comes from dialogue, not monologue.

If asked about AuthorsLab itself, keep answers brief and helpful, then redirect back to the author's creative work when natural.

You don't have memory of prior sessions unless that conversation's history is loaded into your context. Treat each conversation as a focused thread.`

const MAX_TITLE_CHARS = 60

function deriveTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'New conversation'
  return trimmed.length <= MAX_TITLE_CHARS
    ? trimmed
    : trimmed.slice(0, MAX_TITLE_CHARS - 1) + '…'
}

// POST /api/home/chat
// Body: { conversationId: string, message: string }
// - Saves the user message
// - Loads recent history for context
// - Calls Anthropic
// - Saves the assistant reply
// - Updates conversation title (if first user message) and last_message_at
// - Returns the assistant reply
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as
    | { conversationId?: string; message?: string }
    | null
  if (!body?.conversationId || !body.message?.trim()) {
    return NextResponse.json({ error: 'missing conversationId or message' }, { status: 400 })
  }
  const conversationId = body.conversationId
  const userMessage = body.message.trim()

  // Resolve the author profile so we can verify ownership of the conversation.
  const { data: profile, error: profileError } = await supabase
    .from('author_profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (profileError || !profile) {
    return NextResponse.json({ error: 'no_profile' }, { status: 401 })
  }

  // Confirm the conversation belongs to this author.
  const { data: conversation, error: convError } = await supabase
    .from('home_conversations')
    .select('id, title, author_id')
    .eq('id', conversationId)
    .single()
  if (convError || !conversation || conversation.author_id !== profile.id) {
    return NextResponse.json({ error: 'conversation_not_found' }, { status: 404 })
  }

  // Save the user message first so it's persisted even if the model call fails.
  const { error: insertUserError } = await supabase
    .from('home_messages')
    .insert({ conversation_id: conversationId, role: 'user', content: userMessage })
  if (insertUserError) {
    return NextResponse.json({ error: insertUserError.message }, { status: 500 })
  }

  // Load the conversation history (now including the just-inserted user message).
  const { data: history, error: historyError } = await supabase
    .from('home_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (historyError || !history) {
    return NextResponse.json({ error: historyError?.message ?? 'history_failed' }, { status: 500 })
  }

  // Call Anthropic.
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  let assistantReply: string
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: COMPANION_SYSTEM_PROMPT,
      messages: history.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // Concatenate any text blocks in the response.
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
    .from('home_messages')
    .insert({ conversation_id: conversationId, role: 'assistant', content: assistantReply })
  if (insertAssistantError) {
    return NextResponse.json({ error: insertAssistantError.message }, { status: 500 })
  }

  // If this was the first user message, derive a title from it.
  const updates: { last_message_at: string; title?: string } = {
    last_message_at: new Date().toISOString(),
  }
  if (conversation.title === 'New conversation' && history.length === 1) {
    updates.title = deriveTitle(userMessage)
  }

  await supabase
    .from('home_conversations')
    .update(updates)
    .eq('id', conversationId)

  return NextResponse.json({
    reply: assistantReply,
    title: updates.title,
  })
}
