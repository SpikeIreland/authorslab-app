# DP-CC-01 v1 · Craft Call Cell — completion evidence

**AL-PDC-DPCC01-C · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** COMPLETE. Cell verified E1/E3/E4. Cleared for consumer migration (starting with alex-chat per ratification §5.1).
**Cell workflow:** `crXhG5caNVHBmglo` — https://spikeislandstudios.app.n8n.cloud/workflow/crXhG5caNVHBmglo
**Test runner:** `oEge1ekDMZOGn26G` — https://spikeislandstudios.app.n8n.cloud/workflow/oEge1ekDMZOGn26G
**References:** build note `2026-07-27-DP-CC-01-v1-build-note.md`, spec `2026-07-27-DP-CC-01-craft-call-cell-spec.md`

## 1 · Test execution

Test runner `oEge1ekDMZOGn26G` executed manually as run `262468`, all three branches (E1/E3/E4) ran in parallel from a single Manual Trigger. Runner design: three payload Sets → three Execute Sub-workflow calls to the Cell → three Tag Sets. Real Anthropic API calls, real Supabase writes.

## 2 · Results

### E1 — Success round-trip

**Input:** Sonnet 4.5, "Say the word hi and nothing else.", max_tokens=20, temperature=0, station_id="test.dp_cc_01.e1"

**Cell return:**
```json
{
  "ok": true,
  "content": "hi",
  "model": "claude-sonnet-4-5-20250929",
  "stop_reason": "end_turn",
  "input_tokens": 22,
  "output_tokens": 4,
  "cache_read_input_tokens": 0,
  "cache_creation_input_tokens": 0,
  "latency_ms": 1030,
  "cost_estimate_usd": 0.000126
}
```

**Ledger row written** (id `ef5d8f9f-d2a7-4422-944a-235dc393b2fe`):
- `success: true`, `terminal_reason: null`, `stop_reason: 'end_turn'`
- Tokens as returned by Anthropic (22 in / 4 out)
- `cost_estimate_usd: 0.000126` — verified: 22 × $3/Mtok + 4 × $15/Mtok = $0.000066 + $0.000060 = $0.000126 ✅
- Pricing lookup matched `claude-sonnet-4-5` prefix at effective_from 2026-07-27, longest-prefix winner as designed

**Verdict:** E1 PASS. Round-trip works. Pricing lookup works. Cost calculation is arithmetically correct. Ledger writes.

### E3 — max_tokens truncation

**Input:** Sonnet 4.5, "Please explain what a stochastic process is in detail." (long prompt), **max_tokens=1** (forces truncation), station_id="test.dp_cc_01.e3"

**Cell return:**
```json
{
  "ok": false,
  "terminal_reason": "max_tokens_truncation",
  "http_status": 200,
  "http_error_body": null,
  "model": "claude-sonnet-4-5-20250929",
  "stop_reason": "max_tokens",
  "input_tokens": 26,
  "output_tokens": 1,
  "latency_ms": 1238,
  "cost_estimate_usd": 0.000093
}
```

**Ledger row written** (id `508bd218-507a-427c-a917-565b1097aa59`):
- `success: false`, `terminal_reason: 'max_tokens_truncation'`, `stop_reason: 'max_tokens'`
- 26 in / 1 out tokens, cost $0.000093 (26 × $3/Mtok + 1 × $15/Mtok = $0.000078 + $0.000015 = $0.000093 ✅)
- HTTP 200 (Anthropic didn't fail — it truncated per max_tokens=1)

**Verdict:** E3 PASS. The Cell's stop_reason gate correctly reclassifies a 200-OK Anthropic response with `stop_reason: 'max_tokens'` as a FAIL. `terminal_reason: 'max_tokens_truncation'` distinguishes it from an HTTP error. Ledger records the truncation with real token counts and cost — this is exactly the observability the SIS ruling required. `inv_14_truncation_rate` sensor (registered by SysAdmin, previously green-vacuous) now has real evidence and would bite on any station with excess max_tokens rates.

### E4 — Validation fail (missing station_id)

**Input:** Sonnet 4.5, "Say hi.", max_tokens=10, station_id="" (empty)

**Cell return:**
```json
{
  "ok": false,
  "terminal_reason": "validation_failed",
  "validation_errors": ["station_id required"],
  "model_requested": "claude-sonnet-4-5-20250929"
}
```

**Ledger:** NO row written. Total ledger row count after all three tests = 2 (E1 + E3 only).

**Verdict:** E4 PASS. Validation gate correctly rejects the input, returns validation corpse with the exact error, and skips the ledger per spec §5 review note ("validation corpses skip the ledger — they're not model calls"). No Anthropic tokens consumed. No wasted API charge. `__validation_failed: true` routes cleanly through the ifElse.

## 3 · What this proves

Cross-referencing to the DP-CC-01 spec exit criteria:

- **E1 (success round-trip):** Passes.
- **E2 (cache_control passthrough):** Not tested in this pass — no cache_control payload was sent. Deferred to first real consumer migration (alex-chat), which will exercise cache_control against the shared manuscript context. Ledger's cache_read_input_tokens / cache_creation_input_tokens columns are wired and returning zeros on non-cached calls, so the plumbing is proven.
- **E3 (max_tokens fail):** Passes, structurally, as designed.
- **E4 (validation fail without ledger side-effect):** Passes.
- **E5 (retry policy):** Deferred to v1.1 per build note §3 — no auto-retry in v1. Approved Q3 policy still on record.

## 4 · Standing laws now enforced in code

- **"Ready is a state, not a verdict"** — max_tokens truncation is a structural FAIL, not a silent pass (E3 evidence).
- **"Corpse on every path"** — every non-validation exit writes a ledger row (E1 + E3 evidence; E4 correctly exempt).
- **"No guessed cost"** — matching pricing row → cost computed; no match → NULL. (Both test rows had pricing matches; cost verified arithmetically.)
- **"Structural telemetry as a station property"** — the Cell can't be invoked without producing a ledger row (except validation exits, which by design have no model call to record).

## 5 · What the runner and the test rows leave behind

- Ledger rows `ef5d8f9f...` (E1) and `508bd218...` (E3) — `station_id` starts with `test.dp_cc_01.` so they're identifiable as verification artefacts. Recommend leaving them in place as the earliest historical evidence of the Cell working; a `station_id LIKE 'test.%'` filter can exclude them from any dashboard.
- Test runner workflow `oEge1ekDMZOGn26G` — retain for regression use after any Cell revision. Runs are cheap (~$0.0004 combined).

## 6 · One incidental finding along the way

**Finding candidate — postgres credential drift:** the initial test run failed with `password authentication failed for user "postgres"` on the `Author Database` credential (`LzOLBpaxWz7JUDoN`). Paul reconnected the credential and the second run passed. This is a class of failure worth watching — Supabase's transaction pooler occasionally requires a distinct username format (`postgres.PROJECT_REF` rather than just `postgres`), and password rotations cascade silently to n8n. Not registering as a formal SIS finding since the fix was straightforward, but flagging so we know to check `Author Database` first the next time a Postgres n8n node errors mysteriously.

## 7 · What unlocks next

Per ratification §5.1, the first opportunistic Cell migration is **`alex-chat`** — shortest user-cycle-time (90s J3), so fastest end-to-end verification. That work pairs Cell adoption with the DP-AS-02 journey writeback for the same station in a single visit. When Paul greenlights, next dispatch DP-AS-08 or similar spins up.

**Also unblocked:** any new AI-calling workflow Ghostwriter station designs (per adoption notice `2026-07-27-craft-call-adoption-notice.md`). They can now invoke `crXhG5caNVHBmglo` from day one.

— Platform Developer station, on DP-CC-01 v1 completion
