-- DEMO · three corrections and the series
-- sysadmin, 2026-10-07. Written from the audit, not from guesses.
--
-- Delivers items 3, 4 and 5 of Paul's demo spec:
--   3 · only two books on the house list
--   4 · Veil's journey ends honestly at the Design Studio
--   5 · Signal carries Veil's collateral because it is book two
--
-- ┌──────────────────────────────────────────────────────────────────────┐
-- │ PAUL — ONE EDIT BEFORE YOU RUN THIS. The series needs a NAME, and    │
-- │ nobody has given it one. It is the label the Overview will show      │
-- │ ("Book 2 of ___"), so it goes in front of a customer. I am not       │
-- │ inventing it: a name I made up is the same class of thing as the     │
-- │ fabricated phase rows this file exists to remove.                    │
-- │ Replace SERIES_NAME_HERE in section 3.                               │
-- └──────────────────────────────────────────────────────────────────────┘

begin;

-- ─── 1 · ITEM 3 · the nine fixtures come off the house ─────────────────────
-- Harrowgate currently holds eleven titles: two real, nine seeded with zero
-- chapters. Clearing imprint_id on the nine leaves exactly the two books Paul
-- asked for, whichever way the dashboard scopes — by imprint or by
-- organisation. Moving them to the other imprint would only hide them from
-- one of those two readings.
--
-- Nothing is deleted. The rows keep their owners and return to being
-- author-side manuscripts, recoverable in one statement. The realistic
-- fixture house for filter testing (W4) is separate work and will be seeded
-- properly rather than reusing nine empty shells.
update public.manuscripts m
   set imprint_id = null
 where m.imprint_id in (select id from public.imprints
                         where slug in ('meridian-editions', 'longshore-books'))
   and not exists (select 1 from public.chapters c where c.manuscript_id = m.id);
-- Guarded on "has no chapters" rather than on a list of ids, so it cannot
-- reach Veil or Signal however the ids move.

-- ─── 2 · ITEM 4 · Veil's journey stops telling the truth at station 3 ──────
-- The audit found phases 4 (publishing/Morgan) and 5 (marketing/Riley) marked
-- COMPLETE on 37 of 37 chapters. Those stations were feature-gated out of
-- service in September; the work was never done and the editors never existed
-- in it. All five rows share identical microseconds — one seeded INSERT
-- wearing the shape of an editorial history.
--
--   A fabricated completion is worse than a missing one, because a gap
--   invites a question and a false claim closes it.
--
-- Returning 4 and 5 to pending is not a compromise on the demo: it produces
-- exactly what Paul asked for — the journey as far as the Design Studio, and
-- then nothing, because nothing after it is built.
--
-- Phases 1-3 are LEFT ALONE. They are also seeded rows, but there is real work
-- behind them: 531 findings, 32 chapter summaries and three report PDFs.
-- Their completion_source is NULL and stays NULL until `astudio` settles the
-- vocabulary — backfilling a value I invent today would repeat, in a new
-- column, the error this section removes.
update public.editing_phases
   set phase_status      = 'pending',
       completed_at      = null,
       started_at        = null,
       chapters_analyzed = 0,
       chapters_approved = 0
 where manuscript_id = 'c037e098-2f9c-4728-8ac3-f97fb40665fc'
   and phase_number in (4, 5);

-- ─── 3 · ITEM 5 · the series, declared not derived ─────────────────────────
-- Paul declared the order this morning: Veil and the Flame first, Signal and
-- the Shadow second. `seq` is a declaration and this is the declaration.
with s as (
  insert into public.manuscript_series (name)
  select 'SERIES_NAME_HERE'
   where not exists (
     select 1 from public.manuscript_series where name = 'SERIES_NAME_HERE'
   )
  returning id
), target as (
  select id from s
  union all
  select id from public.manuscript_series where name = 'SERIES_NAME_HERE'
  limit 1
)
insert into public.manuscript_series_members (series_id, manuscript_id, seq)
select t.id, v.manuscript_id, v.seq
  from target t
  cross join (values
    ('c037e098-2f9c-4728-8ac3-f97fb40665fc'::uuid, 1),
    ('14057c5e-cdab-435a-b489-aa4858a6925b'::uuid, 2)
  ) as v(manuscript_id, seq)
on conflict do nothing;
-- ON CONFLICT rather than a `not exists` guard: the primary key and the
-- unique(series_id, seq) do the work, so re-running this is safe by
-- construction rather than by my care. That distinction cost us a day.

commit;

-- ─── 4 · VERIFY ─────────────────────────────────────────────────────────────

-- 4a · The house list. EXPECT exactly two rows.
select m.title, i.name as imprint,
       (select count(*) from public.chapters c where c.manuscript_id = m.id) as chapters
  from public.manuscripts m
  join public.imprints i on i.id = m.imprint_id
 where i.organisation_id = (select organisation_id from public.imprints
                             where slug = 'meridian-editions')
 order by m.title;

-- 4b · Veil's journey. EXPECT complete, complete, complete, pending, pending.
select phase_number, phase_name, editor_name, phase_status,
       completed_at is not null as marked_complete
  from public.editing_phases
 where manuscript_id = 'c037e098-2f9c-4728-8ac3-f97fb40665fc'
 order by phase_number;

-- 4c · The series read both lanes consume. EXPECT one row:
--      Signal has one prior book, Veil, at seq 1.
select manuscript_id, series_name, this_seq, prior_title, prior_seq
  from public.v_manuscript_prior_books;
--
-- If this returns one row, item 5 of the demo is now a rendering job and
-- nothing else: `publisher` reads this view on the Overview and draws a
-- second collateral list. No new query, no new join, no new permission —
-- the view already applies the caller's scope through the members policy.

-- ─── STILL TO DO, NOT IN THIS FILE ─────────────────────────────────────────
--   · Veil's five empty-string chapter summaries — regenerate (astudio's
--     gap-fill filter, five calls), AND render '' as absence rather than as
--     a blank line. The second fix matters more: it catches the next one.
--   · cover_assets.rights_confirmed is NULL on all four of Veil's concepts.
--     Not false — unanswered. The Design tab must say "not recorded" rather
--     than omitting it. A publishing house asks about artwork rights first.
--   · The PWA manifest's start_url, for the home-screen icon (item 1).
--   · Signal's phase 1 reports 0 chapters analysed and 69 approved. Not in
--     the demo path, but one of those two numbers is false and neither has
--     been explained.
