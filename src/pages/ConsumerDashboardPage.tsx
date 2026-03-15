import { Link } from "react-router-dom";
import { Bell, ClipboardList, Heart, Search } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useMyRequestedLeads } from "@/hooks/use-leads-data";
import { useMyNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications-data";
import { useMyProfile } from "@/hooks/use-profile-data";

const ConsumerDashboardPage = () => {
  const { data: profile } = useMyProfile();
  const { data: leads = [] } = useMyRequestedLeads();
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const activeRequests = leads.filter((lead) => ["new", "contacted", "qualified"].includes(lead.status)).length;
  const respondedRequests = leads.filter((lead) => lead.status !== "new").length;
  const recentLeads = leads.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <ConsumerDashboardLayout
      title="Resumen"
      subtitle="Sigue tus solicitudes y compara opciones"
      actionLabel="Acciones"
    >
      <div className="space-y-6">
        <SectionCard
          title={`Bienvenido${profile?.displayName ? `, ${profile.displayName}` : ""}`}
          description="Desde aqui puedes administrar tus solicitudes y mantener seguimiento de respuestas."
        >
          <div className="grid gap-3 md:grid-cols-4">
            <StatCard title="Solicitudes totales" value={String(leads.length)} hint="Historial acumulado" icon={ClipboardList} />
            <StatCard title="Solicitudes activas" value={String(activeRequests)} hint="En proceso" icon={Search} />
            <StatCard title="Con respuesta" value={String(respondedRequests)} hint="Con movimiento" icon={Bell} />
            <StatCard title="No leidas" value={String(unreadCount)} hint="Notificaciones pendientes" icon={Bell} />
          </div>
        </SectionCard>

        <div className="grid gap-3 md:grid-cols-4">
          <QuickActionCard to="/dashboard/cliente/solicitudes" title="Mis solicitudes" description="Ver y comparar respuestas" icon={<ClipboardList className="h-5 w-5" />} />
          <QuickActionCard to="/buscar" title="Buscar proveedores" description="Explorar por categoria y ciudad" icon={<Search className="h-5 w-5" />} />
          <QuickActionCard to="/dashboard/cliente/guardados" title="Guardados" description="Tus perfiles favoritos" icon={<Heart className="h-5 w-5" />} />
          <QuickActionCard to="/notificaciones" title="Notificaciones" description="Mantente al dia" icon={<Bell className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Solicitudes recientes"
            description="Ultimos contactos iniciados"
            right={<Link to="/dashboard/cliente/solicitudes" className="text-xs font-semibold text-accent hover:underline">Ver todas</Link>}
          >
            {recentLeads.length === 0 ? (
              <p className="text-sm text-slate-400">Aun no tienes solicitudes activas.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-100">{lead.requesterName || "Solicitud"}</p>
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lead.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Notificaciones recientes"
            description="Cambios de estado y respuestas"
            right={<Link to="/notificaciones" className="text-xs font-semibold text-accent hover:underline">Ver todas</Link>}
          >
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-slate-400">No hay notificaciones recientes.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className={`rounded-xl border p-3 ${notification.readAt ? "border-slate-800 bg-slate-950/50" : "border-accent/30 bg-accent/10"}`}>
                    <p className="text-sm font-semibold text-slate-100">{notification.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{notification.body}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </ConsumerDashboardLayout>
  );
};

export default ConsumerDashboardPage;
