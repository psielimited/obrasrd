import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProviderNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface SidebarNavProps {
  items: ProviderNavItem[];
  onNavigate?: () => void;
}

const isItemActive = (pathname: string, item: ProviderNavItem) => {
  if (item.exact) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
};

const SidebarNav = ({ items, onNavigate }: SidebarNavProps) => {
  const location = useLocation();

  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = isItemActive(location.pathname, item);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-slate-800 text-slate-100 border border-slate-700"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
