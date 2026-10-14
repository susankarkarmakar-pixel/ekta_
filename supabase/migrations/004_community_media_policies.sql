-- Re-apply community media Storage policies safely after bucket creation.
-- The policies scope all writes to the authenticated user's top-level UUID folder.

do $$
begin
  drop policy if exists "community media is publicly readable" on storage.objects;
  drop policy if exists "users upload their own community media" on storage.objects;
  drop policy if exists "users update their own community media" on storage.objects;
  drop policy if exists "users delete their own community media" on storage.objects;

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
end $$;
