create index if not exists content_contributors_contributor_id_idx
  on public.content_contributors (contributor_id);

drop policy if exists "public reads approved discord messages" on public.discord_messages;
create policy "public reads approved discord messages" on public.discord_messages for select to anon
using (
  moderation_status = 'approved'
  and visibility = 'public'
  and deleted_at is null
  and exists (
    select 1 from public.discord_channels dc
    where dc.id = channel_id and dc.enabled and dc.public_visible
  )
);

drop policy if exists "public reads active contributors" on public.contributors;
create policy "public reads active contributors" on public.contributors for select to anon
using (is_active);

drop policy if exists "public reads published content credits" on public.content_contributors;
create policy "public reads published content credits" on public.content_contributors for select to anon
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
