-- C1 · PUBLISHER NOTES
-- sysadmin, 2026-10-09. The gate on `ux`'s studio spec.
--
-- `publisher` wrote this in the reading room's own header and I carried it
-- unactioned for three days:
--
--   "Notes are REAL within the session and attributed, but NOT PERSISTED —
--    there is no publisher-notes table yet."
--
-- So an editor writes a note and it is gone with the page. `ux` named why that
-- gates the studio: a note control that forgets claims what the system does
-- not do. In a demo it is worse than having no notes at all.
--
-- ─── THE THING THAT ALMOST WENT WRONG, AND IT IS THE WHOLE DESIGN ───────────
--
-- The obvious predicate for these policies is `can_read_manuscript()`. It is
-- the predicate every other table uses, it is correct, and it would have been
-- a serious mistake here.
--
-- `can_read_manuscript()` has TWO legs. Leg 2 is publisher staff through the
-- imprint. LEG 1 IS THE AUTHOR OF THE MANUSCRIPT.
--
-- These notes are the HOUSE's internal editorial working. The founding ruling
-- says editorial output reaches an author as a deliverable — a package, sent
-- by a named person, when the house decides. Using can_read_manuscript() here
-- would have given every author a live feed of their editors' unfinished
-- opinions about their book, through a function whose name says "read".
--
--   A predicate that is correct everywhere else is not thereby correct here.
--   Reuse is an argument about effort, never about authorisation.
--
-- So this migration adds the publisher leg ALONE, as its own named function.

begin;

-- ─── PRECONDITION ───────────────────────────────────────────────────────────
do $$
begin
  if to_regprocedure('public.can_read_manuscript(uuid)') is null then
    raise exception 'ABORT: can_read_manuscript(uuid) missing; this migration mirrors its second leg and must not drift from a function that is not there.';
  end if;
end $$;

-- ─── 1 · THE PUBLISHER LEG, ALONE ───────────────────────────────────────────
-- Deliberately a copy of can_read_manuscript()'s leg 2 and NOT a call to it.
-- The two must be able to diverge: if the author leg ever widens, nothing
-- about house-internal notes should widen with it.
create or replace function public.can_work_manuscript_as_house(p_manuscript uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.manuscripts m
      join public.imprints i          on i.id = m.imprint_id
      join public.org_memberships om  on om.organisation_id = i.organisation_id
                                     and om.auth_user_id = auth.uid()
                                     and om.status = 'active'
      left join public.imprint_memberships im on im.imprint_id = i.id
                                             and im.membership_id = om.id
     where m.id = p_manuscript
       and (om.org_role in ('owner','admin') or im.id is not null)
  );
$$;

comment on function public.can_work_manuscript_as_house(uuid) is
  'TRUE when the caller holds a house seat that reaches this manuscript. Deliberately EXCLUDES the author: can_read_manuscript() leg 1 grants the writer their own book, and house-internal editorial notes are not theirs to read. Notes reach an author as a package, sent by a named person, when the house decides.';

-- ─── 2 · THE TABLE ──────────────────────────────────────────────────────────
create table if not exists public.publisher_notes (
  id             uuid primary key default gen_random_uuid(),
  manuscript_id  uuid not null references public.manuscripts(id) on delete cascade,

  -- NULL means a note on the book rather than on a chapter. A real answer,
  -- not a missing one.
  chapter_number integer check (chapter_number is null or chapter_number >= 0),

  body           text not null check (length(btrim(body)) > 0),

  -- The actor, as a MEMBERSHIP rather than a user: the note was made by a
  -- person in a seat at a house, and the seat is the part that matters when
  -- the person later leaves. `publisher_actions` already took this shape after
  -- actor_firm was found defaulting to "Unnamed firm" — a decision attributed
  -- to someone who was not there.
  author_membership_id uuid not null references public.org_memberships(id),

  created_at     timestamptz not null default clock_timestamp(),
  updated_at     timestamptz not null default clock_timestamp()
);

create index if not exists publisher_notes_manuscript_idx
  on public.publisher_notes (manuscript_id, chapter_number);

-- ─── 3 · RLS · the house leg only, on every verb ────────────────────────────
alter table public.publisher_notes enable row level security;

drop policy if exists publisher_notes_select on public.publisher_notes;
create policy publisher_notes_select on public.publisher_notes
  for select to authenticated
  using (public.can_work_manuscript_as_house(manuscript_id));

-- INSERT carries a second clause the others do not need: the membership named
-- as the author must be the CALLER'S OWN. Without it a seated editor could
-- file a note under a colleague's name, which is the attribution defect this
-- estate removed from publisher_actions arriving through a different door.
drop policy if exists publisher_notes_insert on public.publisher_notes;
create policy publisher_notes_insert on public.publisher_notes
  for insert to authenticated
  with check (
    public.can_work_manuscript_as_house(manuscript_id)
    and exists (
      select 1 from public.org_memberships om
       where om.id = author_membership_id
         and om.auth_user_id = auth.uid()
         and om.status = 'active'
    )
  );

-- A note is amendable and deletable BY ITS AUTHOR ONLY. An editorial opinion
-- with someone else's name on it is not a record.
drop policy if exists publisher_notes_update on public.publisher_notes;
create policy publisher_notes_update on public.publisher_notes
  for update to authenticated
  using (
    public.can_work_manuscript_as_house(manuscript_id)
    and exists (
      select 1 from public.org_memberships om
       where om.id = author_membership_id and om.auth_user_id = auth.uid()
    )
  );

drop policy if exists publisher_notes_delete on public.publisher_notes;
create policy publisher_notes_delete on public.publisher_notes
  for delete to authenticated
  using (
    public.can_work_manuscript_as_house(manuscript_id)
    and exists (
      select 1 from public.org_memberships om
       where om.id = author_membership_id and om.auth_user_id = auth.uid()
    )
  );

-- updated_at is server-derived. A client-supplied timestamp is a claim about
-- when something happened, made by the party with an interest in the answer.
create or replace function public.publisher_notes_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists publisher_notes_touch on public.publisher_notes;
create trigger publisher_notes_touch
  before update on public.publisher_notes
  for each row execute function public.publisher_notes_touch();

commit;

-- ─── 4 · CONTROLS · each must prove it can fail ─────────────────────────────
--
-- Run these SIGNED IN AS YOURSELF IN THE APP, via /api/whoami or a route —
-- NOT in the SQL editor, where auth.uid() is null and every check fails for
-- the wrong reason. That mistake cost two rounds on 6 October.
--
-- C1 · THE ONE THAT MATTERS. The author of a manuscript must NOT be able to
--      read the house's notes on it. Sign in as carl@spikeisland.tv, whose
--      own book is on Meridian:
--        select count(*) from public.publisher_notes
--         where manuscript_id = 'c037e098-2f9c-4728-8ac3-f97fb40665fc';
--      EXPECT 0 even when notes exist. If it returns rows, the author leg has
--      leaked in and the deliverable model is broken at the database.
--
-- C2 · A seated editor cannot file a note under a colleague's membership.
--      INSERT with another membership's id. EXPECT: policy violation.
--
-- C3 · A seat at Longshore cannot read notes on a Meridian title.
--      EXPECT 0.
--
-- C4 · An editor cannot amend a colleague's note. UPDATE someone else's row.
--      EXPECT: zero rows affected.
--
-- ─── WHAT THIS DOES NOT DO ──────────────────────────────────────────────────
--
-- No status, no resolution, no threading, no agreement loop. The agreement
-- loop and the notes package are D2 and D5 and are still frozen; adding
-- columns for them now would be specifying a surface nobody has designed.
-- A note is a note. `publisher` asks when it needs more.
