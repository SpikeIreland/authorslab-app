# SysAdmin RULING → all lanes — The High Line demo build. Four rulings, and a brief for every lane.

**From:** `sysadmin` · **To:** all lanes · **Date:** 2026-10-02
**Context:** Paul and Carl have settled the approach. Oliver Malcolm, CEO of High Line Publishing, gets a working account.
**Supersedes:** AMENDMENT 1 §3 in part — see §0.
**Timeline:** the Monday deadline is withdrawn. We are buying time deliberately. Build it properly.

---

## 0 · Correcting AMENDMENT 1, two hours old

AMENDMENT 1 §3 said the demo was author-side only and told `identity-billing` to park the persona row. **Paul's specification is a publisher shell** — company-wide functions in a left panel: Books, People, House Style, Chat.

So: **the publisher environment is back on, without the deadline.** `identity-billing`, un-park. Nothing you wrote is wasted and `publisherMayIngestInto()` is now needed sooner rather than later.

My error was couriering a re-scope before the scope was finished. The deadline moved; the scope grew. Those are different things and I collapsed them.

---

## 1 · What Oliver gets

A **publisher shell wearing the Author UI's layout**. Paul's reasoning, and it is sound: the author surface is the more rounded of the two by differential testing, not taste — it has a shell, a list, a journey strip and has survived a real 63,000-word book end to end. The publisher surface has accumulated three "no way in" defects this week. Replicating is largely an exercise in **culling**, not building.

**Account:** `oliver.malcolm@highlinepublishing.com` · organisation **High Line Publishing** · imprints **Odessa** and **Antidote**.

**Left panel:** Books · People · House Style · Chat.

**Books contains:** *CS The List* (his own, already parsed — 82 chapters, analysed, report generated), plus seeded sample titles at different stages so the later stations have something to show. He may add a title of his own to watch it parse.

---

## 2 · R7 — The noun is **Books**, not Projects

Paul's ruling and it is right. "Project" was chosen to cover a script as well as a book. In a publishing house the object is a **book**, and borrowing a hedge-word costs us precision with the exact customer we are now building for.

`Books` in all publisher-facing surfaces. Existing `/projects/[id]` routes are not in scope for a rename — **the URL is not the vocabulary.** Do not start a route migration off the back of this.

---

## 3 · R8 — Voice is a parameter of the reader, not a property of the engine

Oliver's reports and Alex's replies must be in the **third person**. Today they address the author directly: *"I'm excited to dig into your manuscript."* To an editor reading about someone else's book, that is wrong.

**But the author product still wants second person.** Converting the prompts outright would strip the author-facing voice and be painful to unpick.

**RULED:** voice is resolved **per request, from who is reading** — one engine, one prompt lineage, a voice parameter. Publisher context renders third person ("the author establishes…"), author context keeps second ("you establish…").

Explicitly forbidden: **duplicate prompt sets per audience.** Two copies of every prompt is the divergence problem we already have with templates, and it ends with the two voices disagreeing about the same book.

---

## 4 · R9 — A simulation must announce itself

Design, Publishing and Marketing will be **simulated** for this demo. That is legitimate: Oliver needs to see the shape of the ecosystem, and those stations are not built.

**A simulation he cannot tell is a simulation is not legitimate.** All week we have ruled that an affordance is a claim. `publisher` shipped the Company tab deliberately *without* an upload control because a button that looks like it works and does nothing is the silent swallow. The proposal says it in writing: *"Where a feature isn't finished, we will say so rather than imply that it is."*

**RULED:** every simulated surface carries a **persistent, non-dismissible marker** — *"Preview — sample data, not your titles."* Visible without scrolling, present on every simulated view.

The reasoning is not squeamishness. It is that the editorial studio is **real**, and if Oliver discovers for himself that one room is a stage set, he will reasonably doubt the rooms that aren't. The marker protects the true part.

---

## 5 · R10 — Seeded data never enters the countable chain

Sample books and simulated activity must not appear in any billable-title count, any revenue figure, or any metric that leaves the building. `finance` owns the predicate.

Same family as the fabricated-attribution rulings: a seeded row that looks like work is a claim about work.

---

## 6 · Briefs

### `ux` — the publisher shell · **this gates everything else**

Replicate the Author UI layout as a publisher shell: left panel **Books · People · House Style · Chat**, with the journey strip preserved at book level.

- The strip is a **state display**, not navigation — it answers "where is this book" before anything is clicked. That property is the whole reason for replicating; preserve it.
- `publisher`'s three station marks are **non-negotiable**: completed-by-person, completed-by-system, and "reached — no station runs here". A green cell containing an em-dash claimed the machine had done something it had not. Reuse their marks; do not mint new ones.
- Stations differ from the author's. Author: Alex → Sam → Jordan → Taylor. Publisher: editorial → design → production readiness → handoff. **Same grammar, different stations.**
- Your front-door finding applies here: the shell must be reachable by navigation, not by typing a URL.

**Acceptance:** a signed-in publisher user reaches Books from the first screen without typing a URL, and can tell where every book is without clicking.

### `astudio` — third-person voice + pre-generated notes

- Implement R8. Voice parameter through the Craft Call; **no duplicate prompt sets.**
- Pre-generate Alex's chapter notes for several chapters of *CS The List* so "Start Editing" is immediate rather than a wait.
- Known defect to fold in: chapter 6 (175 words) has no summary from the last run — 81 of 82. That is #97's signature.

**Acceptance:** the same chapter rendered in publisher context and author context differs in voice and agrees in substance.

### `identity-billing` — the account

- Un-park. Create Oliver's account, High Line Publishing, imprints Odessa and Antidote.
- Your two pre-checks stand and have each caught something: the account must **not** hold `role='admin'`, and confirm the insert returns exactly one row.
- `publisherMayIngestInto()` is now on the near path.

### `publisher` — Books inside the shell

- The Books list is yours; `ux` owns the shell it sits in.
- Your front-door work is directly on this path now.

### `design` — Design tab, simulated

- Language addressed to a **professional designer**, not an author: "upload your own artwork", versioned, attributed.
- **No Photoshop integration**, and we should not imply one. The proposal already has the better answer: *"Your designers keep their own tools. AuthorsLab gives their work somewhere to live."* Versioned upload with attribution is the honest offer; a live Adobe integration is a quarter of work nobody asked for.
- Your cover intake engine is the foundation.
- R9 marker required.

### `publishing` — Publishing Hub, simulated

- **One platform only — KDP.** The point is to show that a title can be routed to a channel, not to enumerate channels.
- R9 marker required.
- Separately, and unchanged: Gate C extends the Sentinel **route**, not a workflow (AMENDMENT 1 §2).

### `marketing-hub` — Marketing Hub, simulated

- Show only. R9 marker required.

### `finance` — R10

- Confirm the predicate that keeps seeded books and simulated activity out of countables, and say plainly where it is enforced.

---

## 7 · What is NOT in scope

- Renaming `/projects/*` routes (R7 is vocabulary, not URLs).
- A separate `publisher.authorslab.ai` domain. The desktop icon Paul wants is a **PWA scoped to a path** — `start_url` and `scope` of the publisher shell. A subdomain is a separate decision with real auth cost (Supabase cookies are domain-scoped) and must not be bought merely to get an icon.
- Any Adobe or Photoshop integration.
- The APITemplate migration — parked, see `docs/n8n/APITEMPLATE-MIGRATION-STATUS-2026-10-01.md`.

---

## 8 · Standing

The demo's credibility rests on one asymmetry: **the editorial studio is real and everything around it is not yet.** R9 exists to keep that asymmetry legible. The strongest thing we can show Oliver is not a feature — it is that the system caught the chapter-numbering error in his own manuscript and said so.

Argue with any of it. Nothing here is urgent enough to be beyond discussion.

— `sysadmin`
