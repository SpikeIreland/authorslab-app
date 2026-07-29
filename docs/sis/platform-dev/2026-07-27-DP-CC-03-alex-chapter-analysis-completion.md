# DP-CC-03 · alex-chapter-analysis Cell adoption + chapter_analysis journey wiring — completion

**AL-PDC-DPCC03-C · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** COMPLETE. Second Cell consumer live. New finding filed on test methodology.
**Workflow:** `DFjLpqzX1geDA0pL` "2.4 Alex Chapter Analysis" — https://spikeislandstudios.app.n8n.cloud/workflow/DFjLpqzX1geDA0pL
**Test execution:** `262475`, synthetic webhook via `execute_workflow`

## 1 · End-to-end evidence — happy path

Test journey `31e69456-2bfd-4b6a-b1f9-e351e576bb9a`:

| Timestamp (UTC) | Event |
|---|---|
| 04:03:26.693 | INSERT as_journeys (status=submitted, timeout_at=+3min) |
| 04:03:42.060 | Webhook fires |
| 04:03:43.629 | UPDATE status→received (Journey: Received, 1.6s after webhook) |
| 04:03:58.5 approx | Cell returns `{ok:true, content:"```json\n{initial_thoughts:[...]}\n```"}` — ~15s Anthropic latency |
| 04:03:58.7 approx | Extract Initial Thoughts parses 2 observations from the JSON |
| 04:04:03.143 | Insert Chapter Notes writes 2 manuscript_issues rows |
| 04:04:03.340 | Update Manuscript Status sets status='editing', full_analysis_completed_at=NOW() |
| 04:04:03.523 | UPDATE status→ready (Journey: Ready) |
| 04:04:03.619 | Respond to Webhook |

**Total lifecycle: 37 seconds submitted→ready.** Well under 3-min chapter_analysis timeout. Reaper had nothing to reap.

## 2 · Ledger row

Row `c3f7da6c-d415-4395-8d2c-3e63bdcaf57f`:

- `journey_id` → `31e69456-...` ✓
- `station_id` → `alex.chapter_analysis` ✓
- `model` → `claude-sonnet-4-5-20250929` ✓ (bumped from 4)
- `input_tokens` → 2,481
- `output_tokens` → 440 (JSON with 2 observations)
- `stop_reason` → `end_turn` ✓
- `latency_ms` → 14,868 (~15s)
- `cost_estimate_usd` → 0.014043
  - Verified: 2481 × $3/Mtok + 440 × $15/Mtok = $0.007443 + $0.006600 = $0.014043 ✓
- `success` → true, `terminal_reason` → null

**Per-chapter cost signal: ~$0.014.** A 20-chapter manuscript full pass = ~$0.28. Materially more sensitive to caching than chat — the manuscript_summary + full_analysis_key_points are repeated verbatim across every chapter's analysis prompt. This is a strong DP-CC-XX candidate for the first cache_control experiment.

## 3 · Migration shape — bigger and one interesting semantic

- **12 → 18 nodes.** Bigger than alex-chat's 7→11 because of the DB-write tail (Extract Initial Thoughts → Prepare Issues → Insert Chapter Notes → Mark Analysis Complete → Update Manuscript Status → Journey: Ready → Respond to Webhook).
- **Failure path skips the write tail.** Reply Success? routes ok:false directly to Journey: Failed → Respond to Webhook. If Anthropic errors or truncates, we don't mark analysis complete or update the manuscript — the caller sees the failure and can retry. Contrast with the previous behaviour, which had `Extract Initial Thoughts` return `[]` on error and then... unclear (n8n's zero-item skip would silently stop the chain without responding).
- **The workflow's existing bare `{{ }}` (no `=` prefix) queries all used `$('Webhook').first().json.body.X`** — explicit named references, safe regardless of predecessor. Not the same footgun as alex-chat's `Fetch Manuscript Context`. Bug 2 from DP-CC-02 didn't repeat here.

## 4 · New finding — test hazard on write-tail workflows

Filed as `docs/sis/findings/2026-07-27-F-013-write-tail-test-pollution.md`.

Short version: synthetic tests via `execute_workflow` cause the full workflow to run, including its write tail. For workflows that only read (chat, summary reads) this is inert; for workflows whose Cell success triggers real DB writes on the target manuscript (all chapter_analysis and full_manuscript_analysis variants), the test pollutes the manuscript we're testing against.

Today's evidence: this test inserted 2 real `manuscript_issues` rows into Paul's "The Signal and the Shadow" chapter 1 and set `manuscripts.full_analysis_completed_at = NOW()`. The 2 issue rows were surgically deleted post-test; the timestamp was left in place (invisible to authors; not worth restoring blindly).

**New method going forward per Paul's direction:** remaining migrations get tested **via the UI on a throwaway manuscript Paul designates, whose outputs he deletes.** I keep synthetic tests for read-only workflows and for the Cell itself. See finding for the full record.

## 5 · Node graph (18 nodes)

```
Webhook
  → Journey: Received
    → Fetch Manuscript
      → Fetch Chapters
        → Prepare Chapter Data
          → Fetch Context
            → Build Alex Prompt
              → Call Craft Call Cell
                → Handle Cell Return
                  → Reply Success?
                    ├── true → Extract Initial Thoughts
                    │           → Prepare Issues for Insert
                    │             → Insert Chapter Notes
                    │               → Mark Analysis Complete
                    │                 → Update Manuscript Status
                    │                   → Journey: Ready
                    │                     → Respond to Webhook
                    └── false → Journey: Failed
                                  → Respond to Webhook (shared terminal)
```

## 6 · Standing hazards recorded

- Same 4 `MISSING_EXPRESSION_PREFIX` warnings persist on the pre-existing SQL query nodes (Fetch Manuscript, Fetch Chapters, Fetch Context, Update Manuscript Status). All use `$('Webhook').first()...` named references so they don't break when nodes are inserted in the chain (unlike DP-CC-02's Fetch Manuscript Context which used `$json.field` and broke). Recommend hygiene pass over remaining unmigrated workflows to add `=` prefixes preventively.

## 7 · What's next

Remaining Alex migrations:
- **alex-full-manuscript-analysis** (`oMujQsfgWI1LWD4z`, 20min J1) — biggest scope, needs Cell + journey + max_tokens tuning for very long outputs (full manuscript analysis outputs run 4-8k tokens); also the primary demo path
- **generate-chapter-summaries** (`r9xbJrw22k5vb3zs`, J1 sub-workflow) — currently on `chainLlm` + `lmChatAnthropic` (packaged), so this one needs the "full node swap" not just wire adoption

Then Sam and Jordan variants (parallel work — same three shapes each).

Also opens the cache_control follow-up dispatch now that chapter_analysis is a live consumer and its per-call cost is on the ledger.

— Platform Developer station, on DP-CC-03 completion
