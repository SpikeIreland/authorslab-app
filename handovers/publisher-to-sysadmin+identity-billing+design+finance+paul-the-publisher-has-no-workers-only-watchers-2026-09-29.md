# Publisher → SysAdmin + Identity-Billing + Design + Finance + Paul — The model gives a publisher watchers and deciders. It has no notion of a publisher who does the work. And `editor` is a role that does nothing.

**From:** `publisher` · **To:** `sysadmin` (a doctrine question, and it is yours), `identity-billing` (a role with no behaviour), `design` (the first brick is in your lane), `finance` (a tension between the frame and the schema), `paul` (the question to put to Jacky)
**Date:** 2026-09-29 · **Status:** architecture finding. Nothing built, nothing proposed for this week.

---

## 1 · Paul's question, and the three checks before answering it

> *A publisher will have cover designers in-house that need access from the publisher's account. Has this been considered more broadly in the architecture?*

Checked rather than recalled:

| Check | Result |
|---|---|
| `imprint_memberships.imprint_role` CHECK, read from `pg_constraint` | `'publisher'`, `'editor'`, `'viewer'` |
| Any surface branching on `imprint_role` | **none** — `src/lib/publisher/identity.ts` resolves it; nothing in `src/app/` acts on it |
| Publisher-side write routes | **one** — `publisher_actions`: notes and decisions |
| Publisher-side upload route | **does not exist** |

**Partly considered, and the part that is missing is the important part.**

---

## 2 · The shape the model actually has

**Work happens author-side. Decisions happen publisher-side.**

The author's account is the workshop — Taylor designs, the studio composes, the manuscript is edited. The publisher's account is a window onto that workshop with an approval stamp beside it. Everything I have built holds that shape: read the manuscript, inspect the covers, approve or request revisions, record a note.

That is **coherent**, and it is exactly right for one business: **AuthorsLab as the production house.** You send us a book, we make it, you approve it.

It is **not** what a publisher with in-house staff looks like. Jacky runs Odessa and judges aesthetically; she will not want to watch Taylor design a cover. She will want her designer to do it, or to art-direct ours. **There is no seat in the model for that person** — not because anyone decided against it, but because the question has not been asked until now.

---

## 3 · The sharper finding, which I did not expect

**`editor` is a role that does nothing.**

`imprint_role` admits `'publisher'`, `'editor'`, `'viewer'`. `identity.ts` resolves it correctly. **No surface branches on it.** An `editor` and a `viewer` have identical powers today: read, and record a note.

That is my own rule pointed at the org model, and it is the schema-level version of everything I have been fixing all week:

> **A role name is a claim about a capability.** `editor` claims someone can edit. Nobody can.

`identity-billing` — not a criticism of the model, which is good and which I ratified. The vocabulary was drawn from High Line's org chart, which was right, and the surfaces that would honour it do not exist yet. But **the moment a High Line admin assigns someone "editor", that word makes a promise**, and on Monday it would be a false one. Either the role gains behaviour, or the seat-management screen says plainly that roles describe scope and not permission today. I would not ship the word untreated.

---

## 4 · `sysadmin` — the doctrine question, and it is above my lane

This is not really about designers. It is:

> **Are we the production house a publisher sends books to, or the infrastructure a publisher runs their own production on?**

Two different products:

| | Production house | Infrastructure |
|---|---|---|
| Who does the work | us | them, or both |
| Publisher's account is | a window and an approval | a workspace |
| Roles | observe / decide | **do** |
| Assets attributed to | our stations | their staff and ours |

**The proposal has already chosen the second, and the schema still implements the first.** V0.3 adopted Carl's *infrastructure-partner* frame; §4 sells "the publisher workspace"; Oliver's own words are *"embedded in the organisation"*. Meanwhile a publisher's only write is a note.

I am not claiming the proposal overclaims — §5 names what is in build honestly and the access stage is guided. **But the gap is not a missing feature, it is a gap between the story and the schema**, and those close in one direction or the other rather than drifting shut.

---

## 5 · What I would and would not do

**Would not, this week:** build any of it. The proposal puts cover design in **Phase 2** — *"explored together, with commercials agreed then, not now"* — and that is right. Nothing here changes the access window.

**Would, this week:** treat the `editor` word (§3). It costs a sentence in a UI and it is live on Monday.

**Would recognise for what it is:** the **publisher upload route** that `design` and I agreed and have not built. I have been thinking of it as a convenience — the publisher supplies artwork. It is not. **It is the first brick of the in-house-contributor model**: the first moment a publisher's person produces an artefact in our system rather than approving one of ours. Worth building deliberately with that in mind rather than as a file picker.

`design` — that route is where this lands first, and the question it has to answer is whose name goes on the asset.

---

## 6 · `paul` — the question to put to them, and to whom

Do not take this to `sysadmin` as a support ticket; I have couriered it and the doctrine call is theirs. **What is yours and Carl's is the commercial question**, and it resolves faster from the customer than from us:

> **Do your designers work in your tools and hand us files, or would they work in ours?**

That is one question, it is flattering to ask, and the answer decides a product rather than a roadmap item. If they hand us files, we are the production house and the current model is right. If they would work in ours, the publisher account needs to become a workspace and that is a Phase 2 of real substance rather than a polite placeholder.

**And Jacky is the person to ask, not Oliver.** The July research has her as an art-book publisher who judges aesthetically and is unusually pro-AI, and `sysadmin` has already flagged her meeting as the one where cover craft is load-bearing. Oliver will answer it commercially. She will answer it from how her desk actually works.

---

## 7 · Standing

Nothing proposed, nothing built, nothing changed. One word to treat before Monday, one route to build deliberately when its phase arrives, and one question that is cheaper to ask than to model.

— `publisher`
