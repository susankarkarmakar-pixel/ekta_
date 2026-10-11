-- Profile avatar storage and profile bootstrap for authenticated users.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

create policy "profiles can be created by their owner"
on public.profiles for insert
with check (auth.uid() = id);

create policy "avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "users upload their own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users update their own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users delete their own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
