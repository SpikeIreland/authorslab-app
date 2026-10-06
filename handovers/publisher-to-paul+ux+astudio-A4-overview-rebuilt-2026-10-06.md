# publisher → paul, ux, astudio
## A4 — the Overview is rebuilt; and the author's own shelf has a dead link
2026-10-06 · plan: `handovers/publisher-PLAN-publishers-platform-build-checklist-2026-10-06.md`

---

## §1 What shipped

`/publisher/[projectId]` was **1,252 lines** and is now **56**. Preserved in git at `7f46290`.

Paul's verdict, twice: *"too intrusive on an Author's work and it doesn't provide any real information from the publisher's perspective"*, and *"I want to go to an Overview page, but not the one that we currently have because it is terrible."*

Both were true, and the second explains the first. **The page had no model of what a publisher comes there to learn, so it showed what it could reach — which happened to be the author's working material.** A surface with no question to answer will answer with whatever it can read.

### The rebuild, from Paul naming the better page

The author Overview is four components. Three cross; the fourth is the defect.

| Author | Publisher | What changed |
|---|---|---|
| `BookObjectPanel` | `TitleObjectPanel` | The author becomes a FACT about the title, not the reader. Absent meta rows are omitted, not shown as a dash or a zero. |
| `ShelfDocuments` | `CollateralShelf` | **The collateral list — Paul's own reason the author page is better.** The coloured spine per document kind is kept verbatim; that was the point of the original. Heading only: "On your shelf" → `Collateral`. |
| `JourneyStepper` | `StationLadder` | Marks are `StationMark`, this lane's single implementation, so a title cannot read one way on the list and another on its own page. No per-step CTA: that is intent, and R5 holds a surface reports state. |
| `EditorGreetingCard` | `HouseStateCard` | **Replaced.** See §2. |

Backed by a new `/api/publisher/projects/[id]/overview`, gate-first.

Build: `✓ Compiled successfully`, TypeScript ran, **56/56 static pages**.

---

## §2 Why the greeting card could not be lifted — this is the answer to a question Paul has asked since September

`EditorGreetingCard` is a persona avatar, a greeting addressed to the author **by first name**, and a CTA into the writing step they should do next.

That is precisely the thing Paul has been naming for weeks: *"The chat currently speaks as if talking to the Author which doesn't work."* It is not a tone problem to be edited. It is a component whose entire job is to address the author in the second person about their own next action.

`HouseStateCard` answers the house's question instead. The author's card asks *what should I do next with my book*. The house asks *where is this title, and is there anything here for me to read*. Every line is derived from a column, and there is **no "needs your attention" verdict** — the evidenced risk model lives on the Books list and the wall chart, and a second verdict computed from a thinner read here would be a recommendation from a partial read, which is not a measurement.

---

## §3 Three refusals recorded, because each would have shipped a false claim

**1. No `original_upload_url`.** The author shelf carries "Your uploaded manuscript". The house's collateral is what the LINE PRODUCED — assessments, notes, the cover. An author's raw original file is their working material, not a deliverable. A publisher who needs to read the book reads it in the reading room, chapter by chapter, where the reading is recorded. **Reversible in one line if Paul rules the other way.**

**2. No defaulted editor names.** The author route pads empty phases with Alex/Sam/Jordan. Doing that in front of a house would name a person on a station nobody has worked. Absent is shown as absent.

**3. No cost or price field**, by construction — Paul's standing position. No column selected carries one.

And the full `StationCell` is passed to `StationMark`, not a partial one: dropping `completedBy` would make a station render the green `done` mark, which claims **the system** completed it. `completion_source` is read with the lobby's exact rule, and unknown stays the neutral `reached` mark rather than collapsing to a default.

---

## §4 THE FINDING — `astudio`, `ux`: the author's shelf has a dead link, and has had all along

Porting `ShelfDocuments` turned this up. `src/app/api/projects/[id]/overview/route.ts` line 258 builds, for every approved snapshot:

```
url: `/api/projects/${id}/versions/${v.id}`
```

and `ShelfDocuments` renders it as a clickable `<a href>` with a word count beside it.

**MEASURED: that route does not exist.** `find src/app/api -path "*version*" -name route.ts` returns exactly one file — `projects/[id]/design/versions/route.ts` — which is the cover composer's and takes no version id in its path. There is no catch-all under `projects`.

So **every "Developmental draft / Line-edited draft / Copy-edited draft" row on an author's Overview shelf 404s on click.** It looks like a document, it states how many words it has, and there is nothing behind it. An affordance is a claim.

I have not fixed it — it is not my lane and I am not going to guess what should serve a version. **The publisher shelf therefore does not carry drafts at all**, rather than writing the same URL under `/api/publisher/...` and shipping the identical defect on a page built to close that class of defect. The query stays in my route with the omission marked, so the rows come back the day a route serves them.

### §4.1 And this is the argument for keeping the author reference, in practice

Paul was weighing whether to start the publisher platform in chats that do not know the author product exists. **Porting the author's component found a bug in the author's product.** A clean-room build would have produced neither the collateral shelf Paul asked for nor this finding.

---

## §5 House rule earned

**A surface with no question to answer will answer with whatever it can read.**

That is the whole account of the old Overview. Nobody specified what a publisher comes to that page to learn, so it rendered everything reachable about the manuscript — and the complaint it earned was "intrusive", which is the symptom, not the cause.
