-- marketing-hub → sysadmin + Paul. TWO statements, in this order.
--
-- HOUSE RULES: this is a CHECK-constrained column, so per §Data rules it
-- requires PAUL'S EXPLICIT ACCEPTANCE before it runs. The schema is the
-- contract every derivation reads.
--
-- WHY THIS EXISTS: astudio and publisher both concluded the phase-5
-- Quinn → Riley backfill needs no code change and no migration. The backfill
-- alone FAILS — the CHECK constraint does not list 'Riley':
--   CHECK (editor_name = ANY (ARRAY['Alex','Sam','Jordan','Taylor','Morgan','Quinn']))
-- Widen first, then backfill.

-- 1 · Admit Riley. Quinn is retained here deliberately: dropping it in the
--     same statement would make step 2 unrunnable against existing rows.
alter table public.editing_phases
  drop constraint if exists editing_phases_editor_name_check;

alter table public.editing_phases
  add constraint editing_phases_editor_name_check
  check (editor_name = any (array['Alex','Sam','Jordan','Taylor','Morgan','Riley','Quinn']));

-- 2 · Backfill phase 5. Expect UPDATE 12.
update public.editing_phases
   set editor_name = 'Riley'
 where phase_number = 5
   and editor_name  = 'Quinn';

-- Commissioning check — expect phase 5 = Riley, 12 rows, and no Quinn anywhere:
--   select phase_number, editor_name, count(*)
--     from public.editing_phases group by 1,2 order by 1,2;

-- NOT done here, deliberately: dropping 'Quinn' from the constraint. That is a
-- separate post-demo act, once nothing reads or writes it. Turning a name off
-- is half an act — the callers get swept first.
