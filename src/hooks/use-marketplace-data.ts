import { useQuery } from "@tanstack/react-query";
import {
  createServicePost,
  fetchMaterials,
  fetchPhases,
  fetchPopularCategories,
  fetchProviderById,
  fetchProviders,
  PublishServiceInput,
} from "@/lib/marketplace-api";

export const marketplaceQueryKeys = {
  providers: ["marketplace", "providers"] as const,
  provider: (id: string) => ["marketplace", "providers", id] as const,
  materials: ["marketplace", "materials"] as const,
  phases: ["marketplace", "phases"] as const,
  popularCategories: ["marketplace", "popular-categories"] as const,
};

export const useProviders = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.providers,
    queryFn: fetchProviders,
  });

export const useProvider = (id?: string) =>
  useQuery({
    queryKey: marketplaceQueryKeys.provider(id ?? ""),
    queryFn: () => fetchProviderById(id ?? ""),
    enabled: Boolean(id),
  });

export const useMaterials = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.materials,
    queryFn: fetchMaterials,
  });

export const usePhases = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.phases,
    queryFn: fetchPhases,
  });

export const usePopularCategories = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.popularCategories,
    queryFn: fetchPopularCategories,
  });

export { createServicePost };
export type { PublishServiceInput };
