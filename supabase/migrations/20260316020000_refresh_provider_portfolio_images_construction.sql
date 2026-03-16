-- Refresh seeded provider portfolio images with construction-specific visuals.
-- This migration intentionally updates the default seeded provider IDs.

update public.providers
set portfolio_images = case id
  when '00000000-0000-0000-0000-000000000001'::uuid then array[
    'https://source.unsplash.com/1200x800/?architecture,blueprint,house&sig=101',
    'https://source.unsplash.com/1200x800/?architect,construction,site&sig=102',
    'https://source.unsplash.com/1200x800/?residential,construction,facade&sig=103'
  ]::text[]
  when '00000000-0000-0000-0000-000000000002'::uuid then array[
    'https://source.unsplash.com/1200x800/?structural,engineering,construction&sig=201',
    'https://source.unsplash.com/1200x800/?steel,beam,construction&sig=202',
    'https://source.unsplash.com/1200x800/?concrete,structure,site&sig=203'
  ]::text[]
  when '00000000-0000-0000-0000-000000000003'::uuid then array[
    'https://source.unsplash.com/1200x800/?construction,workers,building&sig=301',
    'https://source.unsplash.com/1200x800/?house,construction,progress&sig=302',
    'https://source.unsplash.com/1200x800/?contractor,site,work&sig=303'
  ]::text[]
  when '00000000-0000-0000-0000-000000000004'::uuid then array[
    'https://source.unsplash.com/1200x800/?electrician,panel,wiring&sig=401',
    'https://source.unsplash.com/1200x800/?electrical,installation,construction&sig=402',
    'https://source.unsplash.com/1200x800/?power,tools,electrician&sig=403'
  ]::text[]
  when '00000000-0000-0000-0000-000000000005'::uuid then array[
    'https://source.unsplash.com/1200x800/?plumber,pipes,construction&sig=501',
    'https://source.unsplash.com/1200x800/?plumbing,installation,bathroom&sig=502',
    'https://source.unsplash.com/1200x800/?water,pipes,repair&sig=503'
  ]::text[]
  when '00000000-0000-0000-0000-000000000006'::uuid then array[
    'https://source.unsplash.com/1200x800/?painting,interior,wall&sig=601',
    'https://source.unsplash.com/1200x800/?painter,roller,renovation&sig=602',
    'https://source.unsplash.com/1200x800/?paint,construction,finish&sig=603'
  ]::text[]
  when '00000000-0000-0000-0000-000000000007'::uuid then array[
    'https://source.unsplash.com/1200x800/?excavator,earthwork,construction&sig=701',
    'https://source.unsplash.com/1200x800/?foundation,excavation,site&sig=702',
    'https://source.unsplash.com/1200x800/?heavy-machinery,construction,ground&sig=703'
  ]::text[]
  when '00000000-0000-0000-0000-000000000008'::uuid then array[
    'https://source.unsplash.com/1200x800/?solar,panels,roof&sig=801',
    'https://source.unsplash.com/1200x800/?photovoltaic,energy,installation&sig=802',
    'https://source.unsplash.com/1200x800/?solar-farm,technician,construction&sig=803'
  ]::text[]
  else portfolio_images
end
where id in (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000005'::uuid,
  '00000000-0000-0000-0000-000000000006'::uuid,
  '00000000-0000-0000-0000-000000000007'::uuid,
  '00000000-0000-0000-0000-000000000008'::uuid
);
