-- Smoke verification for provider monetization scaffolding.
-- Validates plan snapshot, featured entitlement, and lead quota trigger.
-- Safe by default: this script ends with ROLLBACK.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_plans'
  ) then
    raise exception 'Missing table public.provider_plans';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_subscriptions'
  ) then
    raise exception 'Missing table public.provider_subscriptions';
  end if;

  if not exists (
    select 1 from pg_proc
    where proname = 'get_my_provider_plan_snapshot'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.get_my_provider_plan_snapshot()';
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

do $$
declare
  v_owner_user_id uuid;
  v_provider_id uuid;
  v_snapshot record;
  v_blocked boolean := false;
begin
  select p.owner_user_id, p.id
    into v_owner_user_id, v_provider_id
  from public.providers p
  where p.owner_user_id is not null
  order by p.created_at desc
  limit 1;

  if v_owner_user_id is null then
    raise notice 'SKIP provider monetization smoke: no provider with owner_user_id found';
    return;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_user_id::text, true);

  select *
    into v_snapshot
  from public.get_my_provider_plan_snapshot()
  limit 1;

  if v_snapshot.plan_code is null then
    raise exception 'get_my_provider_plan_snapshot returned no row';
  end if;

  raise notice 'Plan snapshot -> code: %, quota: %, featured_slots: %',
    v_snapshot.plan_code, v_snapshot.monthly_lead_quota, v_snapshot.featured_slots;

  -- Featured entitlement check:
  -- force plan with zero featured slots and ensure setting is_featured=true is blocked.
  insert into public.provider_plans (code, name, monthly_lead_quota, featured_slots, priority_support, price_dop)
  values ('smoke_zero', 'Smoke Zero', 100, 0, false, 0)
  on conflict (code) do update
  set featured_slots = 0,
      monthly_lead_quota = 100,
      updated_at = now();

  insert into public.provider_subscriptions (provider_user_id, plan_code, status, starts_at)
  values (v_owner_user_id, 'smoke_zero', 'active', now())
  on conflict (provider_user_id) do update
  set plan_code = excluded.plan_code,
      status = excluded.status,
      starts_at = excluded.starts_at,
      ends_at = null,
      updated_at = now();

  begin
    update public.providers
    set is_featured = true
    where id = v_provider_id;
  exception
    when others then
      v_blocked := true;
      raise notice 'Featured entitlement correctly blocked: %', sqlerrm;
  end;

  if not v_blocked then
    raise exception 'Expected featured entitlement block did not happen';
  end if;

  -- Quota enforcement check:
  -- set zero monthly quota and verify new lead insert is blocked.
  update public.provider_plans
  set monthly_lead_quota = 0,
      updated_at = now()
  where code = 'smoke_zero';

  v_blocked := false;
  begin
    insert into public.leads (provider_id, message, status, requester_name, requester_contact)
    values (v_provider_id, 'SMOKE quota test', 'new', 'Smoke', '18090000000');
  exception
    when others then
      v_blocked := true;
      raise notice 'Lead quota correctly blocked insert: %', sqlerrm;
  end;

  if not v_blocked then
    raise exception 'Expected lead quota block did not happen';
  end if;
end
$$;

rollback;
