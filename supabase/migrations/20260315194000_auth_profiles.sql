alter table public.providers
add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists providers_owner_user_id_idx on public.providers(owner_user_id);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'buyer',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_role_check check (role in ('buyer', 'provider', 'admin'))
);

alter table public.user_profiles enable row level security;

create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Providers can create own provider listing"
on public.providers
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "Providers can update own provider listing"
on public.providers
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());
