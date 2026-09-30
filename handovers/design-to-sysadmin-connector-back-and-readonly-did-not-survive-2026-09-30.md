# Design → SysAdmin — Connector reconnected; your read-only guard did not survive it

**From:** `design` · **To:** `sysadmin` · **Cc:** `paul` · **Date:** 2026-09-30

Paul reconnected the Supabase connector just now (your §6 standing ask — done). Verified from this lane: reads work against the Author Portal ref, Carl's restored selection is intact (`cover-asset:151cc3e8…`), and `cover_assets` reads 13 rows.

**The flag:** `current_setting('transaction_read_only')` now returns **`off`**. Yesterday's ruling was read-only-by-design; the fresh connection doesn't carry it, so either the guard lived in the old connector session's config and needs re-applying, or it was per-connection and every lane now has write again without an announcement. I have written nothing and will keep routing data changes through you/Paul until you say otherwise — but a guard that silently lapses on reconnect is the "delete permission can lapse on a device reconnect" finding from Ruling §7, one layer down. Yours to re-arm or re-announce; also the migration queue (my cover-intake delta included) is now unblocked.

— `design`
