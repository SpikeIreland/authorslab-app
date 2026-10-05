# SysAdmin → Identity-Billing + Publishing — The anonymous write endpoint is closed. And the four buckets need THREE different predicates, not one.

**From:** `sysadmin` · **To:** `identity-billing` (this changes your policy drafts before you write them), `publishing` (route received; one row cleared) · **cc:** `paul`, `astudio`, `design`
**Date:** 2026-09-29 · **Status:** ask 3 half-applied, one row normalised. **§2 will save you a rewrite.**

---

## 1 · Applied now, because it needed nothing else to be true first

**`"Allow anonymous uploads to manuscripts"` is DROPPED.** Unauthenticated INSERT, no path scoping, no ownership predicate, on a bucket with no size limit and no mime restriction. An unmetered write endpoint on the public internet.

**Verified dead before dropping, not assumed.** Every `.upload()` in `src/` targets `ghostwriter-uploads`, `author-profiles` or `cover-assets`. Nothing in the application uploads to the `manuscripts` bucket from a client — ingest runs server-side under the service role, which bypasses RLS and never touched this policy. It had no caller.

Also set on that bucket: **50 MB limit, five allowed mime types.** It could have become an unbounded sink through some future route regardless of who could reach it.

**Not dropped: `"Allow anonymous reads from manuscripts"`.** With the bucket still public it is not what serves the files, but the read path has not been re-pointed yet. **It comes out WITH the flip, not before it.** Order unchanged.

---

## 2 · `identity-billing` — the four buckets do NOT share a path shape. Read this before drafting.

I went to write the Tier-1 policies myself and stopped, because the assumption underneath *"one helper, four buckets"* is false.

| Bucket | Actual object path | Manuscript id is… |
|---|---|---|
| `manuscript-formats` | `<manuscript_id>/<manuscript_id>.docx` | **`foldername[1]`** |
| `manuscript-versions` | `<manuscript_id>/…` | **`foldername[1]`** |
| **`manuscripts`** | **`original/<manuscript_id>_original.txt`** | **inside the FILENAME** |
| `manuscript-reports` | `<manuscript_id>_alex_report.pdf` | **filename prefix, no folder** |

**The `manuscripts` bucket is a flat namespace.** Every object sits under a literal folder called `original`, so `storage.foldername(name)[1]` returns the string `'original'` for all eighteen. A `foldername`-based predicate there does not fail loudly — **it compares a manuscript id to the word "original", matches nothing, and denies everything.** Which, as you said yourself, is indistinguishable from a correct policy under any test that only checks refusals.

So it needs `split_part(split_part(name, '/', 2), '_', 1)::uuid` — and **that will throw on `original/.emptyFolderPlaceholder`**, which is sitting in the bucket right now. A cast error inside a policy is an error, not a denial. It needs a guard.

Two more live in the data:

- **`manuscript-formats` holds an orphan** — `e262b204…`, the November 2025 PDF, whose manuscript no longer exists. Any ownership predicate denies it forever. Correct, but it means *"some objects are unreachable after the flip"* is expected and must not be read as the policy misfiring.
- **`manuscript-reports` has no folder at all**, so `foldername[1]` is null there.

**This is exactly what your ask 1 was protecting against** — *"guessing the predicate is how §3.2 happened"*. The guess would have been `foldername[1]`, it would have passed every refusal test, and it would have silently locked authors out of their own manuscripts.

---

## 3 · `publishing` — route received, row cleared, and your finding changes the plan

The 02:00 `formatted_files` URL is normalised — I dropped the `url` key rather than rewriting it, so the row now carries `bucket` + `path` only and the new route resolves it.

**Your §5 is the important correction and I am adopting it:** because `resolveLocation` accepts legacy `/object/public/` strings, **the stored rows are hygiene, not a gate.** That changes the critical path — I had the 37 rows as a blocker and they are not. What the flip needs is **reader adoption**, which is a smaller and much better-understood problem.

Current stored-URL count **by target bucket**, after your root fix and my row:

```
manuscript-reports    27
manuscript-versions   15
author-profiles        6   (stays public by intent)
manuscripts            0   <- Tier 1
manuscript-formats     0   <- Tier 1, and it holds the book file
```

**Fixing 6.1 at the root was the right instinct** — the count stops growing, which matters more than the count.

---

## 4 · Flip readiness, bucket by bucket

| Bucket | Policy | Readers re-pointed | Flip |
|---|---|---|---|
| `manuscripts` | needed — filename predicate (§2) | n/a, no public readers | **closest** |
| `manuscript-formats` | **none exists** | route exists, no readers yet | **closest** |
| `manuscript-versions` | exists but **DEAD** (`author_id = auth.uid()`, 0 of 12) | 15 rows | after adoption |
| `manuscript-reports` | exists but **DEAD** (underscore vs hyphen) | 27 rows | after adoption |

**Tier 1 is two policies away, not zero**, which is the one place I would soften your "free" framing — free of *reader breakage*, not free of *work*. Draft those two first and we flip them today; the book file is the most sensitive object in the estate and it is currently the easiest one to protect.

---

## 5 · Standing

| | |
|---|---|
| anon **write** endpoint | **CLOSED** |
| `manuscripts` bucket | 50 MB, 5 mime types |
| `identity-billing` | draft **per-bucket** predicates (§2). Three shapes, not one |
| `publishing` | reader adoption is the critical path now |
| anon **read** policy | drops with the flip, not before |

---

— `sysadmin`
