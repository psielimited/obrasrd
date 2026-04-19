
## Goal
Add warmth and human presence to ObrasRD by incorporating photography of people working in construction — without sacrificing the fast, mobile-first performance the homepage already has (lazy data loading, minimal JS, slow-3G targets).

## Investigation

Current state of imagery in the app:
- Homepage hero already uses `/hero-construction-bw.jpg` as a B&W background (good — sets a tone but only one human touchpoint).
- Other public surfaces (`StageExplainerSection`, `IntentEntryCard`, `JourneyTemplate`, category shortcuts, "Empresas" CTA, footer) are pure type + icons + cards. Zero human photography.
- `/public` only contains SVG doodles (`hero-doodle-*.svg`) and the one hero JPG. No portrait/action photos.
- Provider cards already render real portfolio images when providers upload them — that's the strongest "human" signal we have, but it's behind data loading and only appears on `/directorio` and provider profiles.
- Per memory: brand is **minimalist B&W with orange accent**, **bold typography**, **mobile-first**, **slow-3G optimized**. Any image strategy must respect this — no full-color stock photo soup.

The "cold" feeling comes from: above-the-fold sections after the hero are entirely typographic, and the only human touchpoint disappears as soon as you scroll past the hero.

## Recommendation: 3-layer image strategy

### Layer 1 — Curated B&W human photography in 3–4 strategic spots
Add real construction-worker imagery (cropped, B&W, low contrast so the orange accent + type stay dominant) to these high-impact, low-traffic-cost surfaces:

1. **`StageExplainerSection`** — one B&W photo per stage card (Planificación / Construcción / Mantenimiento). Small aspect-ratio band at the top of each card (16:9, ~400px wide rendered). Humans at work = instant warmth in the densest typographic section.
2. **"Empresas" CTA section** (`#cta-empresas`) — split layout on `md+`: left = current copy + CTAs, right = single B&W portrait of a contratista. Reinforces the "tu negocio" message.
3. **`IntentEntryCard`** (the 3 intent cards on the homepage) — small circular B&W avatar/scene per card (propietario / contratista / suplidor). Tiny, decorative, ~64px.
4. **Footer top band** — optional thin B&W photo strip (people on site) above the link grid. Pure mood, no interaction.

Why B&W: matches the hero treatment, keeps the page visually unified, makes the orange accent pop harder, and B&W JPEGs compress ~30% better than color at equivalent perceived quality.

### Layer 2 — Generate the assets via Nano Banana Pro
We don't have a photo library and stock photos won't reflect Dominican context (clothing, sites, ethnicity, materials). Use `google/gemini-3-pro-image-preview` to generate ~6–8 hero/section images:
- "Dominican construction worker in hard hat reviewing blueprints on site, B&W, documentary style"
- "Contratista smiling at camera in front of unfinished structure, B&W portrait"
- "Three workers pouring concrete, wide shot, B&W, gritty texture"
- "Architect and client looking at plans together, B&W, warm composition"
- etc.

Generate at 1600px wide source, post-process to AVIF + WebP fallbacks via the build pipeline (or just commit pre-optimized files to `/public/photos/`).

### Layer 3 — Performance guardrails (non-negotiable)
This is what keeps it fast:

- **Format**: AVIF (primary) → WebP (fallback) → JPEG (legacy). Use `<picture>` element. AVIF B&W photos at 1600px are typically 30–60KB.
- **Sizing**: Serve responsive sources with `srcset` + `sizes`. Mobile gets ~640px wide max.
- **Lazy-load**: Every photo below the fold gets `loading="lazy"` and `decoding="async"`. The hero photo is the only eager one (and it already is).
- **Aspect-ratio reserved**: Wrap each `<img>` in a CSS `aspect-ratio` container so layout doesn't shift (LCP/CLS protection).
- **Defer in render path**: Reuse the existing `shouldLoadDeferredData` pattern from `Index.tsx` (double-RAF) so non-hero images don't compete with the initial paint. Optionally use `IntersectionObserver` for the deeper sections.
- **No JS image libraries** — plain `<picture>` + native lazy loading only.
- **Total budget**: Add no more than ~150KB total image weight to a cold homepage load (mobile, AVIF). Hero already accounts for the largest single asset.

Estimated impact at 4G: +80–150ms LCP worst case if hero image isn't touched (it isn't). At slow 3G: deferred images don't block first paint at all because they're below the fold and lazy-loaded.

### Layer 4 — Reusable component
Create one small `<HumanPhoto>` component that wraps `<picture>` with the AVIF/WebP/JPEG sources, aspect-ratio container, B&W CSS filter as a safety net (so even if a slightly-off image slips in, it stays on-brand), and lazy defaults. Single source of truth, easy to audit later.

```tsx
<HumanPhoto
  src="/photos/stage-planning"   // resolves to .avif / .webp / .jpg
  alt="Arquitecta revisando planos en obra"
  aspect="16/9"
  priority={false}                // true only for hero
/>
```

## Files touched
- `public/photos/*.avif|.webp|.jpg` — 6–8 generated, optimized assets (new)
- `src/components/ui/HumanPhoto.tsx` — new wrapper component
- `src/components/home/StageExplainerSection.tsx` — add photo band per stage
- `src/components/home/IntentEntryCard.tsx` — add small avatar
- `src/pages/Index.tsx` — photo in `#cta-empresas` split layout + optional footer strip

## Out of scope
- Replacing the existing hero image (works well, stays).
- Color photography anywhere on public surfaces.
- Photos on dashboard/auth/editor screens (functional surfaces, no warmth needed).
- A CMS-managed photo library — defer until we have ≥20 assets.

## Validation
- `npm run lint` and `npm run build`.
- Manual: throttle to "Slow 3G" in DevTools, hard reload `/`, confirm hero paints first and below-fold photos load only on scroll, no layout shift.
- Lighthouse before/after on mobile — LCP should stay <2.5s, CLS <0.05.
- Visual: scroll through homepage on 390px and 1280px and confirm the page now feels human, not just typographic.
