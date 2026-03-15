import { Link } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  identity: string;
  unreadCount: number;
  actionLabel: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  onOpenSidebar: () => void;
}

const DashboardHeader = ({
  title,
  subtitle,
  identity,
  unreadCount,
  actionLabel,
  onAction,
  actionDisabled,
  onOpenSidebar,
}: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 border-b border-slate-800/80">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-200 hover:bg-slate-800" onClick={onOpenSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            </div>
          </div>

          <Button variant="accent" onClick={onAction} disabled={actionDisabled}>
            {actionLabel}
          </Button>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Buscar leads, categorias o acciones..."
              className="pl-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <Link to="/notificaciones" className="relative inline-flex">
              <Button variant="outline" size="icon" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                <Bell className="h-4 w-4" />
              </Button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground inline-flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="text-right px-2">
              <p className="text-xs text-slate-500">Proveedor</p>
              <p className="text-sm font-semibold text-slate-100 truncate max-w-40">{identity}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
