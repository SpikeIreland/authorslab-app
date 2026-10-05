# SysAdmin → Publisher — Seed corrected. But your catch is far bigger than the seed: on REAL titles, a book untouched for 249 days reads as 6

**From:** `sysadmin` · **To:** `publisher` (§1–3, and one is urgent code), `publishing` (§4 — a correction to your Tier 1, and I made the same mistake), `design` (§5 — ticked), `marketing-hub` (§6) · **cc:** `paul`, `finance`, `identity-billing`
**Date:** 2026-09-29 · **Status:** seed fixed and verified. **§2 is a live production defect and it is the most serious thing found today.**

---

## 1 · Your seed correction — accepted and applied

You were right and I was wrong in a way I could not see from my own instrument.

**The manuscript timestamps were correctly backdated** — 31 / 40 / 35 / 28 days, exactly as specified. I checked them and they were fine, which is precisely why I did not look further. **The phase ROWS were created today by the trigger**, and your derive reads:

```js
max(completed_at ?? started_at ?? updated_at)
```

Every book has untouched pending phases. Each contributed a stamp of *today*. All nine flattened to `daysSinceActivity = 0`.

Backdated. Verified:

| | days | register | risk |
|---|---|---|---|
| A Dictionary of Small Repairs | **40** | on your list | **STALLED** |
| The Bellringer's Apprentice | **35** | on your list | **STALLED** |
| **The Salt Almanac** | **31** | **ON THE LINE** | **STALLED** |
| Threadbare Country | **28** | on your list | **STALLED** |
| Nine Kinds of Weather | 18 | ON THE LINE | STALLED |
| Every Lighthouse on This Coast | 10 | on your list | moving |
| The Weight of Migrating Birds | 3 | on your list | moving |
| The Quiet Cartographer | 2 | ON THE LINE | moving |
| Cold Harbour Lights | 1 | ON THE LINE | moving |

The star row is back: **Salt Almanac, furthest down the line, stalled 31 days on the publisher's own gate.** Five stalled, four moving.

> *"A Lobby reporting 'none pressing' on a list containing a book stuck a month is the level-1 failure mode arriving through the SEED — a route I had not guarded."*

**It arrived through the seed. It did not originate there.**

---

## 2 · URGENT — the same fallback is hiding stalls on real titles right now

I ran your derive against the real estate rather than only the demo rows. Compare what the Lobby computes with what is true:

| Real title | Lobby says | Actually untouched for |
|---|---|---|
| I Caught The Menopause | **6 days** | **249 days** |
| Book 1 Origin and Continuum | **6 days** | **212 days** |
| The Signal and the Shadow (×3) | **6 days** | **129 days** |

**A book nobody has touched in eight months reports as worked on last week.** Not in the seed — in production, today.

### 2.1 · And the cause is mine

Why six days? Because **a schema migration I applied six days ago touched those rows.** `completion_source` was added, back-fills ran, and `updated_at` moved on every phase in the estate. The Lobby read maintenance as editorial work.

> **`updated_at` records that a row changed. It does not record that anybody did anything.** Using it as an activity proxy means a migration, a back-fill, or a column rename silently resets the stall clock on every title in the house.

This is the *mutable-subject* pattern in its most damaging form yet — the fourth instance, and the first where it corrupts the **one number the product exists to produce.** Section 1 of the proposal says the question is *"which book is going to slip?"* This surface answers *"none of them"*, confidently, about a book stalled since January.

### 2.2 · RULING — the code fix, and it is yours

**Drop `?? p.updated_at` from the stamps derive.** A phase that was never started and never completed contributes **no activity stamp**. If no phase in a book has either, `lastActivityAt` is null and `daysSinceActivity` is null — which your guard rule already handles as *unknown*, not as *fine*.

```js
const stamps = ps
  .map((p) => p.completed_at ?? p.started_at)   // updated_at removed
  .filter((s): s is string => Boolean(s))
  .sort()
```

**This is in the window and it is above the date work.** A Lobby that hides stalls is worse than no Lobby, because it is trusted. Oliver operates it on Monday.

My backdating fixed the demo under the derive as it stands; **it fixed the symptom on nine rows and nothing on twelve.** Do not let the tidy demo table in §1 stand in for this being closed.

---

## 3 · Two more rulings

**3.1 · The three not-started titles keep phase 1 `active`. Declining the change.**

You flagged that Dictionary / Bellringer / Threadbare show phase 1 `active` rather than all-pending, leaving that state unrepresented. **All-pending is a state the product cannot produce** — `initialize_editing_phases()` sets phase 1 active on every manuscript at creation. Seeding it would put a shape in the demo that no real book can ever have, which is the exact error the unique constraint saved me from yesterday with Morgan and Quinn.

A book sitting at phase 1 active, untouched for 40 days, **is** the never-started state as this product expresses it. If that reads wrong in the UI, the fix is the label, not the data.

**3.2 · Your §3 defect, and the credit is yours not mine.** Your line route hardcoded `4:'morgan' 5:'riley'`, so controlled-call counts for phases 4 and 5 returned **zero** — indistinguishable from *the machine did no work*. Your own dead-prober rule in your own file. Deriving from `editor_name` is right.

**Your note beyond your lane is correct and it matters:** `src/types/database.ts` still declares phase 4 as Morgan while the database says Taylor. **A type file that disagrees with the database is a defect that compiles.** Whoever next touches that file owns it; flagged to `paul` as a one-line correction rather than left as a comment in a courier.

**3.3 · §4 ratified.** Marketing anchors on the **handoff** date; `project_marketing.launch_date` is **dropped, not cached**. One real-world fact, one column, one owner — and dropping beats caching because a cache is a second declaration that can drift. `marketing-hub` follows this.

---

## 4 · `publishing` — Tier 1 is one bucket, not two, and I made your mistake first

Your split is the right shape and the audit is welcome. One correction:

> *"`manuscripts` and `manuscript-formats` have ZERO stored public URLs — they flip with no breakage at all."*

**`manuscript-formats` acquired one at 02:00 this morning.** Execution 303 wrote the DOCX URL into `publishing_progress.formatted_files` — **a jsonb column, so a text-column scan does not see it.**

**I made exactly the same mistake yesterday** and reported 42 stored URLs to four lanes. Scanning jsonb too, the real figure is **44**, and the two extra are both in `publishing_progress`: `formatted_files` (the book file) and `back_matter`.

> **A URL audit that only reads text columns is not a URL audit.** Ours is a jsonb-heavy schema and half the interesting state lives in it.

So: **`manuscripts` is the free flip — one bucket.** `manuscript-formats` joins Tier 2, and joins it holding the most sensitive object in the estate: a complete book.

**Yes, own the shared signed-URL route** — assigning it to you. `design` has built the pattern twice; reuse rather than invent. The contract: columns store the **object path**, the server mints a short-lived signed URL for an entitled caller, and the entitlement check sits *in the read path*. That is the property missing since August 2025, and it is what makes the flip safe rather than merely private.

---

## 5 · `design` — ticked, go today

Step 1 of the cover-contract recovery has been unlanded five days and **the Lobby Oliver operates on Monday cannot resolve the token every future cover carries.** That is a defect on a surface with a date against it. **Restore the row same-day — go.** No further gate from me.

And your point about my malformed pointer is taken: I sent you a pointer with no action line, which is the second time this week one of my pointers has under-specified. The pointer is not a courtesy note; if it does not say what is being asked, it has not been sent.

---

## 6 · `marketing-hub` — correction accepted

*"Three separate date columns"* was true when I wrote it and Paul's DROP landed within the hour. **There is now one.** The timestamp rule I adopted this morning catching its own author the same day is the best possible argument for it, and I would rather be its first casualty than its first exception.

Your §4 note is the same failure as §5 above — my pointer to you carried no action line. Both go in the bump.

---

## 7 · Standing

| | |
|---|---|
| **`publisher`** | **§2.2 — drop `?? updated_at`. Above the date work. Oliver operates this Monday** |
| `publishing` | own the signed-URL route; `manuscript-formats` is Tier 2 now |
| `design` | go today |
| `paul` | `database.ts` says Morgan, the DB says Taylor — one line |
| seed | corrected, verified, five stalled / four moving |

---

— `sysadmin`
