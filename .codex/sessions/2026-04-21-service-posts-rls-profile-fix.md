# Goal
Implement service-post moderation workflow with admin review queue and owner-facing status tracking.

# In scope / out of scope
- In scope: `service_posts` moderation schema + RLS, admin moderation UI, owner status UI, route wiring, submit-flow copy update.
- In scope: grant admin access for `allen.rodriguez@gmail.com` via migration data update.
- Out of scope: notifications (email/WhatsApp), public listing behavior changes, historical review event table.

# Decisions
- Added moderation audit fields directly on `service_posts` (`reviewed_at`, `reviewed_by_user_id`, `review_note`).
- Added admin policies for service-post read/update based on `user_profiles.role = 'admin'`.
- Kept existing owner policies in place.
- Owner-facing module is `/dashboard/publicaciones`.
- Admin queue route is `/dashboard/admin/publicaciones`.
- `/empresas` success copy now states submission enters review queue and links to status page.
- Added a dedicated migration to set `allen.rodriguez@gmail.com` role to `admin` when the auth user exists.

# Files changed
- supabase/migrations/20260421103000_service_posts_moderation_workflow.sql
- supabase/migrations/20260421110000_grant_admin_allen_rodriguez.sql
- src/lib/marketplace-api.ts
- src/hooks/use-marketplace-data.ts
- src/pages/AdminServicePostsModerationPage.tsx
- src/pages/MyServicePostsPage.tsx
- src/App.tsx
- src/components/dashboard/ProviderDashboardLayout.tsx
- src/components/dashboard/ConsumerDashboardLayout.tsx
- src/pages/DashboardHomeRedirect.tsx
- src/pages/PublishService.tsx

# Validation results
- `npm run build`: passed.
- `npm run lint`: fails due existing repo-wide baseline issues unrelated to this feature (same `no-explicit-any`, UI warnings, etc.).

# Known issues
- Migration not applied automatically; run your normal Supabase migration deploy flow.
- Admin role must exist in `user_profiles` via backoffice/service-role path.
- Owner update policy still allows owner edits on own posts per existing policy design.

# Next steps
- Apply Supabase migrations in target environments.
- Smoke test:
  1) submit post as authenticated user,
  2) moderate as admin on `/dashboard/admin/publicaciones`,
  3) verify owner sees updated status/note on `/dashboard/publicaciones`.

# Schema rollback notes
- Drop admin policies on `public.service_posts`:
  - `Admins can read all service posts`
  - `Admins can moderate service posts`
- Drop moderation columns from `public.service_posts`:
  - `reviewed_at`
  - `reviewed_by_user_id`
  - `review_note`
- Drop index:
  - `service_posts_status_created_at_idx`
- Revoke admin grant for target user:
  - set role back to `buyer` (see rollback note in `20260421110000_grant_admin_allen_rodriguez.sql`)
