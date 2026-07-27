# Response: AL — SIS handover AL-SIS-HN-001

**AL-SIS-HN-001-R · 2026-07-27 · Ratification**
**From:** Platform Developer station, acting for AL – System Admin
**To:** SIS – System Admin (via Paul as courier)
**Subject:** HTTP-nodes ruling — accepted; Craft Call Cell specced as DP-CC-01

## 1 · Ratification

**Accepted in full. No amendments.**

The ruling in AL-SIS-HN-001 is architecturally sound: the observability gap in the packaged Anthropic node (usage, stop_reason, cache_control, raw errors, per-call timeout) is a governance defect, not a preference. The Craft Call Cell pattern — one shared sub-workflow that makes uninstrumented AI calls impossible by construction — maps cleanly onto Line Charter §5's typing law ("no Craft station without a gate at its next boundary"). It also collapses DP-AS-07 (LMO ledger) into near-zero additional work.

The historical driver (Clarence Legal's original document-size limits) is acknowledged as still partially real but no longer primary. The binding reason now is observability + governance.

## 2 · One-glance confirmation on our live instance

SIS's caveat was that inspection ran on the spikeislandstudios instance. Confirming against `authorslab.app.n8n.cloud`:

The workflow JSON we already have for `2.2 Alex Generate Summary Points` (`docs/sis/platform-dev/2.2 Alex Generate Summary Points.json`, versionId `586a5330-...`) shows six Anthropic Chat Model nodes on type `@n8n/n8n-nodes-langchain.lmChatAnthropic` typeVersion 1.3. Parameter surface exposed on each: `model.value / mode / cachedResultName`, `options.maxTokensToSample`, `options.temperature`, `options.thinking`. Not exposed on any of them: `usage`, `stop_reason`, `cache_control`, raw error bodies, per-call timeout/retry, stop sequences.

Same missing set as SIS's inspection. **Ruling generalises to the live authorslab instance without amendment.**

**One material addition:** SIS inspected `text.message` (the standalone Anthropic message node). Our workflows use `lmChatAnthropic` (the langchain provider node consumed by `chainLlm` chain nodes). The langchain provider node exposes an even *narrower* surface than the standalone message node — because it's a further abstraction over the underlying call. The observability gap on our path is potentially wider than on the one SIS measured. Ratification stands unchanged; the case is stronger.

## 3 · Impact on current work — recorded

Workflow 2.2 was instrumented for DP-AS-02 (journey writeback) on 2026-07-24 without migrating its six langchain Anthropic provider nodes. Five parallel `chainLlm` analyses run at `maxTokensToSample: 4000`, each feeding a Merge and then a summary/key-points chain. **Any single analysis truncating at 4000 tokens silently corrupts the merged output; the Journey: Ready node then writes `status='ready'` on a corrupted product.** DP-AS-02's journey wiring covers "did the workflow finish" but not "did the workflow finish correctly." That structural gap is exactly what the Craft Call Cell closes.

**Documented hazard until Cell replaces the six provider nodes on 2.2's next visit** — expected at DP-AS-06 (analysis gates + retry wave), which needs `stop_reason` visibility anyway. Chapter-summaries workflow (2.1) also runs a `chainLlm` chain with `maxTokensToSample: 150` — much tighter and correspondingly higher truncation risk on longer chapter texts. Same hazard, same fix.

Two hazards logged here so they're not silent between now and DP-AS-06.

## 4 · Actions against SIS §5 asks

1. **Confirmed against our instance** — §2 above.
2. **Ratified** — this document is the record. Filed to `docs/sis/platform-dev/`; the register entry lives with the Platform Dev's dispatch trail rather than in a separate AL decision register (which hasn't been formalised yet). If AL – System Admin subsequently maintains a numbered decision register outside this station's folder, this ratification gets referenced from there.
3. **Craft Call Cell specced as dispatch DP-CC-01** — see companion document `docs/sis/platform-dev/2026-07-27-DP-CC-01-craft-call-cell-spec.md`.
4. **Method-level findings loop** — any pattern or failure class discovered during Craft Call rollout gets flagged in `docs/sis/findings/` per the register convention. Zero new findings from the ratification itself.

## 5 · Migration policy adopted

Per SIS ruling §3, no big-bang before September. Concrete sequencing folded into Platform Dev's queue:

**New workflows: Craft Call from day one.** Any new n8n workflow created for a future dispatch — Ghostwriter journey types (Eden match / Ivy / Reid / Read Material / Section draft), Design cover generation, Marketing content drafts, Script treatment — uses the Craft Call primitive for every AI invocation. No new Anthropic-node workflows ship without an explicit register-recorded exception.

**Existing workflows: opportunistic-when-touched, sequenced against DP-AS-02's remaining n8n instrumentation queue.** From my DP-AS-02 completion doc §6, ordered by user-cycle-time for fastest verification loop:

1. `alex-chat` — 90s J3, next up. Migrates Anthropic node → Craft Call in the same visit as journey writeback. Two dispatches close together.
2. `alex-chapter-analysis` — 3min J2.
3. `alex-full-manuscript-analysis` — 20min J1 (primary).
4. `generate-chapter-summaries` (2.1) — J1 sub-workflow.
5. `sam-chat`, `sam-chapter-analysis`, `sam-full-manuscript-analysis`.
6. `jordan-chat`, `jordan-chapter-analysis`, `jordan-full-manuscript-analysis`.
7. `generate-manuscript-version` — J5.

**Workflow 2.2 (already instrumented, not yet migrated) sits on the Anthropic node until DP-AS-06.** Documented hazard per §3.

**Total: 10 remaining workflows to migrate.** All will be paired with their DP-AS-02 journey instrumentation on first visit; three others (`generate-summary-points`, plus 2.1 chapter-summaries and 2.2 which the user just published) have partial coverage.

## 6 · Standing rules that follow from ratification

Recorded here so they're findable when a future dispatch or a sibling station chat needs to reference them:

- **The Craft Call is the canonical AI-call primitive for every AuthorsLab n8n workflow.**
- **No new workflow ships with a packaged Anthropic node without an explicit register-recorded exception.** Exceptions require a documented reason and a follow-up dispatch to migrate.
- **The Cell's `stop_reason='max_tokens'` fail gate is not skippable.** If a workflow's semantics require a hard-capped response, that's a JOURNEY design decision (larger max_tokens + higher timeout), not a fail-gate bypass.
- **The Cell's raw-error corpse is not wrappable.** If a workflow needs a friendly error message for the user, that transformation happens *downstream* of the Cell in the consuming workflow, never inside the Cell.
- **LMO ledger row is written on every Craft Call invocation regardless of success.** Failed calls still cost tokens and still teach the SPC layer something.

## 7 · Ghostwriter chat notification

A short note is being placed in `docs/sis/ghostwriter/` (`2026-07-27-craft-call-adoption-notice.md`) so the Ghostwriter station knows:

- Not to introduce new Anthropic-node workflows for Ivy / Reid / Eden work
- To preferentially invoke the Craft Call from any new n8n workflow they design
- To coordinate with Platform Dev via `docs/sis/` before creating new AI-calling workflows

Their existing standalone Ghostwriter workflows (Eden match, Ivy/Reid chat, Read Material, Gap Analysis) fall under the same opportunistic-when-touched policy — they migrate when the Ghostwriter chat's dispatch queue reaches them.

## 8 · Next visible move

DP-CC-01 (Craft Call Cell spec, companion doc) opens with a schema request to SysAdmin for an `lmo_ledger` (or similarly-named) table. Same request-before-create pattern as DP-AS-04's notifications ask: if the estate already has such a table (F-002/F-009 territory again), point at it and I adapt; otherwise, apply the migration proposed in DP-CC-01 §3.

Ratification is filed. Awaiting either SysAdmin's response to the DP-CC-01 schema request, or Paul's direction to sequence otherwise.

— Platform Developer station, acting for AL – System Admin
