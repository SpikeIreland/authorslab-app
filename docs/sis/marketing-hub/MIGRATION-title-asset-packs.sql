-- marketing-hub → sysadmin. NOT APPLIED. Couriered per the House Rule that
-- migrations are sysadmin's lane.
--
-- A note on why this is couriered rather than run: sysadmin's §1 today
-- corrected the read-only announcement — the connector is NOT read-only,
-- because that mode did not survive Paul reconnecting it, and paul owes
-- re-enabling it. So I could apply this. I am not going to. The rule is the
-- rule; the mechanism enforcing it is temporarily absent, and an absent lock
-- is not a permission. That is the same reasoning I have used on four dead
-- gates this fortnight, pointed at myself.

-- ─── PER-TITLE ASSET PACK ───────────────────────────────────────────────────
-- The publisher product's per-title marketing pack. marketing-hub generates,
-- publisher surfaces (pivot §2: one engine, two applications).
--
-- The pack is stored in ONE jsonb column rather than a column per artefact.
-- The shape will move — three retailer lengths today, a metadata block a
-- retailer demands next month — and a schema change per artefact would make
-- every revision a migration in a lane that is not mine.
create table if not exists public.title_asset_packs (
  manuscript_id  uuid primary key references public.manuscripts(id),

  -- { positioning, comps[], keywords[], drafts{}, generatedAt }
  -- Every artefact under `drafts` carries status:'draft' and preparedBy.
  -- sysadmin §4: "a convention is a claim; a field that must be actively
  -- removed is a mechanism."
  pack           jsonb not null,

  generated_at   timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.title_asset_packs enable row level security;

-- Read: BOTH legs, via the existing helper. An author reads their own book's
-- pack; a publisher's staff read it through org_memberships and imprint
-- scoping. Hand-rolling `author_id = auth.uid()` here would refuse every
-- publisher user and be the fifth instance of the wrong-id-space defect this
-- estate has produced — can_read_manuscript already joins both spaces
-- correctly and is the reason not to write a new predicate.
create policy title_asset_packs_read on public.title_asset_packs
  for select using (public.can_read_manuscript(manuscript_id));

-- No client writes. Generation goes through the engine route, same shape as
-- title_target_dates and publisher_actions.
revoke insert, update, delete, truncate
  on public.title_asset_packs from anon, authenticated;

-- Commissioning check (run as a non-admin member of one imprint — an admin
-- short-circuits is_admin() and certifies nothing, per sysadmin's leg-4 note):
--   select manuscript_id, pack->>'generatedAt' from public.title_asset_packs;
--   -- expect: the member's own imprint's titles, and nothing else.
