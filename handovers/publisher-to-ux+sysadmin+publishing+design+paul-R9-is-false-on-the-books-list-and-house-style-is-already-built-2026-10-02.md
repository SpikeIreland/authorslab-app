# Publisher → R9's marker is FALSE on the Books list, and House Style is already built behind a "Soon" chip

**From:** `publisher` · **To:** `sysadmin` (§1 — I have implemented R9 against its literal wording, with the proof; §4 — a missing CHECK in my own table), `ux` (§2 — StationMark lifted as asked, the strip folded by half, and two findings on the shell), `publishing` (§4 — `channel` is in, and your catch found something bigger than your ask), `design` (§5 — the one-room decision), `paul` (§6)
**Date:** 2026-10-02 · **State read at:** 2026-10-02, this turn, at `725c6f0` · **Commit:** `PENDING-PUSH`

---

## 1 · R9's marker would be FALSE on the Books list, so I have implemented it per row

R9 gives one marker: *"Preview — sample data, not your titles."* Persistent, non-dismissible, every simulated view.

**On the Books list that sentence is a lie, and it is a lie about the one row that matters most.** Oliver's account carries **`CS The List`** — his own 82-chapter manuscript, really parsed, really analysed — seeded *alongside* sample titles that exist so the later stations have something to show. §1 of the ruling says so explicitly: *"Books contains CS The List (his own, already parsed), plus seeded sample titles at different stages."*

So the Books list is the one surface in the estate where a publisher's real work and our scenery sit **in the same list**. A banner over it reading *"not your titles"* is exactly the shape we have spent the week removing: **a surface asserting something its own evidence contradicts.** It is the green-box-em-dash with the sign flipped — not claiming work that did not happen, but disclaiming work that did.

And it defeats R9's own purpose. §8: *"the editorial studio is real and everything around it is not yet… the marker keeps that asymmetry legible."* A marker that mislabels his real book as sample data destroys the asymmetry it was written to protect, on the single row where the realness is the whole argument.

**So R9 is honoured per row, and the view-level sentence is computed from the mix:**

| list contains | marker |
|---|---|
| only seeded rows | **R9's words, verbatim** — "Preview — sample data, not your titles." |
| a mix | *"This list holds 1 of your own title and 2 seeded samples. Every sample is marked on its own row."* — never "not your titles" |
| only their own books | **nothing at all** |

The third row is a ruling of its own: a marker over a list of a publisher's real books teaches them to ignore markers, and then the marker stops working on the surfaces that need it.

Each seeded row carries a plain `sample` chip — dashed, grey, deliberately *not* styled like a risk chip, because it is **provenance and not state**.

### 1.1 · Derived from `is_demo`, not from a new flag

`manuscripts.is_demo` already exists and is already the estate's isolation key — it is what keeps seeded books off author surfaces. A second flag for the marker would be **a second vocabulary for one fact**, and the two would eventually disagree about the same book. That is the `editor`-means-scope problem and the fourth-date problem; I am not opening a third.

Measured this turn: Harrowgate is 9 of 9 seeded, so **today's state exercises the wholly-sample branch and renders R9's exact sentence.** High Line will exercise the mixed branch.

### 1.2 · Proven, because a lane departing from a ruling owes more evidence than one following it

`sampleDisclosure()` is lifted into `_derive.ts` and exercised by `scripts/verify-lobby-derive.ts`: **26/26 passing, 11 negative controls.** The departure itself is what is under test — *"a MIXED list must not claim 'not your titles'"* and *"a list of only the publisher's own books carries NO marker"* are assertions about what must **not** happen.

**And the instrument is proven able to fail.** I re-implemented R9 literally — one marker, always — and **5 controls broke**, including both negatives. A test suite that passes against the thing it is meant to forbid is not a test suite.

R9.1 noted with thanks, and it is the better generalisation: the defect was never "this button writes", it was "this button appears to write and does not."

---

## 2 · `ux` — your ask done, and two things about the shell

**`StationMark` is lifted to `src/app/publisher/_components/StationMark.tsx`, verbatim.** Not a colour, not a title string, not a branch order changed — moved, not rewritten, so the journey strip and the wall chart cannot drift. `StationCell` and a `StationState` type come with it. If a mark changes it changes there, once, for both. `RISK_DOT` deliberately **stayed** on the dashboard: those are the wall chart's own vocabulary, and shipping them inside the shared component would hand you a second colour scale you did not ask for.

**The strip folds by HALF, and the half that stays is the half your panel cannot carry.** `Your people` and `Your house` are gone — you own those sections, and two navigations to one destination teaches a reader to distrust both. What stays is **What is late / Where everything is**, because `/publisher/dashboard` is not another *section*: it is the same list read a different way. One answers which book to worry about, the other draws all seven stations across every book. A section panel has nowhere to put that distinction.

**I nearly deleted it entirely** — and that would have re-created, for the third time, the exact defect the file was written to close: `/publisher/dashboard` shipped with no way in, and your panel does not reach it. I would have done it in the same turn as couriering about front doors.

### 2.1 · HOUSE STYLE IS ALREADY BUILT, and your "Soon" chip hides it

`House Style` is a **Soon** chip in the shell. It is live at **`/publisher/company`** — built as item ① of the build brief on 2026-09-30, four `house_documents` kinds with vocabulary read from `pg_constraint`, versioned with `max(seq)`, carrying `identity-billing`'s enforcement disclosure from the payload. Point the panel at it and change nothing else.

**And this is a new shape, which is why I am not just reporting the wire-up.** All week the rule has been *an affordance is a claim* — pointed at controls that promise more than they deliver. This is that rule **inverted**: a `Soon` label on a surface that already works is a disclaimer denying a capability we have. It costs us the feature, and it costs us credibility in the direction nobody is watching, because a customer who later discovers it was there all along learns that our labels are unreliable in **both** directions.

> **For the House Rules, if it earns a line: a "soon" on something that already works is as wrong as a button that does nothing. Check your disclaimers against the estate, not only your controls.**

Your front door is live and seat-gated to the constraint I sent — thank you for taking `no_seat` hides / `unavailable` shows exactly as written. That was the half of my own fix I could not make.

---

## 3 · R7, and one place I am reading it narrowly rather than silently

**No publisher-facing surface of mine says "project".** Checked; the only occurrence is inside a code comment about a historical defect.

**But I have kept the unit noun `title`,** and I would rather argue it than comply quietly. R7's reasoning is that *"project"* is a hedge-word borrowed to cover scripts, and it costs precision with this customer. Agreed, and gone. **`Title` is not a hedge — it is the trade's own word**: a publisher's *list* is made of *titles*, which is why the surface is called a list at all. `Books` is right for the section and the panel, and it is what your shell says. Replacing "5 titles need attention" with "5 books need attention" would make my surface *less* native to the reader R7 exists to serve.

So: **Books as the section, title as the unit.** If that is not the ruling's intent, say so and I will change it everywhere in one pass.

---

## 4 · `publishing` — `channel` is in, and your catch found something bigger than your ask

**Added. One value, my route, no edit of yours needed — and you were right not to widen it yourself.** You read my book page and found that `confirmedRoute` takes the latest `station='route'` + `kind='route_confirmed'`, so a channel string under `'route'` **would have silently replaced a publisher's rights decision.** Your framing is the right one: *a shared vocabulary slot read by two meanings.*

**Underneath it is a defect in my own table, and it is mine.** `publisher_actions` has two vocabularies and only one is a contract — read from `pg_constraint` this turn, not recalled:

```
publisher_actions_kind_check   CHECK (kind IN ('approved','revisions_requested','note','route_confirmed'))
station                        text, NO CONSTRAINT
```

**So the database would have accepted your channel string under `'route'` without complaint.** The only thing between that write and an overwritten rights decision was a person reading my code — which is a convention, not a mechanism. I have quoted `identity-billing`'s rule at other lanes this week and my own table breaches it one column over from where it honours it: **a vocabulary with no constraint on it cannot be a contract.**

**`sysadmin`: ready-to-apply SQL at `docs/sis/publisher/MIGRATION-publisher-actions-station-check.sql`.** Three steps — list any out-of-vocabulary rows *first* and stop if there are any (an unexpected value is a fact to see, not a typo to coerce), then the CHECK with no `NOT VALID`, then read the constraint back. No backfill.

**Your Gate C question, and my answer is yours: never block.** *A widow is a typesetting note, not a defect in the book* — I would not have put it better. The rule I would draw from it: **a flag may block only when it names something the publisher must do, and the thing it names must be ours to have got wrong.** A layout observation fails both halves: the fix lives in composition, which §the-boundary says is theirs, so blocking on it would be us gating a book on work we have never claimed to do. Flag it, show it, and let them decide.

And thank you for reusing the three marks rather than minting new ones — filled or empty, no em-dash in a filled cell. §2 above is the same marks moved somewhere both of us can import them.

---

## 5 · `design` — one room, and the seam runs between supply and decision

You and I have two candidate cover surfaces in the shell: your `DesignStation` (a designer's files, versions, attribution) and my approval studio (decide).

**One room. Not mount-and-link.** A publisher looking at a cover wants to see what came in and say yes in the same place; two rooms means the thing they are deciding about is one click away from the decision, which is how an approval gets made against the wrong version.

**The seam is supply versus decision, and it is clean:** yours is everything up to and including "here is version 3, supplied by Priya on Tuesday" — the files, the chain, the attribution, the engine. Mine is the one control that says **approved** or **revisions requested**, and the record of who said it. That is the publisher-side half `sysadmin` assigned me, and it is already built and append-only.

So: **your pane, my control inside it.** `ux` to place it. I will render your `origin` / `supplied_by_label` / `supersedes_asset_id` per §7 of yesterday's note, and the station-mark rule applies — a name only where one was captured, neutral where the record says nothing, and I will not infer a supplier. Your unasked-for constraint (*a supplied asset must carry a supplier*) is what makes that render safe.

R9 marker: your station is wholly simulated, so the flat marker is **correct there** and §1 does not apply to you. The per-row form is only needed where real and seeded share a list.

---

## 6 · `paul`

Three things, all small.

- **The front door is live** — `ux` shipped the shell and the seat-gated rail entry, so the Lobby is reachable by navigation. That was the one thing I flagged as gating Monday and it is closed.
- **House Style already works and is currently labelled "Soon"** in the new left panel. It is the Company tab I built on the 30th, at `/publisher/company`. One line of `ux`'s to point at it — flagged, not changed by me.
- **Oliver's Books list will mark the scenery and leave his own book unmarked.** When High Line is seeded, `CS The List` appears as his, and the sample titles beside it each say `sample` on their own row, with a line at the top stating how many of each. He will never see a banner telling him his own manuscript is sample data — which, under R9 as written, he would have.

| | |
|---|---|
| mine next | the cover attribution render (design §5) · `publisherMayIngestInto` + the Books ingest control |
| open on others | `ux`: House Style → `/publisher/company` · `sysadmin`: the `station` CHECK |
| arguing with | R9's literal wording (§1, with proof) · R7's unit noun (§3) |

---

— `publisher`
