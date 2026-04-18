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

---

## Update: Knowledge lifecycle refactor (2026-04-17)

### Goal
Refactor the knowledge/content area so technical content is organized by lifecycle stages: Planificacion, Construccion, Mantenimiento.

### In scope / out of scope
- In scope: lifecycle-first archive structure, stage/resource filters, label/navigation updates for content area, detail template updates, Dominican context copy updates.
- Out of scope: backend schema changes, new CMS/content tables, route removals.

### Decisions
- Reused existing journey content model and expanded it with resource metadata (`articulo_tecnico`, `guia_practica`, `conocimiento_practico`) and `dominicanContextNote`.
- Implemented lifecycle archive grouping helpers in shared content logic (`customer-journeys`) so stage taxonomy is canonical and reusable.
- Converted knowledge archive page to stage-first organization with query-driven filters:
  - `?etapa=planificacion|construccion|mantenimiento`
  - `?recurso=articulo_tecnico|guia_practica|conocimiento_practico`
- Updated detail template to surface stage + resource type + explicit Dominican context note per resource.
- Kept knowledge as complementary in homepage copy to avoid competing with primary marketplace actions.
- Updated public nav wording to "Conocimiento tecnico" and mobile bottom nav label to "Etapas" for lifecycle clarity.

### Files changed
- src/lib/customer-journeys.ts
- src/pages/JourneyGuidesPage.tsx
- src/pages/JourneyGuidePage.tsx
- src/components/journeys/JourneyTemplate.tsx
- src/lib/public-ia.ts
- src/components/BottomNav.tsx
- src/pages/Index.tsx

### Validation results
- `npm run build` -> Passed.
- `npx eslint src/lib/customer-journeys.ts src/pages/JourneyGuidesPage.tsx src/pages/JourneyGuidePage.tsx src/components/journeys/JourneyTemplate.tsx src/lib/public-ia.ts src/pages/Index.tsx src/components/BottomNav.tsx` -> Passed.

### Known issues
- None introduced in this scope.

### Next steps
1. Optional: add static landing pages per lifecycle stage (`/conocimiento/planificacion`, etc.) for deeper SEO indexing.
2. Optional: instrument analytics for knowledge filter usage (`etapa`/`recurso`) and click-through to directory/intake.

---

## Update: Content-to-directory actions on articles/projects (2026-04-17)

### Goal
Improve article and project pages so they guide users into relevant next actions (providers/categories/directory transitions) with contextual CTAs and analytics instrumentation.

### In scope / out of scope
- In scope: topic-aware related actions on guide/project detail pages, related provider blocks, contextual directory links, click analytics for content-to-directory transitions.
- Out of scope: backend schema changes, search ranking changes, CMS authoring changes.

### Decisions
- Added a dedicated analytics event `content_to_directory_click` with structured taxonomy IDs and CTA type.
- Added a shared helper to build directory URLs from content context (`buildDirectoryTopicHref`).
- Extended guide detail template to show:
  - related providers,
  - contextual topic actions (ver empresas relacionadas / buscar este servicio / ver categoria relacionada),
  - tracked clicks for directory/provider transitions.
- Extended project detail page to show:
  - contextual action buttons linked to stage/service/category/location,
  - related providers scored from project taxonomy signals,
  - tracked clicks for all content-to-directory/provider transitions.

### Files changed
- src/lib/analytics/events.ts
- src/lib/content-directory-links.ts
- src/components/journeys/JourneyTemplate.tsx
- src/pages/JourneyGuidePage.tsx
- src/pages/PortfolioProjectDetailPage.tsx

### Validation results
- `npm run build` -> Passed.
- `npx eslint src/lib/analytics/events.ts src/lib/content-directory-links.ts src/pages/JourneyGuidePage.tsx src/components/journeys/JourneyTemplate.tsx src/pages/PortfolioProjectDetailPage.tsx` -> Passed.

### Known issues
- None introduced in this scope.

### Next steps
1. Optional: add a dashboard report for `content_to_directory_click` CTA performance by `source` and `cta_type`.
2. Optional: A/B test CTA copy per stage to improve click-through to directory/provider pages.

---

## Update: Provider onboarding by provider type (2026-04-17)

### Goal
Refactor provider signup so onboarding adapts to provider type (`empresa`, `profesional independiente`, `suplidor`, `servicio tecnico`) with progressive steps, minimal early data, and post-signup completeness guidance.

### In scope / out of scope
- In scope: auth/signup UX for provider types, progressive multi-step provider onboarding, improved Spanish labels/helper copy, carry-forward onboarding draft into provider profile editor, post-signup profile completeness guidance.
- Out of scope: database schema changes/migrations, route changes, replacing existing provider profile save logic.

### Decisions
- Kept existing auth and provider data flows; no schema migration was introduced.
- Added a dedicated shared onboarding module (`provider-onboarding`) for provider type definitions plus local draft persistence (`localStorage`) to bridge signup -> profile editor.
- Implemented progressive signup in `AuthPage`:
  - Step 1: account intent + provider type selection.
  - Step 2: minimum account credentials.
  - Step 3 (providers only): minimum provider basics (especialidad + ciudad; WhatsApp optional).
- Kept provider profile persistence in existing editor flow (`upsertMyProviderProfile`) and added onboarding prefill + targeted completion guidance when entering from signup (`?onboarding=1`).
- Best-effort role bootstrap on signup (`upsertMyProfile` role `provider`) while preserving current Supabase auth behavior.

### Files changed
- src/lib/provider-onboarding.ts
- src/pages/AuthPage.tsx
- src/pages/ProviderProfileEditorPage.tsx

### Validation results
- `npm run build` -> Passed.
- `npm run lint` -> Failed due environment file lookup issue in repo (`ENOENT` reading generated `vite.config.ts.timestamp-*.mjs`), unrelated to the onboarding code paths.

### Known issues
- Signup role promotion to provider is best-effort if profile upsert cannot run immediately (for example, edge auth timing), but onboarding draft and provider-profile prefill still work.

### Next steps
1. Optional: add explicit analytics events for onboarding step progression and completion drop-off by `provider_type`.
2. Optional: persist provider type in first-class backend schema once `provider_type` is available in provider/user profile tables.

---

## Update: Public + provider acquisition funnel analytics instrumentation (2026-04-17)

### Goal
Add production-ready analytics instrumentation across the ObrasRD public and provider acquisition funnel while reusing existing analytics utilities and event conventions.

### In scope / out of scope
- In scope: add/extend event catalog and wire interactions for homepage search intent, category shortcut click, register-company CTA click, onboarding started/completed, no-results search, and existing content-to-directory coverage confirmation.
- Out of scope: adding new analytics SDK dependencies, backend analytics pipeline changes.

### Decisions
- Reused existing `trackObrasRdEvent` and `OBRASRD_ANALYTICS_EVENTS` (no new analytics dependency).
- Extended the event catalog with typed payloads for:
  - `homepage_search_submitted`
  - `homepage_category_shortcut_clicked`
  - `register_company_cta_clicked`
  - `onboarding_started`
  - `onboarding_completed`
  - `no_results_search`
- Preserved existing events already covering funnel requirements:
  - `provider_viewed`
  - `provider_contacted` (WhatsApp/contact intent)
  - `content_to_directory_click`
- Added an in-code naming convention comment to keep event naming consistent and discoverable.

### Files changed
- src/lib/analytics/events.ts
- src/pages/Index.tsx
- src/components/TopNav.tsx
- src/components/home/IntentEntryCard.tsx
- src/pages/SearchPage.tsx
- src/pages/AuthPage.tsx
- src/pages/ProviderProfileEditorPage.tsx

### Validation results
- `npm run build` -> Passed.
- `npx eslint src/lib/analytics/events.ts src/pages/Index.tsx src/components/TopNav.tsx src/components/home/IntentEntryCard.tsx src/pages/SearchPage.tsx src/pages/AuthPage.tsx src/pages/ProviderProfileEditorPage.tsx` -> Passed with pre-existing warnings only (`react-hooks/exhaustive-deps`), no errors.

### Known issues
- Existing repository warnings around hook dependency arrays remain unchanged from baseline in `SearchPage` and `ProviderProfileEditorPage`.

### Next steps
1. Optional: add a lightweight analytics QA checklist page (DEV only) that simulates and verifies each funnel event payload.
2. Optional: add funnel conversion dashboards grouped by `source` and `provider_type`.

---

## Update: Provider acquisition conversion surfaces refresh (2026-04-17)

### Goal
Improve public provider-facing conversion surfaces so the value of joining ObrasRD is explicit, operational, and specific to the Dominican construction market.

### In scope / out of scope
- In scope: public `Registrar empresa` surfaces in home and `/empresas` page copy/layout, value proposition clarity, reduction of generic marketing language.
- Out of scope: backend/schema changes, onboarding/auth flow changes, dashboard behavior changes.

### Decisions
- Reframed hero + CTA copy in home to emphasize practical provider outcomes:
  - visibility by category/stage/location,
  - lead capture with context and WhatsApp,
  - project showcase value,
  - trust-signal impact.
- Added concise operational value blocks in home (instead of generic claims).
- Refactored `/empresas` intro into:
  - explicit “why join” benefit grid,
  - “how this becomes work” 4-step operational flow,
  - stronger form helper copy (title/description/WhatsApp) for better lead quality.
- Kept existing component patterns and visual hierarchy; no new dependencies.

### Files changed
- src/pages/Index.tsx
- src/pages/PublishService.tsx

### Validation results
- `npm run build` -> Passed.
- `npx eslint src/pages/Index.tsx src/pages/PublishService.tsx` -> Passed.

### Known issues
- None introduced in this scope.

### Next steps
1. Optional: mirror this provider-value language in `/precios` comparison microcopy for consistency across the acquisition funnel.
2. Optional: A/B test the `/empresas` benefit-ordering (visibilidad-first vs leads-first) with existing analytics events.
