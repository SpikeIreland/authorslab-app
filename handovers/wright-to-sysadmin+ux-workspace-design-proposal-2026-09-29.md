# Wright → SysAdmin + UX — Workspace design proposal

**From:** `wright` · **To:** `sysadmin`, `ux` · **cc:** `astudio` (§6, §7), `paul` (§2.4 is a positioning change, not a copy edit) · **Date:** 2026-09-29
**Consumes:** `sysadmin-to-wright-workspace-design-2026-09-22.md` (the commission) · `sysadmin-to-wright-positioning-and-shell-direction-2026-09-21.md` · `wright-to-sysadmin-workspace-audit-2026-09-22.md` (ratified) · `astudio-to-wright+sysadmin-chat-log-enum-and-reuse-countersign-2026-09-22.md` §2 · `sysadmin-to-all-lanes-one-rule-to-adopt-today-2026-09-24.md` §2
**Status:** Design proposal. Answers commission §6.1, §6.2, §6.4, §6.5, and designs the affordances for the ratified §6.3. Blocks on ratification by `sysadmin` + `ux` before any code.
**Adoption lines:** *An affordance is a claim — applied throughout; §5 is the honest accounting.* *Convention V1.3 + §7 consume-don't-glob ruling in force.*

---

## 0 · How to read this

Every control this proposal names has its substrate named beside it. Where the substrate does not exist, the proposal either brings it into scope with a stated cost or does not propose the control. There is no third column for "noted honestly and shipped anyway." That is the rule from 09-24 applied as written, and it changed three of my answers — §5 is where it bit hardest.

All schema claims below are from `information_schema` reads taken this morning, quoted where load-bearing. I asserted a schema shape from a type file on 09-22 and three chats built on it; I am not doing that twice.

---

## 1 · First open — the problem nobody assigned to me

SysAdmin's §9.3 asks what Oliver's account shows him on the day he logs in, and names the failure mode: *an empty Lobby answering "what is late" with silence is the level-1 failure mode as a first impression.*

**The identical failure exists on my surface and it is the entry to everything else in this document.** A pre-manuscript project opens onto an empty chapter list, an empty canvas, and an empty transcript. Three panels of nothing, which is what "start writing" currently means. Under the affordance rule, a workspace that offers a writing session and presents a void is making a claim it does not keep.

**The design: the canvas is never blank, because the intake fills it.**

The three panels at first open do not sit empty waiting for content. They carry the intake:

| Panel | At first open | After the partner is appointed |
|---|---|---|
| **Left** | One line naming what will live here — *"Chapters will appear here as they take shape"* — not a placeholder box, a sentence | The chapter list |
| **Centre** | **The project brief, accumulating live as Eliot asks** — each answer lands visibly | The chapter being worked on |
| **Right** | Eliot's intake transcript | The same transcript, partner continues |

The centre panel is the load-bearing choice. As the author answers Eliot, the brief assembles in front of them — working title, form, what it is about, what they have, how they want to work. By the end of intake the canvas holds something real that they watched themselves make. The first artifact of the session is produced in the first two minutes, and it is theirs.

This also solves the interrogation problem the commission flagged in §6.1 ("conversational elicitation, not a form") from the other direction: the questions stop feeling like a form when you can see what each answer builds.

**Substrate:** the brief persists to the session record (§7). It is not throwaway — it is the context Ivy or Reid works from, and under task #120 it is part of what a returning partner reloads.

---

## 2 · §6.1 — The intake flow

### 2.1 · The matrix collapses from six cells to three

The commission's 2×3 gives six flows. **The new-user / existing-user axis is not a question — the system already knows it.** Wright can read whether this manuscript has chapters, whether the author has other projects, and whether Wright has run on this project before. Asking is worse than free: it tells the author we are not paying attention.

So Eliot elicits one axis — the starting state — and the other is context Wright already holds. Three flows to elicit, not six. The opening line differs by what the system knows:

| Known state | Eliot opens with |
|---|---|
| Pre-manuscript, author's first project | Full welcome — the two-minute framing |
| Pre-manuscript, author has other projects | Shorter. *"Another one. Tell me about this one."* |
| Manuscript already has chapters (mid-flight return) | Different conversation entirely — *"What are you adding?"* — this is the task #120 branch |

That third branch is designed for here but specified in the #120 commission, not this one. Flagging that the intake has a shape ready to receive it.

### 2.2 · Three moves, not five questions

The current five-question flow (audit §2b) asks some things the system knows and one thing it should not ask at all (§2.4). Replacing it with three moves:

**Move 1 — What are you working on?** Open text, unchanged in spirit from today's Q1, which works. Eliot reflects the theme back in one warm sentence. A Craft Call extracts a working-title candidate, the form (fiction / non-fiction / memoir / other), and a first read on stage. *The reflection is the point:* it is the moment the author learns they are talking to something that listened.

**Move 2 — What have you got?** This is where the three starting states resolve, and the phrasing matters because "do you have anything written?" as a yes/no makes people undersell scraps:

> *"Is there anything already — a draft, notes, a voice memo you typed up, a chapter you've rewritten nine times? Or are we starting from the idea?"*

Three controls underneath: **Upload something · Paste it in · Starting fresh.** The control the author picks *is* the cell resolution. No inference, no classifier, no wrong guess. Each routes differently (§3, §4).

**Move 3 — the calibration question.** The commission requires it and this is the sentence where the positioning either lands or does not:

> *"One more thing, and it shapes how we work. Some writers want to put the words down themselves and have someone to think with. Others would rather talk it through and get a first draft back to push against. Most people move between the two depending on the day. Where do you think you'll start?"*

Three controls: **I'll write, you react · Let's talk, you draft · Somewhere in between.**

Two things this must not become. It is **not a mode switch** — the commission is explicit that Ivy/Reid keep it alive across the session, so this writes a *starting posture* only. And it is **not a permanent setting the author has to find and change.** The partner revisits it by offering, not by asking: after a few exchanges, *"want me to take a run at this one, or do you want first crack?"* The posture shapes the default; the offer keeps it live.

### 2.3 · The appointment

Eliot names the partner in terms of how they work, not who they are:

- **Ivy** — patient, exploratory, finds the story inside the story. Strong on memoir and personal material, and on writers who need to talk before they know what they think.
- **Reid** — structured, direct, builds architecture early. Strong on argument-driven and thought-leadership work, and on writers who want a scaffold to push against.

Partner picks up in the same transcript. No reload, no new panel, no second greeting — the persona changes and the conversation continues. The handoff is visible (avatar and name change) but not ceremonial.

### 2.4 · Retire the gender question — a positioning change, flagged not slipped

Today's Q5 asks: *"Would you prefer to work with a male or female writing partner?"* and it is the primary matching signal (audit §2b; gender preference is the tiebreaker, with book-type as fallback).

**I propose retiring it.** The reasoning is positioning, not squeamishness:

That question made sense when the fiction was a human ghostwriter — you were choosing a collaborator and gender is a reasonable human preference. Under the ratified positioning, Ivy and Reid are **Project Partners** distinguished by *working style*, and the question now asks the author to pick a person's gender when what actually differs is method. It quietly reasserts the fiction the rename was meant to retire.

It is also a worse signal than the one we now have. Move 3 asks directly how the author wants to work, which is the axis Ivy and Reid actually differ on. Matching on form (Move 1) plus posture (Move 3) is better matching than a gender proxy, and it uses answers the author has already given.

**Proposed matching:** form and subject from Move 1, working posture from Move 3, presence and shape of existing material from Move 2. Where signals are mixed, the partner is offered rather than assigned — *"I'd put you with Ivy, but Reid would take a different angle on this. Either?"* — which is more honest than a tiebreaker nobody can see.

`paul` — this changes a user-facing question that has been in the flow since March. `ux` — this is yours to rule on. I am not editing it unilaterally.

---

## 3 · §6.2 — Upload: redirect for finished manuscripts, embed for everything else

**Decision: split by what the material is, not by where the user is.**

**Finished manuscript → redirect.** Eliot says so plainly: *"For a finished manuscript there's a proper intake — it pulls the chapters apart so Alex can read them. Couple of minutes. Shall I take you through?"* Routes to the existing onboarding surface.

**Partial material → embed.** Paste box and file drop inside the Wright canvas. Never leaves the workshop.

**Why the split is principled rather than pragmatic:** the existing pipeline (`extractPdfText` → `pdfWordCount` → metadata form → `parseChapters` → poll until rows land, audit §2a) **works by detecting structure that is already there** — chapter headings, consistent formatting, a document that knows it is a book. Scribblings have no structure to detect. Their structure comes out of the conversation, which is Wright's whole job.

Those are two different problems. Rebuilding the parse pipeline inside Wright to preserve the workshop metaphor would create a second parse path for a problem Wright does not have, and duplicated parse paths diverge. Conversely, routing scribblings through the parse pipeline would ask it to find chapters in a document that has none, and it would either fail or invent them.

**One honest caveat:** the redirect currently leaves the project shell, because `/onboarding` is a standalone page (audit §2a). That is a seam. It is acceptable now and it closes when onboarding moves in-shell — not my lane, but worth `ux` knowing the redirect's quality depends on it.

---

## 4 · §6.4 — Content shaping: from scribblings to chapters

### 4.1 · Getting material in

Three routes, one destination:

1. **Paste** — a paste box in the canvas. The largest single affordance, because most people's notes are already in a document they can select-all. Should be the most prominent of the three.
2. **File drop** — `.txt`, `.md`, `.docx`, `.pdf` into the existing `ghostwriter-uploads` bucket (exists, per-author-folder RLS verified in the July audit). `.pdf`/`.docx` extract via the existing path.
3. **Transcript paste** — not a separate mechanism, but worth naming in the copy: a lot of "scribblings" are voice memos someone has transcribed, and saying so invites material people otherwise think does not count.

### 4.2 · Where raw material lives before it is a chapter

Material arrives undifferentiated. It is not yet a chapter and must not pretend to be one.

**It does not go in `chapters`.** The invariant says *every chapter Wright creates is a real chapter Alex will read* — a staging blob at a reserved number would violate that and would show up in Alex's read as a chapter-shaped thing that is not a chapter.

**It goes in the session record** (§7), which already has a column for it: `uploaded_file_text`, one of the columns I flagged in July as existing-but-never-written. A column nobody writes finds its writer.

In the canvas it presents as **unassigned material** — visible, scrollable, clearly distinct from chapters, with its own affordance set.

### 4.3 · Shaping it

The partner reads the material (Craft Call, `wright_shape` journey) and proposes a shape:

> *"There are three things in here. The hospital. The years after. And what you've made of it since. I'd start with three chapters and see if it holds."*

The author accepts, amends ("the hospital's really two"), or rejects. On accept, chapters are created and material is assigned — by the partner as part of the same act, or by the author moving it.

**What makes this honest rather than magic:** the proposal is always visible as a proposal before anything is created. Nothing lands in the chapter list until the author says yes. The partner is reading and suggesting; the author is deciding. That is the positioning made operational rather than asserted.

### 4.4 · The reserved-slot guard — astudio §2.2, adopted

Prologue = 0, epilogue = 999 (`insertChapterAt`, `/author-studio/page.tsx:1871+`). Ivy and Reid create chapters from conversation, so the allocator needs an explicit guard rather than an inherited assumption:

- Emergent chapters allocate `max(chapter_number WHERE 0 < n < 999) + 1`, **bounded to `[1, 998]`**
- `0` is allocated **only** on an explicit prologue request, and only if free
- `999` is allocated **only** on an explicit epilogue request, and only if free
- A partner-proposed chapter can never reach a reserved slot by arithmetic
- At 998 chapters the allocator refuses and says so, rather than colliding

**And astudio's second note, adopted:** *don't add a third renumber path without the temp pass.* If Wright reorders chapters it calls astudio's existing cascade. It does not grow its own — that is how the no-op cascade defect happened, and a third path is a third place for it to happen again.

---

## 5 · §6.3 — The affordances, and the accounting the rule forced

§6.3 is ratified as **direct-with-veto**: Ivy/Reid write directly into the canvas, the author has instant veto, edit, revert, and ask-for-alternatives at every moment. I design the affordances, not the model.

### 5.1 · The inventory, honestly

| Affordance | Substrate | Status |
|---|---|---|
| Partner draft lands in canvas | `chapters.content` | **exists** |
| Author edits freely | `chapters.content` + save-before-switch (port from `/author-studio:1820-1869`) | **exists** |
| Accept / keep | no-op — the content is already there | **exists by construction** |
| Ask for alternatives | Craft Call + transient client state | **exists — see 5.3** |
| Reject / discard | restore prior content | **needs 5.2** |
| Revert to an earlier draft | prior content history | **needs 5.2** |
| Version history list | prior content history | **needs 5.2** |

### 5.2 · `chapter_versions` — built, never wired, and currently unusable

My audit said there was no version substrate. **That was wrong, and in an interesting way.** There is a table:

```
public.chapter_versions
  id              uuid    NOT NULL  default uuid_generate_v4()
  manuscript_id   uuid    NOT NULL
  chapter_id      integer NOT NULL          ← chapters.id is uuid
  content         text    NULL
  version_number  integer NOT NULL
  created_by      uuid    NULL
  created_at      timestamp WITHOUT time zone  default CURRENT_TIMESTAMP
```

RLS is on with 2 policies. **Rows: 0.** Constraints: `PRIMARY KEY (id)` and nothing else — no foreign keys at all.

**It cannot be used as it stands.** `chapter_id integer` cannot hold a `chapters.id uuid`. Whatever schema this was designed against, it is not the current one. It is the same pattern I flagged in July as *"columns added later that no one writes to"* — one level up, as a whole table, with RLS correctly applied to something that has never held a row.

Three options and the rule says pick one:

- **(a) Fix it.** `chapter_id` → uuid, add FKs to `chapters(id)` and `manuscripts(id)`, `created_at` → timestamptz for consistency with every other table. Wright becomes its first writer.
- **(b) Drop and rebuild** under a Wright-specific name.
- **(c) Don't ship reject, revert, or history.**

**I propose (a).** It costs the same single migration as (b) with less churn, it already has RLS, and it removes a piece of schema wreckage in the same act rather than leaving a dead table beside a live one with a confusingly similar name. Giving an abandoned table its first writer is a better outcome than orphaning it further.

**What Wright writes:** before any partner-generated content is inserted into `chapters.content`, the prior content is snapshotted — `version_number` incrementing per chapter, `created_by` the author's profile id. That one write buys all three affordances:

- **Revert** — restore any prior version
- **Reject / discard** — revert to the version immediately before this insertion; a special case, not a separate mechanism
- **History** — list versions for a chapter

One migration, three controls, and the accounting is closed rather than disclosed.

### 5.3 · Ask-for-alternatives needs no schema, and here is why that is not hand-waving

Alternatives are generated, shown, one is chosen, the rest are discarded. If the page reloads mid-choice they are gone — and **nothing was committed, so nothing was lost.** The chosen alternative goes through the same insert path as any other draft (snapshot prior → write new), so it inherits revert for free.

The control asserts that alternatives will be generated and shown. A Craft Call and client state make that true. It asserts nothing about durability, so it owes nothing durable. Naming the reasoning explicitly because "no new table needed" is exactly the claim that should be suspected, and the test is whether the control promises anything the substrate cannot keep. This one does not.

### 5.4 · What I am deliberately not proposing

**Per-paragraph version granularity.** Chapter-level snapshots are enough for a surface whose output is explicitly raw material headed through three editorial gates. Per-paragraph history is a real feature for a finished-draft editor; for Wright it is cost without a user who needs it. If Alex/Sam/Jordan want it later, that is astudio's call on their own surface.

---

## 6 · §6.5 — The migration event

The commission offers four mechanisms: an explicit button, a checklist that turns green, an Eliot-brokered graduation, or a silent flip on tab click.

**Proposal: Eliot-brokered, author-triggered, with an advisory state line and no quality gate.**

Why not the others, briefly:

- **Silent flip on tab click** — the transition is the most meaningful moment in the Wright arc and making it invisible wastes it. It also lets an author trip into editing by misclicking a tab.
- **Checklist that turns green** — implies Wright can judge readiness. It cannot. *"Is this draft ready for developmental editing"* is precisely the judgment Alex exists to make. A green light Wright cannot validate is a hollow affordance in the 09-24 sense — the worst kind, because it looks like a gate.
- **Bare button** — works, but spends the moment on a click.

**The design:**

**A state line, not a verdict.** Wright shows facts: *"6 chapters · 41,200 words · last worked on Tuesday."* No readiness score, no progress bar toward a threshold Wright invented. Facts the author can weigh themselves.

**The author says when.** Either to Eliot in the transcript, or via a control that reads as an intention rather than a submission — *"I think this is ready for Alex"* rather than **Submit**.

**Eliot brokers it.** Eliot ran the intake; the arc closes in the same voice that opened it. The graduation is short, specific to what actually happened in this project, and it hands over by name. **This is the real home of the "old friend" script** currently stranded in `/onboarding:211-230` — where, per the audit §5 and astudio's agreement, it asks a graduate to upload a PDF of the book we just wrote together.

**The technical act is small:** `manuscripts.status` `'ghostwriting'` → `'editing'`, `current_phase_number` NULL → 1, `editing_phases` rows created with phase 1 active, tab strip shifts rightward.

**Reuse, don't rebuild.** Creating `editing_phases` and activating phase 1 is the same act `/onboarding` performs post-parse. Wright calls that path; it does not write a second one. `astudio` — you offered to wire your side to meet this, and this is the seam. It is one function, and two callers of one function is correct where two implementations of one act is not.

**It is reversible.** Per the 09-21 ruling, Wright stays visible and its state migrates rather than hiding. Graduation is a shift in who is driving, not a door locking. An author who realises chapter 4 needs rewriting from scratch comes back to Wright, and the tab is there.

---

## 7 · The data model — every write Wright makes

| What | Where | Status |
|---|---|---|
| Prose | `chapters.content` | exists — the invariant |
| Chapter records | `chapters` (`title`, `chapter_number`, `status` defaults `'draft'`) | exists |
| Prior content | `chapter_versions` | **needs the §5.2 fix** |
| Conversation | `editor_chat_history` — `sender` free text (`'eliot'`/`'ivy'`/`'reid'`/`'author'`), `phase_number = 0` | exists, countersigned by astudio |
| Brief, calibration posture, raw intake material, upload refs | session record — see below | **needs re-keying** |
| Journeys | `as_journeys` | **needs two widens, §8** |
| Uploaded files | `ghostwriter-uploads` bucket | exists, RLS verified |
| Graduation | `manuscripts.status` → `'editing'` | exists |

**On the session record.** My audit said `ghostwriter_sessions` "retires or is repurposed." I now propose **repurposed, re-keyed, and renamed** — and want to be precise that this does not violate the invariant. The invariant forbids a parallel *drafts* table: prose must live in `chapters`. It does. What survives is session-scoped state that is not chapter-shaped — the brief, the calibration posture, the raw unassigned material, the upload references. That has to live somewhere and `chapters` is the wrong shape for it.

The change: add `manuscript_id` (the audit's original ask, now architecturally possible since #113), and rename `ghostwriter_sessions` → `wright_sessions` in the same act, since the table is being migrated anyway and the name is three renames stale. Cheap: 8 stale rows, 0 chat rows behind it.

**`ghostwriter_chat` retires clean** — 0 rows, nothing to migrate.

---

## 8 · Journeys, Craft Call, and the two widens

### 8.1 · Journey types to register

`as_journeys.journey_type` currently accepts `['full_analysis','chapter_analysis','editor_chat','phase_transition']`. Wright needs four:

| Type | Fires on | Proposed timeout |
|---|---|---|
| `wright_intake` | Eliot's match call | 90s |
| `wright_chat` | An Ivy/Reid conversational turn | 90s |
| `wright_draft` | Chapter or section draft generation | 5 min |
| `wright_shape` | Shaping analysis over pasted/uploaded material | 3 min |

### 8.2 · The `editor_name` blocker — restating, still open

```
as_journeys_editor_name_check:
  CHECK (((editor_name = ANY (ARRAY['alex','sam','jordan'])) OR (editor_name IS NULL)))
```

Lowercase, three values. Raised on 09-24, not yet ruled. Wright needs `'ivy'`, `'reid'`, `'eliot'` — or writes NULL and carries persona in `journey_type`. **This gates the journey-wired portion of the port, not the port itself.** My preference remains the widen, so one column keeps meaning one thing.

### 8.3 · astudio's §2.1, adopted without qualification

The journey row goes in **before** the webhook fires, and **a failed insert is a failed fire, never a silent continue.** Astudio's 08-18 finding — 49 calls, $3.65 of compute, no journey row, unmeterable and undiagnosable — is the standing example of what routing around this looks like, and it will be cited in the code comments at each Wright call site so the discipline arrives with its reason attached.

### 8.4 · Craft Call station IDs and truncation policy

All Wright AI calls go through the Cell (`crXhG5caNVHBmglo`) from day one. Station IDs:

`eliot.intake_match` · `ivy.chat` / `reid.chat` · `ivy.draft` / `reid.draft` · `ivy.shape` / `reid.shape`

**Truncation policy, per call class** — the thing I said in July I would name in briefs rather than leave to the workflow author on the day:

- **`*.draft`** — on `max_tokens_truncation`, retry **once** at 2× `max_tokens` (bounded). On a second truncation, surface the partial to the author honestly: *"I hit a length ceiling there — want me to keep going from where I stopped, or take it from here?"* **Never silently persist a truncated draft as complete.** This is Ivy's specific exposure — memoir excavation runs long — and it is the failure the Cell's gate exists to catch.
- **`*.chat`** — no retry. Surface the honest state immediately; a truncated conversational reply is visible to the author anyway, and a silent retry doubles the wait for something they can see is cut off.
- **`*.shape`** / **`eliot.intake_match`** — no retry; these are short structured calls and a truncation means something is wrong with the input, not the ceiling.

---

## 9 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | **Ratify or amend this proposal.** Code work stays blocked until you and `ux` do. |
| 2 | `sysadmin` | `as_journeys.editor_name` widen — `ivy`, `reid`, `eliot` (open since 09-24, §8.2) |
| 3 | `sysadmin` | `as_journeys.journey_type` widen — four values, §8.1 |
| 4 | `sysadmin` + `paul` | `chapter_versions` repair migration (§5.2): `chapter_id` integer → uuid, FKs to `chapters`/`manuscripts`, `created_at` → timestamptz. Paul's acceptance per House Rules. Unblocks three affordances. |
| 5 | `sysadmin` | `ghostwriter_sessions` → add `manuscript_id`, rename `wright_sessions` (§7). 8 stale rows. |
| 6 | `ux` | Rule on §2 — the three moves, the calibration phrasing, and **§2.4 the retired gender question** |
| 7 | `ux` | Rule on §1 — the accumulating-brief canvas as the answer to first-open emptiness |
| 8 | `astudio` | Countersign §6 — Wright calls your `editing_phases` creation path at graduation rather than writing a second one |
| 9 | `paul` | §2.4 is a user-facing positioning change, not a copy edit. Your eye before `ux` rules. |

## 10 · What this proposal does not cover

Task #120 (post-manuscript context-awareness) — the intake has a branch shaped to receive it (§2.1) but the pattern port from Alex chat is its own commission. The publisher-facing anything — Wright is sacred space, and nothing here is visible outside the author's own account. Per-paragraph versioning (§5.4). Persona naming outside my three.

— `wright`
