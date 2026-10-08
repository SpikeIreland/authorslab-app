# publisher → ux, sysadmin, paul
## The Books list becomes a visual surface; People and House Style return
2026-10-08

---

## §1 Paul's two asks

> "It feels too thin also and I think I want to start bringing back the other tabs."
>
> "While I like 'clean' pages, I like the idea of visual displays of progress and reporting. The publishing industry are embedded with creative people and pages that look 'flat' and 'content-only' rendered doesn't seem fitting."

Both done. He chose all four visual elements and the narrower of three options on the tabs.

---

## §2 First, the measurement — because "thin" had two possible causes

Queried the house list before designing anything:

| Title | Phase | Chapters | Stations complete | Reports | Cover concepts |
|---|---|---|---|---|---|
| The Veil and the Flame | 5 | 37 | 3 | 3 | **4** |
| The Signal and the Shadow | 2 | 69 | 1 (+1 running) | 2 | 0 |

**The list was not thin for want of data.** 106 chapters, 4 of 14 station cells complete, 5 reports, 4 cover concepts — and the page rendered all of it as text and 8px status pips. That distinction mattered: had the cause been an empty estate, visual flourish would have made it look emptier, not fuller.

### §2.1 One stale note of mine, corrected

`TitleRow` carried: *"MEASURED 2026-10-02: 0 of the 9 titles on any publisher list have a cover asset or a selection, so this ships as nine empty slots."* **Veil now has four concepts.** The note is re-measured in place rather than left to read as current, and the cover slot has gone from `sm` to `md` — a book list that leads with text while holding artwork is making Paul's point on purpose.

---

## §3 What shipped — the four elements

**`HouseBand`** — a stat-tile row: titles, chapters in the line, stations complete, passes running, reports ready, cover concepts. Not a chart: six scalars with no shared axis and no time dimension are a figure band, and a tile with no plot needs no hover layer. **No new colour** — the tiles wear text tokens only, because the status hues in this product are reserved for conditions and a figure is not a condition.

**`ChapterDensity`** — one 3px mark per chapter, so a 69-chapter book looks like one. **It claims how many, not which**: the route gives counts, not per-chapter state, so there is deliberately no per-mark tooltip naming a chapter. Identity is never colour-alone — it ships with a visible numeric caption and an `aria-label` carrying the same counts in words. Above 140 chapters it degrades to the sentence, because beyond that the marks are noise.

**`PassProgress`** — one meter for the pass that is running. Thin mark, recessive track, no axis.

**`StationTally`** — "3 of 5 stations complete", as a figure rather than a second meter. The row already carries `ux`'s station strip, which shows *which* stations and in *what* state; a bar over the same facts would be two encodings of one thing, and when they disagreed because one rounded, no reader could tell which was right.

### §3.1 Every one renders NOTHING rather than a zero

`passProgress` is null when no pass runs **and** when the chapter columns are empty on the row that is running. The second case is the one that matters: empty columns are not "zero chapters through", and a meter at 0% is a precise-looking claim built on an absent value. A density strip with no denominator does not render either.

**HOUSE RULE: an empty bar is a fallback wearing a nicer coat.** The affordance rule has a visual form and this is it.

---

## §4 The payload, and the proofs

`LobbyTitle` gains four facts, each a **column that already exists**: `totalChapters`, `passProgress`, `reportCount`, `coverConceptCount`. The cover count is taken from the existence rows the route already fetched — still no `storage_path` and still no signing, because counting what exists is not showing it.

`deriveHouseBand()` is **pure, in `_derive.ts`**, because the failure mode of an aggregate is silent: a defaulted denominator is still a number on a page and no reader can tell.

**`scripts/verify-lobby-derive.ts`: 54/54 passing, 26 negative controls** (was 38/38 with 19). Seven of the new ones assert the measured house; eight are controls on the nulls:

- an empty list returns `chapters: null`, not `0` — a house we know nothing about is not a house with no chapters
- no title carrying a chapter count returns null
- a `total_chapters` of `0` is not a chapter count
- a partial total reports **how many titles it came from**, so the band can say "across 1 of 2"
- an in-progress station is not counted complete

**And the controls were proven able to fail.** Collapsing the not-knowable null to `0` — the exact defect — broke two of them. Reverted; green.

### §4.1 One implementation, two callers

The served band describes the whole list. When an imprint filter is on, the page **recomputes from the same pure function** rather than showing a stale organisation-wide total under a filtered list. A second sum written in the page would have been a second vocabulary for one fact, and the two would eventually disagree about the same house.

---

## §5 The tabs — `ux`, `sysadmin`, this is your §4 and I have amended it

`PublisherShell.tsx` is yours and I have edited it. **People and House Style are back in `PANEL`. Chat is not.**

The reasoning is §4's own. Your note read: *"twelve unfinished rooms presenting as a broken platform instead of one finished small one."* That premise is sound and unchanged — **but `/publisher/people` and `/publisher/company` are finished, live surfaces.** §4 objected to unfinished rooms, not to finished ones, so restoring two working doors honours its reason rather than reversing it. Chat does not exist, so it stays out; that is the affordance rule, and it is the one item §4 and the affordance rule agree on.

Paul chose this over "restore all three" and over holding it for the sysadmin conversation. **If either of you reads §4 as covering finished surfaces too, say so and I will put it back** — but say it to Paul, because it is his amendment, not mine.

---

## §6 Still outstanding, and still not this

`sysadmin`'s demo item 5 — Signal's Overview carrying Veil's collateral because they are a series — remains the last demo build item and remains mine. Paul is sequencing the surfaces first on purpose. Recording it so no one reads this commit as demo progress.

Also noted and not acted on: Paul is talking to `sysadmin` about **a new domain** to deepen the separation. Everything in this commit sits in the self-contained publisher folders, so it travels.
