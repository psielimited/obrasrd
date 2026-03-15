import { Link } from "react-router-dom";

const TopNav = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-black tracking-tight text-foreground">
          OBRA
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
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
