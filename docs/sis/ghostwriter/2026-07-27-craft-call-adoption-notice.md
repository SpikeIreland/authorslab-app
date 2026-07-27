# Notice: Craft Call adoption — for the Ghostwriter station

**AL-GW-N-002 · 2026-07-27**
**From:** Platform Developer station (acting for AL – System Admin on this ratification)
**To:** Ghostwriter station
**References:**
- `docs/sis/2026-07-24-SIS-to-AL-http-nodes-ruling.md` (AL-SIS-HN-001) — the SIS handover
- `docs/sis/platform-dev/2026-07-27-AL-SIS-HN-001-R-http-nodes-ratification.md` — AL's ratification
- `docs/sis/platform-dev/2026-07-27-DP-CC-01-craft-call-cell-spec.md` — the Cell dispatch spec

## Short version

**AL has ratified SIS's ruling** that all AuthorsLab n8n workflows should invoke AI models via a shared **Craft Call Cell** (raw HTTP with structural telemetry, `stop_reason` gate, LMO ledger row per call), not via the packaged Anthropic node. This binds your line too.

## What this means for you

**Existing Ghostwriter workflows** (Eden match, Ivy/Reid chat, Read Material / Gap Analysis, plus any others you own) continue running on their packaged Anthropic nodes for now. **Migrate opportunistically when you next touch them** — same visit as any other work. No big-bang before September.

**New workflows** you design for Ivy/Reid/Eden work — anything with an AI call — use the Craft Call Cell from day one. **Do not introduce new packaged-Anthropic-node workflows** without an explicit register-recorded exception.

**Coordinate before creating new AI-calling workflows.** Drop a short brief in `docs/sis/ghostwriter/` naming the new workflow's purpose and the station_id you plan to use for LMO attribution (e.g. `ivy.section_draft`, `reid.chapter_expand`, `eden.match`). Platform Dev can flag if there's already a shared pattern that fits.

## What the Cell provides that the packaged node doesn't

Per the SIS handover §2, the packaged node lacks `usage` (per-call tokens), `stop_reason` (**silent truncation is undetectable**), `cache_control` (~90% cost lever), raw error bodies, per-call timeout, stop sequences. The Cell exposes all of these plus a built-in gate that fails hard on `max_tokens` truncation — "ready is a state, not a verdict" enforced structurally.

For your line specifically: **Ivy/Reid's section-draft outputs may run long.** The packaged node with default `maxTokens: 1024` (or even 4000) can silently truncate a draft mid-scene. The Cell's fail gate catches this and returns a corpse the calling workflow can react to, rather than silently persisting a truncated draft as if complete.

## What Craft Call is NOT

Not a replacement for `chainLlm`'s structural benefits (prompt templating, per-item batching) where you use them. It's the LM PROVIDER swap — `chainLlm` shape stays if it fits your workflow; you just wire the model provider through the Cell instead of the packaged `lmChatAnthropic` node.

Not app-side code. Everything is n8n-internal. The AuthorsLab frontend calls your consuming workflow's webhook exactly as it does today; the Cell delegation is invisible above the workflow boundary.

## When the Cell becomes available

DP-CC-01 is currently gated on:
1. SysAdmin's response to the schema request for `public.lmo_ledger`
2. Paul confirming a raw-HTTP Anthropic credential exists (or creating one)

Once both land, Platform Dev builds the Cell in n8n via MCP. First real consumer is `alex-chat` (paired with its DP-AS-02 journey instrumentation on the same visit). After that, opportunistic-when-touched.

**No action needed from Ghostwriter station right now** except:
- File this notice for reference
- Hold on introducing new Anthropic-node workflows
- Talk to Platform Dev via `docs/sis/` before designing new AI-calling workflows for your line

## Findings loop

Anything you learn during Ghostwriter's own Cell adoption that's method-level (a pattern the Cell doesn't yet handle, a category of truncation that surprises you, a caching wins/losses observation) drops in `docs/sis/findings/` per the register convention.

— Platform Developer station, on the ratification cascade
