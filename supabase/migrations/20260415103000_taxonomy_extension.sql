-- Taxonomy extension (additive-first, migration-safe)
-- Purpose: Introduce normalized construction taxonomy while preserving existing marketplace, lead lifecycle, and provider monetization behavior.

create extension if not exists pgcrypto;

-- Reuse existing canonical stages without duplicating stage data.
create or replace view public.project_stages as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  p.sort_order,
  p.created_at,
  p.updated_at
from public.phases p;

grant select on public.project_stages to anon, authenticated;

create table if not exists public.disciplines (
  id bigint generated always as identity primary key,
  stage_id bigint not null references public.phases(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(stage_id, name)
);

create table if not exists public.services (
  id bigint generated always as identity primary key,
  discipline_id bigint not null references public.disciplines(id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(discipline_id, name)
);

create table if not exists public.work_types (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_services (
  id bigint generated always as identity primary key,
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_id bigint not null references public.services(id) on delete cascade,
  is_primary boolean not null default false,
  years_experience int,
  min_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id, service_id),
  constraint provider_services_years_experience_check check (years_experience is null or years_experience >= 0),
  constraint provider_services_min_price_check check (min_price is null or min_price >= 0)
);

create table if not exists public.provider_work_types (
  id bigint generated always as identity primary key,
  provider_id uuid not null references public.providers(id) on delete cascade,
  work_type_id bigint not null references public.work_types(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(provider_id, work_type_id)
);

create table if not exists public.provider_verifications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  verified_by_user_id uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  expires_at timestamptz,
  evidence_media_asset_id uuid references public.media_assets(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_verifications_type_check check (verification_type in (
    'identity',
    'license',
    'insurance',
    'background',
    'portfolio',
    'trade_certification',
    'site_visit',
    'phone',
    'email',
    'business_registration'
  )),
  constraint provider_verifications_status_check check (status in ('pending', 'approved', 'rejected', 'expired'))
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  title text not null,
  summary text,
  location text,
  started_on date,
  completed_on date,
  status text not null default 'completed',
  stage_id bigint references public.phases(id) on delete set null,
  discipline_id bigint references public.disciplines(id) on delete set null,
  primary_service_id bigint references public.services(id) on delete set null,
  primary_work_type_id bigint references public.work_types(id) on delete set null,
  cover_media_asset_id uuid references public.media_assets(id) on delete set null,
  budget_range text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_projects_status_check check (status in ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
  constraint portfolio_projects_dates_check check (completed_on is null or started_on is null or completed_on >= started_on)
);

create table if not exists public.legacy_category_mappings (
  id bigint generated always as identity primary key,
  legacy_category_slug text not null references public.categories(slug) on delete cascade,
  legacy_phase_id bigint references public.phases(id) on delete set null,
  discipline_id bigint not null references public.disciplines(id) on delete cascade,
  service_id bigint not null references public.services(id) on delete cascade,
  confidence numeric(4,3) not null default 1.000,
  mapping_source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(legacy_category_slug, service_id),
  constraint legacy_category_mappings_confidence_check check (confidence >= 0 and confidence <= 1)
);

-- Add nullable forward-link columns to existing tables (no removals, no behavior changes).
alter table public.providers
add column if not exists primary_discipline_id bigint references public.disciplines(id) on delete set null;

alter table public.providers
add column if not exists primary_service_id bigint references public.services(id) on delete set null;

alter table public.leads
add column if not exists requested_stage_id bigint references public.phases(id) on delete set null;

alter table public.leads
add column if not exists requested_discipline_id bigint references public.disciplines(id) on delete set null;

alter table public.leads
add column if not exists requested_service_id bigint references public.services(id) on delete set null;

alter table public.leads
add column if not exists requested_work_type_id bigint references public.work_types(id) on delete set null;

alter table public.service_posts
add column if not exists requested_stage_id bigint references public.phases(id) on delete set null;

alter table public.service_posts
add column if not exists requested_discipline_id bigint references public.disciplines(id) on delete set null;

alter table public.service_posts
add column if not exists requested_service_id bigint references public.services(id) on delete set null;

alter table public.service_posts
add column if not exists requested_work_type_id bigint references public.work_types(id) on delete set null;

-- Updated-at triggers
drop trigger if exists trg_disciplines_updated_at on public.disciplines;
create trigger trg_disciplines_updated_at
before update on public.disciplines
for each row
execute function public.set_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

drop trigger if exists trg_work_types_updated_at on public.work_types;
create trigger trg_work_types_updated_at
before update on public.work_types
for each row
execute function public.set_updated_at();

drop trigger if exists trg_provider_services_updated_at on public.provider_services;
create trigger trg_provider_services_updated_at
before update on public.provider_services
for each row
execute function public.set_updated_at();

drop trigger if exists trg_provider_verifications_updated_at on public.provider_verifications;
create trigger trg_provider_verifications_updated_at
before update on public.provider_verifications
for each row
execute function public.set_updated_at();

drop trigger if exists trg_portfolio_projects_updated_at on public.portfolio_projects;
create trigger trg_portfolio_projects_updated_at
before update on public.portfolio_projects
for each row
execute function public.set_updated_at();

drop trigger if exists trg_legacy_category_mappings_updated_at on public.legacy_category_mappings;
create trigger trg_legacy_category_mappings_updated_at
before update on public.legacy_category_mappings
for each row
execute function public.set_updated_at();

-- Indexes
create index if not exists disciplines_stage_sort_idx on public.disciplines(stage_id, sort_order, id);
create index if not exists services_discipline_sort_idx on public.services(discipline_id, sort_order, id);
create index if not exists work_types_sort_idx on public.work_types(sort_order, id);

create index if not exists provider_services_service_id_idx on public.provider_services(service_id);
create index if not exists provider_services_provider_primary_idx on public.provider_services(provider_id, is_primary);

create index if not exists provider_work_types_work_type_id_idx on public.provider_work_types(work_type_id);

create index if not exists provider_verifications_provider_status_idx on public.provider_verifications(provider_id, status);
create index if not exists provider_verifications_type_idx on public.provider_verifications(verification_type);

create index if not exists portfolio_projects_provider_completed_idx on public.portfolio_projects(provider_id, completed_on desc nulls last, created_at desc);
create index if not exists portfolio_projects_taxonomy_idx on public.portfolio_projects(stage_id, discipline_id, primary_service_id);

create index if not exists legacy_category_mappings_phase_idx on public.legacy_category_mappings(legacy_phase_id);
create index if not exists legacy_category_mappings_service_idx on public.legacy_category_mappings(service_id);

create index if not exists providers_primary_discipline_id_idx on public.providers(primary_discipline_id);
create index if not exists providers_primary_service_id_idx on public.providers(primary_service_id);

create index if not exists leads_requested_stage_id_idx on public.leads(requested_stage_id);
create index if not exists leads_requested_discipline_id_idx on public.leads(requested_discipline_id);
create index if not exists leads_requested_service_id_idx on public.leads(requested_service_id);
create index if not exists leads_requested_work_type_id_idx on public.leads(requested_work_type_id);

create index if not exists service_posts_requested_stage_id_idx on public.service_posts(requested_stage_id);
create index if not exists service_posts_requested_discipline_id_idx on public.service_posts(requested_discipline_id);
create index if not exists service_posts_requested_service_id_idx on public.service_posts(requested_service_id);
create index if not exists service_posts_requested_work_type_id_idx on public.service_posts(requested_work_type_id);

-- RLS
alter table public.disciplines enable row level security;
alter table public.services enable row level security;
alter table public.work_types enable row level security;
alter table public.provider_services enable row level security;
alter table public.provider_work_types enable row level security;
alter table public.provider_verifications enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.legacy_category_mappings enable row level security;

-- Taxonomy read policies
create policy "Public can read disciplines"
on public.disciplines
for select
to anon, authenticated
using (true);

create policy "Public can read services"
on public.services
for select
to anon, authenticated
using (true);

create policy "Public can read work types"
on public.work_types
for select
to anon, authenticated
using (true);

create policy "Public can read legacy category mappings"
on public.legacy_category_mappings
for select
to anon, authenticated
using (true);

-- Provider services/work types read + owner-managed write
create policy "Public can read provider services"
on public.provider_services
for select
to anon, authenticated
using (true);

create policy "Owners can insert provider services"
on public.provider_services
for insert
to authenticated
with check (
  exists (
    select 1
    from public.providers p
    where p.id = provider_services.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can update provider services"
on public.provider_services
for update
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = provider_services.provider_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.providers p
    where p.id = provider_services.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can delete provider services"
on public.provider_services
for delete
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = provider_services.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Public can read provider work types"
on public.provider_work_types
for select
to anon, authenticated
using (true);

create policy "Owners can insert provider work types"
on public.provider_work_types
for insert
to authenticated
with check (
  exists (
    select 1
    from public.providers p
    where p.id = provider_work_types.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can delete provider work types"
on public.provider_work_types
for delete
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = provider_work_types.provider_id
      and p.owner_user_id = auth.uid()
  )
);

-- Verification visibility: public only approved, owners can read/manage all own records.
create policy "Public can read approved provider verifications"
on public.provider_verifications
for select
to anon, authenticated
using (status = 'approved');

create policy "Owners can read own provider verifications"
on public.provider_verifications
for select
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = provider_verifications.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can insert own provider verifications"
on public.provider_verifications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.providers p
    where p.id = provider_verifications.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can update own provider verifications"
on public.provider_verifications
for update
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = provider_verifications.provider_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.providers p
    where p.id = provider_verifications.provider_id
      and p.owner_user_id = auth.uid()
  )
);

-- Portfolio projects: public read, provider owners manage own.
create policy "Public can read portfolio projects"
on public.portfolio_projects
for select
to anon, authenticated
using (true);

create policy "Owners can insert own portfolio projects"
on public.portfolio_projects
for insert
to authenticated
with check (
  exists (
    select 1
    from public.providers p
    where p.id = portfolio_projects.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can update own portfolio projects"
on public.portfolio_projects
for update
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = portfolio_projects.provider_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.providers p
    where p.id = portfolio_projects.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Owners can delete own portfolio projects"
on public.portfolio_projects
for delete
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = portfolio_projects.provider_id
      and p.owner_user_id = auth.uid()
  )
);
