

## Problem

On mobile (390px), the "Cerrar sesion" button is buried — it's a small icon-only button in the top nav that's easy to miss, and also placed inline with "Guardar cambios" at the bottom of the profile form. Neither placement is intuitive.

## Proposal: User Menu Dropdown

Replace the scattered auth actions in the mobile top nav with a single **avatar/user button** that opens a **DropdownMenu** containing all account actions. On desktop, consolidate the same way.

### Changes

**`TopNavAuthActions.tsx`** — For authenticated users:
- Replace the row of icon buttons (bell, user, logout) with a single trigger button (user icon or avatar initial) that opens a `DropdownMenu`
- Menu items: "Mi perfil", "Dashboard" (if applicable), "Notificaciones" (with unread badge), separator, "Cerrar sesion" in destructive red
- Keeps the existing login button for unauthenticated users unchanged

**`TopNav.tsx`** — No structural changes needed; it already renders `TopNavAuthActions`

### Benefits
- "Cerrar sesion" gets a clear, labeled menu item instead of a tiny icon
- Reduces top nav clutter on mobile (3 icons → 1)
- Follows standard mobile UX patterns (avatar dropdown)
- Notification badge moves onto the dropdown trigger or inside the menu
- Desktop also benefits from a cleaner nav (fewer inline links, one dropdown)

### Technical details
- Uses existing `DropdownMenu` component from `src/components/ui/dropdown-menu.tsx`
- Uses `useNavigate` for menu item navigation
- Desktop: trigger shows user name + chevron; Mobile: trigger is a compact avatar circle
- No new dependencies needed

