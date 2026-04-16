import { useQuery } from "@tanstack/react-query";
import {
  createServicePost,
  fetchFeaturedProviders,
  fetchMaterials,
  fetchPhases,
  fetchProviderById,
  fetchProviderSummaries,
  fetchProviders,
  PublishServiceInput,
} from "@/lib/marketplace-api";
import {
  CATALOG_QUERY_OPTIONS,
  MARKETPLACE_LIST_QUERY_OPTIONS,
} from "@/lib/query-options";

export const marketplaceQueryKeys = {
  providers: ["marketplace", "providers"] as const,
  providerSummaries: ["marketplace", "provider-summaries"] as const,
  featuredProviders: (limit: number) => ["marketplace", "featured-providers", limit] as const,
  provider: (id: string) => ["marketplace", "providers", id] as const,
  materials: ["marketplace", "materials"] as const,
  phases: ["marketplace", "phases"] as const,
};

export const useProviders = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.providers,
    queryFn: fetchProviders,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const useProviderSummaries = () =>
  useQuery({
    queryKey: marketplaceQueryKeys.providerSummaries,
    queryFn: fetchProviderSummaries,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const useFeaturedProviders = (limit = 4) =>
  useQuery({
    queryKey: marketplaceQueryKeys.featuredProviders(limit),
    queryFn: () => fetchFeaturedProviders(limit),
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
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
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const useMaterialsQuery = (enabled = true) =>
  useQuery({
    queryKey: marketplaceQueryKeys.materials,
    queryFn: fetchMaterials,
    enabled,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const usePhases = (enabled = true) =>
  useQuery({
    queryKey: marketplaceQueryKeys.phases,
    queryFn: fetchPhases,
    enabled,
    ...CATALOG_QUERY_OPTIONS,
  });

export { createServicePost };
export type { PublishServiceInput };
