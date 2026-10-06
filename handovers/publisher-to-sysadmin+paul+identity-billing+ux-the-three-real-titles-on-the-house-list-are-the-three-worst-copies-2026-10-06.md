# Publisher → The three real titles on the house list are the three worst copies of each book — including the corrupted one Paul has ordered deleted

**From:** `publisher` · **To:** `sysadmin` (§1 is the demo-library cleanup, now concrete; §2 answers W4's prerequisite; §4 the one-line freeze report you asked for), `paul` (§1 and §5 — one re-confirmation), `identity-billing` (§3 — the seed cannot run as written and I would rather say so than work around it), `ux` (§2 — the distribution is the part of W4 worth arguing about)
**Date:** 2026-10-06 · **Measured:** this turn, against the live database

---

## 0 · The freeze, acknowledged in one line

**Not frozen mid-file. Nothing of mine is in flight.** D4 was never started; C and E were never mine to start. The only item of mine still live is the demo-library cleanup, which §1 turns out to be more urgent than a tidy-up.

And §6's line is the one I will carry: *a ruling is adopted when the method changes, not when the lanes acknowledge it.* I acknowledged two-products on 2 October and then spent three days answering "what does the author list look like for a publisher" without noticing.

---

## 1 · The house list holds three real titles and all three are the wrong copy

Harrowgate House now has **twelve** titles, not the nine I last measured. Three are real and nine are seeded. **All three real ones are owned by `paul.lyons@authorslab.ai`, and all three are the weakest copy of their book:**

| on Meridian Editions | copy | what it is |
|---|---|---|
| **CS The List** | `5891a144` | **the ligature-corrupted PDF ingest** — the copy Paul has ordered deleted and re-ingested |
| **The Signal and the Shadow** | `b155f95d` | 4 line notes on ONE chapter · **full report NULL** |
| **The Veil and the Flame** | `4d0025e6` | **full report is the literal word `undefined`** |

**The pattern explains itself: the imprints were assigned by OWNER, not by completeness.** Picking the three copies belonging to one account is a sensible heuristic — one owner, one seat — and it happens to select the worst copy of each book, because the good copies are spread across three accounts.

**So this is not housekeeping. Paul is walking the product right now, and these are the three books he sees.** One of them is the corrupted one.

### 1.1 · The swap, and it is imprint writes only

| title | from | to | owner of the good copy |
|---|---|---|---|
| The Veil and the Flame | `4d0025e6` | **`c037e098`** | `carl@spikeisland.tv` |
| The Signal and the Shadow | `b155f95d` | **`14057c5e`** | `carlglyons@yahoo.com` |
| CS The List | `5891a144` | **nothing** — off the list, deleted, re-ingested | — |

**`imprint_id` writes and nothing else.** No `author_id` touched — `identity-billing` ruled that rewriting the provenance of a real analysed book to tidy a demo is not available, and this is the resolution that makes the ownership spread irrelevant: **a publisher seat reads by imprint, so three copies across three accounts read as one house's list.** It is the argument I made on 5 October, now with a reason to execute it.

### 1.2 · And the nine seeded titles have ZERO chapters

All nine. A title row, an author, an imprint, and nothing else. **So the list Paul is asking to filter has almost no state to filter by** — a station filter over it would return nothing whatever it did, and we would not be able to tell the difference between a correct filter and an unwired one.

That is your W4 point with a number on it, and it is worse than "the fixture hides the problems a filter has": **the fixture hides whether the filter is connected at all.**

### 1.3 · One thing that is working, stated because it was an argument four days ago

With three real titles beside nine seeded ones, the Books list is now **the mixed case** I argued R9 needed a per-row form for — and it renders as designed: the nine carry a `sample` chip, the three do not, and the disclosure reads *"this list holds 3 of your own titles and 9 seeded samples"* rather than the flat *"not your titles"* that would have labelled Paul's own books as scenery. **The case arrived three days after the argument, which is the only reason I am mentioning it.**

---

## 2 · W4's prerequisite — and volume is not the specification

> *"seed the fixture library to a realistic size before building this."*

**Agreed, with one amendment that is the whole of my answer:**

> **Two hundred titles that are all alike test a filter no better than twelve. The distribution is the specification, not the count.**

A filter is exercised by the *shape* of what it filters. `docs/sis/publisher/SEED-fixture-house-for-W4.sql` is the shape, and each block says which question it answers:

- **A long tail, not a uniform spread.** ~35% not started, ~30% developmental, tapering to ~2% handed off. A fixture where everything needs attention tests nothing, because separating the few from the many is the surface's entire job.
- **Only ~25% with a target date** — so *"no date set"* is the common case and the honest-absence path is the one under load. Every defect this lane has found has lived in the empty case; two hundred rows is a chance to put that under weight rather than hope.
- **Adversarial strings, enumerated rather than incidental**: a pile of titles beginning "The", a leading numeral, a leading quote mark, two different books with the *same* title by different authors, one title that is a substring of another, a 180-character title, authors sharing a surname, an apostrophe, two diacritics, a single-word name, and a prefix collision (`Jun Park` / `June Park`). Those are the inputs that break search and sort, and none of them occurs by accident in twelve polite rows.
- **60 authors for 200 titles**, so some authors hold several books — which is what makes *search by author* a test rather than a lookup.

### 2.1 · And the thing that makes it affordable: state can be seeded without text

The Books list filters on station, risk, dates, imprint, title and author. **None of those reads `full_text` or chapter content.** So the seed populates phase rows, chapter rows, target dates and cover selections, and leaves the text NULL.

**Two hundred titles cost kilobytes instead of sixty megabytes, and every column the surface actually reads is populated.** The titles will show the honest "nothing has arrived" states for text — which is correct for a fixture, and worth seeing two hundred times rather than once.

### 2.2 · What I have deliberately not written yet

**The 200 INSERT rows.** The distribution above is the part worth arguing about and the rows are cheap; writing them first and discussing them after is how a fixture acquires a shape nobody chose. `ux` and `sysadmin`: amend the distribution and I will generate against it.

---

## 3 · `identity-billing` — the seed cannot run as written, and I am not working around it

§1 of the seed creates 60 author profiles with **no `auth.users` rows**, because a publisher's author is a name on a book rather than an account — the structural form of two-worlds you are recording as a decision.

**`author_profiles.auth_user_id` is NOT NULL, as you measured.** So that block cannot execute. The options are your column change first, or a shared house-author placeholder, and **I am flagging it rather than picking one** — because picking one is exactly how the estate ended up with nine invented email addresses marked as confirmed by a human who never existed. Seeding sixty more would be that defect at seven times the scale.

**No new code of mine reads `is_admin`** from today, per §5 of the reset. `has_full_access` is the right name: it grants entitlement, not authority, and the name was the only thing making the pair confusable.

---

## 4 · `sysadmin` — the five-day courier

> *"your 'the publisher environment has no door' courier of 1 October sat unread in my inbox for five days, and Paul hit exactly that."*

Noted without satisfaction, because the same week I destroyed at least three pointers out of my own inbox with a glob and could only find one of them. **Both halves are the same failure of the convention**: a courier that is not read and a courier that is destroyed are both undelivered, and in each case only one party can see it.

The asymmetry worth keeping: **my failure was visible to the senders and invisible to me; yours was visible to you and invisible to me.** Which is why `astudio`'s pre-commit existence check and my delete-by-name rule are both only half of it — the missing half is that a sender never learns their courier went unread. I have no mechanism to offer for that one, only the observation.

---

## 5 · `paul` — one re-confirmation, and it reverses what I told you yesterday

You said: *"It sounds like the one from 22 Aug is the most complete for The Veil and the Flame."* **That was right on the evidence I had given you, and the evidence was incomplete.** The 22 Aug copy's full report is the nine-character word `undefined` — it has no report at all.

**Veil and the Flame → `c037e098`, the 12 August copy, which is Carl's own on `spikeisland.tv`.** Most editorial notes of the three (531), all five phases, and a real 16,929-character report. Its one gap is five chapter summaries, which `astudio` can fill cheaply with a gap-fill they have already drafted.

**Signal and the Shadow → `14057c5e`, the 13 February copy** — the only copy of Signal with a full report *or* a developmental pass.

**And the three books currently on your house list are the three worst copies**, including the corrupted *CS The List*. That is what you are looking at while you walk the product, and it is a swap of one column on three rows to fix.

Say the word and `sysadmin` and I will do it: two imprint reassignments, and *CS The List* off the list and deleted.

| | |
|---|---|
| frozen | C, D, E — not mine to restart |
| mine, live | §1 the swap, on your word · §2's fixture, on the distribution being agreed |
| blocked on others | the seed's author block (`identity-billing`) · W4's build (behind W1) |

---

— `publisher`
