create table if not exists public.gallery_submissions (
  id uuid primary key default gen_random_uuid(),
  client_submission_id uuid not null unique,
  title text not null check (char_length(title) between 1 and 80),
  creator text not null default 'anonymous' check (char_length(creator) between 1 and 80),
  image_path text not null unique check (image_path ~ '^submissions/[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$'),
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
  byte_size bigint not null check (byte_size between 1 and 3145728),
  width integer not null check (width between 64 and 1600),
  height integer not null check (height between 64 and 1600),
  atlas_entity_id text,
  moderation_status text not null default 'review' check (moderation_status in ('review','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.gallery_submissions enable row level security;

grant select, insert on public.gallery_submissions to anon, authenticated;
grant update, delete on public.gallery_submissions to authenticated;

drop policy if exists "public reads approved gallery submissions" on public.gallery_submissions;
create policy "public reads approved gallery submissions"
on public.gallery_submissions for select to anon, authenticated
using (moderation_status = 'approved');

drop policy if exists "anyone submits bounded gallery work" on public.gallery_submissions;
create policy "anyone submits bounded gallery work"
on public.gallery_submissions for insert to anon, authenticated
with check (moderation_status = 'review' and reviewed_at is null);

drop policy if exists "admins moderate gallery submissions" on public.gallery_submissions;
create policy "admins moderate gallery submissions"
on public.gallery_submissions for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery-submissions', 'gallery-submissions', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone uploads bounded gallery images" on storage.objects;
create policy "anyone uploads bounded gallery images"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'gallery-submissions'
  and (storage.foldername(name))[1] = 'submissions'
  and lower(storage.extension(name)) in ('png','jpg','jpeg','webp')
);

drop policy if exists "admins manage gallery images" on storage.objects;
create policy "admins manage gallery images"
on storage.objects for all to authenticated
using (
  bucket_id = 'gallery-submissions'
  and coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
)
with check (
  bucket_id = 'gallery-submissions'
  and coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin'
);

insert into public.filesystem_nodes (name, slug, node_type, sort_order, status, visibility, metadata, published_at)
values ('Gallery', 'gallery', 'folder', 35, 'published', 'public', '{"application":"awaken-paint","shared":true}', now())
on conflict (parent_id, slug) do update set name = excluded.name, status = excluded.status, visibility = excluded.visibility, metadata = excluded.metadata, published_at = coalesce(public.filesystem_nodes.published_at, excluded.published_at);

do $$
begin
  alter publication supabase_realtime add table public.gallery_submissions;
exception when duplicate_object then null;
end $$;
