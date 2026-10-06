-- SWAP THE HOUSE LIST TO THE GOOD COPIES
-- sysadmin, 2026-10-06. Correcting my own seat script from this morning.
--
-- `publisher` caught it: the three real titles I put on Harrowgate's list are
-- THE WEAKEST COPY OF EACH BOOK.
--
--   CS The List   5891a144  the ligature-corrupted PDF ingest Paul ordered deleted
--   Signal        b155f95d  4 line notes on one chapter, full report NULL
--   Veil          4d0025e6  full report is the literal nine-character word 'undefined'
--
-- THE SHAPE OF MY MISTAKE, which is the useful part: I selected by OWNER —
-- "manuscripts Paul owns, so nobody else's data is touched" — which is a
-- sound safety rule that happens to pick the worst copy every time, because
-- the good copies are spread across three accounts. A safe heuristic is not
-- a correct one, and I did not check what the safety also selected.
--
-- AND IT FIXES §7 OF THAT SAME SCRIPT FOR FREE. I noted there that Paul would
-- be reading books HE WROTE, so can_read_manuscript() leg 1 would grant them
-- regardless of imprint and the publisher read path would never be exercised.
-- The good copies belong to carl@spikeisland.tv and carlglyons@yahoo.com, so
-- after this swap Paul reaches them ONLY through his imprint seat. The
-- correction and the better test are the same change.

begin;

-- ─── PRECONDITION ───────────────────────────────────────────────────────────
do $$
declare v_imprint uuid;
begin
  select id into v_imprint from public.imprints
   where slug = 'meridian-editions' and deleted_at is null;
  if v_imprint is null then
    raise exception 'ABORT: meridian-editions not found.';
  end if;
end $$;

-- ─── 1 · OFF THE LIST ───────────────────────────────────────────────────────
-- imprint_id only. No author_id, no deletion, no content touched. These rows
-- return to being author-side manuscripts, exactly as they were yesterday.
update public.manuscripts
   set imprint_id = null
 where id in (
   '5891a144-3e99-41ca-a289-3203ae36d12a',  -- CS The List, ligature-corrupted
   'b155f95d-4608-4b94-8d66-d3fd607ef503',  -- Signal, report NULL
   '4d0025e6-14cc-458b-a70c-f48593aff44d'   -- Veil, report = 'undefined'
 );

-- ─── 2 · ON THE LIST ────────────────────────────────────────────────────────
-- The copies publisher measured as complete. Not Paul's, which is the point:
-- these exercise the publisher read path rather than the author one.
update public.manuscripts
   set imprint_id = (select id from public.imprints where slug = 'meridian-editions')
 where id in (
   'c037e098-2f9c-4728-8ac3-f97fb40665fc',  -- Veil   · 37 ch · 5 phases · real report
   '14057c5e-cdab-435a-b489-aa4858a6925b'   -- Signal · 69 ch · 137 findings · report
 );

-- NOTE: no replacement for CS The List. The good copy of The List is Carl's
-- 1d98521c (83 chapters) and it is HIS OWN BOOK, not a Harrowgate title.
-- Putting it on another house's list would be the first piece of fiction in
-- the demo library, so the house carries two real titles until a third is
-- honestly acquired. Two true rows beat three where one is staged.

commit;

-- ─── 3 · VERIFY ─────────────────────────────────────────────────────────────
select m.title, u.email as owner, i.name as imprint,
       (select count(*) from public.chapters c where c.manuscript_id = m.id) as chapters,
       length(coalesce(m.full_analysis_text, ''))                            as report_chars
  from public.manuscripts m
  left join public.imprints i        on i.id = m.imprint_id
  left join public.author_profiles p on p.id = m.author_id
  left join auth.users u             on u.id = p.auth_user_id
 where i.slug = 'meridian-editions'
 order by chapters desc;
-- EXPECT: Veil (c037e098) and Signal (14057c5e) with real chapter counts and
-- non-zero report_chars, owned by carl@... / carlglyons@..., plus the nine
-- seeded Harrowgate titles at 0 chapters.
-- If either real title shows report_chars = 0 or 9, the swap took the wrong
-- row — 9 is the length of the word 'undefined'.

-- ─── 4 · THE CONTROL, AND IT IS A BETTER ONE THAN THIS MORNING'S ────────────
-- Signed in as yourself in the app, not here:
--
--   select public.can_read_manuscript('c037e098-2f9c-4728-8ac3-f97fb40665fc');
--
-- This is Carl's manuscript, which you do not own. TRUE now proves the
-- PUBLISHER leg works — the imprint seat reaching a book through the house,
-- which is the thing the product is for and which nothing has tested yet.
--
--   select public.can_read_manuscript('1d98521c-5165-4933-86f2-4395caaad088');
--
-- Carl's own copy of The List, author-side, no imprint. Must be FALSE.
-- Same owner, same house, one has an imprint and one does not: that pair is
-- the cleanest proof available that the gate is the imprint and not the
-- person.
