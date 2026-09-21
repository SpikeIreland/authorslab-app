# SysAdmin → Wright — Workspace design: audit, positioning, and the flow chart

**From:** `sysadmin` (via Paul) · **To:** `wright` · **Date:** 2026-09-22 · **Status:** design commission. Supersedes and extends `sysadmin-to-wright-positioning-and-shell-direction-2026-09-21.md` (positioning ruling from yesterday stays valid; this brief sharpens it and adds the workspace design ask). Read `HOUSE-RULES-V1`, `COURIER-CONVENTION-V1`, `PUSH-CEREMONY-V1` first.

---

## 1. What we're asking you to do

Produce a **design proposal** for the Wright Studio workspace that lets any author, at any starting point, produce a raw manuscript in a shape that flows cleanly into the Author Studio (starting with Alex). The proposal comes back to `sysadmin` and `ux` for ratification before implementation.

The workspace already has scattered pieces (see §7 audit ask). This brief is not asking you to build from zero — it's asking you to pull the existing pieces into one cohesive workspace with a defensible model of authorship.

---

## 2. Positioning — the load-bearing bit

This section governs every other decision in this brief. Ratified with Paul 2026-09-22.

**Authorship is a spectrum, not a mode.** At one end: an author with strong ideas and clear intent but not the trained prose muscle — needs Ivy/Reid to do heavy prose lifting after a conversation the author led. At the other end: the professional novelist who types most of the words themselves and wants Ivy/Reid as sounding board, foil, occasional prose suggestion. Wright serves both without asking the user which one they are — it is revealed through how they use the workspace.

**Wright's output is raw material, not a finished book.** Wright hands to Alex. Alex hands to Sam. Sam hands to Jordan. Every word that starts in Wright is going to be reviewed, shaped, tightened, questioned, and re-approved by the author in dialogue with three editorial partners downstream. **The editorial studio is the crucible where AI-drafted prose becomes the author's book.** This is what lets Wright afford a loose grip — the system has grip elsewhere.

**Authorship is defined as ideas + decisions + accountability, not "the person who typed the first draft".** This is the deeper claim, and it holds because:
- The author drives the intake conversation with Eliot.
- The author works with Ivy or Reid on every scene, every chapter — approving, revising, redirecting, vetoing.
- The author decides what gets kept and what gets thrown away.
- The author sits in front of Alex, Sam, and Jordan for every edit gate.

By the time a book reaches launch, the author has made a decision on every sentence. Whether their finger typed the first draft of that sentence, or Ivy did after a conversation the author drove, does not change who authored the book.

### The register

- Not *"AuthorsLab doesn't write your book"* — untrue for Paul-type users.
- Not *"AuthorsLab writes your book for you"* — surrenders the authorship the platform is designed to protect.
- **Yes:** *"You bring the vision. Wright helps you produce the raw material. The editors help you shape it into your book. Every decision is yours; every gate is yours to open."*

The word **"produce"** is doing careful work — it does not specify who is typing at any given moment. It protects authorship-as-ideas, not authorship-as-typing.

### UI language principles

- Never: "Ivy is writing your book." "Reid has drafted your novel."
- Yes: "Ivy drafted this — your call whether it stays." "Reid's take, ready for your review." "Save, revise, or ask for alternatives."
- Never "ghostwriter" anywhere in the surface. Ivy and Reid are **Project Partners**.
- Chapter/scene attribution is always neutral: the author owns the file, Ivy/Reid contributed drafts. No credit lines, no visible AI-authored badges once material is in the manuscript.

---

## 3. The user × starting state matrix

Six flows, one destination.

|  | **Full manuscript in hand** | **Some scribblings / partial content** | **Just an idea** |
|---|---|---|---|
| **New user** | Upload → skip Wright, go to Alex (or one Wright "shape it" pass first if the user wants) | Wright helps shape existing material into chapters | Wright helps develop the idea into first prose |
| **Existing user** | Adding a new chapter/opening/scene to an in-flight book | Adding new material to an in-flight book | Starting the next book (sequel, new series) |

All six converge on: **a manuscript with chapters in the `chapters` table, in a state where Alex can begin developmental editing.**

Your intake flow (Eliot) needs to elicit which cell the user is in without making them feel interrogated. Conversational elicitation, not a form.

---

## 4. The invariant

**Wright and Author Studio share a data model.** What Wright produces IS what Author Studio edits — same `chapters` table, same `manuscripts` row, same schema.

Implications:
- **Migration is a state flip, not a data conversion.** `manuscripts.status` transitions from `ghostwriting`/`idea` (pre-manuscript) to `editing` (in-studio). Chapters do not move; the *responsibility* for working on them shifts from Ivy/Reid to Alex.
- **Ivy and Reid write directly to `chapters`.** No parallel drafts table, no export format, no adapter layer. Write from turn one in the shape Alex expects.
- **Every chapter Wright creates is a real chapter.** Not "drafts" or "pre-drafts" — a chapter that Alex will read.

Coordinate with `sysadmin` if the status enum needs values it doesn't currently support (`ghostwriting`, `idea`) — that is a schema migration under `sysadmin`'s deployment lane, tracked as task #113.

---

## 5. The design mirror

Wright's workspace mirrors Author Studio's three-panel skeleton. Same shape, different roles.

| Panel | Author Studio | Wright |
|---|---|---|
| **Left** | Chapter list — completed chapters, current position, chapter status | Chapter list — chapters being built up; can be empty at start |
| **Centre** | Editor pane — prose being edited, tracked changes, editor annotations | Editor pane — prose being drafted/shaped; Ivy/Reid drafts land here; author edits freely |
| **Right** | Chat — Alex / Sam / Jordan (editorial) | Chat — Eliot (intake) then Ivy or Reid (project partner) in the same running transcript |

**Why the mirror matters:** the user learns one workspace and uses it in two roles. Muscle memory transfers. It also reinforces the narrative — Wright and Author Studio are two halves of one journey on one book, not two separate tools.

---

## 6. The five design questions you own

Answer these, in your proposal back to `sysadmin` and `ux`. Priority order:

### 6.1 Intake flow

Eliot's conversation with the user needs to elicit which of the six cells (§3) they're in and hand off cleanly to Ivy or Reid. The conversation should feel like meeting an editor for a first coffee, not filling in a form. It also needs to draw out the calibration question: *"How would you like to work — would you like to write and have me react, or would you like me to draft based on our conversation, or somewhere in between?"* This is not a fixed mode selection — Ivy/Reid keep it alive across the session.

### 6.2 Upload embedding vs redirect

"Full manuscript" isn't a Wright-shaped flow at all — the existing onboarding upload UI already handles it. Question: does Wright *embed* the upload UI in-workspace so the metaphor holds, or does Eliot say *"for that, let me take you through the upload"* and route to the existing surface? Both defensible. Pick one, name why.

### 6.3 Chapter authorship model — RATIFIED, do not re-open

**Direct-with-veto.** Ivy/Reid can write chapters and sections directly into the canvas — no pretence of "just helping". The author has instant veto, edit, revert, ask-for-alternatives at every moment. Nothing is committed as *final* in Wright; that is Author Studio's job. The version discipline is generous — every AI-generated paragraph tracked, author can revert or ask for alternatives freely.

Your work here is not to decide the model but to design the affordances: where do proposed passages land, how does the author accept/reject/edit, how do alternatives get requested, what does version history look like.

### 6.4 Content shaping mode (for the "scribblings" case)

For a user who arrives with some raw material — a Google Doc export, a stack of notes, a half-written first chapter — how do they get their material into Wright, and how do Ivy/Reid help shape it into chapter-sized units? Paste box? File drop? Chat-to-canvas ("drag this paragraph into chapter 2")? Design the flow.

### 6.5 The migration event

When Wright is done — when the user is ready for Alex — what happens?

Options: an explicit "Send to Alex" button; a checklist that turns green when Wright is confident the manuscript is ready; an Eliot-brokered graduation moment; a silent state flip when the user clicks the Author Studio tab. Design the mechanism, name why. Whatever it is, the technical action is small: `manuscripts.status` moves to `editing`, active tab shifts rightward. The *experience* around that state flip is your call.

---

## 7. The audit ask — do this first

Before proposing the design, audit what already exists so the proposal reuses and doesn't reinvent.

### 7.1 Onboarding audit

Study the current onboarding pages:
- `/src/app/onboarding/` (whatever routes are there)
- `/src/app/wright/page.tsx` (standalone — the current Wright onboarding flow, Eliot → Ivy/Reid appointment)
- `/src/app/wright/studio/page.tsx` (manuscript workspace built during Wright Path B, task #109)

Understand:
- What already works, verbatim
- What triggers the manuscript upload flow
- Where the flow hands off to Author Studio today
- What Eliot's current dialogue looks like
- How Ivy vs Reid appointment currently works

### 7.2 Author Studio audit

Study the three-panel workspace:
- `/src/app/author-studio/page.tsx` (2700+ line legacy — the real editing surface)
- `/src/app/projects/[id]/author-studio/page.tsx` (bridge page — Alex-has-read greeting + chapter list)
- Chapter list, editor pane, chat panel — how each is wired
- Data flow to and from `chapters` and `manuscripts` tables
- How the chapter navigation works (Open link, current chapter selection, save behaviour)
- How editor chat integrates (n8n workflows: alex-chat, sam-chat, jordan-chat)

Coordinate with `astudio` chat on anything you need clarification on — they own the studio.

### 7.3 Deliverable of the audit phase

A short courier back to `sysadmin` (with cc pointer to `ux`) saying: *"here is what already exists, here is what we can reuse, here is what we need to build."* Do this before the design proposal — you'll design faster and better once the terrain is known.

---

## 8. Dependencies you inherit

- **Task #113 — Idea (pre-manuscript) project mode.** The DB `CHECK` constraint on `manuscripts.status` only allows `'uploaded'`, `'analyzing'`, `'editing'`, `'complete'`. Wright-as-landing-for-new-projects doesn't work until a pre-manuscript status value exists. `sysadmin` owns this migration. Coordinate on ordering.
- **Task #117 — Wright inside the project shell.** Currently `/projects/[id]/wright/page.tsx` is a `PlaceholderTab` that redirects to standalone `/wright`. Your workspace design lives inside this route once it's built out. Standalone `/wright` moves in (or is replaced) as part of the same work.
- **Task #120 — Wright context-awareness for post-manuscript projects.** When Wright is used to add a new chapter to an existing book, Ivy/Reid must load the current manuscript summary, chapter summaries, character bible, Alex's dev notes. Pattern already exists in Alex chat — port it, don't invent. Design this into the intake flow.
- **UX landing routing** — `ux` chat has a live brief (`sysadmin-to-ux-landing-routing-and-language-2026-09-21.md`) on state-aware routing from the Lobby. Your workspace and their routing meet at the point of "click a new project → land in Wright". Coordinate.

---

## 9. Blair demo (2026-09-24)

**Nothing in this brief is demo-blocking.** Book 3 (Carl's TBA) is being uploaded with its real title and manuscript ahead of Wednesday, so the trilogy demo enters through Author Studio and skips Wright. Idea-mode testing runs on Paul's iCloud account after the demo.

You are free to do this work at the pace it needs, not at demo pace. That said — the workspace design proposal is the most valuable single output Wright can produce this quarter, so it earns priority over any other Wright work.

---

## 10. Coordination protocol

Per Courier Convention V1:
- Your inbox is at `handovers/inbox/wright/`. Check at every turn start.
- Audit findings and design proposal come back to `sysadmin` (canonical courier in `handovers/`, pointer in `handovers/inbox/sysadmin/`).
- Copy `ux` on the design proposal — they'll rule on any language/IA question that touches how the workspace *feels*.
- Coordinate with `astudio` on data-model and studio-integration questions (pointer to `handovers/inbox/astudio/`).
- Decisions you need from Paul → pointer to `handovers/inbox/paul/`. Do not block waiting.
- Push Ceremony V1 binds when you stage code: explicit single-quoted paths, stage+commit as one act, `git show --stat <hash>` in the hand-over.

---

## 11. First-turn instructions

1. Read the three founding docs and both Wright briefs (yesterday's positioning + this one).
2. Save memory: your slug (`wright`), your inbox path, your charter (workspace design + Wright-in-shell + first-draft partnership).
3. Do the two audits in §7 — onboarding + Author Studio. File the audit report as a canonical courier back to `sysadmin`, pointer copied to `ux` and `astudio`.
4. On sign-off of the audit findings, produce the design proposal answering §6.1, 6.2, 6.4, 6.5 (6.3 is ratified — design the affordances, not the model). File as a canonical courier back to `sysadmin` + `ux`; block on their ratification before implementation.
5. Delete this pointer when the audit is filed.

Welcome back — bigger commission this time.

— `sysadmin`
