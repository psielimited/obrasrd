
## Goal
Extend the same B&W human-photography treatment we just applied to the homepage into the `/conocimiento` index and the individual guide pages, so the knowledge archive feels human and motivating instead of pure typography — without breaking the page-weight budget.

## Where to add photography

### 1. `/conocimiento` (JourneyGuidesPage)
Currently: pure type + filter chips + text cards. Cold.
- **Hero band**: add a wide B&W photo strip (16:9 on mobile, 21:9 on `md+`) above or beside the H1 "Conocimiento técnico…" intro. Single image, eager-loaded since it's the page's LCP.
- **Stage section dividers**: each lifecycle stage group (Planificación / Construcción / Mantenimiento) gets a small horizontal photo banner (4:1 ratio, ~120px tall) above the stage heading. Reuses the 3 existing `stage-*.jpg` assets — **zero new bytes** for repeat visitors.
- **Cards**: keep typographic. Adding photos to every card would inflate weight and clutter the scan pattern. Instead, add a small B&W resource-type icon-photo per card *only* if scrollable list grows beyond ~6 items (out of scope for now).

### 2. `/conocimiento/:slug` (JourneyGuidePage → JourneyTemplate)
Currently: all-text article layout. Reads like a PDF.
- **Hero photo** at the top of the main `Card` (above the H1), 21:9 desktop / 16:9 mobile. Image chosen by the journey's `stageSlug` — reuses `stage-planning.jpg` / `stage-construction.jpg` / `stage-maintenance.jpg`. **Zero new assets.**
- **"Empresas relacionadas" section**: add a small circular B&W avatar (`intent-hands.jpg` cropped) next to the section header. Subtle warmth, ~48px.
- **Sticky-ish CTA strip ("Ver proveedores filtrados" / "Iniciar solicitud guiada")**: optionally back with a faint B&W photo at low opacity (15-20%) so the orange CTAs pop. Skip if it muddies legibility — A/B in dev.

### 3. New asset (1 only)
Generate **one** new wide B&W photo for the `/conocimiento` index hero — something like *"Dominican architect and contractor reviewing blueprints together at a worksite table, B&W documentary"*. ~40-60KB AVIF. Everything else reuses the 5 photos already committed.

**Total new payload: ~50KB.** Stage banners + per-guide hero are cache-shared with the homepage `StageExplainerSection`, so a user landing on `/conocimiento` after the homepage pays zero extra bytes for them.

## Implementation

### Stage → photo mapping helper
Add a tiny `getStagePhoto(stageSlug)` to `src/lib/customer-journeys.ts` (or a new `src/lib/journey-photos.ts`) that returns the right imported asset for `planificacion` / `construccion` / `mantenimiento`. Single source of truth, used by both the index and detail pages.

### Files touched
- `src/assets/photos/conocimiento-hero.jpg` — 1 new asset (generated via Nano Banana Pro)
- `src/lib/journey-photos.ts` — new helper mapping stage slug → asset
- `src/pages/JourneyGuidesPage.tsx` — hero band + per-stage banner
- `src/components/journeys/JourneyTemplate.tsx` — hero photo at top of main Card, optional avatar in related-providers section
- Reuses existing `HumanPhoto` component as-is (no changes)

### Performance guardrails (same as homepage)
- All images below the fold get `loading="lazy"` + `decoding="async"` (already the `HumanPhoto` default).
- The `/conocimiento` hero gets `priority` so it's the LCP element.
- Per-stage banners use `aspect-ratio` containers — no CLS.
- Reused assets hit the browser cache from prior homepage visits.

## Out of scope
- Photos inside individual journey card grids (would clutter scan pattern + bloat weight).
- New per-resource-type photography (articulo / guia / conocimiento).
- Generating photos for every stage variant — three is enough.
- Animations or parallax on hero photos.

## Validation
- `npm run lint` and `npm run build`.
- Manual: throttle to "Slow 3G", load `/conocimiento` cold, confirm hero paints first and stage banners load on scroll. LCP <2.5s, CLS <0.05.
- Visual at 390px and 1280px: page should now feel like a magazine archive, not a list.
