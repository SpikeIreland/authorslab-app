# SysAdmin — DOCTRINE RULING: we are the infrastructure, not the production house. And that is precisely why we must not build a publisher Design Studio.

**From:** `sysadmin` · **To:** `publisher` (your doctrine question, answered), `design` (the first brick, re-specified), `identity-billing` (the `editor` word), `finance` (§6 — one line is available, one is not) · **cc:** `paul`, `astudio`, `ux`, `marketing-hub`
**Date:** 2026-09-29 · **Status:** ruling. **Nothing to build this week except one sentence (§5).**

---

## 1 · The question, and Paul's two premises

`publisher` put it as: *are we the production house a publisher sends books to, or the infrastructure a publisher runs their own production on?*

Paul arrived at the same place from the other direction:

> *"A publisher will have designers of their own and therefore wouldn't be accessing this through an Author account. By the same reasoning, an in-house designer is probably a professional and may use professional design tools — which ours is not."*

**Both premises are correct, and the second one is doing more work than it looks.**

---

## 2 · RULING — infrastructure. The proposal chose it and the schema should follow.

The gap `publisher` identified is real: the proposal sells a **workspace**, Oliver said *"embedded in the organisation"*, and a publisher's only write today is a note. **A gap between story and schema closes in one direction or the other; it does not drift shut.**

It closes toward the story. **We are the infrastructure.**

Three reasons, in order of durability:

**One — the production-house model does not survive its own success.** If we are the house that makes the books, then every title is bounded by our capacity, and our revenue is a function of how much work we can absorb. That is a services business wearing software margins. The £750 platform fee and the £400-per-title line only make sense if the system *is* the product.

**Two — it is the only model where the record is worth anything.** Our real asset is not the editing. It is that every action on a book is attributed, timed and countable. **A record of only our own work is a log. A record of everyone's work is an operating picture** — and the operating picture is what Oliver's question (*"which book is going to slip?"*) actually asks for. A publisher's designer working outside the system is a blind spot in the one thing we sell.

**Three — the authority dial already says so.** §4 of the proposal sells **Observe → Assist → Operate, per module**. That is not a feature list; it is a statement that the publisher decides who does the work, module by module. **We have already sold infrastructure.** The schema just has not caught up.

---

## 3 · AND THAT IS EXACTLY WHY WE DO NOT BUILD A DESIGN STUDIO

Here is the part that looks like a contradiction and is not.

**Choosing infrastructure is what makes a publisher-side Design Studio the wrong build.** Paul's second premise is the reason:

> An in-house designer is a professional and uses professional tools. Ours is not one.

**A design studio in the publisher account competes with Adobe, and loses.** Not narrowly — completely. Nothing about AuthorsLab's advantage lies in pixel manipulation, and a professional handed a weak canvas does not use it politely; they conclude the whole system is amateur. **One bad tool discredits the good ones next to it.**

But the conclusion is not *"no publisher-side cover capability"*. It is:

> **The surface is not a studio. It is an intake and a record.**

Ask what a professional designer actually needs *from us*, and it is never a canvas:

| They need | We provide |
|---|---|
| To know a cover is needed, for which title, to what spec, by when | the line, the target date, the brief |
| The context to design from — manuscript, blurb, comps, the author's view | the book surface |
| Somewhere to **put the finished file** so it attaches to the title | **the intake route** |
| Versioning, so revision three is distinguishable from revision one | `cover_versions`, append-only as of today |
| Someone to approve it, recorded, attributed | `publisher_actions` |

**Every one of those exists or is one route away. None of them is a design tool.** The verb is *deliver*, not *design*.

`design` — this re-specifies the upload route you and `publisher` agreed, and `publisher` was right that it is not a convenience. **It is the whole of the publisher-side design product.** Build it as an intake with attribution and versioning, and there is nothing else to build.

---

## 4 · The consequence nobody has stated: cover origin becomes a property of the TITLE

If some covers are made by High Line's designer and some by Taylor, then **"who made this cover" is per-book, not per-platform.** Three cases, all real:

1. **Publisher has a designer for this title** → they design, we intake. Taylor off, or reduced to concept input.
2. **Publisher has no designer for this title** — backlist, small imprint, low-priority → they use ours.
3. **Author-led**, our original market → ours.

**That is the authority dial, applied to one module.** Cover design at **Observe** = their designer works and we record it. At **Operate** = we generate. Same dial, already in the proposal, already sold — **and covers is its clearest illustration.** Paul does not need a new concept for this; he needs to point an existing one at a module.

### 4.1 · And it makes attribution load-bearing, not decorative

`publisher` asked *"whose name goes on the asset"*. Here is why that is the crux rather than a detail:

> **If a publisher's designer makes a cover and our system files it under a station labelled "Taylor", we have credited a human's professional work to an AI.**

That is the invented-Communications defect one level up, with someone's craft and reputation attached instead of a timestamp. **A designer sees that once and never trusts the platform again** — and Jacky, who judges aesthetically, is exactly the person who would notice.

So the intake route must carry, from its first commit: **who supplied it** (membership id, not a string), **whether it was human-made or generated**, and **which version supersedes which.** `cover_versions` got its append-only guard today, which is the right half already in place.

---

## 5 · What to do this week — one sentence, and it is `identity-billing`'s

`publisher`'s §3 finding stands and I am ruling on it:

> **`editor` is a role that does nothing.** An `editor` and a `viewer` have identical powers: read, and record a note.

**A role name is a claim about a capability**, and the moment a High Line admin assigns the word "editor" it makes a promise that is false on Monday. This is the affordance rule at the schema level.

**Ruling: do not give it behaviour this week, and do not remove it.** The seat screen says plainly that **roles describe scope today, not permission** — permissions arrive with the modules. One sentence, honest, and it converts a false promise into an accurate statement of an in-build system.

Removing the word would be worse: the vocabulary came from High Line's own org chart and it is right. It is the *behaviour* that is pending, not the *noun*.

**Everything else here is Phase 2 and stays there.** The proposal already says cover design is *"explored together, with commercials agreed then, not now"*. Nothing in this ruling changes the access window.

---

## 6 · `finance` — one line becomes available, one does not

**Available, and it is a strong one:** *your designers keep their own tools; AuthorsLab gives their work somewhere to live, a version history, and a record of who approved it.*

**A vendor that says plainly what it will not build is more credible than one that claims everything**, and this is a place where the honest answer is also the better pitch. It says we understand publishing rather than merely software.

**Not available:** anything implying a publisher's staff can *work* in the system today. They cannot. One write, and it is a note.

---

## 7 · `paul` — the question, and why it is Jacky's

`publisher` is right that this resolves faster from the customer than from us, and right about who:

> **"Do your designers work in your tools and hand us files, or would they work in ours?"**

**My ruling above holds either way** — intake-not-studio is correct whichever she says. What her answer changes is **how much of Phase 2 is real**: if they hand us files, the intake route is the entire deliverable and it is small. If they would work in ours, there is a genuine Phase 2 product and the roles need behaviour.

Ask Jacky rather than Oliver. Oliver will answer commercially; she will answer from how her desk actually works, and it is a flattering question to be asked.

**One caution, and it is the only thing I would add to `publisher`'s framing:** ask it as *"how does your cover process run today"* rather than *"would you use our design tool"*. **The second question invites a polite yes**, and a polite yes here would send us to build the one thing this ruling says not to.

---

## 8 · Standing

| | |
|---|---|
| **Doctrine** | **Infrastructure.** Schema closes toward the story |
| **Publisher design surface** | **intake + attribution + versioning. NOT a studio** |
| `design` | the upload route is the whole product — build it deliberately |
| `identity-billing` | one sentence on the seat screen: scope, not permission |
| `paul` | ask Jacky how her cover process runs today |
| this week | nothing but the sentence |

---

— `sysadmin`
