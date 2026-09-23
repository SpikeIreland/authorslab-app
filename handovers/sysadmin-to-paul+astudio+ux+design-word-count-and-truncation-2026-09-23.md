# SysAdmin → Paul + AStudio + UX + Design — Word-count root cause fixed; #98 truncation diagnosed and drafted

**From:** `sysadmin` · **To:** `paul` (two publishes owed) · **cc:** `astudio`, `ux`, `design` · **Date:** 2026-09-23
**Consumes:** `ux-to-sysadmin+astudio-ux-review-fixes-and-findings-2026-09-23.md` finding 1 · task #98
**Status:** data fixed and verified; two n8n changes DRAFTED, awaiting Paul's publish per the n8n deployment lane.

---

## 1 · Word counts — root cause was omission, not a bad value

UX reported "the ingest path writes `word_count = 0`". Close, but the mechanism matters. In `1.4 Parse Chapters` → **Store Chapter Data**:

```sql
INSERT INTO chapters (manuscript_id, chapter_number, title, content, created_at)
```

`word_count` **is not in the column list at all.** It was never written; every parsed chapter fell to the column default. That is why only editor-touched chapters ever had counts — the editor save path writes it, ingest never did. Not a wrong value being computed, a field being skipped.

**Fixed (DRAFT, needs publish):** `word_count` added to the column list, computed as
`COALESCE(array_length(regexp_split_to_array(trim(value->>'content'), '\s+'), 1), 0)`
— the same method used for the backfill below, so ingest and backfill agree by construction rather than by coincidence. The returning SELECT now surfaces `word_count` too, so the next person testing this can see it without a second query.

`manuscripts.current_word_count` deliberately left alone: it is set upstream by the pdfWordCount webhook and measures the whole document, whereas the chapter sum measures chapter bodies. They legitimately differ (Veil 47,291 vs 46,986) and answer different questions.

## 2 · Backfill — estate-wide, verified

UX had backfilled one book (`b155f95d`). The hole was wider, and Carl was worst hit:

| Book | Account | chapters at zero, before |
|---|---|---|
| **The Veil and the Flame** | carl@spikeisland.tv | **37 of 37** |
| The Veil and the Flame | carlglyons@yahoo.com | 37 of 37 |
| The Veil and the Flame | paul.lyons@authorslab.ai | 37 of 37 |
| The Signal and the Shadow | carl@spikeisland.tv | 60 of 69 |
| The Signal and the Shadow | carlglyons@yahoo.com | 60 of 69 |

Backfilled every affected chapter in the estate in one guarded statement (only rows with real content and a missing count). **Verified: zero remaining zeros anywhere.** Sums now track declared totals — Veil 46,986 vs 47,291; Signal 65,179 vs 63,318. The deltas are chapter bodies vs whole document and are correct.

---

## 3 · Task #98 — truncation. Diagnosed, and it was half-fixed and abandoned

Evidence from `lmo_ledger` (`stop_reason` is the countersign; round output_token numbers are the fingerprint):

**2026-08-12 — ceilings 2000 / 4000 / 8000.** Eleven of thirteen calls returned `stop_reason = 'max_tokens'`, `success = false`. Only the two naturally-short stations (`key_points` 57 tok, `summary` 69 tok) succeeded. Every analysis came back empty — this is the origin of the "Alex analyses returning empty" symptom, **and it is the run that produced the report currently on Carl's shelf.**

**2026-08-18 — ceilings already raised to 12000 by someone.** Most stations then completed naturally (`end_turn`, 7,365–11,240 output tokens). But `alex.full_analysis.pacing` hit `max_tokens` at **exactly 12,000**. So the ceiling was raised once, partially worked, and the remaining truncation was never chased.

**Fix (DRAFT, needs publish):** the five analysis Cells raised **12,000 → 24,000**. Reasoning: the largest *natural* completion in this workflow is 10,236 (structural); pacing demonstrably wanted more than 12,000. 24,000 is 2× the current ceiling and ~2.3× the largest natural completion.

**Why generous rather than incremental:** `max_tokens` is a ceiling, not a reservation — output is billed as generated, so unused headroom costs nothing. A truncation, by contrast, wastes an entire journey (~£2.50 at finance's measured rate) *and* ships an empty report. The asymmetry is stark, so erring high is correct. Final Synthesis left at 20,000 — already well above the 8,000 that truncated it in August, and untested rather than known-insufficient.

---

## 4 · Two residuals — flagged, not guessed

**4.1 · `alex.full_analysis.thematic` is a different bug.** On 2026-08-18 it returned `stop_reason = null`, `output_tokens = null`, `success = false`. That is not truncation — that is no response at all. Timeout, or an error the Cell swallowed. Raising max_tokens will not touch it. Diagnosing it blind would be guessing; it needs its own look.

**4.2 · Workflow 2.2 has the identical shape.** `alex.summary_points.plot` hit `max_tokens` at exactly 12,000 on the same date. Same one-line fix, different workflow — that belongs to task **#99** (Audit 2.2) rather than being swept in here silently.

**Also noticed, unrelated to #98:** six Postgres nodes in 2.3 carry a leading `=` on the `query` parameter, which does not support expressions (`Fetch Manuscript`, `Fetch Chapters`, `Fetch Author Email`, `Store Analysis in Database`, `Send PDF URL`, `Mark Report Complete`). All flagged `preExisting` by the validator — none introduced by this change. Note this is the *inverse* of task #59's MISSING_EXPRESSION_PREFIX sweep, so that sweep may have over-corrected in places. Worth a look; not urgent.

---

## 5 · On regenerating Carl's report — the sequencing still holds

With #98 drafted, the blocker moves but does not vanish. Recommended order stands:

1. **Paul publishes** `1.4 Parse Chapters` and `2.3 Alex Full Manuscript Analysis`
2. A test run of 2.3 confirms all six stations return `end_turn` — **that is the tick for #98**, not the draft
3. `design` rebrands the APITemplate.io templates
4. *Then* regenerate once — right counts, right branding, no truncation

Regenerating before step 2 risks trading a report with a stale word count for an empty one. Regenerating before step 3 pays for the run twice.

**`design`:** the template rebrand is the long pole in that sequence. No pressure implied — flagging so you know a regeneration is queued behind it.

## 6 · What Paul owes

| # | Action |
|---|---|
| 1 | Publish `1.4 Parse Chapters` — stops every future upload inheriting the hole |
| 2 | Publish `2.3 Alex Full Manuscript Analysis` — the truncation fix |
| 3 | (After publish) one test run of 2.3, so the #98 tick can be observed and quoted |

#98 stays **in_progress** until that run is observed. A drafted fix is not a verified one.

— `sysadmin`
