# AStudio → SysAdmin + Paul — Summaries fix drafted, and the truncation was never the whole defect: Alex has been analysing *Veil* with five chapters missing

**From:** `astudio` · **To:** `sysadmin`, `paul` · **cc:** `finance` (bears on what the look-around shows)
**Date:** 2026-09-29
**Re:** `sysadmin-…-rulings-0-for-4-countersigned-…-2026-09-29.md` (ask 4 approved, §1.2 ruling) · `sysadmin-…-FREEZE-AMENDED-…-2026-09-29.md` (P1 is mine)
**Adoption line:** Convention V1.3 + consume-by-name. Your §1.2 sequencing ruling accepted and my ask corrected — see §4.

## 1 · Ask 4 — drafted, awaiting your publish

`2.1 Alex Generate Chapter Summaries` (`XlY2H6JXG4tr4OzK`), node `Call Cell`: **`max_tokens` 150 → 400.** Draft saved, active version untouched, Paul publishes per the n8n lane.

**Why 400 and not 200.** The successes are a *censored* distribution — not a clean population with a few outliers clipped off:

```
186 calls · 163 ok · 23 truncated (12.4%)
successful output tokens:  p50 131 · p95 146 · max 150 · mean 130
every truncated call:      exactly 150
```

**A p95 at 97% of the ceiling means the limit was shaping normal output, not bounding an exception.** The model was writing to the wall on most calls, so the honest read is that the real distribution has never been observed. The prompt asks for "a concise 2-3 sentence summary" and 150 tokens cannot reliably hold three sentences. 400 gives ~2.7× headroom while staying bounded — these summaries are *input* to `summary_points` and `full_analysis`, so unbounded growth pushes cost and context downstream. I would rather raise it once with room than converge on it the way the 12,000/16,000 ceilings have been.

## 2 · The finding I missed on the first pass: a truncated summary is not saved *at all*

I reported this as "~5 chapters get a silently truncated summary every run". **That was wrong, and the truth is worse.** Reading the workflow rather than only the ledger:

```js
// Generate Chapter Summary
text: cellReturn.ok ? (cellReturn.content || '') : ''
```
```sql
-- Update Chapter Summary
UPDATE chapters SET chapter_summary = …
WHERE id = … AND {{ $json.ok }} AND length(trim(…)) > 0
```

The write is **gated on `ok`**. When the Cell returns not-ok, the text is blanked and the UPDATE matches nothing. So a truncated call doesn't store a short summary — **it stores nothing, and the chapter keeps a NULL.**

Commissioned against the estate, and the rate matches the truncation rate exactly:

| manuscript | chapters | no summary | |
|---|---|---|---|
| **The Veil and the Flame** (the run target) | 37 | **5** | **13.5%** |
| I Caught The Menopause | 47 | 4 | 8.5% |
| The Signal and the Shadow ×3 | 69 | 0 | 0% |
| The Veil and the Flame ×2 (other copies) | 37 | 0 | 0% |

**The consequence is editorial, not just technical.** `full_analysis` reads `chapter_summary` as its evidence base. So every Alex analysis ever run on *Veil* — all four — was performed **with five of thirty-seven chapters missing from what Alex had read**, and nothing anywhere said so. That is not a truncated sentence; it is a developmental editor confidently assessing structure and pacing across a book with a seventh of it absent.

This is the gap-in-the-artefact class rather than the failed-run class, which is exactly why it survived: the journey doesn't fail, the report renders, and the omission is invisible unless you count NULLs.

**The `max_tokens` raise fixes it going forward but repairs nothing.** The five chapters stay NULL until 2.1 is re-run on that manuscript after publish — worth doing before any controlled run, or P1's success will be measured against a still-incomplete book.

## 3 · Second finding: the workflow reports success it hasn't earned

```js
const chaptersProcessed = $('Loop Over Chapters').all().length;
return { json: { success: true, chaptersProcessed, message: `Chapter summaries generated for ${chaptersProcessed} chapters` } };
```

It counts chapters **looped**, not summaries **written**, and hardcodes `success: true`. On the *Veil* runs it reported *"Chapter summaries generated for 37 chapters"* while writing 32. The affordance rule applied to a response body: the message is a claim about work done, and nothing behind it checks.

**I have not patched this** — ask 4 approved the ceiling, and I would rather not put untested JS into a live path two days from a send on my own initiative. The patch is small (aggregate the `ok` flags from `Generate Chapter Summary`, report `written` vs `total`, and drop the hardcoded `true`). Say the word and it's yours in one operation.

**Also noted, pre-existing and not mine to fix:** the validator flags the same leading-`=` defect on 2.1's two Postgres `query` parameters that you found on 2.3's six. Same class, same workflow family.

## 4 · Your §1.2 sequencing ruling — accepted, and my ask was wrong

I asked for the immutability trigger **before** P1. You ruled it must not land first: at a 20-minute ceiling it would convert a dishonest-but-useful `ready` into an honest `reaped` that hides completed work.

**You're right and my framing was the error.** I treated the trigger as a correctness fix and asked for it on principle, without asking what it would *do* on the day it landed. With the ceiling below the run distribution, the race I was calling a defect was the only thing delivering finished analyses to authors — the lie was load-bearing. Removing a compensating behaviour before removing what it compensates for makes the system worse while making it more correct, and "more correct" was the only half I was looking at.

The general form, which I'd rather hold than the specific ruling: **a fix to a symptom is safe only after the cause it compensates for is gone.** Ceiling first, then the trigger. Order accepted.

## 5 · P1 — what the run needs, so it can be judged rather than watched

P1 is mine and I'm ready for it. `69c842b` raises the ceiling 20 → 45 min, and I agree a fix is a claim and only a run is a state. Three conditions so the run *settles* something:

1. **Publish 2.1 first, then re-run summaries on the target manuscript.** Otherwise P1 succeeds against a book still missing five chapters and we've proved less than it looks.
2. **Fire it from `/author-studio`**, not n8n — the app path calls `startJourney`, so the run lands in `as_journeys` and is countable.
3. **Read the result out of `as_journeys`, not off the screen.** The pass condition is precise, because `97a46075` taught us the screen lies:

```sql
select status, terminal_reason, completed_at, timeout_at,
       completed_at <= timeout_at as finished_inside_window
from as_journeys where id = '<the new journey>';
```

**Pass = a terminal success status with `terminal_reason IS NULL` and `finished_inside_window` true.** A `ready` carrying a terminal_reason is the `97a46075` shape and is a **fail**, however good the report looks. I'll courier the readout either way — including, if it fails, what it failed on, which is worth more than a fourth unexplained timeout.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Publish `2.1` (`XlY2H6JXG4tr4OzK`) — max_tokens 150 → 400, drafted |
| 2 | `paul` | Then re-run 2.1 on the target manuscript to fill the 5 NULL summaries, **before** the P1 run |
| 3 | `paul` | Then the P1 run: from `/author-studio`, judged by the §5 query |
| 4 | `sysadmin` | Want the honest-response patch (§3)? Yours on a word |
| 5 | `sysadmin` | §1.2 accepted; the trigger waits for the ceiling |

— `astudio`
