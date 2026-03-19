import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  FilePlus2,
  Heart,
  LayoutDashboard,
  Scale,
  Search,
  Settings,
  ClipboardList,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SidebarNav, { type ProviderNavItem } from "@/components/dashboard/SidebarNav";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useUnreadNotificationCount } from "@/hooks/use-notifications-data";

interface ConsumerDashboardLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionLabel?: "Guardar cambios" | "Acciones";
  onAction?: () => void;
  actionDisabled?: boolean;
}

const ConsumerDashboardLayout = ({
  title,
  subtitle,
  children,
  actionLabel = "Acciones",
  onAction,
  actionDisabled,
}: ConsumerDashboardLayoutProps) => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const identity = profile?.displayName || "Cuenta cliente";

  const navItems: ProviderNavItem[] = [
    { label: "Resumen", to: "/dashboard/cliente", icon: LayoutDashboard, exact: true },
    { label: "Mis solicitudes", to: "/dashboard/cliente/solicitudes", icon: ClipboardList },
    { label: "Proveedores guardados", to: "/dashboard/cliente/guardados", icon: Heart },
    { label: "Comparar proveedores", to: "/dashboard/cliente/comparar", icon: Scale },
    { label: "Notificaciones", to: "/notificaciones", icon: Bell },
    { label: "Publicar servicio", to: "/publicar", icon: FilePlus2 },
    { label: "Marketplace", to: "/buscar", icon: Search },
    { label: "Ajustes / Cuenta", to: "/perfil", icon: Settings },
  ];

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    navigate("/dashboard/cliente/solicitudes");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 border-r border-border bg-background z-30">
        <div className="w-full p-5 flex flex-col">
          <Link to="/dashboard/cliente" className="inline-flex items-center gap-2.5 mb-7">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-background" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight leading-none">
                Obras<span className="text-accent">RD</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Panel de cliente</p>
            </div>
          </Link>

          <SidebarNav items={navItems} />

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            Compara opciones y organiza tus solicitudes de cotizacion.
          </div>
          <div className="mt-3 flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
            <div className="h-7 w-7 rounded-md bg-foreground text-background text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {identity.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none truncate">{identity}</p>
            </div>
          </div>
        </div>
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs p-0 bg-background border-r border-border">
          <div className="p-5">
            <Link to="/dashboard/cliente" className="inline-flex items-center gap-2.5 mb-7" onClick={() => setSidebarOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-background" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight leading-none">
                  Obras<span className="text-accent">RD</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Panel de cliente</p>
              </div>
            </Link>
            <SidebarNav items={navItems} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-60">
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          identity={identity}
          unreadCount={unreadCount}
          actionLabel={actionLabel}
          onAction={handleAction}
          actionDisabled={actionDisabled}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default ConsumerDashboardLayout;
