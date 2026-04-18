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
