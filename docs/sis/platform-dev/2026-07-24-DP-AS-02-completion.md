# DP-AS-02 · Completion Evidence · Journey wiring (app side)

**AL-PDC-DP02-C · 2026-07-24 · Platform Developer station**
**Dispatch:** AL-DSP-001 · DP-AS-02
**Plan reference:** `docs/sis/platform-dev/2026-07-24-DP-AS-02-plan.md`

**Status:** app side complete and TypeScript-clean. E1 evidence in §1 below. E2 and E3 require at least one n8n workflow to be instrumented with journey writeback — pending Paul's deployment. Method-of-verification for E2 and E3 in §2.

---

## 1 · E1 evidence — every studio-initiated webhook is preceded by a journey row

**Machine-verifiable via grep. Counts reconcile: 8 journey starts covering 11 webhook fires** (three of the fires are sub-workflows of one action, per Paul's Q1 answer of "one journey per user action").

### Webhook fires (11 total across two files)

`src/app/author-studio/page.tsx` — 10:

| Line | Webhook | Journey source |
|---|---|---|
| 646 | `WEBHOOKS.alexGenerateSummary` (fresh-analysis) | startJourney L636 |
| 657 | `WEBHOOKS.alexGenerateChapterSummaries` (fresh-analysis) | startJourney L636 (same journey) |
| 947 | `WEBHOOKS.alexFullAnalysis` (initial trigger) | startJourney L935 |
| 958 | `WEBHOOKS.alexGenerateSummary` (initial trigger) | startJourney L935 (same journey) |
| 969 | `WEBHOOKS.alexGenerateChapterSummaries` (initial trigger) | startJourney L935 (same journey) |
| 2089 | `chatWebhook` (editor chat, phase-switched) | startJourney L2062 |
| 2300 | `WEBHOOKS.samFullAnalysis` (phase 1→2) | startJourney L2294 |
| 2322 | `WEBHOOKS.jordanFullAnalysis` (phase 2→3) | startJourney L2316 |
| 2463 | `analysisWebhook` (chapter analysis, phase-switched) | startJourney L2456 |
| 3309 | `N8N_WEBHOOKS.generateManuscriptVersion` (phase 3 complete button) | startJourney L3303 |

`src/app/phase-transition/page.tsx` — 1:

| Line | Webhook | Journey source |
|---|---|---|
| 127 | `N8N_WEBHOOKS.generateManuscriptVersion` (transition page) | startJourney L114 |

### Silent-failure catches remaining

```
grep -B1 "\.catch(() => console" src/app/author-studio/page.tsx src/app/phase-transition/page.tsx
→ 0 matches
```

Every previous `.catch(() => console.log('✅ webhook triggered'))` on a webhook fire has been removed. Errors bubble to the outer try/catch, which routes to an honest failed-state UI message (via `terminalUserMessage()` from `src/lib/as_journeys.ts`).

### Journey types wired per RDP §2

- `full_analysis`: 5 fire points (call sites a, b, c, d, e, f) using 4 journey rows (initial trigger = 1, fresh analysis = 1, sam-on-transition = 1, jordan-on-transition = 1)
- `chapter_analysis`: 1 fire point (site g), phase-switched → 1 journey per invocation
- `editor_chat`: 1 fire point (site h), phase-switched → 1 journey per invocation
- `phase_transition`: 2 fire points (sites i, j) → 1 journey per invocation

### Modelling call-out (per Paul's Q1)

The initial trigger and fresh-analysis flows each fire multiple parallel sub-workflows against a single journey row. The primary workflow (alexFullAnalysis for the initial trigger; generateSummaryPoints for fresh analysis) owns writeback. Sub-workflows share the same `journey_id` in their payload and may write intermediate signals, but the journey's terminal state is the primary workflow's responsibility. This matches RDP §2 J1's model of one journey with internal steps.

---

## 2 · E2 evidence — kill-test (pending n8n deployment)

The plan called for a kill-test: deactivate a workflow, fire the action, verify the UI reaches an honest failed/reaped state within `timeout_at + 5min` and the journey row holds the corpse with reason.

The app side is ready:

- `pollJourney` (`src/lib/as_journeys.ts` L122–172) returns a terminal state or a client-side safety timeout (`reaper did not close row`).
- All poll consumers (`pollForAnalysisCompletion`, `pollForChapterIssues`, chat inline handler) render an honest failed-state message via `terminalUserMessage()` when the terminal is not `ready`/`replied`/`complete`.
- The pg_cron reaper (`production_control.reap_stalled_journeys`, applied 2026-07-24) will mark a stalled row `reaped` with reason `timeout: no worker completion before timeout_at` within 5 minutes of `timeout_at`.

**Verification protocol** (to run once at least one n8n workflow is instrumented per §3):

1. Instrument one workflow (recommend `alex-chat` first — 90s timeout means fast kill-test cycle).
2. In n8n, deactivate the workflow.
3. In the deployed app (redesign preview), fire a chat message on a test manuscript.
4. Observe: UI shows "The chat took longer than expected. It's been logged and we're looking into it — please try again in a moment." within ~90s (client-safety-timeout path) or by ~5.5 min (reaper path).
5. Query DB: `select status, terminal_reason, submitted_at, completed_at from as_journeys order by submitted_at desc limit 1` → row shows `reaped` with the reaper's message.
6. Re-activate the workflow; happy-path test (E3).

---

## 3 · E3 evidence — happy path (pending n8n instrumentation)

Same instrumentation requirement as E2. Verification protocol:

1. On an instrumented workflow, fire the corresponding action on a test manuscript.
2. Poll the journey row directly: `select status from as_journeys where id = <that row>` should transition `submitted → received → ready` over the workflow's runtime.
3. UI reaches the same success state it did before DP-AS-02.
4. Code review of the poll path in `pollJourney` (`src/lib/as_journeys.ts` L122–172) — only `.select()` calls, no `.update()`/`.insert()`/`.delete()` on the journey row. All consumers do their one-off content read from domain tables only after `pollJourney` returns a terminal state.

**Pg audit for stronger evidence** (optional, SysAdmin territory) — a temporary audit trigger on `as_journeys` for the duration of a happy-path run would show zero row-writes from `authenticated` role during polling.

---

## 4 · Files touched

**New:**
- `src/lib/as_journeys.ts` — startJourney, pollJourney, terminalUserMessage, timeout constants

**Modified:**
- `src/app/author-studio/page.tsx` — 6 edits: import; triggerFullAnalysis; pollForAnalysisCompletion; handleFreshAnalysis inline; analyzeChapter; pollForChapterIssues; chat handler (`handleChatSubmit`); Sam/Jordan transition triggers; phase-3-complete button
- `src/app/phase-transition/page.tsx` — 2 edits: import; version generation call

**Untouched:**
- `src/lib/n8n-config.ts` — no URL or webhook name changes required. Only the payload body of each POST gains a `journey_id` field.
- `chapters.phase_N_approved_by` writes — that is DP-AS-05 defence-in-depth, separately dispatched.
- UCO notifications — that is DP-AS-04, separately dispatched.

---

## 5 · TypeScript + lint

```
npx tsc --noEmit → 0 errors
npx eslint src/lib/as_journeys.ts src/app/author-studio/page.tsx src/app/phase-transition/page.tsx
  → 0 errors, 15 warnings — all pre-existing in the legacy studio file
    (unused vars, React hook exhaustive-deps, <img> vs Next Image), none from DP-AS-02
```

---

## 6 · Deployment notes

**Backward compatibility with un-instrumented workflows:** any n8n workflow that ships without journey writeback continues to run its business logic. Its journey row remains `submitted` until `timeout_at`, at which point the reaper closes it as `reaped`. The UI will surface an honest "hit a snag" message rather than a spinner. This means the app-side DP-AS-02 changes can ship to the redesign branch preview immediately; individual workflows can be instrumented and un-instrumented as Paul schedules deployment.

**Recommended n8n instrumentation sequence** (from plan §6, ordered by user impact per Alex-first sequencing):

1. `alex-chat` — 90s timeout, fastest verification cycle
2. `alex-chapter-analysis` — 3min timeout, most-fired
3. `alex-full-manuscript-analysis` — 20min timeout, longest-running
4. `generate-summary-points` — sub-workflow of J1 (shares journey_id with alexFullAnalysis)
5. `generate-chapter-summaries` — sub-workflow of J1
6. `sam-chat`, `sam-chapter-analysis`, `sam-full-manuscript-analysis` — parallel to Alex
7. `jordan-chat`, `jordan-chapter-analysis`, `jordan-full-manuscript-analysis` — parallel to Alex
8. `generate-manuscript-version` — J5, 8min timeout

For each workflow, n8n needs to:

- On entry: `UPDATE public.as_journeys SET status='received', received_at=now() WHERE id = {{ $json.journey_id }}` (service role)
- On terminal success: `UPDATE ... SET status = 'ready' (or 'replied' for editor_chat, 'complete' for phase_transition), completed_at=now() WHERE id = {{ $json.journey_id }}`
- On terminal failure: `UPDATE ... SET status='failed', terminal_reason='<short string>', completed_at=now() WHERE id = {{ $json.journey_id }}`

---

## 7 · What comes next

- Push these changes to the redesign branch (as usual `git add . && git commit && git push`) — the app side is ready for E2/E3 verification once n8n starts instrumenting.
- Paul deploys n8n workflows per §6 sequencing.
- E2/E3 evidence gets appended to this doc (or filed as a follow-up completion doc) once verified end-to-end against a live instrumented workflow.
- Then the queue advances to DP-AS-04 (UCO minimum — notifications ledger + instant ack + J1-ready/failed notices) per the dispatch sequencing.

**Findings register:** none from this dispatch. The n8n-side instrumentation lift is real but not method-level — it's what the RDP already anticipated.
