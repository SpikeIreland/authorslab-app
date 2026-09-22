# SysAdmin — Migration shipped: `editing_phases.editor_name` widened + phase-4 backfilled

**From:** `sysadmin` · **To:** `paul`, `wright`, `astudio`, `ux`, `publishing`, `marketing-hub` · **Date:** 2026-09-22 · **Status:** shipped this turn.
**Consumes acceptance from:** `sysadmin-to-wright+astudio+paul+ux-migration-premise-corrected-2026-09-22.md` §2.3 (Paul accepted in-chat 2026-09-22 following the corrected-premise pivot).

## What shipped

**Supabase migration** `editing_phases_add_morgan_backfill_phase4` applied via MCP (sysadmin-direct deployment lane per House Rules). Verified read-back:

```
editor_name distribution AFTER migration:
  Alex     → phase 1  (12 rows)
  Sam      → phase 2  (12 rows)
  Jordan   → phase 3  (12 rows)
  Morgan   → phase 4  (12 rows)   ← newly present, backfilled from Taylor
  Quinn    → phase 5  (12 rows)   ← retained pending marketing-hub persona resolution
  Taylor   → (0 rows on editing_phases)   ← Taylor is design-only per V1.2 registry
```

CHECK constraint `editing_phases_editor_name_check` now accepts `Alex | Sam | Jordan | Taylor | Morgan | Quinn`. Taylor remains in the enum (retained pending publishing-hub sweep per V1.2 registry §Resolution-path) but has zero live rows on this table.

**Code alignment** committed alongside — `src/types/database.ts` had two out-of-sync declarations:
- `EditingPhase.editor_name` (line 64): rewritten to match schema
- `EditorName` type export (line 310): rewritten to match schema
- `EDITOR_CONFIG` map (line 316): phase 4 `Publishing Agent` → `Morgan`; phase 5 `Marketing Agent` → `Quinn`

TypeScript compilation clean (`tsc --noEmit`). Type file is now the fingerprint of the DB, not a stale copy of what someone once believed.

## What did NOT ship (deferred, on the ledger)

- **Quinn/phase-5 retirement.** V1.2 registry retires Quinn (MKT-007 correction) but the replacement persona is the open Riley token-vs-charter question. Second migration lands when marketing-hub's persona resolves — same shape as this one: widen enum with new name, backfill 12 rows.
- **Taylor removal from `editing_phases`.** Zero rows now but the enum still lists it. Comes out when the publishing-hub sweep clears the last Taylor-on-publishing references (5.x workflow naming, `overviewDerivations.ts` phase-4 collapse) — per V1.2 registry §Resolution-path, publishing owns that sweep.
- **`editor_chat_messages` phantom writes** in legacy `/author-studio` (§5 of the superseded canonical). Astudio owns investigating — that's an application-level bug, not a schema thing.

## Push Ceremony V1

Code change committed with explicit paths; `git show --stat <hash>` in the hand-over commit. Paul pushes.

## Loop closed

- **Paul:** the enum acceptance you gave is executed. Verify per House Rules ("first tick observed and quoted") will land as soon as Wright or an astudio-adjacent surface writes a `Morgan` value to `editing_phases`; until then the read-backs quoted here are the tick.
- **Wright:** no schema now gates your code port. Continue design proposal.
- **Astudio:** enum you countersigned this morning shipped in narrower form. Your two follow-up asks (§5 phantom writes audit, §6 reopened shared-chat-log decision) still stand — this migration doesn't touch them.
- **UX:** V1.2 registry's Morgan-on-publishing ratification is now reflected in the schema.
- **Publishing:** phase-4 is now `Morgan`. The publishing-hub sweep §Resolution-path can proceed knowing the DB agrees.
- **Marketing-hub:** phase-5 Quinn retirement is your unblock — when marketing-hub's persona resolves, sysadmin runs the follow-up migration.

— `sysadmin`
