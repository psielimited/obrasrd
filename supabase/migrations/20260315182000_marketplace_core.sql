-- Core marketplace schema for ObrasRD
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.phases (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  sort_order int not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  phase_id bigint not null references public.phases(id) on delete cascade,
  slug text not null unique,
  name text not null,
  icon text not null,
  popularity_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade text not null,
  category_slug text not null references public.categories(slug),
  phase_id bigint not null references public.phases(id),
  location text not null,
  city text not null,
  years_experience int not null default 0,
  description text not null,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  completed_projects int not null default 0,
  verified boolean not null default false,
  whatsapp text not null,
  starting_price numeric,
  portfolio_images text[] not null default '{}',
  service_areas text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  supplier text not null,
  location text not null,
  price numeric not null,
  unit text not null,
  bulk_price numeric,
  bulk_unit text,
  delivery boolean not null default false,
  whatsapp text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_posts (
  id uuid primary key default gen_random_uuid(),
  post_type text not null,
  title text not null,
  location text not null,
  description text not null,
  estimated_budget text,
  whatsapp text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_posts_status_check check (status in ('pending', 'approved', 'rejected'))
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_type text not null,
  current_phase bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_current_phase_fkey foreign key (current_phase) references public.phases(id)
);

create table if not exists public.project_phases (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  phase_id bigint not null references public.phases(id),
  created_at timestamptz not null default now(),
  unique (project_id, phase_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  requester_name text,
  requester_contact text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_status_check check (status in ('new', 'contacted', 'closed'))
);

create trigger trg_phases_updated_at
before update on public.phases
for each row
execute function public.set_updated_at();

create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger trg_providers_updated_at
before update on public.providers
for each row
execute function public.set_updated_at();

create trigger trg_materials_updated_at
before update on public.materials
for each row
execute function public.set_updated_at();

create trigger trg_service_posts_updated_at
before update on public.service_posts
for each row
execute function public.set_updated_at();

create trigger trg_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger trg_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.phases enable row level security;
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.materials enable row level security;
alter table public.service_posts enable row level security;
alter table public.projects enable row level security;
alter table public.project_phases enable row level security;
alter table public.leads enable row level security;

create policy "Public can read phases"
on public.phases
for select
to anon, authenticated
using (true);

create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

create policy "Public can read providers"
on public.providers
for select
to anon, authenticated
using (true);

create policy "Public can read materials"
on public.materials
for select
to anon, authenticated
using (true);

create policy "Public can submit service posts"
on public.service_posts
for insert
to anon, authenticated
with check (true);

create policy "Authenticated can read service posts"
on public.service_posts
for select
to authenticated
using (true);

create policy "Authenticated can manage projects"
on public.projects
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated can manage project phases"
on public.project_phases
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated can manage leads"
on public.leads
for all
to authenticated
using (true)
with check (true);

insert into public.phases (slug, name, description, sort_order)
values
  ('pre-construccion', 'Pre-Construccion', 'Planos, permisos y diseno legal.', 1),
  ('preparacion-cimentacion', 'Preparacion y Cimentacion', 'Excavacion, terreno y cimentacion.', 2),
  ('construccion-estructural', 'Construccion Estructural', 'Estructura, techos y acabados exteriores.', 3),
  ('instalacion-sistemas', 'Instalacion de Sistemas', 'Electricidad, plomeria y climatizacion.', 4),
  ('acabados-interiores', 'Acabados Interiores', 'Pintura, pisos y carpinteria interior.', 5),
  ('trabajo-final', 'Trabajo Final', 'Paisajismo, limpieza e inspeccion.', 6)
on conflict (slug) do nothing;

insert into public.categories (phase_id, slug, name, icon, popularity_count)
select p.id, c.slug, c.name, c.icon, c.popularity_count
from public.phases p
join (
  values
    ('pre-construccion', 'arquitectos', 'Arquitectos', 'Ruler', 48),
    ('pre-construccion', 'ingenieros-estructurales', 'Ingenieros Estructurales', 'Building2', 35),
    ('pre-construccion', 'ingenieros-mep', 'Ingenieros MEP', 'Zap', 12),
    ('pre-construccion', 'agrimensores', 'Agrimensores', 'MapPin', 8),
    ('pre-construccion', 'consultores-ambientales', 'Consultores Ambientales', 'Leaf', 5),
    ('pre-construccion', 'abogados-inmobiliarios', 'Abogados Inmobiliarios', 'Scale', 7),
    ('pre-construccion', 'gestores-permisos', 'Gestores de Permisos', 'FileText', 9),
    ('pre-construccion', 'agentes-inmobiliarios', 'Agentes Inmobiliarios', 'Home', 15),
    ('preparacion-cimentacion', 'excavacion', 'Excavacion', 'Shovel', 23),
    ('preparacion-cimentacion', 'limpieza-terrenos', 'Limpieza de Terrenos', 'Trees', 14),
    ('preparacion-cimentacion', 'movimiento-tierra', 'Movimiento de Tierra', 'Mountain', 16),
    ('preparacion-cimentacion', 'concreto', 'Concreto', 'Box', 20),
    ('preparacion-cimentacion', 'cimentacion', 'Especialistas en Cimentacion', 'Layers', 18),
    ('preparacion-cimentacion', 'ingenieros-civiles', 'Ingenieros Civiles', 'HardHat', 22),
    ('preparacion-cimentacion', 'servicios-publicos', 'Conexion a Servicios Publicos', 'Plug', 10),
    ('construccion-estructural', 'contratistas-generales', 'Contratistas Generales', 'Hammer', 92),
    ('construccion-estructural', 'carpinteros-estructura', 'Carpinteros / Estructura', 'Wrench', 24),
    ('construccion-estructural', 'contratistas-techos', 'Contratistas de Techos', 'Home', 28),
    ('construccion-estructural', 'aislamiento', 'Instaladores de Aislamiento', 'Shield', 11),
    ('construccion-estructural', 'acabados-exteriores', 'Acabados Exteriores', 'PaintBucket', 13),
    ('construccion-estructural', 'stucco', 'Stucco / Revestimientos', 'Paintbrush', 9),
    ('construccion-estructural', 'albaniles', 'Albaniles', 'Brick', 26),
    ('instalacion-sistemas', 'electricistas', 'Electricistas', 'Zap', 67),
    ('instalacion-sistemas', 'plomeros', 'Plomeros', 'Droplets', 54),
    ('instalacion-sistemas', 'hvac', 'Tecnicos HVAC', 'Wind', 18),
    ('instalacion-sistemas', 'paneles-solares', 'Instaladores de Paneles Solares', 'Sun', 31),
    ('instalacion-sistemas', 'redes-cableado', 'Redes y Cableado', 'Cable', 12),
    ('acabados-interiores', 'pintores', 'Pintores', 'Paintbrush', 41),
    ('acabados-interiores', 'instaladores-pisos', 'Instaladores de Pisos', 'Grid3x3', 25),
    ('acabados-interiores', 'carpinteria-interior', 'Carpinteria Interior', 'DoorOpen', 19),
    ('acabados-interiores', 'gabinetes', 'Instaladores de Gabinetes', 'LayoutGrid', 17),
    ('acabados-interiores', 'disenadores-interiores', 'Disenadores de Interiores', 'Palette', 16),
    ('acabados-interiores', 'drywall', 'Instaladores de Drywall', 'Square', 14),
    ('acabados-interiores', 'vidrieros', 'Vidrieros', 'GlassWater', 10),
    ('trabajo-final', 'paisajismo', 'Paisajismo', 'Flower2', 13),
    ('trabajo-final', 'pavimentacion', 'Pavimentacion', 'Road', 11),
    ('trabajo-final', 'portones', 'Instalacion de Portones', 'DoorClosed', 8),
    ('trabajo-final', 'limpieza', 'Servicios de Limpieza', 'Sparkles', 21),
    ('trabajo-final', 'inspectores', 'Inspectores de Construccion', 'ClipboardCheck', 9)
) as c(phase_slug, slug, name, icon, popularity_count)
  on c.phase_slug = p.slug
on conflict (slug) do nothing;

insert into public.providers (
  id, name, trade, category_slug, phase_id, location, city, years_experience, description,
  rating, review_count, completed_projects, verified, whatsapp, starting_price, portfolio_images, service_areas
)
select v.id::uuid, v.name, v.trade, v.category_slug, p.id, v.location, v.city, v.years_experience, v.description,
  v.rating, v.review_count, v.completed_projects, v.verified, v.whatsapp, v.starting_price, v.portfolio_images::text[], v.service_areas::text[]
from public.phases p
join (
  values
    ('00000000-0000-0000-0000-000000000001', 'Arq. Maria Gonzalez', 'Arquitecto Residencial', 'arquitectos', 'pre-construccion', 'Santo Domingo', 'Santo Domingo', 12, 'Servicios de diseno arquitectonico y planos estructurales para residencias y proyectos comerciales.', 4.8, 47, 85, true, '18091234567', 25000, '{}', '{Santo Domingo,San Cristobal}'),
    ('00000000-0000-0000-0000-000000000002', 'Ing. Carlos Perez', 'Ingeniero Estructural', 'ingenieros-estructurales', 'pre-construccion', 'Santiago', 'Santiago', 15, 'Calculos estructurales y supervision de obra para edificaciones de hasta 10 niveles.', 4.9, 62, 120, true, '18099876543', 35000, '{}', '{Santiago,Jarabacoa}'),
    ('00000000-0000-0000-0000-000000000003', 'Jose Martinez Construcciones', 'Contratista General', 'contratistas-generales', 'construccion-estructural', 'Punta Cana', 'Punta Cana', 20, 'Construccion llave en mano de residencias y villas turisticas en la zona Este.', 4.7, 93, 200, true, '18095551234', 500000, '{}', '{Punta Cana,La Romana}'),
    ('00000000-0000-0000-0000-000000000004', 'ElectriPro RD', 'Electricista', 'electricistas', 'instalacion-sistemas', 'Santo Domingo', 'Santo Domingo', 8, 'Instalaciones electricas residenciales y comerciales. Certificados CDEEE.', 4.6, 31, 55, true, '18097771234', 15000, '{}', '{Santo Domingo,San Cristobal}'),
    ('00000000-0000-0000-0000-000000000005', 'Plomeria Dominicana', 'Plomero', 'plomeros', 'instalacion-sistemas', 'Santiago', 'Santiago', 10, 'Instalacion y reparacion de sistemas de plomeria. Trabajo garantizado.', 4.5, 28, 75, false, '18098881234', 8000, '{}', '{Santiago}'),
    ('00000000-0000-0000-0000-000000000006', 'Pinturas del Caribe', 'Pintor', 'pintores', 'acabados-interiores', 'La Romana', 'La Romana', 6, 'Pintura interior y exterior. Acabados decorativos y texturas especiales.', 4.4, 19, 40, false, '18096661234', 12000, '{}', '{La Romana,Punta Cana}'),
    ('00000000-0000-0000-0000-000000000007', 'Excavaciones del Norte', 'Excavacion', 'excavacion', 'preparacion-cimentacion', 'Jarabacoa', 'Jarabacoa', 18, 'Excavacion, movimiento de tierra y preparacion de terrenos para construccion.', 4.7, 35, 150, true, '18094441234', 20000, '{}', '{Jarabacoa,Santiago}'),
    ('00000000-0000-0000-0000-000000000008', 'Solar Tech RD', 'Instalador de Paneles Solares', 'paneles-solares', 'instalacion-sistemas', 'Santo Domingo', 'Santo Domingo', 5, 'Diseno e instalacion de sistemas solares fotovoltaicos residenciales y comerciales.', 4.8, 22, 35, true, '18093331234', 45000, '{}', '{Santo Domingo,Santiago,Punta Cana}')
) as v(id, name, trade, category_slug, phase_slug, location, city, years_experience, description, rating, review_count, completed_projects, verified, whatsapp, starting_price, portfolio_images, service_areas)
  on v.phase_slug = p.slug
on conflict (id) do nothing;

insert into public.materials (
  id, name, category, supplier, location, price, unit, bulk_price, bulk_unit, delivery, whatsapp, description
)
values
  ('10000000-0000-0000-0000-000000000001', 'Cemento Gris Portland Tipo I', 'Cemento', 'Ferreteria Nacional', 'Santo Domingo', 380, 'saco (42.5kg)', 350, '50+ sacos', true, '18091112233', 'Cemento Portland tipo I para uso general en construccion.'),
  ('10000000-0000-0000-0000-000000000002', 'Varilla Corrugada 3/8"', 'Varilla', 'Acero del Caribe', 'Santiago', 285, 'unidad (20 pies)', 260, '100+ unidades', true, '18092223344', 'Varilla de acero corrugada grado 60 para refuerzo estructural.'),
  ('10000000-0000-0000-0000-000000000003', 'Block de 6"', 'Blocks', 'Bloques Dominicanos', 'San Cristobal', 22, 'unidad', 18, '1000+ unidades', true, '18093334455', 'Block de concreto de 6 pulgadas para muros y paredes.'),
  ('10000000-0000-0000-0000-000000000004', 'Arena Lavada', 'Arena', 'Agregados del Este', 'La Romana', 8500, 'metro cubico', null, null, true, '18094445566', 'Arena lavada de rio para mezcla de concreto y mortero.'),
  ('10000000-0000-0000-0000-000000000005', 'Pintura Latex Interior', 'Pintura', 'Pinturas Caribe', 'Santo Domingo', 1200, 'galon', 1050, '10+ galones', true, '18095556677', 'Pintura de latex acrilica para interiores. Acabado mate, lavable.'),
  ('10000000-0000-0000-0000-000000000006', 'Zinc Galvanizado Cal. 26', 'Techos metalicos', 'Techos del Norte', 'Santiago', 850, 'lamina (12 pies)', 780, '50+ laminas', true, '18096667788', 'Lamina de zinc galvanizado calibre 26 para techado.')
on conflict (id) do nothing;
