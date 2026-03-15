import { useQuery } from "@tanstack/react-query";
import { getLeadMessages } from "@/lib/lead-messages-api";

export const leadMessagesQueryKeys = {
  thread: (leadId: string) => ["lead-messages", "thread", leadId] as const,
};

export const useLeadMessages = (leadId?: string) =>
  useQuery({
    queryKey: leadMessagesQueryKeys.thread(leadId ?? ""),
    queryFn: () => getLeadMessages(leadId ?? ""),
    enabled: Boolean(leadId),
  });
