# Ghostwriter tab — chat brief

You are starting a new chat to work on the **Ghostwriter tab** for AuthorsLab. This document is the full briefing — read it carefully before doing anything else, then read the linked code and design files.

## What AuthorsLab is

AuthorsLab is a writer's workspace that helps authors go from idea → published book. It is being redesigned (May 2026) from a per-manuscript editing service into a multi-project subscription platform. A writer signs in, sees their **Lobby** (list of projects), opens any project, and that project has a **horizontal tab strip** of stages and tools: `Ghostwriter`, `Author Studio`, `Design`, `Publishing`, `Marketing`, `Research`, `Script`. The Ghostwriter tab is the first stage — for projects that don't start with a finished manuscript.

**Read `/docs/DESIGN_DECISIONS.md` first.** That captures the locked decisions you need to respect.

## What's already in the codebase

There's existing Ghostwriter work that needs to be brought up to date with the new model. It currently lives as a separate funnel on its own subdomain pattern, not as a tab inside a project.

- `/src/app/ghostwriter/page.tsx` (673 lines) — Eden's onboarding. Five-question flow, matches the writer to Ivy or Reid. Currently a standalone page that ends by routing to `/ghostwriter/studio`.
- `/src/app/ghostwriter/studio/page.tsx` (657 lines) — Ivy/Reid studio with section map (left), content (centre), chat (right). Loads a `ghostwriter_sessions` row by author + status='active'.
- `/src/lib/n8n-config.ts` — Ghostwriter webhooks under "Phase 7 — Ghost Writer": `edenMatch`, `ivyChat`, `reidChat`, `ghostwriterGapAnalysis` (workflow registered as "Ghostwriter Read Material").
- `/ghostwriter-handover-brief-3.md` at repo root — the original spec written when Ghostwriter was a separate product. Useful for tone, Eden's exact questions, Ivy/Reid system prompt intent. **Note that the standalone-subdomain framing in this brief is superseded** — see "What's changed" below.

Database tables already in place (in Supabase, project name "Author Portal"):

- `ghostwriter_sessions` — one per author book project. Currently keyed by `author_id`, status. Missing a clean `manuscript_id` link (only has `handed_off_manuscript_id` for the output handover).
- `ghostwriter_sections` — section map, builds progressively as Ivy/Reid extract material.
- `ghostwriter_chat` — persistent chat history.
- `author_profiles` already has the relevant flags: `has_ghostwriter_access`, `ghostwriter_agent`, `ghostwriter_book_title`, `ghostwriter_onboarding_completed`, `ghostwriter_onboarding_completed_at`, `authorslab_onboarding_completed`.

## What's changed in the new model

- **Ghostwriter is no longer a separate product.** It's the first tab inside any project that doesn't begin with an upload. The `ghostwriter.authorslab.ai` subdomain becomes a marketing landing page that funnels into signup → Lobby → "Start a new project" → Write path.
- **Eden's onboarding moves inside the project shell.** When a writer chooses "Write a book" from the new-project fork, an Untitled project is created immediately and the Ghostwriter tab activates with Eden in the centre. The five questions, the Q1-Claude-API title extraction, and the Ivy/Reid match all happen inside the project. The tab strip and account rail stay visible — Eden does not take a sidebar-less full-screen takeover (departing from the original brief's instruction).
- **Ivy/Reid take over after the match.** Once Eden has matched, the studio settles into the standard three-panel layout: section map left, content centre, chat with Ivy or Reid right. The section map starts empty and builds as the conversation extracts material.
- **`has_ghostwriter_access` becomes a subscription-tier check** rather than a separate paywall. Don't build new paywall logic; check the flag for now and assume it'll be wired to subscription state later.
- **A `manuscript_id` link on `ghostwriter_sessions`** is needed so a session belongs to a project. Discuss with Paul before adding the migration — there are migration-order considerations because of existing data from beta testers.

## What you're building

Bring the existing Ghostwriter pages up to date with the new model:

1. **Refactor Eden onboarding** so it can run inside a project shell (passed a `projectId` / `manuscriptId`) rather than as a standalone page. The five questions, the bridge responses, the matching logic, and the title extraction all stay the same. The visual treatment changes — Eden takes the studio centre, not the full screen.
2. **Refactor the Ivy/Reid studio** so it slots in as the active centre of the Ghostwriter tab. Strip the standalone-page auth check and routing — receive context from the project shell.
3. **Wire it into the project shell.** The project shell doesn't exist yet as a built component; coordinate with whoever is building the shell, or build a thin shell wrapper for testing the Ghostwriter tab in isolation. Talk to Paul about which.
4. **Handoff to Author Studio.** When the writer marks the Ghostwriter draft as ready (or when enough sections are drafted), the project graduates and the Author Studio tab becomes active with Alex starting his developmental read. The `ghostwriter_sessions.handed_off_manuscript_id` column is the existing hook for this — make sure manuscript records and chapter records get created from the Ghostwriter sections at handoff.

## Wireframe references

The visual designs for the Ghostwriter tab inside the project shell were sketched in conversation. They aren't yet captured as code files in this repo. Ask Paul for the wireframes if you need them — they show:

- The project shell chrome (top bar, project header, tab strip) wrapping the Ghostwriter studio.
- Ghostwriter tab in active state with Ivy/Reid name appended (e.g. `Ghostwriter · Ivy`).
- Eden's welcome screen during onboarding (five questions, single centred column inside the studio area).
- Section map states (`drafted`, `ready to write`, `needs material`, `not started`) using filled/outlined dot icons.

## Tone and behaviour

The original Ghostwriter brief at the repo root captures Eden's voice and the Ivy/Reid system prompt intent perfectly — keep that. The brand voice is warm, perceptive, conversational. No emoji in UI. Sentence case throughout. Eden's "old friend" script for returning Ghostwriter graduates moving into Author Studio is preserved (handled in `/src/app/onboarding/page.tsx` already, lines around 211).

## What to do first

1. Read `/docs/DESIGN_DECISIONS.md` end to end.
2. Read `/ghostwriter-handover-brief-3.md` for tone and the exact Eden questions / matching logic.
3. Read the existing `/src/app/ghostwriter/page.tsx` and `/src/app/ghostwriter/studio/page.tsx` to understand what's there.
4. Read the relevant slice of `/src/types/database.ts` (the `ghostwriter_*` types if present, plus `Manuscript` and `Chapter`).
5. Ask Paul for the wireframes if you need to see them.
6. Propose a concrete plan before writing code. Confirm with Paul which order to build in (refactor existing pages vs build the project shell wrapper first vs build in isolation and integrate later).

## Open questions you'll need answers on

- Does the Ghostwriter tab need its own URL (`/projects/[id]/ghostwriter`) or live entirely inside a single SPA-style project view?
- Should the project shell exist before this refactor lands, or will you build a stub shell for testing?
- The existing `has_ghostwriter_access` paywall check — leave it in place during the refactor, or strip and replace with subscription-tier check now?
- The handoff from Ghostwriter to Author Studio — writer-triggered ("this is ready") or system-suggested ("you have enough drafted, want to graduate?")?
- Naming: Eden, Ivy, Reid are locked. The Companion (Home agent), Morgan (Publishing), Riley (Marketing) are placeholders that may shift.

Good luck. Be patient with the cleanup — there's real existing work here that's worth preserving, and Paul has beta testers using the current build.
