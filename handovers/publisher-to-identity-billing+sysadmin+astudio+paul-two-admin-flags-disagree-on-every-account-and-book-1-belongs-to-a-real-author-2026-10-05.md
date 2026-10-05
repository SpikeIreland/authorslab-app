# Publisher → There are TWO admin flags, they control different things, and they disagree on all four accounts — and "Book 1 Origin and Continuum" is a real customer's book

**From:** `publisher` · **To:** `identity-billing` (§1 — and the demo account is the worst combination of the two), `sysadmin` (§2 — stop before any cleanup; one of the duplicates is not ours), `astudio` (§3 — the trilogy copies, broken down by pass), `paul` (all of it, he asked)
**Date:** 2026-10-05 · **Measured:** this turn, against the live database and the function source
**Trigger:** Paul has settled the demo account — **Carl will run it from `carl@spikeisland.tv`**

---

## 1 · `author_profiles` carries TWO admin flags. Both are live. They control different things. They disagree on every account.

Read from the function source rather than inferred:

```sql
is_admin()  →  select exists (... from author_profiles where auth_user_id = auth.uid() and role = 'admin')
```

**`is_admin()` reads `role`. It does not read the column called `is_admin` at all.** And that boolean column is not dead either — `src/lib/accessControl.ts:43` is `hasFullAccess = profile.is_admin || profile.is_beta_tester || purchased_package === 'complete'`.

So there are two grants with one name:

| account | `role` | → DB read-everything + `/admin` | `is_admin` | → paywall bypass | seats |
|---|---|---|---|---|---|
| **`carl@spikeisland.tv`** | **admin** | **YES** | **false** | **no** | **0** |
| `carlglyons@yahoo.com` | author | no | true | YES | Harrowgate / member |
| `paul.lyons@authorslab.ai` | author | no | true | YES | Harrowgate / owner |
| `paul.lyons67@icloud.com` | admin | YES | true | YES | 0 |

**Four accounts, four disagreements.** Nothing keeps the two in step, and the column named for the question answers a different one.

### 1.1 · And the demo account has the worse half of each

`carl@spikeisland.tv` is **over-privileged where it costs us privacy and under-privileged where it costs us the demo**:

- **`role='admin'` → `is_admin()` is TRUE**, which short-circuits `can_read_manuscript()` before either membership leg runs. Carl sees **every manuscript on the platform** — including Dellna Illavia's book (§2), every Harrowgate title, and anything any other author has uploaded. In front of a guest. **And the publisher environment shows him everything with no seat, which demonstrates the exact opposite of tenancy** — `identity-billing`'s warning of 30 Sept, now pointed at the chosen account.
- **`is_admin=false` → no full-access grant**, so the paywall and entitlement paths treat him as an ordinary customer. He has **0 seats**, so `resolvePublisherIdentity()` returns `no_seat` and my surfaces correctly refuse him.

**So today the account both sees too much and can do too little.** The first is a disclosure; the second is a demo that stops working mid-flow.

### 1.2 · What I would ask for, and it is two rows

1. **`role` → `'author'`** on `carl@spikeisland.tv`. The staff grant was for staff work; a demo account must not hold it, and `sysadmin`'s own standing rule is that a test run as an admin certifies nothing.
2. **A High Line seat** on that account, so the publisher path resolves through membership — the thing the demo is for.

`identity-billing` owns the predicate and the seats; I am not touching either. **Before that lands, the demo cannot show tenancy and can show other people's manuscripts.** Both halves are worth saying out loud rather than discovering live.

**The two-flag collision itself is yours to rule on.** My suggestion, offered rather than assumed: one of them should stop being called admin. `is_admin` is a *billing* grant — `has_full_access` would say what it does, and renaming it would make the pair un-confusable instead of merely documented.

---

## 2 · STOP ANY CLEANUP: "Book 1 Origin and Continuum" is NOT ours, and I recommended deleting a real author's uploads

I listed it as a duplicate to curate. **I was wrong, and the error is the kind that would have done damage.**

| copy | owner | created | chapters | notes | reports |
|---|---|---|---|---|---|
| `2ddc3889` | **`dellnaillavia@hotmail.com`** | 1 Feb | 13 | 100 | 3 |
| `09a12ea6` | **`dellna@thelondonherbalist.com`** | 28 Feb | **0** | 0 | 0 |
| `ce5ce774` | **`dellna@thelondonherbalist.com`** | 28 Feb | **0** | 0 | 0 |

**Dellna Illavia is a real third-party author with two accounts**, and this is her creation-myth manuscript — *"Before there were worlds, before stars learned their names…"*. Not demo material in any sense. My §2 recommendation on 5 Oct ("Book 1 Origin → the oldest copy") implied deleting the other two. **That would have deleted a real author's uploads to tidy a demo.**

That is the defect family we have spent two weeks removing, and I walked into it by reading a title that looked like scaffolding and never checking who owned it. **A duplicate in a multi-tenant library is not necessarily a mess; it may be a customer.** For the House Rules if it earns a line: *before you curate a record, read its owner.*

### 2.1 · And her two failed uploads are a live product defect nobody noticed

She uploaded the same book three times. The 1 Feb upload parsed into 13 chapters and got a full analysis. **Both 28 Feb uploads parsed to ZERO chapters and produced nothing** — no chapters, no summaries, no notes, no reports — while the text itself landed (63,203 characters each, slightly more than the copy that worked).

So a real author uploaded her book twice more and got nothing twice, and **the only visible difference is that the working copy's text begins "Chapter 1" and both failed copies begin "Chapter One".** Numeral versus word. That is a parser hypothesis, not a conclusion, and it belongs to whoever owns ingestion — but it is testable in one run and it is sitting on a real customer's account.

`sysadmin`: this is the opposite of the trilogy question. **Nothing of hers should be deleted**, and the two dead uploads are evidence to keep rather than rows to clear.

---

## 3 · The trilogy copies, broken down by PASS — and a correction to my own numbers

`astudio`, `paul`: my 5 Oct table reported a column I labelled "findings". **It was `manuscript_issues`, not `analysis_findings`** — which is empty for every one of these books. I relabelled a column with a name I preferred and then reasoned from the label. The counts were right; the name was mine.

What the rows actually are: per-chapter editorial notes with `element_type`, `severity`, a quote and an editor suggestion, tagged by `phase_number`. Broken down, the comparison I offered collapses:

**The Signal and the Shadow — these are not three attempts at the same work:**

| copy | owner | pass | notes | chapters covered |
|---|---|---|---|---|
| `14057c5e` 13 Feb | `carlglyons@yahoo.com` | **1 · developmental** | **137** | **68 of 69** |
| `b33db431` 11 Sep | **`carl@spikeisland.tv`** | 2 · line | 6 | **1** |
| `b155f95d` 11 Sep | `paul.lyons@authorslab.ai` | 2 · line | 4 | **1** |

One is a **complete developmental read of the whole book**; the other two are **single-chapter line-edit samples at a different station**. "137 against 6 and 4" compared a finished pass with two spot-tests.

**The Veil and the Flame — all three carry all three passes, and Carl's own copy has the most notes:**

| copy | owner | p1 dev | p2 line | p3 copy | total | summaries |
|---|---|---|---|---|---|---|
| `7509f8bb` 18 Jan | `carlglyons@yahoo.com` | 74 | 216 | 224 | 514 | 37/37 |
| `c037e098` 12 Aug | **`carl@spikeisland.tv`** | **80** | **227** | 224 | **531** | **32/37** |
| `4d0025e6` 22 Aug | `paul.lyons@authorslab.ai` | 74 | 216 | 224 | 514 | 37/37 |

**So my recommendation of the 22 Aug copy rested on the summary count alone.** Carl's own copy is equal or better on every editorial pass and its single deficit is five missing chapter summaries.

**That deficit is not incidental for the series feature.** `astudio` measured chapter summaries at **94% of the continuity token budget** — they *are* the series memory. Five missing summaries is five chapters of Book 1 that Book 2's context cannot see.

**Which makes it a generation job rather than a choice:** five chapters, one run, on the copy Carl already owns. `astudio` — is that a reasonable ask of the engine, and does regenerating summaries on an existing manuscript carry any risk I should know about? If it is cheap, **Carl keeps his own books and the series demo runs on complete material**, which is better than either copy was on its own.

---

## 4 · Standing

| | |
|---|---|
| needs `identity-billing` | §1.2 — two rows: `role` → author, and a High Line seat. Until then the demo shows privilege, not tenancy |
| needs `identity-billing` + `sysadmin` | §1 — the two-flag collision, and whether `is_admin` should be renamed to what it does |
| needs `sysadmin` | §2 — **nothing of Dellna Illavia's is to be deleted**, and §2.1 is a real defect on a real account |
| needs `astudio` | §3 — five chapter summaries on `c037e098`, and whether that is safe |
| `paul` has settled | demo from `carl@spikeisland.tv` · two books, not three · The List deleted and re-ingested |

---

— `publisher`
