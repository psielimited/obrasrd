-- Media foundation: storage buckets + metadata table for uploaded images

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id text not null,
  object_path text not null,
  public_url text,
  entity_type text not null,
  entity_id uuid,
  mime_type text,
  file_size_bytes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_entity_type_check check (entity_type in ('provider_profile', 'project', 'lead_request')),
  constraint media_assets_unique_object unique (bucket_id, object_path)
);

create index if not exists media_assets_owner_user_id_idx on public.media_assets(owner_user_id);
create index if not exists media_assets_entity_lookup_idx on public.media_assets(entity_type, entity_id);

drop trigger if exists trg_media_assets_updated_at on public.media_assets;
create trigger trg_media_assets_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

alter table public.media_assets enable row level security;

drop policy if exists "Users can read own media assets" on public.media_assets;
create policy "Users can read own media assets"
on public.media_assets
for select
to authenticated
using (auth.uid() = owner_user_id);

drop policy if exists "Users can insert own media assets" on public.media_assets;
create policy "Users can insert own media assets"
on public.media_assets
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "Users can update own media assets" on public.media_assets;
create policy "Users can update own media assets"
on public.media_assets
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "Users can delete own media assets" on public.media_assets;
create policy "Users can delete own media assets"
on public.media_assets
for delete
to authenticated
using (auth.uid() = owner_user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('provider-portfolio', 'provider-portfolio', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('project-media', 'project-media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('request-media', 'request-media', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read provider portfolio objects" on storage.objects;
create policy "Public can read provider portfolio objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'provider-portfolio');

drop policy if exists "Public can read project media objects" on storage.objects;
create policy "Public can read project media objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-media');

drop policy if exists "Users can read own request media objects" on storage.objects;
create policy "Users can read own request media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'request-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can insert provider portfolio objects" on storage.objects;
create policy "Users can insert provider portfolio objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'provider-portfolio'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can insert project media objects" on storage.objects;
create policy "Users can insert project media objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can insert request media objects" on storage.objects;
create policy "Users can insert request media objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'request-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can update own provider portfolio objects" on storage.objects;
create policy "Users can update own provider portfolio objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'provider-portfolio'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'provider-portfolio'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can update own project media objects" on storage.objects;
create policy "Users can update own project media objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-media'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'project-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can update own request media objects" on storage.objects;
create policy "Users can update own request media objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'request-media'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'request-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete own provider portfolio objects" on storage.objects;
create policy "Users can delete own provider portfolio objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'provider-portfolio'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete own project media objects" on storage.objects;
create policy "Users can delete own project media objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can delete own request media objects" on storage.objects;
create policy "Users can delete own request media objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'request-media'
  and split_part(name, '/', 1) = auth.uid()::text
);
