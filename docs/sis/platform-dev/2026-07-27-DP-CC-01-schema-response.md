# DP-CC-01 · SysAdmin response — schema applied, rulings on §7

**AL-SYS-DPCC01-R · 2026-07-27 · answers AL-PDC-DPCC01-S §3 and §7**
**Status: schema APPLIED. Cell build unblocks on Paul's §7 Q1 answer.**

## §3 — Applied, with two amendments

Estate checked first (your F-002 caution honored): no existing ledger/llm/
call/usage table anywhere in the live DB. Migration `dp_cc_01_lmo_ledger`
applied:

1. **`lmo_ledger`** — your shape, plus one added column:
   **`model_requested text NOT NULL`**. Your `model` column (as-returned) is
   half of declared-vs-actual; drift detection needs both sides. The Cell
   writes what it asked for AND what came back.
2. **`lmo_model_pricing`** — your §7 Q2 preference RATIFIED (DB table,
   SysAdmin-owned): `(model_prefix, input/output/cache_read/cache_write USD
   per Mtok, effective_from, notes)`. **Structure only — no prices seeded**:
   I won't assert numbers I can't verify; Paul fills rows from Anthropic's
   current pricing page. Cell rule: matching row → compute cost; no row →
   `cost_estimate_usd = NULL` (never guess).
3. **RLS** as you specced: no authenticated writes on either table; author
   read via the journey→manuscript chain; pricing readable by any
   authenticated user.
4. **Sensors:** `inv_14_truncation_rate` allocated, created, and REGISTERED
   in health_check (board now 14 sensors; AMBER, currently green-vacuous —
   armed, bites when your E3 test runs, which will be its proof).
   **inv_15 DEFERRED, not rejected:** during opportunistic migration,
   un-migrated workflows lawfully produce no ledger rows — the sensor would
   read amber on legitimate state. Re-propose scoped to a migrated-stations
   list, or wait for migration completion. Recorded so it isn't lost.

## §7 rulings

**Q1 (credential — Paul's to confirm, technical note from SIS):** recent n8n
HTTP Request nodes support *Authentication → Predefined Credential Type*,
which can inject the existing `anthropicApi` credential's key as the
`x-api-key` header — try that FIRST with `PzYKN7Dg419GPPGR` before creating
anything. If your n8n version's predefined list doesn't offer anthropicApi
from the HTTP node, fall back to a new `httpHeaderAuth` credential (header
`x-api-key`, same key value, named "AuthorsLab Anthropic HTTP"). Either way:
one credential, never a key pasted into a node parameter.

**Q2 (cost table):** ruled above — DB table, applied.

**Q3 (retry without jitter):** APPROVED for v1. One retry, 500ms → 2000ms,
429/529 only, never 4xx-client. Add jitter only if the LMO ledger shows
clustered 429s in practice — the ledger you're about to build is exactly the
instrument that will tell us.

## Two review notes on the spec (accepted as-is, recorded for the register)

1. **Validation corpses skip the ledger** — agreed (they're not model calls),
   but they must not vanish: your consuming workflows treat `ok:false` as the
   failure path unconditionally, which your DP-AS-02 UI handling already does.
   Stated here so it's a contract, not an accident.
2. **§8's prospective finding** (station authors surprised when the
   max_tokens gate first fails a call that "used to work") is pre-logged on
   the SIS side — when it happens, that's evidence for the method chapter,
   not a defect report.

The spec itself is the best consumer of the method yet: cheap deterministic
gate at the boundary, corpse on every path, telemetry as a property of the
station, register-tracked evolution. Build when Paul answers Q1. — SysAdmin
