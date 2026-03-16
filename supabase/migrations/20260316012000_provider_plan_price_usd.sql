-- Provider monetization pricing currency support (USD for public pricing pages).
alter table public.provider_plans
add column if not exists price_usd numeric not null default 0;

alter table public.provider_plans
drop constraint if exists provider_plans_price_usd_check;

alter table public.provider_plans
add constraint provider_plans_price_usd_check check (price_usd >= 0);

update public.provider_plans
set price_usd = case code
  when 'free' then 0
  when 'pro' then 49
  when 'elite' then 119
  else price_usd
end
where code in ('free', 'pro', 'elite');
