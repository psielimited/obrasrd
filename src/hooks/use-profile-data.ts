import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getMyProviderProfile } from "@/lib/profile-api";
import { useAuthSession } from "@/hooks/use-auth-session";

export const profileQueryKeys = {
  myProfile: ["profile", "me"] as const,
  myProviderProfile: ["profile", "provider", "me"] as const,
};

export const useMyProfile = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: profileQueryKeys.myProfile,
    queryFn: getMyProfile,
    enabled: Boolean(user),
  });
};

export const useMyProviderProfile = () => {
  const { user } = useAuthSession();

  return useQuery({
    queryKey: profileQueryKeys.myProviderProfile,
    queryFn: getMyProviderProfile,
    enabled: Boolean(user),
  });
};
