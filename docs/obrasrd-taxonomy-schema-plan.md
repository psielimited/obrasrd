# ObrasRD Taxonomy Schema Plan

## Objective
Introduce a normalized construction taxonomy layer in Supabase, additive-first, while preserving:
- Existing marketplace discovery compatibility (`phases`, `categories`, `providers.category_slug`, `providers.phase_id`)
- Existing lead lifecycle + messaging (`leads`, `lead_messages`, `send_lead_message`, `mark_my_lead_thread_read`, `update_my_lead_state`)
- Existing monetization enforcement (`provider_plans`, `provider_subscriptions`, `providers.is_featured`, quota + featured triggers)

## Current Relevant Tables (Actual)

### Providers and taxonomy today
- `public.phases`
  - Canonical stage table today (`id`, `slug`, `name`, `description`, `sort_order`)
- `public.categories`
  - Category table linked to stage via `phase_id`
- `public.providers`
  - Current provider taxonomy linkage via:
    - `phase_id` -> `phases.id`
    - `category_slug` -> `categories.slug`
  - Existing monetization/trust-relevant fields include `is_featured`, `owner_user_id`, `verified`

### Leads, contact, messages
- `public.leads`
  - Core request lifecycle (`status`, `requester_state`, timestamps, `provider_id`)
- `public.lead_messages`
  - Per-lead message thread
- `public.notifications`
  - In-app notification feed for lead/message events
- `public.outbound_messages`
  - Outbound delivery queue for notifications

### Monetization and featured eligibility
- `public.provider_plans`
- `public.provider_subscriptions`
- Existing functions/triggers that must remain compatible:
  - `public.get_my_provider_plan_snapshot()`
  - `public.enforce_provider_lead_quota()` + `trg_enforce_provider_lead_quota` on `leads`
  - `public.enforce_provider_featured_entitlement()` + `trg_enforce_provider_featured_entitlement` on `providers`

## Reuse vs New Concepts

### `project_stages`
- Decision: **reuse existing `public.phases` as canonical stage source**.
- Reason: duplicating stages into a new table would create drift and break current route/data assumptions.
- Implementation: provide compatibility view `public.project_stages` over `public.phases`.

### Existing categories
- Keep `public.categories` unchanged for backward compatibility.
- Introduce forward mapping table from legacy category slugs to normalized discipline/service nodes.

## New Tables Needed

### 1) `public.disciplines`
Purpose: normalized technical disciplines under existing stages.

Proposed columns:
- `id bigint generated always as identity primary key`
- `stage_id bigint not null references public.phases(id) on delete cascade`
- `slug text not null unique`
- `name text not null`
- `description text`
- `sort_order int not null default 0`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `unique(stage_id, name)`
- `index(stage_id, sort_order)`

### 2) `public.services`
Purpose: specific service taxonomy nodes under disciplines.

Proposed columns:
- `id bigint generated always as identity primary key`
- `discipline_id bigint not null references public.disciplines(id) on delete cascade`
- `slug text not null unique`
- `name text not null`
- `description text`
- `sort_order int not null default 0`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `unique(discipline_id, name)`
- `index(discipline_id, sort_order)`

### 3) `public.work_types`
Purpose: cross-service work scopes (e.g., install, repair, maintenance, design, supervision).

Proposed columns:
- `id bigint generated always as identity primary key`
- `code text not null unique`
- `name text not null`
- `description text`
- `sort_order int not null default 0`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### 4) `public.provider_services`
Purpose: many-to-many provider specialization mapping.

Proposed columns:
- `id bigint generated always as identity primary key`
- `provider_id uuid not null references public.providers(id) on delete cascade`
- `service_id bigint not null references public.services(id) on delete cascade`
- `is_primary boolean not null default false`
- `years_experience int`
- `min_price numeric`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `unique(provider_id, service_id)`
- `index(service_id)`

### 5) `public.provider_work_types`
Purpose: provider-to-work-type capabilities.

Proposed columns:
- `id bigint generated always as identity primary key`
- `provider_id uuid not null references public.providers(id) on delete cascade`
- `work_type_id bigint not null references public.work_types(id) on delete cascade`
- `created_at timestamptz not null default now()`

Indexes/constraints:
- `unique(provider_id, work_type_id)`
- `index(work_type_id)`

### 6) `public.provider_verifications`
Purpose: structured provider verification records instead of only boolean `providers.verified`.

Proposed columns:
- `id uuid primary key default gen_random_uuid()`
- `provider_id uuid not null references public.providers(id) on delete cascade`
- `verification_type text not null` (checked enum-like set)
- `status text not null default 'pending'` (checked enum-like set)
- `verified_by_user_id uuid references auth.users(id) on delete set null`
- `verified_at timestamptz`
- `expires_at timestamptz`
- `evidence_media_asset_id uuid references public.media_assets(id) on delete set null`
- `metadata jsonb not null default '{}'::jsonb`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `index(provider_id, status)`
- `index(verification_type)`

### 7) `public.portfolio_projects`
Purpose: normalized project portfolio entries linked to providers/taxonomy.

Proposed columns:
- `id uuid primary key default gen_random_uuid()`
- `provider_id uuid not null references public.providers(id) on delete cascade`
- `title text not null`
- `summary text`
- `location text`
- `started_on date`
- `completed_on date`
- `status text not null default 'completed'` (checked enum-like set)
- `stage_id bigint references public.phases(id) on delete set null`
- `discipline_id bigint references public.disciplines(id) on delete set null`
- `primary_service_id bigint references public.services(id) on delete set null`
- `primary_work_type_id bigint references public.work_types(id) on delete set null`
- `cover_media_asset_id uuid references public.media_assets(id) on delete set null`
- `budget_range text`
- `is_featured boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `index(provider_id, completed_on desc)`
- `index(stage_id, discipline_id, primary_service_id)`

### 8) `public.legacy_category_mappings`
Purpose: forward mapping from existing category slugs into normalized taxonomy.

Proposed columns:
- `id bigint generated always as identity primary key`
- `legacy_category_slug text not null references public.categories(slug) on delete cascade`
- `legacy_phase_id bigint references public.phases(id) on delete set null`
- `discipline_id bigint not null references public.disciplines(id) on delete cascade`
- `service_id bigint not null references public.services(id) on delete cascade`
- `confidence numeric(4,3) not null default 1.000` (0..1 check)
- `mapping_source text not null default 'manual'`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes/constraints:
- `unique(legacy_category_slug, service_id)`
- `index(legacy_phase_id)`
- `index(discipline_id, service_id)`

## Columns to Add to Existing Tables (Additive, Nullable)

### `public.providers`
Add:
- `primary_discipline_id bigint references public.disciplines(id) on delete set null`
- `primary_service_id bigint references public.services(id) on delete set null`

Reason: bridge normalized taxonomy into current provider rows without removing existing `phase_id/category_slug`.

### `public.leads`
Add:
- `requested_stage_id bigint references public.phases(id) on delete set null`
- `requested_discipline_id bigint references public.disciplines(id) on delete set null`
- `requested_service_id bigint references public.services(id) on delete set null`
- `requested_work_type_id bigint references public.work_types(id) on delete set null`

Reason: enrich matching/reporting; no change to existing lifecycle columns/functions.

### `public.service_posts`
Add:
- `requested_stage_id bigint references public.phases(id) on delete set null`
- `requested_discipline_id bigint references public.disciplines(id) on delete set null`
- `requested_service_id bigint references public.services(id) on delete set null`
- `requested_work_type_id bigint references public.work_types(id) on delete set null`

Reason: structured intake while preserving existing post behavior.

## Join Tables Needed
- `provider_services`
- `provider_work_types`
- (`legacy_category_mappings` acts as compatibility bridge between legacy categories and new discipline/service model)

## Migration Sequencing (Safe)

1. Create compatibility view:
- `project_stages` as a view over existing `phases` (no data duplication).

2. Create new normalized taxonomy tables:
- `disciplines`, `services`, `work_types`.

3. Create provider/taxonomy relationship tables:
- `provider_services`, `provider_work_types`.

4. Create trust/portfolio extensions:
- `provider_verifications`, `portfolio_projects`.

5. Create legacy forward-mapping bridge:
- `legacy_category_mappings`.

6. Add nullable columns to existing tables:
- `providers`, `leads`, `service_posts` new taxonomy refs.

7. Add indexes and FK constraints:
- Ensure all new read paths are indexed.

8. Enable RLS + non-breaking baseline policies for new tables:
- Public read for taxonomy/marketplace-facing rows.
- Provider-owner write for provider-owned joins/profile extensions.

9. Keep existing functions/triggers unchanged:
- no edits to lead-messaging or plan-enforcement routines in this migration.

## Rollback Safety Notes
- Additive-only migration (new tables/view/nullable columns/indexes/policies).
- Existing application paths continue using current fields (`providers.phase_id`, `providers.category_slug`, existing lead columns).
- Existing RPCs/triggers are untouched, reducing blast radius:
  - `send_lead_message`, `mark_my_lead_thread_read`, `update_my_lead_state`
  - provider quota and featured entitlement triggers.
- In rollback emergency, disable new codepaths first; old schema remains valid.
- Optional rollback SQL can drop newly created objects in reverse dependency order if needed (not required for initial deploy).

## Legacy Category Logic Forward Mapping

Forward mapping strategy:
1. Keep current category-based filtering active.
2. Seed `legacy_category_mappings` for each current `categories.slug`.
3. At read time, resolve legacy `categoria` query params through mapping table to discipline/service IDs.
4. During transition, maintain both:
- legacy provider taxonomy (`phase_id`, `category_slug`)
- new provider taxonomy (`primary_discipline_id`, `primary_service_id`, `provider_services`)

This allows incremental UI/API migration with no route breakage and no removal of old category fields yet.
