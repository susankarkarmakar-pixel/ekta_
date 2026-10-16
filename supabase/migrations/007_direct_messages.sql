-- Direct one-to-one messaging for eKta_.
-- Apply this migration in Supabase SQL Editor before enabling remote messaging.

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index if not exists direct_messages_sender_recipient_idx
  on public.direct_messages (sender_id, recipient_id, created_at);
create index if not exists direct_messages_recipient_created_idx
  on public.direct_messages (recipient_id, created_at desc);

alter table public.direct_messages enable row level security;

create policy "users can read their direct messages"
  on public.direct_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "users can send direct messages"
  on public.direct_messages for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "recipients can mark direct messages read"
  on public.direct_messages for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Realtime must be enabled in the Supabase dashboard/publication. This statement
-- is safe only when the table is not already present in the publication.
-- alter publication supabase_realtime add table public.direct_messages;
