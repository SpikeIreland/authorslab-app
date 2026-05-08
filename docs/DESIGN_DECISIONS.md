# AuthorsLab — Locked Design Decisions

A running list of decisions made during the May 2026 redesign. Each new chat working on a tab should read this first.

## Navigation model

- **Project-first navigation.** The project (= manuscript) is the unit of work. The author opens a project and that project's workspace is the centre of attention.
- **Account-level rail (left).** Two items only: **Home** and **Projects**. Forum and other items are deferred. The rail collapses to a 40px icon strip when the user clicks anything inside the studio area, and expands again via a `»` handle. The rail stays expanded on the Lobby and on Home (those are navigation surfaces, not deep-work surfaces).
- **Project shell.** When a project is open: top bar with `AuthorsLab` brand, then a project header (`← Projects` breadcrumb · project title · genre/state metadata), then a horizontal tab strip across the top.
- **Horizontal tab strip per project.** Reading left to right: `Ghostwriter`, `Author Studio`, `Design`, `Publishing`, `Marketing`, then a small vertical separator, then the always-available tools `Research`, `Script`.
- **Recommended sequence, free movement.** The system suggests the next logical stage but doesn't lock anything. The writer can open any tab at any time. The active tab gets the active treatment; complete tabs get a check; pending tabs are muted; not-applicable tabs (e.g. Script for most books, Ghostwriter for projects that uploaded a finished manuscript) are dimmed/italic or strikethrough.

## The five journey stages

1. **Ghostwriter** — drafting from idea or rough material. Eden runs onboarding (5 questions) the first time the tab opens on a new project; matches the writer to **Ivy** (warm, exploratory, memoir/personal) or **Reid** (structured, direct, ideas/argument).
2. **Author Studio** — editing a complete draft with **Alex** (developmental), **Sam** (line), **Jordan** (copy). Three sub-editors, switchable freely via an editor sub-bar inside the tab. Preserves the existing 3-panel layout.
3. **Design** — creative-visual work: cover, front matter, back matter, interior format. **Taylor** is the agent (teal). Cover concepts in a 4-up grid with select/regenerate.
4. **Publishing** — logistical work: book metadata, ISBN, pricing, platforms (KDP/IngramSpark/Apple/etc.), launch. **Morgan** is the placeholder agent name (amber). Form-driven with chat assistance for higher-level decisions.
5. **Marketing** — audience, pitch, launch plan (vertical timeline), content drafts, reviews (ARC), performance (post-launch only). **Riley** is the agent (coral). Timeline-driven character distinguishes it from Publishing's form-driven feel.

## Always-available tools

- **Research** — same agent as Home (creative companion), but with project context loaded. One backend, two surfaces — same `source: 'tab' | 'drawer'` pattern as Clarence.
- **Script** — derivative work tool for adapting the book to screen. Sits as a tab inside the parent project rather than as a separate project.

## Home

- The default landing for signed-in users (not the marketing site at `/`).
- **Clarence-style two-pane chat.** Left: conversation history grouped Today / Yesterday / Last 7 days / Older, "+ New conversation" at top, auto-titled from first user message (60-char cap). Right: chat thread + input pinned to the bottom.
- Agent name **Companion** as a placeholder. Open to renaming.
- "Make this a project →" CTA at the bottom of the chat panel; promotes a conversation into a real project that lands on the Lobby.

## Lobby

- Lives at `/lobby` (or `/` for signed-in users — TBD when the app shell is built).
- Project cards stacked vertically, sorted by most recently updated.
- Each card shows: title, genre / word count, **5 stage pills** with status (active / complete / pending / skipped), `Next:` line with the recommended next action in a warm tone (e.g. "Sam is reviewing chapter 7 with you" rather than "Continue line edits"), `Open →` button.
- **Cover thumbnail** appears on the card once Design is complete. Earlier-stage cards are text-only.
- **Launched section** below in-progress, with a launched badge, cover thumbnail, and `Live on:` line replacing the `Next:` line.
- "+ Start a new project" affordance at the top, soft dashed style — doesn't compete with existing work.

## Start-a-new-project flow

- Modal fork: **Write a book** (creates project on Ghostwriter tab, Eden takes the centre) or **Edit a manuscript** (creates project on Author Studio tab with Ghostwriter shown as skipped).
- Project record is created immediately on choice — if the writer bails, an Untitled project is in the Lobby and they can come back to it.
- Title is extracted from Eden's question 1 (Write path) or from the parsed manuscript (Edit path).

## Subscription and access (TBD)

- Existing model: one-time $299 three-phase (Alex/Sam/Jordan) package, plus `is_admin` and `is_beta_tester` flags as the only access toggles.
- New model intent: subscription tiers with `manuscripts_allowed` per tier (free / basic / pro / enterprise schema already exists in `src/types/database.ts`). Not yet built.
- `has_ghostwriter_access` becomes a tier check rather than a separate paywall.

## Agent roster (placeholder names — open to rename)

- **Companion** (Home, no avatar colour committed) — creative companion, pre-project chat
- **Eden** (Ghostwriter onboarding, sage) — matches writers to Ivy or Reid
- **Ivy** (Ghostwriter, amber) — warm, exploratory, memoir/personal
- **Reid** (Ghostwriter, deep sage) — structured, direct, ideas/argument
- **Alex** (Author Studio, green) — developmental editor
- **Sam** (Author Studio, purple) — line editor
- **Jordan** (Author Studio, blue) — copy editor
- **Taylor** (Design, teal) — cover, layout, format
- **Morgan** (Publishing, amber) — metadata, ISBN, pricing, platforms, launch
- **Riley** (Marketing, coral) — audience, pitch, launch plan, content, reviews, performance

## Tone and copy principles

- **Warm over prescriptive** in system-generated copy. Prefer "Sam is reviewing chapter 7 with you" over "Continue line edits on chapter 7".
- **No emoji in UI** unless the user explicitly opts in. The visual language uses CSS shapes and colour-coded pills, not emoji.
- **Sentence case** throughout, never Title Case.
- **Two font weights** (400 regular, 500 bold). Never 600 or 700.

## Architectural notes

- **Existing 3,706-line `src/app/author-studio/page.tsx`** to be reframed as a tab inside the project shell. Strip the standalone-page chrome (top bar, auth check, redirect logic to Publishing/Marketing). Preserve the three-panel layout, chapter list with D/L/C tri-state, issue overlay, autosave, mark.js highlights, n8n webhook calls.
- **Existing `src/app/publishing-hub/page.tsx`** (~970 lines) splits into Design + Publishing components.
- **Existing `src/app/marketing-hub/page.tsx`** is mostly scaffold — substantial design opportunity, see `docs/tabs/marketing/`.
- **`publishing_progress` table** can either be split into `design_progress` + `publishing_progress` or kept as one table with section-based ownership. Lean toward the latter for less migration churn.
- **`ghostwriter_sessions`** to gain a `manuscript_id` field so a session belongs to a project (currently uses `handed_off_manuscript_id` which only models the output link).
- **n8n webhooks** are organised in `src/lib/n8n-config.ts` by phase. Each agent's workflows are namespaced (alex-*, sam-*, jordan-*, taylor-*, eden-*, ivy-*, reid-*). New agents (Morgan, Riley, Companion) will need new workflow groups.
