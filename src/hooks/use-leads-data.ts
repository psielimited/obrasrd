import { useQuery } from "@tanstack/react-query";
import { getLeadsForProvider } from "@/lib/leads-api";

export const leadQueryKeys = {
  providerLeads: (providerId: string) => ["leads", "provider", providerId] as const,
};

export const useProviderLeads = (providerId?: string) =>
  useQuery({
    queryKey: leadQueryKeys.providerLeads(providerId ?? ""),
    queryFn: () => getLeadsForProvider(providerId ?? ""),
    enabled: Boolean(providerId),
  });
