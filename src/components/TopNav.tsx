import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const TopNavAuthActions = lazy(() => import("@/components/TopNavAuthActions"));

const TopNav = () => {
  const [showAuthActions, setShowAuthActions] = useState(false);

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

  const desktopFallback = (
    <>
      <Link to="/auth">
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          Iniciar sesion
        </Button>
      </Link>
    </>
  );

  const mobileFallback = (
    <>
      <Link to="/auth">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <LogIn className="h-3.5 w-3.5" />
          Entrar
        </Button>
      </Link>
    </>
  );

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-black tracking-tight text-foreground">
          ObrasRD
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/buscar" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Buscar
          </Link>
          <Link to="/materiales" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Materiales
          </Link>
          <Link to="/proyectos" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Proyectos
          </Link>
          <Link to="/publicar" className="text-sm font-semibold text-foreground bg-accent px-3 py-1.5 rounded-lg hover:brightness-95 transition-all">
            Publicar
          </Link>
          <Link to="/precios" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </Link>
          <Suspense fallback={desktopFallback}>
            {showAuthActions ? <TopNavAuthActions /> : desktopFallback}
          </Suspense>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Suspense fallback={mobileFallback}>
            {showAuthActions ? <TopNavAuthActions mobile /> : mobileFallback}
          </Suspense>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
