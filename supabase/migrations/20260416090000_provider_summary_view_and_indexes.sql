-- Provider summary view for marketplace list pages (single round-trip data shape)
create or replace view public.provider_summary_view as
select
  p.id,
  p.name,
  p.trade,
  p.category_slug,
  p.phase_id,
  p.primary_discipline_id,
  p.primary_service_id,
  p.location,
  p.city,
  p.years_experience,
  p.description,
  p.rating,
  p.review_count,
  p.completed_projects,
  p.verified,
  p.is_featured,
  p.whatsapp,
  p.starting_price,
  p.portfolio_images,
  p.service_areas,
  coalesce(ps.service_ids, '{}'::bigint[]) as service_ids,
  coalesce(pw.work_type_ids, '{}'::bigint[]) as work_type_ids,
  pts.provider_verified,
  pts.identity_confirmed,
  pts.portfolio_validated,
  pts.project_registered,
  pts.rapid_response,
  pts.active_this_month,
  coalesce(pp.portfolio_project_count, 0)::int as portfolio_project_count
from public.providers p
left join (
  select
    provider_id,
    array_agg(distinct service_id order by service_id) as service_ids
  from public.provider_services
  group by provider_id
) ps on ps.provider_id = p.id
left join (
  select
    provider_id,
    array_agg(distinct work_type_id order by work_type_id) as work_type_ids
  from public.provider_work_types
  group by provider_id
) pw on pw.provider_id = p.id
left join public.provider_trust_signals pts on pts.provider_id = p.id
left join (
  select
    provider_id,
    count(*) as portfolio_project_count
  from public.portfolio_projects
  group by provider_id
) pp on pp.provider_id = p.id;

create index if not exists idx_providers_featured_verified_rating
  on public.providers (is_featured desc, verified desc, rating desc);

create index if not exists idx_provider_services_provider_id
  on public.provider_services (provider_id);

create index if not exists idx_provider_work_types_provider_id
  on public.provider_work_types (provider_id);

create index if not exists idx_provider_verifications_provider_status_expires
  on public.provider_verifications (provider_id, status, expires_at);

create index if not exists idx_provider_verifications_type_status
  on public.provider_verifications (verification_type, status);

create index if not exists idx_portfolio_projects_provider_id
  on public.portfolio_projects (provider_id);
