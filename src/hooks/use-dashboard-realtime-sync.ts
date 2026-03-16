import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/use-auth-session";
import { leadQueryKeys } from "@/hooks/use-leads-data";
import { leadMessagesQueryKeys } from "@/hooks/use-lead-messages-data";
import { notificationQueryKeys } from "@/hooks/use-notifications-data";
import { providerPlanQueryKeys } from "@/hooks/use-provider-plan-data";

interface UseDashboardRealtimeSyncOptions {
  leadId?: string;
  includeLeads?: boolean;
  includeRequests?: boolean;
  includeNotifications?: boolean;
  includeThread?: boolean;
  includeProviderPlan?: boolean;
}

export const useDashboardRealtimeSync = (options: UseDashboardRealtimeSyncOptions = {}) => {
  const { user } = useAuthSession();
  const queryClient = useQueryClient();
  const {
    leadId,
    includeLeads = true,
    includeRequests = true,
    includeNotifications = true,
    includeThread = true,
    includeProviderPlan = true,
  } = options;

  useEffect(() => {
    if (!user) return;

    const pendingInvalidations = new Map<string, readonly unknown[]>();
    let flushTimer: ReturnType<typeof setTimeout> | undefined;

    const queueInvalidation = (queryKey: readonly unknown[]) => {
      pendingInvalidations.set(JSON.stringify(queryKey), queryKey);
      if (flushTimer) return;

      // Coalesce bursts from multiple realtime triggers (lead + message + notification).
      flushTimer = setTimeout(() => {
        const jobs = Array.from(pendingInvalidations.values()).map((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        pendingInvalidations.clear();
        flushTimer = undefined;
        void Promise.all(jobs);
      }, 120);
    };

    const channel = supabase
      .channel(`dashboard-sync-${user.id}-${leadId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          if (includeLeads) queueInvalidation(leadQueryKeys.myLeads);
          if (includeRequests) queueInvalidation(leadQueryKeys.myRequests);
          if (includeProviderPlan) queueInvalidation(providerPlanQueryKeys.mine);
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
        () => {
          if (includeThread && leadId) queueInvalidation(leadMessagesQueryKeys.thread(leadId));
          if (includeLeads) queueInvalidation(leadQueryKeys.myLeads);
          if (includeRequests) queueInvalidation(leadQueryKeys.myRequests);
          if (includeNotifications) {
            queueInvalidation(notificationQueryKeys.list);
            queueInvalidation(notificationQueryKeys.unreadCount);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          if (includeNotifications) {
            queueInvalidation(notificationQueryKeys.list);
            queueInvalidation(notificationQueryKeys.unreadCount);
          }
        },
      )
      .subscribe();

    return () => {
      if (flushTimer) clearTimeout(flushTimer);
      void supabase.removeChannel(channel);
    };
  }, [
    includeLeads,
    includeNotifications,
    includeProviderPlan,
    includeRequests,
    includeThread,
    leadId,
    queryClient,
    user,
  ]);
};
