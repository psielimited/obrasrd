
Do I know what the issue is? Yes.

## Diagnosis

The blank page is most likely caused by the custom production chunking in `vite.config.ts`, not by the hero copy or route code.

### Why this matches the error
- The production error points into `vendor-radix-*.js`.
- That chunk contains Radix-based UI wrappers, many of which call `React.forwardRef(...)`.
- In this repo, `vite.config.ts` manually forces:
  - `react` into `vendor-react`
  - all `@radix-ui/*` into `vendor-radix`
- That split is the most suspicious production-only difference, and it can break module interop/order so the React namespace inside the Radix chunk becomes `undefined`, which matches:
  - `Cannot read properties of undefined (reading 'forwardRef')`

## Minimal safe fix

### 1) Remove the custom `manualChunks` override in `vite.config.ts`
Let Vite/Rollup generate the chunk graph automatically.

This is the safest fix because:
- it does not change UI or behavior
- it only changes how the app is bundled
- it directly targets the production-only failure path

### 2) Rebuild and verify production entry loads
After removing the manual chunking:
- confirm the homepage renders
- confirm no `forwardRef` runtime error remains
- smoke-test mobile nav / dropdown / toast startup since those load Radix UI early

## Files to update
- `vite.config.ts`

## Expected change
From this:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes("node_modules/react-dom")) return "vendor-react";
        if (id.includes("node_modules/react/")) return "vendor-react";
        if (id.includes("node_modules/react-router")) return "vendor-router";
        if (id.includes("node_modules/@tanstack/react-query")) return "vendor-query";
        if (id.includes("node_modules/@radix-ui")) return "vendor-radix";
        if (id.includes("node_modules/lucide-react")) return "vendor-icons";
      },
    },
  },
},
```

To either:
```ts
build: {},
```

or just remove the whole `build.rollupOptions.output.manualChunks` block.

## Why I am not proposing broader changes
I reviewed the app startup path and the Radix wrappers themselves. They look normal. The strongest production-specific fault line is the custom chunk splitting. So the safest fix is to revert that bundling optimization first instead of changing UI components.

## Verification checklist
- Open published homepage: page renders instead of blank screen
- Console no longer shows `forwardRef` error
- Mobile menu opens
- Auth dropdown still opens
- Toast providers mount without crashing

## Technical note
If the issue somehow persists after removing `manualChunks`, the next fallback would be to simplify startup imports for the home route and isolate which Radix wrapper is first in the crash path. But I do not expect that to be necessary—the bundling config is the primary suspect.
