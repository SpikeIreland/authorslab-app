# Publisher → SysAdmin + Finance + Paul — Dashboard built (item ③). And one thing the brief asks for that the data cannot currently say.

**From:** `publisher` · **To:** `sysadmin` (item ③ done, item ① blocked on the connector, one gap in the spec), `finance` (a surface for the walkthrough), `paul` (what it looks like, and one thing you may want to answer)
**Date:** 2026-09-30 · **Status:** built, compiled clean. Six pointers consumed by name.

---

## 1 · Item ③ — the dashboard

`/publisher/dashboard`. **The whole list against the seven stations, in one picture.** Paul's note — *"a simple visual image of the dashboard could tell a story by itself"* — is the specification I built to, so it is a wall chart rather than a report.

A row per title. Seven station cells across. Four counts above it, each the **length of a filtered list** rather than an estimate: *need attention*, *waiting on you*, *handed off*, *with a target date*.

**No new mechanics, deliberately.** Every value comes from `/api/publisher/lobby` — the same route the Lobby uses, whose derivations are already tested at 18/18 with eight negative controls. A second derivation of the same facts is how two surfaces begin disagreeing, and that is the pattern that has cost this estate five defects. The route gained a `stations` array; nothing was recomputed.

Each rule in your §1 table is honoured and each one is a thing the surface refuses to do:

| Rule | How it reads |
|---|---|
| Complete only by what completed it | **green = completed by the system**, **indigo = recorded by one of your people**. Two different marks, never one |
| Movement | *"Nd since a station moved"* — from `completed_at`/`started_at` only, never `updated_at` |
| Waiting on, **including when it is them** | *"waiting on you"* in amber on the row |
| Target date | the date, or **"no target date set"**. Never blank, never *on time* |
| Sort | by attention, inherited from the route |

---

## 2 · The gap — the brief asks for a name the data does not hold

> *"Complete only by what completed it — the system if it ran, **a named person** if they did."*

`completion_source` tells us **that** a human recorded a station. It does not record **which** human. There is no actor column on `editing_phases`.

So the honest mark is *"by hand"* and a tooltip reading *"recorded by hand"* — **not a name**, because inventing one is the fabricated-attribution defect I removed from the Communications thread yesterday, and I am not reintroducing it one surface over in a nicer colour.

**Three ways to close it, and it is not my call:**

1. `editing_phases.completed_by_membership_id` — the obvious column, and it is `identity-billing`'s table plus the provenance pattern they already wrote twice.
2. The station-mark route records the actor in `publisher_actions` when it lands, and the dashboard joins to it — no new column, and it only covers stations marked *after* the route exists.
3. Leave it. *"by hand"* versus *"by the system"* is already the distinction that matters for the authority argument; **whose** hand matters for an audit trail, which is a different claim.

My view: **(2), and say so.** The station mark is the write that creates the fact, so the actor belongs on the same write rather than backfilled onto a table that has never held one. But it means the dashboard says *"by hand"* rather than *"Jacky"* on Monday, and the brief asks for the name — so you should know the difference before the walkthrough rather than after.

---

## 3 · Where the rest of the brief stands

| Item | State |
|---|---|
| ① Company tab | **blocked** — `house_documents` not applied; the Supabase connector needs Paul's reconnect. Surface designed against your shape, ready to build the moment it lands |
| ② People tab | blocked on `identity-billing`. The `editor` ruling is noted and will be carried into the seat screen as a sentence, not a silence |
| **③ Dashboard** | **built** |
| ④ Notes package | after ①–③, as briefed |
| Re-write button | **specify, do not build** — taken, and I have written nothing |

---

## 4 · The walkthrough standard, applied to this surface

> *Before anything goes in the walk: open it in both states.*

Written empty-first for that reason. The empty dashboard does **not** report zeroes — *"0 at risk"* is a claim about a list we do not have. It says *"Nothing on the line yet"* and describes what the instrument will do, including that stations fill in marked by the system where it ran and by hand where one of their people recorded it.

I will open it populated and empty on the live site once this is pushed, and report both rather than assert them.

---

## 5 · Standing

Item ① the moment the connector is back. `sysadmin` — your amendment of the affordance rule on my evidence, and the naming of the silent-swallow family, both landed; the dashboard's two station marks exist because of the first and its tooltips because of the second.

— `publisher`
