# ObrasRD Repository-Aware Audit

## Scope and Method
This audit is grounded in the current code and migrations in `psielimited/obrasrd`.

Inspected areas:
- App/router shell and page routes (`src/App.tsx`)
- Marketplace/discovery components and hooks (`src/components/*`, `src/pages/*`, `src/hooks/use-marketplace-data.ts`, `src/lib/marketplace-api.ts`)
- Supabase client/types (`src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`)
- Migrations and verification SQL (`supabase/migrations/*`, `supabase/verification/*`)
- Lead/contact/messaging flows (`src/lib/leads-api.ts`, `src/lib/lead-messages-api.ts`, `src/pages/ProviderLeadsPage.tsx`, `src/pages/LeadThreadPage.tsx`, `src/pages/ConsumerRequestsPage.tsx`)
- Provider monetization and featured logic (`src/lib/provider-plan-api.ts`, `src/pages/PricingPage.tsx`, `src/pages/ProviderProfileEditorPage.tsx`, provider-plan migrations)

## Current Architecture (Actual)
- Frontend: Vite + React 18 + TypeScript SPA (`package.json`, `src/main.tsx`)
- Routing: `react-router-dom` BrowserRouter (no SSR/App Router), lazy-loaded pages (`src/App.tsx`)
- UI: Tailwind + shadcn UI components (`components.json`, `src/components/ui/*`)
- Data access: Supabase JS client directly in frontend (`src/integrations/supabase/client.ts`)
- State/querying: TanStack Query (`QueryClientProvider` in `src/App.tsx`)
- Realtime sync: Supabase Realtime listeners for `leads`, `lead_messages`, `notifications` (`src/hooks/use-dashboard-realtime-sync.ts`)
- Auth/session: Supabase auth hooks + protected route wrapper (`src/hooks/use-auth-session.ts`, `src/components/RequireAuth.tsx`)
- Supabase project binding: `project_id = "imgrpqyvahzxcfgsjyqr"` (`supabase/config.toml`)

## Actual Route Map
From `src/App.tsx`:

Public routes:
- `/` home
- `/buscar` search/listing
- `/fase/:slug` stage page
- `/proveedor/:id` provider profile + lead submission
- `/materiales` materials listing
- `/proyectos` project builder wizard
- `/publicar` service post form
- `/precios` provider pricing/plans
- `/auth` sign-in/sign-up

Protected routes:
- `/dashboard` role-based redirect
- `/perfil` account/profile settings
- `/dashboard/proveedor` provider dashboard
- `/dashboard/proveedor/perfil` provider profile editor
- `/dashboard/cliente` consumer dashboard
- `/dashboard/cliente/solicitudes` consumer requests/leads
- `/dashboard/cliente/guardados` saved providers
- `/dashboard/cliente/comparar` compare providers
- `/dashboard/leads` provider leads inbox
- `/notificaciones` notifications inbox
- `/lead/:id/chat` lead thread chat

Fallback:
- `*` -> `NotFound`

## Data Model Relevant to Providers, Taxonomy, Leads, Plans
Source: `src/integrations/supabase/types.ts` + migrations.

### Taxonomy and marketplace core
- `phases` (stage): `id`, `slug`, `name`, `description`, `sort_order`
- `categories`: tied to `phase_id`, with `slug`, `name`, `icon`, `popularity_count`
- `providers`:
  - taxonomy linkage: `phase_id`, `category_slug`
  - profile data: `name`, `trade`, `description`, `city`, `location`, `service_areas`, `portfolio_images`, `whatsapp`, etc.
  - trust/monetization fields: `verified`, `is_featured`, `owner_user_id`

### Lead lifecycle and messaging
- `leads`:
  - relationship: `provider_id` -> `providers.id`
  - requester fields: `requester_name`, `requester_contact`, `requester_user_id`
  - lifecycle fields: `status` (`new|contacted|qualified|closed_won|closed_lost`), `requester_state` (`active|cancelled|archived`)
  - timestamps: `contacted_at`, `closed_at`, `requester_cancelled_at`, `requester_archived_at`
  - thread summary/read markers: `last_message_at`, `last_message_preview`, `provider_last_read_at`, `requester_last_read_at`
- `lead_messages`:
  - per-lead chat messages with `sender_role` (`provider|requester`)
- RPC/functions used by app:
  - `send_lead_message(p_lead_id, p_message)`
  - `mark_my_lead_thread_read(p_lead_id)`
  - `update_my_lead_state(p_lead_id, p_requester_state)`

### Notifications and outbound delivery
- `notifications`: in-app notifications for lead events/messages
- `outbound_messages`: queued external delivery (email/WhatsApp), service-role dequeue/complete functions

### Provider monetization
- `provider_plans`: `code`, `monthly_lead_quota`, `featured_slots`, `priority_support`, `price_dop`, `price_usd`
- `provider_subscriptions`: per provider owner (`provider_user_id`) active/trialing/etc plan assignment
- RPC:
  - `get_my_provider_plan_snapshot()` (quota usage, remaining leads, plan status, featured slots)
- Triggers enforcing monetization:
  - `trg_enforce_provider_lead_quota` on `leads` insert
  - `trg_enforce_provider_featured_entitlement` on `providers.is_featured`

## Where Marketplace Logic Is Category-Based and Shallow
Current discovery is mostly `phase -> category slug -> providers` with limited depth:

- Provider classification is single-axis at provider row level (`providers.phase_id`, `providers.category_slug`) and one free-text specialty (`trade`).
- Search filters by text + `categoria` query string only, not discipline/service decomposition (`src/pages/SearchPage.tsx`).
- Phase page categories deep-link to `/buscar?categoria={slug}` only (`src/pages/PhasePage.tsx`).
- Hero/category pills are fixed/hardcoded set (`src/components/HeroSearch.tsx`).
- Category theming is static slug-to-family mapping in code (`src/lib/category-theme.ts`), not data-driven taxonomy.
- Provider editor only allows one `phase` + one `category` selection per provider profile (`src/pages/ProviderProfileEditorPage.tsx`).
- Compare/saved views compare generic provider profile fields, no structured stage->discipline->service facets.

Implication for business goal: the platform is already stage+category aware, but not yet structured as stage -> technical discipline -> specific service taxonomy for matching/discovery.

## Lead Lifecycle That Must Be Preserved
Must not break these verified flows:

1. Lead creation from provider profile quote form (`src/pages/ProviderProfile.tsx` -> `createLead` in `src/lib/leads-api.ts`).
2. Role-aware RLS access patterns for providers/requesters on leads/messages (migrations `20260315201000_*`, `20260315234000_*`).
3. Provider inbox operations:
- status updates + internal note (`provider_reply`) (`src/pages/ProviderLeadsPage.tsx`)
- chat access (`/lead/:id/chat`)
4. Requester lifecycle actions via RPC (`update_my_lead_state`) (`src/pages/ConsumerRequestsPage.tsx`).
5. Thread read markers and unread computation based on `last_message_at` vs `*_last_read_at`.
6. Notification side effects for lead/message events (`notifications` + outbound queue triggers).
7. Realtime invalidation contract in `use-dashboard-realtime-sync.ts` for leads/messages/notifications.
8. Existing verification script expectations (`supabase/verification/20260315_lead_messaging_smoke.sql`).

## Monetization Logic That Must Be Preserved
Must not break these verified constraints:

1. Public plan listing (`provider_plans`) and pricing page consumption (`src/pages/PricingPage.tsx`).
2. Provider snapshot RPC usage (`get_my_provider_plan_snapshot`) powering dashboard/editor plan UI.
3. Lead quota trigger blocking inserts when quota exhausted (`trg_enforce_provider_lead_quota`).
4. Featured entitlement trigger blocking `is_featured=true` without slots (`trg_enforce_provider_featured_entitlement`).
5. Provider editor featured toggle behavior based on `planSnapshot.featuredSlots` (`src/pages/ProviderProfileEditorPage.tsx`).
6. Existing verification script expectations (`supabase/verification/20260316_provider_plans_smoke.sql`).

## Safest Migration Sequence (Incremental, Route-Compatible)
1. Additive taxonomy schema only first:
- introduce discipline/service tables and mapping tables without dropping `phases/categories/providers.phase_id/providers.category_slug`.
- keep legacy fields as compatibility source.

2. Dual-read compatibility layer in API hooks:
- extend `marketplace-api` to hydrate new structured taxonomy while still returning existing `Provider` shape.
- preserve query-string route contract (`/buscar?q=...&categoria=...`) and map old `categoria` slug to new taxonomy.

3. Backfill scripts + verification:
- deterministic backfill from current categories to discipline/service mappings.
- keep old columns populated during transition.

4. Non-breaking UX enhancement:
- add optional discovery UI for `stage -> discipline -> service` while maintaining current pages and params.
- no forced URL breakage in first iterations.

5. Lead intake enrichment (additive):
- attach optional taxonomy references to leads/service posts while preserving current lead creation payload.
- keep existing RPCs/triggers unchanged unless strictly additive.

6. Monetization-aware rollout:
- if service-level entitlements are introduced, implement as additive checks that do not bypass/replace existing quota/featured triggers.

7. Deprecation last:
- only after traffic and compatibility confidence: gradually shift reads from legacy phase/category columns to new taxonomy tables.

## UI Surfaces Requiring Backward-Compatible Fallbacks
These surfaces currently rely on legacy category/phase behavior and should support fallback during migration:

- `HeroSearch` category pills (`src/components/HeroSearch.tsx`)
- `PhaseGrid` and `/fase/:slug` (`src/components/PhaseGrid.tsx`, `src/pages/PhasePage.tsx`)
- `/buscar` provider filtering by `categoria` param (`src/pages/SearchPage.tsx`)
- `PopularCategories` (`src/components/PopularCategories.tsx`)
- Provider card/profile category labeling/theme (`src/components/ProviderCard.tsx`, `src/pages/ProviderProfile.tsx`, `src/lib/category-theme.ts`)
- Provider profile editor phase/category selectors (`src/pages/ProviderProfileEditorPage.tsx`)
- Provider dashboard category/phase insights widgets (`src/pages/ProviderDashboard.tsx`)
- Saved/comparison views that assume provider-level single category (`src/pages/ConsumerSavedProvidersPage.tsx`, `src/pages/ConsumerCompareProvidersPage.tsx`)

## Phased Backlog

### Phase 1: Schema + Taxonomy
- Create additive taxonomy tables for `technical_disciplines` and `services` linked to existing `phases`.
- Create mapping table(s) for providers to service(s), keeping current one-category provider model untouched.
- Add read indexes for stage->discipline->service lookup and provider matching.
- Add additive lead/service-post optional fields for structured service targeting.
- Add migration-level constraints and RLS policies mirroring current access model.
- Add verification SQL for taxonomy integrity and compatibility with current provider rows.

### Phase 2: Compatibility + Backfill
- Build backfill migration to map existing `categories.slug` into new discipline/service records.
- Populate provider-service mappings from current `providers.category_slug`.
- Keep legacy columns authoritative during this phase; run dual-write for new/edited provider profiles.
- Extend `marketplace-api` to expose structured taxonomy while preserving existing `Provider` interface fields.
- Add compatibility mapper for legacy URL params (`categoria`) to new service keys.
- Add non-regression tests for lead messaging + provider plans + taxonomy fallback behavior.

### Phase 3: Discovery UX
- Add staged discovery UI path: stage selector -> discipline selector -> service selector.
- Preserve existing routes and params (`/buscar`, `/fase/:slug`) while accepting new optional params.
- Keep current cards/lists working if only legacy taxonomy data is present.
- Refactor `category-theme` into taxonomy-aware theming with fallback to legacy slug mapping.
- Update popular categories/hero pills to consume data-driven taxonomy (with legacy defaults if unavailable).

### Phase 4: Intake + Matching
- Extend provider profile editor to support selecting specific services (multi-select if desired) while keeping legacy phase/category controls visible.
- Extend lead creation payload with optional structured target service fields.
- Keep `createLead`, `send_lead_message`, `update_my_lead_state`, and existing triggers/RPCs unchanged semantically.
- Add matching logic for provider discovery based on service mapping, with fallback to legacy category slug matching.
- Ensure requester/provider dashboards continue to resolve lead context even when only legacy fields exist.

### Phase 5: Analytics + Reporting
- Add analytics views/queries for funnel by stage, discipline, service.
- Add reporting for lead conversion by structured taxonomy while retaining legacy category rollups.
- Add provider performance insights by service specialization and plan tier.
- Add monitoring for quota/featured constraint violations and migration mismatch rates.
- Define criteria and timeline for eventual legacy-column deprecation (no immediate destructive changes).

## Risks and Guardrails
- Risk: breaking route/query compatibility (`/buscar?categoria=`). Guardrail: keep parser + mapper until full migration complete.
- Risk: bypassing monetization triggers when changing lead/provider writes. Guardrail: no replacement of current trigger-based enforcement.
- Risk: RLS regressions with new taxonomy tables. Guardrail: replicate existing public-read/auth-write patterns intentionally.
- Risk: stale fallback data path masks production issues. Guardrail: add telemetry on fallback usage (Supabase failure or taxonomy mismatch).

## Immediate Next-Step Recommendation
Before any refactor, implement Phase 1 as additive SQL + generated types update only, then run both existing verification scripts unchanged to confirm no regression in lead/messaging and provider monetization behavior.
