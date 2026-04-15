-- Smoke verification for taxonomy seed + legacy compatibility layer.
-- Validates canonical seed data, mapping coverage, provider taxonomy joins, and intake persistence.
-- Safe by default: this script ends with ROLLBACK.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'disciplines'
  ) then
    raise exception 'Missing table public.disciplines';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'services'
  ) then
    raise exception 'Missing table public.services';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'work_types'
  ) then
    raise exception 'Missing table public.work_types';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_services'
  ) then
    raise exception 'Missing table public.provider_services';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_work_types'
  ) then
    raise exception 'Missing table public.provider_work_types';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'legacy_category_mappings'
  ) then
    raise exception 'Missing table public.legacy_category_mappings';
  end if;

  if not exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'legacy_category_mapping_report'
  ) then
    raise exception 'Missing view public.legacy_category_mapping_report';
  end if;

  if not exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'legacy_category_mapping_summary'
  ) then
    raise exception 'Missing view public.legacy_category_mapping_summary';
  end if;
end
$$;

do $$
declare
  v_expected_stages text[] := array['planificacion', 'construccion', 'mantenimiento'];
  v_expected_disciplines text[] := array[
    'arquitectura',
    'ingenieria_civil',
    'ingenieria_electrica',
    'ingenieria_sanitaria',
    'topografia',
    'supervision_gerencia',
    'construccion_ejecucion',
    'diseno_interior',
    'paisajismo',
    'instalaciones_especiales',
    'seguridad_salud'
  ];
  v_expected_services text[] := array[
    'anteproyecto_arquitectonico',
    'planos_constructivos',
    'calculo_estructural',
    'levantamiento_topografico',
    'instalacion_electrica',
    'diseno_hidrosanitario',
    'supervision_de_obra',
    'impermeabilizacion',
    'remodelacion_de_cocina',
    'diagnostico_de_filtraciones',
    'mantenimiento_preventivo'
  ];
  v_expected_work_types text[] := array[
    'vivienda_unifamiliar',
    'edificio_multifamiliar',
    'local_comercial',
    'oficina',
    'nave_industrial',
    'remodelacion_interior',
    'obra_exterior',
    'mantenimiento_general'
  ];
  v_missing_count int;
  v_mismatch_count int;
  v_unmapped_count int;
  v_ambiguous_count int;
  v_fully_mapped_count int;
begin
  select count(*)
    into v_missing_count
  from unnest(v_expected_stages) s(slug)
  where not exists (
    select 1
    from public.phases p
    where p.slug = s.slug
  );

  if v_missing_count > 0 then
    raise exception 'Canonical stages missing (% rows)', v_missing_count;
  end if;

  select count(*)
    into v_missing_count
  from unnest(v_expected_disciplines) d(slug)
  where not exists (
    select 1
    from public.disciplines x
    where x.slug = d.slug
  );

  if v_missing_count > 0 then
    raise exception 'Canonical disciplines missing (% rows)', v_missing_count;
  end if;

  select count(*)
    into v_missing_count
  from unnest(v_expected_services) s(slug)
  where not exists (
    select 1
    from public.services x
    where x.slug = s.slug
  );

  if v_missing_count > 0 then
    raise exception 'Canonical services missing (% rows)', v_missing_count;
  end if;

  select count(*)
    into v_missing_count
  from unnest(v_expected_work_types) w(code)
  where not exists (
    select 1
    from public.work_types x
    where x.code = w.code
  );

  if v_missing_count > 0 then
    raise exception 'Canonical work types missing (% rows)', v_missing_count;
  end if;

  -- Each service must remain stage-consistent with its discipline.
  select count(*)
    into v_mismatch_count
  from public.services s
  join public.disciplines d on d.id = s.discipline_id
  where s.stage_id <> d.stage_id;

  if v_mismatch_count > 0 then
    raise exception 'Found % service/discipline stage mismatches', v_mismatch_count;
  end if;

  select
    coalesce(sum(case when mapping_status = 'unmapped' then category_count else 0 end), 0),
    coalesce(sum(case when mapping_status = 'ambiguous' then category_count else 0 end), 0),
    coalesce(sum(case when mapping_status = 'fully_mapped' then category_count else 0 end), 0)
    into v_unmapped_count, v_ambiguous_count, v_fully_mapped_count
  from public.legacy_category_mapping_summary;

  if v_fully_mapped_count = 0 then
    raise exception 'No fully_mapped legacy categories found';
  end if;

  raise notice 'Legacy mapping summary -> fully_mapped: %, ambiguous: %, unmapped: %',
    v_fully_mapped_count, v_ambiguous_count, v_unmapped_count;
end
$$;

-- Provider taxonomy join smoke checks.
do $$
declare
  v_provider_id uuid;
  v_service_id bigint;
  v_work_type_id bigint;
begin
  select p.id
    into v_provider_id
  from public.providers p
  order by p.created_at desc
  limit 1;

  if v_provider_id is null then
    raise notice 'SKIP provider taxonomy join checks: no providers found';
    return;
  end if;

  select s.id
    into v_service_id
  from public.services s
  where s.slug = 'supervision_de_obra'
  limit 1;

  if v_service_id is null then
    raise exception 'Missing canonical service supervision_de_obra';
  end if;

  select w.id
    into v_work_type_id
  from public.work_types w
  where w.code = 'obra_exterior'
  limit 1;

  if v_work_type_id is null then
    raise exception 'Missing canonical work type obra_exterior';
  end if;

  insert into public.provider_services (provider_id, service_id, is_primary)
  values (v_provider_id, v_service_id, false)
  on conflict (provider_id, service_id) do update
  set is_primary = excluded.is_primary,
      updated_at = now();

  if not exists (
    select 1
    from public.provider_services ps
    where ps.provider_id = v_provider_id
      and ps.service_id = v_service_id
  ) then
    raise exception 'provider_services insert/upsert verification failed';
  end if;

  insert into public.provider_work_types (provider_id, work_type_id)
  values (v_provider_id, v_work_type_id)
  on conflict (provider_id, work_type_id) do nothing;

  if not exists (
    select 1
    from public.provider_work_types pwt
    where pwt.provider_id = v_provider_id
      and pwt.work_type_id = v_work_type_id
  ) then
    raise exception 'provider_work_types insert verification failed';
  end if;
end
$$;

-- Project intake persistence smoke (service_posts requested taxonomy fields).
do $$
declare
  v_post_id uuid;
  v_stage_id bigint;
  v_discipline_id bigint;
  v_service_id bigint;
  v_work_type_id bigint;
begin
  select id into v_stage_id from public.phases where slug = 'construccion' limit 1;
  select id into v_discipline_id from public.disciplines where slug = 'construccion_ejecucion' limit 1;
  select id into v_service_id from public.services where slug = 'impermeabilizacion' limit 1;
  select id into v_work_type_id from public.work_types where code = 'obra_exterior' limit 1;

  if v_stage_id is null or v_discipline_id is null or v_service_id is null or v_work_type_id is null then
    raise exception 'Could not resolve canonical IDs for intake smoke';
  end if;

  insert into public.service_posts (
    post_type,
    title,
    location,
    description,
    estimated_budget,
    whatsapp,
    requested_stage_id,
    requested_discipline_id,
    requested_service_id,
    requested_work_type_id
  )
  values (
    'Necesito un profesional',
    'SMOKE taxonomy intake',
    'Santo Domingo',
    'Verificacion de persistencia de intake con taxonomia.',
    'RD$ 250,000',
    '18090000000',
    v_stage_id,
    v_discipline_id,
    v_service_id,
    v_work_type_id
  )
  returning id into v_post_id;

  if v_post_id is null then
    raise exception 'service_posts insert did not return id';
  end if;

  if not exists (
    select 1
    from public.service_posts sp
    where sp.id = v_post_id
      and sp.requested_stage_id = v_stage_id
      and sp.requested_discipline_id = v_discipline_id
      and sp.requested_service_id = v_service_id
      and sp.requested_work_type_id = v_work_type_id
  ) then
    raise exception 'service_posts taxonomy fields did not persist as expected';
  end if;
end
$$;

rollback;
