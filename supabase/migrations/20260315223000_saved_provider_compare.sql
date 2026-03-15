-- Consumer capability: shortlist metadata and compare support
alter table public.saved_providers
add column if not exists note text;

alter table public.saved_providers
add column if not exists is_shortlisted boolean not null default false;

alter table public.saved_providers
add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_saved_providers_updated_at on public.saved_providers;
create trigger trg_saved_providers_updated_at
before update on public.saved_providers
for each row
execute function public.set_updated_at();

drop policy if exists "Users can update own saved providers" on public.saved_providers;
create policy "Users can update own saved providers"
on public.saved_providers
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
