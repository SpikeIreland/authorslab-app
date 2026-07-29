# DP-CC-06 · alex-full-manuscript-analysis — plan

**AL-PDC-DPCC06-P · 2026-07-28**
**Filed by:** Platform Developer station
**Status:** PLAN. Bigger migration than DP-CC-02 through DP-CC-05 combined. Awaiting Paul's greenlight before touching production workflow `oMujQsfgWI1LWD4z`.

## 1 · Discovery — what this workflow actually is

**Workflow `oMujQsfgWI1LWD4z` "2.3 Alex Full Manuscript Analysis"**. Active. 30 nodes. Webhook path `/alex-full-manuscript-analysis`.

Structure — one linear spine with a **five-branch fanout** for parallel analyses:

```
Webhook
  → Fetch Manuscript → Fetch Chapters → Manuscript Processing
    ├── Structural Analysis   (chainLlm + Anthropic Chat Model,  2000 tokens, temp 0.8)
    ├── Character Analysis    (chainLlm + Anthropic Chat Model1, 2000 tokens, temp 0.8)
    ├── Plot Development      (chainLlm + Anthropic Chat Model4, 2000 tokens, temp 0.8)
    ├── Pacing & Flow         (chainLlm + Anthropic Chat Model5, 2000 tokens, temp 0.8)
    └── Thematic Analysis     (chainLlm + Anthropic Chat Model2, 2000 tokens, temp 0.8)
      ↓
      Merge
       ↓
      Final Synthesis (chainLlm + Anthropic Chat Model3, 8000 tokens, temp 0.7)
       ↓
      Store Analysis → Report Formatting → PDF Generator → HTTP upload
       ↓
      PDF Filename Setup → Send PDF URL → Mark Report Complete → Wait
       ↓
      Fetch Author Email → Combine PDF and Email Data → Send email → Success Response → Respond to Webhook
```

Six LLM calls per invocation. Every call uses `claude-sonnet-4-20250514` (Sonnet 4, no pricing row) via the langchain pattern (`@n8n/n8n-nodes-langchain.chainLlm` + `@n8n/n8n-nodes-langchain.lmChatAnthropic` subnodes). Terminal writes to `manuscripts.full_analysis_text`, `manuscripts.full_analysis_completed_at`, `manuscripts.report_pdf_url`, `editing_phases.report_pdf_url`, `editing_phases.ai_read_completed_at`. Emails a PDF to the author on completion.

## 2 · The `journey_id` interaction question — needs resolution before touching this

App-side `author-studio/page.tsx` line 947-981 fires **three workflows in parallel** with the same `journey_id`:

1. `alexFullAnalysis` — this workflow. Marked in app-code as "**primary; owns journey_id writeback**".
2. `alexGenerateSummary` — workflow 2.2, which I already instrumented with `Journey: Received` + `Journey: Ready` in DP-AS-02 back on 2026-07-24.
3. `alexGenerateChapterSummaries` — workflow 2.1 (`r9xbJrw22k5vb3zs`), not yet touched by DP-CC-* work.

If all three UPDATE the same `as_journeys` row, terminal state depends on ordering — race conditions, but idempotent-ish (final state is 'ready' if any of the three succeeds last; 'failed' if the last-to-run failed). Not corrupt, but sloppy.

**Two options, both need your call before I proceed:**

- **A. Strict primary ownership.** Only `alexFullAnalysis` writes journey state. I retrofit workflow 2.2 to REMOVE its Journey: Received/Ready nodes (or make them conditional on being called standalone rather than as sub-workflow). Cleaner semantics; small extra work.
- **B. Best-effort convergent updates.** All three write, last-write-wins. Ledger rows correctly attribute per-call cost via distinct `station_id` values. Journey state is racy but recovers idempotently. Simpler, less rework.

Recommend **A**. Clean contract > convenient sloppiness. But it means an extra 5-minute edit to workflow 2.2 as part of this dispatch (removing its journey nodes).

## 3 · Migration scope — three options, in ascending order of surgery

### Option 3a — Journey wiring only, defer Cell adoption

Just add Journey: Received / Ready / Failed to this workflow. Leave the six langchain LLM calls alone.

- **Pros:** small, safe, matches Sonnet 4's existing behaviour, unlocks the journey lifecycle immediately.
- **Cons:** No ledger rows for the 6 LLM calls (no station telemetry, no cost visibility on the primary demo path). Silent truncation of any of the 5 parallel analyses at 2000 tokens still corrupts merged Final Synthesis input. Doesn't close the observability gap the whole DP-CC-* wave exists to close.
- **Nodes changed:** +3 (Received, Ready, Failed).

### Option 3b — Migrate Final Synthesis only, journey wiring, leave parallel analyses on langchain

Cell adoption for the biggest single call (Final Synthesis, 8000 tokens where max_tokens truncation would kill the whole report). Leave the five 2000-token parallel analyses on langchain for now.

- **Pros:** Focuses on the highest-stakes call. Meaningfully reduces truncation risk on the biggest output. Still much smaller than 3c.
- **Cons:** Five out of six LLM calls remain uninstrumented. Cost visibility partial. Truncation risk on the parallels (2000 tokens cap) still real.
- **Nodes changed:** +8 (3 journey + Build Prompt + Cell + Handle Cell Return + IF; -2 for removing 1 chainLlm + 1 lmChatAnthropic).

### Option 3c — Full migration: all six LLM calls to the Cell, journey wiring

The complete DP-CC-* pattern applied. Every LLM call becomes an Execute Sub-workflow to the Cell. Six ledger rows per run, one per station (`alex.full_analysis.structural`, `.character`, `.plot`, `.pacing`, `.thematic`, `.final_synthesis`). No truncation blind spots. Full station telemetry.

- **Pros:** Closes the observability gap on the primary demo path. Each of the 6 calls gets its own cost line, so we know exactly where the money goes on a full-manuscript run. Every call gets the max_tokens fail gate.
- **Cons:** Big surgery. Roughly 30 addNode/removeNode/setNodeParameter operations. Estimated ~10-15 net nodes added. Risk of edge cases in the five parallel branches. Longer test cycle.
- **Nodes changed:** ~+15 net (5 × Build Prompt + 5 × Call Cell + 5 × Handle Cell Return + 3 journey nodes; -12 for removing 6 chainLlm + 6 lmChatAnthropic subnodes).

## 4 · Two more decisions inside 3b/3c

**Q1: Model bump?** Sonnet 4 → Sonnet 4.5 (matches other migrations, pricing table has it, cost tracking works). Recommend YES per prior migrations.

**Q2: max_tokens tuning for Final Synthesis?** Currently 8000. Anthropic's docs cap Sonnet 4.5 at higher limits, but 8000 is generous for this task. Recommend keep at 8000; the ledger will show if we're pushing the ceiling.

## 5 · Sequencing

1. Paul greenlights **3a**, **3b**, or **3c** (and A vs B for journey ownership).
2. I apply the migration via `update_workflow` atomic transaction. If 3c, I might split into two commits (parallel analyses first, then Final Synthesis) to stay under the 100-operation limit — cheaper to debug if something breaks.
3. If **A** on journey ownership: separate small edit removes Journey: Received/Ready from workflow 2.2.
4. Paul publishes.
5. Paul UI-tests on the throwaway manuscript (this is a WRITE-TAIL workflow — F-013 methodology applies). Full manuscript analysis takes 8-15 minutes end-to-end.
6. I query the ledger for the appropriate `station_id LIKE 'alex.full_analysis%'` rows + verify journey lifecycle.
7. File combined completion (DP-CC-04 sam/jordan chat + DP-CC-05 sam/jordan chapter-analysis + DP-CC-06 this).

## 6 · My recommendation

**Go 3c + A.** The whole point of the Cell wave is closing observability gaps on the primary paths. Doing 3a would be governance theatre — journey lifecycle without the actual telemetry. 3b is a compromise that leaves 5 of 6 LLM calls uninstrumented on the flagship demo workflow. 3c is the correct answer if we mean the SIS ruling; 3a/3b are hedge positions.

**A** on ownership is a small extra tax now that saves confusion later. The alternative (B) locks in a race we'll want to fix eventually anyway.

## 7 · What Paul needs to decide

**Q1:** 3a, 3b, or 3c? (Recommend 3c.)

**Q2:** A or B on journey ownership? (Recommend A — remove Journey: Received/Ready from workflow 2.2 as part of this dispatch.)

**Q3:** Model bump Sonnet 4 → Sonnet 4.5 across all 6 calls? (Recommend YES.)

**Q4:** Split the 3c commit into two atomic transactions (parallel analyses first, then Final Synthesis) for easier rollback if something breaks, or ship all in one big transaction?

— Platform Developer station
