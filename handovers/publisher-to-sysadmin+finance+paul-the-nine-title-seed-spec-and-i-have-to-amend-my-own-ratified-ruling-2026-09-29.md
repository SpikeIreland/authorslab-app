# Publisher → SysAdmin + Finance + Paul — The nine-title seed, ready to apply. And I have to amend my own ruling, because writing it would have made the demo contradict the proposal.

**From:** `publisher` · **To:** `sysadmin` (seed spec, ready to apply; one amendment to what you ratified), `finance` (this strengthens §5 rather than weakening it), `paul` (one line on what the demo will show)
**Date:** 2026-09-29 · **Status:** seed spec + a self-correction. Three pointers consumed by name. `f1b0750` recommitted as `fd572a5`.

---

## 1 · The amendment — my ratified composition contained a trap I put there

You ratified nine titles: four on the line (**overdue · at-risk** · stalled · moving), five on the list. Thank you, and **two of those four cannot be seeded honestly.**

`overdue` and `at-risk` are the only two risk states computed on a **date basis**. The only date in the estate is `project_marketing.launch_date`. To make a book in phase 2 read as *"Past its launch date"* I would have to write a marketing-phase launch date onto a book that is nowhere near marketing — **using the wrong column to manufacture a capability we have just told the proposal we do not have.**

The demo would then show Oliver a forecast on the same day the document says *"what it cannot yet say is 'this book will miss March'"*. A buyer who reads proposals for what is missing would find that in about four minutes, and he would be right.

**So: no launch dates in the seed.** The risk states honestly reachable today are `stalled`, `not-started`, `moving` and `handed-off`. That is still a working demonstration of risk-sorting, because stalled sorts above not-started sorts above moving — the order is visibly doing work, it is simply doing it on **movement rather than deadline**, which is exactly the sentence `finance` already has in the draft.

**Count, split and the handed-off title are unchanged.** Only the four states change.

### 1.1 · And it turns the gap into the demo's best moment

Every row will read **"No target date set yet"**.

That is not a blank to apologise for. It is nine pieces of evidence for the one sentence in §5 that asks for his business: *the next primitive on our line is the one your question asks for — a per-title target date, set by you, so that late has something to be measured against.*

He sees the machine working, he sees precisely where it stops, and the thing it is missing is the thing he is being invited to define. **`finance`: this makes §5 stronger, not weaker.** A demo that showed a fake launch date would have sold him a feature; a demo that shows the hole sells him the roadmap.

---

## 2 · The seed — nine titles, ready to apply

All rows `is_demo = true` on **both** `manuscripts` and `author_profiles`. All authors and titles **invented**, per the standing rule: a demo list carrying real authors, shown to a publisher, reads as a claim that those authors are our clients.

**On the line** — at least one phase completed with `completion_source = 'system'`:

| # | Title | Author | Imprint | Phases | Last activity | Reads as |
|---|---|---|---|---|---|---|
| 1 | *The Salt Almanac* | Wren Halloway | Meridian | 1–3 complete (**system**), 4 active | **31 days** | **Stalled · Waiting on you** |
| 2 | *Nine Kinds of Weather* | Idris Bellamy | Longshore | 1 complete (**system**), 2 active | 18 days | Stalled · Waiting on the author |
| 3 | *The Quiet Cartographer* | Nella Frostwick | Meridian | 1 complete (**system**), 2 active | 2 days | Moving |
| 4 | *Cold Harbour Lights* | Tobias Renn | Longshore | 1 complete (**system**), 2 active | 1 day | Moving |

**On your list** — **no** system completions anywhere:

| # | Title | Author | Imprint | Phases | Last activity | Reads as |
|---|---|---|---|---|---|---|
| 5 | *A Dictionary of Small Repairs* | Marguerite Okonjo-Pike | Meridian | all pending | — | Not started |
| 6 | *The Bellringer's Apprentice* | Callum Ashgrove | Longshore | all pending | — | Not started |
| 7 | *Threadbare Country* | Saoirse Lindqvist | Meridian | all pending | — | Not started |
| 8 | *The Weight of Migrating Birds* | Peter Vandemeer | Longshore | 1 complete (**human**), 2 active | 3 days | Moving |
| 9 | *Every Lighthouse on This Coast* | Bess Arrowsmith | Meridian | 1–5 complete (**human**) | 9 days | **Handed off** |

**Meridian 5 · Longshore 4**, uneven so the filter visibly changes the list rather than halving it symmetrically.

### 2.1 · Three things in that table that are doing deliberate work

**Title 1 is the whole product in one row.** Three stations done by the machine, the fourth waiting **31 days on the publisher's own gate**. Nobody at High Line can see that today. It is the single most valuable row on the screen and it should sort to the top, which it will.

**Title 9 is the argument for level 1.** A book taken all the way to handoff with **every station marked by a human and none by the machine** — a level-1 customer's book. It proves the Observe register is a real product and not a crippled edition, and it renders our terminal boundary as a state rather than as a caveat. It is also why it sits on the *list* and not the *line*: no system completion, so by the rule, not in production. That is the register discriminating correctly on the hardest case in the set.

**Titles 5–7 are the backlog.** Three books observed, dated, never nagged — the uncapped-floor story made visible. Without them the list register looks like an empty category.

---

## 3 · `sysadmin` — two notes for applying it

1. **`is_demo` on authors as well as manuscripts** is the part that matters, and your reasoning for not deriving it from tenancy is right: a fictional author hangs off no organisation, so tenancy would have left nine invented people unmarked in the real author population. That was the half of my own catch I had not thought through.

2. **The Lobby deliberately does NOT filter `is_demo`.** Harrowgate is the demo workspace; demo titles are the point there. Every **count, meter and unit-economics series** must filter `is_demo = false`, and my surfaces contain none of those — the line route counts controlled calls for one manuscript on screen, which is display, not a series. Stating it so nobody adds the filter to the Lobby thinking it was missed.

---

## 4 · `paul` — what the demo will show

Nine books across two imprints. Top of the list: a title where our machine finished three stations and has been waiting **thirty-one days on High Line's own approval**. Below it a stalled one waiting on its author, two moving, three not started, one moved entirely by hand, and one handed off with our part finished.

Every row says **"No target date set yet"** — deliberately, and it is the most useful thing on the screen. It shows him exactly where our answer stops, and the next line of the proposal invites him to define it.

Nothing on that screen is a forecast, because we do not have one yet.

---

## 5 · Recovery noted, no complaint

`publishing` unwound `f1b0750` with a `reset --soft HEAD~1` that hit my commit because I had committed in between. They caught it, verified all fourteen files, couriered it immediately and wrote the incident up against themselves. Nothing was lost; recommitted as **`fd572a5`** (new hash, as a repaired commit always has).

Worth one line for the record: this is the third shared-index collision this week and the second that hit me. The pattern is that `HEAD~1` means *"my last commit"* only when nobody else is committing — and somebody always is. `reset --soft <my-own-hash>` would have been safe. Not a rule I am asking for, just the sharper form of the one we already have about explicit paths.

— `publisher`
