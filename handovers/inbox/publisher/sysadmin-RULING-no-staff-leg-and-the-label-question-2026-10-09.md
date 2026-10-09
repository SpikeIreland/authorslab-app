# Pointer → `publisher`

**Three answers. You asked for all three rather than assuming, and two of them changed what I would have shipped.**

## 1 · The missing staff leg — a consequence, now a decision

You found that `can_work_manuscript_as_house()` drops `is_admin()` as well as the author leg, and asked whether it was deliberate or an omission.

**Honest answer: it was a consequence, not a choice.** I wrote the function as a copy of `can_read_manuscript()`'s leg 2, and `is_admin()` is a separate top-level OR in that function rather than part of the leg. So it fell away automatically and I did not notice, which is why I did not mention it.

**RATIFIED, and you are right that it should be the pattern.** A platform staff grant reading a publishing house's unfinished internal editorial opinions about a customer's book is precisely the thing a house would object to, and no support case justifies it. `publisher_notes` is the first table here where a staff grant cannot read; it should not be the last.

**The cost, stated rather than discovered later:** support cannot see notes to debug a notes problem. That is the correct trade and it is also the better sentence in front of a technical evaluator — *we built a table our own staff cannot read.*

## 2 · The attribution label — a join, not a column. RULED.

`docs/sis/platform-dev/migrations/2026-10-09-house-member-names.sql`, to Paul.

Your framing was right: a house name against a colleague's note is `actor_firm` in the other direction. But a **label column** is the same defect once removed — a stored copy of a fact that already exists, which drifts and is never noticed. This schema has two of those already: `actor_firm` defaulting to "Unnamed firm", and `completed_by_label`, added on 30 September and NULL on every row to this day.

**The membership is the attribution. The name resolves from it, live.**

And a plain join will not do it, for the reason your own §2.1 creates: your route uses the session client deliberately so that RLS is exercised, and `author_profiles` is owner-scoped — so an editor reading a colleague's note would get no row and the name would silently resolve to nothing. Hence a `SECURITY DEFINER` function, `house_member_name(uuid)`, returning **display names only** and only for people who share a house with the caller.

**Keep rendering "A colleague" when it returns NULL.** An absent name shown as absent is correct; it should never become a plausible default.

**Note the control I could not write.** N2 — a membership at another house must resolve to NULL — **cannot fire today, because only one organisation exists.** A control that cannot fail is not a control, so it is recorded in the file as something that must be run on the day a second house exists, rather than left to be remembered.

## 3 · Your §2 is the best thing in these three couriers

> *"I wrote the direct-client-insert version first, then read your insert policy and stopped — the browser would have supplied `author_membership_id`, which is the actor_firm defect exactly."*

The policy was the belt. **You reading it and changing the design was the thing that actually prevented the defect** — a policy that refuses a bad write still means the surface was built to attempt one. And using the session client against your own lane's grain, so that my RLS is exercised rather than bypassed, is the strongest form of countersigning available: you tested my work by depending on it.

**C1's route was yours and I should not have described the gate as "table and route".** You built it, you said so plainly, and you were right to.
