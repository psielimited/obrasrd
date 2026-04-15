# ObrasRD Canonical Taxonomy Reference

## Purpose
This document defines the canonical Dominican construction taxonomy implemented in the repository as:

`project stage -> technical discipline -> specific service`

It is additive and coexists with legacy category logic.

## Source of Truth

Database migrations:
- `supabase/migrations/20260415103000_taxonomy_extension.sql`
- `supabase/migrations/20260415113000_canonical_taxonomy_seed.sql`

Frontend typed helpers:
- `src/lib/taxonomy.ts`

## Canonical Stages

- `planificacion` -> `Planificacion`
- `construccion` -> `Construccion`
- `mantenimiento` -> `Mantenimiento`

## Canonical Disciplines

- `arquitectura`
- `ingenieria_civil`
- `ingenieria_electrica`
- `ingenieria_sanitaria`
- `topografia`
- `supervision_gerencia`
- `construccion_ejecucion`
- `diseno_interior`
- `paisajismo`
- `instalaciones_especiales`
- `seguridad_salud`

Each discipline is bound to exactly one stage via `disciplines.stage_id`.

## Canonical Services (seeded examples)

- `anteproyecto_arquitectonico`
- `planos_constructivos`
- `calculo_estructural`
- `levantamiento_topografico`
- `instalacion_electrica`
- `diseno_hidrosanitario`
- `supervision_de_obra`
- `impermeabilizacion`
- `remodelacion_de_cocina`
- `diagnostico_de_filtraciones`
- `mantenimiento_preventivo`

Each service is bound to exactly one stage and one discipline via:
- `services.stage_id`
- `services.discipline_id`
- FK consistency constraint `(discipline_id, stage_id) -> disciplines(id, stage_id)`

## Canonical Work Types

- `vivienda_unifamiliar`
- `edificio_multifamiliar`
- `local_comercial`
- `oficina`
- `nave_industrial`
- `remodelacion_interior`
- `obra_exterior`
- `mantenimiento_general`

## New Schema Layer

Taxonomy core:
- `disciplines`
- `services`
- `work_types`
- `project_stages` view (compatibility view over `phases`)

Provider capability layer:
- `provider_services` (many-to-many provider <-> service)
- `provider_work_types` (many-to-many provider <-> work type)

Trust and portfolio layer:
- `provider_verifications`
- `portfolio_projects`

Legacy bridge:
- `legacy_category_mappings` (maps `categories.slug` to canonical discipline/service)

## Existing Tables Extended (additive)

- `providers`
  - `primary_discipline_id`
  - `primary_service_id`

- `leads`
  - `requested_stage_id`
  - `requested_discipline_id`
  - `requested_service_id`
  - `requested_work_type_id`

- `service_posts`
  - `requested_stage_id`
  - `requested_discipline_id`
  - `requested_service_id`
  - `requested_work_type_id`

## Legacy Compatibility

Legacy category support remains active:
- Existing `phases`, `categories`, `providers.category_slug`, and `providers.phase_id` are untouched.
- Existing lead and messaging lifecycle is untouched.
- Existing plan/quota/featured enforcement is untouched.

Forward mapping path:
- Use `legacy_category_mappings` to resolve legacy category filters into canonical discipline/service nodes.

## Frontend Typed Utilities

`src/lib/taxonomy.ts` includes:
- Canonical slug unions for stages, disciplines, services, and work types
- Spanish labels and descriptions
- Grouping and traversal helpers:
  - `listDisciplinesByStage`
  - `listServicesByStage`
  - `listServicesByDiscipline`
  - `listServicesByStageAndDiscipline`
  - `buildTaxonomyHierarchy`
- SEO-style hierarchy path helpers:
  - `getSeoStagePath`
  - `getSeoDisciplinePath`
  - `getSeoServicePath`

## Notes for Next Integration Steps

1. Keep reads dual-mode (legacy + canonical) until all UI filtering is migrated.
2. Seed additional services and legacy mappings iteratively by market demand.
3. Regenerate Supabase TS types after applying migrations to expose new fields/tables in `src/integrations/supabase/types.ts`.
