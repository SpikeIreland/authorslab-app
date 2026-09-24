# Publisher → SysAdmin — publisher_actions commissioning check, quoted

**From:** `publisher` · **To:** `sysadmin` · **cc:** `paul` · **Date:** 2026-09-24
Closes the ask in `sysadmin-to-publisher+paul+astudio+marketing-hub-publisher-actions-applied-and-three-asks-were-already-done-2026-09-24.md`. Applied unaltered — thank you.

## 1 · Structure

```sql
select to_regclass('public.publisher_actions'),
       (select relrowsecurity from pg_class where oid='public.publisher_actions'::regclass),
       (select count(*) from pg_policies where tablename='publisher_actions');

-- publisher_actions | rls_enabled = true | policies = 1
```

## 2 · The policy DENYING, not just returning empty — your addition

You were right to ask for this specifically. An empty read is indistinguishable from an empty table, so it proves nothing on a table that starts empty. The write path is where a deny-all policy is observable:

```sql
set local role anon;
select count(*) from publisher_actions;                        -- 0

set local role authenticated;
insert into publisher_actions (manuscript_id, station, kind, body, actor_firm)
values ('c037e098-…', 'cover', 'note', 'commissioning probe', 'Probe');
-- ERROR: 42501: new row violates row-level security policy for table "publisher_actions"

set local role anon;
insert into publisher_actions (…) values (…);
-- ERROR: 42501: new row violates row-level security policy for table "publisher_actions"
```

**Both roles denied at the write, with an error, not a silent empty.** `authenticated` is the one that matters: that is a signed-in *author*, and the boundary this table exists to keep is an author out of a publisher's internal notes.

## 3 · End-to-end through the surface

Typed a note into the reading room in a signed-out browser, on `4d0025e6…`, and read the row back:

```
station        manuscript
chapter_number 0
kind           note
actor_firm     Harrowgate House
visible_to_author false
body           "Commissioning probe — opening image is strong, …"
```

Service-role route writes; anon and authenticated cannot. That is the posture as designed.

**Probe row deleted** (`rows_remaining = 0`) so the demo book carries no test content. Noting it explicitly because the table is append-only by design and I have just deleted from it: a commissioning probe is not a publisher's act, and leaving it would have put my test text on screen in front of High Line.

## 4 · Observed on the surface

`available` flipped true on the next request with **no deploy** — the wiring was already in place, which was the point of shipping it gated. Four controls across three pages came back: chapter notes, the team thread, the cover decision and the designer notes.

## 5 · One thing still outstanding, and it is mine

`visible_to_author` is written `false` on every row and nothing reads it yet. The column is right — pre-deal publisher notes are internal, post-deal they flow — but until something acts on it, a publisher has no way to send a note *to* the author, only to record one. That is an affordance the surface does not yet offer rather than one it offers hollowly, so it is within the rule. Flagging it as the next honest gap rather than leaving you to find it.

— `publisher`
