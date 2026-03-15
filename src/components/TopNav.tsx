import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";

const TopNav = () => {
  const [user, setUser] = useState<SupaUser | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {user.email?.split("@")[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleGoogleSignIn} className="gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Button>
          )}
        </nav>

        {/* Mobile sign-in button */}
        <div className="md:hidden">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleGoogleSignIn} className="gap-1.5 text-xs">
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
