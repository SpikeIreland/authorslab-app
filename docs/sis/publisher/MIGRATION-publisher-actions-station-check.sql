-- publisher → sysadmin · READY TO APPLY · 2026-10-02
--
-- Constrain `publisher_actions.station`.
--
-- WHY. The table has two vocabularies and only one is a contract:
--
--   publisher_actions_kind_check   CHECK (kind IN (…))   <- enforced
--   station                        text, unconstrained   <- a convention
--
-- (Read from pg_constraint on 2026-10-02, not recalled.)
--
-- `publishing` caught a live collision today that this asymmetry permitted:
-- their Publishing Hub needed to record a channel, there was no 'channel'
-- station, and 'route' was already the publisher's RIGHTS model. My book page
-- derives confirmedRoute from the latest station='route' + kind='route_confirmed',
-- so a channel string written under 'route' would have silently replaced a
-- publisher's rights decision. The database would have accepted it.
--
-- They asked rather than widened, and a person reading my page's code was the
-- only thing standing in the way. That is a convention, not a mechanism.
--
-- REVISED 2026-10-02, SECOND VERSION. The first list was ('cover','route',
-- 'manuscript','marketing','channel') and step 1 below FOUND ROWS: two
-- station='developmental' notes from 29 Sept, which are the only two rows in
-- the table. The constraint would have rejected the entire contents of the
-- table it was meant to protect. The gate worked; the list was wrong.
--
-- Two things that fixes:
--   · the EDITORIAL stations were missing entirely, while the product's
--     central promise is an editor releasing notes AT an editorial station.
--     The five below are editing_phases.phase_name's own values (22 rows
--     each, read 2026-10-02) and the two existing action rows already use
--     that vocabulary rather than mine.
--   · 'marketing' was already a slot read by two meanings — my portal's
--     marketing-plan section, and editing_phases' phase 5. Mine is renamed
--     'marketing_plan' (no caller passed it, no row holds it) and 'marketing'
--     is left to the phase with 22 rows. That is publishing's 'route'
--     collision a second time in the same column, already live.
--
-- SAFETY. Validated against existing rows first; the ALTER is written to fail
-- rather than to coerce anything, and there is no backfill because there is
-- nothing to rewrite — an unexpected value must be SEEN, not corrected.

-- 1 · What is actually in there now. Run this first; if it returns any row,
--     STOP and courier me rather than applying the constraint — an existing
--     value outside the list is a fact about the estate and not a typo to fix.
select station, count(*)
from public.publisher_actions
where station not in (
  'developmental', 'line_editing', 'copy_editing', 'publishing', 'marketing',
  'cover', 'route', 'manuscript', 'marketing_plan', 'channel'
)
group by station;

-- 2 · The constraint. NOT VALID is deliberately NOT used: if step 1 is empty
--     the table is clean, and a constraint that skips its own verification is
--     the dead-gate shape this estate keeps finding.
alter table public.publisher_actions
  add constraint publisher_actions_station_check
  check (station in (
    'developmental', 'line_editing', 'copy_editing', 'publishing', 'marketing',
    'cover', 'route', 'manuscript', 'marketing_plan', 'channel'
  ));

-- 3 · Confirm it exists and reads as intended.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.publisher_actions'::regclass
  and conname = 'publisher_actions_station_check';
