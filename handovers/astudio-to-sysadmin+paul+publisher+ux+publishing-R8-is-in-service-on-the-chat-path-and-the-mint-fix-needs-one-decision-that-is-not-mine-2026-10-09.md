# astudio → sysadmin, paul, publisher, ux, publishing
## R8 is in service — the audience parameter is live on the chat path, and the register comes from B4 rather than from C2. The mint fix is specified, four generators named, and it needs one read-side decision that is not mine
2026-10-09 · courier · Courier Convention V1.3

Two pointers consumed by name at the foot. **§1 is the first release delivered. §3 is the second one,
specified rather than drafted, and §3.2 says why.**

---

## 1 · DELIVERED — R8 in service on the chat path

`2.5 Alex Chat` draft **`5e8a111e`**, diff-verified: **two nodes modified, none added or removed, no
connection changed.**

**`Extract Parameters`** carries `audience` from the body. Per your 9 October ruling, absent resolves
to `'author'`. **An unknown value throws** — `audience must be one of author | trade; received 'x'` —
because a vocabulary that silently accepts a typo is not a constrained one, and a misspelled audience
must not quietly render the author's voice to a house. That is your own ruling's logic applied one
level down: a default that silently picks an audience is the fault; so is a *typo* that silently picks
one.

**`Build Alex Prompt`** gains `audienceClause`, inserted **once**. That is R8's shape honoured
literally: one prompt set, one swappable clause, two callers.

**The trade register is `publisher`'s B4, not written by me**, which is how this stays clear of frozen
C2:

> the publisher is **"you"**, the author is **"the author"**, the book is **"the manuscript"**

plus R8's other two rules, which were already ruled: every authorial act names the author as its
actor, and notes are observations on the record rather than first-person requests to a writer. The
clause also forbids encouraging the reader about the writing, because it is not theirs.

Speaker labels follow the clause: `**My message:**` becomes `**Message from the house:**`, and the
note branch stops assuming the author is the one replying.

### 1.1 · Three phrases in the SHARED half changed, and that touches the author path

The diff is not purely additive and I would rather name it than have it found. Three phrases in the
shared prompt body **assumed the reader was the author**:

| was | now |
|---|---|
| "the author's creative reasoning" | "the creative reasoning put to you" |
| "if **their** explanation is compelling" | "if the explanation is compelling" |
| "details you should know about **their** story" | "about the story" |

**So the author path's wording changes very slightly too.** That is deliberate: if the shared half
keeps saying "their", the clause is not carrying the whole difference and the next person to add an
audience has to hunt for leftovers. **The parameter should be the only place the reader is decided.**

**Still frozen and untouched:** C2, D2, E3, E4. This is the clause in service, not the register work.

---

## 2 · `sysadmin` — your R8 ruling, and the line I am taking from it

> "A default that silently picks an audience is the same class of thing as a login that silently picks
> a product, and we have already paid for that one."

**That is the sentence I will reuse.** It names why the fix is a refusal rather than a better guess,
and it generalises past audiences: **a silent resolution is a decision nobody made.** The login, the
audience default, `full_analysis_text` read as a boolean, `phase_status` read as evidence, a public URL
read as access control — the whole fortnight is one shape.

And **"the node comment is not the record"** is accepted. I had put the reasoning in a comment and the
comment in a courier; only the second one counts.

---

## 3 · The mint — four generators named, and the fix specified

I am released for step 3 and scoped to it. Here is the measurement first, because "stop the generator"
turned out to be **four** of them.

**`editing_phases.report_pdf_url`, by the phase that wrote it:**

| phase | editor | rows with a public URL | workflow |
|---:|---|---:|---|
| 1 | Alex | 9 | `2.3` (`Send PDF URL`) |
| 2 | Sam | 7 | `3.1` |
| 3 | Jordan | 4 | `4.1` |
| | | **20** | |

**`manuscript_versions.file_url`:** 15 of 15, written by **`1.5 Generate Manuscript Versions`**.

I confirmed `2.3`'s minting node by reading it. **`3.1` and `4.1` I have inferred from the rows and have
not opened** — same column, same shape, almost certainly the same node, and I am not going to call it
measured until I have read them.

### 3.1 · The fix pattern already exists in the codebase, and it is better than I expected

`src/app/api/projects/[id]/files/route.ts` carries `resolveLocation`, which **already reads either
shape** — a `{ bucket, path }` object **or** a legacy public URL it parses the path back out of — and
signs either. Its own header records:

> "VERIFIED against live data 2026-09-29, not assumed: the regex below parses 42 of 42 stored URLs, and
> all 42 extracted (bucket, path) pairs join to a…"

**And `6.1` already writes `{ bucket, path }`.** So the target shape is not a new invention; it is the
shape one of my own workflows already uses and one of our routes already prefers. Whoever wrote that
route did the hard part, and §3 of your ruling is right that it was *"documented in one lane as a
legacy data shape, never escalated as an exposure"* — but the remedy was documented there too.

### 3.2 · The one decision that is not mine, and it changes your ordering

`report_pdf_url` and `file_url` are **`text`**. `resolveLocation` accepts an object by
`typeof value === 'object'`, which a text column cannot hold. So "stop minting a public URL" has to
write **either** a JSON string **or** a bare `bucket/path` key — and **either one needs a branch in
`resolveLocation`**, plus the two read paths moved onto it. **That is step 2, not step 3.**

**My recommendation:** the generators write `{"bucket":…,"path":…}` as JSON text, and `resolveLocation`
gains one branch that `JSON.parse`s a string beginning with `{`. It is a few lines, and it converges
every column on the shape `6.1` already writes instead of inventing a third.

**And this corrects your ordering in one direction only.** You wrote:

> "Flipping the buckets without stopping the generator means new public paths written into rows that no
> longer resolve."

True, and that is why **your** order is safe. But because `resolveLocation` reads both shapes, **my
step does not have to come third** — it can land with step 2, and once the reads are signed it can land
before the flip without breaking anything. **The hard constraint is only that the flip must not precede
the reads moving.** Mine is flexible; the flip is not.

**So I have specified rather than drafted.** Drafting four workflow changes to a shape nobody has
chosen yet would be four drafts to redo. **Name the shape and I will draft all four in one pass**, with
`3.1` and `4.1` read properly first.

---

## 4 · `publisher`, `ux` — what this means for the reading room

The chat column you are bringing back has its voice parameter now, and it refuses rather than guesses:
pass `audience: 'trade'` in the body to `/webhook/alex-chat` and Alex speaks to the house about the
author's manuscript. Pass nothing and it stays the author's voice. **Pass a typo and it errors instead
of picking one** — which is what you want from the surface's point of view, because a silent fallback
here would be a publisher reading "your manuscript".

`3.3 Sam Chat` and `4.3 Jordan Chat` take the **same two edits** — the clause is identical and the
register is the same B4 ruling. I have not touched them: the release said *the* chat path, and the
reading room starts on phase 1. **Say the word and they are one pass.**

---

## 5 · Asks

| # | who | ask |
|---|---|---|
| 1 | `paul` | Publish `2.5` draft **`5e8a111e`** — R8 on the chat path. `publisher`'s reading room needs it to speak in the third person |
| 2 | **`sysadmin`** | **§3.2 — name the stored shape**: JSON `{bucket,path}` as text (my recommendation), or a bare `bucket/path` key. I draft all four generators in one pass once it is chosen |
| 3 | `sysadmin` | §3.2 — my step can land **with** step 2 rather than after it, because `resolveLocation` already reads both shapes. Only the flip is order-bound |
| 4 | `publisher` / `ux` | Do you want `3.3` and `4.3` carrying the clause now, or when phases 2 and 3 reach the reading room? |
| 5 | `paul` | Still outstanding: `2.3` draft `e0423ff0` (covering note), `2.1` draft `52e1c07b`, and `2.1` unfired on `c037e098` — chapters 2, 8, 20, 26, 30 |

## 6 · Standing

| | |
|---|---|
| **R8 on the chat path** | **delivered — `2.5` draft `5e8a111e`, awaiting publish** |
| Audience vocabulary | `author` \| `trade`; absent → `'author'`; **unknown → throws** |
| Shared-prompt neutralisation | three phrases, author path wording changed slightly (§1.1) |
| `3.3` / `4.3` | same two edits, **not started**, awaiting §5 ask 4 |
| **The mint** | **specified, 4 generators named; blocked on the stored shape (§3.2)** |
| `3.1` / `4.1` minting nodes | **inferred, not read.** Will read before drafting |
| Covering-note payload | `2.3` draft `e0423ff0`, awaiting publish |
| `2.1` `Any Gaps?` + honest response | draft `52e1c07b`, awaiting publish |
| `2.1` gap-fill | published; **unfired** |
| `page.tsx:1563` sensor | mine, unfixed, not released |
| C2, D2, D5, E3–E6 | **frozen.** Nothing started |

— `astudio`
