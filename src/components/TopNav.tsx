import { lazy, Suspense, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Plus } from "lucide-react";

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
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-[#E3DDD4] bg-transparent px-3">
          <LogIn className="h-4 w-4" />
          Iniciar sesion
        </Button>
      </Link>
    </>
  );

  const mobileFallback = (
    <>
      <Link to="/auth">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-[#E3DDD4] bg-transparent px-2.5 text-xs">
          <LogIn className="h-3.5 w-3.5" />
          Entrar
        </Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3DDD4] bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-[60px] max-w-5xl items-center justify-between px-3 md:px-4">
        <Link to="/" className="text-[22px] font-black tracking-tight text-[#1A1612]">
          Obras<span className="text-[#C4773B]">RD</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/buscar"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                isActive ? "text-[#1A1612] bg-[#F5F0E8]" : "text-[#7A6E64] hover:bg-[#F5F0E8] hover:text-[#1A1612]"
              }`
            }
          >
            Buscar
          </NavLink>
          <NavLink
            to="/materiales"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                isActive ? "text-[#1A1612] bg-[#F5F0E8]" : "text-[#7A6E64] hover:bg-[#F5F0E8] hover:text-[#1A1612]"
              }`
            }
          >
            Materiales
          </NavLink>
          <NavLink
            to="/proyectos"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                isActive ? "text-[#1A1612] bg-[#F5F0E8]" : "text-[#7A6E64] hover:bg-[#F5F0E8] hover:text-[#1A1612]"
              }`
            }
          >
            Proyectos
          </NavLink>
          <NavLink
            to="/precios"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                isActive ? "text-[#1A1612] bg-[#F5F0E8]" : "text-[#7A6E64] hover:bg-[#F5F0E8] hover:text-[#1A1612]"
              }`
            }
          >
            Precios
          </NavLink>
          <Link to="/publicar">
            <Button
              size="sm"
              className="ml-1 h-9 rounded-lg border border-[#C4773B]/85 bg-[#C4773B] px-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#9E5A24]"
            >
              <Plus className="h-3.5 w-3.5" />
              Publicar
            </Button>
          </Link>
          <Suspense fallback={desktopFallback}>
            {showAuthActions ? <TopNavAuthActions /> : desktopFallback}
          </Suspense>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/publicar">
            <Button
              size="sm"
              className="h-9 rounded-lg border border-[#C4773B]/85 bg-[#C4773B] px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#9E5A24]"
            >
              <Plus className="h-3.5 w-3.5" />
              Publicar
            </Button>
          </Link>
          <Suspense fallback={mobileFallback}>
            {showAuthActions ? <TopNavAuthActions mobile /> : mobileFallback}
          </Suspense>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
