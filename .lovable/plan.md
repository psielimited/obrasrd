
## Issue
The "Años de experiencia" field on the provider profile editor (`/dashboard/proveedor/perfil`) is a native `<input type="number">`. When a user types or pastes "010", the displayed value keeps the leading zero(s). The underlying state is already a `Number`, but because the input is uncontrolled-on-display (the raw text is preserved by the browser until blur in some cases) and there's no normalization, users see "010", "02", etc.

## Fix
In `src/pages/ProviderProfileEditorPage.tsx` (lines 519–528), normalize the displayed value so it always reflects a clean integer starting from 0, 1, 2, …

Changes:
1. **Coerce the displayed value** to a plain integer string. Since `yearsExperience` is already a number in state, bind `value={String(yearsExperience)}` — this strips any leading zeros on every render.
2. **Sanitize input on change**: parse the input, clamp to `>= 0`, fall back to `0` for empty/NaN. Use `Number.parseInt(..., 10)` so "010" becomes `10`.
3. **Add `inputMode="numeric"`** and **`max={80}`** for a sensible upper bound and better mobile keyboard.
4. **Block leading-zero entry** by re-setting state to the parsed integer immediately, so the field re-renders as "10" (not "010") even mid-typing.

### Code change (single block, lines 519–528)

```tsx
<div className="space-y-2">
  <Label htmlFor="years">Años de experiencia</Label>
  <Input
    id="years"
    type="number"
    inputMode="numeric"
    min={0}
    max={80}
    step={1}
    value={String(yearsExperience)}
    onChange={(event) => {
      const raw = event.target.value;
      if (raw === "") {
        setYearsExperience(0);
        return;
      }
      const parsed = Number.parseInt(raw, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setYearsExperience(0);
        return;
      }
      setYearsExperience(Math.min(parsed, 80));
    }}
  />
</div>
```

Result: typing "0" → shows "0"; typing "010" → immediately renders "10"; arrows step 0,1,2,3…; empty resets to 0.

## Out of scope
- No schema changes (column already `years_experience integer`).
- No analytics changes.
- No other inputs on the page touched.

## Validation
- `npm run lint` and `npm run build`.
- Manual: open `/dashboard/proveedor/perfil` on mobile width, type "0", "5", "010", clear field — confirm display is always a clean integer with no leading zeros, and Save persists correctly.
