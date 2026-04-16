# ObrasRD Data Quality Reporting

## Overview

A lightweight internal reporting surface was added for iterative taxonomy cleanup and quality monitoring.

- Route: `/internal/data-quality`
- Availability: development mode only (`import.meta.env.DEV`)
- Access: authenticated user with `admin` role
- Stack: React + React Query + existing Supabase client patterns (no admin framework)

## Implementation

- Route wiring: `src/App.tsx`
- Page UI: `src/pages/InternalDataQualityPage.tsx`
- Report engine: `src/lib/reports/data-quality-report.ts`

The report engine reads from current marketplace tables and builds categorized findings directly in the frontend.

## Included Reports

### 1. Providers Missing Taxonomy Bindings

Detects providers with no structured taxonomy linkage:

- no `primary_discipline_id`
- no `primary_service_id`
- no `provider_services` rows
- no `provider_work_types` rows

### 2. Providers Missing Location

Detects providers with both fields empty/blank:

- `location`
- `city`

### 3. Providers Missing Portfolio

Detects providers with no evidence of portfolio:

- `portfolio_images` empty
- no `portfolio_projects` rows

### 4. Providers Still Legacy-Only

Detects providers using legacy categorization only:

- has `category_slug`
- missing all structured taxonomy bindings (same criteria as report #1)

### 5. Project Requests With Unmapped Normalized Search Terms

Built from `leads.message` using existing normalization logic:

- extracts candidate text from lead message (`Descripcion:` block when present)
- runs `buildSearchNormalization(...)`
- keeps only `unmatchedNormalizedQuery=true`
- groups by deterministic hash of normalized text

Privacy handling:

- report shows hash, counts, and recency
- freeform text is not displayed

### 6. Providers With Verification Inconsistencies

Cross-checks `providers` with `provider_trust_signals`:

- `provider_verified` mismatch with `providers.verified`
- `portfolio_validated=true` but no portfolio assets
- `active_this_month=true` while `providers.updated_at` is outside current month
- `identity_confirmed=true` while provider is not verified

### 7. Featured Placement vs Missing Structured Data

For featured providers (`is_featured=true`), flags whether each has:

- missing taxonomy bindings
- missing location
- missing portfolio

## Why This Helps Taxonomy Cleanup

This surface supports short feedback loops:

- identify providers that need structured migration first
- prioritize featured providers with incomplete structured metadata
- quantify where lead requests still fail normalization mapping
- monitor trust-signal consistency while taxonomy rollout continues

## Notes

- If Supabase config is unavailable, the report falls back to empty sections.
- Report is intentionally lightweight and refreshable in-page.
- To promote this to production later, convert access control from DEV-gated route to a dedicated admin gate and audit all RLS policies used by these queries.
