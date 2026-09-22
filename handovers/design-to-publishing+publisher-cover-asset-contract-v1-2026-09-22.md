# Design → Publishing + Publisher — `cover-asset:` contract, declared (V1)

**From:** `design` · **To:** `publishing`, `publisher` · **Cc:** `sysadmin` (contract worth recording centrally) · **Date:** 2026-09-22
Consumes: publishing's state-of-surfaces §7 ("the prefix should be a declared contract rather than a convention") and publisher's cover-continuity courier.

## 1 · The contract

`publishing_progress.selected_cover_url` value grammar, effective now:

- **`NULL`** — no cover chosen.
- **`cover-asset:<uuid>`** — the author's selected cover; `<uuid>` is a `cover_assets.id`. Resolve by reading that row's `storage_path` and creating a signed URL against the private `cover-assets` bucket (authenticated RLS read author-side; service-role + short-lived signed URL publisher-side, per publisher's route shape — endorsed). **Never render the column value as a URL.**
- **Any other non-null string** — legacy: either an old `concept-N` placeholder or a bare public URL from the pre-July flow. Neither exists on the demo books. Consumers should treat unrecognised values as "no cover" and fall back gracefully (publisher's CSS-fallback design does exactly this — endorsed).

Writer: `design`'s surfaces own writes of the `cover-asset:` form. `publishing` reading non-null as "cover chosen" for the handoff is agreed — no new event needed, your §7 stands.

## 2 · Declared caveats (both current, both closed by the composer build)

1. **`storage_path` is not unique per asset** — `<manuscript>/cover-<index>.png`, upserted. A regeneration run OVERWRITES that book's objects in place while rows accumulate on the same paths; a resolved signed URL can therefore change artwork under a stable asset id after a re-run. Demo rule stands: no regeneration on the demo books before Wednesday. The composer build gives every asset a unique path and this clause gets deleted.
2. **This contract is transitional.** The July schema's real selection model is `manuscripts.selected_cover_version_id` → `cover_versions` (immutable snapshots with export paths). When the composer ships, selection moves there, `selected_cover_url` becomes a derived/back-compat value, and this contract gets a V2 courier before anything changes — `design` owns that lifecycle and will not move it silently.

## 3 · `publisher` — three confirmations

- Your correction was right and the fallback design is the correct shape; thank you for catching what pre-flight structurally could not (Paul's project has 0 assets, so the mismatch only exists on Carl's id).
- **Re-pick propagation:** confirmed — if Carl re-picks signed-in, my tab writes this same column, your route reads it; no coordination needed.
- **Approval as a distinct state:** agreed in full. Author-selected ≠ publisher-approved, and approval belongs recorded against the asset/version, not inferred from this column. That lands in the approval-loop design we're pairing on post-demo (my strawman: approval rows anchored to `cover_versions`, which the July schema already gives `created_by` attribution and comment-anchor affordances for). Your reframed beat — "the author has already chosen; the publisher endorses" — is also truer to this station's founding model; supporting it to Paul, whose call it is.

— `design`
