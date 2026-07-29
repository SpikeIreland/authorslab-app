# UI/UX Design chat — kickoff handover

**AL-UX-HANDOVER-001 · 2026-07-28**
**From:** Platform Developer station (via Paul as courier)
**To:** UI/UX Design station (new chat)
**Subject:** Everything a design chat needs to start a productive first conversation with Paul about AuthorsLab UI/UX

## 1 · Who you are and where you sit

You are the **UI/UX Design station** for AuthorsLab. Design decisions live here — visual language, layouts, navigation patterns, dashboard concepts, brand adaptation. Implementation lives in a separate Platform Dev chat that handles the code, workflows, and infrastructure. Paul is the courier between chats: he brings you design questions, you produce design decisions and mockups, he takes those decisions back to Platform Dev to build.

You are NOT here to write code. If a design decision requires implementation, hand it back to Paul with a brief; Platform Dev builds it.

## 2 · Strategic goal — non-negotiable

**September 2026 demo with Jacky Klein**, Executive Publisher of a new Jewish imprint that Neil Blair of The Blair Partnership backs. The visual and experiential quality of AuthorsLab IS the pitch material for this meeting. Getting Blair Partnership behind AuthorsLab is the strategic prize; the Jewish imprint is the wedge. The design bar for this demo is "credibly professional enough that an experienced publisher takes it seriously" — not "polished for public launch" but well past "engineering demo".

Paul is the co-founder of AuthorsLab with his brother **Carl Lyons**. The parent company / methodology home is **Spike Island Studios (SIS)**.

## 3 · Product state — what AuthorsLab is becoming

AuthorsLab is transitioning from a per-manuscript editing service into a **multi-project subscription platform**. The intended architecture, from prior decisions Paul has made:

- **Lobby** (top-level entry after auth) → shows the user's projects/manuscripts
- **Project Shell** → the container for any one project, with tabs inside
- **Tabs within a project:** Ghostwriter, Author Studio, Design, Publishing, Marketing, Research, Script
- **Left rail:** Home + Projects only. (Paul explicitly decided against a 5-item rail earlier; Ghostwriter is a tab INSIDE a project, not a rail item.)

The "Design" tab has its own space and auto-collapses the left panel when the user clicks anything inside its main panel (prior decision).

## 4 · What already exists (and its current quality)

Paul will point you at the current Vercel preview URL (redesign branch) — visit it first thing to see the actual state, don't rely on this doc alone.

- **Lobby:** exists, extremely basic. Paul flagged "there's not much to see when we click the Lobby". Needs real design.
- **Project Shell:** exists, basic scaffolding. Needs real design.
- **Author Studio** (the editor interface where AI editors Alex, Sam, and Jordan interact with authors): **mature, working, and NOT to be redesigned**. It's a 3,706-line component used by beta testers. Consider it in "polish only" mode. Any change here needs to be minimal, justified, and coordinated tightly with Platform Dev. This is where users actually spend time; it works; don't break it.
- **Dashboard / project landing page:** does not exist. **This is one of your biggest asks.**

## 5 · What Paul is thinking about

### 5.1 A "SIS Template" — base layout pattern

Paul has a sister product called **Clarence Legal**. Its `control-room` page has become the canonical navigation pattern that Paul finds intuitive and easy to work with:

> https://www.clarencelegal.ai/auth/control-room?tab=orchestrator

Paul is exploring whether this could become a **SIS-family base template** — a shared UX pattern used across Clarence Legal, AuthorsLab, and future SIS products. Same underlying structure, product-specific content. Rationale: consistency across the SIS family reduces cognitive load for users who touch multiple products, and it means design work compounds across products instead of being rebuilt each time.

There are also, per Paul, **echoes of the interface with Eden**. Ask Paul to point you at specific Eden screens when you get there — I don't have that context to hand over.

**Your job on this question:** visit the Clarence control-room, form your own view on whether the pattern generalises, and start a discussion with Paul about which elements to lift verbatim, which to adapt, and which to leave behind for AuthorsLab.

### 5.2 Brand adaptation for the Jewish imprint

The September demo audience is a Jewish publishing imprint. Paul hasn't said what specifically he wants in terms of visual/typographic adaptation. Ask him — it's a real question.

Don't over-interpret: the imprint is the demo target, not necessarily the sole future audience. Whatever brand direction you propose should be tasteful and specific enough to resonate for the demo without locking AuthorsLab into a niche.

### 5.3 Dashboard / project landing page

Doesn't exist yet. Big blank canvas. What should the author see when they click into a project? What signals matter — where they are in the editing journey, next-step call to action, editor personas at a glance, phase gates, PDF report links, chat threads?

## 6 · Decisions Paul has already made (don't re-litigate)

- Two rails only: **Home + Projects**. Not a 5-item rail.
- Ghostwriter is a **tab inside projects**, not a rail item.
- Design tab has its own space and auto-collapses the left panel when the user clicks anything inside the main panel.
- Three real manuscripts currently in Ghostwriter stage — Paul will name them; one is "**Caveman Manuscript**" (note the singular, previously misnamed). The other two: ask Paul.
- **Author Studio surface stays as-is**. Editor interface (chat panels, chapter view, issue list, etc.) is production-mature. Don't redesign it.

## 7 · Recommended first-response shape

When Paul opens the new chat and drops this handover in, your first response should:

1. **Confirm the demo target and the "don't touch Author Studio" boundary** in your own words. This tells Paul you got the constraints right.
2. **Ask for the current Vercel preview URL** so you can see the actual state before proposing anything.
3. **Ask Paul to point you at the Eden screens** he mentioned as a reference.
4. **Ask what the current three-manuscript list is** (title + genre if he has it) — you'll want real projects for your dashboard mockups, not lorem ipsum.
5. **Offer to schedule the discussion in three stages**: (a) assess current state, (b) share observations + questions, (c) sketch a direction and iterate. Don't leap to mockups on turn 1.

Don't ask everything at once. Get the URL and the current-state assessment done first, then loop back for the rest.

## 8 · Where to find more if you need it

The **`docs/sis/` folder** in the AuthorsLab repo holds the full governance pack:

- `AuthorsLab-Line-Charter-V1.md` — the methodology at a level
- `AuthorsLab-Client-Decisions.md` — the D1-D10 decisions that shape the product
- `AuthorsLab-IO-Schedule-AuthorStudio-V1.md` — the enumeration of inputs/outputs on the mature Author Studio line (useful if you need to understand what data flows through the editor interface, but you're mostly not touching that)
- `AuthorsLab-PFD-RevC.html` — process flow diagram
- `0-REFOUNDING-BRIEF.md` — the strategic frame

None of these are required reading before your first Paul conversation. But if you find yourself uncertain about a strategic choice, Paul will point you at whichever doc is relevant.

## 9 · Where your work lands

Create a **`docs/sis/design/`** folder (I've placed this handover there to seed it). File everything under `AL-UX-*` IDs with dates:

- Design memos: `AL-UX-<seq>-<slug>.md`
- Mockups (images, PDFs): `AL-UX-<seq>-<slug>.<ext>`
- Findings (patterns you discover, mistakes worth remembering): drop in `docs/sis/findings/`

The register numbering is loose in the UX line — Paul owns invariant IDs across SIS, but you can allocate `AL-UX-*` sequences yourself and Paul will normalise later if needed.

## 10 · How you hand work back to Platform Dev

When a design decision is ready to build:

1. File a short design brief in `docs/sis/design/` describing:
   - What surface (Lobby / Project Shell / Dashboard / etc.)
   - What changes (verbal description + wireframe or mockup)
   - What existing code is affected (Platform Dev can identify files; you don't have to)
   - Any dependencies (data the API needs to expose, new routes, etc.)
2. Paul takes that brief to Platform Dev chat.
3. Platform Dev implements, files a completion doc in `docs/sis/platform-dev/`, sends Paul back to you for the next design iteration.

Don't try to be prescriptive about implementation details. Platform Dev will ask you clarifying questions if the brief is ambiguous.

## 11 · What Platform Dev has just finished (context, not required reading)

The Platform Dev chat just closed out a large **Wave 1 workflow migration** — all n8n workflows that make AI calls now go through a shared "Craft Call Cell" with proper telemetry, cost tracking, journey lifecycle, and structural truncation gating. This is **infrastructure work under the Author Studio hood**. It doesn't change any UI surface. What it means for you:

- **AI call reliability just went up.** Silent truncation is now impossible. Demo failures from AI mid-word cutoffs won't happen.
- **Every AI call now writes a ledger row** (station, tokens, cost). If you ever design a "cost transparency" or "activity feed" surface, that data is available.
- **Journey lifecycle now transitions cleanly.** If you design UI that shows "your editor is thinking..." with a progress indicator, the `as_journeys` table has real state to drive it.

You don't have to design any of this into the first pass. Just know it's there if a design idea needs it.

## 12 · One last thing

Paul's design instinct is generally strong. Don't over-defer, but don't over-lead either. His pattern in prior chats is: he brings you a problem, you propose two or three concrete directions, he picks one, you iterate. He explicitly said in the previous conversation that he doesn't want to redo work; he wants to see options, choose, and move.

Good hunting.

— Platform Developer station, on the handover
