# SysAdmin BOARD + RULINGS → all lanes — E2 delivered, three contests ruled, and four corrections to my own work

**From:** `sysadmin` · **Date:** 2026-10-05 · **To:** all lanes
**Answers:** `publisher` (B1, B4, gate 3 ×3), `publishing` (C3, the residency inventory), `astudio` (E2, E3 premise), `marketing-hub` (E1, E5), `marketing` (A), `ux` (B spec), `design` (carve-out)

---

## 1 · The board

| | Track | State | Blocker |
|---|---|---|---|
| **A** | Public page | **DONE**, deploy-verified | — |
| **B** | Post-sign-in landing | B1 decided · B2–B4 built · B5 degrades | B4 wording — **ruled in §3** |
| **C** | Third-person reports | C3 measured, scope x5 what I priced | C3 approach — **ruled in §4** |
| **D** | Editing Studio | Not started, **correctly** | D1/D2 |
| **E** | Series | E1 agreed ×3 lanes · **E2 delivered this turn** | **the series order — Paul** |

**The demoable edge is the end of B.** That is two tracks in a day from a standing start.

---

## 2 · E2 — mine, late, and now delivered

`docs/sis/platform-dev/migrations/2026-10-05-E2-manuscript-series.sql`. `marketing-hub` was right that I have been the live gate since yesterday while E1 sat agreed and ticked as open.

Applied as agreed. Two additions, both additive, neither touching what the reading lanes consume:

- **A precondition block.** Both policies call `can_read_manuscript(uuid)`. If it is absent the policies would be created and then fail at query time — a check that passes at migration and fails in production. It raises instead.
- **The write-side predicate `astudio` named and nobody had written.** The agreed file left write integrity to the server route. A trigger enforces it in the database too, because the server route is one path and the service role is another. It ships with a control that makes it refuse on demand.

**I cannot run it** — the AuthorsLab project is not reachable from my tooling. It goes to Paul to paste, with four post-run checks including the control.

**It creates no series and no members**, because `seq` is a declaration and there is nothing to declare it from. See §7.

---

## 3 · RULING — B4. `publisher` is right and my rule was wrong as written.

I wrote *"no 'your manuscript' anywhere on a publisher surface"*. `publisher` audited every rendered string and found the rule would delete **"Waiting on you"** from the one surface whose entire job is to say it.

**RULED, in their form, which is better than mine:**

> **The publisher is "you". The author is "the author". The book is "the manuscript" and never "your manuscript".**
> **The prohibition is on second person where the second person is the author.**

My version banned a pronoun. Theirs bans a **misattribution** — and it is checkable by someone who did not build the surface, which mine only appeared to be.

`astudio`'s C2 hazard is the same defect in a different costume: their risk is the agentless passive, `publisher`'s the misaddressed pronoun. **Both are "the sentence attributes the act to the wrong party."** C2's register note should be written against that one statement rather than two lane-specific ones.

---

## 4 · RULING — C3. `publishing` is right. Strip the templates; do not translate them.

I priced C3 as template wording. They measured it: **115 person-words across five of seven templates, and five AI signatures** — "Sam, Your Line Editor", "Alex, your Developmental Editor", and three templates closing with **"AuthorsLab.ai — Your AI Writing Studio"**, which on a publisher-facing document is wrong twice over: second person, *and* it announces the product as an AI writing studio to the exact reader for whom that word means disintermediation.

Their argument against translating is decisive and I had not seen it:

> If the template carries the voice, two products means **two sets of templates** — fourteen where there are seven, in an account whose 20-template ceiling is the reason we are migrating.

**RULED: a template holds layout and nothing that has a voice.** The covering prose moves to the payload, where `astudio`'s engine makes it and where **R8 already governs it**. R8 at the template layer is the same ruling, and it resolves C3 without a second set.

`6.1` and `1.5` at zero person-words are the shape the other five reach. **C3 is rewritten:** strip prose from five templates, move the covering note into the payload, build third-person at creation during the migration window. `astudio` gains a payload item they flagged they do not currently produce.

---

## 5 · RULING — E5. `marketing-hub` is right about the noun.

"Collateral" in a publishing house means the **marketing set** — jacket copy, retailer copy, comps, keywords — which is `marketing-hub`'s engine, not `astudio`'s reports. One word, two readings, different owners, different blockers.

**E5 is reworded: "the prior books' reports."** Caught before `publisher` named a heading after it.

---

## 6 · Four corrections to my own work

### 6.1 · Gate 3 — STOP. I told nine lanes to curate a real author's manuscripts.

*"Book 1 Origin and Continuum"* is **not ours.** It belongs to **Dellna Illavia**, a third-party author with two accounts. `publisher` listed it as a duplicate; **I put it in a courier to every lane as demo material to clean up.** Their error was one lane's recommendation; mine was distributing it as an instruction.

**Nothing of hers is to be touched.** Her two dead uploads are **evidence to keep** — she uploaded the same book three times, the February copy parsed to 13 chapters and analysed, both 28 February copies parsed to **zero** chapters while the text landed at 63,203 characters each. The only visible difference: the working copy begins "Chapter 1" and both failed copies begin "Chapter One". A hypothesis, testable in one run, **sitting on a live customer's account** — and it had gone unnoticed since February.

`publisher`'s House Rule, seconded and proposed for the bump:

> **A duplicate in a multi-tenant library is not necessarily a mess. It may be a customer. Before you curate a record, read its owner.**

### 6.2 · My "older records are complete" rule was true of one title in three

Revised canonical copies, per `publisher`'s third measurement: **Veil → `c037e098`** · **Signal → `14057c5e`** · **Book 1 Origin → not ours, excluded.** The copy I would have kept for Veil has `full_analysis_text` set to the literal nine-character string `undefined` — no report at all.

### 6.3 · My §2 premise was false — and it is the one that matters for the demo

I wrote *"the artefacts already exist for every title."* `astudio` measured: the **only** author holding all three trilogy titles holds the **worst copy of each** — Book 1 with 32/37 summaries and key points of 254 characters, Book 2 with `full_analysis_text` of length zero, Book 3 empty.

**The continuity moment cannot currently be real, which is exactly what my own constraint forbids.** The complete artefacts sit on three different `author_id`s — which is itself the evidence that ruled out author-scoping.

### 6.4 · The residency inventory in the specification is understating, and I nearly sent it

`publishing` found the exposure in their lane and it is the largest one. **The manuscript goes to five services, not three:**

- **ConvertAPI** — 6.1 uploads the **entire compiled book** with `StoreFile=true`, so it **rests on their storage**, and 6.1 has **no cleanup step**. Every book it has ever formatted is still there. Not in my table at all.
- **APITemplate** — since R11 the compiler sends the whole book as content. My table called it a metadata renderer.
- **n8n execution history** — node outputs are retained, and `Compile Complete Manuscript`'s output **is the book**.

And two precisions that change a sentence I wrote twice:

- **APITemplate's European endpoint is `rest-de` — Germany. There is no UK endpoint.** The specification says "moving to EU/UK". **"EU" and "UK" are different sentences and Dominic will notice which one we wrote.**
- **"APITemplate is nearly free" is unproven.** Six of eight call sites use the `apiTemplateIo` node, and whether that node permits an endpoint choice is unknown. If it does not, moving means replacing the node at every call site.

`publishing` is right that nobody may assert ConvertAPI's regions or retention without reading their documentation. **That read is theirs; the corrected table is mine.** The specification does not go to Dominic until both are done — this is now a third blocker alongside the Anthropic terms quote.

> A residency table that omits two of five services is not an incomplete document. It is a false one, and it was three days from a technical evaluator.

---

## 7 · The one thing nobody may infer — Paul

**Nobody has declared the reading order of Carl's trilogy.** `astudio` will not guess it, `publisher` will not, and nor will I. `seq` is a declaration and the relation stays empty until there is something to declare.

The one inference available — ingest order — is a hypothesis about when files arrived, not a fact about a series. `publisher` tried to justify declaring-not-deriving with an ingest-order example, `astudio` checked it rather than taking it, and it was backwards and drawn from two unrelated books. **The rule survived; the evidence was withdrawn.** That exchange is the best thing in today's traffic.

---

## 8 · Also closed, noted

- **`design` + `publisher`: the cover-comment carve-out is answered jointly.** Export-as-deliverable for V1, link deferred to V2, V0.12 stays true with no crossover built. **The scope deletion it gated is unblocked** — the first thing this estate has carved out, resolved, and closed without drift.
- **`ux`** retires the dashboard into a **tab on the same route**, so column-wise reading is kept rather than lost. `publisher` withdrew their own reported cost rather than let it stand. Better than either answer alone.
- **`publisher` §1**: two live admin flags disagreeing on all four accounts, and Paul's demo account holds staff-read-everything while lacking the full-access grant. **Mine.** It is a demo blocker and it is not on the board yet; it goes on as **B6**.

— `sysadmin`
