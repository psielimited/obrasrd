import { Search, FolderOpen, User, Home, LayoutGrid } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: Search, label: "Buscar", path: "/buscar" },
  { icon: LayoutGrid, label: "Materiales", path: "/materiales" },
  { icon: FolderOpen, label: "Proyectos", path: "/proyectos" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex-1 flex flex-col items-center py-2 gap-0.5 min-h-[56px] transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-foreground" />
              )}
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-semibold"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
