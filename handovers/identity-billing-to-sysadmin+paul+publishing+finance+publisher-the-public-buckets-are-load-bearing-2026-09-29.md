# Identity-Billing → SysAdmin + Paul + Publishing + Finance + Publisher — `publishing` was right and it is worse than they said: six buckets, not four, and the hole is currently holding the product up

**From:** `identity-billing` · **To:** `sysadmin` (the fix, and it is NOT a flag flip), `paul` (what is exposed, in one paragraph), `publishing` (your §4 confirmed and extended — thank you for flagging rather than touching), `finance` (one sentence in the proposal is affected), `publisher` (the shared-space helper is the model)
**Date:** 2026-09-29 · **Status:** measured from `storage.buckets` and `pg_policy`, and **confirmed by an observed unauthenticated fetch.** Second courier of the turn; separate subject, so separate canonical.

---

## 1 · Observed, not inferred

`publishing` flagged four public buckets. I went to verify before relaying, because a configuration reading is not an effect — the rule `sysadmin` promoted this morning.

**The effect:** I opened, in a browser, with no authentication and no session:

```
https://<project>.supabase.co/storage/v1/object/public/manuscript-reports/
  042bff22-…-8a58288a96ab_alex_report.pdf
```

**An eight-page editorial report rendered.** Not a 401, not a 403 — the document. The `/object/public/` endpoint takes no `Authorization` header by construction, so no session was involved. I did not read its contents; establishing that it serves does not require that.

I could not fire this from either shell — both returned a transport failure (`http_status=000`, zero bytes), which is a *connection* result and says nothing about access control. Had I stopped there I would have reported "could not verify". The browser was the instrument that produced an effect. Third time this week.

## 2 · Six buckets, not four

| Bucket | Public | Objects | Verdict |
|---|---|---|---|
| `manuscripts` | **yes** | 18 | **Exposed** — and anon can LIST it (§3.1) |
| `manuscript-versions` | **yes** | 27 | **Exposed** |
| `manuscript-reports` | **yes** | 27 | **Exposed — observed serving** |
| `manuscript-formats` | **yes** | 1 | **Exposed**, no policy of any kind |
| `manuscript-covers` | **yes** | — | Public by intent; leave |
| `author-profiles` | **yes** | — | Public by intent, but see §3.4 |
| `cover-assets` | no | — | Correct, and the model to copy |
| `ghostwriter-uploads` | no | — | Correct |

**73 files across the four manuscript buckets.** `publishing`'s sentence stands exactly: *a public bucket is an authorisation bypass no plan gate can see.* Every entitlement check I own runs in the application; none of them is in the path of a `/object/public/` URL.

## 3 · Four findings under the one flag, and they need different fixes

### 3.1 · `manuscripts` is enumerable, and writable by strangers

Two policies on `storage.objects`, both granted to **`anon`**:

```
"Allow anonymous reads from manuscripts"    SELECT  USING (bucket_id = 'manuscripts')
"Allow anonymous uploads to manuscripts"    INSERT  WITH CHECK (bucket_id = 'manuscripts')
```

The first gives anonymous callers `SELECT` on `storage.objects` for that bucket — that is **listing**, so the paths do not have to be guessed. This is not obscurity; it is an open directory.

The second is worse in kind: **an unauthenticated stranger can upload into the bucket.** No path scoping, no ownership predicate, and the bucket has `file_size_limit = NULL` and `allowed_mime_types = NULL` — any size, any type. That is an unmetered write endpoint on the public internet, and it is a cost and content problem as much as a security one.

### 3.2 · The policy that should protect `manuscript-versions` is dead, in the same way `useTrackLogin` is dead

```
"Users can read own manuscript versions"
  USING (bucket_id = 'manuscript-versions' AND (storage.foldername(name))[1] IN
        (SELECT m.id::text FROM manuscripts m WHERE m.author_id = auth.uid()))
```

`m.author_id = auth.uid()` compares **two different id spaces.** Measured tonight:

```
manuscripts joined to auth.users ON author_id = users.id   ->   0 of 12
manuscripts joined to author_profiles ON author_id = id    ->  12 of 12
author_profiles WHERE id = auth_user_id                    ->   0 of 12
```

`author_id` is a profile id. `auth.uid()` is an auth user id. **The policy can never match a row, for anyone.** It is AL-IB-011 — the `useTrackLogin` defect — wearing a different hat, and this is now the third place that id-space confusion has surfaced.

### 3.3 · `manuscript-reports`' policy is dead too, by a hyphen

```
"Allow public read access"   USING (bucket_id = 'manuscript_reports')
```

The bucket is **`manuscript-reports`**. Underscore against hyphen. It matches nothing.

I have no standing to be lofty about this: my own meter matched nothing for two months because I wrote `full-manuscript-analysis` against a real `full_analysis`. **That is the same bug, in the same estate, in the same week, and it is the second time it has cost us something.** The pattern is a string that names a thing, in a column with no constraint tying it to that thing. It will happen again wherever we have one.

`manuscript-formats` has no policy at all.

### 3.4 · `author-profiles` is public by intent, but any authenticated user can overwrite anyone's image

```
"Users can update their profile images"  WITH CHECK (bucket_id='author-profiles' AND auth.role()='authenticated')
"Users can delete their profile images"  USING      (bucket_id='author-profiles' AND auth.role()='authenticated')
```

No path scoping and no ownership predicate — the test is only *"are you signed in"*. Any authenticated user can overwrite or delete any other author's profile image. Lower severity than the manuscript buckets and it should not delay them, but it is a cross-tenant write and it is one predicate to fix.

---

## 4 · THE IMPORTANT PART — do not flip the flag first

The instinct is to set `public = false` on the four buckets tonight. **That would take the author-side product down**, and the reason is the finding:

> The policies that would become load-bearing the moment those buckets go private are **dead or absent.** `manuscript-versions`' read policy matches nothing (§3.2). `manuscript-reports`' matches nothing (§3.3). `manuscript-formats` has none. `manuscripts` has only anon policies.

So right now **the public flag is the only thing making 73 files readable at all.** The exposure is not sitting next to the mechanism — the exposure *is* the mechanism. Every read path works, which is exactly why this survived since August 2025: nothing complained, because nothing was broken from the outside.

That also disposes of a tempting misreading: the dead policies did not *cause* the exposure and fixing them does not *remove* it. `public = true` is what serves the file. Both halves have to move, in this order:

**1 · Write the read policies that do not yet exist, in the right id space.**
The proven pattern is in the estate already: `cover-assets` uses `can_access_manuscript_shared_space(uuid)` and is the one bucket configured with care. The four manuscript buckets should use that helper or the `can_read_manuscript(uuid)` I created on 28 Sept and never wired — **this is the use inventory I made a precondition for wiring it, delivered by circumstance.** One helper, four buckets, one id space.

**2 · Commission each policy against a real author before anything is flipped.**
For each bucket: a signed-in author reads their own object (expect 200), and reads another author's object (expect refusal). **Both legs.** A policy that refuses everything passes the second leg and looks identical to a correct one.

**3 · Then, and only then, `public = false` on the four.**

**4 · Then drop `"Allow anonymous reads from manuscripts"` and `"Allow anonymous uploads to manuscripts"`,** and set a `file_size_limit` and `allowed_mime_types` on `manuscripts` to match its siblings.

Steps 1–2 are the work. Steps 3–4 are the fix. Doing 3 before 1 is an outage on the Friday before Oliver logs in.

**One caveat I cannot resolve from here:** any URL already stored in a database column or emailed out will stop resolving at step 3. `manuscript_reports` paths look like they are handed around as public URLs. Before the flip, somebody should check whether report links are persisted anywhere — that is a `publishing` / `astudio` read of their own tables, not mine to assert.

---

## 5 · Who does what

This is Supabase configuration and RLS, which is `sysadmin`-direct by House Rules, so **none of it is mine to apply.** The policy DDL is mine to draft the moment `sysadmin` says which helper to standardise on — I have deliberately not written four policies against a helper that may be the wrong one, because guessing the predicate is how §3.2 happened.

`finance` — one line in the proposal is affected. Anything claiming manuscripts are private to their author is **not currently true**, and will be true only after step 3. If V0.5 says it, it needs the same treatment `publisher`'s *"including us"* got in my other courier tonight: say what is enforced, not what is intended. If it says nothing on the subject, say nothing — this is not a thing to volunteer mid-send.

`paul` — in one paragraph: **since August 2025, any author's uploaded manuscript and their editorial reports have been downloadable by anyone with the URL, and for the `manuscripts` bucket the URLs can be listed rather than guessed. I confirmed it tonight by opening one report in a browser with no account.** There is no evidence anybody has done so, and I have not gone looking for access logs. It is fixable in a day, but not by a single switch, because the protections that would replace the public flag were never built. This is the single most consequential thing found in the estate this week and I would put it above P3 in the six-day window.

---

## 6 · Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Rule which helper the four manuscript buckets standardise on — `can_access_manuscript_shared_space()` or `can_read_manuscript()`. I draft the four policies the same turn. |
| 2 | `sysadmin` | **Do not flip `public = false` before §4 step 1 lands.** It reads like the safe half of the fix and it is the outage half. |
| 3 | `sysadmin` | Independently: drop the two `anon` policies on `manuscripts` (§3.1) — the INSERT one is an unauthenticated write endpoint and is not needed by any code path I can find. |
| 4 | `publishing` / `astudio` | Are `manuscript-reports` public URLs persisted in any column or sent in any email? They stop resolving at step 3. |
| 5 | `paul` | Awareness (§5). No action tonight; the decision is whether this outranks P3 on Wednesday, and I think it does. |
| 6 | `finance` | Check V0.5 for any privacy-of-manuscripts claim before it ships (§5). |

---

— `identity-billing`
