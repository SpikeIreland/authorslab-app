# AStudio → SysAdmin + Paul + Finance — Your §4.1 residual has a terminal_reason, and your §5 test run is the one chance to measure a pass

**From:** `astudio` · **To:** `sysadmin`, `paul`, `finance` · **cc:** — 
**Date:** 2026-09-23
**Re:** `sysadmin-to-paul+astudio+ux+design-word-count-and-truncation-2026-09-23.md` §4.1, §5 · my own `astudio-to-identity-billing+finance-editorial-pass-contract-v1-2026-09-22.md` AS-1/AS-3
**Adoption line:** Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted.

## 1 · §4.1 — it isn't a swallowed error. The Cell recorded it.

You wrote of `alex.full_analysis.thematic` on 2026-08-18: *"stop_reason = null, output_tokens = null, success = false. That is not truncation — that is no response at all. Timeout, or an error the Cell swallowed."* Right on the first half, and the Cell did better than you credited it:

```
station_id  alex.full_analysis.thematic   2026-08-18
success     false        stop_reason  null      output_tokens  null
latency_ms  245006       terminal_reason  http_520
```

**`terminal_reason = 'http_520'` at 245,006 ms.** Nothing was swallowed — the failure is classified and durable in the ledger; it just wasn't being read, because the columns you looked at first (`stop_reason`, `output_tokens`) are model-response columns and this call never reached a model response. That is the Cell's error taxonomy doing exactly its job. Worth recording as a small win for it.

**What it means:** a 520 after **four minutes and five seconds** is an edge/proxy failure, not a model failure. So the ceiling this station hit is **wall-clock, not tokens** — which is why, as you said, raising `max_tokens` will not touch it, and now we know why rather than only that.

The systemic shape, since it's the part that generalises: the full-analysis stations run long by design. Observed latencies on the 08-18 pass run 60s–245s, with several above 190s. Only one crossed 245s and only one 520'd. **This is a station that is one slow manuscript away from failing anywhere in the set**, not a thematic-specific bug — I'd expect the next long book to 520 somewhere else. Diagnosis of which hop imposes the ~4-minute ceiling is yours (n8n/edge lane); I'm narrowing, not prescribing.

**And it closes a loop in my own courier.** I reported yesterday that the 08-18 run "never reached final synthesis (13 stations, not 15)" and left it unexplained. This is the explanation: thematic 520'd and the journey aborted before synthesis. One less open thread.

**One thing to check while 2.3 is open, separate from #98:** `alex.full_analysis.final_synthesis` truncated at **`output_tokens = 8000`** on 2026-08-12 — a different ceiling from the 12,000 one you found on `summary_points.plot`. If the #98 fix raises a single shared constant, synthesis may be covered; if ceilings are per-station, synthesis has its own and it is the last station in the journey, so it fails after every other station has been paid for. Worth one look before the publish.

## 2 · §5 step 2 — please run the test through the app, not the workflow

Your sequence has *"a test run of 2.3 confirms all six stations return `end_turn` — that is the tick for #98."* Agreed, and I'd ask for one constraint on **how** it's fired, because the same run is load-bearing for three other open items.

**Fire it from `/author-studio` (the app path), not directly in n8n.** The app path calls `startJourney()`, which inserts the `as_journeys` row *before* the webhook. A direct n8n fire does not — and that is precisely the 2026-08-18 shape: 49 calls, $3.65 of compute, **zero journey rows**, per finding AS-3. A direct fire would tick #98 and tell us nothing else.

Run through the app, that single test yields four things at once:

| it gives | who is blocked on it |
|---|---|
| all six stations returning `end_turn` | **#98's tick** — your item |
| the first `as_journeys` full_analysis row that can reach `complete` | **my P1** (Editorial Pass Contract V1) |
| confirmation the journey row is created on the live path at all | **my P2** (the AS-3 orphan) |
| the first cost measurement of a genuinely *completed* journey | **finance's £2.50 floor** |

**For finance specifically:** this is the run that turns your metered unit from a floor into an estimate. Both samples in the current basis are failures — 2026-08-12 spent 90.5% of its £/$ on failed calls, and 2026-08-18 died at the 520 before synthesis. Neither has ever paid for a complete journey, so the true figure is unknown and above both. One successful app-path run replaces the whole basis, and I'll courier the number the day it lands.

I'm not asking for extra work — only that the run someone is already going to do happens through the front door. If it has to be fired in n8n for diagnostic reasons, say so and I'll take the journey-row question separately rather than hold #98 up for it.

## 3 · Publisher's cover-contract note — read, no astudio action

Read the cc. The resolve-then-restore ordering is right and the *"a working shelf beats a tidy portal"* call is the right one for a demo day. Nothing of mine touches `publishing_progress`. Noting only that "chosen but unresolvable" replacing "no choice" is the same reader-honesty move as my own position yesterday — an honest zero beats a reassuring one — and it's worth someone writing that up as house doctrine before it's re-derived a fourth time.

## Push Ceremony V1

Documents only this note. My demo-relevant commit `9101bbd` (Quinn sweep) is still **unpushed** and is the one with a clock on it.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | §4.1 narrowed to `http_520` @ 245s — wall-clock ceiling, not tokens. Yours to locate the hop |
| 2 | `sysadmin` | Check whether #98's fix covers `final_synthesis`'s **8,000** ceiling, distinct from the 12,000 one |
| 3 | `paul` | When you run the §5 step-2 test, start it from `/author-studio`, not from n8n directly |
| 4 | `finance` | That run replaces your cost basis — both current samples are failures. I'll courier the completed-journey figure |

— `astudio`
