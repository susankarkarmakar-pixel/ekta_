create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  handle text unique not null,
  bio text default '',
  avatar_path text,
  region text default 'Gazole',
  created_at timestamptz default now() not null
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 500),
  image_path text,
  location text default 'Gazole',
  created_at timestamptz default now() not null
);

create table if not exists public.follows (follower_id uuid references public.profiles(id) on delete cascade, following_id uuid references public.profiles(id) on delete cascade, created_at timestamptz default now(), primary key (follower_id, following_id), check (follower_id <> following_id));
create table if not exists public.likes (user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade, created_at timestamptz default now(), primary key (user_id, post_id));
create table if not exists public.comments (id uuid primary key default gen_random_uuid(), post_id uuid references public.posts(id) on delete cascade not null, author_id uuid references public.profiles(id) on delete cascade not null, body text not null check (char_length(body) between 1 and 300), created_at timestamptz default now() not null);
create table if not exists public.hashtags (post_id uuid references public.posts(id) on delete cascade, tag text not null, primary key (post_id, tag));
create table if not exists public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid references public.profiles(id) on delete cascade not null, post_id uuid references public.posts(id) on delete cascade, comment_id uuid references public.comments(id) on delete cascade, reason text default 'community-safety', created_at timestamptz default now() not null);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists comments_post_id_idx on public.comments (post_id, created_at);
create index if not exists hashtags_tag_idx on public.hashtags (tag);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.hashtags enable row level security;
alter table public.reports enable row level security;

create policy "profiles are readable by community" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "posts are readable by community" on public.posts for select using (true);
create policy "signed in users create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "authors update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "community can read follows" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "community can read likes" on public.likes for select using (true);
create policy "users manage own likes" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "community can read comments" on public.comments for select using (true);
create policy "signed in users create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "users report content" on public.reports for insert with check (auth.uid() = reporter_id);
