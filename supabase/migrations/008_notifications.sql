-- In-app notification records for direct messages and new followers.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  kind text not null check (kind in ('message', 'follow', 'comment', 'like')),
  body text not null,
  route text not null,
  route_param text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;
create policy "users read own notifications" on public.notifications for select to authenticated using (auth.uid() = recipient_id);
create policy "users update own notifications" on public.notifications for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

create or replace function public.create_message_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (recipient_id, actor_id, kind, body, route, route_param)
  values (new.recipient_id, new.sender_id, 'message', 'আপনাকে একটি message পাঠিয়েছেন', '/messages/[id]', new.sender_id::text);
  return new;
end;
$$;

drop trigger if exists direct_message_notification on public.direct_messages;
create trigger direct_message_notification after insert on public.direct_messages for each row execute function public.create_message_notification();

create or replace function public.create_follow_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (recipient_id, actor_id, kind, body, route, route_param)
  values (new.following_id, new.follower_id, 'follow', 'আপনাকে follow করেছেন', '/(tabs)/profile', new.follower_id::text);
  return new;
end;
$$;

drop trigger if exists follow_notification on public.follows;
create trigger follow_notification after insert on public.follows for each row execute function public.create_follow_notification();

-- Enable from the SQL Editor if not already enabled in the project:
-- alter publication supabase_realtime add table public.notifications;
