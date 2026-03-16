import { supabase } from "@/integrations/supabase/client";

export interface ProviderPlanSnapshot {
  planCode: string;
  planName: string;
  status: "active" | "trialing" | "past_due" | "cancelled";
  monthlyLeadQuota: number | null;
  leadsUsedThisMonth: number;
  leadsRemainingThisMonth: number | null;
  isQuotaUnlimited: boolean;
  periodStart: string;
  periodEnd: string;
}

export const getMyProviderPlanSnapshot = async (): Promise<ProviderPlanSnapshot | null> => {
  const { data, error } = await supabase.rpc("get_my_provider_plan_snapshot");

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;

  return {
    planCode: row.plan_code,
    planName: row.plan_name,
    status: row.status,
    monthlyLeadQuota: row.monthly_lead_quota,
    leadsUsedThisMonth: row.leads_used_this_month,
    leadsRemainingThisMonth: row.leads_remaining_this_month,
    isQuotaUnlimited: row.is_quota_unlimited,
    periodStart: row.period_start,
    periodEnd: row.period_end,
  };
};
