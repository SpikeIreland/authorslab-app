# SysAdmin → Paul + AStudio + Publisher — "On your shelf" was near-empty: clone-completeness gap, fixed

**From:** `sysadmin` · **To:** `paul` · **cc:** `astudio`, `publisher`, `ux` · **Date:** 2026-09-23 · **Status:** shipped (data-only; no code change).

## The symptom

Paul, reviewing `https://authorslab.ai/projects/4d0025e6-…` for the demo, saw **one item** on "On your shelf". Carl reported the same on his copy of the same book.

## Root cause — the trilogy clone carried the book but not the collateral

The shelf (`/api/projects/[id]/overview` §Shelf documents) builds from five sources. Audit across all Veil copies:

| Source | Yahoo original `7509f8bb` | Carl `c037e098` | Paul `4d0025e6` |
|---|---|---|---|
| `manuscripts.original_upload_url` | ✗ | ✗ | ✗ |
| `manuscripts.report_pdf_url` | ✓ | ✗ | ✗ |
| `editing_phases[].report_pdf_url` | 3 | **0** | **0** |
| `manuscript_versions` approved_snapshot | 4 rows / 3 phases | **0** | **0** |
| `publishing_progress.selected_cover_url` | ✓ | ✓ | ✓ |

**The earlier deep-clone copied `manuscripts`, `chapters` and `editing_phases` rows, but not the report URLs on those phase rows, not the manuscript-level report, and not the `manuscript_versions` snapshots.** Both demo copies were rendering exactly one shelf item — the cover, which came from `publishing_progress` and was the only thing the clone happened to carry.

Nothing was lost. The PDFs were always in storage; the pointers to them just never reached the copies.

## The fix — applied via MCP (sysadmin-direct lane), three statements

1. `manuscripts.report_pdf_url` copied from the Yahoo original → both demo copies (guarded `WHERE report_pdf_url IS NULL`). **2 rows.**
2. `editing_phases.report_pdf_url` copied, matched on `phase_number`, phases 1–3 → both copies. **6 rows** (Alex, Sam, Jordan × 2).
3. `manuscript_versions` `approved_snapshot` rows copied with `gen_random_uuid()`, de-duplicated to one per phase (the original carries a duplicate phase-3 row we deliberately did not propagate), `NOT EXISTS` guard for idempotency. **6 rows** (phases 1–3 × 2).

**The URLs are portable.** They are public Supabase Storage objects (`/storage/v1/object/public/manuscript-reports/…`) — no signing, no expiry, no per-account gate. The storage path retains the original manuscript's id as a folder prefix, which is cosmetically untidy but functionally invisible and correct to leave alone for the demo.

## Verified state after the fix

```
email                       title                  ms_report  phase_reports  snapshot_phases  covers
carlglyons@yahoo.com        The Veil and the Flame  true           3               3             1
carl@spikeisland.tv         The Veil and the Flame  true           3               3             1   ← demo
paul.lyons@authorslab.ai    The Veil and the Flame  true           3               3             1   ← demo
```

All three copies are now identical. Expected shelf render — **7 items, up from 1**:

1. Alex's Developmental Assessment · PDF
2. Sam's Line Notes · PDF
3. Jordan's Copy Notes · PDF
4. Developmental draft · Alex · 47,144 words
5. Line-edited draft · Sam · 47,144 words
6. Copy-edited draft · Jordan · 47,144 words
7. Cover · Image

The manuscript-level report does **not** add an eighth entry — the route suppresses it when phase 1 has its own report (`overview/route.ts:228`). Correct behaviour, no duplicate.

## The Signal and the Shadow — checked, no fix needed

Carl's in-edit book shows **2 documents**, and that is truthful:

```
phase 1  Alex    complete  report ✓
phase 2  Sam     active    report ✓
phase 3  Jordan  pending   —
phase 4  Morgan  pending   —
phase 5  Quinn   pending   —
```

A book in the middle of its line edit legitimately has two documents. Deliberately not padded — the shelf is telling the truth about where the book is, which is the story Carl is narrating.

## One gap NOT fixed, flagged for `astudio`

`manuscripts.original_upload_url` is **NULL on every manuscript in the estate, including the Yahoo original.** So "Your uploaded manuscript" has never rendered on any shelf, for any book, ever. This is not a clone gap — it's an upload-pipeline gap: the n8n onboarding webhook writes the manuscript row but never persists the URL of the file the author uploaded.

Not demo-blocking (nobody misses a row they've never seen). Worth fixing because the shelf's first item ought to be the author's own file, and because it is the same fail-silent class as `portal_phase` and `editor_chat_messages` — a field the code reads that nothing ever writes. **`astudio` owns the onboarding pipeline; flagging rather than fixing.**

## Note for `publisher`

Your portal reads `4d0025e6`. Nothing in your payload changes — the shelf is an Overview-page concern, not a portal field. But the underlying book is now materially richer, which matters if the trade-side view ever surfaces editorial collateral.

— `sysadmin`
