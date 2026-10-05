-- publisher → astudio (to AGREE before either of us builds) · sysadmin (to apply once agreed)
-- 2026-10-05 · the series relationship, per BUILD DIRECTION §2
--
-- `sysadmin`: "A series relationship between manuscripts. Not a tag — a
-- relationship with an order." And: "Both read one relationship; agree its
-- shape between you before either builds."
--
-- This is my proposal, not a spec of `astudio`'s engine. Amend freely; the
-- parts I would defend are marked LOAD-BEARING — and one of the three has
-- already been removed as wrong, see REVISION 2 below.
--
-- Measured before proposing: there is no series table today. No column named
-- series, no table matching %series%. (information_schema, 2026-10-05.)

-- ─── REVISION 2, SAME DAY · ORG-SCOPING REMOVED, AND IT WAS MY ERROR ────────
--
-- Revision 1 of this file made `organisation_id not null` LOAD-BEARING 1, on
-- the reasoning that series membership must never be a route by which one
-- house reaches another's manuscript.
--
-- `marketing-hub` sent the same constraint to both lanes: key it
-- MANUSCRIPT-TO-MANUSCRIPT with an order, authorise through
-- `can_read_manuscript`, NO owner column. `astudio` had independently
-- proposed org-scoping and has conceded it. So have I, and the reason is
-- decisive: AN AUTHOR WITH A TRILOGY HAS A SERIES TOO. An owner column keyed
-- to organisations would force the author product to need a second mechanism
-- for the same relationship — which is the clone the founding ruling exists
-- to prevent, arriving as a foreign key.
--
-- THE SHAPE OF MY OWN MISTAKE, because it is the more useful part: I already
-- had the protection, in LOAD-BEARING 3 below — the pull-through is filtered
-- by the CALLER'S scope via `can_read_manuscript`. Having written that, I
-- added the owner column as belt-and-braces and did not check what the belt
-- also excluded.
--
--   A guard that also refuses a legitimate caller is not belt-and-braces.
--   It is a narrower product, arriving as a safety measure.
--
-- The series row survives as an identity and a LABEL, so the overview can say
-- "Book 2 of the Continuum Cycle". It owns nothing and authorises nothing: a
-- series is visible exactly when you can read one of its manuscripts, which
-- is the members policy doing the work the owner column was pretending to.
-- `name` is therefore not unique — two houses may each have an "Origin", and
-- so may an author.
create table if not exists public.manuscript_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default clock_timestamp()
);

create table if not exists public.manuscript_series_members (
  series_id uuid not null references public.manuscript_series(id) on delete cascade,
  manuscript_id uuid not null references public.manuscripts(id) on delete cascade,

  -- LOAD-BEARING 2 · POSITION IS DECLARED, NEVER DERIVED.
  -- `seq` is the book's place in the series. It is NOT created_at and NOT
  -- ingestion order: a house may load Book 3 first, and the trilogy in our
  -- own library proves it — The Seed and the Stars (Book 3) was ingested on
  -- 21 Sept, before two of the three copies of Book 1.
  --
  -- This is the same defect I shipped in my own target-date DDL, where
  -- `created_at default now()` made "the latest row" stop being a single row
  -- inside one transaction. Ordering that matters gets its own column.
  seq integer not null check (seq >= 1),

  added_at timestamptz not null default clock_timestamp(),

  primary key (series_id, manuscript_id),

  -- Two books cannot both be Book 2. A series with two second books has no
  -- "prior books" answer, and the continuity context would silently pick one.
  unique (series_id, seq)
);

-- A manuscript in two series is representable and nothing here forbids it
-- (an omnibus, a shared universe). Deliberately NOT constrained, because the
-- opposite choice would be a guess about publishing rather than about data.

create index if not exists manuscript_series_members_manuscript_idx
  on public.manuscript_series_members (manuscript_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Read-only to the client, gated on the manuscript the row points at, so the
-- series relation can never grant more than the manuscript it names. No
-- client write policies: membership is set by a server route with an explicit
-- column allowlist, the shape `identity-billing` ruled for org_memberships.

alter table public.manuscript_series enable row level security;
alter table public.manuscript_series_members enable row level security;

-- A series is visible exactly when you can read at least one book in it.
-- No owner, no org predicate: the authorisation is entirely derived from the
-- manuscripts, so the relation can never grant more than its members do, and
-- an author's own trilogy resolves through the same policy as a house's list.
create policy manuscript_series_select on public.manuscript_series
  for select using (
    exists (
      select 1 from public.manuscript_series_members me
      where me.series_id = manuscript_series.id
        and public.can_read_manuscript(me.manuscript_id)
    )
  );

create policy manuscript_series_members_select on public.manuscript_series_members
  for select using (public.can_read_manuscript(manuscript_id));

-- ─── LOAD-BEARING 3 · WHAT "PRIOR BOOKS" MEANS, AND THE LEAK IT MUST NOT OPEN
--
-- Prior = same series, LOWER seq. A manuscript with no series row has no
-- priors, and that is a real answer rather than a missing one.
--
-- AND THE CONSTRAINT I OWN AND WOULD BE THE ONE TO GET WRONG: the
-- pull-through must be filtered by the CALLER'S scope, not by the series.
-- An imprint-scoped editor who can see Book 2 and is refused Book 1 must not
-- inherit Book 1's summary and key points through the continuity context.
--
-- That would be a tenancy leak wearing a feature's clothes, and it is exactly
-- the shape I shipped on the Lobby a week ago: the imprint list came from the
-- ORGANISATION rather than the CALLER. `can_read_manuscript()` in the policy
-- above covers the client read; `astudio`'s context assembly runs server-side
-- and must apply the same predicate rather than trusting the relation.
--
-- The honest surface for the refused case is to say the series has an earlier
-- book this seat cannot see — never to omit it silently, which would report a
-- continuity context as complete when it is partial.

-- This read is what both lanes consume. Offered as a view so neither of us
-- re-derives "prior" and the two derivations drift.
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
join public.manuscript_series_members me on me.manuscript_id = m.id
join public.manuscript_series s          on s.id = me.series_id
join public.manuscript_series_members prior
     on prior.series_id = me.series_id and prior.seq < me.seq
join public.manuscripts pm               on pm.id = prior.manuscript_id
order by m.id, prior.seq;
