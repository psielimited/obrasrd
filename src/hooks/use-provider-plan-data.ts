import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getMyProviderPlanSnapshot } from "@/lib/provider-plan-api";

export const providerPlanQueryKeys = {
  mine: ["provider-plan", "mine"] as const,
};

export const useMyProviderPlanSnapshot = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: providerPlanQueryKeys.mine,
    queryFn: getMyProviderPlanSnapshot,
    enabled: Boolean(user),
  });
};
