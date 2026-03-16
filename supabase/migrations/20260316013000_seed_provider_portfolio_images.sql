-- Seed sample portfolio images for default marketplace providers.
-- Safe behavior: only fills providers that currently have no portfolio images.

update public.providers
set portfolio_images = case id
  when '00000000-0000-0000-0000-000000000001'::uuid then array[
    'https://picsum.photos/seed/obrasrd-arq-1/1200/800',
    'https://picsum.photos/seed/obrasrd-arq-2/1200/800',
    'https://picsum.photos/seed/obrasrd-arq-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000002'::uuid then array[
    'https://picsum.photos/seed/obrasrd-ing-1/1200/800',
    'https://picsum.photos/seed/obrasrd-ing-2/1200/800',
    'https://picsum.photos/seed/obrasrd-ing-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000003'::uuid then array[
    'https://picsum.photos/seed/obrasrd-const-1/1200/800',
    'https://picsum.photos/seed/obrasrd-const-2/1200/800',
    'https://picsum.photos/seed/obrasrd-const-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000004'::uuid then array[
    'https://picsum.photos/seed/obrasrd-elec-1/1200/800',
    'https://picsum.photos/seed/obrasrd-elec-2/1200/800',
    'https://picsum.photos/seed/obrasrd-elec-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000005'::uuid then array[
    'https://picsum.photos/seed/obrasrd-plom-1/1200/800',
    'https://picsum.photos/seed/obrasrd-plom-2/1200/800',
    'https://picsum.photos/seed/obrasrd-plom-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000006'::uuid then array[
    'https://picsum.photos/seed/obrasrd-pint-1/1200/800',
    'https://picsum.photos/seed/obrasrd-pint-2/1200/800',
    'https://picsum.photos/seed/obrasrd-pint-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000007'::uuid then array[
    'https://picsum.photos/seed/obrasrd-exca-1/1200/800',
    'https://picsum.photos/seed/obrasrd-exca-2/1200/800',
    'https://picsum.photos/seed/obrasrd-exca-3/1200/800'
  ]::text[]
  when '00000000-0000-0000-0000-000000000008'::uuid then array[
    'https://picsum.photos/seed/obrasrd-solar-1/1200/800',
    'https://picsum.photos/seed/obrasrd-solar-2/1200/800',
    'https://picsum.photos/seed/obrasrd-solar-3/1200/800'
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
)
and coalesce(cardinality(portfolio_images), 0) = 0;
