import { Link } from "react-router-dom";
import { Bell, ClipboardList, Heart, MessageSquare, Scale, Search } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useMyRequestedLeads } from "@/hooks/use-leads-data";
import { useMyNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications-data";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";

const ConsumerDashboardPage = () => {
  const { data: profile } = useMyProfile();
  const { data: leads = [] } = useMyRequestedLeads();
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  useDashboardRealtimeSync({ includeLeads: false, includeThread: false });

  const activeRequests = leads.filter((lead) => ["new", "contacted", "qualified"].includes(lead.status)).length;
  const respondedRequests = leads.filter((lead) => lead.status !== "new").length;
  const unreadRequestThreads = leads.filter(
    (lead) =>
      Boolean(lead.lastMessageAt) &&
      (!lead.requesterLastReadAt || Date.parse(lead.lastMessageAt) > Date.parse(lead.requesterLastReadAt)),
  ).length;
  const recentLeads = [...leads]
    .sort((a, b) => {
      const aActivityAt = a.lastMessageAt || a.createdAt;
      const bActivityAt = b.lastMessageAt || b.createdAt;
      return Date.parse(bActivityAt) - Date.parse(aActivityAt);
    })
    .slice(0, 5);
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
            <StatCard title="Chats no leidos" value={String(unreadRequestThreads)} hint={`Con respuesta: ${respondedRequests}`} icon={MessageSquare} />
            <StatCard title="No leidas" value={String(unreadCount)} hint="Notificaciones pendientes" icon={Bell} />
          </div>
        </SectionCard>

        <div className="grid gap-3 md:grid-cols-5">
          <QuickActionCard to="/dashboard/cliente/solicitudes" title="Mis solicitudes" description="Ver y comparar respuestas" icon={<ClipboardList className="h-5 w-5" />} />
          <QuickActionCard to="/buscar" title="Buscar proveedores" description="Explorar por categoria y ciudad" icon={<Search className="h-5 w-5" />} />
          <QuickActionCard to="/dashboard/cliente/guardados" title="Guardados" description="Tus perfiles favoritos" icon={<Heart className="h-5 w-5" />} />
          <QuickActionCard to="/dashboard/cliente/comparar" title="Comparar" description="Evaluar shortlist lado a lado" icon={<Scale className="h-5 w-5" />} />
          <QuickActionCard to="/notificaciones" title="Notificaciones" description="Mantente al dia" icon={<Bell className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Solicitudes recientes"
            description="Ultimos contactos iniciados"
            right={
              <div className="flex items-center gap-2">
                {unreadRequestThreads > 0 && (
                  <Badge variant="outline" className="border-accent/40 text-accent">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {unreadRequestThreads} no leidos
                  </Badge>
                )}
                <Link to="/dashboard/cliente/solicitudes" className="text-xs font-semibold text-accent hover:underline">Ver todas</Link>
              </div>
            }
          >
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aun no tienes solicitudes activas.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{lead.requesterName || "Solicitud"}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        {Boolean(lead.lastMessageAt) &&
                          (!lead.requesterLastReadAt ||
                            Date.parse(lead.lastMessageAt) > Date.parse(lead.requesterLastReadAt)) && (
                            <Badge variant="outline" className="border-accent/40 text-accent">
                              No leido
                            </Badge>
                          )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(lead.lastMessageAt || lead.createdAt).toLocaleString()}</p>
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
              <p className="text-sm text-muted-foreground">No hay notificaciones recientes.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className={`rounded-xl border p-3 ${notification.readAt ? "border-border bg-card" : "border-accent/30 bg-accent/10"}`}>
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.body}</p>
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

