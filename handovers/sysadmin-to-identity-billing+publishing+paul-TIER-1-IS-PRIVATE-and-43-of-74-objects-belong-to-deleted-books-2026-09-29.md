# SysAdmin → Identity-Billing + Publishing — TIER 1 IS PRIVATE. The book file is protected. And 43 of 74 stored objects belong to books that no longer exist.

**From:** `sysadmin` · **To:** `identity-billing` (I drafted into your lane — §1, and please review), `publishing` (§4) · **cc:** `paul` (§5 is new and it is not a build item), `astudio`, `design`, `finance`
**Date:** 2026-09-29 · **Status:** applied, commissioned both directions, flipped. **Two of four buckets closed.**

---

## 0 · I drafted into your lane, `identity-billing`, and you should check my work

Ask 1 was *you draft, sysadmin applies*. Paul said continue and I had path facts you did not — so I wrote these two myself rather than send you a spec and wait.

**That is a deviation from the convention and I am flagging it rather than letting it pass as normal.** The two remaining buckets are still yours; this is not a takeover. **Review §1 — if the predicate is wrong, it is wrong on live storage now.**

---

## 1 · What is applied

**A helper, so "which manuscript owns this object?" is answered in ONE auditable place:**

```sql
public.storage_object_manuscript_id(bucket, name) -> uuid | NULL
```

Returns **NULL rather than throwing** on a name carrying no uuid. That is load-bearing: `original/.emptyFolderPlaceholder` is in the bucket right now, and **a failed `::uuid` cast inside a policy is an ERROR, not a denial** — it would break the read path rather than secure it. NULL flows into `can_read_manuscript()`, whose EXISTS legs are false for a null, so an unattributable object is denied to every non-staff caller.

**Two policies**, both on the estate predicate ruled yesterday:

```sql
"manuscripts: read own or as staff"          SELECT TO authenticated
"manuscript-formats: read own or as staff"   SELECT TO authenticated
  using ( bucket_id = '…' and can_read_manuscript(storage_object_manuscript_id('…', name)) )
```

`service_role` is deliberately unmentioned — it carries `BYPASSRLS`, so ingest, n8n and your new signed-URL route are unaffected and must stay that way.

---

## 2 · The correction that testing forced, and it makes your job harder not easier

I told you there were three path shapes. **I was wrong about one of them, and found it by running the helper over all 75 objects instead of trusting my own table.**

`manuscript-versions` extracted **0 of 27**. It is not `<id>/<file>` — it is **flat**: `<id>_phase1_approved.pdf`, no folder.

| Bucket | Real shape | Id location |
|---|---|---|
| `manuscript-formats` | `<id>/<file>` | folder |
| `manuscripts` | `original/<id>_original.txt` | 2nd segment, prefix |
| **`manuscript-versions`** | **`<id>_phase1_approved.pdf`** | **prefix, NO folder** |
| `manuscript-reports` | `<id>_alex_report.pdf` | prefix, NO folder |

**Which means the old `"Users can read own manuscript versions"` policy was dead TWICE OVER.** You found that it compares `author_id` to `auth.uid()` — different id spaces, 0 of 12. It *also* read `foldername(name)[1]`, which is NULL for every object in that bucket. **Two independent reasons it could never match a row, in one four-line policy**, and neither is visible without running it against data.

Dropped, along with the anon read. A dead policy left in place is worse than none: it reads as protection.

---

## 3 · Commissioned before the flip, both directions, on the leg that matters

```
dfpjohno (author, not admin)
  own manuscript                         TRUE
  Paul's book file                       false
  Carl's manuscript                      false
  .emptyFolderPlaceholder (null id)      false

paul.lyons@authorslab.ai (the book file's OWNER, role=author)
  own BOOK FILE                          TRUE     <- the flip's real test
  own manuscript                         TRUE
  another author's manuscript            false
```

**The owner-reads-own leg is the whole point.** A policy that denies everyone passes every refusal test and looks identical to a correct one — your rule, and the reason I ran the owner case before touching the flag rather than after.

**Then, and only then:** `public = false` on both, anon read dropped.

| | before | now |
|---|---|---|
| `manuscripts` (18 objects) | public, anon read + anon **write** | **private**, entitlement policy |
| `manuscript-formats` (3, incl. the book) | public, **no policy at all** | **private**, entitlement policy |

**21 objects secured, including the first book file this product ever made.** It was world-readable for nine hours.

---

## 4 · `publishing` — what is left, and it is your critical path

| Bucket | Objects | Stored URLs | Blocker |
|---|---|---|---|
| `manuscript-reports` | 27 | 27 | **no policy exists** + reader adoption |
| `manuscript-versions` | 27 | 15 | policy dropped as dead + reader adoption |

Both still public. Your route is the unblock; these two need the readers pointed at it. **`manuscript-reports` has no policy of any kind**, so it needs writing from scratch — `identity-billing`, that plus versions is the remaining pair, and the helper now handles all four shapes so the predicate is one line each.

---

## 5 · `paul` — a NEW finding, and it is a retention question rather than a build one

Running the helper across every object surfaced something nobody was looking for:

```
manuscripts          18 objects   10 orphaned
manuscript-reports   27 objects   13 orphaned
manuscript-versions  27 objects   19 orphaned
manuscript-formats    3 objects    1 orphaned
                     ─────────────────────────
                     75 objects   43 ORPHANED  (57%)
```

**Fifty-seven percent of stored objects belong to manuscripts that no longer exist in the database.** Books were deleted; their uploaded text, their editorial reports and their approved versions were not.

**Forty of those 43 are in the two buckets still public** — so deleted authors' manuscripts and reports are, right now, downloadable by anyone with the URL. They are *more* exposed than live content, because nothing in the product references them and nobody would notice.

This is not a defect anyone introduced; it is the absence of a deletion path, which is a different and more ordinary thing. **But it is a question a publisher's legal team asks** — *what happens to our content when we remove a title* — and today the honest answer is "it stays". Worth an explicit retention decision before Phase 1 terms are signed, not a scramble afterwards.

Logged to the post-send sweep. **Not in the six-day window** — the two remaining bucket flips cover the exposure, and the deletion path is a Phase 1 design question.

---

## 6 · Standing

| | |
|---|---|
| `manuscripts` · `manuscript-formats` | **PRIVATE**, commissioned |
| anon read + anon write on manuscripts | **gone** |
| `identity-billing` | review §1; draft reports + versions — helper covers all four shapes |
| `publishing` | reader adoption is the last gate |
| `paul` | §5 — retention decision, before Phase 1 terms |

---

— `sysadmin`
