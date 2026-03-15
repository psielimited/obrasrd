-- Consumer capability: saved providers / favorites
create table if not exists public.saved_providers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, provider_id)
);

create index if not exists saved_providers_user_id_idx on public.saved_providers(user_id);
create index if not exists saved_providers_provider_id_idx on public.saved_providers(provider_id);

alter table public.saved_providers enable row level security;

drop policy if exists "Users can read own saved providers" on public.saved_providers;
create policy "Users can read own saved providers"
on public.saved_providers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can add own saved providers" on public.saved_providers;
create policy "Users can add own saved providers"
on public.saved_providers
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can remove own saved providers" on public.saved_providers;
create policy "Users can remove own saved providers"
on public.saved_providers
for delete
to authenticated
using (auth.uid() = user_id);
