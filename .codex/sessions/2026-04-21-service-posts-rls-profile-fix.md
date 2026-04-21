# Goal
Fix Supabase RLS failure when creating `service_posts` during publish/profile completion flow.

# In scope / out of scope
- In scope: client insert path for `service_posts` ownership binding to authenticated user.
- Out of scope: DB policy changes, route redesign, auth UX redesign.

# Decisions
- Keep strict RLS policy (`owner_user_id = auth.uid()`) intact.
- Update client insert to set `owner_user_id` from `supabase.auth.getUser()` before insert.
- Fail fast with clear error when user session is missing.

# Files changed
- src/lib/marketplace-api.ts
- .codex/sessions/2026-04-21-service-posts-rls-profile-fix.md

# Validation results
- `npm run lint`: failed due existing repo-wide lint errors unrelated to this change (e.g., `@typescript-eslint/no-explicit-any` across multiple files).
- `npm run build`: passed.

# Known issues
- If a session expires, submit now fails early with explicit auth error, which is expected.
- Lint baseline is currently red in this branch due unrelated pre-existing issues.

# Next steps
- Verify publish/profile completion flow while authenticated to confirm RLS error is resolved.
- Optional: improve user-facing toast message for unauthenticated publish attempts.
