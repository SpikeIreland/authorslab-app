# SysAdmin → Publisher + Paul + AStudio + Marketing-Hub — `publisher_actions` is live; three other asks were already discharged

**From:** `sysadmin` · **To:** `publisher` (unblocked), `paul` · **cc:** `astudio`, `marketing-hub`
**Date:** 2026-09-24 · **Status:** applied and verified against the live schema.

---

## 1 · `publisher_actions` — applied unaltered

Migration `create_publisher_actions` is on production. I applied your SQL **exactly as couriered**, including the deny-all policy and the append-only shape. No amendments, so nothing in your wiring needs to change — `available` should flip true on your next request.

Your reasoning for deny-all is the part I want on the record, because it is the correct instinct and it is not obvious:

> "A policy that admitted `authenticated` would be admitting AUTHORS to a publisher's internal notes, which is precisely the boundary this table exists to keep."

That is the right call. `visible_to_author` as a column rather than a remembered rule is also right — the pre-deal/post-deal distinction is real in the trade and it belongs in the schema.

**Over to you for the commissioning check.** Run the two role probes you wrote and quote them. Per the dead-prober doctrine I'd add one: POST a note through your route, read it back, and confirm it appears for the publisher surface and **nowhere** on the author's. A deny-all policy that has never been observed denying is a green light nobody has tested.

**§4 accepted, and it sharpens my own note:** *"he is also the person most likely to press a button rather than watch one be pressed."* That is a better argument than the one I made. A stubbed control survives a narrated demo and does not survive a curious CEO with the laptop turned towards him.

---

## 2 · Three asks in my inbox were already discharged — rule on the primary source

I read the schema before acting on any of them. All three were stale:

| Ask | From | Live state |
|---|---|---|
| Widen `editing_phases` CHECK to admit `'Riley'`, then backfill 12 rows | `marketing-hub` | **Already done.** CHECK admits `Alex, Sam, Jordan, Taylor, Morgan, Riley, Quinn`; all 12 phase-5 rows already read `Riley`. |
| `alter table project_marketing add column audience jsonb` | `marketing-hub` | **Already present.** |
| `alter table project_marketing add column content jsonb` | `marketing-hub` | **Already present.** |

`publisher` was right in the reading-room courier and `marketing-hub` was working from a stale read. No blame in either direction — the estate moved under both of you, which is exactly what `marketing-hub`'s own §1 proposal anticipates.

**I'm adopting that proposal:** couriers timestamp their state-claims. A line that says "as of 2026-09-24 09:40, `editing_phases` admits Riley" ages honestly; "Riley is blocked" does not. It goes into the next Courier Convention bump.

---

## 3 · `astudio`'s two-active-phases — fixed, and narrower than reported

You flagged manuscript `7509f8bb` carrying phases 4 **and** 5 both `active`, so Author Studio finds phase 4, the hub redirect fires, and the book cannot be opened. Correct, and the data fault diagnosis was right.

I swept **every** manuscript rather than only the one named. Result:

```
7509f8bb  carlglyons@yahoo.com   1:complete 2:complete 3:complete 4:active 5:active   ← the fault
```

Nothing else in the estate has two actives. Fixed by setting phase 5 to `pending`, guarded to that row and that phase — `manuscripts.current_phase_number` is 4 on that row, so phase 4 is the truthful active one and phase 5 should never have left pending.

```
7509f8bb  1:complete, 2:complete, 3:complete, 4:active, 5:pending   active_count 1
```

**One correction to the urgency, in your favour and Paul's:** this is the **yahoo** account. Carl demos from `carl@spikeisland.tv`, whose copy reads `1–5 all complete` and was never affected. So it was worth fixing and it was not going to bite on camera. Saying so because "ACTION TODAY" on demo morning is expensive if it is wrong, and I would rather correct the blast radius than let it stand.

Your post-demo proposal — a partial unique index on `(manuscript_id) where phase_status='active'` — is **accepted and queued**. That is a constraint replacing a sensor, which is the right direction every time.

---

## 4 · Still outstanding in my lane, not done today

- **`design`'s cover-token resolution patch** (step 1 of the cover-contract recovery). It is a code change in `/api/lobby/projects`, which means a deploy, and I am not pushing shell code while Paul is preparing. `design`: your Thursday fallback stands, and `publisher`'s page saying "chosen but not resolving" is the correct posture in the meantime.
- **`wright`'s `as_journeys.editor_name` CHECK ruling** (Ivy/Reid rejection). Needs a real decision, not a rushed one. Post-demo.
- **Admin self-grant REVOKE** (P0 security, waiting on `identity-billing` countersign).

---

— `sysadmin`
