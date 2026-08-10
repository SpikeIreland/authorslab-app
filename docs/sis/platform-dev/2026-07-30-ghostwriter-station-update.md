# Ghostwriter Station — update memo

**AL-PDC-GW-UPDATE-001 · 2026-07-30**
**From:** Platform Developer station
**To:** Ghostwriter Station chat (existing / operational)

This is an update memo, not a seed brief — the Ghostwriter chat is already running. Two things landed at the founding-level that you should absorb before the next work moves, plus one new architectural principle that specifically shapes what the Ghostwriter station is *for*.

## 1 · Rename decision (small, mechanical, first move of the chat)

Paul has decided:

- **Eden → Riley.** The ghostwriter-companion persona takes a new name. Rationale: gender-neutral, warm, literary. Eden had been read as feminine by some users; the persona quintet works better when every persona reads as person-first, not gender-first.
- **Marketing persona (was Riley) → Kai.** Freed up "Riley" for the ghostwriter role. Kai is short, crisp, gender-neutral, distinct.

Nothing is live in production for either persona yet — no user has interacted with Eden or Marketing-Riley by name — so this is a low-risk rename sweep. Suggested first move of the chat:

- **Code**: `personaColourFor` in `src/app/lobby/_components/derivations.ts` — swap `eden` → `riley`, and shift the current `riley` colour (`var(--color-faint)`) to a new `kai` entry. Also `activePersonaFor`, greeting messages that mention Eden by name, any UI copy.
- **n8n**: `7.01 Eden Match` → `7.01 Riley Match` (id `mvOMgVKOkqh5hD2b`). `7.04 Ghostwriter Read Material` stays (that's the station name, not a persona). Also anywhere Eden appears in workflow node names, system prompts, or Postgres writes.
- **Docs**: any prior handover doc mentioning Eden by name (grep `docs/` for `Eden`) — usually leave historical docs alone and note the rename in a top-line update.

## 2 · The sacred / shared architecture (this is why the Ghostwriter station matters)

Paul and Carl have ratified a founding architectural distinction that shapes the whole platform:

- **Sacred space** (private to the author, always): The Library, Project Overview, Author Studio (Alex/Sam/Jordan), all Riley/companion interactions, any of Riley's memory of the author's work. No third party — publisher included — ever sees inside this.
- **Shared-by-invitation space** (author explicitly opens to a named publisher): Design tab, Publishing tab, Marketing tab.
- **Publisher's own surface** (publisher role, separate account type): a global dashboard listing the authors they're working with — with no path into anyone's writing.

**Riley belongs firmly in the sacred space.** She is the author's companion during the vulnerable act of writing. Anything Riley knows or remembers stays with the author, never leaks to publisher-visible surfaces. This is a hard rule, not a soft preference.

## 3 · Context awareness (new direction to plan for)

Longer-term Ghostwriter roadmap: Riley becomes context-aware across the author's entire journey. Every AI agent (Alex/Sam/Jordan/Taylor/Kai) writes an entry to a shared **activity log** after each action. Riley reads that log so she always knows what the author has been doing — what Alex just flagged, which chapter Sam is on, what Taylor mocked up. Framing: writing is a lonely profession; the value of a collaborator who genuinely remembers and understands you is significant.

Practical implications for the Ghostwriter station chat to think through:

- Activity log storage: probably new Supabase table (`agent_activity` or similar), distinct from `as_journeys` (which tracks workflow state, not agent-user interactions). Existing `as_journeys` schema is a good reference for design.
- Every agent writes on completion of meaningful action. Every Riley read includes recent activity context in her system prompt.
- Deterministic guardrails: the log itself is deterministic (structured writes, predictable reads); Riley's *use* of the log is stochastic (LLM synthesis). This split respects the SIS stochastic/deterministic hybrid principle.

Also planned but not yet designed:

- **Persistent Riley presence in the header** — Riley icon available from every authenticated page (Clarence has this pattern). Opens a chat panel. Cross-cutting UI change.
- **Knowledge-tab-style multi-thread UI** — Riley as research assistant, with historical chat list. Similar to Clarence's Knowledge tab.

These are large bodies of work — not for immediate execution. Land the rename + absorb the sacred/shared distinction first; the context-awareness and persistent-presence work follow.

## 4 · Stochastic / deterministic bounds

Standing SIS principle applies to all new Ghostwriter work. Any surface where Riley generates content is stochastic; the plumbing (activity log writes, permissions, journey state) is deterministic. New designs should articulate which pieces sit where and why. Craft Call Cell is now live in production and is the primary route for stochastic LLM calls — Riley's LLM calls go through it (see any of the DP-CC completion docs for the pattern).

## 5 · Coordination

- **Platform Dev chat** (this one) owns the code + infrastructure + n8n. Ping when Ghostwriter work needs a code change or new workflow.
- **UI/UX Design chat** owns the visual language (Manuscript Room palette + state grammar). Ping for any new Riley surface design.
- **Taylor Design & Publishing chat** (new) owns publisher-side work — Ghostwriter and Taylor never overlap since one is sacred and the other is shared.
- **Demo & Content Ops chat** (new) owns Carl's demo accounts + September Jacky Klein prep. Ghostwriter work that needs to be demo-ready by September should coordinate with them.

— Platform Developer station
