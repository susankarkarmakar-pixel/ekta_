create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_enabled_idx
  on public.push_tokens (user_id, enabled);

alter table public.push_tokens enable row level security;

create policy "users manage own push tokens" on public.push_tokens
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
