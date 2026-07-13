create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'filesystem_node_type') then
    create type public.filesystem_node_type as enum ('folder','image','audio','video','document','shortcut','release','application','archive','external_link','unknown');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'visibility_status') then
    create type public.visibility_status as enum ('public','unlisted','authenticated','team','private');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'asset_processing_status') then
    create type public.asset_processing_status as enum ('pending','processing','ready','failed');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'asset_moderation_status') then
    create type public.asset_moderation_status as enum ('review','approved','rejected');
  end if;
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'campaign_destination_type') then
    create type public.campaign_destination_type as enum ('external_url','open_application','open_filesystem_node','open_release','play_audio','save_to_memory_card','install_shortcut','change_wallpaper','open_mind');
  end if;
end $$;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('local','imgbb','supabase','remote')),
  bucket text,
  object_path text,
  external_url text check (external_url is null or external_url ~ '^https?://'),
  original_filename text not null,
  mime_type text not null,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_ms bigint check (duration_ms is null or duration_ms >= 0),
  checksum text,
  caption text,
  credit text,
  alt_text text,
  content_warning text,
  processing_status public.asset_processing_status not null default 'pending',
  moderation_status public.asset_moderation_status not null default 'review',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (object_path is not null or external_url is not null)
);

create table if not exists public.media_variants (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  variant_type text not null check (variant_type in ('thumbnail','preview','display','original','waveform')),
  bucket text,
  object_path text,
  external_url text check (external_url is null or external_url ~ '^https?://'),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  byte_size bigint check (byte_size is null or byte_size >= 0),
  created_at timestamptz not null default now(),
  check (object_path is not null or external_url is not null)
);

create table if not exists public.filesystem_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.filesystem_nodes(id) on delete cascade,
  node_type public.filesystem_node_type not null default 'unknown',
  name text not null,
  slug text not null,
  owner_type text,
  owner_id uuid,
  visibility public.visibility_status not null default 'public',
  icon_media_id uuid references public.media_assets(id) on delete set null,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (parent_id, slug)
);

create table if not exists public.filesystem_media (
  node_id uuid references public.filesystem_nodes(id) on delete cascade,
  media_id uuid references public.media_assets(id) on delete restrict,
  purpose text not null check (purpose in ('primary','attachment','preview','icon')),
  sort_order integer not null default 0,
  primary key (node_id, media_id, purpose)
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status public.content_status not null default 'draft',
  weight integer not null default 1 check (weight > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.campaign_destinations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  destination_type public.campaign_destination_type not null,
  destination_value text not null,
  weight integer not null default 1 check (weight > 0),
  enabled boolean not null default true
);

create table if not exists public.discord_channels (
  id uuid primary key default gen_random_uuid(),
  discord_channel_id text unique not null,
  discord_guild_id text not null,
  slug text unique not null,
  display_name text not null,
  enabled boolean not null default true,
  public_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discord_messages (
  id uuid primary key default gen_random_uuid(),
  discord_message_id text unique not null,
  channel_id uuid not null references public.discord_channels(id) on delete cascade,
  discord_author_id text not null,
  author_display_name text not null,
  author_avatar_url text check (author_avatar_url is null or author_avatar_url ~ '^https?://'),
  body text not null check (char_length(body) <= 1800),
  reply_to_discord_message_id text,
  discord_created_at timestamptz not null,
  discord_edited_at timestamptz,
  moderation_status text not null default 'approved' check (moderation_status in ('approved','hidden','removed','review')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discord_bridge_state (
  channel_id uuid primary key references public.discord_channels(id) on delete cascade,
  last_discord_message_id text,
  last_synced_at timestamptz,
  connection_status text,
  last_error text,
  updated_at timestamptz not null default now()
);

create trigger media_assets_updated before update on public.media_assets for each row execute function public.set_updated_at();
create trigger filesystem_nodes_updated before update on public.filesystem_nodes for each row execute function public.set_updated_at();
create trigger campaigns_updated before update on public.campaigns for each row execute function public.set_updated_at();
create trigger discord_channels_updated before update on public.discord_channels for each row execute function public.set_updated_at();
create trigger discord_messages_updated before update on public.discord_messages for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;
alter table public.media_variants enable row level security;
alter table public.filesystem_nodes enable row level security;
alter table public.filesystem_media enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_destinations enable row level security;
alter table public.discord_channels enable row level security;
alter table public.discord_messages enable row level security;
alter table public.discord_bridge_state enable row level security;

grant select on public.media_assets, public.media_variants, public.filesystem_nodes, public.filesystem_media, public.campaigns, public.campaign_destinations, public.discord_channels, public.discord_messages to anon, authenticated;
grant insert, update, delete on public.media_assets, public.media_variants, public.filesystem_nodes, public.filesystem_media, public.campaigns, public.campaign_destinations, public.discord_channels, public.discord_messages, public.discord_bridge_state to authenticated;

drop policy if exists "public reads approved media assets" on public.media_assets;
create policy "public reads approved media assets" on public.media_assets for select to anon, authenticated
using (processing_status = 'ready' and moderation_status = 'approved');

drop policy if exists "public reads approved media variants" on public.media_variants;
create policy "public reads approved media variants" on public.media_variants for select to anon, authenticated
using (exists (select 1 from public.media_assets ma where ma.id = media_id and ma.processing_status = 'ready' and ma.moderation_status = 'approved'));

drop policy if exists "public reads published filesystem" on public.filesystem_nodes;
create policy "public reads published filesystem" on public.filesystem_nodes for select to anon, authenticated
using (visibility in ('public','unlisted') and status = 'published');

drop policy if exists "public reads published filesystem media" on public.filesystem_media;
create policy "public reads published filesystem media" on public.filesystem_media for select to anon, authenticated
using (exists (select 1 from public.filesystem_nodes fn where fn.id = node_id and fn.visibility in ('public','unlisted') and fn.status = 'published'));

drop policy if exists "public reads active campaigns" on public.campaigns;
create policy "public reads active campaigns" on public.campaigns for select to anon, authenticated
using (status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));

drop policy if exists "public reads active campaign destinations" on public.campaign_destinations;
create policy "public reads active campaign destinations" on public.campaign_destinations for select to anon, authenticated
using (enabled and exists (select 1 from public.campaigns c where c.id = campaign_id and c.status = 'published' and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now())));

drop policy if exists "public reads visible discord channels" on public.discord_channels;
create policy "public reads visible discord channels" on public.discord_channels for select to anon, authenticated
using (enabled and public_visible);

drop policy if exists "public reads approved discord messages" on public.discord_messages;
create policy "public reads approved discord messages" on public.discord_messages for select to anon, authenticated
using (moderation_status = 'approved' and exists (select 1 from public.discord_channels dc where dc.id = channel_id and dc.enabled and dc.public_visible));

drop policy if exists "admins manage media assets" on public.media_assets;
create policy "admins manage media assets" on public.media_assets for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage media variants" on public.media_variants;
create policy "admins manage media variants" on public.media_variants for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage filesystem nodes" on public.filesystem_nodes;
create policy "admins manage filesystem nodes" on public.filesystem_nodes for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage filesystem media" on public.filesystem_media;
create policy "admins manage filesystem media" on public.filesystem_media for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage campaigns" on public.campaigns;
create policy "admins manage campaigns" on public.campaigns for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage campaign destinations" on public.campaign_destinations;
create policy "admins manage campaign destinations" on public.campaign_destinations for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins manage discord moderation" on public.discord_messages;
create policy "admins manage discord moderation" on public.discord_messages for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins read bridge state" on public.discord_bridge_state;
create policy "admins read bridge state" on public.discord_bridge_state for select to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media','public-media', true, 52428800),
  ('audio-previews','audio-previews', true, 52428800),
  ('thumbnails','thumbnails', true, 10485760),
  ('audio-originals','audio-originals', false, 2147483648),
  ('content-drafts','content-drafts', false, 104857600),
  ('team-private','team-private', false, 104857600),
  ('community-uploads','community-uploads', false, 104857600)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "public can read public awaken buckets" on storage.objects;
create policy "public can read public awaken buckets" on storage.objects for select to anon, authenticated
using (bucket_id in ('public-media','audio-previews','thumbnails'));

drop policy if exists "admins can insert awaken storage" on storage.objects;
create policy "admins can insert awaken storage" on storage.objects for insert to authenticated
with check (bucket_id in ('public-media','audio-previews','thumbnails','audio-originals','content-drafts','team-private','community-uploads') and coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins can update awaken storage" on storage.objects;
create policy "admins can update awaken storage" on storage.objects for update to authenticated
using (bucket_id in ('public-media','audio-previews','thumbnails','audio-originals','content-drafts','team-private','community-uploads') and coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (bucket_id in ('public-media','audio-previews','thumbnails','audio-originals','content-drafts','team-private','community-uploads') and coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

drop policy if exists "admins can delete awaken storage" on storage.objects;
create policy "admins can delete awaken storage" on storage.objects for delete to authenticated
using (bucket_id in ('public-media','audio-previews','thumbnails','audio-originals','content-drafts','team-private','community-uploads') and coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');

insert into public.discord_channels (discord_channel_id, discord_guild_id, slug, display_name, enabled, public_visible)
values ('1525921490414080031', '946069318473502770', 'xp', 'XP', true, true)
on conflict (discord_channel_id) do update set discord_guild_id = excluded.discord_guild_id, slug = excluded.slug, display_name = excluded.display_name, enabled = true, public_visible = true;

insert into public.campaigns (slug, title, status, metadata)
values
  ('call-awaken', 'CALL-AWAKEN', 'draft', '{"phase":"safe-local"}'),
  ('media-network', 'AWAKEN Media Network', 'draft', '{"phase":"safe-local"}'),
  ('memory-recovery', 'Memory Recovery', 'draft', '{"phase":"safe-local"}'),
  ('awaken-internet-service', 'AWAKEN Internet Service', 'draft', '{"phase":"safe-local"}')
on conflict (slug) do nothing;

insert into public.campaign_destinations (campaign_id, destination_type, destination_value, weight, enabled)
select c.id, d.destination_type::public.campaign_destination_type, d.destination_value, d.weight, true
from public.campaigns c
join (values
  ('call-awaken','external_url','https://awakencult.com/',1),
  ('call-awaken','open_mind','mind',1),
  ('media-network','external_url','https://www.youtube.com/@awakencult',1),
  ('media-network','external_url','https://soundcloud.com/awakencult',1),
  ('media-network','external_url','https://music.apple.com/za/artist/awaken-cult/1448907538',1),
  ('memory-recovery','save_to_memory_card','memory-card',1),
  ('awaken-internet-service','external_url','https://vzn.awakencult.com/',1),
  ('awaken-internet-service','external_url','https://noise.awakencult.com/',1),
  ('awaken-internet-service','external_url','https://discord.gg/3hTnm3Pgy2',1)
) as d(slug, destination_type, destination_value, weight) on d.slug = c.slug
where not exists (
  select 1 from public.campaign_destinations cd
  where cd.campaign_id = c.id and cd.destination_type = d.destination_type::public.campaign_destination_type and cd.destination_value = d.destination_value
);

with roots(path, name, slug, node_type, sort_order, status, visibility, metadata) as (
  values
    ('archive','Archive','archive','folder',10,'published','public','{}'::jsonb),
    ('community','Community','community','folder',20,'published','public','{}'::jsonb),
    ('programs','Programs','programs','folder',30,'published','public','{}'::jsonb),
    ('team','Team','team','folder',40,'published','authenticated','{"protected":true}'::jsonb),
    ('wallpapers','Wallpapers','wallpapers','folder',50,'published','public','{}'::jsonb)
)
insert into public.filesystem_nodes (name, slug, node_type, sort_order, status, visibility, metadata, published_at)
select name, slug, node_type::public.filesystem_node_type, sort_order, status::public.content_status, visibility::public.visibility_status, metadata, now()
from roots
on conflict (parent_id, slug) do nothing;

with community as (select id from public.filesystem_nodes where parent_id is null and slug = 'community' limit 1)
insert into public.filesystem_nodes (parent_id, name, slug, node_type, sort_order, status, visibility, metadata, published_at)
select community.id, 'XP', 'xp', 'folder'::public.filesystem_node_type, 10, 'published'::public.content_status, 'public'::public.visibility_status, '{"opens":"mind"}'::jsonb, now()
from community
on conflict (parent_id, slug) do nothing;

with wallpapers as (select id from public.filesystem_nodes where parent_id is null and slug = 'wallpapers' limit 1)
insert into public.filesystem_nodes (parent_id, name, slug, node_type, sort_order, status, visibility, metadata, published_at)
select wallpapers.id, 'AWAKEN Default.theme', 'awaken-default-theme', 'document'::public.filesystem_node_type, 10, 'published'::public.content_status, 'public'::public.visibility_status, '{"wallpaperId":"awaken-default","image":"https://i.ibb.co/F4cCLp3t/a3a6a063-4a72-4b8a-b693-b774e7acbf81.webp","fallbackColor":"#da4a44"}'::jsonb, now()
from wallpapers
on conflict (parent_id, slug) do nothing;

alter publication supabase_realtime add table public.discord_messages;
alter publication supabase_realtime add table public.content_items;
alter publication supabase_realtime add table public.transmission_rules;
alter publication supabase_realtime add table public.filesystem_nodes;
alter publication supabase_realtime add table public.campaigns;
