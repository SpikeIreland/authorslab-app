# Wright — positioning + shell direction

**From:** Paul (via architecture/shell chat)
**Date:** 2026-09-21
**Status:** Direction settled; execution to be scheduled by Wright chat post-Blair demo.
**Demo posture:** No Wright-specific work required for Wednesday. Book 3 (Carl's TBA) will be uploaded properly with its real title and manuscript, so the trilogy demo enters through Author Studio, not Wright. Wright showcase deferred; Idea-mode testing runs later on Paul's iCloud account.

---

## 1. Positioning ruling — three verbs, three surfaces

The clean demarcation between Wright, Author Studio, and Research is by what the author is *doing*, not who they're talking to:

- **Wright = write** — produce raw prose that didn't exist before.
- **Author Studio = edit** — improve prose that already exists. Alex (developmental), Sam (line), Jordan (copy).
- **Research = know** — facts, background, worldbuilding, comps, references.

**Craft-coaching questions belong to Wright (pre-manuscript) or Alex (in-edit), never to Research.** "Help me think through a tricky scene", "what should I be asking about my main character" — those are Wright/Alex work.

Research is the project's **knowledge base**. Facts, not feelings. Same pattern that made Clarence work.

## 2. What changed on Research today

Copy-only swap on `/projects/[id]/research/page.tsx` (commit c829d2b):

- Starter prompts now knowledge-oriented (comps, period-accurate details, timeline of world events)
- Placeholder rewritten: *"Ask anything that informs the world of your book — facts, background, comps, references…"*
- Empty-state copy rewritten: knowledge framing, not craft coaching

**Left for Research chat (task #121):** the backend chat system prompt at `/api/projects/[id]/research/chat` may still frame the agent as a craft companion. That needs aligning so the agent politely declines craft coaching and hands back to Wright/Alex. Copy-only surface swap without backend alignment will drift.

## 3. Wright's visibility — never hide, let state grammar do the work

Paul's original instinct was to hide Wright when a manuscript exists. Talked out of it. Reasoning:

- Carl's trilogy is the argument against hiding — Book 1 done, Book 2 in edit, Book 3 is just an idea. Wright is invisible for two, essential for one. Account-level hide breaks that.
- Real authors add scenes and chapters mid-edit. A publisher may say "we love it, but you need a new opening chapter" — that's a Wright task, not an Alex task.
- Sequels start from a finished book. Wright is the entry point.

**Better: keep Wright visible always. Let its state migrate:**

| Manuscript state | Wright | Author Studio |
|---|---|---|
| No manuscript (Idea mode) | active — "start writing" | pending |
| Manuscript uploaded | available — "add scenes, alt drafts, workshop" | active — editing in progress |
| Book launched | available — "start the sequel" | complete |

`ProjectTabStrip` already knows how to render active / available / complete / skipped states. This is a state-derivation change, not a visibility change.

## 4. Wright's post-manuscript context-awareness (task #120)

**The insight:** if Wright is available after a manuscript exists (for the "new opening" case), Ivy and Reid MUST know the book as it currently stands. Otherwise they're helping the author write scenes into a novel they've never read — any half-decent author spots that in 30 seconds and loses trust.

**What "know the current book" concretely means:**

1. Manuscript summary (project-level, one paragraph)
2. Chapter summaries (task #97 is the fix-it — pairedItem loss through Cell)
3. Character bible / cast list
4. Alex's developmental notes (already stored per project)
5. Design/tone decisions (voice, POV, tense)
6. Research knowledge base (cross-cutting)

**Pattern already exists.** Alex chat loads most of this into its system prompt. Wright should crib the same pattern with generative framing rather than editorial. **Port the pattern, don't invent it.** This is the most important Wright investment post-demo.

## 5. Wright's own layout — workshop, not chat page

Paul's direction: the current Wright page opens like a chat page. It should open like a **workshop**, mirroring the Author Studio layout — working canvas on the left, transcript panel on the right.

**Session flow through the transcript:**

- **Eliot** greets and runs the short intake ("what are you working on, what tone, non-fiction or fiction, do you already have a manuscript…")
- Once the Project Partner is decided, **Ivy or Reid picks up in the same transcript** where Eliot left off. No new panel, no reload — the transcript continues, the persona changes.

Careful wording: **"Project Partner"** — never "ghostwriter". The whole point is that Wright doesn't write for the author.

## 6. What still blocks all of this

Two upstream gaps, both known:

- **Task #113 — Idea (pre-manuscript) project mode.** The code checks `if (status === 'ghostwriting')` to render Wright as active. But the DB `CHECK` constraint on `manuscripts.status` only allows `'uploaded'`, `'analyzing'`, `'editing'`, `'complete'` — there is no ghostwriting/idea value. So no project can ever legitimately be in a pre-manuscript state. Any authentic Wright entry-point work depends on shipping this: schema migration + status value + copy in derivations + Lobby routing when the project has no manuscript.
- **Task #117 — grow `/projects/[id]/wright/`.** Currently a `PlaceholderTab` that redirects to standalone `/wright`. The workshop layout, the Eliot→Partner handoff transcript, and the project-shelled context all live inside this route once it's built out. The standalone `/wright` is where the real onboarding flow currently lives; that logic will need to move (or be embedded) into the project shell.

## 7. Suggested order (post-demo)

1. **Idea mode ships first** (#113). Without it, the pre-manuscript Wright entry is architecturally impossible.
2. **Then Wright inside the project shell** (#117 refocused as Wright build-out). Workshop layout, Eliot→Partner transcript, project-scoped route.
3. **Then Wright context-awareness** (#120). Port Alex chat's manuscript-loading pattern into Wright's system prompt.
4. **Research backend alignment** (#121) can happen in parallel with any of the above — no cross-dependency.

## 8. Handover asks of the Wright chat

- Take the above as the working position on Wright's role and voice.
- Own the specification and build of #117 (Wright inside project shell, workshop layout, Eliot→Partner transcript pattern).
- Coordinate with the shell/architecture chat on #113 (Idea mode is a shell decision — status enum, Lobby routing — but the copy and flow are Wright's).
- Coordinate with the Author Studio chat on #120 (port the manuscript-context pattern).
- Push back to the shell chat if any of the above positioning stops holding as you build.
