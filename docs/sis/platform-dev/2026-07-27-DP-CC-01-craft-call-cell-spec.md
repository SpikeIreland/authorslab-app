# DP-CC-01 · Craft Call Cell — canonical AI-call primitive

**AL-PDC-DPCC01-S · 2026-07-27 · Platform Developer station**
**Dispatch:** cross-line (invoked by every AI-calling workflow in the AuthorsLab n8n estate)
**Scope:** n8n workflow design + one new DB table request
**Ratifies:** AL-SIS-HN-001 (SIS handover on HTTP nodes)
**Depends on:**
- `public.as_journeys` (D-AS-03, live 2026-07-24) — for optional journey-transition writes
- SysAdmin apply of `public.lmo_ledger` (this dispatch, §3) — for craft-call telemetry
- Anthropic HTTP credential in n8n's Writing project — need to confirm exists (see §7)

## 1 · Problem

The packaged n8n Anthropic node (both `text.message` standalone and `@n8n/n8n-nodes-langchain.lmChatAnthropic` provider variants) does not expose the fields that turn an AI call into a station: `usage` (breaks LMO ledger + SPC), `stop_reason` (**silent truncation at max_tokens looks identical to a complete response**), `cache_control` (~90% cost lever unavailable), raw API error bodies (journey `terminal_reason` gets a wrapped error, not the truth), per-call timeout/retry (journey timing can't be tuned per station).

Per AL-SIS-HN-001 ruling, standardise on raw HTTP through one shared cell. The Cell makes an uninstrumented AI call structurally impossible to write.

## 2 · The Cell — what it is

A single n8n **sub-workflow** with a webhook trigger. Every AI-calling workflow in the AuthorsLab estate invokes it via `Execute Workflow` node instead of instantiating an Anthropic node directly. The Cell owns:

1. Optional journey status write on entry
2. Raw HTTP call to `POST https://api.anthropic.com/v1/messages`
3. LMO ledger row insert with per-call telemetry
4. Deterministic `stop_reason` gate (`max_tokens` → FAIL, never silent pass)
5. Return content or corpse with raw error

### 2.1 · Inputs (webhook body)

```json
{
  "model": "claude-sonnet-4-5",         // string (Anthropic model identifier)
  "system": "You are ...",              // string (system prompt)
  "messages": [                         // array (Anthropic messages format)
    { "role": "user", "content": "..." }
  ],
  "max_tokens": 4096,                   // integer
  "station_id": "alex.chapter_analysis",// string (LMO attribution)
  "journey_id": "uuid",                 // optional (for as_journeys write)
  "cache_control": [                    // optional (Anthropic cache blocks)
    { "type": "ephemeral" }
  ],
  "timeout_ms": 90000,                  // optional (defaults from timeout table §2.4)
  "extra_headers": {}                   // optional (beta headers etc.)
}
```

### 2.2 · Contract (steps inside the Cell)

1. **Validate inputs.** `model` and `messages` required; `max_tokens` required and ≥1. Malformed → return validation corpse without HTTP call. No LMO ledger row for validation failures (they'd pollute the model-drift signal).
2. **Optional journey `processing` write.** If `journey_id` present and non-null:
   `UPDATE public.as_journeys SET status='processing' WHERE id = $1 AND status NOT IN ('ready','failed','reaped','complete','rejected','replied');`
   Never writes terminal state — that stays the caller's responsibility.
3. **Start timer.** Capture `t0` for `latency_ms`.
4. **HTTP request.** `POST https://api.anthropic.com/v1/messages` with:
   - Header `x-api-key: {{Anthropic API key}}`
   - Header `anthropic-version: 2023-06-01` (currently supported stable version)
   - Header `content-type: application/json`
   - Body: `{ model, system, messages, max_tokens }` plus optional `cache_control` blocks (attached to `system` and/or last message per Anthropic docs)
   - Timeout: `timeout_ms` or per-station default from §2.4
   - Retry: **1 retry on 429 (rate limit) and 529 (overload) only** with exponential backoff (500ms → 2000ms). Never retry on 400/401/403 (client bugs; retry would just log another corpse).
5. **Parse response.** On non-2xx: capture raw body verbatim into `corpse.error.raw` and short-circuit to §7 (LMO ledger + return corpse).
6. **LMO ledger row.** Insert into `public.lmo_ledger` (see §3 for schema request) with model, station_id, journey_id, latency_ms, `usage.input_tokens`, `usage.output_tokens`, `usage.cache_read_input_tokens`, `usage.cache_creation_input_tokens`, `stop_reason`, `success=true|false`, `terminal_reason` (nullable), `cost_estimate_usd`.
7. **`stop_reason` gate.**
   - `end_turn`, `stop_sequence`, `tool_use` → PASS. Return `{ text: <extracted>, usage, stop_reason }`.
   - `max_tokens` → FAIL with `terminal_reason='truncated_at_max_tokens'`. Return corpse. **Never silently pass a truncated response** — this is the whole point.
   - `refusal` → FAIL with `terminal_reason='model_refused'`. Return corpse.
   - Any unrecognised value → FAIL with `terminal_reason='unknown_stop_reason:<value>'`. Corpse.
8. **Return.** Success returns `{ ok: true, text, usage, stop_reason, ledger_id }`. Failure returns `{ ok: false, error: { type, message, raw }, terminal_reason, ledger_id }`.

### 2.3 · What the Cell does NOT do

- **Does not write journey terminal state.** That is the caller's responsibility per DP-AS-02's semantics (one journey per user action; only the caller knows when all sub-workflows have completed).
- **Does not write user-facing notifications.** DP-AS-04's UCO triggers fire off `as_journeys` transitions, not off LMO ledger rows.
- **Does not wrap or transform Anthropic errors** into friendly text. That transformation happens *downstream* of the Cell in the consuming workflow (or ends up in the DP-AS-04 notification's deterministic template based on `terminal_reason`).
- **Does not retry on gate failures.** A `max_tokens` truncation is not a transient error — retrying would just re-truncate. Retry lives at the Analysis Gate layer (DP-AS-06).

### 2.4 · Per-station timeout defaults

Codified in a Set-node lookup at the Cell's entry (or as caller-provided override). Aligns with the RDP §2 journey timeouts so that Craft Call + journey timeouts are consistent:

| station_id prefix | Default timeout_ms | Notes |
|---|---|---|
| `*.chat` | 90_000 | J3 |
| `*.chapter_analysis` | 180_000 | J2 |
| `*.full_analysis` | 1_200_000 | J1 (20 min) — ×2 above 80k words handled at the journey layer, not here |
| `*.phase_transition` | 480_000 | J5 |
| `*.eden_match` / `*.ivy_*` / `*.reid_*` | 120_000 | Ghostwriter defaults; refine on Ghostwriter station's own RDP |
| default | 120_000 | Explicit fallback so an unknown station doesn't run unbounded |

## 3 · Schema request to SysAdmin

The Cell writes to a new `lmo_ledger` table. Requesting SysAdmin apply this if it does not already exist in the estate (F-002/F-009 pattern — my grep confirms it's not in `sql/migrations/`, but the notifications lesson says grep is not authoritative). If a `lmo_ledger` or `craft_calls` or `llm_calls` table exists elsewhere in the live DB, point me at its shape and I adapt.

### 3.1 · Proposed shape

```sql
CREATE TABLE IF NOT EXISTS public.lmo_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Optional back-link to a journey; NULL for calls not journey-scoped
  -- (which shouldn't happen in production but might during Cell testing).
  journey_id uuid REFERENCES public.as_journeys(id) ON DELETE SET NULL,
  -- Station attribution, e.g. 'alex.chapter_analysis' or 'ivy.section_draft'.
  -- Free-text so new stations don't require a schema migration.
  station_id text NOT NULL,
  -- Anthropic model identifier as returned by the API (not what we asked for —
  -- helps catch declared-vs-actual model drift when Anthropic aliases).
  model text NOT NULL,
  -- Usage. All nullable because a failure before the model responded won't
  -- have any of these; ledger row still recorded for the failure event.
  input_tokens int,
  output_tokens int,
  cache_read_input_tokens int,
  cache_creation_input_tokens int,
  -- Anthropic stop_reason verbatim: end_turn / stop_sequence / tool_use /
  -- max_tokens / refusal / (or the value we saw if unrecognised).
  stop_reason text,
  -- Latency of the HTTP call itself, not the whole workflow.
  latency_ms int NOT NULL,
  -- Estimated USD cost for this call. Nullable when tokens unavailable
  -- (pre-response failure) or when we haven't priced the model yet.
  cost_estimate_usd numeric(10, 6),
  -- Terminal state of the call from the Cell's perspective.
  success boolean NOT NULL,
  -- On failure: the Cell's classification of what went wrong.
  -- Values in initial vocabulary:
  --   'truncated_at_max_tokens' | 'model_refused' | 'unknown_stop_reason:*'
  --   | 'http_4xx:<code>' | 'http_5xx:<code>' | 'timeout' | 'network_error'
  --   | 'validation_error:<field>'
  terminal_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lmo_ledger_journey_idx
  ON public.lmo_ledger (journey_id) WHERE journey_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lmo_ledger_station_time_idx
  ON public.lmo_ledger (station_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lmo_ledger_failures_idx
  ON public.lmo_ledger (created_at DESC) WHERE success = false;
```

### 3.2 · RLS

Service-role writes only (the Cell uses Postgres node with `Author Database` credential which bypasses PostgREST/RLS). Read policy: authors read ledger rows for their own manuscripts via `journey_id → as_journeys.manuscript_id → manuscripts.author_id` chain. Admin read-all. Consistent with the notifications RLS shape.

```sql
ALTER TABLE public.lmo_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors read ledger for own projects"
  ON public.lmo_ledger FOR SELECT TO authenticated
  USING (
    is_admin() OR journey_id IN (
      SELECT j.id FROM public.as_journeys j
      JOIN public.manuscripts m ON m.id = j.manuscript_id
      JOIN public.author_profiles ap ON ap.id = m.author_id
      WHERE ap.auth_user_id = auth.uid()
    )
  );
-- No authenticated INSERT/UPDATE/DELETE — Cell writes via service role only.
```

### 3.3 · Sensor request

Two candidate sensors for `production_control.health_check`:

- `inv_14_truncation_rate` (proposed, SysAdmin allocates the number): count of `success=false AND terminal_reason='truncated_at_max_tokens'` in the last 24 hours. AMBER at >0, RED at >5. Catches the exact class the Craft Call is designed to eliminate.
- `inv_15_call_without_ledger` (proposed): journey rows in a non-`submitted` state whose associated station-triggered work should have a matching `lmo_ledger` row and doesn't. Watches for callers that bypass the Cell.

Both left to SysAdmin's judgement on whether they add value at the register level.

## 4 · Exit criteria (E1-E4)

**E1 — Cell exists and is invocable.** A workflow named `Craft Call` exists in n8n, active, with a webhook trigger. A test invocation from another workflow via `Execute Workflow` succeeds with a real Anthropic response and returns `{ ok: true, text, usage, stop_reason, ledger_id }`.

**E2 — Journey and ledger writes happen.** A test invocation with a valid `journey_id` writes `status='processing'` to `as_journeys` (verified by `SELECT status FROM as_journeys WHERE id = <test id>`) AND creates exactly one `lmo_ledger` row for the call (verified by `SELECT count(*) FROM lmo_ledger WHERE journey_id = <test id>`).

**E3 — max_tokens gate fires deterministically.** A test invocation with `max_tokens: 10` on a system prompt that would normally produce a longer response returns `{ ok: false, terminal_reason: 'truncated_at_max_tokens' }`. The consuming workflow sees the corpse. No downstream node sees a "success" branch. `lmo_ledger` row has `success=false, terminal_reason='truncated_at_max_tokens', stop_reason='max_tokens'`.

**E4 — Raw error propagation.** A test invocation with a deliberately invalid model name (e.g. `claude-nonexistent-model`) returns `{ ok: false, error: { type: 'invalid_request_error', message: '...', raw: '<full response body>' }, terminal_reason: 'http_4xx:400' }`. The raw Anthropic error body appears in the corpse verbatim, not wrapped by n8n. `lmo_ledger` row has `success=false, terminal_reason='http_4xx:400'`.

## 5 · Sequencing

**Prerequisites (need before build):**
- SysAdmin confirms/applies `lmo_ledger` table + policies + sensors per §3
- Confirmation that a raw-HTTP Anthropic credential exists in the Writing project. The existing credentials list (from my 2026-07-24 sweep) shows `PzYKN7Dg419GPPGR` "AuthorsLab Anthropic Key" as `anthropicApi` type — that's the packaged-node credential. Need to verify whether a `httpHeaderAuth`-typed one containing the same key exists, or create/request one. See §7 open questions.

**Build sequence:**
1. Schema apply (SysAdmin).
2. HTTP credential confirmed / created (Paul).
3. Cell workflow authored in n8n via MCP; test invocation from a scratch caller workflow proves E1/E2/E3/E4.
4. First real consumer migration: `alex-chat` gets its Anthropic node swapped for `Execute Workflow → Craft Call` in the same visit as its DP-AS-02 journey instrumentation.
5. Roll out per opportunistic-when-touched policy across the remaining nine workflows.
6. `2.2 Alex Generate Summary Points` (already instrumented for DP-AS-02, six langchain provider nodes still on packaged Anthropic node) migrates when DP-AS-06 opens it for analysis gates + retry.

## 6 · What Craft Call is NOT

- **Not a replacement for `chainLlm`'s structural benefits** (prompt templating, per-item batching, retrieval integration). Where those matter, keep the `chainLlm` shape but the LM provider node is swapped for a Craft Call invocation via a Code or HTTP node. Where those don't matter, use Craft Call directly.
- **Not a general-purpose HTTP node.** Scope is specifically the Anthropic `/v1/messages` endpoint. Other AI providers (OpenAI, if we adopt one for cover generation etc.) would get their own Cell — the pattern is one Cell per model provider, not one per model.
- **Not app-side code.** The Cell lives entirely in n8n. Consuming code (in the AuthorsLab Next.js app) calls the CONSUMING WORKFLOW's webhook as it does today; the fact that consuming workflow now delegates to the Craft Call sub-workflow is a workflow-internal detail invisible to the app.
- **Not immutable.** The Cell will evolve — new stop_reason values, new beta headers, new pricing tables. Changes are register-tracked; every non-trivial revision creates a new version in n8n's version history with an evidence-based release note.

## 7 · Open questions before I build

1. **HTTP Anthropic credential availability.** The existing `PzYKN7Dg419GPPGR` "AuthorsLab Anthropic Key" is `anthropicApi` type (used by the packaged node). Does n8n permit invoking `POST https://api.anthropic.com/v1/messages` with an `anthropicApi` credential via an HTTP Request node's Predefined Credential option? Or do I need Paul to create an `httpHeaderAuth` credential specifically for the raw HTTP path?

2. **Cost table for `cost_estimate_usd`.** The Cell computes cost per call from `input_tokens × input_price + output_tokens × output_price - cache_read_input_tokens × cache_read_discount`. Prices vary per model (Sonnet 4/4.5, Sonnet 4.6, Haiku, Opus). Where does the Cell get the current price table — hardcoded in the Cell workflow (updated by revision) or a small DB table SysAdmin owns (`lmo_model_pricing`)? My preference: small DB table, so price updates don't require a Cell revision. If SysAdmin prefers hardcoded-in-Cell for v1, that's fine; move to DB table when it becomes a maintenance burden.

3. **Retry policy on 429 rate-limit.** My spec says "1 retry with exponential backoff (500ms → 2000ms)." Anthropic recommends retrying with jitter; my spec skips jitter for simplicity. Fine for v1?

## 8 · Findings-register hook

Any pattern discovered during rollout that generalises — a common way workflows misuse the Cell, a category of prompts that trips the `max_tokens` gate, a caching pattern that pays off — gets logged to `docs/sis/findings/` per the register convention.

One prospective finding already visible: **the Cell replaces the current pattern of "hardcode maxTokens in the langchain provider node and forget about it" with an explicit input.** Consumers may resist because it's more configuration per call. That's the correct trade-off, but expect pushback the first time a station author asks "why is my chat call failing gate when it never used to."

---

Standing by for SysAdmin's response to §3 (schema) and Paul's answer to §7 (HTTP credential availability). Cell build unblocks the moment both land.
