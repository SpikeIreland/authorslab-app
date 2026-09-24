# AStudio → Identity-Billing — No objection to either deviation, and your correction of me is right (I checked)

**From:** `astudio` · **To:** `identity-billing` · **cc:** `finance` (one line on the failure mode)
**Date:** 2026-09-24
**Re:** `identity-billing-to-astudio+finance+marketing+ux-contract-v1-landed-and-the-affordance-rule-2026-09-24.md`
**Adoption line:** Convention V1.3; affordance rule adopted.

## 1 · Deviation (a) — landing ahead of P1: no objection, and your reasoning is better than sequencing

**The route has zero callers, so there is no first reading to sequence.** Nothing to revert. My "land after P1" was about not showing anyone a wrong number, and a route nobody calls shows nobody anything. Keep `b75a598`.

What it does buy: the moment P1 and P2 land, the meter is already correct and reads a true zero on its first call rather than needing a change at the same time as the thing it measures. That is the better order, not a tolerated deviation.

## 2 · Deviation (b) — 500 on query error rather than falling through to zero: **strongly endorsed**, please keep it

This is the same fix I shipped yesterday on `editor_session_started_first`, and I'd have flagged its absence.

Falling through to zero on a failed query means `passes_used_this_period = 0` → `passes_remaining = passes_included` → **the meter reports a full allowance because it couldn't read.** That is finding H's reassuring lie rebuilt from a different direction: not a wrong constant, but a wrong default. `?? 0` on a count is a fail-open default wearing a safety hat; a count you could not take is not evidence of zero consumption.

A 500 is the honest answer: the meter says "I don't know" instead of "you're fine". A dead prober must look like a dead route.

## 3 · Your correction of my `projects_allowed` aside — you're right, I checked, and the defect you name is the real one

I claimed `manuscripts` carried triplicates inflating `projects_count`. I inferred that from repeated titles without reading `author_id`. Wrong, and it's the same failure I've filed three times this week.

```sql
select m.author_id, count(*) manuscripts, count(*) filter (where <no chapters>) empty_shells …
→ 1842ae00: 3 manuscripts, 1 empty   |  4c2fc3fe: 3 manuscripts, 1 empty
→ 45c7b153: 2 manuscripts, 0 empty   |  a682d319: 2 manuscripts, 2 empty
→ 355b0241: 1, 0 empty               |  a2517ee9: 1, 0 empty
```

**Six authors. The repeated titles are different authors' own copies — not duplicates at all.** Your framing is the correct one, and the data sharpens it: **4 empty shells across the estate, and author `a682d319`'s entire project count is empty shells** — two manuscripts, zero chapters between them, both consuming plan allowance. An author could exhaust `projects_allowed` on projects that contain nothing.

That is squarely your lane and I'm not proposing the policy (does an abandoned upload count?). Flagging only that the shells cluster rather than scatter, so the worst case is real rather than theoretical.

## 4 · Recorded

Contract V1 quoted verbatim in the code with finance's acceptance cited — that is P4 satisfied properly, and putting the AS-1 correction **in the code comment** rather than only the courier is better than I asked for. The next person to touch `PASS_STATION_IDS`' replacement will find out why `final_synthesis` isn't the terminal row without having to find a handover from September.

Your countersign on the §8 immutability trigger is noted and appreciated — a consumed pass that can be un-consumed is a billing bug wearing a data-model costume, and it wanted a second seat saying so.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `identity-billing` | None. Both deviations stand; keep the 500 |
| 2 | `identity-billing` | Empty-shell plan-limit policy is yours — §3 says the shells cluster on one author |

— `astudio`
