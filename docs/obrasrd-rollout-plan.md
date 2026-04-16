# ObrasRD Rollout Plan

Date: 2026-04-15

## Goal
Roll out taxonomy-driven marketplace behavior safely while preserving compatibility for partially migrated provider/category records.

## Existing Guard/Flag Baseline

Current repo already uses environment/guard patterns:

- `import.meta.env.DEV` for dev-only exposure (for example `/internal/data-quality` route).
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` fallback behavior in data APIs.

No centralized feature-flag framework is currently present. Rollout can use lightweight `VITE_FEATURE_*` flags at route/component boundaries.

## Recommended Feature Flags

Introduce these optional env flags (default `true` in staging/prod once ready):

- `VITE_FEATURE_HOME_INTENT_FLOW`
- `VITE_FEATURE_TAXONOMY_FILTERS`
- `VITE_FEATURE_PLAIN_LANGUAGE_SEARCH`
- `VITE_FEATURE_PROOF_FIRST_CARDS`
- `VITE_FEATURE_PROJECT_INTAKE_MATCHING`
- `VITE_FEATURE_PROVIDER_TRUST_BADGES`
- `VITE_FEATURE_INTERNAL_DATA_QUALITY` (keep `DEV` + admin check)

Implementation style:
- Parse once in a small runtime flags utility.
- Guard only top-level entrypoints; keep deep business logic shared.
- Prefer fallback to existing compatible path instead of hard disabling route behavior.

## Phased Rollout

### Phase 0: Preflight
1. Apply migrations through taxonomy + compatibility + trust signals.
2. Regenerate Supabase types if needed.
3. Run verification SQL:
   - `20260415_taxonomy_rollout_smoke.sql`
   - `20260415_taxonomy_lifecycle_compat_smoke.sql`
   - `20260315_lead_messaging_smoke.sql`
   - `20260316_provider_plans_smoke.sql`
   - `20260415_provider_trust_smoke.sql`
4. Confirm app build/test green.

### Phase 1: Controlled Exposure
1. Enable:
   - `VITE_FEATURE_HOME_INTENT_FLOW=true`
   - `VITE_FEATURE_TAXONOMY_FILTERS=true`
2. Keep compatibility paths active:
   - legacy category mapping fallback
   - legacy work-type fallback in matching
3. Monitor:
   - filter usage volume
   - unmatched normalized query signals
   - no increase in zero-result searches

### Phase 2: Conversion Flows
1. Enable:
   - `VITE_FEATURE_PROJECT_INTAKE_MATCHING=true`
   - `VITE_FEATURE_PLAIN_LANGUAGE_SEARCH=true`
2. Track:
   - intake completion rate
   - provider match selection rates
   - lead create success/failure counts

### Phase 3: Trust + Monetization Validation in Production
1. Enable:
   - `VITE_FEATURE_PROVIDER_TRUST_BADGES=true`
2. Confirm:
   - trust badges render from `provider_trust_signals`
   - featured placement remains tie-breaker only in matching
   - quota and featured entitlement triggers still enforce constraints

### Phase 4: Data Hygiene and Legacy Convergence
1. Keep `/internal/data-quality` for iterative cleanup (DEV/admin surface).
2. Use report outputs to prioritize:
   - providers missing taxonomy bindings
   - legacy-only providers
   - featured providers with missing structured data
3. Defer destructive legacy removal until report counts are consistently low.

## Rollback Strategy

Fast rollback is flag-first:
1. Disable newest feature flags in reverse rollout order.
2. Preserve compatibility paths and DB schema (additive migrations remain valid).
3. Keep verification scripts rollback-safe to retest quickly after rollback.

## Operational Checklist

- Before each phase:
  - smoke SQL scripts pass
  - build/test pass
  - no new critical console/runtime errors
- After each phase:
  - check lead throughput and response latency
  - compare featured/non-featured conversion behavior
  - review unmatched normalized query trendline
