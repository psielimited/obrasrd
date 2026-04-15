# ObrasRD Taxonomy Flow Integration

Date: 2026-04-15

## Scope
This integration wires the canonical taxonomy (`stage -> discipline -> service` plus `work_type`) into the existing Supabase-backed marketplace lifecycle without replacing legacy category/phase paths.

## Existing Lifecycle Preserved

### Lead/contact workflow (unchanged behavior, additive fields)
- Existing lead creation and messaging lifecycle remains intact:
  - `src/lib/leads-api.ts` (`createLead`, `getLeadsForProvider`, `updateMyLeadState`)
  - `src/lib/lead-messages-api.ts` (`send_lead_message` RPC flow)
  - DB enforcement and automation from existing migrations (quota trigger, messaging state routines).
- Additive taxonomy columns on `leads` are now write-capable from frontend writes:
  - `requested_stage_id`
  - `requested_discipline_id`
  - `requested_service_id`
  - `requested_work_type_id`
- If taxonomy fields are missing, lead behavior is identical to legacy flow.

### Provider monetization / featured / quota workflow (unchanged enforcement)
- Plan and entitlement logic is still enforced in database triggers/functions:
  - `supabase/migrations/20260316001000_provider_plans.sql`
    - `enforce_provider_lead_quota()` trigger on `leads`
  - `supabase/migrations/20260316005000_provider_featured_entitlement.sql`
    - `enforce_provider_featured_entitlement()` trigger on `providers.is_featured`
- Frontend plan gating remains active in provider editor:
  - `src/pages/ProviderProfileEditorPage.tsx` uses `useMyProviderPlanSnapshot()` and preserves slot checks.
- No quota bypass was introduced by taxonomy fields.

## Integration Points Implemented

### 1) Provider profile write path now includes taxonomy associations
- `src/lib/profile-api.ts`
  - `ProviderProfileInput` extended with optional taxonomy fields:
    - `primaryDisciplineId`, `primaryServiceId`, `serviceIds`, `workTypeIds`
  - Provider upsert writes additive columns when present:
    - `providers.primary_discipline_id`
    - `providers.primary_service_id`
  - New relation sync routine writes join tables:
    - `provider_services` (multi-service per provider)
    - `provider_work_types` (multi-work-type per provider)
- This preserves existing provider record identity/relationships and legacy category columns.

### 2) Provider profile read path now returns taxonomy relations
- `src/lib/profile-api.ts` (`getMyProviderProfile`) now loads `provider_services` and `provider_work_types` IDs.
- `src/lib/marketplace-api.ts` (`fetchProviders`, `fetchProviderById`) now includes joined `serviceIds` and `workTypeIds` in provider objects.

### 3) Provider editor UI now manages taxonomy (additive to legacy fields)
- `src/pages/ProviderProfileEditorPage.tsx`
  - Keeps existing required legacy fields (`phaseId`, `categorySlug`) for compatibility.
  - Adds editable taxonomy controls for:
    - primary discipline
    - primary service
    - multiple services
    - multiple work types
  - Saves taxonomy through existing provider upsert path.

### 4) Service request/publication path now stores taxonomy
- `src/lib/marketplace-api.ts`
  - `PublishServiceInput` extended with optional requested taxonomy IDs.
  - `createServicePost` writes requested taxonomy columns on `service_posts` when provided.
- `src/pages/PublishService.tsx`
  - Added optional taxonomy selectors that populate requested taxonomy IDs.
  - Existing minimal post flow still works when no taxonomy is selected.

### 5) Lead creation path now stores taxonomy context
- `src/lib/leads-api.ts`
  - `CreateLeadInput` extended with optional requested taxonomy IDs.
  - `createLead` writes requested taxonomy columns on `leads` when provided.
- `src/pages/ProviderProfile.tsx`
  - Lead submissions now pass provider taxonomy hints (phase/primary discipline/primary service) when available.

## Featured Ranking + Taxonomy Coexistence
- Current provider ordering in `src/lib/marketplace-api.ts` now prioritizes:
  1. `is_featured` descending
  2. `verified` descending
  3. `rating` descending
- This keeps premium placement behavior aligned with existing featured entitlement triggers.
- Taxonomy relevance can be layered later as an additional ranking signal without displacing entitlement enforcement.

## Backward Compatibility Notes
- Legacy category/phase discovery remains fully operational.
- No legacy columns were removed.
- No lead lifecycle RPC/contracts were removed or renamed.
- No provider plan or featured entitlement logic was moved out of DB triggers.

## Follow-up Recommendations
1. Backfill missing `requested_*` taxonomy fields for historical `leads` and `service_posts` using `legacy_category_mappings` confidence rules.
2. Add read-model helpers for taxonomy-aware provider filtering (service/work type facets) while preserving legacy slug filters.
3. Regenerate `src/integrations/supabase/types.ts` after migrations are applied to remove temporary `as any` bridges.
