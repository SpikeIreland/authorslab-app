# F-013 · Write-tail test pollution on Cell-adoption migrations

**Finding candidate · 2026-07-27**
**Surfaced during:** DP-CC-03 (alex-chapter-analysis migration test)
**Filed by:** Platform Developer station
**Awaiting invariant number allocation from SysAdmin.**

## What happened

During synthetic verification of the alex-chapter-analysis Cell adoption, `execute_workflow` fired the workflow end-to-end against a real manuscript ("The Signal and the Shadow", `14057c5e-cdab-435a-b489-aa4858a6925b`). The workflow's designed happy-path succeeded: Cell returned `ok:true`, Extract Initial Thoughts parsed 2 observations from Alex's JSON, and the write tail fired as it should — inserting 2 new `manuscript_issues` rows and setting `manuscripts.full_analysis_completed_at = NOW()`.

Nothing malfunctioned. The system did exactly what it was built to do. But the "test" was against real production data.

## Why it matters

DP-CC-02 (alex-chat) surfaced this same architecture without triggering it: alex-chat's DB writes for the chat message happen **app-side**, not workflow-side, so synthetic webhook tests are inert on the manuscript. I assumed the pattern generalised, and it doesn't. Every remaining migration in the Wave 1 backlog has a workflow-side write tail:

- `alex-full-manuscript-analysis`, `sam-full-manuscript-analysis`, `jordan-full-manuscript-analysis` — write `manuscripts.{alex,sam,jordan}_initial_thoughts`, `full_analysis_key_points`, `manuscript_summary`, `status`
- `alex-chapter-analysis`, `sam-chapter-analysis`, `jordan-chapter-analysis` — write `manuscript_issues`, mutate `manuscripts.status`
- `generate-chapter-summaries`, `generate-summary-points` — write `chapters.chapter_summary` and `manuscripts.full_analysis_key_points`
- `generate-manuscript-version` — writes `manuscript_versions` (immutable snapshot rows)

If any of these are tested synthetically against a real manuscript, they mutate that manuscript in ways that are either surgically cleanable (like the 2 issue rows deleted post-DP-CC-03) or not (e.g. an immutable manuscript_versions snapshot is designed not to be deleted).

## What's the failure mode, precisely

**Not a code defect.** No workflow behaviour needs to change. The failure mode is a **method mismatch** — the test methodology I brought from DP-CC-01 (Cell tests) and DP-CC-02 (chat) assumed workflow tests are side-effect-free at the manuscript level, and that assumption is wrong for write-tail workflows.

## Corrective action taken

Per Paul's direction 2026-07-27:

1. **UI-based testing on a throwaway manuscript.** Remaining Wave 1 migrations are verified via the Author Studio UI against a manuscript designated for disposal — Paul deletes outputs after each round.
2. **Synthetic tests retained for read-only workflows and Cell-level tests.** They remain the fastest path where side effects are contained (chat webhooks that only compute a reply; the Cell itself, which only writes to `lmo_ledger` + reads pricing).
3. **New pattern for future workflow classes:** any migration whose workflow includes a DB-write tail against user-owned tables gets UI-tested against a throwaway manuscript before signing off; synthetic tests may be used earlier for wire-up debugging as long as the run doesn't commit (which for these workflows means either not running the full happy path, or accepting the pollution and cleaning up after).

## Cleanup

- Two test issue rows deleted from `manuscript_issues` (`aafa472e-d858-4dc5-92aa-dec9e4d6a291`, `07d183e4-6c41-484b-8dd1-f0dda7b42bd5`).
- `manuscripts.full_analysis_completed_at` shift on "The Signal and the Shadow" left in place — restoring blind would replace an unknown prior value with `NULL`, which is a worse state than a slightly-shifted timestamp. Author-invisible field.

## Method-level lesson (for the SIS findings register)

**"Corpse on every path" applies to test corpses too.** When a test's happy path has side effects on production data, the test itself is a small dispatch, and it needs its own containment strategy (throwaway target, isolated environment, or explicit cleanup). Treating synthetic tests as free is the source of this drift.

The Cell was designed under this principle for its LMO ledger writes (test rows are identifiable by `station_id LIKE 'test.%'` — see DP-CC-01 completion §6). The next-layer consumer migrations weren't; that's the actual gap.

— Platform Developer station
