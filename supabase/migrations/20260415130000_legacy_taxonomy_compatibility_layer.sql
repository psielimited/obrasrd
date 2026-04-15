-- Legacy category -> canonical taxonomy compatibility layer (additive)
-- Goal: keep current category-driven UX working while canonical taxonomy backfill progresses.

alter table public.legacy_category_mappings
add column if not exists work_type_id bigint references public.work_types(id) on delete set null;

alter table public.legacy_category_mappings
add column if not exists is_ambiguous boolean not null default false;

alter table public.legacy_category_mappings
add column if not exists ambiguity_reason text;

create index if not exists legacy_category_mappings_work_type_idx
  on public.legacy_category_mappings(work_type_id);

create index if not exists legacy_category_mappings_ambiguous_idx
  on public.legacy_category_mappings(is_ambiguous);

-- Expand seeded mappings for legacy categories.
insert into public.legacy_category_mappings (
  legacy_category_slug,
  legacy_phase_id,
  discipline_id,
  service_id,
  work_type_id,
  confidence,
  mapping_source,
  is_ambiguous,
  ambiguity_reason,
  notes
)
select
  c.slug,
  c.phase_id,
  d.id,
  s.id,
  wt.id,
  m.confidence,
  'compatibility_seed',
  m.is_ambiguous,
  m.ambiguity_reason,
  m.notes
from (
  values
    ('arquitectos', 'arquitectura', 'anteproyecto_arquitectonico', null, 0.99, false, null, 'Mapeo directo por oficio.'),
    ('ingenieros-estructurales', 'ingenieria_civil', 'calculo_estructural', null, 0.99, false, null, 'Mapeo directo por especialidad estructural.'),
    ('ingenieros-mep', 'ingenieria_sanitaria', 'diseno_hidrosanitario', null, 0.85, true, 'MEP mezcla disciplinas sanitaria/electrica/mecanica.', 'Mapeo provisional hacia hidrosanitario.'),
    ('agrimensores', 'topografia', 'levantamiento_topografico', null, 0.99, false, null, 'Mapeo directo por actividad topografica.'),

    ('excavacion', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.8, true, 'Categoria de movimiento de tierra no tiene servicio canonico exacto.', 'Mapeo proxy a ejecucion de obra.'),
    ('limpieza-terrenos', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.78, true, 'Categoria de preparacion de terreno no tiene servicio canonico exacto.', 'Mapeo proxy a ejecucion de obra.'),
    ('movimiento-tierra', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.8, true, 'Categoria de movimiento de tierra no tiene servicio canonico exacto.', 'Mapeo proxy a ejecucion de obra.'),
    ('concreto', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.82, true, 'No existe servicio canonico de obra gris/concreto aun.', 'Mapeo proxy a ejecucion de obra.'),
    ('cimentacion', 'ingenieria_civil', 'calculo_estructural', 'obra_exterior', 0.84, true, 'Categoria constructiva y de ingenieria civil.', 'Mapeo proxy a calculo estructural.'),
    ('ingenieros-civiles', 'ingenieria_civil', 'calculo_estructural', null, 0.96, false, null, 'Mapeo directo por disciplina.'),
    ('servicios-publicos', 'ingenieria_electrica', 'instalacion_electrica', 'obra_exterior', 0.8, true, 'Puede abarcar electrico, sanitario y telecom.', 'Mapeo proxy a instalacion electrica.'),

    ('contratistas-generales', 'supervision_gerencia', 'supervision_de_obra', null, 0.9, true, 'Puede abarcar gerencia, ejecucion y terminaciones.', 'Mapeo por coordinacion general.'),
    ('carpinteros-estructura', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.76, true, 'No hay servicio canonico de carpinteria estructural.', 'Mapeo proxy a ejecucion.'),
    ('contratistas-techos', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.9, false, null, 'Compatibilidad directa con servicio de impermeabilizacion.'),
    ('aislamiento', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.82, true, 'Aislamiento puede ser termico/acustico/fachada.', 'Mapeo proxy a envolvente.'),
    ('acabados-exteriores', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.8, true, 'Categoria de acabados amplios sin servicio exacto.', 'Mapeo proxy a envolvente.'),
    ('stucco', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.86, true, 'Stucco puede incluir acabados no cubiertos de forma explicita.', 'Mapeo proxy a envolvente.'),
    ('albaniles', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.78, true, 'No hay servicio canonico de albanileria.', 'Mapeo proxy a ejecucion de obra.'),

    ('electricistas', 'ingenieria_electrica', 'instalacion_electrica', null, 0.99, false, null, 'Mapeo directo por actividad electrica.'),
    ('plomeros', 'ingenieria_sanitaria', 'diseno_hidrosanitario', null, 0.9, true, 'Categoria de instalacion, servicio canonico disponible es de diseno.', 'Mapeo provisional.'),
    ('hvac', 'ingenieria_electrica', 'instalacion_electrica', null, 0.74, true, 'HVAC no tiene servicio canonico especifico aun.', 'Mapeo proxy a instalaciones.'),
    ('paneles-solares', 'ingenieria_electrica', 'instalacion_electrica', 'obra_exterior', 0.92, false, null, 'Mapeo directo a instalacion electrica.'),
    ('redes-cableado', 'ingenieria_electrica', 'instalacion_electrica', null, 0.83, true, 'Cableado puede ser datos/electrico/voz.', 'Mapeo proxy a instalacion electrica.'),

    ('pintores', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.84, true, 'No existe servicio canonico de pintura.', 'Mapeo proxy a remodelacion interior.'),
    ('instaladores-pisos', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.82, true, 'No existe servicio canonico de pisos.', 'Mapeo proxy a remodelacion interior.'),
    ('carpinteria-interior', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.86, true, 'Categoria de interiores amplia.', 'Mapeo proxy a remodelacion interior.'),
    ('gabinetes', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.9, false, null, 'Mapeo cercano a remodelacion de cocina.'),
    ('disenadores-interiores', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.9, false, null, 'Servicio representativo de disciplina interior.'),
    ('drywall', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.82, true, 'No existe servicio canonico de drywall.', 'Mapeo proxy a remodelacion interior.'),
    ('vidrieros', 'diseno_interior', 'remodelacion_de_cocina', 'remodelacion_interior', 0.78, true, 'No existe servicio canonico de vidrieria.', 'Mapeo proxy a remodelacion interior.'),

    ('pavimentacion', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.82, true, 'No existe servicio canonico de pavimentacion.', 'Mapeo proxy a obra exterior.'),
    ('portones', 'construccion_ejecucion', 'impermeabilizacion', 'obra_exterior', 0.78, true, 'No existe servicio canonico de portones.', 'Mapeo proxy a obra exterior.'),
    ('limpieza', 'seguridad_salud', 'mantenimiento_preventivo', 'mantenimiento_general', 0.75, true, 'Limpieza puede ser post-obra, mantenimiento o especialidades.', 'Mapeo de mantenimiento operativo.'),
    ('inspectores', 'seguridad_salud', 'diagnostico_de_filtraciones', 'mantenimiento_general', 0.72, true, 'Inspeccion de construccion no tiene servicio canonico dedicado.', 'Mapeo proxy a diagnostico.' )
) as m(
  legacy_slug,
  discipline_slug,
  service_slug,
  work_type_code,
  confidence,
  is_ambiguous,
  ambiguity_reason,
  notes
)
join public.categories c on c.slug = m.legacy_slug
join public.disciplines d on d.slug = m.discipline_slug
join public.services s on s.slug = m.service_slug and s.discipline_id = d.id
left join public.work_types wt on wt.code = m.work_type_code
on conflict (legacy_category_slug, service_id) do update
set
  legacy_phase_id = excluded.legacy_phase_id,
  discipline_id = excluded.discipline_id,
  work_type_id = excluded.work_type_id,
  confidence = excluded.confidence,
  mapping_source = excluded.mapping_source,
  is_ambiguous = excluded.is_ambiguous,
  ambiguity_reason = excluded.ambiguity_reason,
  notes = excluded.notes,
  updated_at = now();

-- Deterministic provider backfill from legacy category mapping.
with preferred_map as (
  select distinct on (m.legacy_category_slug)
    m.legacy_category_slug,
    m.discipline_id,
    m.service_id,
    m.work_type_id
  from public.legacy_category_mappings m
  where m.is_ambiguous = false
  order by m.legacy_category_slug, m.confidence desc, m.id asc
)
update public.providers p
set
  primary_discipline_id = coalesce(p.primary_discipline_id, pm.discipline_id),
  primary_service_id = coalesce(p.primary_service_id, pm.service_id)
from preferred_map pm
where p.category_slug = pm.legacy_category_slug
  and (p.primary_discipline_id is null or p.primary_service_id is null);

with preferred_map as (
  select distinct on (m.legacy_category_slug)
    m.legacy_category_slug,
    m.service_id
  from public.legacy_category_mappings m
  where m.is_ambiguous = false
  order by m.legacy_category_slug, m.confidence desc, m.id asc
)
insert into public.provider_services (provider_id, service_id, is_primary)
select p.id, pm.service_id, true
from public.providers p
join preferred_map pm on pm.legacy_category_slug = p.category_slug
on conflict (provider_id, service_id) do update
set
  is_primary = excluded.is_primary,
  updated_at = now();

with preferred_map as (
  select distinct on (m.legacy_category_slug)
    m.legacy_category_slug,
    m.work_type_id
  from public.legacy_category_mappings m
  where m.is_ambiguous = false
    and m.work_type_id is not null
  order by m.legacy_category_slug, m.confidence desc, m.id asc
)
insert into public.provider_work_types (provider_id, work_type_id)
select p.id, pm.work_type_id
from public.providers p
join preferred_map pm on pm.legacy_category_slug = p.category_slug
on conflict (provider_id, work_type_id) do nothing;

-- Reporting views: full/ambiguous/unmapped coverage for legacy categories.
create or replace view public.legacy_category_mapping_report as
with category_status as (
  select
    c.slug as legacy_category_slug,
    c.name as legacy_category_name,
    c.phase_id,
    count(m.id) as mapping_count,
    bool_or(m.is_ambiguous) filter (where m.id is not null) as has_ambiguous,
    max(m.confidence) filter (where m.id is not null) as max_confidence
  from public.categories c
  left join public.legacy_category_mappings m
    on m.legacy_category_slug = c.slug
  group by c.slug, c.name, c.phase_id
)
select
  cs.legacy_category_slug,
  cs.legacy_category_name,
  cs.phase_id,
  case
    when cs.mapping_count = 0 then 'unmapped'
    when cs.has_ambiguous then 'ambiguous'
    else 'fully_mapped'
  end as mapping_status,
  cs.mapping_count,
  cs.max_confidence
from category_status cs
order by cs.legacy_category_slug;

grant select on public.legacy_category_mapping_report to anon, authenticated;

create or replace view public.legacy_category_mapping_summary as
select
  mapping_status,
  count(*)::int as category_count
from public.legacy_category_mapping_report
group by mapping_status
order by mapping_status;

grant select on public.legacy_category_mapping_summary to anon, authenticated;
