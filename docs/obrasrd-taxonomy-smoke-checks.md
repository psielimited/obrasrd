# ObrasRD Taxonomy Smoke Checks

Date: 2026-04-15

## Purpose
These checks validate that the taxonomy rollout is integrated into the real marketplace lifecycle without breaking lead messaging or monetization enforcement.

## Verification Scripts
- `supabase/verification/20260415_taxonomy_rollout_smoke.sql`
- `supabase/verification/20260415_taxonomy_lifecycle_compat_smoke.sql`

Both scripts follow the existing repo convention:
- `begin;`
- verification `do $$ ... $$` blocks with explicit exceptions on failure
- `rollback;` by default (safe execution)

## Run Order
1. Apply migrations through `20260415130000_legacy_taxonomy_compatibility_layer.sql`.
2. Run `20260415_taxonomy_rollout_smoke.sql`.
3. Run `20260415_taxonomy_lifecycle_compat_smoke.sql`.

## What Each Script Verifies

### 1) `20260415_taxonomy_rollout_smoke.sql`
- Taxonomy schema objects exist:
  - `disciplines`, `services`, `work_types`
  - `provider_services`, `provider_work_types`
  - `legacy_category_mappings`
  - `legacy_category_mapping_report`, `legacy_category_mapping_summary`
- Canonical seed coverage exists for:
  - 3 canonical stages
  - 11 canonical disciplines
  - 11 canonical services
  - 8 canonical work types
- Service hierarchy integrity:
  - each `services.stage_id` matches `disciplines.stage_id`
- Legacy compatibility coverage summary is present and includes at least one `fully_mapped` category.
- Provider taxonomy join tables accept and persist inserts/upserts.
- Project intake (`service_posts`) persists requested taxonomy fields:
  - `requested_stage_id`
  - `requested_discipline_id`
  - `requested_service_id`
  - `requested_work_type_id`

### 2) `20260415_taxonomy_lifecycle_compat_smoke.sql`
- Lead taxonomy columns exist on `public.leads`.
- Existing lead lifecycle functions/triggers remain present:
  - `send_lead_message`
  - `mark_my_lead_thread_read`
  - `update_my_lead_state`
  - `trg_enforce_provider_lead_quota`
  - `trg_enforce_provider_featured_entitlement`
- Lead lifecycle still works with taxonomy-populated lead rows:
  - lead insert with requested taxonomy IDs
  - requester message send + lead preview sync
  - requester archive/reactivate via RPC
  - provider mark thread read via RPC
- Monetization compatibility still enforced after taxonomy integration:
  - featured entitlement blocks `is_featured=true` when plan slots are zero
  - lead quota blocks new lead insert even when taxonomy fields are populated

## Safe Execution Notes
- Scripts are rollback-safe by default; no verification data is persisted.
- Some checks may print `SKIP` notices when required fixture data does not exist (for example, no provider with `owner_user_id`).
- `SKIP` notices are informational and indicate missing test fixtures rather than SQL errors.

## Expected Outcome
- No unhandled exceptions.
- Notice logs may include coverage summaries and expected enforcement blocks.
- Transaction ends with `ROLLBACK`, leaving data unchanged.
