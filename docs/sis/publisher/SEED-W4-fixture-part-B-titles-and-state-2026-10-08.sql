-- ============================================================================
-- W4 FIXTURE · PART B — titles and state for the Books list
-- publisher → sysadmin to apply.  2026-10-08
--
-- RELEASED by sysadmin's UNFREEZE §1. Their authorisation quotes my own
-- argument back: volume is not the specification, DISTRIBUTION is. So this
-- file does not contain two hundred hand-written rows. It contains the
-- distribution, and generates the rows from it — which is the only form in
-- which the specification can be reviewed, and the only form in which a
-- reviewer can see that a bucket is missing.
--
-- ─── WHAT THIS FILE WILL NOT DO ─────────────────────────────────────────────
--
--  * It does not UPDATE. It does not DELETE. Every statement is an INSERT.
--  * It never names a manuscript, author or imprint by id. sysadmin's own
--    constraint, and the reason for it is theirs: their seat script selected
--    BY OWNER — a safe rule — and that rule picked the worst copy of every
--    book, every time. A GUARD ON WHAT THE ROWS ARE survives a row moving;
--    a guard on a list of ids does not.
--  * It touches no real customer's rows. Measured 2026-10-08: 12 real titles
--    sit off any imprint across 6 authors, and 2 real titles sit on Meridian
--    Editions. This file writes only to Longshore Books and only rows it
--    creates itself.
--
-- ─── WHERE IT LANDS, AND WHY NOT ON THE DEMO IMPRINT ────────────────────────
--
-- Harrowgate House holds TWO imprints: Meridian Editions (the two real books
-- Carl demos) and Longshore Books (empty). The fixture goes on LONGSHORE.
--
-- Putting two hundred fixtures beside Carl's two real books would undo the
-- demo cleanup that took nine fixtures off the house on 6 October, and the
-- R9 sample marker would then be carrying the whole weight of the distinction
-- on the one surface where it matters most.
--
-- It also makes the imprint filter mean something. Today it is a control with
-- one option and nothing to filter — Paul switches imprint and the list does
-- not change, which is a control that fails silently in the quietest possible
-- way. After this, Meridian is the demo and Longshore is the instrument.
--
-- ─── STATE WITHOUT TEXT ─────────────────────────────────────────────────────
--
-- No `full_text`, no `chapters` rows, no report bodies. The Books list filters
-- and sorts on state, never on prose, so prose would be sixty megabytes bought
-- for nothing. `total_chapters` is a NUMBER on the manuscript; the chapter
-- rows that number describes are not created. That is a deliberate asymmetry
-- and it is the thing that makes this affordable.
--
-- ─── THE PREREQUISITE THIS FILE CANNOT SATISFY ──────────────────────────────
--
-- `author_profiles.auth_user_id` is NOT NULL (re-measured 2026-10-08), so a
-- fixture author needs an `auth.users` row, which is sysadmin's schema and not
-- mine. PART A is therefore sysadmin's: N fixture authors.
--
-- This file reads whatever fixture authors exist, BY PROPERTY, and distributes
-- round-robin. It is correct at the 9 that exist today and correct at the 60
-- `ux` asked for. It does not hard-code 60 and it does not fail if Part A has
-- not run — it will simply produce fewer distinct authors, and §9 reports
-- exactly that so the gap is visible rather than assumed.
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 0 · GUARDS.  Run these THREE queries first. STOP on any unexpected
--          result. Do not proceed on a "probably fine".
-- ════════════════════════════════════════════════════════════════════════════

-- 0.1 — The target imprint must exist and must be EMPTY.
--       Expected: exactly one row, titles = 0.
select i.id, i.name, o.name as organisation, count(m.id) as titles
from imprints i
join organisations o on o.id = i.organisation_id
left join manuscripts m on m.imprint_id = i.id
where i.name = 'Longshore Books' and o.name = 'Harrowgate House'
group by i.id, i.name, o.name;

-- 0.2 — The demo imprint must still hold exactly the two real books, and
--       neither may be flagged as a sample.
--       Expected: 2 rows, is_demo = false on both.
select m.title, m.is_demo
from manuscripts m
join imprints i on i.id = m.imprint_id
where i.name = 'Meridian Editions'
order by m.title;

-- 0.3 — There must be at least one fixture author to attach titles to.
--       Expected: count >= 1. If it is 0, PART A has not run; stop.
select count(*) as fixture_authors
from author_profiles ap
where exists (select 1 from manuscripts m where m.author_id = ap.id and m.is_demo);


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1 · THE DISTRIBUTION.  This is the specification; the rows fall out.
--
-- `ux` approved the shape with five amendments (2026-10-06) and every one of
-- them is a named bucket below rather than a comment. A bucket with no rows is
-- visible in §9's report, which is the point of expressing it this way.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- Resolve the target by PROPERTY, once, into a temp table. Nothing downstream
-- repeats the lookup, so nothing downstream can resolve it differently.
create temporary table _w4_target on commit drop as
select i.id as imprint_id
from imprints i
join organisations o on o.id = i.organisation_id
where i.name = 'Longshore Books' and o.name = 'Harrowgate House';

-- Refuse rather than write to the wrong place, or to nowhere.
do $$
begin
  if (select count(*) from _w4_target) <> 1 then
    raise exception 'W4: target imprint did not resolve to exactly one row — refusing to seed';
  end if;
  if (select count(*) from manuscripts m join _w4_target t on m.imprint_id = t.imprint_id) <> 0 then
    raise exception 'W4: target imprint is not empty — refusing to seed on top of existing rows';
  end if;
end $$;

-- The fixture authors, ordered deterministically so a re-run assigns the same
-- author to the same title. Selected BY PROPERTY: an author who already owns a
-- demo manuscript. No id list.
create temporary table _w4_authors on commit drop as
select ap.id, row_number() over (order by ap.id) - 1 as n
from author_profiles ap
where exists (select 1 from manuscripts m where m.author_id = ap.id and m.is_demo);

-- ── 1.1 · The long tail ────────────────────────────────────────────────────
-- NOT a uniform spread. A real house's list is mostly early and mostly quiet,
-- with a thin head in production. Uniform data makes a filter look like it
-- works: every bucket is populated, so nothing is ever empty and the
-- honest-absence path is never under load. These weights put the load where
-- the design is weakest.
--
--   phase 1 ......... 44%   just arrived, nothing to show
--   phase 2 ......... 22%   developmental running
--   phase 3 ......... 14%
--   phase 4 ......... 10%
--   phase 5 .........  7%   near handoff
--   complete ........  3%   past our stations
--
create temporary table _w4_plan on commit drop as
with s as (select g as i from generate_series(1, 192) g)
select
  i,
  case
    when i % 100 < 44 then 1
    when i % 100 < 66 then 2
    when i % 100 < 80 then 3
    when i % 100 < 90 then 4
    when i % 100 < 97 then 5
    else 5
  end                                                   as phase,
  (i % 100 >= 97)                                       as is_complete,
  -- Chapter counts spread across the measured band and outside it, so the
  -- density strip is exercised at both ends. 0 for some: a title can be on a
  -- list before anyone has chaptered it, and the strip must render nothing.
  case
    when i % 17 = 0 then 0
    when i % 11 = 0 then 148            -- past the density strip's 140 cap
    else 18 + (i * 7) % 72
  end                                                   as chapters,
  -- ~25% carry a handoff date. The other 75% are the honest-absence path, and
  -- they are the majority ON PURPOSE: that is the path under load.
  (i % 4 = 0)                                           as has_date,
  -- ~4% need the house. `ux`'s amendment: FEW, NOT ZERO. A list where nothing
  -- needs you cannot show you that something does.
  (i % 25 = 0)                                          as needs_house,
  -- Activity recency, for the stall rule and the sort.
  case when i % 23 = 0 then null else (i * 3) % 40 end  as days_since
from s;

-- ── 1.2 · The 192 generated titles ─────────────────────────────────────────
insert into manuscripts
  (title, author_id, imprint_id, is_demo, genre, total_chapters,
   current_word_count, current_phase_number, status, created_at, updated_at)
select
  -- Titles are plainly invented (Paul-ratified 2026-09-22) and deliberately
  -- repetitive in shape, because a list of distinctive titles is easier to
  -- scan than a real list and would flatter the design.
  concat(
    (array['The Salt','A Winter','Lamplight','The Quiet','Northward','The Gull',
           'Harrow','The Ninth','Saltmarsh','The Long'])[1 + (p.i % 10)],
    ' ',
    (array['Road','Season','House','Harbour','Crossing','Year','Letter',
           'Tide','Window','Orchard'])[1 + ((p.i / 10) % 10)],
    case when p.i % 31 = 0 then concat(' (Book ', 1 + (p.i % 3), ')') else '' end
  ),
  a.id,
  t.imprint_id,
  true,                                              -- R9: these ARE samples
  (array['Literary fiction','Crime','Historical','Speculative',
         'Contemporary'])[1 + (p.i % 5)],
  p.chapters,
  case when p.chapters = 0 then 0 else p.chapters * 2600 end,
  p.phase,
  case when p.is_complete then 'complete' else 'editing' end,
  now() - make_interval(days => 30 + (p.i * 2) % 300),
  case when p.days_since is null
       then now() - make_interval(days => 30 + (p.i * 2) % 300)
       else now() - make_interval(days => p.days_since) end
from _w4_plan p
join _w4_target t on true
join _w4_authors a on a.n = p.i % (select count(*) from _w4_authors);

-- ── 1.3 · The eight edge cases, written out ────────────────────────────────
-- Generated rows cannot carry these: each one is a specific adversarial
-- string or a specific collision, and a generator that produced them by
-- accident would not prove they had been thought about.
--
--   ux amendment 4 — deliberate sort ties, tie-break RULED title A-Z
--   ux amendment 5 — two search traps: a mid-title "The", and punctuation
--                    plus a diacritic
--
insert into manuscripts
  (title, author_id, imprint_id, is_demo, genre, total_chapters,
   current_word_count, current_phase_number, status, created_at, updated_at)
select v.title, a.id, t.imprint_id, true, v.genre, v.chapters,
       v.chapters * 2600, v.phase, 'editing',
       now() - interval '120 days',
       now() - make_interval(days => v.days_since)
from (values
  -- SEARCH TRAP 1: "the" in the middle. A naive prefix match misses it; a
  -- naive stop-word strip loses the word that distinguishes it.
  ('Across the Water, Slowly',        'Literary fiction', 41, 2, 9),
  -- SEARCH TRAP 2: punctuation and a diacritic. "Reneé" must be findable by
  -- "Renee", and the apostrophe must not end the query.
  ('Reneé''s Last Crossing',          'Crime',            33, 3, 4),
  -- SORT TIE 1 & 2: identical phase, identical recency. The tie-break is
  -- RULED title A-Z, so these two must come back in this order every time.
  ('Ashfield',                        'Historical',       52, 4, 6),
  ('Ashfield Revisited',              'Historical',       52, 4, 6),
  -- SORT TIE 3: a third row at the same phase and recency, placed between
  -- them alphabetically, so a two-element comparator cannot fake the rule.
  ('Ashfield Hall',                   'Historical',       52, 4, 6),
  -- A title with a very long name, for truncation.
  ('The Remarkable and Wholly Unexpected Second Life of Mr Augustin Pell',
                                      'Contemporary',     61, 1, 14),
  -- A one-word title, for the other end of the same axis.
  ('Tide',                            'Speculative',       8, 1, 2),
  -- Leading whitespace and a double space inside. Not malicious — just the
  -- kind of thing a real ingest produces, and it must not sort to the top.
  ('  Harrow  Green',                 'Crime',            27, 2, 31)
) as v(title, genre, chapters, phase, days_since)
join _w4_target t on true
join _w4_authors a on a.n = 0;

-- ── 1.4 · NULL-ACTIVITY ROW (ux amendment 4) ───────────────────────────────
-- One title that has never been touched since creation. The stall rule must
-- report "no activity recorded" rather than computing a days-since from a
-- creation date and presenting it as activity.
insert into manuscripts
  (title, author_id, imprint_id, is_demo, genre, total_chapters,
   current_word_count, current_phase_number, status, created_at, updated_at)
select 'The Unopened Box', a.id, t.imprint_id, true, 'Literary fiction', 0, 0, 1, 'uploaded',
       now() - interval '200 days', now() - interval '200 days'
from _w4_target t join _w4_authors a on a.n = 0;

commit;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2 · STATE.  Phases, dates, covers, series.
--          Everything below selects its targets BY PROPERTY — the fixture
--          rows are "is_demo AND on the Longshore imprint" — so no id from
--          step 1 is carried forward and nothing can be mis-addressed.
-- ════════════════════════════════════════════════════════════════════════════

begin;

create temporary table _w4_rows on commit drop as
select m.id, m.title, m.current_phase_number as phase, m.status,
       m.total_chapters as chapters,
       row_number() over (order by m.title) as n,
       extract(day from now() - m.updated_at)::int as days_since
from manuscripts m
join imprints i on i.id = m.imprint_id
join organisations o on o.id = i.organisation_id
where m.is_demo
  and i.name = 'Longshore Books'
  and o.name = 'Harrowgate House';

do $$
begin
  if (select count(*) from _w4_rows) = 0 then
    raise exception 'W4: no fixture rows found on the target imprint — step 1 did not run';
  end if;
end $$;

-- ── 2.1 · The five editing phases per title ────────────────────────────────
-- Phase statuses derive from the title's current phase:
--   below it  -> complete
--   equal to  -> active   (unless the manuscript is 'complete')
--   above it  -> pending
--
-- COMPLETION SOURCE, and the part that matters: a completed phase is marked
-- 'system' where the machine ran it and 'human' where a person recorded it,
-- and `completed_by_label` is set ONLY on the human rows — the machine does
-- not get a name. A `null` completion_source on a complete row renders as
-- StationMark's neutral "reached", so this seed deliberately leaves SOME
-- complete rows with a null source: that third state is reachable in
-- production (every row predating 2026-09-30 has it) and a fixture that
-- never produced it would hide the mark that exists for it.
insert into editing_phases
  (manuscript_id, phase_number, phase_name, phase_status, editor_name, editor_color,
   chapters_analyzed, chapters_approved, report_pdf_url,
   completion_source, completed_by_label, started_at, completed_at)
select
  r.id,
  d.phase_number,
  d.phase_name,
  case
    when r.status = 'complete'          then 'complete'
    when d.phase_number < r.phase       then 'complete'
    when d.phase_number = r.phase       then 'active'
    else 'pending'
  end,
  d.editor_name,
  d.editor_color,
  -- Chapter counts ONLY where the phase has done something. A pending phase
  -- carries NULL, not 0: null is "has not reported", 0 is "reported none",
  -- and the pass meter renders nothing for the first and a bar for the second.
  case
    when r.status = 'complete' or d.phase_number < r.phase then nullif(r.chapters, 0)
    when d.phase_number = r.phase and r.chapters > 0       then greatest(1, (r.chapters * 2) / 3)
    else null
  end,
  case
    when r.status = 'complete' or d.phase_number < r.phase then nullif(r.chapters, 0)
    when d.phase_number = r.phase and r.chapters > 0       then greatest(0, r.chapters / 3)
    else null
  end,
  -- A report exists for completed editorial phases only (1-3). Phases 4 and 5
  -- produce no PDF in this estate, and inventing one would put a row on the
  -- collateral shelf with nothing behind it.
  case
    when d.phase_number <= 3
     and (r.status = 'complete' or d.phase_number < r.phase)
    then concat('fixture://report/', r.id, '/phase-', d.phase_number, '.pdf')
    else null
  end,
  -- system / human / null, cycled so all three reach the surface.
  case
    when not (r.status = 'complete' or d.phase_number < r.phase) then null
    when (r.n + d.phase_number) % 7 = 0 then null        -- the "reached" mark
    when (r.n + d.phase_number) % 3 = 0 then 'human'
    else 'system'
  end,
  case
    when not (r.status = 'complete' or d.phase_number < r.phase) then null
    when (r.n + d.phase_number) % 7 = 0 then null
    when (r.n + d.phase_number) % 3 = 0
      -- Human completions carry a name on SOME rows only. A null label on a
      -- human row is "recorded by hand, no name captured", which is what
      -- every pre-backfill row in production actually is.
      then case when (r.n + d.phase_number) % 6 = 0 then null
                else (array['J. Attwell','M. Sandoval','P. Okonkwo',
                            'R. Lindqvist'])[1 + (r.n % 4)] end
    else null
  end,
  now() - make_interval(days => 60 + r.n % 120),
  case
    when r.status = 'complete' or d.phase_number < r.phase
    then now() - make_interval(days => 20 + (r.n + d.phase_number) % 90)
    else null
  end
from _w4_rows r
cross join (values
  (1, 'developmental', 'Alex',   '#7C9A7E'),
  (2, 'line_editing',  'Sam',    '#B5654A'),
  (3, 'copy_editing',  'Jordan', '#4E6B51'),
  (4, 'publishing',    'Taylor', '#A98A6B'),
  (5, 'marketing',     'Riley',  '#6B7FA8')
) as d(phase_number, phase_name, editor_name, editor_color);

-- ── 2.2 · Handoff dates on ~25%, and SOME of them late ─────────────────────
-- Late ones exist so the risk model has something to find. `ux`'s amendment:
-- a few, not zero. The rest carry no date at all, which is the path the
-- surface takes for most of a real list.
insert into title_target_dates (manuscript_id, kind, target_date, set_by_label)
select r.id, 'handoff',
       (case
          when r.n % 16 = 0 then current_date - ((r.n % 30) + 1)   -- already past
          else current_date + ((r.n * 11) % 180) + 7
        end),
       'W4 fixture'
from _w4_rows r
where r.n % 4 = 0;

-- A publication date on a subset of those, which is the publisher's own date
-- and includes the last mile. Always later than the handoff it belongs to.
insert into title_target_dates (manuscript_id, kind, target_date, set_by_label)
select d.manuscript_id, 'publication', d.target_date + 60, 'W4 fixture'
from title_target_dates d
join _w4_rows r on r.id = d.manuscript_id
where d.kind = 'handoff' and r.n % 8 = 0;

-- ── 2.3 · Cover states (ux amendment 3) ────────────────────────────────────
-- TWO of the three states are seeded here and the third is NOT. Stated
-- plainly rather than quietly omitted:
--
--   STATE 1  no cover            — every row not touched below. The majority.
--   STATE 2  cover chosen and renderable — selected_cover_url is an http URL,
--            so PublisherBookCover renders artwork.
--   STATE 3  cover EXISTS but this list cannot render it — seeded in 2.5.
--
-- State 3 is the one that proves `hasCoverAsset` — the field that stops the
-- list saying "No cover yet" about a book whose cover exists.
--
-- ANSWERED 2026-10-09. sysadmin: `cover_assets.created_by` points at
-- `auth.users.id`, measured at covers/intake/route.ts:356, not inferred. I
-- then read the constraints myself rather than take the one answer and run:
--
--   created_by               FK -> auth.users(id)
--   kind                     CHECK IN ('generated','uploaded')
--   origin                   CHECK IN ('generated','supplied')
--   supplied_has_supplier    CHECK origin='generated' OR supplied_by_label IS NOT NULL
--   manuscript_id            FK -> manuscripts(id) ON DELETE CASCADE
--
-- Two consequences worth stating. The fixture uses origin='generated', which
-- is the only value that does not oblige a supplier label — a 'supplied' row
-- would need a supplier this fixture does not have, and inventing one would
-- put a name on an artwork provenance record. And the CASCADE means STEP 4's
-- rollback already removes these rows with their titles: no second delete,
-- and no orphan if someone runs only the first statement.
insert into publishing_progress (manuscript_id, selected_cover_url)
select r.id,
       concat('https://images.authorslab.ai/fixture/', r.n % 6, '.jpg')
from _w4_rows r
where r.n % 9 = 0;

-- ── 2.5 · COVER STATE 3 — a cover that exists and cannot be shown here ─────
-- `ux` amendment 3's third state, and the most valuable of the three.
--
-- `created_by` is resolved BY PROPERTY from a fixture author's own
-- `auth_user_id` — no uuid literal, consistent with the id guard that governs
-- this whole file. `rights_confirmed` is left NULL ON PURPOSE on half of
-- them: sysadmin measured NULL on all four of Veil's real concepts and ruled
-- that the Design tab must read "not recorded" rather than omit the field,
-- because a publishing house asks about artwork rights first and an omission
-- reads as an answer. A fixture that only produced `true` would never put
-- that path under load.
--
-- storage_path points at a path that does not exist, deliberately: this state
-- is about a row EXISTING, not about an image resolving, and the list signs
-- nothing. If a future surface tries to sign these it will fail loudly, which
-- is the correct way for a fixture to be wrong.
insert into cover_assets
  (manuscript_id, kind, origin, storage_path, created_by, rights_confirmed)
select r.id,
       'generated',
       'generated',
       concat('fixture/no-such-object/', r.id, '.png'),
       ap.auth_user_id,
       case when r.n % 2 = 0 then true else null end
from _w4_rows r
join manuscripts m on m.id = r.id
join author_profiles ap on ap.id = m.author_id
-- Rows 12, 24, 36 ... — a different slice from the 2.3 selection (n % 9) so
-- some titles land in state 2, some in state 3, and a few in BOTH, which is
-- the combination the list has to disambiguate.
where r.n % 12 = 0;

-- ── 2.4 · Three series, shaped against title-grouping (ux amendment 2) ─────
-- The amendment's point: a series must not be inferable from titles that look
-- alike, or the grouping is really doing the work and the relation is never
-- tested. So:
--
--   SERIES A — three books with UNRELATED titles. Nothing in the strings
--              suggests a series; only the relation does.
--   SERIES B — two books whose titles look like a series but are NOT members,
--              plus one that is. Title-grouping gets this exactly wrong.
--   SERIES C — a SINGLE-MEMBER series. A trilogy whose later books have not
--              arrived is still a series, and the panel must not treat one
--              member as a broken two.
--
-- Series names are plainly invented. No placeholder string reaches a screen:
-- sysadmin's SERIES_NAME_HERE on the real series is a separate, live issue,
-- and this file does not add a second one.
insert into manuscript_series (name) values
  ('The Longshore Cycle'),
  ('Tidewater'),
  ('The Orchard Sequence');

-- SERIES A — unrelated titles, deliberately.
insert into manuscript_series_members (series_id, manuscript_id, seq)
select (select id from manuscript_series where name = 'The Longshore Cycle'),
       r.id, v.seq
from (values ('Tide', 1), ('Across the Water, Slowly', 2), ('The Unopened Box', 3))
       as v(title, seq)
join _w4_rows r on r.title = v.title;

-- SERIES B — ONE of the three Ashfield titles. The other two are not members,
-- and they are the control: a grouping by title prefix would claim all three.
insert into manuscript_series_members (series_id, manuscript_id, seq)
select (select id from manuscript_series where name = 'Tidewater'),
       r.id, 1
from _w4_rows r where r.title = 'Ashfield Hall';

-- SERIES C — one member, on purpose.
insert into manuscript_series_members (series_id, manuscript_id, seq)
select (select id from manuscript_series where name = 'The Orchard Sequence'),
       r.id, 1
from _w4_rows r where r.title = 'Reneé''s Last Crossing';

commit;


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3 · THE REPORT.  Run after applying. This is the file's own check, and
--          it is written so a MISSING BUCKET IS VISIBLE rather than inferred
--          from a total that looks about right.
-- ════════════════════════════════════════════════════════════════════════════

with r as (
  select m.*, extract(day from now() - m.updated_at)::int as days_since
  from manuscripts m
  join imprints i on i.id = m.imprint_id
  join organisations o on o.id = i.organisation_id
  where m.is_demo and i.name = 'Longshore Books' and o.name = 'Harrowgate House'
)
select 'titles seeded'                as bucket, count(*)::text as value from r
union all select 'distinct authors',   count(distinct author_id)::text from r
union all select 'phase 1',            count(*)::text from r where current_phase_number = 1
union all select 'phase 2',            count(*)::text from r where current_phase_number = 2
union all select 'phase 3',            count(*)::text from r where current_phase_number = 3
union all select 'phase 4',            count(*)::text from r where current_phase_number = 4
union all select 'phase 5',            count(*)::text from r where current_phase_number = 5
union all select 'status complete',    count(*)::text from r where status = 'complete'
union all select 'zero chapters',      count(*)::text from r where coalesce(total_chapters,0) = 0
union all select 'over the 140 density cap', count(*)::text from r where total_chapters > 140
union all select 'with a handoff date',
  (select count(distinct manuscript_id)::text from title_target_dates d
    where d.kind='handoff' and d.manuscript_id in (select id from r))
union all select '  of which already past',
  (select count(distinct manuscript_id)::text from title_target_dates d
    where d.kind='handoff' and d.target_date < current_date
      and d.manuscript_id in (select id from r))
union all select 'with a publication date',
  (select count(distinct manuscript_id)::text from title_target_dates d
    where d.kind='publication' and d.manuscript_id in (select id from r))
union all select 'with a selected cover (state 2)',
  (select count(*)::text from publishing_progress p
    where p.selected_cover_url is not null and p.manuscript_id in (select id from r))
union all select 'cover state 3 — cover_assets rows (seeded in 2.5)',
  (select count(*)::text from cover_assets c where c.manuscript_id in (select id from r))
union all select '  of which rights_confirmed is NULL (reads "not recorded")',
  (select count(*)::text from cover_assets c where c.rights_confirmed is null
     and c.manuscript_id in (select id from r))
union all select 'titles in BOTH state 2 and state 3',
  (select count(*)::text from r
    where exists (select 1 from publishing_progress p
                   where p.manuscript_id = r.id and p.selected_cover_url is not null)
      and exists (select 1 from cover_assets c where c.manuscript_id = r.id))
union all select 'complete phases marked system',
  (select count(*)::text from editing_phases p where p.phase_status='complete'
     and p.completion_source='system' and p.manuscript_id in (select id from r))
union all select 'complete phases marked human',
  (select count(*)::text from editing_phases p where p.phase_status='complete'
     and p.completion_source='human' and p.manuscript_id in (select id from r))
union all select '  of which carry no name (reads "by hand")',
  (select count(*)::text from editing_phases p where p.phase_status='complete'
     and p.completion_source='human' and p.completed_by_label is null
     and p.manuscript_id in (select id from r))
union all select 'complete phases with NO source (reads "reached")',
  (select count(*)::text from editing_phases p where p.phase_status='complete'
     and p.completion_source is null and p.manuscript_id in (select id from r))
union all select 'active phases with null chapter counts',
  (select count(*)::text from editing_phases p where p.phase_status='active'
     and p.chapters_analyzed is null and p.manuscript_id in (select id from r))
union all select 'reports available',
  (select count(*)::text from editing_phases p where p.report_pdf_url is not null
     and p.manuscript_id in (select id from r))
union all select 'series created',
  (select count(*)::text from manuscript_series
    where name in ('The Longshore Cycle','Tidewater','The Orchard Sequence'))
union all select 'series members',
  (select count(*)::text from manuscript_series_members sm
    where sm.manuscript_id in (select id from r))
union all select 'REAL titles on Meridian (MUST be 2)',
  (select count(*)::text from manuscripts m2
     join imprints i2 on i2.id = m2.imprint_id
    where i2.name='Meridian Editions')
union all select 'REAL titles flagged demo anywhere (MUST be 0)',
  (select count(*)::text from manuscripts m3
     join imprints i3 on i3.id = m3.imprint_id
    where i3.name='Meridian Editions' and m3.is_demo);


-- ════════════════════════════════════════════════════════════════════════════
-- STEP 4 · ROLLBACK.  Property-scoped, never an id list.
--
-- Safe because the predicate is exactly what the seed wrote: demo rows on the
-- Longshore imprint. It cannot reach Carl's two books (not demo, different
-- imprint), the nine earlier fixtures (no imprint), or the twelve real
-- customer titles (no imprint, not demo).
--
-- Run only if the fixture is being withdrawn. Phases, dates, cover assets and
-- series members go with their titles by FK (cover_assets is ON DELETE
-- CASCADE, verified 2026-10-09); only the series shells are named.
-- ════════════════════════════════════════════════════════════════════════════
--
-- delete from manuscripts m
--  using imprints i, organisations o
--  where m.imprint_id = i.id and i.organisation_id = o.id
--    and m.is_demo and i.name = 'Longshore Books' and o.name = 'Harrowgate House';
--
-- delete from manuscript_series
--  where name in ('The Longshore Cycle','Tidewater','The Orchard Sequence');
