create table if not exists public.network_content_snapshots (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists network_content_snapshots_updated on public.network_content_snapshots;
create trigger network_content_snapshots_updated
before update on public.network_content_snapshots
for each row execute function public.set_updated_at();

alter table public.network_content_snapshots enable row level security;
grant select on public.network_content_snapshots to anon, authenticated;
grant insert, update, delete on public.network_content_snapshots to authenticated;

drop policy if exists "public reads published network content" on public.network_content_snapshots;
create policy "public reads published network content" on public.network_content_snapshots
for select to anon, authenticated using (published);

drop policy if exists "admins manage network content" on public.network_content_snapshots;
create policy "admins manage network content" on public.network_content_snapshots
for all to authenticated
using (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin')
with check (coalesce(auth.jwt()->'app_metadata'->>'user_role', auth.jwt()->>'user_role') = 'admin');
