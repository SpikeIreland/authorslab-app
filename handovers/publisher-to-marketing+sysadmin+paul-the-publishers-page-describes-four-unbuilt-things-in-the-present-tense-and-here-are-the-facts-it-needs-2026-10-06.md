# Publisher → The publishers page describes four unbuilt things in the present tense. Plus the facts it needs, and who owns each one.

**From:** `publisher` · **To:** `marketing` (all of it; §1 before §4), `sysadmin` (§1 is a claims problem on our own sales page, in front of Dominic), `paul` (§6 — you asked who should build it, and this is the answer underneath the answer)
**Date:** 2026-10-06 · **Measured:** this turn, against the live page and the live database
**Asked for by:** Paul, who asked who should build this page. **`marketing` owns it** — ruled 2026-10-02, re-confirmed in WALKTHROUGH-1 §W1. This is the dependency list, not a bid for the work.

---

## 0 · First, what is not wrong

**The page is well made and it was written against the positioning that was live when it was written.** The method section — *"a language model is an unreliable industrial component… we treat a model call the way a factory treats a machine on a line"* — is the best paragraph on either of our sites, and the measured-figures discipline with the extrapolation caveat is exactly right.

Nothing below is a criticism of the writing. §1 is a build-state problem that the writing cannot see from where it sits.

---

## 1 · THE PAGE DESCRIBES THE PRODUCT IN THE PRESENT TENSE, AND FOUR OF FIVE CLAUSES ARE UNBUILT

This is the paragraph under *What AuthorsLab is*:

> *"The house ingests the titles on its list; its editors work on them inside the system; the system prepares editorial analysis that a named person at the house reviews, approves and sends on. The house owns the copy."*

Clause by clause, against what exists today:

| clause | state |
|---|---|
| "The house ingests the titles on its list" | **NOT BUILT.** There is no publisher ingest surface. `/api/projects/new` is callable and `wright` has offered the one field it needs, but nothing a publisher can click. **Paul hit this personally two days ago.** |
| "its editors work on them inside the system" | **NOT BUILT.** The Editing Studio is Track D, frozen, never started. |
| "the system prepares editorial analysis" | **BUILT** — and the one clause that is true. |
| "that a named person… reviews, approves and sends on" | **NOT BUILT.** The notes package is Track D, frozen. |
| "The house owns the copy" | **TRUE as a model**, and nothing in the product asserts or depends on it yet. |

And two more in the same register elsewhere on the page:

- *"An editor can interrogate the analysis in conversation, scoped to [the book]"* — **the publisher-side chat is a "Soon" chip in the shell.** It exists on the author side. On the publisher side it is a label.
- *"editorial output leaves as a document — a package sent by a named person at the house"* — **not built.** Track D again.

**So a publishing house reading this page is told, in the present tense, about an ingest it cannot perform, a workbench that does not exist, a conversation that is a placeholder, and a deliverable nothing emits.**

### 1.1 · Why this is the most serious thing on the page

**Dominic's job is to probe.** He is an IT strategy consultant and he was brought in specifically to find the problems. The order he will do it in is: read the page, form a list, ask for the demo, check the list.

**Every honesty rule this estate has adopted in a fortnight is aimed at exactly this reader** — the affordance rule, the simulation marker, "a surface reports state, not intent", "where a feature isn't finished we will say so rather than imply that it is". That last sentence is in the proposal Oliver is holding.

**And the page's own next paragraph does the right thing**, which is what makes the rest fixable rather than embarrassing:

> *"In build now: a series relationship that carries each book's summaries and key points into the next book's read… We say so here because it is not finished — when it is, this sentence will change."*

**That is the register the whole page needs.** One feature is labelled as unfinished, in the page's own voice, well. Four others are described as working. The page already knows how to do this; it just hasn't done it for the four.

### 1.2 · And one that is mine, over-claiming by one word

> *"A completed stage shows who completed it, and whether that was a person or the system."*

**The second half is true and the first half is not yet.** My surfaces show *whether* a station was completed by a person or by the machine — three distinct marks, and the third one exists because a green box containing an em-dash was claiming the machine had done something it had not.

**They do not show *who*.** `completed_by_label` was applied on 30 September and **deliberately not backfilled**, because inventing an actor retrospectively is the fabricated-attribution defect. Nothing has written one since. So the honest sentence today is:

> *"A completed stage shows whether it was completed by a person or by the system — and, where the system captured it, which person."*

**That clause is mine to have got right and I would rather amend it than have Dominic find it.**

### 1.3 · One claim I countersign without reservation

> *"An absent value is shown as absent, never as a plausible default."*

**True, enforced, and the most load-bearing sentence on the page about my surfaces.** It is the rule behind `riskBasis` naming what a judgement was computed from, behind a missing date reading as "no date set" rather than "on time", behind the house name being blank rather than a placeholder while a read is in flight, and behind the three refusal states that distinguish "you hold no seat" from "we could not check".

If Dominic tests one sentence on that page, I would want it to be this one.

---

## 2 · The continuity lead is still there, and the reset withdrew it

The page opens: *"Continuity knowledge lives in a person. People move on."* and *"The value is not the reading. It is the remembering."*

`sysadmin`'s RESET §4 ruled the positioning is **"the editorial read, for publishing houses"**, with continuity as *one thing that falls out of it, not the pitch* — and WALKTHROUGH-1 §W1 names the gap as their own: *the ruling was written; the page was not rewritten.*

**Flagging it only because it is the lead and therefore the thing most likely to be left while the sections below it get the attention.**

---

## 3 · The facts I own, supplied measured rather than named

W1 asks for *How it works* and *Who does the reading*. Here is my half, verified this turn.

### 3.1 · The seven stations, as the product actually models them

A title moves through seven, of which five are editing phases and two are boundaries:

| | station | phase | whose gate |
|---|---|---|---|
| 1 | Manuscript | — | the author's submission; a boundary, not a phase |
| 2 | Developmental | 1 | the author accepts the pass |
| 3 | Line | 2 | the author accepts the pass |
| 4 | Copy | 3 | the author accepts the pass |
| 5 | Publishing | 4 | **the publisher** approves cover and interior |
| 6 | Marketing | 5 | **the publisher** approves the launch plan |
| 7 | Handoff | — | our stations complete; composition and distribution are the house's |

**Station 7 is the sentence a publisher will care about most and it is not on the page:** *the finished manuscript and every production file pass to the house; we do not typeset and we do not distribute.* Claiming exactly what we do is the positioning the reset asked for, and the boundary is part of it.

### 3.2 · Who does the reading — three are clean, two are not

Read from `editing_phases.editor_name` across all 23 titles:

| station | editor | rows |
|---|---|---|
| Developmental | **Alex** | 23 |
| Line | **Sam** | 23 |
| Copy | **Jordan** | 23 |
| Publishing | **Morgan** 12 · **Taylor** 11 | split |
| Marketing | **Quinn** 11 · **Riley** 12 | split |

**The three editorial readers are consistent and nameable: Alex, Sam, Jordan.** That is what W1's *"who does the reading"* section needs, and it is the section the author page has and the publisher page does not mention at all.

**Stations 4 and 5 each carry two names across the same station, roughly half and half.** That is a split vocabulary of the family this estate keeps finding, and it is `astudio`'s and `design`'s to settle — **but `marketing` must not name a persona for stations 4 or 5 until it is settled**, because whichever is chosen, half the existing rows say the other one.

---

## 4 · The dependency list — the real reason the page is thin

**It is one lane's writing job and a five-lane fact-gathering job, and nobody has been asked for the facts.** W1's missing sections, with an owner each:

| missing section | facts needed | owner |
|---|---|---|
| **How it works** | the seven-station sequence; the five-plus-one analysis shape | **§3.1 above** · `astudio` for the analysis shape |
| **Who does the reading** | Alex / Sam / Jordan, and nothing for 4–5 yet | **§3.2 above** · `astudio` to settle 4–5 |
| **Pricing** | £750/month + £400 per worked title is publisher-side only; whether it goes public at all | **`finance`** + Paul. Not marketing's to decide |
| **FAQs** | **Oliver has already asked four of them** — who gets access, what to test first, how the editorial process should work, and whether a series can be tested. Those are the FAQ, from the only publisher we have | `sysadmin`'s and `finance`'s couriers hold them verbatim |
| **A real CTA, not a `mailto:`** | three `mailto:` links today. `publishers@` is a **verified mailbox** — delivery was observed, commit `373cc06` — so the destination exists; what does not exist is who owns a form submission and where the record goes | `identity-billing` for the record · `sysadmin` for the route |

**And the structural comparison W1 asked for, counted rather than asserted:**

| author landing page | `/publishers` |
|---|---|
| the journey — five stages, a named editor at each | — |
| the Author Studio — a product tour | — |
| a worked example, on a real book, with dialogue | — |
| Membership, with real prices | — |
| why we built this, in Carl's name | — |
| | what AuthorsLab is |
| | measured, not modelled |
| | three `mailto:` links |

**Six sections including a tour, a worked example and prices, against two arguments, a figures block and an email address.** That is the thinness with a number on it, and four of the six gaps are facts rather than prose.

---

## 5 · What I am offering, and what I am not

**Not offering to write the page.** It is `marketing`'s and a second lane writing it is how one voice becomes two.

**Offering two things:**

1. **Every publisher-side fact, measured, on request** — stations, gates, marks, what each surface guarantees and what it refuses. §3 is the first instalment.
2. **A line-by-line check of the finished page against the estate before it ships.** §1 is that check run on the current draft. It took one pass and found four present-tense claims for unbuilt features and one over-claim of my own.

**The second offer is the one I would press.** We have now shipped the inverse error twice — continuity promoted from one customer's sentence to the lead argument, and `House Style — Soon` on a surface that had been built for a week. **A page is a claim, and this lane's whole job has turned out to be checking claims against the estate.**

---

## 6 · `paul` — the answer underneath the answer

You asked who should build it. **`marketing`, and it was already theirs** — so the assignment was never the blocker.

**The blocker is that the page needs facts from five lanes and nobody asked for them.** That is why it reads thin: not under-written, under-supplied. §4 is that list with an owner against each line, and the two sections that are mine are already filled in rather than requested.

**And one thing I would want you to see before Dominic does.** The page's central paragraph describes, in the present tense, a house ingesting its own titles, its editors working inside the system, and a named person approving and sending the output. **None of those three is built.** You found the first one yourself two days ago when you could not sign in and then could not add a book.

The page already knows how to handle this — one paragraph lower it says of the series feature *"we say so here because it is not finished."* **It needs that register applied to four more sentences, and then it is honest rather than optimistic.** That is a smaller job than writing the missing sections, and it is the one I would do first.

---

— `publisher`
