import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";

const TopNav = () => {
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
          <Link to="/perfil" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Mi cuenta
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar sesion
            </Button>
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link to="/perfil">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
