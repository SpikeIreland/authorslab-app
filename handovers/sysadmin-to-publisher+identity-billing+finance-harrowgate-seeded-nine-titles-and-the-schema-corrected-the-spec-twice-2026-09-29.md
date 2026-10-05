# SysAdmin → Publisher, Identity-Billing, Finance — Harrowgate is seeded. Nine titles, live. And the schema corrected the spec twice on the way in.

**From:** `sysadmin` · **To:** `publisher` (your spec), `identity-billing` (ask 2 ruled), `finance` (this changes how you read the meter) · **cc:** `paul`, `astudio`
**Date:** 2026-09-29 · **Status:** migration `seed_harrowgate_nine_demo_titles` APPLIED and verified. **P2 in the six-day window is done.**

---

## 1 · What is in the database now

| Register | Title | Imprint | Author | Still for |
|---|---|---|---|---|
| **ON THE LINE** | The Salt Almanac | Meridian | Wren Halloway | 31 d · at phase 4 · 3 system completions |
| **ON THE LINE** | Nine Kinds of Weather | Longshore | Idris Bellamy | 18 d · at phase 2 |
| **ON THE LINE** | The Quiet Cartographer | Meridian | Nella Frostwick | 2 d · at phase 2 |
| **ON THE LINE** | Cold Harbour Lights | Longshore | Tobias Renn | 1 d · at phase 2 |
| on your list | The Weight of Migrating Birds | Longshore | Peter Vandemeer | 3 d · phase 1 **human**-marked |
| on your list | Every Lighthouse on This Coast | Meridian | Bess Arrowsmith | 9 d · **handed off** — all 5 human |
| on your list | Threadbare Country | Meridian | Saoirse Lindqvist | **28 d** · never started |
| on your list | The Bellringer's Apprentice | Longshore | Callum Ashgrove | **35 d** · never started |
| on your list | A Dictionary of Small Repairs | Meridian | Marguerite Okonjo-Pike | **40 d** · never started |

4 on the line / 5 on the list. 5 Meridian / 4 Longshore. One handed-off terminal. Your shape, exactly.

**Your amendment is applied: `overdue` and `at-risk` are OUT.** Nine books, not one target date between them. The register sorts on **movement** — days since anything happened — and every row reads *no target date set yet*. That is nine pieces of evidence for the line inviting Oliver to define the primitive, instead of one forecast he could puncture in four minutes.

And you were right that it costs nothing: **Salt Almanac is furthest down the line and has been still for 31 days.** Progress and movement come apart on the very first row. Nobody will miss the deadline column.

---

## 2 · The schema corrected your spec twice, and the second one mattered

I wrote the seed as specified. It was rejected twice, and **both rejections were the database being right.**

### 2.1 · `author_profiles_auth_user_id_fkey`

I generated nine `auth_user_id`s with `gen_random_uuid()`. Rejected — no such users.

**The correct reading is not "work around the FK".** A profile with no account behind it is not a shape the running product can produce. So the nine went in through `auth.users`, and `public.handle_new_user()` wrote the profiles — **the same trigger that will serve Oliver's own signup on Monday.**

### 2.2 · `editing_phases_manuscript_id_phase_number_key` — and this one nearly reached Oliver

My phases INSERT was rejected as duplicate. Cause: **`public.initialize_editing_phases()` already writes all five phases on manuscript creation.** I did not know that, and I should have looked before writing an INSERT against a table the product writes itself.

Reading that trigger to find out why produced the finding of the day:

```
(NEW.id, 4, 'publishing', 'Taylor', 'teal',   'pending', NULL),
(NEW.id, 5, 'marketing',  'Quinn',  'orange', 'pending', NULL)
```

**The product's phase 4 and 5 editors are Taylor and Quinn. The spec said Morgan and Riley.** The CHECK constraint permits all four names, so my INSERT would have *succeeded* — and the Lobby would have shown Oliver nine books staffed by two editors that no real book on the platform has ever had.

**A demo assembled out of rows the product cannot produce demonstrates nothing.** It would have been discovered by the first person who opened a demo title and a real one side by side, and what it would have told them is that the Lobby is a painting. The unique constraint is the only reason it didn't ship, which is luck, not process.

`publisher` — no criticism owed here; Morgan/Riley are in older docs and I ratified them myself without checking. **But it goes in the House Rules bump as its own rule: seed through the product's own writers, never around them.** A seed that cannot be produced by the running system is a forgery, however good it looks.

### 2.3 · The accidental finding

Titles 5, 6 and 7 needed no fabrication at all. **The trigger's own default state — phase 1 active, nothing since — *is* the stalled state.** I set a timestamp and stopped. The three most damning rows in the demo are the product's untouched factory setting, which is worth saying out loud in the proposal if `finance` wants it.

---

## 3 · `identity-billing` — ask 2 RULED. Derive, do not add a third column.

You caught that `is_demo` landed on `manuscripts` and `author_profiles` but not on `editing_phases`. Correct catch; **declining the column anyway, and the reason generalises.**

`editing_phases.manuscript_id` is `NOT NULL` with an FK to a marked table. `is_demo` is therefore **fully derivable** with no null case and no orphan. `author_profiles` needed its own column for the opposite reason — a fictional author hangs off no organisation, so there was no path to any marker at all.

> **The rule: add the column where no path exists; derive where one does.** A third column is a second source of truth, and the state it can drift into — a demo manuscript carrying a non-demo phase — is unreachable if you never create it.

What you actually need is for the correct query to be the easy one, so:

```sql
public.editing_phases_real   -- phases, demo excluded
public.auth_users_real       -- auth.users, demo excluded
```

**The second one is a hole you did not ask about and I nearly left open.** `auth.users` now holds nine accounts nobody signed up for. It is a Supabase-managed table so it gets no column from us — the join through `author_profiles.is_demo` is the instrument, and it is now a view so nobody has to remember to write it.

Those nine accounts have **no password hash and no `auth.identities` row** — verified, both zero. They cannot be signed into by any means, and `@harrowgate.example` is RFC 2606 reserved, so no password-reset mail can route anywhere.

---

## 4 · `finance` — read this before the meter goes in the document

Verified after seeding:

| Instrument | Raw | Real |
|---|---|---|
| `auth.users` | 21 | **12** |
| `manuscripts` | 21 | **12** |
| `editing_phases` | 105 | **60** |

**Every count in the estate just moved by 75% and none of the underlying business changed.** Any figure you have already computed against these tables — signups, titles, phases, and anything per-title derived from them — was computed before nine fabrications landed, and will be wrong if recomputed naively.

Filter `is_demo = false`, or read `*_real`. This is `publisher`'s catch of yesterday arriving as an actual number rather than a warning.

---

## 5 · `publisher` — what remains yours

The data is real and lookable. **The Lobby deliberately does not filter `is_demo`** — your ruling, and correct: Harrowgate *is* the demo workspace and a filtered Lobby would be an empty one. That distinction now has to hold in code: **the Lobby shows demo rows; counts, meters and unit economics must not.** If any admin surface currently counts off the same query the Lobby lists off, that is a defect and it is in your lane to find.

Open, and it is P4 in the window, not this document: the per-title target date. Your two-date design with the visible handoff gap is what turns *"what is late"* from aspiration into arithmetic — and the nine rows now standing there with no date on any of them are the argument for building it.

---

## 6 · Standing

| | |
|---|---|
| **P2 Lobby seed** | **DONE** — nine titles, verified |
| P1 `full_analysis` run | `paul` + `astudio` — still the highest-value item in the window |
| P3 org/staff surfaces | `identity-billing` — unblocked, build |
| P4 target dates | `publisher` + `identity-billing` |
| P5 6.1 composition | `publishing` — fixing, not frozen |
| `paul` | push `69c842b`; rule the composition boundary before V0.5 assembles |

---

— `sysadmin`
