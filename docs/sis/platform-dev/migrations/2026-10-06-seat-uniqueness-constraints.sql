-- SEAT UNIQUENESS · the constraints the `not exists` guards were pretending to be
-- sysadmin, 2026-10-06
--
-- REPLACES 2026-10-06-imprint-seat-duplicate.sql, whose step 2 must NOT run:
-- there was never a duplicate. The two seat rows belong to two people, the
-- policy is correctly org-scoped, and the delete would have been a no-op
-- against a problem that did not exist.
--
-- What IS still true is that nothing in the schema prevents the duplicate I
-- went looking for. My seat script guarded its insert with `not exists`, which
-- is advisory: it loses to a second writer, to itself under concurrency, and
-- to anyone who writes the row by another path. A guard in one script is not
-- a rule about the data.

begin;

-- One person holds one seat at one imprint. Two rows would not be two seats;
-- they would be one seat recorded twice — and if they ever carried different
-- imprint_role values, nothing in the schema would say which one wins.
alter table public.imprint_memberships
  add constraint imprint_memberships_one_seat_per_member
  unique (imprint_id, membership_id);

-- The same gap one level up. Separate statement on purpose: if this one fails,
-- there are already duplicate org memberships, and that is a finding in its
-- own right rather than something to absorb inside another fix.
alter table public.org_memberships
  add constraint org_memberships_one_membership_per_person
  unique (organisation_id, auth_user_id);

commit;

-- ─── CONTROL · a constraint nobody has watched refuse is not known to work ──
--
--   insert into public.imprint_memberships (imprint_id, membership_id, imprint_role)
--   select imprint_id, membership_id, 'viewer'
--     from public.imprint_memberships limit 1;
--
-- EXPECT: duplicate key value violates unique constraint. If it succeeds, the
-- constraint did not take and the seat table is still writable twice.

-- ─── RECORDED, NOT CHANGED · the read asymmetry is deliberate ───────────────
--
-- Measured this turn:
--
--   imprint_memberships SELECT  is_admin() OR is_org_member(<imprint's org>)
--   org_memberships     SELECT  is_admin() OR is_org_member(organisation_id)
--   manuscripts (leg 2)         org membership AND (owner/admin OR imprint seat)
--
-- So ORG MEMBERSHIP ALONE READS PEOPLE, BUT NOT BOOKS. A Harrowgate member
-- with a seat only at Meridian can see who is seated at Longshore, and cannot
-- read a single Longshore manuscript.
--
-- That is the right way round — a staff directory is what a house is, and a
-- manuscript is what it protects — but it has never been WRITTEN DOWN, which
-- is why three rounds went into deciding whether it was a defect. It is
-- recorded here as a decision so the next person reads it instead of
-- rediscovering it.
--
-- Both policies are org-scoped. Nothing crosses a house boundary.
