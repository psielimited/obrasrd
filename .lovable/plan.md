

## Goal
Replace the empty "Sin imagen disponible" placeholder on `/materiales` cards with on-brand B&W default images, mapped per material category, while keeping the same performance discipline (lazy-loaded, no CLS, cache-shareable).

## Investigation
- `MaterialCard` (`src/components/MaterialCard.tsx`) calls `ProofFirstCard` without `imageUrl` → cards render the empty-state icon + "Sin imagen disponible" copy.
- `ProofFirstCard` already supports `imageUrl` and lazy-loads it correctly. No changes needed there.
- `MATERIALS` mock data has 6 entries across 6 categories: **Cemento, Varilla, Blocks, Arena, Pintura, Techos metálicos**. Each `Material.category` is a free-text string.
- Brand rule: B&W photography only, mobile-first, generated assets live in `src/assets/photos/` and reused across surfaces for cache benefit.

## Approach

### 1. Generate 6 category default images (B&W, square-friendly)
Generate via Nano Banana Pro at ~1200px wide, B&W documentary style:
- `material-cemento.jpg` — stack of cement sacks on a worksite pallet
- `material-varilla.jpg` — bundles of rebar/varillas leaning at a site
- `material-blocks.jpg` — concrete blocks stacked, mason in background
- `material-arena.jpg` — pile of washed sand with a shovel
- `material-pintura.jpg` — paint cans + roller on a drop cloth
- `material-techos.jpg` — corrugated zinc/galvanized roofing sheets stacked

Each ~30–50KB JPEG (the existing `stage-*.jpg` assets in this repo already follow that footprint). All lazy-loaded by `ProofFirstCard`, so they don't affect LCP — only paint as the user scrolls into them.

### 2. New mapping helper
Create `src/lib/material-photos.ts` with:
- Imports for the 6 new assets.
- `MATERIAL_CATEGORY_PHOTO_MAP: Record<string, string>` keyed by normalized category (lowercased, accent-stripped) → image src.
- `getMaterialPhoto(category: string, materialName?: string): string` — normalizes the input, returns the mapped photo, falls back to `material-cemento.jpg` (a generic worksite material image) if the category is unknown.
- `getMaterialPhotoAlt(category: string): string` — returns `"Foto referencial de {category}"` style alt text.

Why a helper: matches the pattern already established by `journey-photos.ts` and `phase-stage-mapping.ts`. Single source of truth, easy to extend when new categories are added.

### 3. `MaterialCard.tsx` updates
- Import `getMaterialPhoto` / `getMaterialPhotoAlt`.
- Pass `imageUrl={getMaterialPhoto(material.category)}` and `imageAlt={getMaterialPhotoAlt(material.category)}` to `ProofFirstCard`.
- Keep the rest of the card untouched (badges, CTAs, supplier, etc.).
- No new component — `ProofFirstCard` already handles lazy-load, sizing, and aspect-ratio.

### 4. Performance guardrails (already inherited)
- `ProofFirstCard` uses `loading="lazy"`, `decoding="async"`, and a fixed `h-44` container → no CLS.
- All 6 images cache after first view; revisit + scroll = zero new bytes.
- Total new payload: ~250KB across 6 assets, but only the cards in viewport actually fetch on first paint (lazy).

## Files touched
- `src/assets/photos/material-{cemento,varilla,blocks,arena,pintura,techos}.jpg` — 6 new generated assets
- `src/lib/material-photos.ts` — new mapping helper
- `src/components/MaterialCard.tsx` — wire up `imageUrl` + `imageAlt`

## Out of scope
- Changing `ProofFirstCard` image sizing or aspect ratio.
- Adding per-material (vs per-category) imagery.
- Backfilling real supplier-uploaded photos (would override defaults later when supplier uploads exist).
- Updating the `Material` type to require an image field — defaults stay derived, not stored.

## Validation
- `npm run lint` and `npm run build`.
- Manual: load `/materiales`, confirm each of the 6 cards now shows its category-appropriate B&W photo, no empty placeholder, no layout shift, images lazy-load on scroll.
- Visual at 390px and 1280px: cards should feel consistent with provider cards on `/directorio`.

