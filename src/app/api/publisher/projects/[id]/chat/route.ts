import { NextResponse } from 'next/server'
import { gatePublisherManuscript } from '@/lib/publisher/gateManuscript'
import { N8N_WEBHOOKS } from '@/lib/n8n-config'

/**
 * POST /api/publisher/projects/[id]/chat — the trade-register chat, journeyless.
 *
 * ─── WHY THERE IS A ROUTE AND NOT A DIRECT CALL ─────────────────────────────
 *
 * The author studio posts to the chat webhook from the browser. The publisher
 * chair does not, for three reasons that are all the same reason:
 *
 * 1. `audience` DECIDES THE REGISTER, so it must not be client-settable.
 *    `astudio`: pass `trade` and Alex speaks to the house about the author's
 *    manuscript; omit it and the author's voice is unchanged. A publisher able
 *    to send `audience: 'author'` could obtain a chat that addresses them as
 *    the writer of someone else's book. It is hard-coded below.
 * 2. The seat is checked server-side. `gatePublisherManuscript()` — the caller
 *    must hold a seat on this title's imprint, or 404.
 * 3. The webhook URL stays off the client for this surface.
 *
 * ─── JOURNEYLESS, BY RULING ─────────────────────────────────────────────────
 *
 * sysadmin, 2026-10-09, having read `2.5 Alex Chat` rather than inferring it:
 * `journey_id: body.journey_id || null` with no validation, and the three
 * journey writes guard on `NULLIF($1,'')::uuid` so an absent id updates zero
 * rows and errors on none. So the field is optional by construction.
 *
 * Whether a PUBLISHER-originated chat should create a journey at all is ruled
 * NOT YET: a journey is a record of editorial work with an actor, and a
 * house's conversation about someone else's book raises whose journey it is —
 * which is the modelling D2 freezes.
 *
 *   > No journey is better than a journey that claims the wrong actor.
 *
 * **So: no `journey_id` key at all.** Not an empty string, not a generated
 * one. The per-call cost ledger is independent of it, so telemetry survives.
 *
 * ─── THE TIMEOUT IS THE POINT, NOT A DETAIL ─────────────────────────────────
 *
 * sysadmin flagged one unverified risk: `Journey: Received` sits mid-chain
 * without `alwaysOutputData`, and a node emitting zero items stops its branch.
 * The Postgres v2 node normally substitutes a success item on zero rows — which
 * the NULLIF design assumes — but that is runtime behaviour nobody has
 * confirmed. If the substitution does not happen, a journeyless call does not
 * error: it stops before the response node and **the caller hangs**, which
 * sysadmin rightly called the worst of the three outcomes.
 *
 * I could not run their smoke test from my session (both egress proxies refuse
 * authorslab.app.n8n.cloud, and the connected n8n account holds a different
 * estate entirely). So rather than wait for someone else to prove a negative,
 * this route makes the bad outcome IMPOSSIBLE TO PRODUCE AS A HANG: an
 * AbortController caps the call, and a timeout returns a refusal the surface
 * renders as a failure. The untested branch can now only cost a wait and an
 * honest error, never a spinner with no end.
 */

/** Long enough for a model reply, short enough that a stalled branch is seen. */
const CHAT_TIMEOUT_MS = 60_000

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const gate = await gatePublisherManuscript(id)
  if (!gate.ok) return gate.refusal

  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const payload = parsed as {
    message?: unknown
    chapterNumber?: unknown
    chapterTitle?: unknown
    chapterContent?: unknown
    manuscriptTitle?: unknown
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  if (!message) return NextResponse.json({ error: 'empty_message' }, { status: 400 })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

  try {
    const res = await fetch(N8N_WEBHOOKS.alexChat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        manuscriptId: id,
        chapterNumber: typeof payload.chapterNumber === 'number' ? payload.chapterNumber : null,
        chapterTitle: typeof payload.chapterTitle === 'string' ? payload.chapterTitle : '',
        chapterContent: typeof payload.chapterContent === 'string' ? payload.chapterContent : '',
        // OMITTED when absent rather than sent as ''. The workflow fetches
        // manuscript context from the id; an empty title is not "no title", it
        // is a title that is empty, and the same discipline that keeps
        // journey_id out keeps this out.
        ...(typeof payload.manuscriptTitle === 'string' && payload.manuscriptTitle
          ? { manuscriptTitle: payload.manuscriptTitle }
          : {}),
        // THE REGISTER. Hard-coded: never taken from the request.
        audience: 'trade',
        // NO journey_id KEY. See the header — ruled, not forgotten.
        //
        // `authorFirstName` is also absent on purpose. The author's given name
        // is the author chair's context for being spoken to; in the trade
        // register the author is named as the ACTOR of their acts (B4), and
        // that naming is the service's to do from the manuscript it already
        // fetches. Sending a first name here would invite the register this
        // whole parameter exists to prevent.
      }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'chat_unavailable', detail: `upstream_${res.status}` },
        { status: 503 }
      )
    }

    const data = (await res.json()) as { response?: unknown; output?: unknown }
    const reply =
      typeof data.response === 'string' && data.response.trim()
        ? data.response
        : typeof data.output === 'string' && data.output.trim()
          ? data.output
          : null

    /**
     * AN UNEXPECTED SHAPE IS A FAILURE, NOT A SENTENCE.
     *
     * The author studio does `data.response || data.output || "I'm having
     * trouble connecting…"` and then writes that string into the conversation
     * ATTRIBUTED TO ALEX. So a successful call with an unfamiliar key becomes
     * the editor apparently speaking. This route returns a refusal instead,
     * and the column renders refusals without a byline — so nothing here can
     * be mistaken for something an editor said.
     */
    if (reply === null) {
      console.error(`publisher chat ${id}: unrecognised response shape`, Object.keys(data ?? {}))
      return NextResponse.json({ error: 'chat_unreadable' }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    if (aborted) {
      // The exact outcome sysadmin could not rule out, turned into a visible
      // failure rather than a hang.
      console.error(`publisher chat ${id}: timed out after ${CHAT_TIMEOUT_MS}ms`)
      return NextResponse.json({ error: 'chat_timeout' }, { status: 504 })
    }
    console.error(`publisher chat ${id}: dispatch failed:`, err)
    return NextResponse.json({ error: 'chat_unavailable' }, { status: 503 })
  } finally {
    clearTimeout(timer)
  }
}
