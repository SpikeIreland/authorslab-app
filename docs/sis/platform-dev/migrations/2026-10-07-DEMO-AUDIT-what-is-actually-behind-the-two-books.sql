-- DEMO AUDIT · what is actually behind the two books
-- sysadmin, 2026-10-07. READ-ONLY. Nothing writes.
--
-- Settles item 4 of Paul's demo spec: "The Veil and the Flame should show all
-- the collateral in the Overview Tab and the full journey up to and including
-- the Design Studio."
--
-- The SURFACES were built yesterday — the per-book tab strip (Overview ·
-- Manuscript · Design · Publishing · Marketing) and the rebuilt Overview with
-- its collateral list. What nobody has checked is whether the DATA fills them.
--
--   A tab that renders correctly against nothing looks identical to a tab
--   that renders correctly against something, until you open it in front of
--   a customer.
--
-- Veil   c037e098-2f9c-4728-8ac3-f97fb40665fc
-- Signal 14057c5e-cdab-435a-b489-aa4858a6925b
--
-- Run all five. Send me the output; the build order comes from it.

-- ─── 1 · THE HEADLINE · does each book have the things the Overview lists ──
select
  m.title,
  m.current_word_count                                           as words,
  (select count(*) from public.chapters c
    where c.manuscript_id = m.id)                                as chapters,
  (select count(*) from public.chapters c
    where c.manuscript_id = m.id
      and coalesce(nullif(trim(c.summary), ''), null) is not null) as real_summaries,
  (select count(*) from public.manuscript_issues mi
    where mi.manuscript_id = m.id)                               as findings,
  length(coalesce(m.full_analysis_text, ''))                     as report_chars,
  (select count(*) from public.editing_phases ep
    where ep.manuscript_id = m.id)                               as phase_rows,
  (select count(*) from public.editing_phases ep
    where ep.manuscript_id = m.id and ep.completed_at is not null) as phases_complete
from public.manuscripts m
where m.id in ('c037e098-2f9c-4728-8ac3-f97fb40665fc',
               '14057c5e-cdab-435a-b489-aa4858a6925b');
--
-- WATCH FOR: real_summaries counts only summaries with actual text. astudio
-- found Veil's five gaps are EMPTY STRINGS, not NULLs — which matters because
-- an empty string renders as a blank line where a NULL renders as an honest
-- absence. If real_summaries is 32 and chapters is 37, five chapters will show
-- a silent blank in the demo.

-- ─── 2 · THE DESIGN STUDIO · is there anything in it? ──────────────────────
-- This is the one I most expect to come back empty, and it is the last node
-- Paul wants to walk to.
select 'cover_assets'   as t, count(*) as n, max(created_at) as latest
  from public.cover_assets   where manuscript_id in ('c037e098-2f9c-4728-8ac3-f97fb40665fc','14057c5e-cdab-435a-b489-aa4858a6925b')
union all
select 'cover_drafts',  count(*), max(created_at)
  from public.cover_drafts   where manuscript_id in ('c037e098-2f9c-4728-8ac3-f97fb40665fc','14057c5e-cdab-435a-b489-aa4858a6925b')
union all
select 'cover_versions', count(*), max(created_at)
  from public.cover_versions where manuscript_id in ('c037e098-2f9c-4728-8ac3-f97fb40665fc','14057c5e-cdab-435a-b489-aa4858a6925b');
--
-- If all three are zero, the Design tab is a correctly-built empty room. That
-- is not a blocker — it is a decision about whether item 4 says "up to and
-- including Design" or "up to Manuscript". Better to know now than to click
-- it in front of Carl.

-- ─── 3 · THE PHASES · which stations say they are done, and who says so ────
-- Paul's "full journey up to and including the Design Studio" is a claim the
-- phase rows make on screen. If completed_at is set but completion_source is
-- NULL, the surface asserts a stage completed with nothing behind the claim.
select m.title, ep.phase_name, ep.editor_name,
       ep.completed_at is not null as marked_complete,
       ep.completion_source
  from public.editing_phases ep
  join public.manuscripts m on m.id = ep.manuscript_id
 where ep.manuscript_id in ('c037e098-2f9c-4728-8ac3-f97fb40665fc',
                            '14057c5e-cdab-435a-b489-aa4858a6925b')
 order by m.title, ep.phase_name;

-- ─── 4 · THE SERIES · confirming it is still empty, and ready ──────────────
select (select count(*) from public.manuscript_series)         as series_rows,
       (select count(*) from public.manuscript_series_members) as member_rows,
       (select count(*) from public.v_manuscript_prior_books)  as prior_book_rows;
-- EXPECT 0, 0, 0. The relation went in on 5 October and nothing has populated
-- it, because nobody had declared the order. Paul declared it this morning —
-- Veil is book 1, Signal is book 2 — so this is now a two-row insert, written
-- once this audit confirms the two ids are the right ones.

-- ─── 5 · THE HOUSE LIST · what Paul will see on his dashboard ──────────────
select m.title,
       coalesce(i.name, '— none —') as imprint,
       (select count(*) from public.chapters c where c.manuscript_id = m.id) as chapters
  from public.manuscripts m
  left join public.imprints i on i.id = m.imprint_id
 where i.organisation_id = (select organisation_id from public.imprints
                             where slug = 'meridian-editions')
 order by i.name, m.title;
-- EXPECT: two real titles plus five Harrowgate fixtures at 0 chapters on
-- Meridian, and four more on Longshore. Item 3 of the demo spec is one UPDATE
-- moving the five fixtures to Longshore — written after this confirms the
-- count, not before.

-- ─── WHAT THIS DOES NOT ASK ────────────────────────────────────────────────
-- Nothing about whether the SURFACES render. They were built and tsc-clean
-- yesterday, and the only honest test of a surface is opening it. Once this
-- comes back, the next step is you clicking through Veil's five tabs and
-- telling me what is blank — which has found more in two sessions than any
-- query I have written this week.
