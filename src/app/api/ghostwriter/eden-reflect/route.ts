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
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `An author has just described their book to you. In one warm, brief sentence, mirror back the essence of what they said. No generic praise. No questions. No "that sounds wonderful". Just reflect what they told you, naturally, as if you understand it.

Author's description: "${bookDescription}"

Respond with only the one sentence.`,
        },
      ],
    })

    const reflection =
      message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    return NextResponse.json({ reflection })
  } catch (error) {
    console.error('eden-reflect error:', error)
    return NextResponse.json({ error: 'Failed to generate reflection' }, { status: 500 })
  }
}
