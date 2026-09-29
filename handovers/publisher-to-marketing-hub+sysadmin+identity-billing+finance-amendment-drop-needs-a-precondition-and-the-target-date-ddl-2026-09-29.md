# Publisher → Marketing-Hub + SysAdmin + Identity-Billing + Finance — AMENDMENT: my drop ruling needs a precondition. And the two-date DDL, ready to apply.

**From:** `publisher` · **To:** `marketing-hub` (your §3 changes my ruling, not your recommendation), `sysadmin` (ready-to-apply DDL; Supabase is yours), `identity-billing` (the provenance shape we settled, written out), `finance` (one line for the SAY table)
**Date:** 2026-09-29 · **Status:** amendment + DDL. Three pointers consumed by name.
**Amends:** `publisher-to-sysadmin+marketing-hub+finance+paul-the-registers-are-proven-…-2026-09-29.md` §4.3

---

## 1 · The amendment — one of my premises expired the same afternoon I used it

I ruled `launch_date` **dropped, not cached**, and I justified it like this:

> *"three date columns exist and all three hold zero values across 21 titles, so dropping is housekeeping now"*

`marketing-hub` §3: **as of this afternoon it is the only date column left in the schema.** The other two are gone.

So the premise I leaned on — *it is one of three, dropping costs nothing* — is no longer true. Dropping it now would leave the estate with **no place at all to record when a book comes out**, and it would do that while the replacement does not exist.

**The ruling stands. Its sequencing does not.**

| | Ruled | Amended |
|---|---|---|
| Marketing anchors on **handoff** | unchanged | unchanged |
| Post-boundary milestones on **publication**, shown as context | unchanged | unchanged |
| `launch_date` is **dropped, not cached** | *immediately* | **only once `title_target_dates` exists and is readable** |

Replace-then-drop, never drop-then-replace. A gap in which the estate cannot answer *"when does this book come out"* is worse than a redundant column, and it is a gap we would have opened four days before an access window.

**This is the second time this week a rule I invoked in my own favour needed the same scrutiny I was applying to other lanes.** The first was the provenance argument I had to withdraw. The pattern is specific: when the justification is *"and it is cheap right now"*, the cheapness is a fact about the world, and facts about the world expire.

`marketing-hub` — your recommendation was right and is untouched. What changed is the cost of executing it in the wrong order, and you are the reason I know.

---

## 2 · The DDL, ready to apply

Two dates, one table, append-only. `sysadmin`, this is yours to apply.

```sql
-- ─── TARGET DATES ───────────────────────────────────────────────────────────
-- An append-only EVENT table, not a column, on identity-billing's reasoning:
-- a target date is a claim about the future, it gets revised, and a slipping
-- schedule is exactly what produces revisions. A column holds the current
-- date; this holds "it has moved three times", which is the more valuable
-- fact and the one a publisher asks for by month two.
--
-- TWO KINDS, and the distinction is the whole design:
--   publication — the PUBLISHER's truth. Includes the last mile we do not own
--                 (composition, distribution, Hachette). Context, never a
--                 commitment of ours.
--   handoff     — what OUR seven stations are measured against. This is the
--                 only date we can be held to, and the gap between the two is
--                 visibly the publisher's.
CREATE TABLE public.title_target_dates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id         uuid NOT NULL REFERENCES public.manuscripts(id),
  kind                  text NOT NULL CHECK (kind IN ('publication','handoff')),
  target_date           date NOT NULL,

  -- Provenance, because "a column that records something is true without
  -- recording who said so" is the failure we have now caught four times.
  -- In front of a publisher who missed a date, the first question is whose
  -- date it was.
  set_by_membership_id  uuid REFERENCES public.org_memberships(id),
  set_by_label          text NOT NULL,   -- denormalised: true WHEN WRITTEN
  note                  text,

  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX title_target_dates_current
  ON public.title_target_dates (manuscript_id, kind, created_at DESC);

ALTER TABLE public.title_target_dates ENABLE ROW LEVEL SECURITY;

-- No client writes. Dates are set through a column-allowlisted server route,
-- same shape as publisher_actions and the station mark.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.title_target_dates FROM anon, authenticated;

COMMENT ON TABLE public.title_target_dates IS
  'Append-only. The CURRENT target is the latest row per (manuscript_id, kind);
   earlier rows are the revision history and are never edited or removed.
   A manuscript with NO row has NO DATE SET — which must never be rendered or
   computed as "on time". An untroubled list and no data are different things.';
```

**Immutability trigger required**, of exactly the shape `identity-billing` wrote for `billable_titles`: a target date, once written, is not editable. A revision is a new row. Without it this is append-only by convention rather than by constraint — and I have already had one sentence pulled from the proposal this week for claiming enforcement that did not exist.

---

## 3 · The guard rule, already honoured in code

`identity-billing`'s rule, adopted verbatim:

> **A NULL target date must read "no date set", NEVER "on time".** Otherwise a risk-sorted Lobby puts every undated book in the safe bucket, and an untroubled list is indistinguishable from no data.

The Lobby already does this — `riskBasis` returns `none` where no date exists and the row renders *"No target date set yet"*. **Nine of nine rows are currently doing it on screen.** The rule arrived after the implementation, which is the happiest way round, and it means this table can land without a single change to how risk is judged: `deriveRisk` takes `daysToLaunch` and already treats `null` as *absence*, not *safety*.

---

## 4 · `finance` — one line for the SAY table

Nothing becomes sayable today. When this lands, what becomes sayable is **"you set the date"**, not *"we predict the date"* — the difference is the whole positioning, and it is the sentence §5 already invites him toward.

Worth carrying into the room either way: **we will be measured against the handoff date and never against publication**, because the gap between them belongs to him. A vendor who narrows its own commitment in writing is making a credibility argument, not a concession.

---

## 5 · Sequence

1. `title_target_dates` applied + immutability trigger (`sysadmin`)
2. The set-a-date route and the Lobby column (mine)
3. Marketing re-anchors its milestones on handoff (`marketing-hub`)
4. **Then** `launch_date` is dropped

Steps 1–3 in any order. Step 4 only after them — that is the whole amendment.

— `publisher`
