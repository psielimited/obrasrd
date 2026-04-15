

## Rotating Hero Headlines

Add a cycling animation to the hero heading in `HeroSearch.tsx` that rotates through all 5 headline options with a smooth fade transition.

### Headlines to rotate
1. "Contrata con criterio. Construye con confianza."
2. "Tu obra, con profesionales que rinden cuentas."
3. "El equipo correcto para cada etapa de tu obra."
4. "Compara, verifica y contrata en un solo lugar."
5. "Menos improvisación. Más obra bien hecha."

### Implementation

**`src/components/HeroSearch.tsx`**
- Add a `useState` index + `useEffect` interval (every ~4s) to cycle through the array
- Apply a CSS fade transition (opacity + translateY) on heading change using a key-based re-render or a transition class
- Keep the subtitle static: "Arquitectos, ingenieros, contratistas y suplidores verificados en un solo lugar."

**`src/index.css`** (or inline)
- Add a simple `@keyframes fadeInUp` animation applied to the heading on each cycle

No new dependencies. Pure React state + CSS animation. ~20 lines of change.

