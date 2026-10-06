-- PAUL'S EDITORIAL SEAT · PART 1 OF 2 · DISCOVERY ONLY
-- sysadmin, 2026-10-06
--
-- READ-ONLY. Nothing here writes. Run it in the Supabase SQL editor and send
-- me the output; I write Part 2 (the seat itself) from what it returns.
--
-- WHY DISCOVERY FIRST RATHER THAN A SEAT SCRIPT: I can read the app's queries
-- but not your database, so I know the TABLES involved (org_memberships,
-- imprints, imprint_memberships, author_profiles) and not their COLUMNS. A
-- seat script written from guessed column names either fails loudly, which
-- wastes a round trip, or succeeds against the wrong column, which is worse —
-- it would seat you in a way that LOOKS right and exercises nothing.
--
-- THE GOAL, so the output can be judged against it: you sign in as an
-- ORDINARY EDITORIAL DIRECTOR at one house. Not an admin.
--
--   role = 'admin' short-circuits can_read_manuscript() before either
--   membership leg runs. An admin sees every manuscript on the platform, so
--   the tenancy model is never exercised and the walkthrough certifies
--   nothing. If the product is awkward under real scope, that is the finding.

-- ── 1 · Does the account exist, and what does it hold? ──────────────────────
select
  p.id,
  p.auth_user_id,
  p.role,
  p.is_admin,
  p.is_beta_tester
from public.author_profiles p
join auth.users u on u.id = p.auth_user_id
where u.email in ('paul.lyons@authorslab.ai', 'paul.lyons67@icloud.com');
-- Expect: possibly zero rows. If the auth user does not exist, create it
-- through the normal sign-up flow first — do NOT insert into auth.users by
-- hand. Report which emails came back.

-- ── 2 · The shape of the three membership tables ────────────────────────────
-- This is the part I cannot infer. Column names, types, nullability.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('org_memberships', 'imprints', 'imprint_memberships', 'organisations', 'organizations')
order by table_name, ordinal_position;

-- ── 3 · What houses and imprints already exist? ─────────────────────────────
-- If there is already a Spike Island or High Line org, you join it rather
-- than creating a second one. Two orgs with the same name is the duplicate
-- problem we are currently cleaning up, arriving by a different door.
select 'imprints' as t, i.* from public.imprints i limit 20;

-- ── 4 · The roles the membership tables will accept ─────────────────────────
-- A CHECK constraint or enum here decides what you can be seated as. Seating
-- you as a role the constraint rejects fails; seating you as one it accepts
-- but the app does not read is the silent version of the same mistake.
select
  c.conrelid::regclass as table_name,
  c.conname,
  pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid::regclass::text in
      ('org_memberships', 'imprint_memberships', 'imprints', 'author_profiles')
  and c.contype in ('c', 'f');

-- ── 5 · What can_read_manuscript actually requires ──────────────────────────
-- The function is the authorisation boundary for everything you will walk
-- through. Reading its body tells me exactly which rows must exist for a
-- manuscript to be visible to you, rather than inferring it from the schema.
select pg_get_functiondef(to_regprocedure('public.can_read_manuscript(uuid)'));

-- ── 6 · Which books are candidates for your house's list ────────────────────
-- Titles only, with their current owner, so you can say which belong on the
-- list and so nothing belonging to a real customer is swept in. Dellna
-- Illavia's titles must not appear on any house list.
select
  m.id,
  m.title,
  u.email as owner_email,
  m.current_word_count,
  (select count(*) from public.chapters ch where ch.manuscript_id = m.id) as chapters
from public.manuscripts m
left join public.author_profiles p on p.id = m.author_id
left join auth.users u on u.id = p.auth_user_id
order by u.email, m.title;

-- ── WHAT PART 2 WILL DO, so there are no surprises ──────────────────────────
--
--   1. Set role = 'author' on your profile (NOT 'admin'), and
--      is_admin = true, which despite its name is the paywall grant and is
--      being renamed has_full_access.
--   2. Create or join one house, with one imprint.
--   3. Give you a real seat in both, at an editorial role the app reads.
--   4. Put a named set of titles on that house's list.
--   5. Ship a control: a manuscript you should NOT be able to see, with the
--      query that proves you cannot. A seat that can see everything has not
--      been tested; it has been bypassed.
