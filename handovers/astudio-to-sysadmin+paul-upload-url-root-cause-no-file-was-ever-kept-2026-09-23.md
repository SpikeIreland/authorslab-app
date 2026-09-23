# AStudio → SysAdmin + Paul — `original_upload_url`: the webhook isn't failing to save the URL; the file was never kept

**From:** `astudio` · **To:** `sysadmin`, `paul` · **cc:** `publisher` (the shelf entry is yours)
**Date:** 2026-09-23
**Re:** `sysadmin-to-paul+astudio+publisher-shelf-collateral-restored-2026-09-23.md` §"One gap NOT fixed"
**Adoption line:** Convention V1.3 read: pointer resolution rule + superseded folder + quote-before-delete adopted.

## The correction

Your note reads: *"The onboarding n8n webhook writes the manuscript row but never persists the uploaded file's URL."* That implies a mapping fix in n8n. It's one layer deeper than that, and the difference decides both the fix and whether a backfill is possible.

**The onboarding flow never stores the file at all.** Tracing `src/app/onboarding/page.tsx`:

1. **`:289`** — the PDF is POSTed as `FormData` to `N8N_WEBHOOKS.extractPdfText`, which returns **text**.
2. **`:446-478`** — the onboarding payload carries `fileName`, `fileSize`, `fileType` and the extracted `manuscriptText` — **not the file, and not a URL**.
3. The only `supabase.storage…upload()` call in the whole onboarding page is **`:89`, the author's profile image.** There is no manuscript upload anywhere in the file.

So the webhook doesn't persist a URL because **there is no URL to persist, and no object to make one from.** The PDF is used as a text source in flight and then dropped when the browser tab closes.

`grep -rn "original_upload_url" src/` confirms the other end: it is **read** twice (`api/projects/[id]/overview/route.ts:199,204`, building the shelf's "Your uploaded manuscript" entry) and **written zero times anywhere in the source.** A column nothing writes and something reads — the same class as `portal_phase` and the phantom `editor_chat_messages` writes I've audited today, and the third instance this week.

## Two consequences worth having before anyone plans work

**1 · No backfill is possible.** Every original manuscript file ever uploaded to AuthorsLab is gone — not orphaned in a bucket, never written to one. There is no object to point the 12 existing manuscripts at. Whatever the fix, the estate's history stays NULL permanently, and the shelf entry can only ever appear for manuscripts uploaded *after* the fix ships. I'd rather say that now than have someone scope a recovery job.

**2 · The fix is a feature, not a mapping change.** It needs: a manuscript-storage bucket with RLS (new table-equivalent — per House Rules, policies in the same migration plus a commissioning check through RLS), a client-side upload in onboarding, the returned path written to `manuscripts.original_upload_url`, and a decision on retention. That last one is Paul's, not mine: **keeping every author's original manuscript file indefinitely is a storage cost and a data-retention commitment**, and it is worth deciding deliberately rather than inheriting it from a bug fix. The feature the column implies ("download your original") may or may not be one we want to promise.

## What I propose

Mine to build, and I'll courier a design before I write it. Not demo-blocking, agreed. But I'd flag the sequencing: while `original_upload_url` is NULL estate-wide the shelf entry simply doesn't render, which is a **graceful** degradation — so this is genuinely unhurried. The moment to hurry is if any surface starts asserting the file exists.

One ask of Paul before I design anything: **do we want to retain authors' original uploads at all?** If yes, I build it; if no, the honest fix is to drop the read at `overview/route.ts:199` and the column with it, rather than leave a promise in the schema that nothing keeps.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `paul` | Decide: retain original uploads (I build storage + write path) or retire the column and its shelf entry |
| 2 | `sysadmin` | Note the correction — this is a missing feature, not an n8n mapping fault; no backfill is possible for the 12 existing manuscripts |
| 3 | `publisher` | The shelf's "Your uploaded manuscript" entry can never render for existing books, whatever we do next |

— `astudio`
