# Handover Note: SIS – System Admin → AL – System Admin

**AL-SIS-HN-001 · 2026-07-24 · Subject: ruling requested — Anthropic nodes vs
raw HTTP nodes for all AI calls** · Courier: Paul · Self-contained per protocol.

## 1 · The question (from Paul)

AuthorsLab's n8n workflows still use the packaged Anthropic nodes. Clarence
migrated everything to raw HTTP nodes (reason half-remembered: document-size
limits). Does the original reason still bind, and does the stochastic method
add a stronger one?

## 2 · Evidence (inspected 2026-07-24, n8n Anthropic node v1, `text.message`)

The node's full parameter surface was pulled via the n8n API. What it exposes:
model picker, messages, system, maxTokens (**default 1,024**), temperature,
topP, topK, attachments, web search, `simplify` (**default true**).

What it does NOT expose — each item mapped to what it breaks:

| Missing | What it breaks |
|---|---|
| `usage` metadata (input/output tokens) — stripped by simplify, langchain-shaped otherwise | LMO cost ledger (dispatch D-AS-07) · SPC feeds · per-call cost visibility |
| `stop_reason` | **Silent truncation is undetectable** — an analysis cut off at max_tokens looks complete. This is "ready is a state, not a verdict" built into a node. With the 1,024 default, it's a truncation machine for our workloads |
| `cache_control` (prompt caching) | Major cost lever lost — AuthorsLab's per-chapter calls repeat the same manuscript context |
| Raw API error bodies (429/529/400 detail) | Journey `terminal_reason` gets a wrapped error, not the truth |
| Per-call timeout/retry surface | Journey timeout discipline (RDP §2) can't be tuned per station |
| Stop sequences, beta headers, new API features | Locked to the node's release cadence, not Anthropic's |

**Caveat:** inspected on the spikeislandstudios instance (SIS's MCP cannot
reach the live authorslab account). Almost certainly the same n8n cloud
version — confirm with one glance at any Anthropic node's options panel in
your instance before ratifying.

## 3 · Recommended ruling

**Standardize on raw HTTP — but as one shared sub-workflow, not scattered
HTTP nodes.** Build a single **"Craft Call" Cell** every workflow invokes for
every AI call:

- **In:** model, system, messages, max_tokens, journey_id (+ optional
  cache_control blocks).
- **Does:** journey status write → HTTP call to the Anthropic API with
  explicit timeout + retry policy → LMO ledger row (model, input/output
  tokens, stop_reason, cost) → built-in gate: `stop_reason = 'max_tokens'`
  is a FAIL, never a silent pass → returns content, or a corpse carrying the
  raw API error.
- **Why a Cell:** it makes the Craft-station telemetry contract *structural*
  — an uninstrumented AI call becomes impossible to write, which is the
  taxonomy's law ("telemetry is a property of the station type") enforced by
  construction. It also collapses D-AS-07 (LMO ledger) into near-zero
  additional work.

**Migration policy (no big-bang before September):** every NEW workflow uses
the Craft Call from day one; existing Anthropic-node workflows convert
opportunistically WHEN TOUCHED. Convenient timing: the DP-AS-02 n8n
instrumentation pass (journey writebacks, sequenced alex-chat first in
`docs/sis/platform-dev/2026-07-24-DP-AS-02-completion.md` §6) already opens
every Author Studio workflow — same visit, both changes.

## 4 · Historical answer, for the record

The Clarence migration's original driver (size limits on large documents)
still partially applies (attachment/body handling), but it is no longer the
main reason. The binding reason now is observability and governance: the
packaged node is a motor without an encoder — it turns, but nothing can
instrument it.

## 5 · What SIS asks of AL – System Admin

1. Confirm the node inspection against your own instance (one glance).
2. Ratify (or amend) the ruling and record it in your decision register.
3. Spec the Craft Call Cell as a numbered dispatch in your environment; its
   exit criteria should include the max_tokens-fail gate and the ledger row.
4. Anything you learn that's method-level (patterns, failure classes), send
   back via Paul — the SIS findings register absorbs it.

Reference documents available to your chats in `authorslab-app/docs/sis/`:
Line Charter V1 · Client Decisions D1–D10 · PFD Rev C · Author Studio I/O
Schedule · Route Definition Pack (journey timeouts §2, gate register §3) ·
Wave 1 dispatches and their completion/acceptance papers in `platform-dev/`.

— SIS – System Admin
