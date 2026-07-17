insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'awaken-admin-assets',
  'awaken-admin-assets',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "AWAKEN admins upload public assets" on storage.objects;
create policy "AWAKEN admins upload public assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'awaken-admin-assets'
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'user_role'), '') = 'admin'
);

drop policy if exists "AWAKEN admins delete public assets" on storage.objects;
create policy "AWAKEN admins delete public assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'awaken-admin-assets'
  and coalesce((select auth.jwt() -> 'app_metadata' ->> 'user_role'), '') = 'admin'
);
