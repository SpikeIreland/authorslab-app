-- ============================================================================
-- Project marketing — per-project marketing state.
-- For v1: launch date and which template tasks the author has completed.
-- The launch milestones and task labels live in code (it's a sensible default
-- template); only the writer's selections need to persist.
-- ============================================================================

create table if not exists public.project_marketing (
  manuscript_id uuid primary key references public.manuscripts(id) on delete cascade,
  launch_date timestamptz,
  -- Array of task IDs the author has marked complete. Task IDs are stable
  -- strings defined in the launch template (e.g. 'audience', 'arc-send').
  completed_task_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RLS — author can only read/write marketing state for their own projects.
-- ============================================================================

alter table public.project_marketing enable row level security;

drop policy if exists "Authors read marketing state for their own projects" on public.project_marketing;
create policy "Authors read marketing state for their own projects"
  on public.project_marketing for select
  using (
    manuscript_id in (
      select id from public.manuscripts
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authors insert marketing state for their own projects" on public.project_marketing;
create policy "Authors insert marketing state for their own projects"
  on public.project_marketing for insert
  with check (
    manuscript_id in (
      select id from public.manuscripts
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authors update marketing state for their own projects" on public.project_marketing;
create policy "Authors update marketing state for their own projects"
  on public.project_marketing for update
  using (
    manuscript_id in (
      select id from public.manuscripts
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );
