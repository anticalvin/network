drop policy if exists "public reads approved gallery submissions" on public.gallery_submissions;
drop policy if exists "anyone submits bounded gallery work" on public.gallery_submissions;
drop policy if exists "admins moderate gallery submissions" on public.gallery_submissions;

create policy "gallery submissions readable by audience"
on public.gallery_submissions for select to anon, authenticated
using (
  moderation_status = 'approved'
  or coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
);

create policy "anyone submits bounded gallery work"
on public.gallery_submissions for insert to anon, authenticated
with check (moderation_status = 'review' and reviewed_at is null);

create policy "admins update gallery submissions"
on public.gallery_submissions for update to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

create policy "admins delete gallery submissions"
on public.gallery_submissions for delete to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

drop policy if exists "admins manage gallery images" on storage.objects;

create policy "admins update gallery images"
on storage.objects for update to authenticated
using (
  bucket_id = 'gallery-submissions'
  and coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
)
with check (
  bucket_id = 'gallery-submissions'
  and coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
);

create policy "admins delete gallery images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'gallery-submissions'
  and coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
);
