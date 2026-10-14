-- Durable media publishing foundation for Reels, Stories, and image posts.
-- The bucket is public-read so community feed media can be rendered without
-- exposing a service-role credential to the client.

insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do update set public = excluded.public;

alter table public.posts add column if not exists media_mime_type text;
alter table public.posts add column if not exists media_size_bytes bigint;
alter table public.posts add column if not exists render_status text not null default 'ready';
alter table public.posts add column if not exists render_manifest jsonb;

alter table public.posts drop constraint if exists posts_render_status_check;
alter table public.posts add constraint posts_render_status_check
  check (render_status in ('queued', 'processing', 'ready', 'failed'));

create index if not exists posts_render_status_idx on public.posts (render_status, created_at desc);
create index if not exists posts_author_media_idx on public.posts (author_id, created_at desc);

create policy "community media is publicly readable"
on storage.objects for select
using (bucket_id = 'community-media');

create policy "users upload their own community media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users update their own community media"
on storage.objects for update to authenticated
using (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users delete their own community media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'community-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
