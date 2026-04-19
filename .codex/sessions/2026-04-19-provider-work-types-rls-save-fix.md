## Goal
- Fix provider profile save failures caused by RLS errors when persisting `provider_work_types`.

## In scope / out of scope
- In scope: patch provider profile save logic to avoid RLS conflict path on `provider_work_types`.
- Out of scope: broad lint cleanup and unrelated API/type refactors already present in the repo.

## Decisions
- Replaced `upsert` with `insert` + `ignoreDuplicates` for `provider_work_types`.
- Kept delete-then-insert sync behavior, so removed work types are still deleted and existing ones are preserved.

## Files changed
- `src/lib/profile-api.ts`

## Validation results
- `npm run build`: PASS
- `npm run lint`: FAIL (pre-existing repo-wide lint errors unrelated to this change)

## Known issues
- Repo has existing lint violations in multiple files (for example `no-explicit-any`, `no-empty-object-type`, and `no-require-imports`) that were not introduced by this fix.

## Next steps
- Verify provider profile updates in-app for a provider that already has work types selected.
- Optionally add/update RLS policy for `provider_work_types` update path if future code uses `upsert` again.
