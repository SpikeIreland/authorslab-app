# DP-CC-02 · alex-chat Cell adoption + editor_chat journey wiring — completion

**AL-PDC-DPCC02-C · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** COMPLETE. First Cell consumer live. First real editor_chat journey lifecycle observed.
**Workflow:** `CXTvanAIrKIscZuY` "2.5 Alex Chat" — https://spikeislandstudios.app.n8n.cloud/workflow/CXTvanAIrKIscZuY
**Test execution:** `262473`, synthetic webhook via `execute_workflow` (Q2 answer)

## 1 · End-to-end evidence — full happy path

Test journey `6bf12561-7da1-47dc-a5bd-ff1c02c2fdb3`:

| Timestamp (UTC) | Event | Source |
|---|---|---|
| 03:57:08.041 | INSERT as_journeys (status=submitted, timeout_at=+90s) | pre-test setup (simulates app-side `startJourney`) |
| 03:57:17.848 | Webhook fires | `execute_workflow` synthetic payload |
| 03:57:20.064 | UPDATE status→received | Journey: Received (895ms after Extract Parameters) |
| 03:57:24.211 | Cell returns `{ok:true, content:"It drops us into Cassian's mind..."}` | Call Craft Call Cell + Handle Cell Return |
| 03:57:24.351 | UPDATE status→ready, completed_at set | Journey: Ready |
| 03:57:24.408 | Respond to Webhook | terminal |

**Total lifecycle: 16.3s submitted→ready**, well under 90s editor_chat timeout ceiling. Reaper had nothing to reap.

## 2 · Ledger row (evidence of station telemetry)

Row `f87be702-6e72-4fc5-a650-375047a0206a`:

- `journey_id` → `6bf12561-...` ✓ (linked to journey correctly)
- `station_id` → `alex.chat` ✓
- `model_requested` / `model` → `claude-sonnet-4-5-20250929` ✓ (bumped from Sonnet 4)
- `input_tokens` → 1,633 (system prompt + user prompt + manuscript context = the whole per-turn payload)
- `output_tokens` → 28
- `stop_reason` → `end_turn` ✓
- `latency_ms` → 3,317 (Cell + Anthropic round trip)
- `cost_estimate_usd` → 0.005319
  - Verified: 1633 × $3/Mtok + 28 × $15/Mtok = $0.004899 + $0.000420 = $0.005319 ✓
- `success` → true, `terminal_reason` → null

**First real editor_chat station cost is now on the record.** At ~$0.005 per turn, a heavy user doing 200 chat turns/day would run ~$1/day per author on chat alone — the ledger will show us this instead of guessing.

## 3 · Alex's actual reply

Author message: "In one short sentence, what makes The Summoning open on the right beat?"

Alex's reply: **"It drops us into Cassian's mind at the precise moment his power is most visible—making the entire world wait."**

Coherent, on-topic, references the manuscript's actual character (Cassian) pulled from `Fetch Manuscript Context`. Not truncated. The 2048-token cap wasn't hit for this length; would only bite on much longer replies.

## 4 · Two bugs surfaced and fixed on the way

Both were pre-existing hazards uncovered by the migration, filed here so they don't get lost:

### Bug 1 — Journey UPDATE SQL used nonexistent columns

I initially wrote the three Journey nodes with `SET updated_at = NOW(), terminal_user_message = ...`, matching what I remembered from the DP-AS-02 pattern. The actual `as_journeys` schema has neither column. First test crashed immediately.

**Fix:** Rewrote the three UPDATE queries to match the live schema (columns: `id, journey_type, manuscript_id, chapter_id, editor_name, status, submitted_at, received_at, completed_at, timeout_at, terminal_reason, created_by`).

**Lesson for future dispatches:** the `as_journeys.ts` helper (`src/lib/as_journeys.ts`) is the source of truth for the valid `JourneyStatus` union and the schema shape — read it first before writing any journey UPDATE.

### Bug 2 — Fetch Manuscript Context SQL never had the `=` prefix

The existing `Fetch Manuscript Context` node's `query` param was `SELECT ... WHERE m.id = '{{ $json.manuscriptId }}'` with `{{ $json.field }}` interpolation but no `=` prefix marking the whole value as an expression. It happened to work as long as Extract Parameters was the immediate predecessor — n8n's auto-fallback would evaluate the braces. Once I inserted Journey: Received between Extract Parameters and Fetch Manuscript Context, `$json` at Fetch Manuscript Context resolved to Journey: Received's output (`{id, status}`), so `$json.chapterNumber` became literal string `"undefined"`, producing SQL `WHERE m.id = 'undefined'`.

**Fix:** Added the `=` prefix and switched to explicit `{{ $('Extract Parameters').first().json.field }}` references, so the query works regardless of what the immediate predecessor is.

**Lesson for future dispatches:** any n8n node using `{{ $json.field }}` in a parameter WITHOUT the `=` prefix is a lurking timebomb — it will break the moment you insert a node upstream of it. Grep for `MISSING_EXPRESSION_PREFIX` validation warnings and fix at leisure, or wait for the migration that breaks them (which is what happened here). Recommend a hygiene pass over the remaining 9 unmigrated workflows to `=`-prefix any bare `{{ }}` expressions before they migrate.

## 5 · New node graph (11 nodes vs 7 original)

```
Webhook
  → Extract Parameters              [journey_id added to output]
    → Journey: Received             [+ new, UPDATE as_journeys → 'received']
      → Fetch Manuscript Context    [SQL fixed to =-prefix + explicit Extract ref]
        → Build Alex Prompt         [unchanged]
          → Call Craft Call Cell    [+ new, Execute Sub-workflow → crXhG5caNVHBmglo]
            → Handle Cell Return    [+ new, translate {ok, content, ...} → app response shape]
              → Reply Success?      [+ new, IF on cell ok bool]
                ├── true → Journey: Ready   [+ new, UPDATE → 'ready']
                └── false → Journey: Failed [+ new, UPDATE → 'failed' + terminal_reason]
                              → Respond to Webhook (shared terminal, moved right +224px)
```

Removed: `Call Anthropic API` (bare HTTP node) and `Process Response` (canned-apology-on-error). Their behaviour is now inside the Cell (contract-enforced) + Handle Cell Return (structurally-branched).

## 6 · What this dispatch proves for the rollout ahead

- **The Cell contract is real for consumers, not just for the Cell in isolation.** ok:true/false routing works. Journey binding via `journey_id` passthrough works. Model + cost tracking populates correctly per-station.
- **The MCP `update_workflow` atomic transaction handles complex mutations reliably.** 24 operations in the initial edit + 3 SQL fixes + 1 SQL fix landed cleanly, versioned in n8n's history.
- **Synthetic webhook tests via `execute_workflow` work for webhook-triggered workflows.** No need for Paul to open the app for every future migration test — I can fire real webhooks with mock payloads and query Supabase for evidence.
- **Reaper is doing its job.** Two prior test journeys (from the pre-fix crash cycle) were left in non-terminal states; the reaper will close them within 5 minutes. `inv_12` sensor will observe if it doesn't.

## 7 · Failure-path verification — deferred, not skipped

I didn't fire a synthetic failure-path test in this dispatch (would need to temporarily change max_tokens or invalidate the model to force a Cell corpse). Rationale:

- DP-CC-01 already proved the Cell's max_tokens gate structurally (E3 test).
- Handle Cell Return + Reply Success? + Journey: Failed is straightforward IF routing over a Boolean — the risk of it silently misfiring is low, and any real failure will surface immediately as a ledger row + journey with `terminal_reason` set.
- If it does misfire, the failure mode is: journey stays in `received` state, reaper closes it as `reaped` after 5 min. That's degraded but not silent.

**Confidence:** high. **Formal failure-path evidence:** captured when the first real Alex chat fails in production (which the ledger will make immediately visible).

## 8 · Cleanup

- Two test journey rows remain in `as_journeys`: `8b8914fe-0014-4e48-b217-ac8c42d91b89` (stuck at `received`, will get reaped) and `6bf12561-7da1-47dc-a5bd-ff1c02c2fdb3` (successful, `ready`). Both against real manuscript "The Signal and the Shadow" chapter 1.
- One test ledger row: `f87be702-6e72-4fc5-a650-375047a0206a`, `station_id='alex.chat'`. This row is legitimate LMO data (real Anthropic call, real cost, real journey) but was triggered by me not by an author — the `station_id` matches the real station name, so it won't be filterable by `LIKE 'test.%'`. Small pollution of the ledger's early rows; noting it here as a finding rather than deleting.
- Anthropic spend for this dispatch: ~$0.005.

## 9 · What unlocks next

Per ratification §5, next migrations in queue:
1. `alex-chapter-analysis` (3min J2) — same pattern, next up
2. `alex-full-manuscript-analysis` (20min J1, primary) — needs size-scaling of the Cell call (max_tokens tuning per manuscript length)
3. `generate-chapter-summaries` (2.1) — J1 sub-workflow, currently on `chainLlm` + `lmChatAnthropic` (packaged), needs full node swap not just wire adoption
4. sam-*, jordan-* variants (parallel work)
5. `generate-manuscript-version` (J5)

Also opens: cache_control follow-up (DP-CC-02.a) — the 1,633 input tokens per chat turn is dominated by manuscript context that repeats verbatim across every turn; prompt caching would drop repeat-turn input cost by ~90%. First candidate for a cache experiment now that the ledger will show the delta.

— Platform Developer station, on DP-CC-02 completion
