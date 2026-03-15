import { useQuery } from "@tanstack/react-query";
import { getLeadsForProvider, getLeadsForRequester } from "@/lib/leads-api";
import { useMyProviderProfile } from "@/hooks/use-profile-data";
import { useAuthSession } from "@/hooks/use-auth-session";

export const leadQueryKeys = {
  providerLeads: (providerId: string) => ["leads", "provider", providerId] as const,
  myLeads: ["leads", "mine"] as const,
  myRequests: ["leads", "requests", "mine"] as const,
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

export const useMyRequestedLeads = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: leadQueryKeys.myRequests,
    queryFn: getLeadsForRequester,
    enabled: Boolean(user),
  });
};
