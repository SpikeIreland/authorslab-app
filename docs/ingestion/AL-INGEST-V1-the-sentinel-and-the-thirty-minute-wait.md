# AL-INGEST V1 — The Sentinel, and the thirty-minute wait

**Author:** `sysadmin` · **Date:** 2026-10-01 · **Status:** design, for argument before build
**Context:** publisher-first ruling (`sysadmin-RULING-to-all-lanes-publisher-first-...-2026-10-01.md`)
**Doctrine:** SIS Doctrine V1 §2.7 (Sentinel), §2.2 (a check must prove it can fail), §2.6 (NULL never placeholder), §2.10 (honesty is the interface)

---

## 1 · Why this document exists

Three content losses were found in one day, all during ingestion, all silent:

| | What was lost | How it looked on screen |
|---|---|---|
| Ligature decoding | 646 words corrupted across 66 of 80 chapters | Perfect. Legible prose. |
| Prologue suppression | an entire detected prologue, when the box was unticked | A book with no prologue. |
| Duplicate chapter numbers | 3 chapters, 1,594 words, never stored | Continuous sidebar numbering. |

None was detectable by looking. Each required a database query to find, and two were found only because someone went looking for something else.

**That is the case for the Sentinel, and it is not a new idea here** — SIS Doctrine V1 §5.6 says to stand the Sentinel skeleton up with the first pipeline. AuthorsLab never did for ingestion. Clarence did.

The ingestion pipeline has a property that makes this worse than usual: **it is the only part of the product where we destroy information.** Everywhere else a bug produces a wrong answer that a human can argue with. Here it produces an absence, and absence does not announce itself.

---

## 2 · The Sentinel

> **§2.7** — inspect at the seam the user sees; the report may only claim checks that executed; every check cites its ruling.

Three properties carried over from Clarence, all load-bearing:

1. **Independent re-derivation.** The Sentinel must not ask the parser what it did. It re-derives the expected shape from `manuscripts.full_text` and compares against what actually landed in `chapters`. A component's self-report is not evidence about itself. (Every one of today's three defects would have been caught by this and by nothing else.)
2. **A check must prove it can fail.** Every check ships with a positive control — a fixture that makes it fail on demand. A check never observed failing is not known to work.
3. **Silence is not a pass.** If a check did not execute, the report says *not run*. It never implies success by omission. NULL, never placeholder.

### 2.1 Gate A — Structural Sentinel (after chapter parsing, runs in seconds)

| ID | Check | Fails when | Cites |
|---|---|---|---|
| S1 | Encoding integrity | near-zero `fi`/`fl` with in-word digit damage | R4, 2026-10-01 |
| S2 | Heading census | headings counted in `full_text` ≠ rows in `chapters` | this doc |
| S3 | Word coverage | `sum(chapters.word_count)` short of `manuscripts.current_word_count` beyond a front-matter allowance | this doc |
| S4 | Numbering integrity | gaps or duplicates among the author's declared labels | this doc |
| S5 | Prologue / epilogue | detection and uploader flags disagree in either direction | 1.4 ruling, 2026-10-01 |
| S6 | Chapter plausibility | empty chapters, or outliers against this book's own distribution | this doc |
| S7 | Extraction yield | extracted characters implausible against source file size | R4 |

**S2, S3 and S4 together are exactly the queries that found today's missing chapters.** They are cheap — one scan of `full_text` plus one aggregate — and they run in seconds against a 30-minute pipeline. There is no performance argument against them.

Severity, deliberately only three levels:

- **BLOCK** — ingestion does not proceed to reading. S1 (corrupted encoding) is the only automatic BLOCK: analysing corrupted text wastes thirty minutes and produces a report nobody can trust.
- **FLAG** — ingestion proceeds; the anomaly is shown to the user and recorded against the title. S2/S3/S4 on a mis-numbered manuscript land here. A book with the author's own numbering error is still a book worth reading; the editor simply needs to know.
- **NOTE** — recorded, not surfaced.

The distinction that matters: **a FLAG is not a failure of the book, and the wording must not imply the author did something wrong.** "Chapters 19, 47 and 78 are labelled 20, 48 and 76 in your file. All 80 chapters are loaded; the numbering below follows their order in the manuscript." That is a true sentence that costs an editor five seconds and saves them a fortnight of confusion.

### 2.2 Gate B — Analysis Sentinel (after reading completes)

The reading passes have their own silent-loss failure modes, two of which are open in the backlog right now (#97 chapter-summary `pairedItem` loss, #98 `max_tokens` truncation):

| ID | Check | Fails when |
|---|---|---|
| A1 | Summary completeness | chapters without a summary after 2.1 claims success |
| A2 | Truncation | an analysis ends mid-sentence or at the token ceiling |
| A3 | Key points present | 2.2 terminal but `full_analysis_key_points` empty |
| A4 | Report artifact | journey complete but no `report_pdf_url` |
| A5 | Journey ↔ content agreement | terminal state asserts content that is not there |

**A5 is the general form of today's trigger bug**, and of R5: the record claims a thing; the Sentinel checks the thing exists.

### 2.3 Where it lives

A new n8n workflow, `0.9 Manuscript Sentinel`, called by 1.4 on completion (Gate A) and by the reading journey on completion (Gate B). Results to a new `manuscript_checks` table: one row per check per run — check id, verdict, measured values, ruling cited, run timestamp. Append-only.

One row per *check*, not per run, because the report must be able to say "S4 did not run" rather than leaving a reader to infer it passed.

---

## 3 · The thirty-minute wait

A 63,000-word manuscript takes ~7 minutes for chapter summaries, ~25 for key points, ~32 for the full read. **The user will not sit and watch.** Everything below follows from accepting that.

### 3.1 Notification must be written server-side

Today the client polls `as_journeys` and reacts. **Close the tab and nothing reacts** — the work completes, the journey row updates, and no notification is ever written, because the only thing that was going to write it was a browser that has gone.

**Ruling candidate:** the completion notification is written by the workflow that completes, not by the client that started it. The client may *render* a notification; it may never be the thing that *creates* one. This is the same principle as R5 — the server holds the truth, the client displays it.

Four layers, in order of who they serve:

| Layer | Serves | State |
|---|---|---|
| Live progress (Supabase Realtime) | tab open, watching | partially built |
| `notifications` row + bell | came back later | **built** (DP-AS-04) |
| Email | gone home | **built** (SMTP live, #114) |
| Web Push | the PWA Paul wants | not built |

Three of four exist. The missing piece is not infrastructure — it is **that n8n never writes the notification row.** That is a small change to the reading workflows and it closes the biggest hole.

### 3.2 On-screen stages

Replace the single "Generating…" spinner with the real sequence, driven from the journey record:

```
✓ Manuscript loaded            63,273 words · 79 chapters
✓ Structure checked            3 numbering anomalies — see note
◐ Alex is reading              started 00:31 · typically 25–35 min for a book this size
  Chapter summaries            ✓ done (7 min)
  Key points                   ◐ running
  Full manuscript read         ◐ running
○ Quality check                not started
○ Report
```

Four rules, each of which today's bugs would have violated:

1. **A stage is `running` because the record says so, not because we dispatched it** (R5). The trigger bug showed a failure while three workflows ran to completion.
2. **Estimates are drawn from our own execution history**, by word count — we have the data. "About 5 minutes" in the current copy is wrong by a factor of six, which is worse than saying nothing.
3. **Elapsed time is always shown.** A spinner with no clock is indistinguishable from a hang.
4. **The quality check is a visible stage.** Paul's instinct is right and it is also the honest thing: it tells the user we check, and it gives the FLAG somewhere to appear that is not an error.

### 3.3 The Sentinel as a sales argument

Worth stating plainly because it affects how it is built. The proposal tells High Line that a title is *"provably ready, or provably not — with a list of exactly what is missing"*. A visible structural check at ingestion is the **first** place that claim becomes demonstrable, and it is the cheapest place to demonstrate it. An editor who watches the system notice that their own manuscript mis-numbers three chapters has learned more about whether we can be trusted with a book than any amount of prose about our method.

That argues for the Sentinel being visible by default rather than tucked behind a diagnostics panel.

---

## 4 · Revised ingestion sequence

```
1  Choose file          .docx preferred · .pdf accepted
2  Extract text         browser (docx) · n8n 1.1 (pdf)
3  ENCODING GATE        S1 — refuse a corrupted PDF here, before anything is stored   [BLOCK]
4  Create manuscript    one path (R6)
5  Parse chapters       1.4 — nothing discarded; anomalies reported, not resolved
6  STRUCTURAL SENTINEL  Gate A — S2…S7                                          [BLOCK | FLAG]
7  Show the book        studio directly; no wizard, no bridge page (R2)
8  Reading              2.1 / 2.2 / 2.3 — staged progress, honest estimates
9  ANALYSIS SENTINEL    Gate B — A1…A5
10 Notify               server-written: row + bell, email, push
```

Step 3 already exists as of today. Step 5 is written and awaiting a permission grant. Steps 6, 9 and 10 are the build.

---

## 5 · What I am not deciding here

- **Does a FLAG block a pilot title?** For High Line specifically, an editor may want structural anomalies cleared before a book enters the line. That is `publisher`'s call, not mine.
- **Does the Sentinel report belong on the title page or the list view?** `ux` and `publisher`.
- **Does a BLOCK at step 3 count as a billable event?** It cannot — the proposal says "a pass that fails costs us and bills you nothing" — but `finance` should confirm the trigger point.
- **Chapter numbering semantics.** 1.4 now reseats a colliding chapter into the gap below and keeps the author's label in the title. That is a judgement about the author's intent, and `astudio` owns what the stations read.

---

## 6 · Open defects this would have caught

Stated so the design can be judged against real cases rather than hypotheticals:

- ligature corruption (found by eye, in a screenshot, by Paul) → **S1**
- prologue suppression (found while reading the parser) → **S5**
- 3 missing chapters / 1,594 words (found by a word-count aggregate) → **S2, S3, S4**
- #97 chapter summaries lost through the Cell → **A1**
- #98 `max_tokens` truncation → **A2**
- today's trigger bug → **A5**

Six for six. Three of them are open backlog items that a Sentinel would have surfaced on the day they appeared rather than weeks later.

— `sysadmin`
