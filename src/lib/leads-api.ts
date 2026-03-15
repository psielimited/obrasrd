import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed_won" | "closed_lost";
export type RequesterState = "active" | "cancelled" | "archived";

export interface Lead {
  id: string;
  providerId: string;
  requesterName?: string;
  requesterContact?: string;
  requesterUserId?: string;
  requesterState: RequesterState;
  requesterCancelledAt?: string;
  requesterArchivedAt?: string;
  message: string;
  estimatedBudget?: string;
  providerReply?: string;
  status: LeadStatus;
  contactedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  providerId: string;
  requesterName?: string;
  requesterContact?: string;
  message: string;
  estimatedBudget?: string;
}

const toLead = (row: Tables<"leads">): Lead => ({
  id: row.id,
  providerId: row.provider_id,
  requesterName: row.requester_name ?? undefined,
  requesterContact: row.requester_contact ?? undefined,
  requesterUserId: row.requester_user_id ?? undefined,
  requesterState: (row.requester_state as RequesterState) ?? "active",
  requesterCancelledAt: row.requester_cancelled_at ?? undefined,
  requesterArchivedAt: row.requester_archived_at ?? undefined,
  message: row.message,
  estimatedBudget: row.estimated_budget ?? undefined,
  providerReply: row.provider_reply ?? undefined,
  status: row.status as LeadStatus,
  contactedAt: row.contacted_at ?? undefined,
  closedAt: row.closed_at ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createLead = async (payload: CreateLeadInput): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload: TablesInsert<"leads"> = {
    provider_id: payload.providerId,
    requester_name: payload.requesterName?.trim() ? payload.requesterName.trim() : null,
    requester_contact: payload.requesterContact?.trim() ? payload.requesterContact.trim() : null,
    requester_user_id: user?.id ?? null,
    requester_state: "active",
    message: payload.message.trim(),
    estimated_budget: payload.estimatedBudget?.trim() ? payload.estimatedBudget.trim() : null,
    status: "new",
  };

  const { error } = await supabase.from("leads").insert(insertPayload);
  if (error) {
    throw error;
  }
};

export const getLeadsForProvider = async (providerId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar los leads");
  }

  return data.map(toLead);
};

export const getLeadsForRequester = async (): Promise<Lead[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw userError ?? new Error("Usuario no autenticado");
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("requester_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar tus solicitudes");
  }

  return data.map(toLead);
};

export const updateLead = async (
  leadId: string,
  payload: { status: LeadStatus; providerReply?: string },
): Promise<void> => {
  const updatePayload: TablesUpdate<"leads"> = {
    status: payload.status,
    provider_reply: payload.providerReply?.trim() ? payload.providerReply.trim() : null,
  };

  const { error } = await supabase.from("leads").update(updatePayload).eq("id", leadId);
  if (error) {
    throw error;
  }
};

export const updateMyLeadState = async (
  leadId: string,
  requesterState: RequesterState,
): Promise<void> => {
  const { error } = await supabase.rpc("update_my_lead_state", {
    p_lead_id: leadId,
    p_requester_state: requesterState,
  });

  if (error) {
    throw error;
  }
};
