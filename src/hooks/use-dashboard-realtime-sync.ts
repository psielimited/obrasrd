import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/use-auth-session";
import { leadQueryKeys } from "@/hooks/use-leads-data";
import { leadMessagesQueryKeys } from "@/hooks/use-lead-messages-data";
import { notificationQueryKeys } from "@/hooks/use-notifications-data";

interface UseDashboardRealtimeSyncOptions {
  leadId?: string;
}

export const useDashboardRealtimeSync = (options: UseDashboardRealtimeSyncOptions = {}) => {
  const { user } = useAuthSession();
  const queryClient = useQueryClient();
  const { leadId } = options;

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`dashboard-sync-${user.id}-${leadId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: leadQueryKeys.myLeads }),
            queryClient.invalidateQueries({ queryKey: leadQueryKeys.myRequests }),
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lead_messages",
          ...(leadId ? { filter: `lead_id=eq.${leadId}` } : {}),
        },
        async () => {
          const invalidateThread = leadId
            ? queryClient.invalidateQueries({ queryKey: leadMessagesQueryKeys.thread(leadId) })
            : Promise.resolve();

          await Promise.all([
            invalidateThread,
            queryClient.invalidateQueries({ queryKey: leadQueryKeys.myLeads }),
            queryClient.invalidateQueries({ queryKey: leadQueryKeys.myRequests }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list }),
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [leadId, queryClient, user]);
};
