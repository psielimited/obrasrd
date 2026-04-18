import { lazy, Suspense, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { PRIMARY_PUBLIC_NAV_ITEMS, PUBLIC_ROUTES } from "@/lib/public-ia";

const TopNavAuthActions = lazy(() => import("@/components/TopNavAuthActions"));

const TopNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileNavItems: { to: string; label: string; badge?: string }[] = [
    ...PRIMARY_PUBLIC_NAV_ITEMS,
    { to: PUBLIC_ROUTES.materiales, label: "Materiales y suplidores", badge: "Nuevo" },
  ];

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex h-[60px] items-center px-3 text-[13px] font-medium transition-colors ${
      isActive
        ? "text-foreground font-semibold after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-t after:bg-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const trackRegisterCompanyClick = (source: "top_nav" | "mobile_nav") => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.RegisterCompanyCtaClicked, {
      source,
      target_href: PUBLIC_ROUTES.empresas,
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto flex h-[60px] max-w-5xl items-center justify-between px-3 md:px-4">
        <Link to={PUBLIC_ROUTES.home} className="text-[22px] font-black tracking-tight text-foreground">
          Obras<span className="text-accent">RD</span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {PRIMARY_PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to={PUBLIC_ROUTES.materiales} className={desktopLinkClass}>
            Materiales
            <span className="ml-1.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-foreground">
              Nuevo
            </span>
          </NavLink>

          <Link to={PUBLIC_ROUTES.empresas} className="ml-2" onClick={() => trackRegisterCompanyClick("top_nav")}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Registrar empresa
            </Button>
          </Link>

          <div className="ml-2">
            <Suspense fallback={<Button variant="outline" size="sm">Cuenta</Button>}>
              <TopNavAuthActions />
            </Suspense>
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Suspense
            fallback={
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                Cuenta
              </Button>
            }
          >
            <TopNavAuthActions mobile />
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
        <SheetContent side="left" className="w-[85vw] max-w-sm bg-background p-0">
          <div className="flex h-full flex-col">
            <div className="flex items-center border-b border-border px-5 py-4">
              <Link
                to={PUBLIC_ROUTES.home}
                className="text-[20px] font-black tracking-tight"
                onClick={() => setMobileMenuOpen(false)}
              >
                Obras<span className="text-accent">RD</span>
              </Link>
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
                        ? "bg-foreground font-semibold text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
              <Link
                to={PUBLIC_ROUTES.empresas}
                className="flex-1"
                onClick={() => {
                  trackRegisterCompanyClick("mobile_nav");
                  setMobileMenuOpen(false);
                }}
              >
                <Button className="w-full" size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  Registrar empresa
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
