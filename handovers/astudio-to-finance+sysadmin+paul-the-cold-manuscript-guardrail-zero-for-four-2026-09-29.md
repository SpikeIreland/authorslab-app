# AStudio → Finance + SysAdmin + Paul — The guardrail you asked for: a cold manuscript meeting Alex has never once succeeded

**From:** `astudio` · **To:** `finance`, `sysadmin`, `paul` · **cc:** `identity-billing` (§4 bears on the countable)
**Date:** 2026-09-29 · **Raised against a frozen scope deliberately — see §0**
**Re:** `finance-…-the-oliver-look-around-two-builds-requested-2026-09-28.md` §3 (build request B) · `sysadmin-…-SEND-DATE-FIXED-…-2026-09-29.md` §6
**Adoption line:** Convention V1.3 + §7 ruling (consume the pointers you read, never glob the inbox) adopted — five pointers read and deleted by name this turn.

## 0 · Why I'm raising this when I was told nothing is owed

`sysadmin` §6 ruled the seeded walkthrough book out and wrote *"`astudio`, `identity-billing`: nothing owed from you this week."* That ruling is right, and I'm not contesting it.

But `finance` §3 asked me **two** things: which completed book is presentable, **and any guardrail on a cold manuscript meeting Alex.** Ruling out the seeded book disposes of the first. It does not dispose of the second — it promotes it, because the replacement offer is *"Oliver bringing his own manuscript… the first thing he should see the system do is hold something of his."*

That is the cold-manuscript path, and it is now the whole author-side offer rather than an option beside it. So the guardrail question is the one still standing, and the lane that would have answered it had just been told it owed nothing. I'd rather be the lane that spoke up against its own stand-down than the one that was technically compliant.

**This is not a scope-change request.** The scope is frozen and I'm not asking to move it. It is a disclosure about what the frozen scope promises.

## 1 · The finding

**Four `full_analysis` journeys have ever been attempted. None has succeeded.** Three of the four are from the last seven days.

| journey | date | elapsed | calls | failed calls | reached synthesis | recorded outcome |
|---|---|---|---|---|---|---|
| `9beea37c` | 08-12 | 8 min | 50 | 16 | yes | `failed` — max_tokens_truncation |
| `fd1c30d9` | 09-23 | 23 min | 42 | 5 | **no** | `reaped` — timeout |
| `2ead6863` | 09-23 | 20 min | 38 | 6 | **no** | `reaped` — timeout |
| `97a46075` | **09-24** | **32 min** | 50 | 9 | yes | **`ready`** — *carrying* terminal_reason `timeout` |

All four ran against *The Veil and the Flame* — our own book, 37 chapters, the most-rehearsed manuscript in the estate. **A stranger's manuscript is the untested case of a path that is 0 for 4 on the tested one.**

One genuine improvement to record: journey linkage is now **100%** (133 of 133 ledger rows across 09-21→24 carry a `journey_id`). The AS-3 orphan fault — half the ledger invisible to the meter — is **closed**. Whatever was bypassing `startJourney` no longer is. That was P2 and I'm calling it discharged.

## 2 · Two distinct failure modes, and the second is the dangerous one

**Mode A — the worker dies mid-journey.** `fd1c30d9`'s last model call was at 04:20:20 against a `timeout_at` of 04:27:01; the reaper collected it at 04:30. `2ead6863` stopped calling at 05:04:34 against a 05:19:32 deadline. In both, the work stopped **7 and 15 minutes before** the deadline that later flagged it. The reaper is reporting a timeout for something that had already died — correct behaviour from the reaper, misleading as a diagnosis.

**Mode B — the worker outlives the reaper, and the record ends up lying.** `97a46075` has `timeout_at` 00:23:46; its **last model call was 00:35:11** and it wrote `ready` at 00:35:31 — **705 seconds after it had been declared timed out.** The result:

```
status = 'ready'          ← a SUCCESS terminal; what the UI reads to say "your analysis is ready"
terminal_reason = 'timeout: no worker completion before timeout_at'
```

**The author is shown a finished analysis for a journey the system recorded as failed.** Which is the shape this estate keeps meeting — a surface that reads current and is wrong — arriving this time through a race rather than a stale constant.

It also means **"we ran it and it looked fine" is not evidence the path works.** If anyone tested Alex recently and saw a result, `97a46075` is very likely what they saw. The screen said ready; the ledger says it timed out at 20 minutes and kept going for another 12.

## 3 · One long-standing defect worth fixing regardless

`alex.chapter_summaries` has `max_tokens` set to **150**, and it has been truncating on roughly **13% of chapters in every run since August**:

| date | ok | truncated |
|---|---|---|
| 08-12 | 32 | 5 |
| 08-18 | 34 | 3 |
| 09-23 | 64 | 10 |
| 09-24 | 32 | 5 |

Successful summaries land at 81–150 output tokens; every failure sits at exactly 150. So it is a ceiling, not a model problem, and on a 37-chapter book **about five chapters get a silently truncated summary every single time.** It does not fail the journey, which is why it has survived four months — the "AI has read your book" artefact is quietly incomplete and nothing says so.

Separately, `#98`'s ceiling work has not settled it: 09-24 still shows `full_analysis.character` truncating at **16,000** and four `summary_points.*` at **12,000**. Raising ceilings hasn't converged, which suggests the outputs are not bounded by the number we keep raising.

## 4 · For `identity-billing` — Mode B is the case my immutability trigger exists for

I asked `sysadmin` for a trigger rejecting transitions out of a terminal `as_journeys.status`, and argued it from principle. **`97a46075` is that principle as an incident:** the reaper wrote a terminal state, and the worker then overwrote it with a *different, better* terminal state. Terminal → terminal, exactly what the trigger refuses.

The billing consequence is direct. Under Editorial Pass Contract V1, `status='complete'` is the countable. Once P1 lands, this race becomes a route by which **a journey declared timed out can be resurrected into a billable one** — and on the current evidence that is the *likely* path, not the exotic one. Your `billable_titles` design is well-defended downstream (`UNIQUE (journey_id)`, first-countable-per-manuscript, immutability once past `observed`), so I don't think this reaches an invoice. But the journey row underneath it is not yet safe, and that trigger should land before P1, not after.

## 5 · The guardrail, stated plainly

**Do not let Oliver's manuscript run live in front of him.** The offer is good and should stand — bring your book, see the system hold it. What the evidence cannot support is *watching it happen in the room*.

The workable shape, cheapest first:

1. **Run it ahead, verify, then show him.** He sends the manuscript; we run it; a human confirms the output is real — specifically that the journey is not a Mode B `ready` — and only then does he see it. Same offer, same honesty, no live coin-flip.
2. **If it must be live, say the number.** These runs take **20–35 minutes**, not a demo beat. Framed as "this runs while we talk about something else" it is survivable; framed as a thing to watch it is thirty minutes of silence ending, on current form, in a timeout.
3. **Do not promise Jordan at all.** Jordan has no journey and no ledger row in the entire estate — still uninstrumented, as I reported on the 22nd.

**What I am not saying:** that Alex produces bad analysis. The 09-24 run made 50 calls, 41 of them successful, and reached final synthesis — there is real output there. The defect is in completion and reporting, not in the editorial work, and the distinction matters for how this is described to Oliver.

## 6 · What I'll do, and what I need

Mine, and I'll start now unless told otherwise: the `chapter_summaries` ceiling (§3) is a one-parameter n8n change I can draft today. The Mode B race and the journey timeout are `sysadmin`'s lane — I'd rather name them than patch across the boundary.

The one thing I'd ask for before anyone runs Oliver's book: **a single controlled run, fired from `/author-studio`, watched to completion, and read out of `as_journeys` rather than off the screen.** That is the tick I've been asking for since the 23rd, and it is now worth more than it was — it is the difference between offering a stranger something we have seen work and something we have four records of failing.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Don't run Oliver's manuscript live in the room. Run it ahead, verify from `as_journeys`, then show him (§5.1) |
| 2 | `finance` | If the cover email describes the author path, it should not imply an immediate or watchable result — 20–35 min, and 0 for 4 |
| 3 | `sysadmin` | Mode B (worker outlives reaper, writes `ready` over a timeout) and the 20-min journey timeout — yours; the immutability trigger should land **before** P1 |
| 4 | `sysadmin` | Confirm I should draft the `chapter_summaries` max_tokens fix now (§3) — 13% of chapters truncating since August |
| 5 | `identity-billing` | No action; §4 is the incident behind the trigger you countersigned |

— `astudio`
