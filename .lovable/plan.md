
## Goal
Expand the hero content container to span the full width of the hero section on tablet and desktop (currently capped at `md:max-w-2xl lg:max-w-[58%]`), while keeping content readable and visually balanced against the background image on the right.

## Current state (src/pages/Index.tsx, line 165)
```tsx
<div className="md:max-w-2xl lg:max-w-[58%]">
```
The hero text column sits on the left half, with a B&W construction image filling the right half (`md:block` background image at `right-0 w-1/2 lg:w-[55%]`). Expanding the text container to 100% will collide with that background image and crowd the chips/feature grid.

## Plan

### 1. Expand container width (line 165)
Remove the max-width caps so the content uses the full hero width:
```tsx
<div className="w-full">
```

### 2. Rebalance background image so it doesn't fight the text
With text now full-width, the right-side image needs to recede. Reduce its opacity and let the left gradient cover more of the hero so text remains legible:
- Image opacity: `opacity-40` → `opacity-20`
- Left gradient: `w-2/3` → `w-full` with softer stops, so the image becomes a subtle texture behind the whole hero rather than a hard right-half block.

### 3. Reorganize inner elements into a 2-column layout on md+
To "blend well with the hero space" at full width, restructure the inner content so it doesn't stretch into one long line:

- **Top block (full width)**: eyebrow label, H1, subtitle, search form, secondary links — capped at `md:max-w-3xl` for readability (text lines >75ch hurt scannability).
- **Bottom block (feature chips grid)**: expand to a true 3-column grid on `md:grid-cols-3` filling the full width, instead of the current `sm:grid-cols-2 lg:grid-cols-3` that left awkward gaps.

```text
+----------------------------------------------------+
| eyebrow                                            |
| H1 (max 3xl)                                       |
| subtitle (max 3xl)                                 |
| [search form] (max-xl)                             |
| links row                                          |
|                                                    |
| [chip 1]      [chip 2]      [chip 3]               |  <- 3 cols full-width
+----------------------------------------------------+
```

### 4. Feature chips grid (lines 219–232)
- Change wrapper from `sm:grid-cols-2 lg:grid-cols-3` to `md:grid-cols-3`.
- Remove the `sm:col-span-2 lg:col-span-1` override on the third chip (no longer needed).
- Slightly increase padding (`px-4 py-3`) so chips feel proportionate at full width.

### 5. Wrap top block for readability
Wrap the eyebrow → links section in a `<div className="md:max-w-3xl">` so headlines and prose don't stretch edge-to-edge while the chips below still span full width.

## Files touched
- `src/pages/Index.tsx` — hero `<section>` only (lines ~157–235). No other sections, no new components, no analytics changes.

## Out of scope
- Mobile layout (already vertical full-width; unchanged).
- Background image asset itself.
- Any other homepage section.

## Validation
- `npm run lint` and `npm run build`.
- Visual check at 1280px, 1024px (tablet), 768px (tablet portrait), and 390px (mobile) to confirm:
  - Text remains legible over the background.
  - Chips form a clean 3-column row on md+.
  - Mobile is unchanged.
