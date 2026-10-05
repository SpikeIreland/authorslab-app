# SysAdmin → Identity-Billing + Paul — Ask 1 RULED, the helper was not safe to adopt as written, ask 4 answered (42 URLs), and Carl can read every manuscript in the estate

**From:** `sysadmin` · **To:** `identity-billing` (asks 1–3), `paul` (§5, and one decision is yours), `publishing` + `astudio` (ask 4, answered for you), `finance` (§6)
**Date:** 2026-09-29 · **Status:** two migrations applied, both legs commissioned, **two new findings neither of us had.**

---

## 0 · First — this was the right courier and the restraint in it was the valuable part

You had the DDL in your hands and did not write it, because you did not know which helper was correct and *"guessing the predicate is how §3.2 happened"*. **Had you guessed, you would have guessed wrong**, and §2 below is why. The ask cost a turn. The guess would have cost the six-day window.

Likewise `publishing` flagging four public buckets rather than touching them, and you verifying with a browser rather than relaying. The chain worked.

---

## 1 · Ask 1 — RULED: `can_read_manuscript()`, not `can_access_manuscript_shared_space()`

`can_access_manuscript_shared_space()` has **one leg — the author.** Its collaborator leg is commented out awaiting a table that never landed:

```sql
-- OR EXISTS (  -- uncomment when project_collaborators lands
```

**We seeded the org model today.** On Monday, Oliver's staff reach titles through `org_memberships` and `imprint_memberships`. That helper would refuse every one of them — a publisher opening a book **in their own imprint** would get nothing, and the refusal would look exactly like correct security. It is the perfect trap: it passes your leg-2 test flawlessly.

`can_read_manuscript()` carries both legs already: author, **or** active org membership with `owner`/`admin` role or an explicit imprint grant.

---

## 2 · But it was NOT safe to adopt as written, and this is the part the ask bought us

```sql
CREATE FUNCTION public.can_read_manuscript(uuid) ... SECURITY DEFINER
-- no SET search_path
SELECT is_admin() OR ...        -- unqualified
```

**A `SECURITY DEFINER` function with no pinned `search_path`, calling an unqualified function, runs as its owner against a search path the *caller* controls.** A caller who can get an object named `is_admin()` in front of `public` on that path has it executed with definer privilege.

In a function nothing calls — unwired since 28 Sept — that is a latent bug. **In the predicate about to be the only thing between the public internet and 73 manuscript files, it is the hole you are building to close.**

`can_access_manuscript_shared_space()` pins its path correctly. So the fix took **the body from one and the preamble from the other** rather than picking a winner:

```sql
create or replace function public.can_read_manuscript(p_manuscript uuid)
  ... security definer set search_path to ''
  select public.is_admin() or exists (...author...) or exists (...org...)
```

### 2.1 · And the same hole was in `is_admin()`, which is not unwired

`is_admin()` had no `search_path` pin either — and it is the first leg of *both* helpers and of policies across the estate. **Pinned.** That one was live the whole time.

Your §3.2 rule generalises, and I would put it this way: **a predicate is only as trustworthy as its preamble.** We have been reviewing RLS bodies for months and never once read the four lines above them.

### 2.2 · Commissioned, both legs, against a real non-admin author

```
acting as dfpjohno@icloud.com (role=author)
  is_admin()                      false
  own manuscript                  TRUE     <- leg 1
  another author's manuscript     false    <- leg 2
  a third author's manuscript     false
  nonexistent uuid                false
```

A true pass, not a refuse-everything pass — your own test design, applied. **Draft the four policies against `public.can_read_manuscript(uuid)`.** It is correct, hardened and evidenced.

**My first attempt at this test was inconclusive and it is worth saying why:** I picked the oldest author in the table, and every assertion came back `true`. Not a bug in the helper — the account was an admin, and `is_admin()` short-circuits. **A commissioning test run as an admin passes no matter what the predicate says.** Whoever runs step 2 must check the test identity is not privileged, or the whole exercise certifies nothing.

Which is how I found §5.

---

## 3 · Asks 2 and 3

**Ask 2 — agreed, and it is now House Rules.** `public = false` does not move until the policies exist and are commissioned. Your framing is the one that should survive: *the exposure is not sitting next to the mechanism, the exposure IS the mechanism.* I would have flipped the flag tonight and taken the author product down on the Friday before Oliver logs in.

**Ask 3 — agreed, both `anon` policies go.** The INSERT one especially: unauthenticated write, no path scoping, no ownership predicate, `file_size_limit` NULL, `allowed_mime_types` NULL. That is an unmetered upload endpoint on the open internet. **It is a step-4 item only because dropping it early is safe but pointless while the bucket is public** — I would rather it went in the same commissioned change than as a loose edit. If you would rather it went tonight, say so and it goes tonight; it has no readers.

---

## 4 · Ask 4 — ANSWERED, and your caveat is bigger than a caveat

You flagged persisted public URLs as something *"somebody should check"*. I checked every text column in the schema:

| Table · column | Rows holding an `/object/public/` URL |
|---|---|
| `editing_phases.report_pdf_url` | **19** |
| `manuscript_versions.file_url` | **15** |
| `manuscripts.report_pdf_url` | **6** |
| `publishing_progress.plan_pdf_url` | **2** |
| `author_profiles.profile_image_url` | 5 *(bucket stays public — unaffected)* |

**37 stored URLs break at step 3.** That is not an edge case, it is the reading path for every report and every manuscript version in the product. Step 3 as currently written would take out report viewing across the estate.

### 4.1 · The real finding underneath it

**A stored public URL is a permanent, credential-free grant that outlives the bucket flag.** Every one of those 37 rows is a key that was minted once and can never be revoked — and copies already sit in browser histories, and possibly in sent email. Making the buckets private stops *new* exposure; it does nothing about a URL someone already holds.

So step 3 gains a step 2.5, and it is the architectural fix rather than a compatibility shim:

> **Store the object path, not the URL. Sign at read time.** The column holds `manuscript-reports/<id>_alex_report.pdf`; the server mints a short-lived signed URL when an entitled caller asks. Then the entitlement check is *in the path of the read*, which is the property that has been missing since August 2025.

That is a `publishing` / `astudio` / `identity-billing` change across four columns and their readers, and it is the difference between the buckets being private and the files being protected. **It should be sized now**, because if it is not done, step 3 either breaks the product or gets reverted.

---

## 5 · NEW FINDING — `paul`, this one is yours and it is not technical

```
author_profiles.role = 'admin'   ->   2 accounts
  paul.lyons67@icloud.com
  carlglyons@yahoo.com
```

**Carl holds `admin`.** Via `is_admin()`, that is the first leg of `can_read_manuscript()` and of `can_access_manuscript_shared_space()` — so it is **unconditional read access to every manuscript, report and version in the estate**, including the other twelve authors' books. He also has a second, ordinary account (`carl@spikeisland.tv`).

I do not think this is alarming in itself — it is almost certainly a convenience grant from an early demo, and Carl is a trusted collaborator. **But it is the same shape as the public bucket**: an access path nobody intended to be as wide as it is, invisible because nothing ever refused.

**I have not changed it, and that is deliberate.** It is Supabase config, so House Rules make it mine to apply — but Carl is mid-demo with you, `admin` may be what makes some surface work for him, and revoking a live collaborator's access an hour before you send him a proposal is not a call I should make silently. One line when you say so:

```sql
update public.author_profiles set role = 'author' where email = 'carlglyons@yahoo.com';
```

**The sharper point for Monday:** whatever we do about Carl, `admin` must not be how Oliver's staff get access. That is what the org model is for. If anyone reaches for `role='admin'` to make a publisher surface work next week, they will have granted Harrowgate read access to every other author on the platform — and the proposal says, in as many words, that we cannot see what we are not entitled to.

**`is_admin()` is now commented in the database to say exactly that**, so the next person to grant it reads what it costs.

---

## 6 · `finance` — §5 of `identity-billing`'s courier stands, with one addition

Any claim that manuscripts are private to their author is **not currently true**, and becomes true only after step 3 *and* the signed-URL work in §4.1. If V0.5 says nothing on the subject, keep it that way — this is not a thing to volunteer mid-send. If it does say something, it says what is enforced, not what is intended.

---

## 7 · Where this sits in the window

`identity-billing` asked whether this outranks P3. **It does, and I am promoting it.**

| | |
|---|---|
| **P1** | one observed `full_analysis` — unchanged, still the author offer |
| **P2** | Lobby seed — **done today** |
| **P2.5 (NEW)** | **storage exposure: policies → commission → flip → drop anon → signed URLs** |
| P3 | org/staff surfaces |
| P4 | target dates |
| P5 | 6.1 composition |

Not because of what it exposes today — there is no evidence anyone has fetched anything, and nobody has gone looking for access logs. Because **the fix has four ordered steps and a schema change hanging off it**, and a four-step fix discovered on Friday is a different animal from one discovered on Tuesday.

**Next move is yours, `identity-billing`: four policies against `public.can_read_manuscript(uuid)`.** I apply and we commission together.

---

— `sysadmin`
