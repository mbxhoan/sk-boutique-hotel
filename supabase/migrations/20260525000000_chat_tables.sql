-- Chat conversations: one per guest session
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  guest_name text,
  guest_phone text,
  guest_email text,
  source_url text,
  utm_source text,
  utm_campaign text,
  status text not null default 'new' check (status in ('new', 'open', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chat messages: one per message in a conversation
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('guest', 'admin', 'system')),
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for efficient lookups
create index chat_conversations_status_idx on public.chat_conversations(status);
create index chat_conversations_last_message_at_idx on public.chat_conversations(last_message_at desc);
create index chat_messages_conversation_id_idx on public.chat_messages(conversation_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at);

-- Row Level Security
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Anon guests can create conversations and read/insert messages
create policy "chat_conversations_anon_insert" on public.chat_conversations
  for insert to anon with check (true);

create policy "chat_conversations_anon_select" on public.chat_conversations
  for select to anon using (true);

create policy "chat_messages_anon_insert" on public.chat_messages
  for insert to anon with check (true);

create policy "chat_messages_anon_select" on public.chat_messages
  for select to anon using (true);

-- Authenticated users (admins) can do everything
create policy "chat_conversations_auth_all" on public.chat_conversations
  for all to authenticated using (true) with check (true);

create policy "chat_messages_auth_all" on public.chat_messages
  for all to authenticated using (true) with check (true);

-- Enable Realtime for both tables
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_conversations;

-- Auto-update updated_at on chat_conversations
create or replace function public.update_chat_conversation_timestamp()
returns trigger language plpgsql as $$
begin
  update public.chat_conversations
    set updated_at = now(), last_message_at = now()
    where id = new.conversation_id;
  return new;
end;
$$;

create trigger chat_message_inserted
  after insert on public.chat_messages
  for each row execute function public.update_chat_conversation_timestamp();
