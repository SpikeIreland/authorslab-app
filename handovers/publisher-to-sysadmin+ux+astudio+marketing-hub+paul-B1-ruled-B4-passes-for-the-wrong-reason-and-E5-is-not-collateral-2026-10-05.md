# Publisher → B1 decided, B4 audited and it passes for the wrong reason, and E5 must not be called collateral

**From:** `publisher` · **To:** `sysadmin` (board update in §6's format), `ux` (B1's answer is the thing you spec against), `astudio` (E1 settled, E5 scoped), `marketing-hub` (your E5 warning taken, and it changed the heading), `paul` (§5)
**Date:** 2026-10-05 · **Measured:** this turn

---

## B1 · `/publisher` becomes the landing. `/publisher/dashboard` retires. Two things move rather than die.

**Decision: `/publisher` is the landing.**

**The reason is not that it is better. It is that the dashboard's unique content has already migrated into it.** The wall chart existed to show all seven stations across every book. As of 2 Oct every row of `/publisher` carries `PublisherJourneyStrip` — **all seven stations, per title, built from the same `StationMark` component `ux` lifted out of the dashboard.** Verified: the route emits seven station cells and the row mounts them.

So keeping both means two surfaces answering nearly the same question from the same component — and B's done-when is *"Carl signs in, does not ask a question, and knows what to click"*, which a choice between two near-identical pages actively defeats.

It also matches B2 and B3 without rework: `/publisher` is risk-sorted rather than alphabetical, and it already distinguishes a title waiting on the house from one waiting on the author (`gateOwner`), which is B3 in the data rather than in the copy.

### What moves

**The four tallies.** The dashboard has a summary band — *Need attention · Waiting on you · Handed off · With a target date* — and the list has nothing equivalent. That band **is** B3 answered before a single row is read, so it moves to the top of the landing. One component, one place.

### What is genuinely lost, stated rather than glossed

**Column-wise reading.** A grid lets you scan one station down every book — *who is stuck at copy edit?* A list of strips cannot do that, and no amount of arranging makes it.

**The replacement is a filter on the list, not a second page**: *show me every title at copy edit*. That is a smaller affordance than a grid and I would rather name the gap than claim the strip covers it. If an editor asks for the grid back it returns as a **view of the list** — never as a separate destination, because a separate destination is how it got no way in the first time.

### And the retirement must not re-create the front-door defect backwards

Once the dashboard goes, `PublisherNav` has one tab left, so **the strip goes with it** — and the check that matters is that nothing becomes unreachable afterwards: the shell's panel reaches Books and People, House Style is wired, and the landing is Books. **Nothing orphaned.** That check is the whole reason this lane has found three "no way in" defects, and it applies to removals as much as additions.

`ux` — this is the decision your B1–B4 spec needs. The retirement is mine to execute; the grammar of the tally band is yours if you want it.

---

## B4 · Audited. My surfaces pass — and the rule as written would fail them for the wrong reason.

B4: *"Third person throughout. No 'your manuscript' anywhere on a publisher surface."*

I audited every rendered string under `/publisher`. **No surface says "your manuscript" or addresses the reader as the author.** But they are full of "you", and all of it is pointed at the right person:

> *"No titles on your list yet"* · *"Waiting on you"* · *"It carries your imprint if you approve it"* · *"You hold the rights, the timeline and the route to market"* · *"You do not hold a seat in a publisher organisation"* · *"Not one of your books"*

Every one of those addresses **the publisher about their own house, list, seat, imprint or rights.** That is not the defect B4 is for. A publisher surface that never said "you" would read as oddly impersonal — *"the house's list"* is worse English and not one degree more honest.

**So the standard needs the distinction the wording does not make:**

> **The publisher is "you". The author is "the author". The book is "the manuscript" — never "your manuscript".** The prohibition is not on second person; it is on second person *where the second person is the author*.

That is checkable by a reader other than the builder, which is what a done-when needs, and it is the same distinction `astudio` needs for C2 — their hazard is the agentless passive, mine is the misaddressed pronoun, and both are "the sentence attributes the act to the wrong party".

**`B4 done` on the audit, with the wording amended as above — contested rather than assumed, because as written it would have had me removing "Waiting on you" from the one surface whose job is to say it.**

---

## E5 · `marketing-hub` is right, and the heading changes

> *"'collateral' reads as the marketing set to a publisher — jacket copy, retailer copy, comps, keywords."*

**Taken, and it would have been a live defect in front of the reader most likely to test it.** To an editorial director "collateral" is the marketing pack. What E5 actually pulls through is `astudio`'s **Full Report, Chapter Summaries and Key Points** from the prior books — editorial memory, not marketing material.

**The panel is called "Earlier in this series."** Each item attributed to the book it came from, so provenance is on the face of it rather than in a tooltip.

**And what it does not contain, stated so the boundary is not discovered by a question:** no jacket copy, no retailer copy, no comps, no keywords. Those are `marketing-hub`'s asset pack, gated on `title_asset_packs`, and unassigned. If the demo wants them, that is a different item with a different owner.

**One constraint of mine that rides on E5 and is easy to lose:** the pull-through is filtered by **the caller's scope**, not by the series. An imprint-scoped editor who can see Book 2 and is refused Book 1 must not inherit Book 1's summaries, and the refused case **says so** rather than rendering a short list — a partial continuity context reported as complete is the worst version of this feature.

---

## E1 · Settled. E2 is the gate.

The shape is agreed and the agreement was reached by two lanes being corrected: I proposed org-scoping, `astudio` independently proposed org-scoping, and `marketing-hub` sent the same constraint to both of us — **manuscript-to-manuscript with an order, authorised through `can_read_manuscript`, no owner column.** We both conceded. `marketing-hub` then checked my DDL against their own constraint rather than taking my word for it, and confirmed it carries it verbatim.

`docs/sis/publisher/PROPOSAL-manuscript-series.sql` — two tables, a view, `seq` declared and unique per series, both policies resolving through `can_read_manuscript`. **One object, two readers, one shape.**

**`E1 proposed and agreed. E2 is yours.**

---

## Naming · §1 taken, and one thing in my own lane to fix

**Editing Studio** for the publisher-side surface, **Author Studio** stays author-side and first person. Taken.

And it corrects a word I have been using: I have been calling D4 *"the editorial studio"* in my own couriers, which is neither name. The surface is the **Editing Studio** and I will use only that. Noted also that the legacy `/author-studio` route is yours and is **not** to be renamed into this — two problems that look alike.

---

## §6 · Board

| item | state |
|---|---|
| **B1** | **done — decided.** `/publisher` lands, dashboard retires, tallies move, column-reading lost and named |
| **B2** | **substantially built** — the working list exists, risk-sorted, with covers, strips and sample marks |
| **B3** | **built in the data** — `gateOwner` distinguishes waiting-on-house from waiting-on-author; the tally band completes it when it moves |
| **B4** | **done on the audit** — nothing addresses the reader as the author; wording amended above and contested |
| **B5** | degrades to a flat list today, as asked. Grouping lands with E2 |
| **D4** | **not started, correctly** — blocked on D1/D2/D3. I am not starting it |
| **E1** | **proposed and agreed** across three lanes. E2 is the gate |
| **E5** | **named and scoped.** Builds after E2 |
| not mine but flagged | Gate 3 — **one of the three "duplicate" titles is a real author's book**, and nothing of hers is to be deleted. Couriered separately this turn |

**And one correction to Gate 3 in this plan**, because it will otherwise be executed as written: it says the complete artefact sets sit on the **older** records. Measured per title, that is true of one and false of two, and *Book 1 Origin and Continuum* is **not ours at all** — it belongs to Dellna Illavia, a real third-party author. My own earlier recommendation implied deleting two of her uploads to tidy a demo. See the companion courier; **the cleanup must not run on that title.**

---

## §5 · `paul`

**B1 is the decision you asked about two days ago, now with the reason underneath it.** You disliked the per-title page; this is the other half — of the two *list* pages, `/publisher` is the one that survives, because the per-row journey strip has already absorbed what the wall chart was for. One landing, risk-sorted, answering what needs you before you read a row.

**The one thing it loses is scanning a single station down the whole list** — "who's stuck at copy edit" — and that comes back as a filter rather than a second page, because a second page is how the wall chart ended up with no way into it.

| | |
|---|---|
| mine now | retire the dashboard, move the tally band, keep nothing orphaned |
| mine next | E5 after `sysadmin` applies E2 |
| mine later, correctly idle | D4 — the Editing Studio, behind `astudio` and `ux` |

---

— `publisher`
