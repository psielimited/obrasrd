

## Goal
Bring the same B&W human-photography treatment to `/fase/:slug` and align its numbering with the homepage's lifecycle stages (01 Planificación / 02 Construcción / 03 Mantenimiento) instead of the detailed phase number (01–06).

## Investigation summary
Two parallel taxonomies exist today:
- **Homepage stages** (`StageExplainerSection`, `/conocimiento`): 3 lifecycle stages — `planificacion` / `construccion` / `mantenimiento`, numbered 01–03.
- **`/fase/:slug` detailed phases** (`PHASES` data + `phases` table): 6 phases — `pre-construccion` (id 1) … `trabajo-final` (id 6).

Currently `/fase/:slug` shows the detailed phase id (01–06), which is inconsistent with the homepage. The page is also pure typography — no human warmth.

We need a mapping from each detailed phase → its parent lifecycle stage so we can show the right number, the right photo, and the right alt text.

## Mapping (detailed phase → lifecycle stage)
| Detailed phase (slug, id)         | Lifecycle stage    | Number |
| --------------------------------- | ------------------ | ------ |
| `pre-construccion` (1)            | `planificacion`    | 01     |
| `preparacion-cimentacion` (2)     | `construccion`     | 02     |
| `construccion-estructural` (3)    | `construccion`     | 02     |
| `instalacion-sistemas` (4)        | `construccion`     | 02     |
| `acabados-interiores` (5)         | `construccion`     | 02     |
| `trabajo-final` (6)               | `mantenimiento`    | 03     |

Phases 2–5 all roll up to "Construcción" — that's expected; the lifecycle is intentionally coarser than the operational breakdown.

## Implementation

### 1. Mapping helper
Extend `src/lib/journey-photos.ts` (or create `src/lib/phase-stage-mapping.ts` — leaning toward the latter for separation of concerns) with:
- `getLifecycleStageForPhase(phaseSlug: string): { stageSlug: CanonicalStageSlug; stageNumber: "01" | "02" | "03"; stageLabel: string }` 
- A constant `PHASE_TO_STAGE_MAP` covering the 6 known slugs, with a fallback to `planificacion` for unknown slugs (defensive, since `phases` may eventually be DB-driven).

This keeps `journey-photos.ts` focused on stage→photo and adds a new file for phase→stage. The new file imports `getStagePhoto`/`getStagePhotoAlt` so `PhasePage` only imports one helper.

### 2. `PhasePage.tsx` updates
- Replace the current `String(phase.id).padStart(2, "0")` numbering with the lifecycle `stageNumber` from the mapping.
- Add a tiny eyebrow label above the H1: `Etapa 0X · {stageLabel}` (small uppercase, muted) so the user understands the rollup. The detailed phase name (`phase.name`) stays as the H1 — no info loss.
- Add a `HumanPhoto` hero band immediately under the "Volver" button:
  - `aspect="21/9"` on `md+`, `16/9` on mobile (handled via Tailwind responsive class on the wrapper or two `HumanPhoto` instances; preferred: one `HumanPhoto` with `aspect="16/9"` on mobile and use a CSS `md:aspect-[21/9]` override via `imgClassName`/wrapper class — simpler to just use `16/9` everywhere for consistency with `/conocimiento` index, decision below).
  - **Decision:** Use `aspect="16/9"` (matches `/conocimiento` hero treatment, single source of truth, simpler). Width is constrained by `max-w-5xl` container so it stays cinematic on desktop.
  - `priority={true}` — this is the page's LCP element.
  - `src` and `alt` from the lifecycle stage mapping (reuses cached `stage-*.jpg` from homepage / `/conocimiento`, **zero new bytes** for repeat visitors).
- Optional small touch: add `RELATED_PROVIDERS_AVATAR` (the `intent-hands.jpg` circular avatar already used in `JourneyTemplate`) next to the "Proveedores en esta fase (N)" header for visual consistency with guide pages. Keeps the "human ecosystem" feel across all public surfaces.

### 3. No new assets
All photography reuses existing `stage-planning.jpg`, `stage-construction.jpg`, `stage-maintenance.jpg`, and `intent-hands.jpg` — already imported by the homepage and `/conocimiento`. **Zero new payload.**

## Files touched
- `src/lib/phase-stage-mapping.ts` — **new**, small mapping helper
- `src/pages/PhasePage.tsx` — numbering swap, hero photo, eyebrow label, optional avatar in providers section

## Out of scope
- Editing the underlying `PHASES` data or DB schema (numbering is purely a display concern).
- Changing the homepage `StageExplainerSection` link resolution (it currently falls back to `/directorio?categoria=...` because lifecycle slugs aren't valid `/fase` slugs — that behavior stays as-is).
- New per-phase photography or unique imagery for phases 2–5 (all share the construccion photo by design).
- Refactoring 6 phases into 3 lifecycle pages (explicitly rejected option).

## Validation
- `npm run lint` and `npm run build`.
- Manual: visit `/fase/pre-construccion` → header reads "Etapa 01 · Planificación", hero shows planning photo. Visit `/fase/preparacion-cimentacion`, `/fase/construccion-estructural`, `/fase/instalacion-sistemas`, `/fase/acabados-interiores` → all show "Etapa 02 · Construcción" + construccion photo. Visit `/fase/trabajo-final` → "Etapa 03 · Mantenimiento" + maintenance photo.
- Performance: throttle to Slow 3G, confirm hero paints quickly (cached if visitor came from homepage), no CLS.
- Visual at 390px and 1280px: page should now feel coherent with homepage and `/conocimiento`.

