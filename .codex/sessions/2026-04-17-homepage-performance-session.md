# Session: Homepage Performance

Date: 2026-04-17
Repository: psielimited/obrasrd

## Goal
Improve homepage perceived above-the-fold speed based on Lighthouse findings.

## In Scope
- Defer non-critical homepage fetches until after first paint.
- Enable page-level query deferral controls in related data hooks.

## Out of Scope
- Full network-layer caching redesign.
- Homepage visual redesign.

## Decisions
- Deferred initial catalog/provider fetches on homepage render path.
- Added `enabled` controls to selected hooks rather than introducing a new fetch abstraction.

## Files Changed
- `src/pages/Index.tsx`
- `src/hooks/use-marketplace-data.ts`
- `src/hooks/use-taxonomy-data.ts`

## Validation
- `npm run build` passed.

## Known Issues
- No additional Lighthouse rerun captured in this session document.

## Next Steps
- Run Lighthouse comparison before/after and record deltas.
- Add targeted tests for deferred-fetch behavior if this pattern expands.
