# Goal
Implement provider profile completeness indicators and expose useful quality signals across provider admin and public profile experiences, with optional ranking influence.

# In scope / out of scope
- In scope: shared completeness computation, provider dashboard/editor/public profile surfaces, search ranking tie-break integration.
- Out of scope: new backend tables, schema migrations, changing provider_summary_view schema.

# Decisions
- Upgraded completeness from a basic equal-check list to a weighted quality model in app logic (`provider-trust`) using existing schema fields only.
- Kept backward compatibility by preserving `calculateProviderProfileCompleteness` and routing it through the new quality snapshot.
- Added actionable recommendations that specifically encourage photos, service specialization, coverage, description quality, and contact readiness.
- Added completeness as a non-breaking ranking tie-breaker in Search relevance and "mas_verificados" ordering.

# Files changed
- src/lib/provider-trust.ts
- src/pages/ProviderDashboard.tsx
- src/pages/ProviderProfileEditorPage.tsx
- src/pages/ProviderProfile.tsx
- src/pages/SearchPage.tsx

# Validation results
- `npx eslint src/lib/provider-trust.ts src/pages/ProviderDashboard.tsx src/pages/ProviderProfileEditorPage.tsx src/pages/ProviderProfile.tsx src/pages/SearchPage.tsx` -> Passed with warnings only (no errors).
- `npm run build` -> Passed.
- `npm run lint` -> Fails due pre-existing repository-wide lint errors unrelated to this feature (`no-explicit-any`, `no-empty-object-type`, and existing hook-dependency warnings in multiple files).

# Known issues
- Repo-wide lint debt still blocks full `npm run lint`.

# Next steps
1. Optionally align provider card and compare table microcopy to show the same completeness tier labels.
2. Optional follow-up: add lightweight analytics events when providers resolve completeness recommendations.

---

## Update: Proyectos reales content experience (2026-04-17)

### Goal
Strengthen the public "Proyectos reales" experience with production-ready project cards and dedicated project detail pages using existing marketplace architecture and real `portfolio_projects` data.

### In scope / out of scope
- In scope: richer project cards, project detail route/page, provider linkage, schema-aware project metadata mapping, SEO metadata/JSON-LD for project detail pages, homepage projects section improvement.
- Out of scope: new database migrations, seed inserts, provider editor workflow changes, route removals.

### Decisions
- Reused existing `portfolio_projects` schema and extended front-end mapping for `stage_id`, `discipline_id`, `primary_service_id`, `primary_work_type_id`, `started_on`, `completed_on`, `budget_range`, `is_featured`, and optional cover media URL.
- Added read APIs/hooks for featured portfolio projects and project-by-id detail retrieval.
- Upgraded `PortfolioProjectCard` to be trust-first and conversion-friendly: photo, status/stage/category chips, responsible provider, direct links to detail and provider profile.
- Added dynamic project detail route (`/proyectos/reales/:projectId`) with structured metadata (title/description/OpenGraph/canonical + JSON-LD) for SEO.
- Improved home "Proyectos reales" section to use real project records instead of provider-image proxies.

### Files changed
- src/data/marketplace.ts
- src/lib/marketplace-api.ts
- src/hooks/use-marketplace-data.ts
- src/components/marketplace/PortfolioProjectCard.tsx
- src/pages/ProviderProfile.tsx
- src/pages/Index.tsx
- src/pages/PortfolioProjectDetailPage.tsx
- src/App.tsx
- src/lib/public-ia.ts

### Validation results
- `npm run build` -> Passed.
- `npm run lint` -> Fails due existing repository-wide lint debt (same baseline issues: `no-explicit-any`, `no-empty-object-type`, and pre-existing hook dependency warnings in unrelated files).
- Targeted eslint on touched files also surfaces pre-existing `no-explicit-any` debt in `src/lib/marketplace-api.ts`.

### Known issues
- Full repo lint still blocked by existing lint debt not introduced by this change.
- `cover_media_asset` URL relies on readable media metadata; card/detail falls back to provider portfolio images if not available.

### Next steps
1. Optional: add a dedicated `/proyectos/reales` listing page with filters (etapa/ubicacion/tipo) for broader SEO coverage.
2. Optional: add analytics events for project detail view and provider click-through from project cards.
