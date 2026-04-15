# ObrasRD Trust Framework vs Monetized Visibility

## Objective
Define trust badges that are strictly evidence-based, while keeping paid placement (`Destacado`) explicitly separate.

## Core Separation Rule
- `Destacado (Plan)` is a monetization/visibility benefit tied to provider plan entitlement.
- Trust badges represent verification/activity evidence and must never be granted by payment status.
- A provider can be:
  - featured without trust badges,
  - trusted without featured placement,
  - both,
  - neither.

## Data Sources
- `providers`
  - `verified` (legacy verification signal)
  - `is_featured` (paid visibility signal, separate)
  - `updated_at` (used for "Activo este mes")
- `provider_verifications`
  - approved, non-expired records used for trust evidence
  - verification types now include:
    - legacy: `identity`, `portfolio`, etc.
    - trust-specific: `provider_verified`, `identity_confirmed`, `portfolio_validated`, `rapid_response`
- `portfolio_projects`
  - presence of one or more rows backs "Proyecto registrado"
- `provider_trust_signals` (view)
  - canonical trust booleans consumed by UI:
    - `provider_verified`
    - `identity_confirmed`
    - `portfolio_validated`
    - `project_registered`
    - `rapid_response`
    - `active_this_month`

## Badge Definitions (Data-backed only)
- `Proveedor verificado`
  - true if `providers.verified = true` OR approved `provider_verified` record exists.
- `Identidad confirmada`
  - true if approved identity-family verification exists.
- `Portafolio validado`
  - true if approved portfolio-family verification exists.
- `Proyecto registrado`
  - true if provider has at least one row in `portfolio_projects`.
- `Respuesta rápida`
  - true if approved `rapid_response` verification exists.
- `Activo este mes`
  - true if `providers.updated_at >= first_day_of_current_month`.

If no evidence exists for a badge, the badge must not render.

## Rendering Rules by Surface

### 1) Listing cards (`ProviderCard`)
- Show trust badges from `provider_trust_signals` only.
- Show monetized badge separately as `Destacado (Plan)` when `is_featured = true`.
- Keep trust badges in trust row; keep featured in top-right placement.

### 2) Provider profile (`ProviderProfile`)
- Trust row displays only trust evidence badges.
- `Destacado (Plan)` remains visually separate from trust row.
- Portfolio project section renders project cards from `portfolio_projects`.

### 3) Project cards (provider portfolio projects)
- Each project card can show `Proyecto registrado` only when provider trust snapshot indicates registered projects.
- No project trust badge is shown if provider has zero `portfolio_projects`.

## Non-Goals
- No changes to plan enforcement logic:
  - `provider_plans`
  - `provider_subscriptions`
  - featured entitlement triggers/rules
- No trust badge should depend on plan tier, price, or slots.

## Implementation Notes
- Migration: `supabase/migrations/20260415184500_provider_trust_signals.sql`
  - extends verification type check safely
  - creates `provider_trust_signals` view
  - grants read access to `anon`/`authenticated`
- Frontend fetches trust booleans from view and maps them to badge rendering.

## Staging Demo Scripts
- Persistent demo seed:
  - `supabase/verification/20260415_provider_trust_demo_seed.sql`
  - Adds sample approved verifications and one demo portfolio project so badges are visible.
- Rollback-safe smoke check:
  - `supabase/verification/20260415_provider_trust_smoke.sql`
  - Verifies trust signals exist and remain independent from `provider_plans` / `provider_subscriptions` logic.
