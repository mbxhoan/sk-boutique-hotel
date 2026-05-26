-- Add attachment support to chat messages
alter table public.chat_messages add column if not exists attachment_url text;
alter table public.chat_messages add column if not exists attachment_type text; -- 'image' | 'file'

-- Storage bucket for chat image uploads (public read)
insert into storage.buckets (id, name, public)
  values ('chat-attachments', 'chat-attachments', true)
  on conflict (id) do nothing;

-- Anon guests can upload and read their own attachments
create policy "chat_attachments_anon_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'chat-attachments');

create policy "chat_attachments_anon_select" on storage.objects
  for select to anon
  using (bucket_id = 'chat-attachments');

-- Authenticated users (admins) have full access
create policy "chat_attachments_auth_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'chat-attachments')
  with check (bucket_id = 'chat-attachments');
