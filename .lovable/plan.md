

## Monochromatic Redesign: TopNav + HeroSearch

The current design leans warm/earthy (clay orange `#C4773B`, sand tones, brown borders). You want a modern black/white minimalist direction with one accent color. Here's the recommendation and plan.

### Design Direction

**Palette**: Pure black (`#000`) and white (`#fff`) with grays (`#111`, `#333`, `#666`, `#999`, `#e5e5e5`, `#f5f5f5`). One accent: keep a refined version of the brand orange but use it sparingly -- only for the "RD" in the logo, active states, and primary CTAs. Everything else is monochrome.

**Typography**: Bold, high-contrast. Larger heading weight. Uppercase tracking on labels. Clean sans-serif (already using system-ui).

**Aesthetic references**: Think Stripe, Linear, Vercel -- stark contrast, generous whitespace, confident type hierarchy.

### Changes

**1. TopNav (`TopNav.tsx` + `TopNavAuthActions.tsx`)**
- Background: solid white with a thin `border-b border-black/8` (no warm sand tones)
- Logo: "Obras" in black, "RD" in accent orange -- stays
- Nav links: black text, no background hover -- just underline active indicator in black (not orange)
- "Publicar" button: solid black bg, white text, no orange
- Auth buttons: black outline, black text
- Mobile: same black/white treatment
- Remove all `#E3DDD4`, `#F5F0E8`, `#7A6E64`, `#C4773B` from nav (except logo "RD")

**2. HeroSearch (`HeroSearch.tsx`)**
- Background: solid black (`bg-black`) instead of the warm brown `#1A1612`
- Remove the background photo entirely for a cleaner look -- or keep it with a much heavier black overlay and grayscale filter for texture
- Category pills: white border/text on black, active pill = solid white with black text
- Heading: pure white, accent word "obra." in the single accent color
- Subheading: white/50 opacity
- Search bar: white bar on black, search button = solid black with white text
- CTA buttons: primary = solid white text on black border (or accent), secondary = white outline on black
- Stats bar at bottom: black bg with white/60 text, same layout
- Remove the redundant logo + avatar from hero top (TopNav already handles this)
- Remove "Republica Dominicana" decorative line or restyle to white/30

**3. BottomNav (`BottomNav.tsx`)**
- Already uses semantic tokens (`bg-card`, `text-foreground`) so it will mostly follow, but verify no warm colors leak in

**4. CSS Variables (`index.css`)**
- Update `:root` light theme tokens to be more neutral:
  - `--border`: pure black at low opacity instead of warm tone
  - Keep `--accent` as the single brand orange
  - `--muted-foreground`: neutral gray instead of warm gray
- This cascades the monochrome feel to the rest of the app

### Files modified
- `src/components/TopNav.tsx` -- replace all warm hardcoded colors with black/white
- `src/components/TopNavAuthActions.tsx` -- same color cleanup
- `src/components/HeroSearch.tsx` -- full visual overhaul to monochrome
- `src/index.css` -- update CSS custom properties for neutral grays
- `src/components/BottomNav.tsx` -- minor cleanup if needed

### What stays the same
- All routing, navigation logic, search functionality, data fetching
- Component structure and props
- Lazy loading pattern for auth actions
- The accent orange for "RD" logo mark and primary interactive elements

