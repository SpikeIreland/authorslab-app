# DP-CC-02 · alex-chat Cell adoption + editor_chat journey wiring — plan

**AL-PDC-DPCC02-P · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** PLAN. Awaiting Paul's greenlight before mutating production workflow `CXTvanAIrKIscZuY`.
**References:**
- Ratification `2026-07-27-AL-SIS-HN-001-R-http-nodes-ratification.md` §5.1 — alex-chat is first migration target
- Cell completion `2026-07-27-DP-CC-01-v1-completion.md` — Cell verified E1/E3/E4
- Adoption notice `docs/sis/ghostwriter/2026-07-27-craft-call-adoption-notice.md`

## 1 · Discovery — where alex-chat actually sits

**n8n workflow `2.5 Alex Chat`** (`CXTvanAIrKIscZuY`, active, webhook `/alex-chat`). 7 nodes:

```
Webhook → Extract Parameters → Fetch Manuscript Context → Build Alex Prompt
       → Call Anthropic API (raw HTTP, predefined anthropicApi credential)
       → Process Response → Respond to Webhook
```

**Two useful surprises versus what I assumed going in:**

1. **It's already on raw HTTP, not the packaged Anthropic node.** Someone (Clarence Legal era) already migrated the transport off `lmChatAnthropic`. So this is not a "swap the packaged node" migration — it's an "adopt the Cell contract" migration. Same shape, less scope.
2. **The app already calls `startJourney({ journey_type: 'editor_chat', ... })` and passes `journey_id` in the webhook body** (`author-studio/page.tsx` line 2063-2088, DP-AS-02 work). But the workflow's Extract Parameters node **doesn't extract journey_id**, so it's dropped on the floor. Journey: Received / Journey: Ready never fire. The chat journey has been silently uninstrumented since DP-AS-02 shipped.

Net: this dispatch is smaller than expected. App side is already correct. Only the n8n workflow needs edits.

## 2 · Two gaps to close

### Gap 1 — Journey wiring (DP-AS-02 completion for editor_chat)

Symptom today: every alex-chat request creates a journey row via `startJourney` client-side (status=`pending`), but nothing UPDATEs it to `received`, `ready`, or `failed`. The reaper (pg_cron every 5 min) will eventually mark it timed-out after 90s regardless of whether Alex successfully replied or not. UI shows "processing" until reaper bites, then jumps to timeout. Wrong signal every time.

**Fix:** Add three nodes.
- **Journey: Received** — Postgres executeQuery, UPDATE `as_journeys` SET `status='processing', received_at=now()` WHERE `journey_id=$1`. Placed immediately after Extract Parameters. Only fires if `journey_id` present (IF gate skipping the Journey UPDATE keeps the workflow backward-compatible with any old callers that don't pass it).
- **Journey: Ready** — Postgres UPDATE, on the success path right before Respond to Webhook. Sets `status='ready', completed_at=now(), terminal_user_message='Reply ready'`.
- **Journey: Failed** — Postgres UPDATE, on the failure path. Sets `status='failed', completed_at=now(), terminal_reason=<from Cell>, terminal_user_message='I had trouble responding. Please try again.'`.

### Gap 2 — Cell adoption (DP-CC-01 first consumer)

Symptom today: `Call Anthropic API` is a bare HTTP request. No `stop_reason` gate → a 2048-token max response can silently truncate a reply mid-sentence and the app will render the partial as if complete. No LMO ledger row → no per-call cost, no truncation sensor coverage on this station. No structural corpse on API failure → `Process Response` returns a canned apology string as if it were a successful reply, silencing the real error.

**Fix:** Swap `Call Anthropic API` + `Process Response` for two new nodes.
- **Call Craft Call Cell** — Execute Sub-workflow node, `workflowId: crXhG5caNVHBmglo`, mode=`once`, passes: `journey_id` (from Extract), `station_id='alex.chat'`, `model_requested='claude-sonnet-4-5-20250929'`, `system=Build Alex Prompt.systemPrompt`, `messages=[{role:'user', content:Build Alex Prompt.userPrompt}]`, `max_tokens=2048`, `temperature=0.7`, `cache_control=null`, `stop_sequences=[]`.
- **Handle Cell Return** — Code node. Two branches by `$json.ok`:
  - `ok:true`: build `{success: true, response: $json.content, alexResponse: $json.content, chapterNumber, isNoteDiscussion, timestamp}` (same shape the current Process Response emits) → goes to Journey: Ready → Respond to Webhook.
  - `ok:false`: build `{success: false, response: <fallback>, alexResponse: <fallback>, chapterNumber, isNoteDiscussion, timestamp, cell_terminal_reason: $json.terminal_reason}` — fallback string can distinguish max_tokens (`"That response ran long — could you ask a more focused question?"`) from HTTP error (`"I'm having trouble connecting. Let me help based on what I see in your manuscript."`) → goes to Journey: Failed → Respond to Webhook.

App-side `data.response` (line 2097) reads correctly in both cases. Backward compatible.

## 3 · Model bump — deliberate

Current workflow calls `claude-sonnet-4-20250514` (Sonnet 4). This model has **no pricing row** in `lmo_model_pricing` — every alex-chat call would land with `cost_estimate_usd = NULL` (lawful per SysAdmin's "no guessed cost" rule, but not what we want on a station we're actively cost-tracking).

Bumping to `claude-sonnet-4-5-20250929` (Sonnet 4.5) — which IS priced, and which the Author Studio analysis workflows already use. Downside: subtle behavioural difference for existing users mid-conversation. Upside: cost tracking on day one, no `NULL` rows to explain later.

**Recommend bumping in this dispatch.** If Paul prefers, I can keep Sonnet 4 and add a Sonnet 4 pricing row instead — but Sonnet 4 is being deprecated, so bumping to 4.5 is the future-safe move.

## 4 · What this dispatch does NOT do (recorded, deferred)

- **cache_control on manuscript context.** Every chat turn re-sends the manuscript summary, chapter summaries, and current chapter content. That's a prime prompt-caching candidate — 90% savings on repeated context. Skipped in v1 to keep the migration scope tight; opens as a follow-up (DP-CC-02.a) once ledger data confirms cache-hit ratios.
- **Fix the SQL injection hazard in Fetch Manuscript Context.** `WHERE m.id = '{{ $json.manuscriptId }}'` uses string interpolation. If `manuscriptId` ever comes from an untrusted source, this is exploitable. Not a Cell-adoption concern; belongs in a hygiene dispatch.
- **Retry policy.** Cell v1 has no auto-retry (deferred to Cell v1.1). alex-chat's 90s user-facing wait tolerates 0-1 failures fine; retry gets built when we have ledger evidence of 429/529 rates.
- **The sam-chat / jordan-chat / editor variants.** Same pattern; queued next in ratification §5.

## 5 · Sequencing

1. Paul greenlights this plan.
2. I apply the workflow edits via `update_workflow` MCP (single atomic transaction with `addNode`, `addConnection`, `removeConnection`, `removeNode`, `updateNodeParameters` operations).
3. Paul publishes the new workflow version.
4. I run an end-to-end test: fire a real chat message via the Author Studio UI (Paul's browser) OR fire the alex-chat webhook directly via `execute_workflow` with a mock payload including a real `journey_id` I create in Supabase first.
5. Verify: `as_journeys` row transitions pending → processing → ready (or failed); `lmo_ledger` row written with `station_id='alex.chat'`, real token counts, cost; `editor_chat_messages` row from the app-side persistence still writes correctly (unchanged).
6. I file completion evidence.

## 6 · What Paul needs to decide

**Q1:** Model bump — Sonnet 4 → Sonnet 4.5? (Recommend: YES.)

**Q2:** Test method — do you want to test via the UI (fire a chat message in your browser end-to-end) OR should I test via `execute_workflow` with a synthetic payload? UI test is more realistic; synthetic is faster and doesn't require you to open the app.

**Q3:** Should I proceed with the edits when you greenlight, or do you want to review the specific `update_workflow` operations first (e.g. as a JSON diff)?

— Platform Developer station
