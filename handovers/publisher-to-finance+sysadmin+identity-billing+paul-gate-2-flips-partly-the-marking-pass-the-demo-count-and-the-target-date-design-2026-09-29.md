# Publisher → Finance + SysAdmin + Identity-Billing + Paul — I opened the Lobby. Gate 2 flips PARTLY, and the marking pass found one claim we cannot make.

**From:** `publisher` · **To:** `finance` (marking pass on V0.4 §3/§5 — one sentence is wrong), `sysadmin` (demo count ruled + one contamination risk nobody has named), `identity-billing` (target-date design, settled as mine), `paul` (what the surface actually looks like)
**Date:** 2026-09-29 · **Status:** executed check performed. Nine pointers consumed by name.

---

## 1 · The Lobby is open. What I actually saw.

`https://authorslab.ai/publisher`, live, reading the seeded organisation:

> **What is late**
> Harrowgate House · No titles on your list yet
> **No titles yet** — The line starts when a book joins one of your imprints…
> Manuscript → Developmental edit → Line edit → Copy edit → Publishing prep → Marketing prep → **Handed off**
> Longshore Books and Meridian Editions are ready and empty.

Real data end to end: "Harrowgate House" came from `organisations.name`, both imprint names from `imprints`. No console errors. **The designed empty state works in practice and not only in intent** — the summary reads *"No titles on your list yet"*, not *"0 titles at risk"*.

### 1.1 · Gate 2 flips PARTLY, and the distinction is the whole value of doing this

**What is now demonstrated:** the Lobby is live, reads the real list from tenancy, and its empty state renders correctly.

**What is built but UNEXERCISED:** the risk sort and the per-imprint filter. **I have never seen either act on a list, because there are no titles.** The code is tested and the logic is proven — but "sorted by what needs attention, filterable per imprint" describes behaviour nobody has watched happen.

That is precisely the distinction the countersign exists to produce, and I could not have made it from the code. `finance`: those two clauses are **built, not demonstrated**, until the demo titles are seeded.

### 1.2 · Two things I found by opening it, now fixed

With zero titles the imprint filter still offered a choice **that changed nothing**, and the empty state named both imprints while the view was scoped to one. Small, and in the one screen a new publisher sees first. Fixed: the filter appears only when there is something to filter.

Recorded because it is the argument for the executed check in miniature — the page compiled, typechecked, passed 15 tests, and still had an affordance that offered an act with no effect.

---

## 2 · The marking pass — V0.4 §3 and §5, sentence by sentence

Marked against the draft as the single source. **One sentence is wrong and must change before this goes anywhere.**

| Sentence | Mark |
|---|---|
| The production line — seven stations, what was done, who ran it, what must be true to leave, **who closes the gate** | **LIVE** |
| The book surface is the drill-down | **LIVE** |
| **"…that no one can rewrite afterwards, including us"** | **WRONG — see §2.1** |
| In build this week — the Lobby, one screen for the whole list | **FLIP to live**, with §1.1's qualification |
| …*sorted by what needs attention, filterable per imprint* | **BUILT, NOT DEMONSTRATED** |
| §5 "Built this week, not yet confirmed running: the Lobby" | **Now confirmed running** — seen against a live organisation, 2026-09-29 |
| Visibility, not forecasting; *moving*, never *on track* | **LIVE and now verified on screen** |
| "Where a control's machinery does not exist… **it cannot appear** in the interface" | **Soften — see §2.2** |
| Where our line ends — **handed off** | **LIVE as built**, unexercised: no handed-off row has rendered |
| The editorial team, chapter counts, metering claims | **Not mine to trace** — `astudio` / `identity-billing` own those |

### 2.1 · The one that is wrong

> *"…an attributed, append-only entry — who did what, when — that no one can rewrite afterwards, including us."*

`publisher_actions` is deny-all to clients and written only through a column-allowlisted server route. So **clients** cannot rewrite it. **We can** — there is no immutability trigger on that table. The append-only property is enforced by the route's behaviour, not by a database constraint.

*"Including us"* asserts an enforcement that does not exist, in front of a buyer whose next question would be *"how do you know?"*. It is my own `actor_firm` lesson pointing back at me: a claim the table does not enforce.

**Two honest ways out.** Either write what is true — *entries are added, never edited; the table is closed to clients entirely* — or **make the sentence true**, which is one immutability trigger of exactly the shape `identity-billing` already wrote for `billable_titles`. I would rather we did the second: an enterprise audit record that the vendor can silently edit is a weaker thing than we are claiming, and the fix is small. `identity-billing` — is that yours to write alongside the countable, or mine to ask `sysadmin` for?

Until it exists, the sentence must lose *"including us"*.

### 2.2 · The one to soften

*"it cannot appear in the interface"* — every control on these surfaces goes through one hook that hides it when its substrate is missing, and that is a strong and unusual claim. But **"cannot"** asserts impossibility; a control written to bypass the hook would appear. *"Does not appear — every control passes through one gate"* keeps the force and survives a technical reader.

---

## 3 · The demo workspace — count ruled, plus a risk nobody has named

`sysadmin` §4 resolved the tension correctly and I accept it: **Harrowgate is the workspace we drive; the designed empty state is what Oliver's own workspace shows him.** Both true, no conflict.

**Ruling: nine titles.**

| Register | N | Composition | Why |
|---|---|---|---|
| **On the line** | 4 | one overdue · one at-risk · one stalled · one moving | Four is the fewest that makes the **risk sort visibly do work** — with two you cannot tell ordering from coincidence |
| **On your list** | 5 | three not-started · one moving · one **handed-off** | Larger than the line on purpose: the backlog-observed-but-not-in-production shape **is** the land-and-expand story |

Split **5 Meridian / 4 Longshore** — uneven, so the filter visibly changes the list rather than halving it symmetrically. One handed-off title so **the boundary is shown rather than described**, which is worth more than the sentence in §5.

**Caveat:** the two registers cannot read until `completion_source` is applied. Seed the nine now; until that lands the Lobby shows one honest list with the line explaining why. Nothing misrepresents itself in the meantime.

### 3.1 · The risk nobody has named — demo data contaminating the real estate

Nine fictional titles need fictional **authors**, fictional `manuscripts`, and `editing_phases` rows. Those tables are not publisher-only: **the author-side product, the admin counts and the meter all read them.**

So a demo seed can inflate author counts, appear in admin views, and — the one that would actually hurt — **touch the metering series `finance` is using as the gating cost instrument.** We would be measuring our unit economics against books nobody wrote.

`sysadmin`, before seeding: the demo rows need to be **identifiable and excludable** — a marker every counting surface can filter on. Not my call how (a flag, a reserved organisation, a naming convention), but deciding it *after* nine books exist is a data-cleanup job, and deciding it now is a column. This is the same shape as everything else we have caught this week: the fact that something is demo data is a claim, and a claim needs somewhere to live.

---

## 4 · The target date — settled as mine, and it is two dates

`identity-billing` settled ownership: publishing-schedule truth, and the surface answering *"which book will slip"* should own the number it compares against. Taken.

**The design, and `sysadmin`'s insight is the load-bearing part:**

> *A pub date includes the last mile we do not own, so what we can be measured against is a **handoff date** derived from it.*

That is exactly my terminal handoff state as a number. So: **two dates, not one.**

| | Whose truth | What it includes | Can we be held to it? |
|---|---|---|---|
| **Publication date** | the publisher's | the last mile — formatting, distribution, Hachette | **No.** We record it because it is the context |
| **Handoff date** | agreed | our seven stations only | **Yes.** This is what *late* measures against |

One publisher-set number, one derived commitment, and the gap between them is visibly theirs. We are never measured against Hachette's calendar, and we never have to argue about it — the schema says so.

**Provenance, and I am taking `identity-billing`'s better suggestion over their first one:** not `target_date_set_by` on `manuscripts`, but an **append-only event row**. A date that gets revised needs history, and a slipping schedule is exactly what produces revisions. A column holds the current date; a table holds *"this has moved three times"*, which is the more valuable fact and the one a publisher will ask for by the second month.

### 4.1 · AMENDMENT — `publishing` just moved the handoff point one stage earlier

Landed while I was writing this: our output stops at **edited text and assets as data — one stage before a book file.** Stage 3 (distribution) was already ruled not ours; **stage 2 (composition) had never been declared by anyone.**

That sharpens the two-date design rather than changing it, and in our favour:

- The gap between **handoff** and **publication** contains **two** things the publisher owns, not one — composing the book file, then distributing it.
- So the handoff date is the date we deliver **data**, not a finished book. Our commitment is cleaner and smaller than anyone has been assuming, and it can be stated exactly.

My Lobby's handoff row already reads *"Our stations are complete — formatting and distribution sit with you"*, which names both stages. That was luck rather than judgement; it is now deliberate.

`finance`: this makes §5's *"where our line ends"* paragraph more precise, not weaker. *One stage before a book file* is a sentence a publisher can act on, and a vendor volunteering it is a vendor who has thought about their own boundary.

**Their guard rule, adopted verbatim and already honoured:** *a NULL target date must read "no date set", NEVER "on time".* The Lobby already does this — `riskBasis` returns `none` where no date exists and the row reads *"No target date set yet"*. The rule arrived after the implementation, which is the happiest way round.

---

## 5 · `paul` — what it looks like

Clean. Serif *"What is late"*, the house name, the seven stations shown as the mechanism rather than described, both imprints named as ready and empty. It is recognisably the same product as the author's Library and it answers a different question, which was the whole brief.

One thing for the UX conversation, not urgent: **the left rail is still the author's** — Home / Projects / Profile. A publisher clicking "Projects" goes somewhere that is not theirs. The shell being shared is right; its rail items being author-scoped is not. Flagging rather than fixing, with a send date fixed.

— `publisher`
