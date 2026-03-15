import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type NotificationType = "lead_new" | "lead_status" | "lead_reply";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  leadId?: string;
  readAt?: string;
  createdAt: string;
}

const toNotification = (row: Tables<"notifications">): AppNotification => ({
  id: row.id,
  type: row.type as NotificationType,
  title: row.title,
  body: row.body,
  leadId: row.lead_id ?? undefined,
  readAt: row.read_at ?? undefined,
  createdAt: row.created_at,
});

export const getMyNotifications = async (): Promise<AppNotification[]> => {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,title,body,lead_id,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar las notificaciones");
  }

  return data.map(toNotification);
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw error;
  }

  return count ?? 0;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  if (error) {
    throw error;
  }
};
