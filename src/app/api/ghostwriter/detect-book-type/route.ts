import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { bookDescription } = await request.json()

    if (!bookDescription?.trim()) {
      return NextResponse.json({ error: 'Missing bookDescription' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Analyse this book description and respond with a JSON object containing two fields:

1. "signal": classify the book as one of exactly three values:
   - "memoir-personal" — memoir, autobiography, personal story, emotional journey, life experience, self-discovery
   - "ideas-argument" — non-fiction argument, philosophy, ideas, business, self-help, thought leadership, analysis
   - "neutral" — fiction, fantasy, thriller, romance, historical fiction, or genuinely unclear

2. "title": extract a working title of 3–6 words that captures the essence of what this book is about. If the author mentioned a title, use it. Otherwise derive one from their description.

Book description: "${bookDescription}"

Respond with only valid JSON, no markdown, no explanation. Example: {"signal":"memoir-personal","title":"A Life Between Two Worlds"}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'

    let parsed: { signal: string; title: string }
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { signal: 'neutral', title: 'Untitled' }
    }

    const validSignals = ['memoir-personal', 'ideas-argument', 'neutral']
    const signal = validSignals.includes(parsed.signal) ? parsed.signal : 'neutral'
    const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : 'Untitled'

    return NextResponse.json({ signal, title })
  } catch (error) {
    console.error('detect-book-type error:', error)
    return NextResponse.json({ signal: 'neutral', title: 'Untitled' }, { status: 500 })
  }
}
