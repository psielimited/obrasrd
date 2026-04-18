import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SidebarNav, { type ProviderNavItem } from "@/components/dashboard/SidebarNav";
import { useMyProfile, useMyProviderProfile } from "@/hooks/use-profile-data";
import { useUnreadNotificationCount } from "@/hooks/use-notifications-data";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

interface ProviderDashboardLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionLabel?: "Guardar cambios" | "Acciones";
  onAction?: () => void;
  actionDisabled?: boolean;
}

const ProviderDashboardLayout = ({
  title,
  subtitle,
  children,
  actionLabel = "Acciones",
  onAction,
  actionDisabled,
}: ProviderDashboardLayoutProps) => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const identity = providerProfile?.name || profile?.displayName || "Cuenta de proveedor";
  const marketplaceHref = providerProfile?.id ? `/proveedor/${providerProfile.id}` : PUBLIC_ROUTES.directorio;

  const navItems: ProviderNavItem[] = [
    { label: "Resumen", to: "/dashboard/proveedor", icon: LayoutDashboard, exact: true },
    { label: "Mi perfil", to: "/dashboard/proveedor/perfil", icon: UserCircle2 },
    { label: "Leads", to: "/dashboard/leads", icon: BriefcaseBusiness },
    { label: "Notificaciones", to: "/notificaciones", icon: Bell },
    { label: "Publicar servicio", to: PUBLIC_ROUTES.empresas, icon: FilePlus2 },
    { label: "Marketplace", to: marketplaceHref, icon: Search },
    { label: "Ajustes / Cuenta", to: "/perfil", icon: Settings },
  ];

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    navigate("/dashboard/proveedor/perfil");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 border-r border-border bg-background z-30">
        <div className="w-full p-5 flex flex-col">
          <Link to="/dashboard/proveedor" className="inline-flex items-center gap-2.5 mb-7">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-background" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight leading-none">
                Obras<span className="text-accent">RD</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Panel de proveedor</p>
            </div>
          </Link>

          <SidebarNav items={navItems} />

          <Button variant="outline" className="mt-4 w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </Button>

          <div className="mt-auto pt-6 text-xs text-muted-foreground">
            Gestiona tu visibilidad y responde leads rapido.
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
            <Link to="/dashboard/proveedor" className="inline-flex items-center gap-2.5 mb-7" onClick={() => setSidebarOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-background" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight leading-none">
                  Obras<span className="text-accent">RD</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Panel de proveedor</p>
              </div>
            </Link>
            <SidebarNav items={navItems} onNavigate={() => setSidebarOpen(false)} />
            <Button
              variant="outline"
              className="mt-4 w-full justify-start"
              onClick={async () => {
                await handleSignOut();
                setSidebarOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
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

export default ProviderDashboardLayout;
