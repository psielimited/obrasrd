# ObrasRD Work Type First-Class Wiring

## Canonical Work Types
- `vivienda_unifamiliar`
- `edificio_multifamiliar`
- `local_comercial`
- `oficina`
- `nave_industrial`
- `remodelacion_interior`
- `obra_exterior`
- `mantenimiento_general`

## Where Work Type Is Wired

### Schema
- Existing taxonomy tables already include:
  - `work_types`
  - `provider_work_types`
  - `leads.requested_work_type_id`
  - `service_posts.requested_work_type_id`
- Added project-level support:
  - Migration: `supabase/migrations/20260415193000_projects_work_type_support.sql`
  - New nullable column: `projects.work_type_id`
  - Index: `projects_work_type_id_idx`

### Provider Forms
- Provider editor supports multi-select work types:
  - `src/pages/ProviderProfileEditorPage.tsx`
  - persisted through `provider_work_types` in `src/lib/profile-api.ts`

### Project/Request Forms
- Intake flow (`/proyectos`) captures work type and sends it to leads:
  - `requested_work_type_id` via `createLead(...)`
  - file: `src/pages/ProjectBuilder.tsx`
- Publish flow (`/publicar`) captures optional work type:
  - `requested_work_type_id` on `service_posts`
  - file: `src/pages/PublishService.tsx`

### Filters
- Marketplace search exposes `tipo_obra` filter:
  - `src/components/search/MarketplaceFilters.tsx`
  - `src/pages/SearchPage.tsx`
  - `src/lib/search/search-filter-state.ts`

### Profile Pages and Cards
- Provider profile shows work type tags in "Capacidades tecnicas":
  - `src/pages/ProviderProfile.tsx`
- Provider cards now surface a work type badge when available:
  - `src/components/ProviderCard.tsx`
  - `src/components/marketplace/ProofFirstCard.tsx`
- Provider project cards now surface project work type when available:
  - `src/components/marketplace/PortfolioProjectCard.tsx`
  - data loaded from `src/lib/marketplace-api.ts`

### Matching
- Deterministic matching includes `workTypeMatch` signal:
  - `src/lib/provider-matching.ts`
- Intake passes selected work type into matching request:
  - `src/pages/ProjectBuilder.tsx`

## Compatibility Fallbacks (Missing Work Type)

To preserve behavior for legacy providers without `provider_work_types` rows:
- Search/filter layer already maps legacy category -> canonical work type using `legacy_category_mappings`.
- Deterministic matching now also falls back to legacy mapping:
  - if provider has no explicit `workTypeIds`, matcher checks mapped `workTypeSlug` from `category_slug`.
- UI display fallback:
  - provider cards/profile can show legacy mapped work type label when explicit work types are missing.

Result:
- old rows remain eligible for filtering/matching,
- new rows use explicit first-class work type relations.

## Matching and Filtering Impact Summary
- Filtering:
  - `tipo_obra` narrows provider results.
  - providers match by explicit work types or legacy mapped fallback.
- Matching:
  - `workTypeMatch` contributes deterministic score.
  - improves ordering for providers specialized in requested work scope.
