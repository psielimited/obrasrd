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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 border-r border-slate-800 bg-slate-950 z-30">
        <div className="w-full p-5 flex flex-col">
          <Link to="/dashboard/cliente" className="inline-flex items-center gap-2 text-slate-100 mb-7">
            <div className="h-9 w-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">ObrasRD</p>
              <p className="text-xs text-slate-400 mt-1">Panel de cliente</p>
            </div>
          </Link>

          <SidebarNav items={navItems} />

          <div className="mt-auto pt-6 text-xs text-slate-500">
            Compara opciones y organiza tus solicitudes de cotizacion.
          </div>
        </div>
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs p-0 bg-slate-950 border-r border-slate-800">
          <div className="p-5">
            <Link to="/dashboard/cliente" className="inline-flex items-center gap-2 text-slate-100 mb-6" onClick={() => setSidebarOpen(false)}>
              <div className="h-9 w-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">ObrasRD</p>
                <p className="text-xs text-slate-400 mt-1">Panel de cliente</p>
              </div>
            </Link>
            <SidebarNav items={navItems} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
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
