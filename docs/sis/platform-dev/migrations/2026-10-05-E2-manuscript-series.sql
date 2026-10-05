-- E2 · manuscript series relationship
-- sysadmin, 2026-10-05. Applies publisher's PROPOSAL-manuscript-series.sql as
-- agreed across three lanes (publisher wrote it, marketing-hub sent the
-- no-owner-column constraint, astudio conceded org-scoping and verified).
--
-- I am the gate on this and have been since yesterday. Paste into the Supabase
-- SQL editor and run as one statement.
--
-- SYSADMIN'S ONLY CHANGES to the agreed shape, both additive, neither altering
-- what the two reading lanes consume:
--
--   1. A PRECONDITION BLOCK. The whole migration depends on
--      public.can_read_manuscript(uuid) existing, because both RLS policies
--      call it. If it is absent the policies would be created and would then
--      fail at query time — a check that passes at migration and fails in
--      production. It raises here instead.
--
--   2. THE WRITE-SIDE PREDICATE astudio named and nobody had written. The
--      agreed file says membership is "set by a server route with an explicit
--      column allowlist" and leaves write integrity to that route. A trigger
--      enforces it in the database as well, because the server route is one
--      path and the service role is another.
--
-- NOT CHANGED, deliberately: no owner column, no organisation_id, seq declared
-- rather than derived, a manuscript may belong to two series, name not unique.
-- Those were argued and settled; I am applying them, not revisiting them.

begin;

-- ─── PRECONDITION ───────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.can_read_manuscript(uuid)') is null then
    raise exception
      'ABORT: public.can_read_manuscript(uuid) does not exist. Both RLS policies in this migration call it; creating them without it would produce policies that pass migration and fail at query time.';
  end if;
end $$;

-- ─── TABLES ─────────────────────────────────────────────────────────────────

create table if not exists public.manuscript_series (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default clock_timestamp()
);

comment on table public.manuscript_series is
  'A series identity and label. Owns nothing and authorises nothing: visibility is derived entirely from its members. name is deliberately not unique — two houses may each have an "Origin", and so may an author.';

create table if not exists public.manuscript_series_members (
  series_id      uuid not null references public.manuscript_series(id) on delete cascade,
  manuscript_id  uuid not null references public.manuscripts(id) on delete cascade,
  seq            integer not null check (seq >= 1),
  added_at       timestamptz not null default clock_timestamp(),

  primary key (series_id, manuscript_id),
  unique (series_id, seq)
);

comment on column public.manuscript_series_members.seq is
  'The book''s place in the series. DECLARED, never derived — not created_at, not ingestion order. A house acquires a backlist in whatever order the rights arrive. unique(series_id, seq) because two books cannot both be Book 2: a series with two second books has no "prior books" answer and the continuity context would silently pick one.';

create index if not exists manuscript_series_members_manuscript_idx
  on public.manuscript_series_members (manuscript_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Read-only to the client, gated on the manuscript each row points at, so the
-- relation can never grant more than the manuscripts it names. No client write
-- policies: membership is set server-side.

alter table public.manuscript_series         enable row level security;
alter table public.manuscript_series_members enable row level security;

drop policy if exists manuscript_series_select on public.manuscript_series;
create policy manuscript_series_select on public.manuscript_series
  for select using (
    exists (
      select 1
      from public.manuscript_series_members me
      where me.series_id = manuscript_series.id
        and public.can_read_manuscript(me.manuscript_id)
    )
  );

drop policy if exists manuscript_series_members_select on public.manuscript_series_members;
create policy manuscript_series_members_select on public.manuscript_series_members
  for select using (public.can_read_manuscript(manuscript_id));

-- ─── WRITE-SIDE PREDICATE ───────────────────────────────────────────────────
-- astudio: an owner column would still have bought WRITE integrity, which a
-- write-side predicate buys more cheaply and without costing the author case.
-- This is that predicate. It fires for every writer including the service
-- role, so it holds on the path the server route does not cover.

create or replace function public.manuscript_series_member_write_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_read_manuscript(new.manuscript_id) then
    raise exception
      'REFUSED: cannot add manuscript % to a series — the writer cannot read it. Series membership must never be a route to a manuscript the writer could not already reach.',
      new.manuscript_id;
  end if;
  return new;
end $$;

drop trigger if exists manuscript_series_members_write_guard
  on public.manuscript_series_members;
create trigger manuscript_series_members_write_guard
  before insert or update on public.manuscript_series_members
  for each row execute function public.manuscript_series_member_write_guard();

-- ─── THE READ BOTH LANES CONSUME ────────────────────────────────────────────
-- Offered as a view so neither lane re-derives "prior" and the two
-- derivations drift. Prior = same series, LOWER seq. A manuscript with no
-- series row has no priors, and that is a real answer, not a missing one.
--
-- NOTE FOR astudio: this view is NOT the authorisation boundary. Context
-- assembly runs server-side and must apply can_read_manuscript() per prior
-- book itself. An imprint-scoped editor who can see Book 2 and is refused
-- Book 1 must not inherit Book 1 through the continuity context — and the
-- refused case is surfaced explicitly (prior_books_withheld), never omitted
-- silently, which would report a partial context as complete.

create or replace view public.v_manuscript_prior_books as
select
  m.id                as manuscript_id,
  s.id                as series_id,
  s.name              as series_name,
  me.seq              as this_seq,
  prior.manuscript_id as prior_manuscript_id,
  pm.title            as prior_title,
  prior.seq           as prior_seq
from public.manuscripts m
join public.manuscript_series_members me    on me.manuscript_id = m.id
join public.manuscript_series s             on s.id = me.series_id
join public.manuscript_series_members prior on prior.series_id = me.series_id
                                           and prior.seq < me.seq
join public.manuscripts pm                  on pm.id = prior.manuscript_id
order by m.id, prior.seq;

commit;

-- ─── POST-RUN CHECKS · paste these separately and read the output ───────────
--
-- 1. Objects exist:
--      select table_name from information_schema.tables
--      where table_name like 'manuscript_series%';
--      -- expect: manuscript_series, manuscript_series_members
--
-- 2. RLS is on:
--      select relname, relrowsecurity from pg_class
--      where relname like 'manuscript_series%';
--      -- expect: both t
--
-- 3. The view answers "no series" correctly rather than erroring:
--      select count(*) from public.v_manuscript_prior_books;
--      -- expect: 0. There are no series rows yet, and that is the right
--      -- answer, not a broken one.
--
-- 4. THE CONTROL — a check must prove it can fail. The write guard should
--    REFUSE a manuscript the caller cannot read. Run as an authenticated
--    non-owner, not as service role:
--      insert into public.manuscript_series_members (series_id, manuscript_id, seq)
--      values ('<any series>', '<a manuscript you cannot read>', 1);
--      -- expect: REFUSED. If it succeeds, the guard is not working and
--      -- E3 must not be built on it.
--
-- ─── WHAT THIS DOES NOT DO ──────────────────────────────────────────────────
--
-- It creates no series and no members. seq is a DECLARATION and there is
-- nothing yet to declare it from: nobody has stated the reading order of
-- Carl's trilogy. astudio will not guess it and nor will publisher, and nor
-- will I. Until Paul declares it, E3 has an empty relation to read — which is
-- the correct behaviour, and the reason the view returns zero rather than
-- inventing an order from created_at.
