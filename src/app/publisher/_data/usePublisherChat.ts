'use client'

/**
 * THE TRADE-REGISTER CHAT — the conversation column's second caller.
 *
 * ─── NOTHING HERE EVER SPEAKS AS AN EDITOR ──────────────────────────────────
 *
 * The only entries with a byline are ones the service actually returned. A
 * failure sets `failure`, which `StudioConversation` renders with no byline at
 * all — because the author studio's chat does the opposite, writing its own
 * network errors and any unrecognised response shape into the history
 * attributed to Alex, in the first person. That is the defect this hook is
 * written not to have.
 *
 * ─── IN-SESSION ONLY, AND SAID SO ───────────────────────────────────────────
 *
 * There is no publisher chat table. These turns live in this tab and are gone
 * on reload, which is exactly what the notes column used to be before C1 —
 * and the reason the surface must not imply otherwise. The caller renders the
 * sentence; this hook does not pretend to persist.
 */

import { useCallback, useState } from 'react'

export interface ChatTurn {
  id: string
  /** 'house' = the publisher's own question. 'editor' = a returned reply. */
  from: 'house' | 'editor'
  body: string
  at: string
}

export function usePublisherChat(manuscriptId: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [thinking, setThinking] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const ask = useCallback(
    async (
      message: string,
      context: {
        chapterNumber: number | null
        chapterTitle: string
        chapterContent: string
      }
    ) => {
      const mine: ChatTurn = {
        id: `h-${Date.now()}`,
        from: 'house',
        body: message,
        at: new Date().toISOString(),
      }
      setTurns((t) => [...t, mine])
      setThinking(true)
      setFailure(null)

      try {
        const res = await fetch(`/api/publisher/projects/${manuscriptId}/chat`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message, ...context }),
        })

        if (!res.ok) {
          let code = `http_${res.status}`
          try {
            const err = (await res.json()) as { error?: string }
            if (typeof err.error === 'string') code = err.error
          } catch { /* a non-JSON refusal is still a refusal */ }
          // A REFUSAL, NOT A REPLY. No turn is appended, so nothing enters the
          // conversation that an editor did not say.
          setFailure(describe(code))
          return
        }

        const data = (await res.json()) as { reply?: string }
        if (!data.reply) {
          setFailure(describe('chat_unreadable'))
          return
        }
        setTurns((t) => [
          ...t,
          { id: `e-${Date.now()}`, from: 'editor', body: data.reply as string, at: new Date().toISOString() },
        ])
      } catch {
        setFailure(describe('network'))
      } finally {
        setThinking(false)
      }
    },
    [manuscriptId]
  )

  return { turns, thinking, failure, ask }
}

/**
 * Failures in the publisher's own register, and each one says what is true
 * rather than apologising in general terms. `chat_timeout` names the specific
 * outcome sysadmin could not rule out by reading the workflow.
 */
function describe(code: string): string {
  switch (code) {
    case 'chat_timeout':
      return 'No reply came back in time. Nothing was lost — ask again, and if it keeps timing out the editorial service is not responding.'
    case 'chat_unreadable':
      return 'A reply came back in a form this page could not read. It has not been shown rather than guessed at.'
    case 'chat_unavailable':
      return 'The editorial service is not reachable at the moment.'
    case 'not_found':
      return 'This title is not on your list.'
    case 'empty_message':
      return 'Nothing was sent.'
    case 'network':
      return 'The request did not complete. Your connection may have dropped.'
    default:
      return 'The question was not answered. Nothing has been recorded.'
  }
}
