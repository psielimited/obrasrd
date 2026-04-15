# ObrasRD Legacy Taxonomy Mapping

## Purpose
Define a migration-safe compatibility layer that maps current legacy category logic into the canonical taxonomy:

`etapa -> disciplina -> servicio -> (tipo de obra opcional)`

This layer is additive and keeps current marketplace flows operational while backfill is gradual.

## Current Legacy Category Usage (Inspected)

Schema usage:
- `public.categories` (`phase_id`, `slug`, `name`) in `supabase/migrations/20260315182000_marketplace_core.sql`
- `public.providers.category_slug` + `public.providers.phase_id` in `supabase/migrations/20260315182000_marketplace_core.sql`

Provider forms:
- Provider profile editor still writes `phaseId` + `categorySlug`:
  - `src/pages/ProviderProfileEditorPage.tsx`
  - `src/lib/profile-api.ts`

Filters + search:
- Query param `?categoria=` drives filtering:
  - `src/pages/SearchPage.tsx`
  - `src/components/HeroSearch.tsx`
  - `src/components/PopularCategories.tsx`
  - `src/pages/PhasePage.tsx`

Listing cards:
- Category slug used for theming and chip labels:
  - `src/components/ProviderCard.tsx`
  - `src/lib/category-theme.ts`

Profile pages:
- Category label resolved from legacy phase/categories tree:
  - `src/pages/ProviderProfile.tsx`
- Dashboard category display from legacy phase/category:
  - `src/pages/ProviderDashboard.tsx`

API mapping layer:
- Providers still read/write `category_slug` and `phase_id`:
  - `src/lib/marketplace-api.ts`
  - `src/lib/profile-api.ts`

## Compatibility Layer Implemented

### Database migration
- `supabase/migrations/20260415130000_legacy_taxonomy_compatibility_layer.sql`

What it adds:
1. Extends `legacy_category_mappings` with compatibility metadata:
- `work_type_id` (optional)
- `is_ambiguous` (boolean)
- `ambiguity_reason` (text)

2. Seeds broad legacy->canonical mappings for existing categories.

3. Performs deterministic one-time backfill for non-ambiguous categories:
- `providers.primary_discipline_id`
- `providers.primary_service_id`
- `provider_services`
- `provider_work_types` (when `work_type_id` is available)

4. Adds reporting views:
- `public.legacy_category_mapping_report`
- `public.legacy_category_mapping_summary`

### Frontend compatibility helpers
- `src/lib/legacy-taxonomy-compat.ts`

Provides:
- `getLegacyCategoryTaxonomyMapping`
- `getLegacyCategoryMappingStatus`
- `getLegacyTaxonomySearchTerms`
- `getLegacyCategoryDisplayFallback`

Integrated in frontend:
- `src/pages/SearchPage.tsx`
  - Legacy providers now match searches by canonical stage/discipline/service terms derived from category mapping.
  - `?categoria=` supports legacy category slug and canonical slugs (stage/discipline/service).
- `src/pages/ProviderProfile.tsx`
  - If legacy category name is not resolvable from phase tree, profile falls back to mapped canonical service/discipline labels.

## Mapping Status Report

Total legacy categories in seed taxonomy: 40

### Fully mapped (9)
- `arquitectos`
- `ingenieros-estructurales`
- `agrimensores`
- `ingenieros-civiles`
- `contratistas-techos`
- `electricistas`
- `paneles-solares`
- `gabinetes`
- `disenadores-interiores`

### Ambiguous (26)
- `ingenieros-mep`
- `excavacion`
- `limpieza-terrenos`
- `movimiento-tierra`
- `concreto`
- `cimentacion`
- `servicios-publicos`
- `contratistas-generales`
- `carpinteros-estructura`
- `aislamiento`
- `acabados-exteriores`
- `stucco`
- `albaniles`
- `plomeros`
- `hvac`
- `redes-cableado`
- `pintores`
- `instaladores-pisos`
- `carpinteria-interior`
- `drywall`
- `vidrieros`
- `pavimentacion`
- `portones`
- `limpieza`
- `inspectores`

Note: Ambiguous categories are intentionally preserved with proxy mapping + `is_ambiguous=true` to avoid breaking current UX while signaling taxonomy debt for refinement.

### Unmapped (5)
- `consultores-ambientales`
- `abogados-inmobiliarios`
- `gestores-permisos`
- `agentes-inmobiliarios`
- `paisajismo`

These require additional canonical services (or an expanded canonical discipline/service set) for high-confidence mapping.

## Backfill Behavior

Backfill is conservative:
- Only categories with `is_ambiguous=false` are used to set provider canonical fields and join rows.
- Ambiguous categories remain functional via legacy `category_slug` and mapping helpers but are not force-backfilled as canonical primary taxonomy.

## Safety Guarantees
- Additive-only changes.
- No deletion of old fields.
- No changes to existing lead messaging lifecycle.
- No changes to provider plan/featured/quota enforcement.
- Existing IDs and legacy relationships remain intact.

## Recommended Next Iteration
1. Add canonical services for currently unmapped legal/environmental/commercial-intake categories.
2. Reclassify selected ambiguous categories into fully mapped once service coverage exists.
3. Gradually shift UI filters from legacy category slug to canonical stage/discipline/service URLs while keeping dual-mode support.
