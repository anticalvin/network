create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'scheduled', 'published', 'expired', 'archived');
create type public.verification_status as enum ('unverified', 'needs_review', 'verified');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post','archive','transmission','advertisement','fragment','release','link','icon','theme','route','discovery','notice')),
  slug text not null unique,
  internal_title text not null,
  public_title text,
  body text,
  secondary_copy text,
  status public.content_status not null default 'draft',
  verification public.verification_status not null default 'unverified',
  starts_at timestamptz,
  ends_at timestamptz,
  recurrence jsonb,
  priority integer not null default 0,
  pinned boolean not null default false,
  mobile_visible boolean not null default true,
  desktop_visible boolean not null default true,
  destination_type text,
  destination_url text check (destination_url is null or destination_url ~ '^https?://'),
  source_type text,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (status not in ('published','scheduled') or verification = 'verified')
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('local','imgbb','supabase','remote')),
  source_url text not null check (source_url ~ '^https?://'),
  thumbnail_url text check (thumbnail_url is null or thumbnail_url ~ '^https?://'),
  caption text,
  credit text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  content_warning text,
  created_at timestamptz not null default now()
);

create table public.content_media (
  content_id uuid references public.content_items(id) on delete cascade,
  media_id uuid references public.media(id) on delete restrict,
  sort_order integer not null default 0,
  primary key (content_id, media_id)
);

create table public.transmission_rules (
  content_id uuid primary key references public.content_items(id) on delete cascade,
  frequency_scope text not null default 'browser' check (frequency_scope in ('session','browser','day')),
  max_displays integer not null default 1 check (max_displays between 1 and 20),
  delay_ms integer not null default 0 check (delay_ms between 0 and 300000),
  eligible_routes text[] not null default array['desktop'],
  dismissal_scope text not null default 'browser' check (dismissal_scope in ('session','browser')),
  internal_notes text
);

create table public.import_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_id text not null,
  source_timestamp timestamptz,
  raw_payload jsonb not null,
  media_urls text[] not null default '{}',
  outbound_urls text[] not null default '{}',
  import_status text not null default 'review' check (import_status in ('review','selected','rejected','transformed')),
  missing_media boolean not null default false,
  notes text,
  imported_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table public.content_sources (
  content_id uuid references public.content_items(id) on delete cascade,
  import_source_id uuid references public.import_sources(id) on delete restrict,
  primary key (content_id, import_source_id)
);

create table public.content_revisions (
  id bigint generated always as identity primary key,
  content_id uuid not null references public.content_items(id) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger content_items_updated before update on public.content_items for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;
alter table public.media enable row level security;
alter table public.content_media enable row level security;
alter table public.transmission_rules enable row level security;
alter table public.import_sources enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_revisions enable row level security;

create policy "public reads verified active content" on public.content_items for select using (
  status = 'published' and verification = 'verified' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
);
create policy "public reads media for public content" on public.media for select using (
  exists (select 1 from public.content_media cm join public.content_items ci on ci.id = cm.content_id where cm.media_id = media.id and ci.status = 'published' and ci.verification = 'verified')
);
create policy "public reads public media links" on public.content_media for select using (
  exists (select 1 from public.content_items ci where ci.id = content_id and ci.status = 'published' and ci.verification = 'verified')
);

-- Create an `admin` custom claim through a trusted server process. Never expose the service role key in the browser.
create policy "admins manage content" on public.content_items for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins manage media" on public.media for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins manage content media" on public.content_media for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins manage transmission rules" on public.transmission_rules for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins manage imports" on public.import_sources for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins manage source links" on public.content_sources for all to authenticated using ((auth.jwt() ->> 'user_role') = 'admin') with check ((auth.jwt() ->> 'user_role') = 'admin');
create policy "admins read revisions" on public.content_revisions for select to authenticated using ((auth.jwt() ->> 'user_role') = 'admin');
