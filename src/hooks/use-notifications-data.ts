import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyNotifications, getUnreadNotificationCount } from "@/lib/notifications-api";

export const notificationQueryKeys = {
  list: ["notifications", "list"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export const useMyNotifications = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: notificationQueryKeys.list,
    queryFn: getMyNotifications,
    enabled: Boolean(user),
  });
};

export const useUnreadNotificationCount = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });
};
