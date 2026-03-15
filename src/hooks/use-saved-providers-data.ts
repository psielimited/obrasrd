import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMySavedProviderIds, getMySavedProviders } from "@/lib/saved-providers-api";

export const savedProvidersQueryKeys = {
  ids: ["saved-providers", "ids"] as const,
  list: ["saved-providers", "list"] as const,
};

export const useMySavedProviderIds = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: savedProvidersQueryKeys.ids,
    queryFn: getMySavedProviderIds,
    enabled: Boolean(user),
  });
};

export const useMySavedProviders = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: savedProvidersQueryKeys.list,
    queryFn: getMySavedProviders,
    enabled: Boolean(user),
  });
};
