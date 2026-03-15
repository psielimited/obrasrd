import { useQuery } from "@tanstack/react-query";
import { getLeadsForProvider } from "@/lib/leads-api";
import { useMyProviderProfile } from "@/hooks/use-profile-data";

export const leadQueryKeys = {
  providerLeads: (providerId: string) => ["leads", "provider", providerId] as const,
  myLeads: ["leads", "mine"] as const,
};

export const useProviderLeads = (providerId?: string) =>
  useQuery({
    queryKey: leadQueryKeys.providerLeads(providerId ?? ""),
    queryFn: () => getLeadsForProvider(providerId ?? ""),
    enabled: Boolean(providerId),
  });

export const useMyLeads = () => {
  const { data: providerProfile } = useMyProviderProfile();

  return useQuery({
    queryKey: leadQueryKeys.myLeads,
    queryFn: () => getLeadsForProvider(providerProfile?.id ?? ""),
    enabled: Boolean(providerProfile?.id),
  });
};
