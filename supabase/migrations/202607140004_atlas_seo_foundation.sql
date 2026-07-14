do $$ begin
  create type public.atlas_publication_state as enum ('draft','unreleased','public','archived','deprecated','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.atlas_verification_state as enum (
    'human_verified','official_source_verified','source_archive_verified','inferred','needs_review','disputed'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.atlas_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  title text not null,
  source_url text check (source_url is null or source_url ~ '^https://'),
  internal_ref text,
  source_date timestamptz,
  imported_at timestamptz not null default now(),
  original_id text,
  confidence numeric(4,3) not null default 0.500 check (confidence between 0 and 1),
  public_safe boolean not null default false,
  review_notes text,
  metadata jsonb not null default '{}'::jsonb,
  unique nulls not distinct (source_type, original_id)
);

create table if not exists public.atlas_entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  entity_type text not null check (entity_type in (
    'person','member','collaborator','group','release','track','era','collection','product','campaign',
    'photograph','artwork','poster','video','article','archive_entry','social_post','manifesto','symbol',
    'concept','event','platform','community_project','location','source'
  )),
  name text not null,
  summary text,
  description text,
  publication_state public.atlas_publication_state not null default 'draft',
  verification_state public.atlas_verification_state not null default 'needs_review',
  confidence numeric(4,3) not null default 0.500 check (confidence between 0 and 1),
  public_visible boolean not null default false,
  start_date timestamptz,
  end_date timestamptz,
  aliases text[] not null default '{}',
  tags text[] not null default '{}',
  source_refs text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (not public_visible or (
    publication_state = 'public'
    and verification_state in ('human_verified','official_source_verified','source_archive_verified')
    and confidence >= 0.750
  ))
);

create table if not exists public.atlas_relationships (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.atlas_entities(id) on delete cascade,
  predicate text not null,
  object_id uuid not null references public.atlas_entities(id) on delete cascade,
  role text,
  credit_order integer,
  verification_state public.atlas_verification_state not null default 'needs_review',
  confidence numeric(4,3) not null default 0.500 check (confidence between 0 and 1),
  public_visible boolean not null default false,
  start_date timestamptz,
  end_date timestamptz,
  editorial_notes text,
  source_refs text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique nulls not distinct (subject_id, predicate, object_id, role),
  check (subject_id <> object_id),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (not public_visible or (
    verification_state in ('human_verified','official_source_verified','source_archive_verified')
    and confidence >= 0.750
  ))
);

create table if not exists public.atlas_entity_sources (
  entity_id uuid not null references public.atlas_entities(id) on delete cascade,
  source_id uuid not null references public.atlas_sources(id) on delete restrict,
  source_claim text,
  is_primary boolean not null default false,
  primary key (entity_id, source_id)
);

create table if not exists public.atlas_relationship_sources (
  relationship_id uuid not null references public.atlas_relationships(id) on delete cascade,
  source_id uuid not null references public.atlas_sources(id) on delete restrict,
  source_claim text,
  primary key (relationship_id, source_id)
);

create table if not exists public.atlas_media_links (
  entity_id uuid not null references public.atlas_entities(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  usage_type text not null default 'related' check (usage_type in ('primary','cover','thumbnail','gallery','campaign','documentation','related')),
  sort_order integer not null default 0,
  caption_override text,
  primary key (entity_id, media_asset_id, usage_type)
);

create index if not exists atlas_entities_type_idx on public.atlas_entities(entity_type);
create index if not exists atlas_entities_public_idx on public.atlas_entities(entity_type, start_date, name)
  where public_visible and publication_state = 'public';
create index if not exists atlas_entities_tags_gin on public.atlas_entities using gin(tags);
create index if not exists atlas_entities_aliases_gin on public.atlas_entities using gin(aliases);
create index if not exists atlas_relationships_subject_idx on public.atlas_relationships(subject_id, predicate);
create index if not exists atlas_relationships_object_idx on public.atlas_relationships(object_id, predicate);
create index if not exists atlas_entity_sources_source_idx on public.atlas_entity_sources(source_id);
create index if not exists atlas_relationship_sources_source_idx on public.atlas_relationship_sources(source_id);
create index if not exists atlas_media_links_media_idx on public.atlas_media_links(media_asset_id);

create or replace function public.atlas_set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists atlas_entities_updated on public.atlas_entities;
create trigger atlas_entities_updated before update on public.atlas_entities
for each row execute function public.atlas_set_updated_at();

alter table public.atlas_sources enable row level security;
alter table public.atlas_entities enable row level security;
alter table public.atlas_relationships enable row level security;
alter table public.atlas_entity_sources enable row level security;
alter table public.atlas_relationship_sources enable row level security;
alter table public.atlas_media_links enable row level security;

grant select on public.atlas_sources, public.atlas_entities, public.atlas_relationships,
  public.atlas_entity_sources, public.atlas_relationship_sources, public.atlas_media_links to anon, authenticated;
grant insert, update, delete on public.atlas_sources, public.atlas_entities, public.atlas_relationships,
  public.atlas_entity_sources, public.atlas_relationship_sources, public.atlas_media_links to authenticated;

create policy "public reads approved atlas entities" on public.atlas_entities for select to anon using (
  public_visible and publication_state = 'public'
  and verification_state in ('human_verified','official_source_verified','source_archive_verified')
  and confidence >= 0.750
);
create policy "public reads approved atlas relationships" on public.atlas_relationships for select to anon using (
  public_visible
  and verification_state in ('human_verified','official_source_verified','source_archive_verified')
  and confidence >= 0.750
  and exists (select 1 from public.atlas_entities subject where subject.id = subject_id)
  and exists (select 1 from public.atlas_entities object where object.id = object_id)
);
create policy "public reads safe atlas sources" on public.atlas_sources for select to anon using (public_safe);
create policy "public reads approved atlas entity sources" on public.atlas_entity_sources for select to anon using (
  exists (select 1 from public.atlas_entities entity where entity.id = entity_id)
  and exists (select 1 from public.atlas_sources source where source.id = source_id)
);
create policy "public reads approved atlas relationship sources" on public.atlas_relationship_sources for select to anon using (
  exists (select 1 from public.atlas_relationships relationship where relationship.id = relationship_id)
  and exists (select 1 from public.atlas_sources source where source.id = source_id)
);
create policy "public reads approved atlas media" on public.atlas_media_links for select to anon using (
  exists (select 1 from public.atlas_entities entity where entity.id = entity_id)
);

create policy "admins manage atlas sources" on public.atlas_sources for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');
create policy "admins manage atlas entities" on public.atlas_entities for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');
create policy "admins manage atlas relationships" on public.atlas_relationships for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');
create policy "admins manage atlas entity sources" on public.atlas_entity_sources for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');
create policy "admins manage atlas relationship sources" on public.atlas_relationship_sources for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');
create policy "admins manage atlas media" on public.atlas_media_links for all to authenticated
using (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin')
with check (coalesce((select auth.jwt())->'app_metadata'->>'user_role', (select auth.jwt())->>'user_role') = 'admin');

create or replace view public.atlas_public_graph with (security_invoker = true) as
select
  entity.id, entity.slug, entity.entity_type, entity.name, entity.summary, entity.description,
  entity.start_date, entity.end_date, entity.aliases, entity.tags, entity.metadata,
  coalesce(jsonb_agg(jsonb_build_object(
    'predicate', relationship.predicate,
    'role', relationship.role,
    'targetId', target.id,
    'targetSlug', target.slug,
    'targetType', target.entity_type,
    'targetName', target.name
  ) order by relationship.credit_order nulls last, target.name)
    filter (where relationship.id is not null and target.id is not null), '[]'::jsonb) as relationships
from public.atlas_entities entity
left join public.atlas_relationships relationship on relationship.subject_id = entity.id
left join public.atlas_entities target on target.id = relationship.object_id
group by entity.id;
grant select on public.atlas_public_graph to anon, authenticated;

insert into public.atlas_sources (source_type, title, source_url, original_id, confidence, public_safe)
values
  ('official_website', 'AWAKEN CULT', 'https://awakencult.com/', 'official-website', 1, true),
  ('official_platform', 'AWAKEN CULT on SoundCloud', 'https://soundcloud.com/awakencult', 'official-soundcloud', 1, true),
  ('human_testimony', 'AWAKEN Atlas handoff corrections', null, 'human-atlas-handoff-2026-07-14', 1, false)
on conflict (source_type, original_id) do update set title = excluded.title, source_url = excluded.source_url,
  confidence = excluded.confidence, public_safe = excluded.public_safe;

insert into public.atlas_entities (slug, entity_type, name, summary, publication_state, verification_state, confidence, public_visible, start_date, source_refs, metadata)
values
  ('awaken-cult', 'group', 'AWAKEN CULT', 'AWAKEN CULT connects music, visual work, community projects, and the NETWORK OS archive.', 'public', 'official_source_verified', 1, true, null, array['official-website'], '{}'::jsonb),
  ('anticalvin', 'person', 'anticalvin', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('hannahlleila', 'person', 'hannahlleila', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('josh-otis', 'person', 'Josh Otis', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('htl', 'person', 'HTL', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('nashe', 'person', 'Na$he', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('typhoon', 'person', 'Typhoon', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{"relationshipStatus":"member"}'::jsonb),
  ('wasted-youth', 'collection', 'Wasted Youth', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb),
  ('eyes-wide-shut', 'collection', 'Eyes Wide Shut', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb),
  ('hated-collection', 'collection', 'HATED', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb),
  ('noise-collection', 'collection', 'NOISE', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb),
  ('state-of-mind-collection', 'collection', 'State Of Mind', null, 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb),
  ('soundcloud', 'platform', 'AWAKEN SoundCloud', 'Official AWAKEN CULT music profile on SoundCloud.', 'public', 'official_source_verified', 1, true, null, array['official-soundcloud'], '{"url":"https://soundcloud.com/awakencult"}'::jsonb),
  ('awaken-atlas', 'concept', 'AWAKEN Atlas', 'Canonical knowledge layer for the existing NETWORK.', 'private', 'human_verified', 1, false, null, array['human-atlas-handoff-2026-07-14'], '{}'::jsonb)
on conflict (slug) do update set name = excluded.name, entity_type = excluded.entity_type, summary = excluded.summary,
  publication_state = excluded.publication_state, verification_state = excluded.verification_state,
  confidence = excluded.confidence, public_visible = excluded.public_visible, source_refs = excluded.source_refs, metadata = excluded.metadata;

insert into public.atlas_entities (slug, entity_type, name, summary, publication_state, verification_state, confidence, public_visible, start_date, source_refs, metadata)
values
  ('xp', 'release', 'XP', 'EP released in 2019.', 'public', 'official_source_verified', 1, true, '2019-01-08', array['https://music.apple.com/za/album/xp-ep/1448922005'], '{"officialUrl":"https://music.apple.com/za/album/xp-ep/1448922005"}'::jsonb),
  ('hated', 'release', 'HATED', 'Album released in 2019.', 'public', 'official_source_verified', 1, true, '2019-10-11', array['https://music.apple.com/za/album/hated-deluxe-edition/1483667677'], '{"officialUrl":"https://music.apple.com/za/album/hated-deluxe-edition/1483667677"}'::jsonb),
  ('xpv2', 'release', 'XPV2', 'EP released in 2021.', 'public', 'official_source_verified', 1, true, '2021-07-01', array['https://music.apple.com/za/album/xpv2-ep/1574765564'], '{"officialUrl":"https://music.apple.com/za/album/xpv2-ep/1574765564"}'::jsonb),
  ('new-swag-who-dis', 'release', 'NEW SWAG WHO DIS?', 'Single released in 2021.', 'public', 'official_source_verified', 1, true, '2021-08-20', array['https://music.apple.com/za/album/new-swag-who-dis-feat-josh-otis-pari%24-single/1581835842'], '{"officialUrl":"https://music.apple.com/za/album/new-swag-who-dis-feat-josh-otis-pari%24-single/1581835842"}'::jsonb),
  ('central-african-time', 'release', 'CENTRAL AFRICAN TIME', 'Single released in 2022.', 'public', 'official_source_verified', 1, true, '2022-04-22', array['https://music.apple.com/za/album/central-african-time-feat-josh-otis-single/1620423087'], '{"officialUrl":"https://music.apple.com/za/album/central-african-time-feat-josh-otis-single/1620423087"}'::jsonb),
  ('state-of-mind', 'release', 'State Of Mind', 'EP released in 2022.', 'public', 'official_source_verified', 1, true, '2022-06-28', array['https://music.apple.com/za/album/state-of-mind-ep/1656676894'], '{"officialUrl":"https://music.apple.com/za/album/state-of-mind-ep/1656676894"}'::jsonb)
on conflict (slug) do update set name = excluded.name, summary = excluded.summary, start_date = excluded.start_date,
  publication_state = excluded.publication_state, verification_state = excluded.verification_state,
  confidence = excluded.confidence, public_visible = excluded.public_visible, source_refs = excluded.source_refs, metadata = excluded.metadata;

insert into public.atlas_relationships (subject_id, predicate, object_id, role, verification_state, confidence, public_visible, source_refs)
select person.id, 'member_of', awaken.id, 'core member', 'human_verified', 1, false, array['human-atlas-handoff-2026-07-14']
from public.atlas_entities person cross join public.atlas_entities awaken
where person.slug in ('anticalvin','hannahlleila','josh-otis','htl','nashe','typhoon') and awaken.slug = 'awaken-cult'
on conflict (subject_id, predicate, object_id, role) do update set verification_state = excluded.verification_state,
  confidence = excluded.confidence, public_visible = excluded.public_visible, source_refs = excluded.source_refs;

insert into public.atlas_relationships (subject_id, predicate, object_id, verification_state, confidence, public_visible, source_refs)
select awaken.id, 'published_on', soundcloud.id, 'official_source_verified', 1, true, array['official-soundcloud']
from public.atlas_entities awaken cross join public.atlas_entities soundcloud
where awaken.slug = 'awaken-cult' and soundcloud.slug = 'soundcloud'
on conflict (subject_id, predicate, object_id, role) do update set verification_state = excluded.verification_state,
  confidence = excluded.confidence, public_visible = excluded.public_visible, source_refs = excluded.source_refs;

update public.contributors set slug = 'anticalvin', display_name = 'anticalvin', updated_at = now() where slug = 'anti-colvin';
update public.contributors set slug = 'nashe', display_name = 'Na$he', updated_at = now() where slug = 'nashay';
update public.contributors set slug = 'hannahlleila', display_name = 'hannahlleila', updated_at = now() where slug = 'digital';
