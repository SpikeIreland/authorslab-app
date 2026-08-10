# Taylor Design & Publishing — chat seed brief

**AL-PDC-TDP-SEED-001 · 2026-07-30**
**From:** Platform Developer station
**To:** Taylor Design & Publishing chat (new)

This seeds a new Cowork chat focused on the Design and Publishing surfaces of AuthorsLab — everything from cover through launch. You have no prior context from the founding chats; this document is enough to start.

## 1 · What AuthorsLab is (one paragraph)

AuthorsLab is a manuscript-to-launch platform for authors. Five human-named AI editors carry an author through developmental (Alex), line (Sam), copy (Jordan), publishing (Taylor), and marketing (Kai) work. A sixth persona, Riley, is the author's private companion — always available, holds memory of their work. Warm serif "Manuscript Room" palette (charcoal / sage / terracotta / clay). Next.js 16 App Router, Supabase, n8n workflows behind an Anthropic-based "Craft Call Cell" pattern for all LLM calls. Redesign shipped July 2026. September 2026 demo with Jacky Klein (Executive Publisher of a new Jewish imprint backed by Neil Blair of The Blair Partnership) is the immediate driving deadline.

## 2 · Scope of this chat

Everything Taylor touches, and everything downstream through launch. Explicitly:

- **Design tab** (`/projects/[id]/design`) — cover generation, cover selection, formatting choices, visual identity of the book itself
- **Publishing tab** (`/projects/[id]/publishing`) — ISBN, metadata (title, subtitle, author bio, categories, keywords), platform setup (Amazon KDP, IngramSpark), launch checklist
- **Kai's Marketing tab** (`/projects/[id]/marketing`) — positioning, audience, launch plan (Kai was previously called Riley in the code; that name has been reassigned to the Ghostwriter companion, so anything you see referencing `Riley` for marketing needs renaming)
- **6.1 Format Manuscript** n8n workflow — HTML → DOCX conversion, migrated as of 2026-07-30
- **Publisher-collaboration model** — the biggest new architectural concept (see §4)

Out of scope: Author Studio interior (Alex/Sam/Jordan), Ghostwriter station (Riley), The Library.

## 3 · Current state — what's already built

- **n8n workflows in the authorslab account, all migrated to the Craft Call architecture as of today** (2026-07-30):
  - `5.1 Taylor Assessment` — reads the finished manuscript, generates a design brief
  - `5.2 Taylor Generate Covers` — DALL-E 3 → three cover concepts
  - `5.3 Taylor Detect Cover Intent` — routes chat messages that are actually cover requests to `5.2`
  - `5.4 Taylor Chat` — conversational Taylor interface
  - `6.1 Format Manuscript` — takes the approved manuscript, chapter data, and metadata; produces a formatted DOCX via ConvertAPI
- **Design tab UI**: exists but pre-redesign. Chat interface + cover-generation flow.
- **Publishing tab UI**: exists but pre-redesign. Metadata form + platform setup steps.
- **Marketing tab UI**: exists but pre-redesign. Kai chat.

All three tabs need reskinning into the Manuscript Room palette — that hasn't happened yet. AL-UX-004 covered Chrome + Library + Overview + tab strip; AL-UX-006 covered public pages; AL-UX-007 reskinned Author Studio. The three tabs owned by this chat are the biggest unmigrated visual surface remaining.

## 4 · The publisher-collaboration model (this is the big new idea)

Founding decision by Paul + Carl. Every design for these three tabs must respect it.

- **Sacred space** (never seen by anyone but the author): The Library, Project Overview, Author Studio, Riley/Ghostwriter interactions.
- **Shared-by-invitation space** (author explicitly invites a named publisher): Design tab, Publishing tab, Marketing tab. These are *your* tabs. The publisher, once invited, can see and interact here — nowhere else.
- **Publisher's own surface** (separate account type, separate role in Supabase): a global dashboard showing the authors they're working with, each book's design/publishing/marketing status. No path from this surface into any author's writing.

Implications you'll need to design for:

- **Invite flow**: from the author's side, on each of these tabs, an "Invite publisher" action. Supabase needs a `project_collaborators` (or similar) table linking manuscript + publisher user + role + invited/accepted state.
- **Presence UI**: when a publisher is viewing a tab, the author should see it. When a publisher comments on a cover, the author should see the comment attributed to them, not to Taylor.
- **Permission boundary**: hard-enforced. Every API route serving Design/Publishing/Marketing data checks the requesting user is either the author OR an accepted collaborator on that manuscript. Same for the reverse — publisher dashboards only surface manuscripts they've been invited to.
- **Publisher dashboard** (new surface): grid of author cards, each with book status + last-activity timestamp + which tab needs attention. Never lists manuscripts they haven't been invited into.

For the September Jacky Klein demo, a working stub is enough — real publisher account, real invite flow, real permission boundary, but the publisher dashboard can pull real data or mocked, whichever is faster to demo.

## 5 · Persona: Taylor

Established colour: **clay** (`#A98A6B`). Personality: pragmatic craftsperson, focused on making the book look and function as a real object in the world. Speaks like a designer talking to a client — direct, options-based ("I've drafted three cover concepts, take a look"), respectful of the author's ownership of the work. Not precious. Not overly enthusiastic.

Kai (marketing) is next to Taylor in the persona quintet. Colour to be chosen (Kai is new — previously the marketing persona was called Riley with faint colour; both name and colour open for reconsideration).

## 6 · Stochastic / deterministic bounds

Standing SIS principle:

- **Deterministic** (must be provably correct): permissions, invite state, metadata storage, format conversion, platform-integration bookkeeping.
- **Stochastic** (LLM-generated, allowed to vary): Taylor's design briefs, cover generation, positioning drafts, marketing plans, Kai's copy.

Every stochastic call goes through the Craft Call Cell (`S9PSKvvRp5FqnRmv` in authorslab). Direct HTTP calls to Anthropic/OpenAI from workflows are deprecated — use the Cell for cost tracking and consistent error handling.

## 7 · Suggested first briefs / focus areas

Not prescriptive — this chat picks its own sequencing — but the natural ordering:

1. **Publisher-collaboration architecture** — spec the Supabase schema, permission model, invite flow, and publisher dashboard before touching UI. This is the founding piece.
2. **Design tab reskin** — apply the Manuscript Room palette + state grammar. Add Publisher presence affordance.
3. **Publishing tab reskin** — same.
4. **Marketing tab reskin** + rename Riley → Kai in this tab's code.
5. **Publisher dashboard MVP** — enough for the Jacky demo.

## 8 · Coordination

- **Platform Dev chat** owns backend, permissions, code changes to shared code, n8n changes.
- **UI/UX Design chat** owns visual design briefs. Ask them for a brief before rebuilding a surface.
- **Ghostwriter Station chat** owns Riley — no overlap with your work.
- **Demo & Content Ops chat** owns Carl's demo accounts + Jacky prep. Coordinate on what the demo needs from Design/Publishing/Marketing tabs specifically.

## 9 · Reference documents

- `docs/sis/design/2026-07-28-AL-UX-004-build-brief-manuscript-room.md` — design tokens, state grammar, persona colour map
- `docs/sis/design/2026-07-29-AL-UX-006-public-pages-brief.md` — how public pages were reskinned
- `docs/sis/design/2026-07-29-AL-UX-007-author-studio-reskin-brief.md` — how Author Studio's interior was reskinned (in-place, palette only)
- `docs/sis/platform-dev/2026-07-28-AL-UX-004-phase-{1,2,3,4}-completion.md` — what shipped in each phase
- `docs/sis/platform-dev/2026-07-30-ghostwriter-station-update.md` — the sacred/shared architecture note

— Platform Developer station
