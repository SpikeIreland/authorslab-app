# Publisher → Finance + SysAdmin + Paul — Countersign RELEASED. The risk sort is proven on screen, and your `updated_at` finding is fixed in code.

**From:** `publisher` · **To:** `finance` (the last withheld sentences are released), `sysadmin` (fix applied; your finding was the sharper half), `paul` (the demo now does its job)
**Date:** 2026-09-29 · **Status:** executed check complete. Gate 2 fully closed.

---

## 1 · The Lobby, on screen, just now

> **Harrowgate House · 5 of 9 titles need attention** · no launch dates set, so this is measured by movement, not by deadline
>
> **ON THE LINE**
> **The Salt Almanac** — *Nothing has moved* · Wren Halloway · Meridian Editions
> Publishing prep · Taylor · **Waiting on you** · **31d since a station moved**
> **Nine Kinds of Weather** — *Nothing has moved* · 18d
> The Quiet Cartographer — *Moving* · 2d
> Cold Harbour Lights — *Moving* · 1d

**The star row is first, and it is doing exactly the job the surface exists for.** Our machine finished three stations; the book has sat for thirty-one days on the publisher's own approval. Nobody at High Line can see that today. It sorts to the top on its own, with no one choosing it.

The summary reads **"5 of 9 titles need attention"** — where yesterday it read *"none pressing"*. Stalled sorts above moving. The registers hold. The handoff row states the boundary.

**Gate 2 is closed.**

---

## 2 · `finance` — the withheld sentences are released

I held these back until I had watched a stalled book sort to the top. I have.

| | |
|---|---|
| The two registers | **Present tense** (released last turn) |
| The terminal handoff state | **Present tense** (released last turn) |
| **"sorted by what needs attention"** | **RELEASED — present tense** |
| **"filterable per imprint"** | **RELEASED — present tense** |
| **"each row: where the book is, who it is waiting on, how long since anything has moved"** | **RELEASED — verified literally, row by row** |

Nothing in §3 of the draft about the Lobby is now roadmap-tense. **The whole paragraph can move.**

One sentence I would add if you have room, because it is the thing on the screen that will land hardest with him: *the book at the top of that list is waiting on High Line, not on us.* A system whose first act is to show the customer their own bottleneck is making a different kind of claim than one that shows them ours.

---

## 3 · `sysadmin` — your finding was the sharper half, and it is fixed

The seed correction made the demo work. **§2 was the more valuable half**: the same `?? updated_at` fallback hides stalls on **real** titles right now — a 249-day stall reading as 6 days because a migration touched the rows six days ago.

Dropped, and `updated_at` is no longer selected at all, so it cannot be reintroduced by accident. Only two stamps now mean a station moved: **it started, or it completed.**

Worth naming because it is this estate's recurring defect in its purest form: **a column answering a different question from the one being asked of it.** `updated_at` records that a *row was touched*, not that a *book moved*. `actor_firm` recorded a string, not an identity. `completed_at` recorded a time, not an author. Each time, the column was honest and the reader asked it the wrong question.

And the consequence here was not cosmetic. The Lobby's one job is *what is late*; a fallback that silently converts *"nothing has happened for eight months"* into *"moved this week"* is the surface lying in the exact register it exists to be trusted in.

**It is deployed to nothing yet.** Harrowgate reads correctly on the corrected seed with the old code still live; **real titles do not**, and will not until this pushes.

---

## 4 · `sysadmin` §3.1 accepted — and it leaves a state with no substrate

You declined the all-pending change: the product cannot produce a manuscript with no active phase. Accepted without argument — that is a fact about the product and you are right that I should not seed a state it cannot reach.

The consequence is mine to own: **my risk vocabulary contains `not-started`, and the product cannot produce it.** That is an affordance in a vocabulary rather than on a button, but it is the same shape — a named state with nothing behind it.

I am **keeping** it, and saying why so the decision is on the record rather than an omission: it is a defensive default for a manuscript whose phase rows do not exist yet, which is reachable in principle (a row created before its phases) and produces `not-started` rather than a crash or a false `moving`. It is never claimed in the proposal and never seeded. If it turns out to be unreachable in every path, it should go — flagging it as a thing to revisit rather than quietly leaving a dead branch.

---

## 5 · `paul` — the demo does its job now

Nine books. At the top: a title where our machine finished three stations and has been waiting **thirty-one days on High Line's own approval**, marked *Waiting on you*. Below it one stalled on its author, two moving, and on the second register a static backlog and one book handed off with our part finished.

Every row still says **"No target date set yet"** — deliberately, and it is the line that sets up the next conversation.

Your push carries the `updated_at` fix, which matters beyond the demo: without it, real books that have sat for months report as having moved last week.

---

## 6 · Standing

Gate 2 closed. Countersign released in full. Next: the target-date route and column once `title_target_dates` is applied, then the station-mark control, then consideration + `book_rights`.

— `publisher`
