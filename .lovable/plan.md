

## Card v2 Redesign Plan

The uploaded HTML shows a significant visual upgrade: photo-hero layout with gradient scrim overlay, provider name on top of the image, floating category pill and status indicator, star ratings, compact trust chips, and refined action buttons. Here's how to implement it.

### What changes

**1. Rewrite `ProviderCard.tsx`** — New layout structure:
- **Photo hero section** (190px height): Full-bleed portfolio image with dark gradient scrim overlay. Category pill (top-left), active status dot+label (top-right), photo pagination dots (bottom-right), provider name + trade overlaid at bottom.
- **Card body**: Location + star rating row separated by a bottom border. Description text. Compact trust chips (Verificado, Proyecto registrado). Action buttons row (WhatsApp + Ver perfil) with updated styling.
- Hover effect: card lifts with `translateY(-5px)` and shadow deepens; image scales slightly.
- Remove dependency on `MarketplaceVisualFrame` (the branded frame is replaced by the photo-hero approach).

**2. Update button styling** — The WhatsApp button changes from green to dark (`bg-foreground text-background`) with a green status dot indicator. "Ver perfil" gets a cleaner outline style. Both use uppercase tracking.

**3. Trust badges** — Simplify to 2 compact chips inline (verified + registered) instead of the current `TrustBadgeRow`. The "Proveedor activo" badge is absorbed into the status dot on the photo.

**4. Star rating display** — Add a small star rendering helper showing filled/half stars next to the numeric rating, replacing the current simple `Star icon + number` pattern.

### What stays the same
- `Provider` data interface — no changes needed
- `getCategoryTheme` — reuse for category pill color
- Navigation logic (click name → profile, WhatsApp URL generation)
- `SearchPage`, `PhasePage`, and other pages that render `ProviderCard` — no changes needed since props stay the same

### Files modified
- `src/components/ProviderCard.tsx` — full rewrite
- `src/index.css` — add a couple of utility classes if needed (scrim gradient, photo-hero sizing)

### Design token alignment
The HTML uses warm tones (clay, sand, ink). Since the app uses a dark/light theme system with CSS variables, I'll map the new card to existing tokens: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, and use the category theme's `pillClassName` for the category pill. The warm earthy palette from the mockup will be adapted to work within the existing theme system.

