import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { notificationQueryKeys, useMyNotifications } from "@/hooks/use-notifications-data";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AppNotification,
} from "@/lib/notifications-api";
import { useToast } from "@/hooks/use-toast";

const getNotificationLabel = (notification: AppNotification) => {
  switch (notification.type) {
    case "lead_new":
      return "Nuevo lead";
    case "lead_status":
      return "Actualizacion";
    case "lead_reply":
      return "Mensaje";
    default:
      return "Notificacion";
  }
};

const NotificationsPage = () => {
  const { data: notifications = [], isLoading } = useMyNotifications();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    } catch (error) {
      toast({
        title: "No se pudo marcar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
      <div className="container max-w-3xl mx-auto space-y-4">
        <div className="bg-card p-6 rounded-xl obra-shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Notificaciones</h1>
              <p className="text-sm text-muted-foreground mt-1">Mantente al dia con cambios de tus solicitudes y leads.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onReadAll} disabled={unreadCount === 0}>
              Marcar todo leido
            </Button>
          </div>

          <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded bg-muted text-xs font-semibold text-muted-foreground">
            No leidas: {unreadCount}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card p-6 rounded-xl obra-shadow text-sm text-muted-foreground">Cargando notificaciones...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-card p-6 rounded-xl obra-shadow text-sm text-muted-foreground">No tienes notificaciones todavia.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card p-4 rounded-xl obra-shadow ${notification.readAt ? "opacity-80" : "border border-accent/30"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold">
                      {getNotificationLabel(notification)}
                    </p>
                    <h2 className="text-sm font-bold text-foreground mt-1">{notification.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!notification.readAt && (
                    <Button variant="outline" size="sm" onClick={() => onRead(notification.id)}>
                      Marcar leida
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
