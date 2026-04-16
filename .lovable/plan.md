

## Replace Empty Provider Images with Discipline-Specific Photos

### Problem
All 8 mock providers in `src/data/marketplace.ts` have `portfolioImages: []`, causing the "Sin imagen disponible" placeholder to show on every card.

### Solution
Populate each provider's `portfolioImages` array with 1-2 high-quality Unsplash photos that match their trade. Unsplash provides free, royalty-free images via direct URL.

### Image Mapping

| Provider | Trade | Image Subject |
|----------|-------|---------------|
| p1 - Arq. María González | Arquitecto Residencial | Architectural blueprints / modern house design |
| p2 - Ing. Carlos Pérez | Ingeniero Estructural | Building structure / concrete framework |
| p3 - José Martínez | Contratista General | Construction site / villa under construction |
| p4 - ElectriPro RD | Electricista | Electrical panel / wiring work |
| p5 - Plomería Dominicana | Plomero | Plumbing pipes / installation |
| p6 - Pinturas del Caribe | Pintor | Interior painting / color wall |
| p7 - Excavaciones del Norte | Excavación | Excavator / earthwork site |
| p8 - Solar Tech RD | Paneles Solares | Solar panel installation on roof |

### Changes

**`src/data/marketplace.ts`** — Update each provider's `portfolioImages` array with 1-2 curated Unsplash URLs using the `?w=800&q=80` params for optimized loading. No other files change.

### Visual fit
- The `ProofFirstCard` component already renders `portfolioImages[0]` as cover with `object-cover` — these landscape construction photos will fill the 176px hero area cleanly
- Matches the B&W + orange accent brand since the images are neutral construction photography

