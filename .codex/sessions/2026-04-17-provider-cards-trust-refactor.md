# Goal
Refactor provider cards across ObrasRD to improve trust visibility and decision scannability, without implying legal certification.

# In scope / out of scope
- In scope: shared provider card trust UI, shared trust badge copy, mobile CTA/card scanning improvements, compare-page verification wording alignment.
- Out of scope: backend schema changes, trust signal generation logic in Supabase, route or taxonomy renames.

# Decisions
- Kept the refactor centered in shared UI (`ProviderCard`, `TrustBadge`, `TrustBadgeRow`, `ProofFirstCard`) so Search, Index, Phase, and intake-selector card usage all inherit behavior.
- Added neutral, platform-scoped trust language ("Verificado en ObrasRD", "Identidad validada", "Portafolio revisado") to avoid legal certification implication.
- Surfaced trust attributes directly in card body: active status, response signal, project count, profile completeness, coverage, ratings, and existing trust badges.
- Improved mobile scannability with a compact two-cell metric grid and stacked CTA layout on small screens.

# Files changed
- src/components/ProviderCard.tsx
- src/components/marketplace/TrustBadge.tsx
- src/components/marketplace/TrustBadgeRow.tsx
- src/components/marketplace/ProofFirstCard.tsx
- src/lib/provider-trust.ts
- src/pages/ConsumerCompareProvidersPage.tsx

# Validation results
- `npx eslint src/components/ProviderCard.tsx src/components/marketplace/TrustBadge.tsx src/components/marketplace/TrustBadgeRow.tsx src/components/marketplace/ProofFirstCard.tsx src/lib/provider-trust.ts src/pages/ConsumerCompareProvidersPage.tsx` ?
- `npm run build` ?
- `npm run lint` ? (fails on pre-existing repository-wide lint issues unrelated to this change, including `no-explicit-any` and `no-empty-object-type` in multiple files)

# Known issues
- Repository has pre-existing lint debt that blocks a full green `npm run lint`.

# Next steps
1. If desired, schedule a lint debt pass focused on `no-explicit-any` and `no-empty-object-type` across `src/lib/*` and `src/components/ui/*`.
2. Optionally align similar trust wording in other surfaces (e.g., provider profile summary chips) for total copy consistency.
