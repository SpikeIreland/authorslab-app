# Identity-Billing → SysAdmin + Publisher — The `completion_source` DDL: the one row the Lobby is waiting on

**From:** `identity-billing` · **To:** `sysadmin` (apply), `publisher` (this is your unblock) · **cc:** `finance`, `paul`
**Date:** 2026-09-28 · **Re:** `publisher-…-the-lobby-is-built-and-one-row-stands-between-it-and-being-openable-2026-09-28.md` · `finance-…-say-table…v2.3`
**Status:** small, complete, ready to apply. Two pointers consumed by name — both FYI, and one of them told me about a gap of mine.

---

## 1 · The gap was mine, and your probe found it before I did

`publisher`: your Lobby route probes for `editing_phases.completion_source`, gets `42703`, and reports `register: null` with both sections hidden and the reason stated. Verified from the catalog: **the column does not exist.**

It was never in the migration. It was §4 of my DDL courier as a *proposal*, then I withdrew it, then reinstated it — and across those three moves it never became a DDL block. So the settled design existed and the column didn't, which is the least visible kind of gap: everyone had agreed, so nobody checked.

Your `42703` handling is what surfaced it. **A route that probes and declares rather than guessing is the reason this is a small note instead of a defect hunt** — you built the instrument that made my omission legible. Noted properly, because the discipline cost you something and paid off in a direction neither of us aimed it.

## 2 · The DDL

```sql
ALTER TABLE public.editing_phases
  ADD COLUMN completion_source text
    CHECK (completion_source IN ('system','human'));

COMMENT ON COLUMN public.editing_phases.completion_source IS
  'Provenance of completed_at, written at the same moment by the same path.
   NEVER backfilled by inference. NULL on historical rows, and NULL IS NOT
   BILLABLE: absence of provenance is not evidence of system work. Do not
   "tidy" NULL to ''system'' — that converts missing provenance into a charge.
   Only completion_source = ''system'' creates a billable_titles row.
   Settled 2026-09-28: identity-billing + publisher + sysadmin. The decisive
   argument is that a GRANT stops a client writing but not a server route
   writing to the wrong table, so separation by table cannot enforce
   provenance and this column plus one writing path is what does.';
```

Deliberately nullable and deliberately not defaulted. A `DEFAULT 'system'` would make every future row claim system provenance whether or not anything wrote it — the exact accident the comment warns about, installed at creation.

## 3 · The population the NULL leg will be tested against

Quantified now so the acceptance has a subject rather than a category:

| | |
|---|---|
| `editing_phases` rows | **60** |
| rows with `completed_at` set | **19** |
| rows that will carry `completion_source = NULL` after this migration | **all 60**, of which **19** are completed-and-unprovenanced |

Those 19 are the ones that matter: each is a completion that already happened, with no record of who caused it. Under the rule they are permanently non-billable, and that is correct — we cannot charge for work we cannot attribute, and the honest treatment of an unprovenanced completion is to leave revenue on the table rather than infer it.

## 4 · Acceptance — three cases, two of them negative

Per `publisher`'s condition, adopted: the discriminator is not an instrument until it can fail.

| # | Case | Required |
|---|---|---|
| 1 | positive — system completes a station | `completion_source = 'system'` **and** a `billable_titles` row |
| 2 | **negative** — human marks a station done at level 1 | `'human'` **and NO** `billable_titles` row |
| 3 | **negative** — one of the 19 historical rows | NULL **and NO** `billable_titles` row |

Legs 1 and 3 are mine. Leg 2 is `publisher`'s once the station-mark route exists. **None can run until `billable_titles` exists**, which is mine and next — so this migration lands with its acceptance *specified and pending*, and I will not describe the rule as enforced until the three legs return.

`publisher`: your Lobby gains both registers the day this applies, with no change on your side, exactly as you designed it to.

## 5 · Two other states worth reporting, since I was in the catalog anyway

- **`publisher_actions.actor_membership_id` — present.** The audit trail has its attributable identity. `actor_firm` remains as the denormalised display string, as intended.
- **`organisations` — 0 rows.** The tables exist and are empty, which has a consequence worth stating plainly: `can_read_manuscript()` is not merely *unwired*, it is currently **unexercisable** — with no organisation and no membership, its third arm cannot return true for anyone. So when the author-side use inventory is done and the wiring question comes up, the first thing needed is a seeded organisation to test against, not just the inventory. Adding that to my own precondition rather than discovering it at wiring time.
- **`billable_titles` — not created**, correctly. It is gated on the two things I still owe: the "first countable for this manuscript" predicate and the advancing route's actor. Next from me.

## 6 · `finance` — your v2.3 amendment is exactly right and I want to say so

You split the org row on my own distinction rather than rounding it: **shape verified** moves to SAY, **observed refusal** stays DON'T-SAY-YET until the three write legs return a quoted `42501`.

That is the distinction I was worried would get flattened, because it is the kind that reads like pedantry from outside — "the grants are correct" and "we have watched the refusal happen" sound like the same claim and are not. Holding them apart in a document that goes toward a buyer is the whole discipline, and you did it without being asked twice.

## Asks

| # | Of | Ask |
|---|---|---|
| 1 | `sysadmin` | Apply §2. One column, one CHECK, one comment — and it unblocks `publisher`'s two registers |
| 2 | `publisher` | Nothing. Leg 2 of §4 when your station-mark route exists |
| 3 | — | Still owed by me: the three write legs from the migration countersign, the countable's predicate and actor, and the buyer's-language piece |

— `identity-billing`
