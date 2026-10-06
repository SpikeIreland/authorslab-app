-- publisher → sysadmin · READY TO APPLY (data seed, not DDL) · 2026-10-06
-- W4's prerequisite: a fixture house big enough to tell whether a filter works.
--
-- `sysadmin`, WALKTHROUGH 1 §W4: "seed the fixture library to a realistic size
-- before building this. Twelve titles cannot tell you whether a filter works.
-- A house's list is the one surface where the data volume is part of the
-- specification, and we have been designing it against a sample that hides
-- every problem it has."
--
-- Agreed, with one amendment that is the whole of this file:
--
--   VOLUME IS NOT THE SPECIFICATION. DISTRIBUTION IS.
--
-- Two hundred titles that are all identical test a filter no better than
-- twelve. A filter is exercised by the SHAPE of what it filters: a long tail,
-- a handful of urgent cases, states that are absent as well as present, and
-- strings that sort and search badly. Below is that shape, and each block says
-- which question it answers.
--
-- ─── WHAT I MEASURED FIRST, BECAUSE IT CHANGES THE TASK ─────────────────────
--
-- Harrowgate House, read this turn: 12 titles, and NINE OF THEM HAVE ZERO
-- CHAPTERS. They are shells — a title row, an author, an imprint, and nothing
-- else. So the list Paul is looking at when he asks for a filter has almost no
-- state to filter BY, and a station filter over it would return nothing
-- whatever it did.
--
-- That is a sharper version of your point: the fixture does not merely hide
-- the problems a filter has, it hides whether the filter is connected at all.
--
-- ─── AND THE THING THAT MAKES THIS AFFORDABLE ───────────────────────────────
--
-- STATE CAN BE SEEDED WITHOUT TEXT. The Books list filters on station, risk,
-- dates, imprint, title and author — none of which reads `full_text` or
-- chapter content. So this seeds phase rows, chapter rows with numbers and
-- titles, target dates and covers, and leaves `full_text` NULL and
-- `chapters.content` empty. Two hundred titles cost kilobytes rather than
-- sixty megabytes, and every column the list actually reads is populated.
--
-- A title with no text must still READ as having no text — it will show the
-- honest "nothing has arrived" states, which is correct for a fixture and is
-- itself worth looking at two hundred times.

begin;

-- ════════════════════════════════════════════════════════════════════════════
-- 0 · GUARDS. Stop on either.
-- ════════════════════════════════════════════════════════════════════════════

-- 0.1 · The target imprints must exist and belong to Harrowgate.
select o.name as org, i.name as imprint, i.id
from imprints i join organisations o on o.id = i.organisation_id
where o.slug = 'harrowgate-house' and i.deleted_at is null
order by i.name;
-- Expect exactly: Longshore Books, Meridian Editions. If not, STOP.

-- 0.2 · Nothing here may touch a row that is not seeded. Everything this file
--       inserts carries is_demo = true, and this is the count before:
select count(*) as demo_before from manuscripts where is_demo is true;

-- ════════════════════════════════════════════════════════════════════════════
-- 1 · AUTHORS — invented, and plainly so (Paul's ruling, 2026-09-22).
--
-- 60 authors for ~200 titles, so some authors have several books: that is what
-- makes "search by author" a real test rather than a one-to-one lookup.
--
-- NO auth.users rows. A publisher's author is a NAME ON A BOOK, not an
-- account — the structural form of two-worlds that `identity-billing` is
-- recording as a decision. Seeding accounts is how we ended up with nine
-- confirmed email addresses nobody ever clicked.
--
-- NOTE FOR `identity-billing`: author_profiles.auth_user_id is NOT NULL today,
-- which is the contradiction you measured. If it is still NOT NULL when this
-- is applied, this block CANNOT run as written and the seed needs either your
-- column change first or a shared "house author" placeholder — flagged rather
-- than worked around, because working around it is what produced the nine
-- accounts.
-- ════════════════════════════════════════════════════════════════════════════

-- Deliberately adversarial name set. Each group answers a search/sort question:
--   · two authors sharing a surname          -> does author search disambiguate
--   · a name with an apostrophe              -> does it break the query
--   · a name with a diacritic                -> does sort collate or crash
--   · a single-word name                     -> does "first last" splitting hold
--   · a very long name                        -> does the row layout survive
create temporary table _seed_authors (first_name text, last_name text) on commit drop;
insert into _seed_authors (first_name, last_name) values
  ('Annike','Vohs'),            ('Rosalind','Vohs'),        -- shared surname
  ('Fionnuala','O''Dempsey'),                               -- apostrophe
  ('Søren','Hallgrímsson'),     ('Zoé','Marchetti-Laval'),  -- diacritics
  ('Mbeki',''),                                             -- single name
  ('Bartholomew','Fenwick-Ashcombe-Pryor'),                 -- long
  ('Ada','Quill'),              ('Ada','Quilley'),          -- near-identical
  ('Jun','Park'),               ('June','Park');            -- prefix collision
-- …the remaining 49 are ordinary two-part invented names, generated below.

insert into _seed_authors (first_name, last_name)
select
  (array['Imogen','Caspar','Niamh','Tobias','Esme','Rafferty','Clementine','Ambrose',
         'Sorrel','Linus','Marigold','Barnaby','Wilhelmina','Osric','Delphine','Hal',
         'Verity','Cassius'])[1 + (n % 18)],
  (array['Ashdown','Blackwood','Carrow','Deane','Elverson','Fairweather','Glaister',
         'Harkness','Inchbold','Joyce','Kettleby','Lund','Merrow','Noakes','Ottoline',
         'Pike','Quennell'])[1 + (n % 17)] || case when n > 17 then ' ' || chr(65 + (n % 26)) else '' end
from generate_series(1, 49) as g(n);

insert into author_profiles (first_name, last_name, role, is_demo)
select trim(first_name), trim(last_name), 'author', true from _seed_authors
returning id;
-- ^ If `is_demo` does not exist on author_profiles, drop that column from this
--   insert and STOP to tell me: the sample marker on my surfaces reads
--   manuscripts.is_demo, but an unmarked author profile is a second
--   provenance question I would rather answer than discover.

-- ════════════════════════════════════════════════════════════════════════════
-- 2 · TITLES — 200, distributed rather than uniform.
--
-- The distribution is the specification. A real house's list is a long tail:
-- most titles idle or early, a minority in active editorial, a handful urgent.
-- A fixture where everything needs attention tests nothing, because the
-- surface's whole job is to separate the few from the many.
--
--   stations          ~35% not started · ~30% developmental · ~15% line
--                     ~10% copy · ~5% publishing · ~3% marketing · ~2% handed off
--   target dates      only ~25% have one — so "no date set" is the common case
--                     and the surface's honest-absence path is the one under
--                     load, which is where this lane's defects have all lived
--   covers            ~20% have a selection; the rest show the empty slot
--   imprints          roughly 60/40 across Meridian and Longshore, so an
--                     imprint filter and a search compose rather than one
--                     of them always returning everything
--
-- Adversarial titles, for sort and search:
--   · "The …" ×many          -> does sort strip the article or pile them up
--   · "A …", "An …"          -> same question, other articles
--   · a leading numeral      -> where does "1974" sort
--   · a leading quote mark   -> does it sort before everything and search at all
--   · two different books with the SAME title, different authors
--   · a title that is a substring of another ("Harbour" / "Cold Harbour")
--   · a 180-character title  -> does the row truncate or break the layout
-- ════════════════════════════════════════════════════════════════════════════

-- (Full INSERT withheld from this draft deliberately — see §4. The shape above
--  is what I am asking you to agree before I write 200 rows against it, because
--  the rows are cheap and the distribution is the part worth arguing about.)

-- ════════════════════════════════════════════════════════════════════════════
-- 3 · WHAT THIS SEED MUST NOT DO
-- ════════════════════════════════════════════════════════════════════════════
--
-- · No auth.users rows. See §1.
-- · No full_text, no chapter content. State without text; §0's note.
-- · is_demo = true on EVERY manuscript row, without exception.
--   `identity-billing`'s condition and mine: a seeded title with is_demo unset
--   renders on my surfaces as one of the house's OWN books, unmarked. One
--   column, silent, and it lands on the surface that carries the claim.
-- · Nothing touching the three REAL titles already on Meridian (§4 of the
--   companion courier) or any manuscript whose author holds an account.

commit;
