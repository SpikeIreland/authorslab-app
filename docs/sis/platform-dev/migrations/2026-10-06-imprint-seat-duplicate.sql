-- THE DUPLICATE IMPRINT SEAT
-- sysadmin, 2026-10-06
--
-- /api/whoami returned Paul's Meridian editor seat TWICE. One org membership,
-- one imprint, two identical seat rows.
--
-- TWO CANDIDATE CAUSES AND THEY ARE NOT THE SAME PROBLEM:
--
--   A. The row really is duplicated. My seat script's insert carries a
--      `not exists` guard, but there is NO UNIQUE CONSTRAINT behind it — and
--      a guard without a constraint is advisory. Any second writer, or the
--      same writer racing itself, creates a second seat. (`org_memberships`
--      has the same gap: nothing stops one person holding two memberships of
--      one house.)
--
--   B. The row is somebody else's, and RLS on imprint_memberships is not
--      scoped to the viewer. /api/whoami selects the table with no user
--      filter deliberately, so what comes back is whatever the policy allows.
--      Two rows would then mean Paul can see another person's seat.
--
-- B IS THE SERIOUS ONE. A duplicated row is untidy; a seat table readable
-- across people is a tenancy defect on the exact surface the product sells.
-- Run step 1 before step 2 — the fix for A would quietly mask B.

-- ─── 1 · WHICH IS IT? ───────────────────────────────────────────────────────
select im.id                as seat_id,
       im.imprint_role,
       i.name               as imprint,
       om.id                as membership_id,
       u.email              as seat_belongs_to
  from public.imprint_memberships im
  join public.imprints i         on i.id = im.imprint_id
  join public.org_memberships om on om.id = im.membership_id
  left join auth.users u         on u.id = om.auth_user_id
 order by u.email, i.name;
--
--   Two rows, SAME email, same membership_id  → cause A. Go to step 2.
--   Two rows, DIFFERENT emails                → cause B. STOP and tell me;
--                                                step 2 would delete nothing
--                                                and hide a live leak.

-- ─── 2 · ONLY IF STEP 1 SHOWED CAUSE A ─────────────────────────────────────
begin;

-- Keep the oldest seat per (imprint, membership); drop the rest.
delete from public.imprint_memberships im
 where im.id not in (
   select distinct on (imprint_id, membership_id) id
     from public.imprint_memberships
    order by imprint_id, membership_id, created_at asc
 );

-- The constraint the `not exists` guard was pretending to be.
-- One person holds one role at one imprint. A second row is not a second
-- seat, it is the same seat recorded twice — and if the two rows ever carry
-- different imprint_role values, nothing in the schema says which one wins.
alter table public.imprint_memberships
  add constraint imprint_memberships_one_seat_per_member
  unique (imprint_id, membership_id);

-- Same gap one level up. Deliberately separate: if this one fails, there are
-- duplicate org memberships too and that is a finding in its own right rather
-- than something to clean up inside another fix.
alter table public.org_memberships
  add constraint org_memberships_one_membership_per_person
  unique (organisation_id, auth_user_id);

commit;

-- ─── 3 · VERIFY ─────────────────────────────────────────────────────────────
-- Re-open /api/whoami. imprint_seats should hold exactly one entry.
--
-- AND THE CONTROL, because a constraint nobody has watched refuse is not
-- known to work. Run it and expect it to FAIL:
--
--   insert into public.imprint_memberships (imprint_id, membership_id, imprint_role)
--   select imprint_id, membership_id, 'viewer'
--     from public.imprint_memberships limit 1;
--   -- expect: duplicate key value violates unique constraint
--
-- If that insert succeeds, the constraint did not take and the seat table is
-- still writable twice.
