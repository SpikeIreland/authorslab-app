-- ============================================================================
-- Home / Companion chat — conversations and messages
-- Run this in the Supabase SQL editor against the Author Portal project.
-- ============================================================================

-- Conversations: one per chat thread on the Home tab.
create table if not exists public.home_conversations (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.author_profiles(id) on delete cascade,
  title text not null default 'New conversation',
  -- Reserved for future n8n integration; null while we use direct Anthropic API.
  n8n_conversation_id text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists home_conversations_author_id_idx
  on public.home_conversations (author_id, last_message_at desc);

-- Messages: user + assistant turns within a conversation.
create table if not exists public.home_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.home_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists home_messages_conversation_id_idx
  on public.home_messages (conversation_id, created_at asc);

-- ============================================================================
-- Row Level Security: authors only see their own conversations and messages.
-- ============================================================================

alter table public.home_conversations enable row level security;
alter table public.home_messages enable row level security;

-- Conversations: select / insert / update / delete by owning author.
drop policy if exists "Authors can read their own home conversations" on public.home_conversations;
create policy "Authors can read their own home conversations"
  on public.home_conversations for select
  using (
    author_id in (
      select id from public.author_profiles where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Authors can insert their own home conversations" on public.home_conversations;
create policy "Authors can insert their own home conversations"
  on public.home_conversations for insert
  with check (
    author_id in (
      select id from public.author_profiles where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Authors can update their own home conversations" on public.home_conversations;
create policy "Authors can update their own home conversations"
  on public.home_conversations for update
  using (
    author_id in (
      select id from public.author_profiles where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Authors can delete their own home conversations" on public.home_conversations;
create policy "Authors can delete their own home conversations"
  on public.home_conversations for delete
  using (
    author_id in (
      select id from public.author_profiles where auth_user_id = auth.uid()
    )
  );

-- Messages: select / insert via owning conversation; no update or delete from client.
drop policy if exists "Authors can read messages in their own conversations" on public.home_messages;
create policy "Authors can read messages in their own conversations"
  on public.home_messages for select
  using (
    conversation_id in (
      select id from public.home_conversations
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authors can insert messages into their own conversations" on public.home_messages;
create policy "Authors can insert messages into their own conversations"
  on public.home_messages for insert
  with check (
    conversation_id in (
      select id from public.home_conversations
      where author_id in (
        select id from public.author_profiles where auth_user_id = auth.uid()
      )
    )
  );
