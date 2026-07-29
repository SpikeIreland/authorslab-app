# DP-CC-01 · E1 test — blocked on postgres credential

**AL-PDC-DPCC01-BL · 2026-07-27**
**Filed by:** Platform Developer station
**Status:** BLOCKED — awaiting Paul to verify postgres credential

## What ran

Test runner workflow `oEge1ekDMZOGn26G` ("DP-CC-01 Test Runner (E1/E3/E4)") executed once, execution `262466`.

## What we learned

**The Anthropic call itself worked** (Cell nodes 1-5 executed successfully). Failure landed at node 6, `Lookup Pricing` (Postgres):

```
NodeOperationError: password authentication failed for user "postgres"
Failed query: SELECT ... FROM public.lmo_model_pricing WHERE $1 LIKE ...
Node: Lookup Pricing
Credential: LzOLBpaxWz7JUDoN "Author Database" (postgres)
```

**This means the design is sound** — trigger, validation, HTTP call to Anthropic, and response parsing all fired correctly. The Anthropic API accepted the predefined `anthropicApi` credential path (§7 Q1 ratified in action). It's just that the postgres credential the Cell inherited is stale or misconfigured.

Because the Cell errored at the Lookup Pricing step (before the ledger write), **no ledger row was written**. So E1 partial: the Cell reached the pricing lookup then died. E3 and E4 didn't get to run (E1 errored the whole sub-workflow, which halted the runner). Zero real ledger evidence collected. Zero Anthropic tokens billed beyond one small round-trip on E1 (~25 tokens = ~0.0002 USD).

## Diagnosis note

The `Author Database` postgres credential (`LzOLBpaxWz7JUDoN`) is stored in the Writing project as type `postgres`. Workflow 2.2 (`G5WgEHKUocdFT5vZ` — Alex Generate Summary Points) has seven Postgres nodes (Journey: Received / Ready, Fetch Manuscript, Fetch Chapters, Store Summary, Store Key Points, Mark Analysis Complete) that we KNOW have been running since DP-AS-02 instrumentation went in. Their credential binding isn't visible via MCP (n8n strips credentials from `get_workflow_details` output — a general n8n MCP behaviour).

Two possibilities:

1. **Workflow 2.2 uses a different postgres credential** that works, and our Cell inherited a broken one. Fix: rebind Lookup Pricing + Write Ledger Row in the Cell to whichever credential 2.2 uses.
2. **Workflow 2.2 uses `Author Database` too** and its password has since gone stale (Supabase password rotation, IPv6 issue, pooler URL change, etc.). Fix: update `Author Database`'s password in n8n UI; both workflows benefit.

## What Paul needs to do

Open n8n UI → workflow `2.2 Alex Generate Summary Points` → click any Postgres node (e.g. `Journey: Received`) → note which credential is selected in the dropdown, and its name.

- **If it says "Author Database":** the credential is likely stale. Go to Credentials → Author Database → re-enter the current Supabase postgres password. Common gotcha: Supabase transaction pooler requires username `postgres.itlkncjiifbgvmvuejgm` not just `postgres`.
- **If it says something else** (e.g. a different "Postgres account" or the Supabase Service Key): tell me the credential name so I can rebind the Cell's two Postgres nodes to it.

Alternatively, if Paul prefers we future-proof this: switch the Cell's two DB nodes from `n8n-nodes-base.postgres` to `n8n-nodes-base.supabase` using the `Supabase account` credential (`4adh02SBLFujwAdt` in Writing project). The Supabase node uses PostgREST + service role key, so no direct-Postgres password auth path, no pooler config to break. Slightly less SQL-expressive (row-based rather than raw executeQuery) but much more resilient. This would be a follow-up dispatch (DP-CC-01.a) if we want to keep the current Cell as-is once the credential is fixed.

## Cell design status

**Not affected.** The Cell workflow's SDK, node graph, expressions, and JSON payload construction all validated and executed correctly up through the failure point. The Anthropic call worked. Ledger insert query is standing by, ready to fire the moment pricing lookup succeeds.

## Next step, once Paul reports back

1. If credential fix is a simple password re-entry: Paul updates it → I re-run test `oEge1ekDMZOGn26G` → E1/E3/E4 verify → file completion doc.
2. If a different credential: I use `setNodeCredential` operations to rebind Lookup Pricing + Write Ledger Row → re-run → verify → file completion doc.
3. If we're pivoting to the Supabase node: I redesign those two nodes and re-publish Cell as v1.1, re-run tests, file completion.

— Platform Developer station
