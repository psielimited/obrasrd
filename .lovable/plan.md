
## Goal
Let providers claim a custom, human-readable slug for their public profile URL so they can share `obrasrd.com/proveedor/javier-pichardo-construction` instead of a UUID. Lay groundwork to monetize premium slugs (short/branded) later.

## Investigation summary
- Public profile route is `/proveedor/:id` (rendered by `ProviderProfile.tsx`), and `ProviderCard` navigates with `provider.id` (UUID). Need to confirm exact route + lookup logic before finalizing.
- `providers` table has no `slug` column today. Add one with a unique index, nullable (back-compat), with reserved-word + format validation.
- Provider editor (`ProviderProfileEditorPage.tsx`) is where the new "URL personalizada" field lives.
- Plan tiers exist (`provider_plans` + `provider_subscriptions`) — perfect hook for future monetization (free tier auto-slug, paid tier custom/short slug).

## Plan

### 1. Schema (migration)
Add to `providers`:
- `slug text` — nullable, lowercase, `^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$` (3–40 chars, no leading/trailing hyphen).
- Unique partial index on `lower(slug)` where `slug is not null`.
- Validation **trigger** (not CHECK) enforcing format + reserved words (`admin`, `api`, `dashboard`, `auth`, `proveedor`, `directorio`, `empresas`, `materiales`, `conocimiento`, `perfil`, `pricing`, `nuevo`, `editar`).
- RLS: existing "owner can update" policy already covers slug edits. No new policy needed.

Rollback note: `alter table providers drop column slug;` + drop trigger/index.

### 2. Auto-suggest slug on first save
In `upsertMyProviderProfile` (`src/lib/profile-api.ts`): if provider has no slug yet, generate one from `name` (kebab-case, ASCII-fold, strip diacritics, dedupe with `-2`, `-3` if taken). Always allow user to edit it later.

### 3. Provider editor UI
In `ProviderProfileEditorPage.tsx`, add a new field "URL pública del perfil" near the name/description block:
- Input with prefix `obrasrd.com/proveedor/` (read-only) + editable slug field.
- Live validation: format, length, availability (debounced query against `providers.slug`).
- Helper text: "Usa solo letras, números y guiones. Ej: javier-pichardo-construccion".
- "Copiar enlace" button (only enabled when slug is saved + valid).
- Status messages in Spanish DR.

### 4. Public profile route resolution
Update `ProviderProfile.tsx` lookup in `marketplace-api.ts` (or wherever `getProviderById` lives) to:
- First try `providers.slug = :param` (case-insensitive).
- Fallback to `providers.id = :param` (UUID) for back-compat with existing shared links.
- If found by UUID **and** provider has a slug, issue a client-side `<Navigate replace>` to the slug URL (canonical redirect, good for SEO + sharing).

Route stays `/proveedor/:id` — no router changes; the param just accepts slug or UUID.

### 5. Update share/link generators
- `ProviderCard` → navigate with `provider.slug ?? provider.id`.
- Anywhere else building `/proveedor/${id}` links (search results, saved providers, leads). Quick grep + swap to a small helper `getProviderHref(provider)` in `src/lib/public-ia.ts`.

### 6. Monetization hook (groundwork only, no paywall yet)
- Add a soft rule in the editor: free plan = slug must be ≥ 8 chars; paid plans (`pro`, `premium`) unlock "short slug" (3–7 chars) and "premium reserved words" (e.g. trade names). Read plan from existing `get_my_provider_plan_snapshot()` RPC.
- Show a non-blocking upsell card: "Upgrade para reservar URLs cortas tipo `/proveedor/javier`."
- No payment changes. Just the gating logic + UI hint, ready to flip on later.

### 7. Analytics
Add two events to `src/lib/analytics/events.ts`:
- `provider_slug_claimed` (provider_id, slug_length, plan_code)
- `provider_profile_link_copied` (provider_id, source: editor|public_profile)

### 8. Out of scope
- Custom domains (e.g. `javierpichardo.obrasrd.com`).
- Slug history / 301 chain beyond one canonical redirect.
- Bulk slug reservation admin UI.
- Actual paywall enforcement / Stripe.

## Files touched
- `supabase/migrations/<timestamp>_add_provider_slug.sql` (new)
- `src/lib/profile-api.ts` — slug generation + upsert
- `src/lib/marketplace-api.ts` — slug-or-UUID lookup
- `src/lib/public-ia.ts` — `getProviderHref()` helper + reserved-word list
- `src/lib/analytics/events.ts` — 2 new events
- `src/pages/ProviderProfileEditorPage.tsx` — slug field + validation UI
- `src/pages/ProviderProfile.tsx` — canonical redirect when accessed by UUID
- `src/components/ProviderCard.tsx` + 2–3 other link sites — use helper

## Validation
- `npm run lint` and `npm run build`.
- Manual: claim a slug, copy link, open in incognito, confirm it loads and that the old UUID URL redirects to the slug URL.
- Edge cases: reserved word rejected, duplicate slug rejected, accents stripped (`José Núñez` → `jose-nunez`), 2-char slug rejected on free plan.
