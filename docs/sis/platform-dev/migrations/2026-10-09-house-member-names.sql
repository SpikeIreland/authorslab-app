-- HOUSE MEMBER NAMES · the attribution question `publisher` asked
-- sysadmin, 2026-10-09
--
-- C1 attributes a note to a MEMBERSHIP and stores no name, so the surface can
-- say "You" or "A colleague" and nothing more. `publisher` asked for a ruling
-- rather than inventing one, and named the trap correctly:
--
--   "printing the house name against a colleague's note would be actor_firm
--    in the other direction"
--
-- ─── RULED: A JOIN, NOT A COLUMN ────────────────────────────────────────────
--
-- A stored label is a SNAPSHOT of a fact that already exists elsewhere. It
-- goes stale the moment someone changes their name, and it keeps being
-- rendered after it stops being true. `actor_firm` was a client-supplied
-- label defaulting to "Unnamed firm"; `completed_by_label` was added on
-- 30 September and has never been backfilled, so the column whose job is to
-- say who completed a stage says nothing on every row.
--
--   Two label columns in this schema, two failures, same cause: a copy of a
--   fact drifts from the fact, and nothing in the system notices.
--
-- The membership IS the attribution. The name resolves from it, live.
--
-- ─── WHY THIS NEEDS A FUNCTION RATHER THAN A PLAIN JOIN ─────────────────────
--
-- `publisher`'s route uses the SESSION client deliberately — against their own
-- lane's grain, so that RLS is exercised rather than bypassed. That is the
-- right call and it is exactly why a plain join will not work: `author_profiles`
-- is scoped to its owner, so an editor reading a colleague's note gets no row
-- and the name silently resolves to nothing.
--
-- So: a SECURITY DEFINER function that exposes DISPLAY NAMES ONLY, and only
-- for people who share a house with the caller. It returns a name or it
-- returns nothing; it is not a route to a profile.

begin;

create or replace function public.house_member_name(p_membership uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(btrim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), '')
    from public.org_memberships target
    join public.author_profiles p on p.auth_user_id = target.auth_user_id
   where target.id = p_membership
     -- The caller must share a house with the subject. Without this clause a
     -- SECURITY DEFINER function resolves any membership id in the database to
     -- a real person's name, which is a directory of every customer's staff
     -- behind a uuid guess.
     and exists (
       select 1 from public.org_memberships caller
        where caller.organisation_id = target.organisation_id
          and caller.auth_user_id = auth.uid()
          and caller.status = 'active'
     );
$$;

comment on function public.house_member_name(uuid) is
  'Display name for a membership, resolved LIVE rather than stored. Returns NULL when the caller shares no house with the subject, and NULL when no name is recorded — an honest absence, which the surface renders as "A colleague" rather than inventing one. SECURITY DEFINER because author_profiles is owner-scoped and publisher routes deliberately use the session client so RLS is exercised.';

commit;

-- ─── CONTROLS · signed in as yourself in the app, not in the SQL editor ─────
--
-- N1 · Your own membership resolves to your name:
--        select public.house_member_name('<your org_memberships.id>');
--      EXPECT: your name.
--
-- N2 · THE ONE THAT MATTERS. A membership at a house you do not belong to
--      must resolve to NULL, not a name. There is one organisation today, so
--      this control cannot fire yet — and a control that cannot fire is not
--      a control. **It must be run on the day a second house exists**, and
--      that is recorded here rather than remembered.
--
-- N3 · A membership whose profile has no name recorded returns NULL, and the
--      surface renders "A colleague". An absent name is shown as absent,
--      never as a plausible default.
