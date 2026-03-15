import { useQueryClient } from "@tanstack/react-query";
import { BellDot, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { notificationQueryKeys, useMyNotifications } from "@/hooks/use-notifications-data";
import { useMyProfile } from "@/hooks/use-profile-data";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/lib/notifications-api";
import { useToast } from "@/hooks/use-toast";
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";

const getNotificationLabel = (notification: AppNotification) => {
  switch (notification.type) {
    case "lead_new":
      return "Nuevo lead";
    case "lead_status":
      return "Estado de solicitud";
    case "lead_reply":
      return "Mensaje del proveedor";
    case "lead_message":
      return "Mensaje";
    default:
      return "Notificacion";
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: notifications = [], isLoading } = useMyNotifications();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useDashboardRealtimeSync({
    includeLeads: false,
    includeRequests: false,
    includeThread: false,
  });

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list }),
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
    ]);
  };

  const onRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      await refreshNotifications();
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const onReadAll = async () => {
    try {
      await markAllNotificationsAsRead();
      await refreshNotifications();
      toast({ title: "Listo", description: "Notificaciones marcadas como leidas." });
    } catch (error) {
      toast({
        title: "No se pudo marcar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const onOpenNotification = async (notification: AppNotification) => {
    if (!notification.leadId) return;

    try {
      if (!notification.readAt) {
        await markNotificationAsRead(notification.id);
        await refreshNotifications();
      }
      navigate(`/lead/${notification.leadId}/chat`);
    } catch (error) {
      toast({
        title: "No se pudo abrir",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const Layout = profile?.role === "provider" ? ProviderDashboardLayout : ConsumerDashboardLayout;

  return (
    <Layout
      title="Notificaciones"
      subtitle="Controla actualizaciones de leads y respuestas"
      actionLabel="Acciones"
      onAction={onReadAll}
      actionDisabled={unreadCount === 0}
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard title="No leidas" value={String(unreadCount)} hint="Pendientes de revisar" icon={BellDot} />
          <StatCard title="Total" value={String(notifications.length)} hint="Ultimos 50 eventos" icon={CheckCheck} />
        </div>

        <SectionCard
          title="Bandeja"
          description="Mantente al dia con cada movimiento"
          right={
            <Button variant="outline" size="sm" onClick={onReadAll} disabled={unreadCount === 0}>
              Marcar todo leido
            </Button>
          }
        >
          {isLoading ? (
            <p className="text-sm text-slate-400">Cargando notificaciones...</p>
          ) : notifications.length === 0 ? (
            <EmptyState
              title="Sin notificaciones"
              description="Aun no tienes actividad reciente."
              icon={BellDot}
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-4 ${
                    notification.readAt
                      ? "border-slate-800 bg-slate-950/50"
                      : "border-accent/40 bg-accent/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                        {getNotificationLabel(notification)}
                      </p>
                      <h3 className="text-sm font-semibold text-slate-100 mt-1">{notification.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{notification.body}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.leadId && (
                        <Button variant="outline" size="sm" onClick={() => onOpenNotification(notification)}>
                          Abrir chat
                        </Button>
                      )}
                      {!notification.readAt && (
                        <Button variant="accent" size="sm" onClick={() => onRead(notification.id)}>
                          Marcar leida
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
