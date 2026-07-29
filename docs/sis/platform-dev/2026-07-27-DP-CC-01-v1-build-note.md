# DP-CC-01 v1 · Craft Call Cell — build note

**AL-PDC-DPCC01-B · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** BUILT (inactive). Awaiting E1/E3/E4 tests before consumer migration begins.
**References:**
- `docs/sis/platform-dev/2026-07-27-DP-CC-01-craft-call-cell-spec.md` — dispatch spec
- `docs/sis/platform-dev/2026-07-27-DP-CC-01-schema-response.md` — SysAdmin's schema ratification
- `docs/sis/platform-dev/2026-07-27-AL-SIS-HN-001-R-http-nodes-ratification.md` — the ruling this implements

## 1 · What shipped

### Cost table seeded (lmo_model_pricing, 5 rows)

Sourced from Anthropic's live pricing pages (accessed 2026-07-27). Cache multipliers use Anthropic's documented 5-minute rates (input × 1.25 for cache write, input × 0.10 for cache read); 1-hour cache write (input × 2.0) not seeded — add a second row per prefix if a station opts in.

| model_prefix | input | output | cache_read | cache_write | effective_from |
|---|---|---|---|---|---|
| claude-sonnet-4-5 | 3.00 | 15.00 | 0.30 | 3.75 | 2026-07-27 |
| claude-sonnet-4-6 | 3.00 | 15.00 | 0.30 | 3.75 | 2026-07-27 |
| claude-sonnet-5 | 2.00 | 10.00 | 0.20 | 2.50 | 2026-07-27 (intro, through 2026-08-31) |
| claude-sonnet-5 | 3.00 | 15.00 | 0.30 | 3.75 | 2026-09-01 (standard) |
| claude-haiku-4-5 | 1.00 | 5.00 | 0.10 | 1.25 | 2026-07-27 |

**Opus deliberately omitted.** No AL workflow currently plans to invoke Opus, and Anthropic's Opus pricing surfaces less consistently in the pricing docs than Sonnet/Haiku. Per SysAdmin's law ("no row → cost_estimate_usd = NULL, never guessed"), an Opus call today gets NULL cost and a follow-up findings note — better than seeding a wrong number. Add Opus rows when a station's dispatch explicitly plans to use it.

Cell's pricing lookup is `WHERE actual_model LIKE model_prefix || '%' ORDER BY LENGTH(model_prefix) DESC, effective_from DESC LIMIT 1` — longest matching prefix, most recent effective_from. Sonnet 5 intro/standard flip is date-driven and requires no code change.

### Craft Call Cell workflow

- **n8n ID:** `crXhG5caNVHBmglo`
- **Project:** Writing (`GSeZq3LJyil79BZV`)
- **URL:** https://spikeislandstudios.app.n8n.cloud/workflow/crXhG5caNVHBmglo
- **State:** inactive (Execute Workflow Trigger; publish not required for sub-workflow calls, but Paul may want to publish for canvas display cleanliness)
- **Nodes (11 workflow + 3 stickies):**
  1. `Cell Invoke` — Execute Workflow Trigger; typed inputs: journey_id, station_id, model_requested, system, messages, max_tokens, cache_control?, temperature?, stop_sequences?
  2. `Validate & Prep` — Code (JS, runOnceForAllItems). Checks required inputs; on fail sets `__validation_failed:true`; on pass captures `start_time_ms`.
  3. `Validation Passed?` — IF; false branch routes to Validation Corpse (no ledger).
  4. `Anthropic Messages Call` — HTTP Request v4.4 to `/v1/messages`. Auth: predefinedCredentialType → `anthropicApi` (bound to `AuthorsLab Anthropic Key`, id `PzYKN7Dg419GPPGR`). Headers: `anthropic-version: 2023-06-01`, `content-type: application/json`. Body: JSON.stringify of {model, system, messages, max_tokens, temperature, stop_sequences}. Options: `fullResponse: true`, `neverError: true`, `timeout: 300000`.
  5. `Extract Response` — Code. Parses status, model, stop_reason, usage, content; computes latency; derives terminal_reason (`http_XXX` or `max_tokens_truncation` or null) and `success` boolean.
  6. `Lookup Pricing` — Postgres executeQuery against `public.lmo_model_pricing` using `Author Database` credential (`LzOLBpaxWz7JUDoN`).
  7. `Compute Cost & Build Ledger Row` — Code. Multiplies usage tokens by pricing (null when no pricing row matches). Builds the ledger-row JSON payload.
  8. `Write Ledger Row` — Postgres executeQuery INSERT into `public.lmo_ledger`. Uses a single jsonb parameter → SELECT pattern so nullable columns handle cleanly without commas-in-quoted-fields hazards.
  9. `Success?` — IF on `success` boolean from Extract.
  10. `Success Return` — Set node with clean `{ok:true, content, model, stop_reason, usage, latency_ms, cost_estimate_usd}` shape.
  11. `Failure Corpse Return` — Set node with `{ok:false, terminal_reason, http_status, http_error_body, model?, stop_reason?, usage?, latency_ms, cost_estimate_usd?}`.

### Credential path resolution (§7 Q1)

SysAdmin's guidance ratified: HTTP Request v4.4 exposes `authentication: 'predefinedCredentialType'` + `nodeCredentialType: 'anthropicApi'`, and the existing `AuthorsLab Anthropic Key` credential (`PzYKN7Dg419GPPGR`, type `anthropicApi`) plugs straight in — no new `httpHeaderAuth` credential needed. n8n injects `x-api-key` from the anthropicApi credential automatically. This was the FIRST path Paul was asked to try and it worked directly through MCP node config.

`ftz1pL5MrcZPWHYQ` (httpHeaderAuth "AuthorsLab_Anthropic_Key") is not used and can be considered redundant unless another workflow depends on it. Recommend leaving it in place for now (no cost) and cleaning up in a later hygiene pass.

## 2 · Corpse-on-every-path law: how each terminal is written

| Terminal state | Ledger row? | Return shape |
|---|---|---|
| Validation fails (missing input) | **NO** (per spec §5 review note — not a model call) | `{ok:false, terminal_reason:'validation_failed', validation_errors:[...], model_requested}` |
| HTTP 4xx/5xx | YES (success=false, tokens null, cost null, terminal_reason=`http_XXX`) | `{ok:false, terminal_reason:'http_400', http_status, http_error_body, model:model_requested, latency_ms}` |
| 200 + stop_reason=max_tokens | YES (success=false, tokens present, cost computed, terminal_reason=`max_tokens_truncation`) | `{ok:false, terminal_reason:'max_tokens_truncation', http_status:200, stop_reason:'max_tokens', usage, latency_ms, cost_estimate_usd}` |
| 200 + stop_reason=end_turn | YES (success=true, tokens present, cost computed, terminal_reason=null) | `{ok:true, content, model, stop_reason:'end_turn', usage, latency_ms, cost_estimate_usd}` |

## 3 · v1 scope decisions worth flagging

### No auto-retry in v1

Q3-approved policy (1 retry, 500ms→2000ms exponential, 429/529 only, no jitter) is **not implemented in v1**. Rationale:
- With `neverError: true`, n8n's built-in HTTP retry doesn't fire (nothing throws for it to catch).
- A manual retry loop needs an extra IF + Wait + HTTP node pair, which adds three nodes and a merge to every future migration.
- We have zero data on 429/529 rates in AL's actual workload. Building the retry now optimises for an unknown.
- **Method-consistent alternative:** ship v1 without retry, let the LMO ledger accumulate real 429/529 evidence in the field, then design v1.1's retry against that evidence (which will also decide the jitter question in real terms).

If a Wave-1 consumer hits repeated transient failures before v1.1 lands, the failing call becomes a corpse the calling workflow can re-invoke, which is lawful behaviour, just less ergonomic. Findings loop catches it if it becomes a problem.

**Sensor coverage:** `inv_14_truncation_rate` (registered by SysAdmin) will bite when max_tokens truncation occurs. A parallel `inv_1X_transient_failure_rate` sensor is a good candidate for the v1.1 dispatch to add — logs 429/529 counts from the ledger for the migrated station set, alarms on unexpected growth.

### Cache write column is 5-minute rate only

The schema has one `cache_write_usd_per_mtok`. Anthropic offers 5-minute (input × 1.25) and 1-hour (input × 2.0) cache. Seeded row uses 5-minute. If a station opts into 1-hour caching, add a second row with a distinct model_prefix suffix (e.g. `claude-sonnet-4-5-1h`) and route via `cache_control` blocks — v1.1 concern, no station currently uses 1-hour.

## 4 · Verification not yet run

The dispatch's exit criteria E1 / E3 / E4 (success round-trip / max_tokens fail / validation fail) need runtime tests. I can execute the Cell via `test_workflow` (uses Cell Invoke's sample input for E1) once Paul greenlights spending real credits on the test. E3 needs a `max_tokens: 1` payload; E4 needs a payload with missing station_id. Test methodology and expected ledger row contents will be filed in a companion completion doc after tests run.

**Deferred to Task 26:**
- E1: Success round-trip (real Anthropic call, ledger row asserts)
- E3: max_tokens truncation triggers Failure Corpse + ledger row with `stop_reason='max_tokens'`
- E4: Missing input triggers Validation Corpse with NO ledger row
- Then file `2026-07-27-DP-CC-01-v1-completion.md`

## 5 · Standing hazards recorded

- Workflow 2.2 (already DP-AS-02 instrumented, on packaged Anthropic nodes with `maxTokensToSample: 4000`) still carries silent-truncation risk until it migrates to the Cell at DP-AS-06 (per ratification §3). Cell existence doesn't close that gap alone — the migration pass does.
- Workflow 2.1 (chapter-summaries, `maxTokensToSample: 150`) carries a tighter truncation risk. Same fix, same migration.

## 6 · What consumer migration looks like

First migration target: `alex-chat` (per ratification §5.1 — shortest user-cycle-time = fastest feedback loop). Design pattern per consumer:

1. Consumer workflow currently has a `chainLlm` or standalone Anthropic Chat node call.
2. Replace with `Execute Workflow` node pointing at the Cell (`crXhG5caNVHBmglo`), passing `station_id`, `model_requested`, `system`, `messages`, `max_tokens`, and any journey_id already in scope.
3. Downstream, treat `$json.ok === false` as the failure branch: surface `terminal_reason` to the UI journey_state, log details.
4. `$json.ok === true` → use `$json.content` as the model output.
5. Same visit: pair with the DP-AS-02 journey writeback for that station if not already done.

Migration ordering unchanged from ratification §5. Total 10 workflows to migrate.

— Platform Developer station, on DP-CC-01 v1 build
