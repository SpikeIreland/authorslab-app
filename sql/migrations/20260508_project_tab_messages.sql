-- ============================================================================
-- Project tab messages — generic chat history for studio tabs
-- (Design with Taylor, Publishing with Morgan, Marketing with Riley,
-- Research with the Companion). One conversation per (project, tab).
-- Run this in the Supabase SQL editor against the Author Portal project.
-- ============================================================================

create table if not exists public.project_tab_messages (
  id uuid primary key default gen_random_uuid(),
  manuscript_id uuid not null references public.manuscripts(id) on delete cascade,
  -- Tab identifier: 'design', 'publishing', 'marketing', 'research', etc.
  tab_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists project_tab_messages_lookup_idx
  on public.project_tab_messages (manuscript_id, tab_id, created_at asc);

-- ============================================================================
-- RLS — author can only read/write messages for manuscripts they own.
-- ============================================================================

alter table public.project_tab_messages enable row level security;

drop policy if exists "Authors read tab messages for their own projects" on public.project_tab_messages;
create policy "Authors read tab messages for their own projects"
  on public.project_tab_messages for select
  using (
    manuscript_id in (
      select id from public.manuscripts
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authors insert tab messages into their own projects" on public.project_tab_messages;
create policy "Authors insert tab messages into their own projects"
  on public.project_tab_messages for insert
  with check (
    manuscript_id in (
      select id from public.manuscripts
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );
