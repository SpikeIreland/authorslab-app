-- PAUL'S EDITORIAL SEAT · PART 2 OF 2 · THE SEAT
-- sysadmin, 2026-10-06. Written from the discovery output, not from guesses.
--
-- Run the whole file in the Supabase SQL editor. It is one transaction: it
-- either completes or changes nothing. Then run the CONTROL at the foot,
-- SIGNED IN AS YOURSELF IN THE APP, not here.
--
-- ─── WHAT THE DISCOVERY FOUND, AND WHAT IT MEANS ───────────────────────────
--
-- can_read_manuscript()'s leg 2 — the publisher leg — requires the manuscript
-- to carry an `imprint_id`. An ordinary editorial seat reaches a book ONLY
-- through an imprint.
--
-- Your content-bearing books are author-side. The house (one organisation,
-- two imprints, eight @harrowgate.example authors) has eight titles with
-- ZERO CHAPTERS each.
--
--   THE HOUSE HAS NO BOOKS AND THE BOOKS HAVE NO HOUSE.
--
-- That is "I have no Publisher product at all", expressed as rows. It is also
-- why nobody noticed: every surface we built reads correctly against a list
-- that is empty of readable work.
--
-- ─── THE SEAT, AND WHY THESE VALUES ────────────────────────────────────────
--
--   org_role = 'member'      NOT owner/admin. owner and admin satisfy leg 2
--                            on their own, for the WHOLE organisation, and
--                            the imprint scoping is then never exercised.
--   status   = 'active'      leg 2 requires it explicitly.
--   imprint_role = 'editor'  of the three (publisher|editor|viewer), the one
--                            that matches the chair you are testing.
--   role     = 'author'      on author_profiles. NOT 'admin' — is_admin()
--                            short-circuits the whole function.
--
-- Everything is keyed on your email, so nothing depends on me having guessed
-- which of the two profiles in the discovery output was yours.

begin;

-- ─── 1 · PRECONDITIONS ──────────────────────────────────────────────────────
do $$
declare
  v_uid uuid;
  v_org uuid;
begin
  select u.id into v_uid from auth.users u
   where u.email = 'paul.lyons@authorslab.ai';
  if v_uid is null then
    raise exception 'ABORT: no auth user for paul.lyons@authorslab.ai.';
  end if;

  select i.organisation_id into v_org from public.imprints i
   where i.slug = 'meridian-editions' and i.deleted_at is null;
  if v_org is null then
    raise exception 'ABORT: imprint meridian-editions not found.';
  end if;

  if to_regprocedure('public.can_read_manuscript(uuid)') is null then
    raise exception 'ABORT: can_read_manuscript(uuid) missing.';
  end if;
end $$;

-- ─── 2 · THE PROFILE · ordinary author role, entitlement kept ───────────────
-- role='author' so is_admin() is false and the membership legs actually run.
-- is_admin (the billing grant, being renamed has_full_access) stays true so
-- the paywall does not block the walkthrough.
update public.author_profiles p
   set role = 'author', is_admin = true
  from auth.users u
 where u.id = p.auth_user_id
   and u.email = 'paul.lyons@authorslab.ai';

-- ─── 3 · THE SEAT ───────────────────────────────────────────────────────────
insert into public.org_memberships
  (organisation_id, auth_user_id, org_role, status, accepted_at)
select i.organisation_id, u.id, 'member', 'active', now()
  from public.imprints i
 cross join auth.users u
 where i.slug = 'meridian-editions'
   and u.email = 'paul.lyons@authorslab.ai'
   and not exists (
     select 1 from public.org_memberships om
      where om.organisation_id = i.organisation_id
        and om.auth_user_id = u.id
   );

-- If a membership already existed in another state, make it the seat we want.
update public.org_memberships om
   set org_role = 'member', status = 'active',
       accepted_at = coalesce(om.accepted_at, now())
  from public.imprints i, auth.users u
 where i.slug = 'meridian-editions'
   and om.organisation_id = i.organisation_id
   and u.email = 'paul.lyons@authorslab.ai'
   and om.auth_user_id = u.id;

insert into public.imprint_memberships (imprint_id, membership_id, imprint_role)
select i.id, om.id, 'editor'
  from public.imprints i
  join public.org_memberships om on om.organisation_id = i.organisation_id
  join auth.users u on u.id = om.auth_user_id
 where i.slug = 'meridian-editions'
   and u.email = 'paul.lyons@authorslab.ai'
   and not exists (
     select 1 from public.imprint_memberships im
      where im.imprint_id = i.id and im.membership_id = om.id
   );

-- ─── 4 · PUT READABLE BOOKS ON THE HOUSE'S LIST ─────────────────────────────
-- ONLY manuscripts you own are touched. Nothing belonging to Carl, to Dellna
-- Illavia, to dfpjohno@icloud.com, or to the Harrowgate fixtures is altered.
-- Three titles with real chapters; TBA (0 words) is deliberately left off.
update public.manuscripts m
   set imprint_id = (select i.id from public.imprints i
                      where i.slug = 'meridian-editions')
  from public.author_profiles p
  join auth.users u on u.id = p.auth_user_id
 where p.id = m.author_id
   and u.email = 'paul.lyons@authorslab.ai'
   and m.id in (
     '5891a144-3e99-41ca-a289-3203ae36d12a',  -- CS The List          82 ch
     '4d0025e6-14cc-458b-a70c-f48593aff44d',  -- The Veil and the Flame 37 ch
     'b155f95d-4608-4b94-8d66-d3fd607ef503'   -- The Signal and the Shadow 69 ch
   );

commit;

-- ─── 5 · REPORT · read this before you sign in ─────────────────────────────

-- 5a · The seat as it now stands.
select o.name as house, i.name as imprint,
       om.org_role, om.status, im.imprint_role, p.role as profile_role, p.is_admin
  from auth.users u
  join public.author_profiles p   on p.auth_user_id = u.id
  join public.org_memberships om  on om.auth_user_id = u.id
  join public.organisations o     on o.id = om.organisation_id
  join public.imprints i          on i.organisation_id = o.id
  left join public.imprint_memberships im on im.imprint_id = i.id
                                         and im.membership_id = om.id
 where u.email = 'paul.lyons@authorslab.ai';
-- EXPECT: org_role=member, status=active, imprint_role=editor on Meridian
-- Editions and NULL on Longshore Books. profile_role=author, is_admin=true.

-- 5b · How much of the library is actually house-ingested.
select coalesce(i.name, '— no imprint (author-side) —') as imprint,
       count(*) as titles,
       count(*) filter (where (select count(*) from public.chapters c
                                where c.manuscript_id = m.id) > 0) as with_chapters
  from public.manuscripts m
  left join public.imprints i on i.id = m.imprint_id
 group by 1 order by 2 desc;
-- This is the number that matters. If the Harrowgate titles have no imprint
-- either, then before this script ran NOT ONE manuscript on the platform was
-- reachable by any publisher seat.

-- 5c · Your other account, reported rather than altered.
select u.email, p.role, p.is_admin
  from auth.users u join public.author_profiles p on p.auth_user_id = u.id
 where u.email in ('paul.lyons67@icloud.com', 'carl@spikeisland.tv');
-- One of the two profiles in the discovery output holds role='admin'. I have
-- not touched it, because changing an account you did not ask me to change is
-- how a walkthrough acquires a variable nobody declared.

-- ─── 6 · THE CONTROL · a check must prove it can fail ───────────────────────
--
-- RUN THIS SIGNED IN AS YOURSELF IN THE APP (SQL-editor sessions run as a
-- superuser and auth.uid() is null, so running it here proves nothing).
--
--   select public.can_read_manuscript('2ddc3889-e846-4e16-aece-d5b7efb8acf9');
--
-- That is Dellna Illavia's manuscript — a real third-party customer's book,
-- with no imprint, which you do not own. It MUST return false.
--
--   false → the seat is scoped. Walk the product.
--   true  → STOP. Either role is still 'admin' or something else is open.
--           Do not treat anything you then see as a finding about the
--           product; it would be a finding about the seat.
--
-- A seat that can see everything has not been tested. It has been bypassed.

-- ─── 7 · WHAT THIS DOES NOT FIX ────────────────────────────────────────────
--
-- The three books you will see are books YOU WROTE. can_read_manuscript()
-- leg 1 grants you those as their author regardless of any imprint, so your
-- walkthrough will exercise the publisher SURFACES but not the publisher READ
-- PATH. The first genuinely clean test needs a book with chapters that you do
-- not own, on your imprint. There is no such book today — the eight Harrowgate
-- titles have none, and everything with content belongs to you, to Carl, or to
-- a customer.
--
-- That is a finding about the product, not an obstacle to the walkthrough.
-- Start walking; the gap is the first line of the list.
