-- Demo seed for provider trust badges (persists changes).
-- Purpose: quickly enable visible trust badge coverage in staging/dev.
-- Safe/idempotent: uses existence checks before insert.

do $$
declare
  v_provider_ids uuid[];
  v_provider_count int;
  v_now timestamptz := now();
begin
  select array_agg(p.id order by p.created_at asc)
    into v_provider_ids
  from (
    select id, created_at
    from public.providers
    order by created_at asc
    limit 6
  ) p;

  v_provider_count := coalesce(array_length(v_provider_ids, 1), 0);

  if v_provider_count = 0 then
    raise notice 'SKIP trust demo seed: no providers found';
    return;
  end if;

  -- Provider 1: provider_verified
  if v_provider_count >= 1 then
    insert into public.provider_verifications (
      provider_id,
      verification_type,
      status,
      verified_at,
      notes
    )
    select
      v_provider_ids[1],
      'provider_verified',
      'approved',
      v_now,
      'Demo seed: proveedor verificado'
    where not exists (
      select 1
      from public.provider_verifications pv
      where pv.provider_id = v_provider_ids[1]
        and pv.verification_type = 'provider_verified'
        and pv.status = 'approved'
    );
  end if;

  -- Provider 2: identity_confirmed
  if v_provider_count >= 2 then
    insert into public.provider_verifications (
      provider_id,
      verification_type,
      status,
      verified_at,
      notes
    )
    select
      v_provider_ids[2],
      'identity_confirmed',
      'approved',
      v_now,
      'Demo seed: identidad confirmada'
    where not exists (
      select 1
      from public.provider_verifications pv
      where pv.provider_id = v_provider_ids[2]
        and pv.verification_type = 'identity_confirmed'
        and pv.status = 'approved'
    );
  end if;

  -- Provider 3: portfolio_validated
  if v_provider_count >= 3 then
    insert into public.provider_verifications (
      provider_id,
      verification_type,
      status,
      verified_at,
      notes
    )
    select
      v_provider_ids[3],
      'portfolio_validated',
      'approved',
      v_now,
      'Demo seed: portafolio validado'
    where not exists (
      select 1
      from public.provider_verifications pv
      where pv.provider_id = v_provider_ids[3]
        and pv.verification_type = 'portfolio_validated'
        and pv.status = 'approved'
    );
  end if;

  -- Provider 4: rapid_response
  if v_provider_count >= 4 then
    insert into public.provider_verifications (
      provider_id,
      verification_type,
      status,
      verified_at,
      notes
    )
    select
      v_provider_ids[4],
      'rapid_response',
      'approved',
      v_now,
      'Demo seed: respuesta rapida'
    where not exists (
      select 1
      from public.provider_verifications pv
      where pv.provider_id = v_provider_ids[4]
        and pv.verification_type = 'rapid_response'
        and pv.status = 'approved'
    );
  end if;

  -- Provider 5: project_registered (portfolio_projects evidence)
  if v_provider_count >= 5 then
    insert into public.portfolio_projects (
      provider_id,
      title,
      summary,
      status,
      completed_on,
      is_featured
    )
    select
      v_provider_ids[5],
      'DEMO - Proyecto registrado',
      'Proyecto de demostracion para insignia de confianza.',
      'completed',
      current_date,
      false
    where not exists (
      select 1
      from public.portfolio_projects pp
      where pp.provider_id = v_provider_ids[5]
        and pp.title = 'DEMO - Proyecto registrado'
    );
  end if;

  -- Provider 6: active_this_month (refresh timestamp)
  if v_provider_count >= 6 then
    update public.providers
    set updated_at = v_now
    where id = v_provider_ids[6];
  end if;

  raise notice 'Trust demo seed completed for % provider(s)', v_provider_count;
end
$$;
