alter table public.discord_messages
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists deleted_at timestamptz,
  add column if not exists visibility public.visibility_status not null default 'public';

alter table public.discord_messages replica identity full;

create index if not exists discord_messages_public_feed_idx
  on public.discord_messages (discord_created_at desc)
  where moderation_status = 'approved' and visibility = 'public' and deleted_at is null;

drop policy if exists "public reads approved discord messages" on public.discord_messages;
create policy "public reads approved discord messages" on public.discord_messages for select to anon, authenticated
using (
  moderation_status = 'approved'
  and visibility = 'public'
  and deleted_at is null
  and exists (
    select 1 from public.discord_channels dc
    where dc.id = channel_id and dc.enabled and dc.public_visible
  )
);

drop policy if exists "admins manage discord moderation" on public.discord_messages;
create policy "admins manage discord moderation" on public.discord_messages for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

create table if not exists public.contributors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  role_label text,
  biography text,
  external_url text check (external_url is null or external_url ~ '^https://'),
  discord_user_id text unique,
  is_team boolean not null default false,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_contributors (
  content_id uuid not null references public.content_items(id) on delete cascade,
  contributor_id uuid not null references public.contributors(id) on delete cascade,
  contribution_type text,
  display_order integer not null default 0,
  notes text,
  primary key (content_id, contributor_id, contribution_type)
);

drop trigger if exists contributors_updated on public.contributors;
create trigger contributors_updated before update on public.contributors
for each row execute function public.set_updated_at();

alter table public.contributors enable row level security;
alter table public.content_contributors enable row level security;

grant select on public.contributors, public.content_contributors to anon, authenticated;
grant insert, update, delete on public.contributors, public.content_contributors to authenticated;

create policy "public reads active contributors" on public.contributors for select to anon, authenticated
using (is_active);

create policy "public reads published content credits" on public.content_contributors for select to anon, authenticated
using (
  exists (
    select 1 from public.content_items ci
    where ci.id = content_id
      and ci.status = 'published'
      and ci.verification = 'verified'
      and (ci.starts_at is null or ci.starts_at <= now())
      and (ci.ends_at is null or ci.ends_at > now())
  )
);

create policy "admins manage contributors" on public.contributors for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

create policy "admins manage content credits" on public.content_contributors for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

insert into public.contributors (slug, display_name, is_team, is_active)
values
  ('josh-otis', 'Josh Otis', true, true),
  ('anti-colvin', 'Anti-Colvin', true, true),
  ('htl', 'HTL', true, true),
  ('nashay', 'Nashay', true, true),
  ('typhoon', 'Typhoon', true, true),
  ('digital', 'Digital', true, true)
on conflict (slug) do update set display_name = excluded.display_name, is_team = true, is_active = true;
