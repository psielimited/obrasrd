-- Provider trust framework: additive trust signals separated from monetization.
-- This migration does NOT modify provider_plans/provider_subscriptions/providers.is_featured enforcement.

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'provider_verifications_type_check'
      and conrelid = 'public.provider_verifications'::regclass
  ) then
    alter table public.provider_verifications
      drop constraint provider_verifications_type_check;
  end if;
end $$;

alter table public.provider_verifications
  add constraint provider_verifications_type_check
  check (
    verification_type in (
      'identity',
      'license',
      'insurance',
      'background',
      'portfolio',
      'trade_certification',
      'site_visit',
      'phone',
      'email',
      'business_registration',
      'provider_verified',
      'identity_confirmed',
      'portfolio_validated',
      'rapid_response'
    )
  );

create or replace view public.provider_trust_signals as
with approved_verifications as (
  select
    pv.provider_id,
    pv.verification_type
  from public.provider_verifications pv
  where pv.status = 'approved'
    and (pv.expires_at is null or pv.expires_at > now())
),
verification_rollup as (
  select
    provider_id,
    bool_or(verification_type in ('provider_verified')) as has_provider_verified_record,
    bool_or(verification_type in ('identity', 'phone', 'email', 'business_registration', 'identity_confirmed')) as has_identity_record,
    bool_or(verification_type in ('portfolio', 'portfolio_validated')) as has_portfolio_record,
    bool_or(verification_type in ('rapid_response')) as has_rapid_response_record
  from approved_verifications
  group by provider_id
),
project_rollup as (
  select
    pp.provider_id,
    count(*)::int as project_count
  from public.portfolio_projects pp
  group by pp.provider_id
)
select
  p.id as provider_id,
  (p.verified or coalesce(vr.has_provider_verified_record, false)) as provider_verified,
  coalesce(vr.has_identity_record, false) as identity_confirmed,
  coalesce(vr.has_portfolio_record, false) as portfolio_validated,
  coalesce(pr.project_count, 0) > 0 as project_registered,
  coalesce(vr.has_rapid_response_record, false) as rapid_response,
  p.updated_at >= date_trunc('month', now()) as active_this_month
from public.providers p
left join verification_rollup vr on vr.provider_id = p.id
left join project_rollup pr on pr.provider_id = p.id;

grant select on public.provider_trust_signals to anon, authenticated;
