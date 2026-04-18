

## Design System Refinements — Inspired by the Mockup

The mockup uses a **navy + orange + emerald + blue** four-color system with iconography, photo-driven hero, and chip-style category shortcuts. Our current site is **pure B&W + orange accent**. We should NOT adopt their color palette (it would dilute our minimalist edge), but we CAN borrow specific structural ideas that strengthen hierarchy without adding visual noise.

### What to keep (do NOT change)
- Pure black/white + single orange accent
- Bold black typography, no serifs
- Flat borders, no gradients, no decorative blue/green
- Mobile-first density

### Targeted improvements

**1. Hero — add a contextual photo band (not full bleed)**
The mockup's strongest move is pairing bold copy with a real construction photo. Our current hero is a flat black slab, which feels generic.
- Keep the black background and bold headline LEFT
- Add a single high-contrast B&W (desaturated) construction photo on the RIGHT half (desktop) / behind the value-props (mobile), with a hard left-edge cutoff — no gradient blend
- Photo is grayscale with low opacity overlay so the orange CTA still pops
- Result: visual proof without breaking the monochrome system

**2. Category shortcuts — promote to icon chips**
Current shortcuts are plain text rectangles. The mockup uses small icons that aid scannability for low-literacy / fast-scan users (key in DR market).
- Add a single Lucide icon (16px, stroke-only, currentColor) next to each shortcut name
- Map: Arquitectura→Compass, Ingenieria→HardHat, Construccion→Hammer, Supervision→ClipboardCheck, Instalaciones→Plug, Mantenimiento→Wrench, Seguridad→ShieldCheck, Materiales→Package
- Keeps minimalism (line icons, no fills, no color)

**3. Inline search bar in hero**
The mockup's hero search is its single strongest UX signal. We currently force users to a CTA → directory. Add a compact inline search (input + submit) below the hero CTAs that posts to `/directorio?q=...`. Keep it monochrome: black border, orange submit button.

**4. Section headers — add subtle divider rule**
Mockup uses an underline accent under section titles ("EMPRESAS DESTACADAS"). We can adapt this minimally:
- Add a 24px wide, 2px tall orange accent bar UNDER the eyebrow label on each section
- One token, applied via existing `.label-upper` companion class — zero color additions

**5. Design tokens to add (index.css)**
- `--accent-bar`: `2px` height divider utility class `.section-accent-bar`
- Tighten section vertical rhythm: standardize `py-12 md:py-16` (currently inconsistent: `py-10`, `pb-10`, `py-12`)
- Add `--radius-sm: 0.375rem` for the chip elements (slightly tighter than card radius)

**6. Provider card — small density win**
Current cards stack a lot of metadata badges. Mockup shows clean "name + trade + city" cards. We don't want to lose trust signals, but we can:
- Move `% perfil completo` into the trust badge row (not its own boxed stat) — frees vertical space
- Keep `Proyectos` boxed (it's the strongest proof signal)

### What we explicitly reject from the mockup
- Navy/blue/green palette — breaks brand
- 3-column colored "info card" block (Buscar / Promocionar / Conocimiento) — we already have `IntentEntryCard` and a cleaner stage explainer
- Heavy header with utility nav row — our top nav is intentionally minimal
- Decorative isometric line illustrations — visual noise

### Files to change
- `src/index.css` — add `.section-accent-bar` utility, optional `--radius-sm` token
- `src/pages/Index.tsx` — hero photo split, inline search, section accent bars, icon chips for shortcuts
- `src/components/ProviderCard.tsx` — move profile-completeness into trust row
- New asset: `public/hero-construction-bw.jpg` (one desaturated construction photo, ~80KB)

### Out of scope
- No new colors in the palette
- No changes to TopNav, footer structure, or routes
- No icon library swap (continue using lucide-react which is already installed)

