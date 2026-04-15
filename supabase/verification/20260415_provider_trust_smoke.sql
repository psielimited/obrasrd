-- Smoke verification for trust framework and separation from monetized visibility.
-- Safe by default: this script ends with ROLLBACK.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'provider_verifications'
  ) then
    raise exception 'Missing table public.provider_verifications';
  end if;

  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'portfolio_projects'
  ) then
    raise exception 'Missing table public.portfolio_projects';
  end if;

  if not exists (
    select 1 from information_schema.views
    where table_schema = 'public' and table_name = 'provider_trust_signals'
  ) then
    raise exception 'Missing view public.provider_trust_signals';
  end if;
end
$$;

do $$
declare
  v_viewdef text;
  v_provider_id uuid;
  v_signal boolean;
  v_is_featured boolean;
begin
  -- Guardrail: trust view must not depend on plan/subscription tables.
  select pg_get_viewdef('public.provider_trust_signals'::regclass, true)
    into v_viewdef;

  if v_viewdef ilike '%provider_plans%' then
    raise exception 'provider_trust_signals unexpectedly references provider_plans';
  end if;

  if v_viewdef ilike '%provider_subscriptions%' then
    raise exception 'provider_trust_signals unexpectedly references provider_subscriptions';
  end if;

  -- Verify trust evidence can be true while provider remains non-featured.
  select p.id
    into v_provider_id
  from public.providers p
  where p.is_featured = false
  order by p.created_at desc
  limit 1;

  if v_provider_id is null then
    raise notice 'SKIP trust separation check: no non-featured provider found';
    return;
  end if;

  insert into public.provider_verifications (
    provider_id,
    verification_type,
    status,
    verified_at,
    notes
  )
  values (
    v_provider_id,
    'identity_confirmed',
    'approved',
    now(),
    'Smoke test identity confirmation'
  );

  select pts.identity_confirmed, p.is_featured
    into v_signal, v_is_featured
  from public.provider_trust_signals pts
  join public.providers p on p.id = pts.provider_id
  where pts.provider_id = v_provider_id;

  if coalesce(v_signal, false) = false then
    raise exception 'Expected identity_confirmed=true in provider_trust_signals';
  end if;

  if v_is_featured then
    raise exception 'Expected provider to remain non-featured during trust verification';
  end if;

  raise notice 'Trust separation check passed for provider %', v_provider_id;
end
$$;

rollback;
