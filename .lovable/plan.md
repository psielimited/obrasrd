

## Fix: UI Not Loading Due to Missing ThemeProvider for Sonner

### Root Cause

`src/components/ui/sonner.tsx` calls `useTheme()` from `next-themes`, but the app has **no `ThemeProvider`** wrapper. When React lazy-loads and renders the `Sonner` component, `useTheme()` fails because there's no context provider above it. This crashes the `Suspense` boundary silently, potentially cascading into a blank screen.

### Fix (1 file)

**`src/components/ui/sonner.tsx`** — Remove the `next-themes` dependency entirely. Hardcode the theme to `"light"` (the app has no dark mode toggle) instead of relying on a missing provider:

```tsx
// Remove: import { useTheme } from "next-themes";
// Replace useTheme() call with a static "light" value

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      // ... rest stays the same
    />
  );
};
```

This is a one-line effective change. No visual or behavioral difference since the app already uses light mode exclusively.

