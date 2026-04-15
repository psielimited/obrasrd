-- Canonical taxonomy enforcement + seed data (additive follow-up)
-- Keeps legacy categories/providers/leads/plans intact while introducing canonical stage->discipline->service data.

-- Ensure each service is explicitly bound to one stage and one discipline.
alter table public.services
add column if not exists stage_id bigint;

update public.services s
set stage_id = d.stage_id
from public.disciplines d
where s.discipline_id = d.id
  and s.stage_id is null;

-- Stage FK on services
 do $$
 begin
   if not exists (
     select 1
     from pg_constraint
     where conname = 'services_stage_id_fkey'
       and conrelid = 'public.services'::regclass
   ) then
     alter table public.services
     add constraint services_stage_id_fkey
     foreign key (stage_id)
     references public.phases(id)
     on delete cascade;
   end if;
 end
 $$;

create unique index if not exists disciplines_id_stage_uidx
  on public.disciplines(id, stage_id);

-- Discipline-stage consistency for each service
 do $$
 begin
   if not exists (
     select 1
     from pg_constraint
     where conname = 'services_discipline_stage_fkey'
       and conrelid = 'public.services'::regclass
   ) then
     alter table public.services
     add constraint services_discipline_stage_fkey
     foreign key (discipline_id, stage_id)
     references public.disciplines(id, stage_id)
     on delete cascade;
   end if;
 end
 $$;

alter table public.services
alter column stage_id set not null;

create index if not exists services_stage_discipline_idx
  on public.services(stage_id, discipline_id, sort_order, id);

-- Canonical project stages (Spanish labels)
insert into public.phases (slug, name, description, sort_order)
values
  ('planificacion', 'Planificacion', 'Estudios, diseno tecnico, alcance y permisos.', 101),
  ('construccion', 'Construccion', 'Ejecucion de obra, instalaciones y terminaciones.', 102),
  ('mantenimiento', 'Mantenimiento', 'Diagnostico, conservacion y mejora continua de activos.', 103)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Canonical disciplines
insert into public.disciplines (stage_id, slug, name, description, sort_order, is_active)
select p.id, d.slug, d.name, d.description, d.sort_order, true
from public.phases p
join (
  values
    ('planificacion', 'arquitectura', 'Arquitectura', 'Diseno arquitectonico, anteproyecto y documentacion.', 10),
    ('planificacion', 'ingenieria_civil', 'Ingenieria Civil', 'Estructuras, suelos y soluciones civiles.', 20),
    ('construccion', 'ingenieria_electrica', 'Ingenieria Electrica', 'Sistemas electricos y energia en obra.', 30),
    ('planificacion', 'ingenieria_sanitaria', 'Ingenieria Sanitaria', 'Sistemas hidrosanitarios y drenajes.', 40),
    ('planificacion', 'topografia', 'Topografia', 'Levantamientos, replanteos y control de terreno.', 50),
    ('construccion', 'supervision_gerencia', 'Supervision y Gerencia', 'Direccion tecnica, control de calidad y cronograma.', 60),
    ('construccion', 'construccion_ejecucion', 'Construccion y Ejecucion', 'Ejecucion de obra gris y acabados tecnicos.', 70),
    ('construccion', 'diseno_interior', 'Diseno Interior', 'Espacios interiores funcionales y esteticamente coherentes.', 80),
    ('construccion', 'paisajismo', 'Paisajismo', 'Intervenciones exteriores, vegetacion y entorno.', 90),
    ('construccion', 'instalaciones_especiales', 'Instalaciones Especiales', 'Sistemas especiales y equipamiento tecnico.', 100),
    ('mantenimiento', 'seguridad_salud', 'Seguridad y Salud', 'Prevencion, inspeccion y mantenimiento seguro.', 110)
) as d(stage_slug, slug, name, description, sort_order)
  on p.slug = d.stage_slug
on conflict (slug) do update
set
  stage_id = excluded.stage_id,
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- Canonical services (each with exactly one stage + one discipline)
insert into public.services (stage_id, discipline_id, slug, name, description, sort_order, is_active)
select p.id, d.id, s.slug, s.name, s.description, s.sort_order, true
from (
  values
    ('planificacion', 'arquitectura', 'anteproyecto_arquitectonico', 'Anteproyecto Arquitectonico', 'Conceptualizacion inicial de proyecto arquitectonico.', 10),
    ('planificacion', 'arquitectura', 'planos_constructivos', 'Planos Constructivos', 'Documentacion tecnica para ejecucion y permisos.', 20),
    ('planificacion', 'ingenieria_civil', 'calculo_estructural', 'Calculo Estructural', 'Memorias y calculos para estabilidad estructural.', 30),
    ('planificacion', 'topografia', 'levantamiento_topografico', 'Levantamiento Topografico', 'Captura geometrica y altimetrica del terreno.', 40),
    ('construccion', 'ingenieria_electrica', 'instalacion_electrica', 'Instalacion Electrica', 'Montaje y puesta en servicio de redes electricas.', 50),
    ('planificacion', 'ingenieria_sanitaria', 'diseno_hidrosanitario', 'Diseno Hidrosanitario', 'Diseno de redes de agua potable y residual.', 60),
    ('construccion', 'supervision_gerencia', 'supervision_de_obra', 'Supervision de Obra', 'Control tecnico de alcance, costo y calidad.', 70),
    ('construccion', 'construccion_ejecucion', 'impermeabilizacion', 'Impermeabilizacion', 'Proteccion de elementos contra ingreso de humedad.', 80),
    ('construccion', 'diseno_interior', 'remodelacion_de_cocina', 'Remodelacion de Cocina', 'Intervencion integral de cocina residencial/comercial.', 90),
    ('mantenimiento', 'seguridad_salud', 'diagnostico_de_filtraciones', 'Diagnostico de Filtraciones', 'Inspeccion tecnica de origen y riesgos por filtracion.', 100),
    ('mantenimiento', 'seguridad_salud', 'mantenimiento_preventivo', 'Mantenimiento Preventivo', 'Rutinas planificadas para reducir fallas futuras.', 110)
) as s(stage_slug, discipline_slug, slug, name, description, sort_order)
join public.phases p on p.slug = s.stage_slug
join public.disciplines d on d.slug = s.discipline_slug and d.stage_id = p.id
on conflict (slug) do update
set
  stage_id = excluded.stage_id,
  discipline_id = excluded.discipline_id,
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- Canonical work types
insert into public.work_types (code, name, description, sort_order, is_active)
values
  ('vivienda_unifamiliar', 'Vivienda Unifamiliar', 'Casa individual para uso residencial.', 10, true),
  ('edificio_multifamiliar', 'Edificio Multifamiliar', 'Edificaciones residenciales de varias unidades.', 20, true),
  ('local_comercial', 'Local Comercial', 'Espacios para comercio y servicios.', 30, true),
  ('oficina', 'Oficina', 'Espacios corporativos y administrativos.', 40, true),
  ('nave_industrial', 'Nave Industrial', 'Infraestructura para produccion y logistica.', 50, true),
  ('remodelacion_interior', 'Remodelacion Interior', 'Renovacion de espacios interiores existentes.', 60, true),
  ('obra_exterior', 'Obra Exterior', 'Intervenciones exteriores y urbanizacion.', 70, true),
  ('mantenimiento_general', 'Mantenimiento General', 'Servicios de mantenimiento integral.', 80, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- Legacy category mappings (forward compatibility bridge)
insert into public.legacy_category_mappings (
  legacy_category_slug,
  legacy_phase_id,
  discipline_id,
  service_id,
  confidence,
  mapping_source,
  notes
)
select
  c.slug,
  c.phase_id,
  d.id,
  s.id,
  m.confidence,
  'canonical_seed',
  m.notes
from (
  values
    ('arquitectos', 'arquitectura', 'anteproyecto_arquitectonico', 0.99, 'Mapeo directo por oficio.'),
    ('ingenieros-estructurales', 'ingenieria_civil', 'calculo_estructural', 0.99, 'Mapeo directo por especialidad estructural.'),
    ('agrimensores', 'topografia', 'levantamiento_topografico', 0.99, 'Mapeo directo por actividad topografica.'),
    ('electricistas', 'ingenieria_electrica', 'instalacion_electrica', 0.99, 'Mapeo directo por actividad electrica.'),
    ('plomeros', 'ingenieria_sanitaria', 'diseno_hidrosanitario', 0.9, 'Mapeo aproximado para continuidad de descubrimiento.'),
    ('contratistas-generales', 'supervision_gerencia', 'supervision_de_obra', 0.9, 'Mapeo por funcion de coordinacion general.'),
    ('disenadores-interiores', 'diseno_interior', 'remodelacion_de_cocina', 0.88, 'Servicio representativo de disciplina interior.'),
    ('limpieza', 'seguridad_salud', 'mantenimiento_preventivo', 0.75, 'Mapeo de mantenimiento operativo general.')
) as m(legacy_slug, discipline_slug, service_slug, confidence, notes)
join public.categories c on c.slug = m.legacy_slug
join public.disciplines d on d.slug = m.discipline_slug
join public.services s on s.slug = m.service_slug and s.discipline_id = d.id
on conflict (legacy_category_slug, service_id) do update
set
  legacy_phase_id = excluded.legacy_phase_id,
  discipline_id = excluded.discipline_id,
  confidence = excluded.confidence,
  mapping_source = excluded.mapping_source,
  notes = excluded.notes,
  updated_at = now();
