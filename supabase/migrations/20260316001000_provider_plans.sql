-- Provider monetization scaffolding: plans, subscriptions, usage snapshot, and quota enforcement.

create table if not exists public.provider_plans (
  code text primary key,
  name text not null,
  monthly_lead_quota int,
  featured_slots int not null default 0,
  priority_support boolean not null default false,
  price_dop numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_plans_monthly_lead_quota_check check (monthly_lead_quota is null or monthly_lead_quota >= 0),
  constraint provider_plans_featured_slots_check check (featured_slots >= 0),
  constraint provider_plans_price_dop_check check (price_dop >= 0)
);

create table if not exists public.provider_subscriptions (
  id bigint generated always as identity primary key,
  provider_user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.provider_plans(code),
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_user_id),
  constraint provider_subscriptions_status_check check (status in ('active', 'trialing', 'past_due', 'cancelled'))
);

create index if not exists provider_subscriptions_user_idx
  on public.provider_subscriptions(provider_user_id);

create trigger trg_provider_plans_updated_at
before update on public.provider_plans
for each row
execute function public.set_updated_at();

create trigger trg_provider_subscriptions_updated_at
before update on public.provider_subscriptions
for each row
execute function public.set_updated_at();

alter table public.provider_plans enable row level security;
alter table public.provider_subscriptions enable row level security;

drop policy if exists "Public can read provider plans" on public.provider_plans;
create policy "Public can read provider plans"
on public.provider_plans
for select
to anon, authenticated
using (true);

drop policy if exists "Users can read own provider subscription" on public.provider_subscriptions;
create policy "Users can read own provider subscription"
on public.provider_subscriptions
for select
to authenticated
using (auth.uid() = provider_user_id);

insert into public.provider_plans (code, name, monthly_lead_quota, featured_slots, priority_support, price_dop)
values
  ('free', 'Gratis', 25, 0, false, 0),
  ('pro', 'Pro', 200, 3, false, 2490),
  ('elite', 'Elite', null, 10, true, 5990)
on conflict (code) do update
set
  name = excluded.name,
  monthly_lead_quota = excluded.monthly_lead_quota,
  featured_slots = excluded.featured_slots,
  priority_support = excluded.priority_support,
  price_dop = excluded.price_dop,
  updated_at = now();

insert into public.provider_subscriptions (provider_user_id, plan_code, status, starts_at)
select distinct p.owner_user_id, 'free', 'active', now()
from public.providers p
where p.owner_user_id is not null
  and not exists (
    select 1
    from public.provider_subscriptions s
    where s.provider_user_id = p.owner_user_id
  );

create or replace function public.get_my_provider_plan_snapshot()
returns table (
  plan_code text,
  plan_name text,
  status text,
  monthly_lead_quota int,
  leads_used_this_month int,
  leads_remaining_this_month int,
  is_quota_unlimited boolean,
  period_start timestamptz,
  period_end timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_plan_code text;
  v_plan_name text;
  v_status text;
  v_quota int;
  v_used int;
  v_period_start timestamptz := date_trunc('month', now());
  v_period_end timestamptz := date_trunc('month', now()) + interval '1 month';
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select s.plan_code, pp.name, s.status, pp.monthly_lead_quota
    into v_plan_code, v_plan_name, v_status, v_quota
  from public.provider_subscriptions s
  join public.provider_plans pp on pp.code = s.plan_code
  where s.provider_user_id = v_user_id
    and s.status in ('active', 'trialing')
    and s.starts_at <= now()
    and (s.ends_at is null or s.ends_at > now())
  order by s.updated_at desc
  limit 1;

  if v_plan_code is null then
    select pp.code, pp.name, 'active', pp.monthly_lead_quota
      into v_plan_code, v_plan_name, v_status, v_quota
    from public.provider_plans pp
    where pp.code = 'free'
    limit 1;
  end if;

  select count(*)
    into v_used
  from public.leads l
  join public.providers p on p.id = l.provider_id
  where p.owner_user_id = v_user_id
    and l.created_at >= v_period_start
    and l.created_at < v_period_end;

  return query
  select
    v_plan_code,
    v_plan_name,
    v_status,
    v_quota,
    v_used,
    case when v_quota is null then null else greatest(v_quota - v_used, 0) end,
    v_quota is null,
    v_period_start,
    v_period_end;
end;
$$;

create or replace function public.enforce_provider_lead_quota()
returns trigger
language plpgsql
as $$
declare
  v_owner_user_id uuid;
  v_quota int;
  v_used int;
  v_period_start timestamptz := date_trunc('month', now());
  v_period_end timestamptz := date_trunc('month', now()) + interval '1 month';
begin
  select owner_user_id
    into v_owner_user_id
  from public.providers
  where id = new.provider_id;

  if v_owner_user_id is null then
    return new;
  end if;

  select pp.monthly_lead_quota
    into v_quota
  from public.provider_subscriptions s
  join public.provider_plans pp on pp.code = s.plan_code
  where s.provider_user_id = v_owner_user_id
    and s.status in ('active', 'trialing')
    and s.starts_at <= now()
    and (s.ends_at is null or s.ends_at > now())
  order by s.updated_at desc
  limit 1;

  if v_quota is null then
    select monthly_lead_quota into v_quota
    from public.provider_plans
    where code = 'free'
    limit 1;
  end if;

  if v_quota is null then
    return new;
  end if;

  select count(*)
    into v_used
  from public.leads l
  where l.provider_id = new.provider_id
    and l.created_at >= v_period_start
    and l.created_at < v_period_end;

  if v_used >= v_quota then
    raise exception 'Este proveedor alcanzo su limite mensual de solicitudes. Intenta con otro proveedor.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_provider_lead_quota on public.leads;
create trigger trg_enforce_provider_lead_quota
before insert on public.leads
for each row
execute function public.enforce_provider_lead_quota();

revoke all on function public.get_my_provider_plan_snapshot() from public, anon;
grant execute on function public.get_my_provider_plan_snapshot() to authenticated;
