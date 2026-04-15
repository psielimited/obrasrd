-- Smoke verification for taxonomy + lead lifecycle + monetization compatibility.
-- Validates lead messaging lifecycle with taxonomy fields and confirms plan quota/featured enforcement still applies.
-- Safe by default: this script ends with ROLLBACK.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'requested_stage_id'
  ) then
    raise exception 'Missing column public.leads.requested_stage_id';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'requested_discipline_id'
  ) then
    raise exception 'Missing column public.leads.requested_discipline_id';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'requested_service_id'
  ) then
    raise exception 'Missing column public.leads.requested_service_id';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'requested_work_type_id'
  ) then
    raise exception 'Missing column public.leads.requested_work_type_id';
  end if;

  if not exists (
    select 1 from pg_proc
    where proname = 'send_lead_message'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.send_lead_message(uuid, text)';
  end if;

  if not exists (
    select 1 from pg_proc
    where proname = 'mark_my_lead_thread_read'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.mark_my_lead_thread_read(uuid)';
  end if;

  if not exists (
    select 1 from pg_proc
    where proname = 'update_my_lead_state'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.update_my_lead_state(uuid, text)';
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_enforce_provider_lead_quota'
  ) then
    raise exception 'Missing trigger trg_enforce_provider_lead_quota';
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'trg_enforce_provider_featured_entitlement'
  ) then
    raise exception 'Missing trigger trg_enforce_provider_featured_entitlement';
  end if;
end
$$;

-- Lead lifecycle still works with taxonomy-populated lead rows.
do $$
declare
  v_provider_id uuid;
  v_provider_owner_user_id uuid;
  v_requester_user_id uuid;
  v_lead_id uuid;
  v_stage_id bigint;
  v_discipline_id bigint;
  v_service_id bigint;
  v_work_type_id bigint;
begin
  select p.id, p.owner_user_id
    into v_provider_id, v_provider_owner_user_id
  from public.providers p
  where p.owner_user_id is not null
  order by p.created_at desc
  limit 1;

  if v_provider_id is null then
    raise notice 'SKIP lead lifecycle smoke: no provider with owner_user_id found';
    return;
  end if;

  select l.requester_user_id
    into v_requester_user_id
  from public.leads l
  where l.requester_user_id is not null
  order by l.created_at desc
  limit 1;

  if v_requester_user_id is null then
    raise notice 'SKIP lead lifecycle smoke: no requester_user_id found on existing leads';
    return;
  end if;

  select id into v_stage_id from public.phases where slug = 'planificacion' limit 1;
  select id into v_discipline_id from public.disciplines where slug = 'arquitectura' limit 1;
  select id into v_service_id from public.services where slug = 'anteproyecto_arquitectonico' limit 1;
  select id into v_work_type_id from public.work_types where code = 'vivienda_unifamiliar' limit 1;

  if v_stage_id is null or v_discipline_id is null or v_service_id is null or v_work_type_id is null then
    raise exception 'Could not resolve canonical IDs for lead lifecycle smoke';
  end if;

  insert into public.leads (
    provider_id,
    requester_user_id,
    requester_name,
    requester_contact,
    message,
    status,
    requested_stage_id,
    requested_discipline_id,
    requested_service_id,
    requested_work_type_id
  )
  values (
    v_provider_id,
    v_requester_user_id,
    'Smoke Taxonomy Requester',
    '18090000001',
    'SMOKE taxonomy lead lifecycle',
    'new',
    v_stage_id,
    v_discipline_id,
    v_service_id,
    v_work_type_id
  )
  returning id into v_lead_id;

  if v_lead_id is null then
    raise exception 'Failed to create taxonomy lead for lifecycle smoke';
  end if;

  if not exists (
    select 1
    from public.leads l
    where l.id = v_lead_id
      and l.requested_stage_id = v_stage_id
      and l.requested_discipline_id = v_discipline_id
      and l.requested_service_id = v_service_id
      and l.requested_work_type_id = v_work_type_id
  ) then
    raise exception 'Lead taxonomy fields did not persist';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_requester_user_id::text, true);

  perform public.send_lead_message(v_lead_id, 'SMOKE taxonomy requester message');

  if not exists (
    select 1
    from public.leads l
    where l.id = v_lead_id
      and l.last_message_preview like 'SMOKE taxonomy requester message%'
  ) then
    raise exception 'Lead message sync failed for taxonomy lead';
  end if;

  perform public.update_my_lead_state(v_lead_id, 'archived');
  if not exists (
    select 1
    from public.leads l
    where l.id = v_lead_id and l.requester_state = 'archived'
  ) then
    raise exception 'update_my_lead_state failed to archive taxonomy lead';
  end if;

  perform public.update_my_lead_state(v_lead_id, 'active');
  if not exists (
    select 1
    from public.leads l
    where l.id = v_lead_id and l.requester_state = 'active'
  ) then
    raise exception 'update_my_lead_state failed to reactivate taxonomy lead';
  end if;

  perform set_config('request.jwt.claim.sub', v_provider_owner_user_id::text, true);
  perform public.mark_my_lead_thread_read(v_lead_id);

  if not exists (
    select 1
    from public.leads l
    where l.id = v_lead_id and l.provider_last_read_at is not null
  ) then
    raise exception 'mark_my_lead_thread_read failed on taxonomy lead';
  end if;
end
$$;

-- Plan / quota / featured compatibility checks remain enforced after taxonomy rollout.
do $$
declare
  v_provider_id uuid;
  v_owner_user_id uuid;
  v_stage_id bigint;
  v_discipline_id bigint;
  v_service_id bigint;
  v_work_type_id bigint;
  v_blocked boolean := false;
begin
  select p.id, p.owner_user_id
    into v_provider_id, v_owner_user_id
  from public.providers p
  where p.owner_user_id is not null
  order by p.created_at desc
  limit 1;

  if v_provider_id is null then
    raise notice 'SKIP plan compatibility smoke: no provider with owner_user_id found';
    return;
  end if;

  select id into v_stage_id from public.phases where slug = 'construccion' limit 1;
  select id into v_discipline_id from public.disciplines where slug = 'supervision_gerencia' limit 1;
  select id into v_service_id from public.services where slug = 'supervision_de_obra' limit 1;
  select id into v_work_type_id from public.work_types where code = 'obra_exterior' limit 1;

  if v_stage_id is null or v_discipline_id is null or v_service_id is null or v_work_type_id is null then
    raise exception 'Could not resolve canonical IDs for plan compatibility smoke';
  end if;

  insert into public.provider_plans (code, name, monthly_lead_quota, featured_slots, priority_support, price_dop, price_usd)
  values ('smoke_taxonomy_zero', 'Smoke Taxonomy Zero', 0, 0, false, 0, 0)
  on conflict (code) do update
  set monthly_lead_quota = 0,
      featured_slots = 0,
      priority_support = false,
      price_dop = 0,
      price_usd = 0,
      updated_at = now();

  insert into public.provider_subscriptions (provider_user_id, plan_code, status, starts_at)
  values (v_owner_user_id, 'smoke_taxonomy_zero', 'active', now())
  on conflict (provider_user_id) do update
  set plan_code = excluded.plan_code,
      status = excluded.status,
      starts_at = excluded.starts_at,
      ends_at = null,
      updated_at = now();

  v_blocked := false;
  begin
    update public.providers
    set is_featured = true
    where id = v_provider_id;
  exception
    when others then
      v_blocked := true;
      raise notice 'Featured entitlement correctly blocked after taxonomy rollout: %', sqlerrm;
  end;

  if not v_blocked then
    raise exception 'Expected featured entitlement block did not happen';
  end if;

  v_blocked := false;
  begin
    insert into public.leads (
      provider_id,
      requester_name,
      requester_contact,
      message,
      status,
      requested_stage_id,
      requested_discipline_id,
      requested_service_id,
      requested_work_type_id
    )
    values (
      v_provider_id,
      'Smoke Quota',
      '18090000002',
      'SMOKE quota enforcement with taxonomy fields',
      'new',
      v_stage_id,
      v_discipline_id,
      v_service_id,
      v_work_type_id
    );
  exception
    when others then
      v_blocked := true;
      raise notice 'Lead quota correctly blocked taxonomy lead insert: %', sqlerrm;
  end;

  if not v_blocked then
    raise exception 'Expected lead quota block did not happen for taxonomy lead insert';
  end if;
end
$$;

rollback;
