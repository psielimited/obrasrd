-- Premium entitlement: only providers with featured slots can enable is_featured.

alter table public.providers
add column if not exists is_featured boolean not null default false;

create index if not exists providers_is_featured_idx on public.providers(is_featured);

create or replace function public.enforce_provider_featured_entitlement()
returns trigger
language plpgsql
as $$
declare
  v_owner_user_id uuid;
  v_featured_slots int;
begin
  if new.is_featured is not true then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.is_featured = true then
    return new;
  end if;

  v_owner_user_id := new.owner_user_id;
  if v_owner_user_id is null then
    raise exception 'No se puede destacar un proveedor sin propietario';
  end if;

  select pp.featured_slots
    into v_featured_slots
  from public.provider_subscriptions s
  join public.provider_plans pp on pp.code = s.plan_code
  where s.provider_user_id = v_owner_user_id
    and s.status in ('active', 'trialing')
    and s.starts_at <= now()
    and (s.ends_at is null or s.ends_at > now())
  order by s.updated_at desc
  limit 1;

  if v_featured_slots is null then
    select featured_slots
      into v_featured_slots
    from public.provider_plans
    where code = 'free'
    limit 1;
  end if;

  if coalesce(v_featured_slots, 0) <= 0 then
    raise exception 'Tu plan actual no incluye perfil destacado';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_provider_featured_entitlement on public.providers;
create trigger trg_enforce_provider_featured_entitlement
before insert or update of is_featured on public.providers
for each row
execute function public.enforce_provider_featured_entitlement();
