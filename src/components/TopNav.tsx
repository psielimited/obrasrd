import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, LogIn, Menu, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const TopNavAuthActions = lazy(() => import("@/components/TopNavAuthActions"));

const TopNav = () => {
  const [showAuthActions, setShowAuthActions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const windowWithIdle = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let timeoutId: number | undefined;
    let idleId: number | undefined;

    const revealAuthControls = () => setShowAuthActions(true);

    if (windowWithIdle.requestIdleCallback) {
      idleId = windowWithIdle.requestIdleCallback(revealAuthControls, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(revealAuthControls, 500);
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined && windowWithIdle.cancelIdleCallback) {
        windowWithIdle.cancelIdleCallback(idleId);
      }
    };
  }, []);

  const mobileNavItems = [
    { to: "/buscar", label: "Buscar" },
    { to: "/materiales", label: "Materiales", badge: "Nuevo" },
    { to: "/proyectos", label: "Proyectos" },
    { to: "/precios", label: "Precios" },
  ];

  const desktopFallback = (
    <Link to="/auth">
      <Button variant="outline" size="sm" className="gap-2">
        <LogIn className="h-4 w-4" />
        Iniciar sesion
      </Button>
    </Link>
  );

  const mobileFallback = (
    <Link to="/auth">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
        <LogIn className="h-3.5 w-3.5" />
        Entrar
      </Button>
    </Link>
  );

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex h-[60px] items-center px-3 text-[13px] font-medium transition-colors ${
      isActive
        ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-t after:bg-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto flex h-[60px] max-w-5xl items-center justify-between px-3 md:px-4">
        <Link to="/" className="text-[22px] font-black tracking-tight text-foreground">
          Obras<span className="text-accent">RD</span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          <NavLink to="/buscar" className={desktopLinkClass}>
            Buscar
          </NavLink>
          <NavLink to="/materiales" className={desktopLinkClass}>
            Materiales
            <span className="ml-1.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-foreground">
              Nuevo
            </span>
          </NavLink>
          <NavLink to="/proyectos" className={desktopLinkClass}>
            Proyectos
          </NavLink>
          <NavLink to="/precios" className={desktopLinkClass}>
            Precios
          </NavLink>

          <Link to="/publicar" className="ml-2">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Publicar
            </Button>
          </Link>

          <div className="ml-2">
            <Suspense fallback={desktopFallback}>
              {showAuthActions ? <TopNavAuthActions /> : desktopFallback}
            </Suspense>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Suspense fallback={mobileFallback}>
            {showAuthActions ? <TopNavAuthActions mobile /> : mobileFallback}
          </Suspense>

          <Link to="/notificaciones">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 bg-background">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Link
                to="/"
                className="text-[20px] font-black tracking-tight"
                onClick={() => setMobileMenuOpen(false)}
              >
                Obras<span className="text-accent">RD</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-foreground">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto flex gap-2 border-t border-border p-4">
              <Link to="/publicar" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Publicar servicio
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default TopNav;
