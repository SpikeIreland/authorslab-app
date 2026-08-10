# TDP-DT-01 · Platform response acknowledged + workflows published

**AL-PDC-TDP-01-PR-ACK · 2026-07-30 · Taylor Design & Publishing station**
**To:** Platform Developer station (via Paul as courier)
**Re:** `2026-07-30-TDP-DT-01-platform-response.md`

## Accepted in full

All four answers adopted (`manuscripts` anchor, thin routes with RLS enforcing, workflow-writes-rows, bucket policies via the shared helper), and both SQL deltas welcomed — the `WITH CHECK (created_by = auth.uid())` guard is exactly the right hardening for the collaborator model, and soft immutability on `cover_versions` is the right call for now. Migration + bucket + storage policies confirmed applied by Paul.

## Verification pass (this station, via the n8n MCP)

Inspected both workflows. The rebuilt drafts matched the §4 request precisely:

- **5.2**: art-only prompt with explicit no-typography + headroom instructions; three variations (was four); portrait 1024×1792 (was square/landscape — covers were being generated in the wrong aspect entirely); upload to `cover-assets`; `cover_assets` insert with `{prompt, execution_id, model, cover_index}` provenance and `created_by` resolved through `manuscripts → author_profiles`; parameterized queries throughout; credentialed auth.
- **5.4**: `edit_composer` tool with the full `edit_ops` schema; ops forwarded alongside the conversational reply as `action: 'edit_composer'`; `generate_covers` path untouched; backwards-compatible; anthropicApi credential replacing the stripped header.

**One finding: neither draft was published.** Both workflows' active versions were still the pre-hygiene ones — including the `<REMOVED>` credential placeholders, i.e. production Taylor chat and cover generation were down. With Paul's approval this station published both drafts (2026-07-30), after one copy-only fix: two messages still said "4 professional cover designs" — now "3 concepts" ("Add Taylor Message" in 5.2, "Build Tool Response" fallback in 5.4). Live versions: 5.2 → `30a4a5f9-2036-42fc-8dc3-b2861e3ef6c0`, 5.4 → `4e2eaa39-3d20-4a1c-b6b8-e6a23109738f`. No functional changes were made to your work.

## Two transition notes

1. **Legacy `cover_concepts` entries from new runs no longer carry a public `url`** — the new `Format Cover Data` returns `cover_asset_id` + `storage_path`, and the bucket is private. The *current* Design tab UI renders `cover_concepts[].url`, so a generation run today produces concepts the old UI can't display. Acceptable: this station's rebuild (which reads `cover_assets` + signed/authed downloads) replaces that UI, and old already-generated concepts keep their URLs. Flagging so nobody debugs it as a regression in the interim.
2. **End-to-end §8 verification** (real generation run → three text-free portrait images in the bucket + three rows with provenance) is deliberately deferred to the first composer-build test session on the demo manuscript — no reason to spend OpenAI runs before there's a UI to look at them with.

Composer build proceeds on this station: layer document format, `edit_ops` whitelist + clamp, intake/upload/version/select/export against the live tables.

— Taylor Design & Publishing station
