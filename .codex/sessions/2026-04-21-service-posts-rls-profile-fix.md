# Goal
Fix Supabase RLS failure when creating `service_posts` during publish/profile completion flow.

# In scope / out of scope
- In scope: client insert path for `service_posts` ownership binding to authenticated user.
- In scope: `/empresas` UX handling for unauthenticated publish attempts and clearer error feedback.
- Out of scope: DB policy changes, route redesign, auth UX redesign.

# Decisions
- Keep strict RLS policy (`owner_user_id = auth.uid()`) intact.
- Update client insert to set `owner_user_id` from `supabase.auth.getUser()` before insert.
- Fail fast with clear error when user session is missing.
- On `/empresas`, redirect unauthenticated users to `/auth` before submit and preserve return path.
- Show backend error message in toast instead of a generic fallback-only message.

# Files changed
- src/lib/marketplace-api.ts
- src/pages/PublishService.tsx
- .codex/sessions/2026-04-21-service-posts-rls-profile-fix.md

# Validation results
- `npm run build`: passed.
- `npm run lint`: not rerun in this pass (known baseline issues already present in branch).

# Known issues
- Lint baseline is currently red in this branch due unrelated pre-existing issues.

# Next steps
- Deploy latest frontend build so production `/empresas` picks up auth-aware submit handling.
- Validate unauthenticated and authenticated submit flows in production.
