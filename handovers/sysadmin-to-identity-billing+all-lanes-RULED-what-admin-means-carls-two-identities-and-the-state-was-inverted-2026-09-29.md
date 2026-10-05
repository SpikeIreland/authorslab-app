# SysAdmin → Identity-Billing + all lanes — RULED by Paul: what `admin` means, and it is not how Oliver's people get access

**From:** `sysadmin` · **To:** `identity-billing` (this is your lane's governing definition), `publisher`, `ux` · **cc:** `paul`, `finance`, all lanes
**Date:** 2026-09-29 · **Status:** applied and commissioned on both identities. **Standing definition — read before building any access surface.**

---

## 1 · The ruling

Paul, in channel:

> *"Carl should be considered staff with admin access for his spikeisland.tv account, but his yahoo.com account is outside of the staff environment so this should not have admin access."*

**The principle, which is the part that outlives Carl: the staff environment and the author environment are different places, and one person may stand in both — with different powers in each.** Identity is per-account, not per-human. Carl the co-founder and Carl the author are the same man and must not be the same principal.

---

## 2 · The state was the INVERSE of the intent, and it took two changes not one

| Account | Was | Now | |
|---|---|---|---|
| `carlglyons@yahoo.com` | **admin** | `author` | his personal/author identity |
| `carl@spikeisland.tv` | `author` | **admin** | his staff identity |

**Paul's instruction assumed one revoke. It needed a revoke and a grant**, because admin was sitting on exactly the wrong one of the two.

Nobody granted that deliberately. The flag landed on whichever account was convenient during an early demo and stayed there. **Which is how all of these happen: not a decision anyone would defend, just one nobody ever made.** The value of writing the definition down is that the next one has to be argued for.

---

## 3 · What `admin` means — the definition, now that there is one

> **`admin` is an AuthorsLab staff grant and nothing else.** Via `is_admin()` it is the first leg of `can_read_manuscript()`, therefore **unconditional read of every manuscript, report and version in the estate.**

> **It is NOT how a publisher's people get access to their own list.** That is `org_memberships`. Reaching for `admin` to make a publisher surface work on Monday would hand High Line read access to every other author on the platform.

`identity-billing` — that second paragraph is the one to hold while building P3. The shortcut will be tempting precisely because it works instantly.

---

## 4 · Commissioned on both identities, both directions

The test I got wrong yesterday by running it as an admin, run properly:

```
carlglyons@yahoo.com  (author)          carl@spikeisland.tv  (staff)
  is_admin            false               is_admin            TRUE
  own Veil copy       TRUE                own Veil copy       TRUE
  another's book      false               another's book      TRUE
  the other Carl copy false
```

**Both directions on both identities.** The author identity is genuinely fenced — it cannot even read Carl's *own other account's* copy of his *own book*, which is the correct and slightly counter-intuitive result: the fence is around the account, not the person.

### 4.1 · One wrinkle worth recording

`can_read_manuscript('00000000-…')` returns **true** for an admin. `is_admin()` short-circuits before the manuscript is looked up, so the predicate answers *"may this identity read manuscripts"* rather than *"may this identity read THIS manuscript"* when the caller is staff.

Harmless for reads — there is nothing to return. **But it means the predicate is not a proof of existence**, and any future code that treats a `true` as "this manuscript is real" would be wrong for two accounts. Logged, not fixed.

---

## 5 · Why the Lobby is unaffected, which I checked rather than assumed

Granting staff to the account Carl demos from raised an obvious hazard: does the Lobby now show him all twelve real authors' books mid-demo?

**No.** The Lobby scopes titles by `imprint_id IN (imprints of the organisation)` in the query itself, using the service role. It never consults `can_read_manuscript`. The twelve real titles carry no `imprint_id`, so they cannot appear in any org's Lobby regardless of who is looking.

**Worth noting for the record though:** that means the Lobby's entitlement lives in its *query*, not in a *policy*. It is correctly scoped today, and it is the same shape as the storage problem — an application-level check with nothing behind it in the database. Not a defect, and not urgent. It goes in the post-send sweep as *"surfaces whose tenancy is enforced only in code"*.

---

## 6 · Standing

| | |
|---|---|
| `admin` | AuthorsLab staff only. **Never** a publisher access mechanism |
| Carl | staff on spikeisland.tv, author on yahoo.com — applied, commissioned |
| `identity-billing` | build P3 on `org_memberships`; the admin shortcut is closed by definition now |
| post-send sweep | + Lobby tenancy enforced in query, not policy |

---

— `sysadmin`
