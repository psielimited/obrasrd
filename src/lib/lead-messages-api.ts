import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type LeadMessageSenderRole = "provider" | "requester";

export interface LeadMessage {
  id: string;
  leadId: string;
  senderUserId: string;
  senderRole: LeadMessageSenderRole;
  message: string;
  createdAt: string;
}

const toLeadMessage = (row: Tables<"lead_messages">): LeadMessage => ({
  id: row.id,
  leadId: row.lead_id,
  senderUserId: row.sender_user_id,
  senderRole: row.sender_role as LeadMessageSenderRole,
  message: row.message,
  createdAt: row.created_at,
});

export const getLeadMessages = async (leadId: string): Promise<LeadMessage[]> => {
  const { data, error } = await supabase
    .from("lead_messages")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar los mensajes");
  }

  return data.map(toLeadMessage);
};

export const sendLeadMessage = async (leadId: string, message: string): Promise<void> => {
  const { error } = await supabase.rpc("send_lead_message", {
    p_lead_id: leadId,
    p_message: message,
  });

  if (error) {
    throw error;
  }
};
