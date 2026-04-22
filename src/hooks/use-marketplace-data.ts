import { useQuery } from "@tanstack/react-query";
import {
  createServicePost,
  fetchFeaturedPortfolioProjects,
  fetchFeaturedProviders,
  fetchMaterials,
  fetchPhases,
  fetchPortfolioProjectById,
  fetchProviderById,
  fetchProviderSummaries,
  fetchProviders,
  listMyServicePosts,
  listPendingServicePosts,
  moderateServicePost,
  type ModerateServicePostInput,
  type PortfolioProjectWithProvider,
  type ServicePostModerationRecord,
  type ServicePostStatus,
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
  featuredPortfolioProjects: (limit: number) => ["marketplace", "featured-portfolio-projects", limit] as const,
  portfolioProject: (id: string) => ["marketplace", "portfolio-project", id] as const,
  provider: (id: string) => ["marketplace", "providers", id] as const,
  materials: ["marketplace", "materials"] as const,
  phases: ["marketplace", "phases"] as const,
  myServicePosts: ["marketplace", "service-posts", "me"] as const,
  pendingServicePosts: (status: ServicePostStatus | "all") =>
    ["marketplace", "service-posts", "pending", status] as const,
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

export const useFeaturedProviders = (limit = 4, enabled = true) =>
  useQuery({
    queryKey: marketplaceQueryKeys.featuredProviders(limit),
    queryFn: () => fetchFeaturedProviders(limit),
    enabled,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const useFeaturedPortfolioProjects = (limit = 6, enabled = true) =>
  useQuery<PortfolioProjectWithProvider[]>({
    queryKey: marketplaceQueryKeys.featuredPortfolioProjects(limit),
    queryFn: () => fetchFeaturedPortfolioProjects(limit),
    enabled,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const usePortfolioProject = (id?: string) =>
  useQuery<PortfolioProjectWithProvider | null>({
    queryKey: marketplaceQueryKeys.portfolioProject(id ?? ""),
    queryFn: () => fetchPortfolioProjectById(id ?? ""),
    enabled: Boolean(id),
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

export const useMyServicePosts = (enabled = true) =>
  useQuery<ServicePostModerationRecord[]>({
    queryKey: marketplaceQueryKeys.myServicePosts,
    queryFn: listMyServicePosts,
    enabled,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export const usePendingServicePosts = (status: ServicePostStatus | "all" = "pending", enabled = true) =>
  useQuery<ServicePostModerationRecord[]>({
    queryKey: marketplaceQueryKeys.pendingServicePosts(status),
    queryFn: () => listPendingServicePosts(status),
    enabled,
    ...MARKETPLACE_LIST_QUERY_OPTIONS,
  });

export { createServicePost, listMyServicePosts, listPendingServicePosts, moderateServicePost };
export type {
  ModerateServicePostInput,
  PublishServiceInput,
  ServicePostModerationRecord,
  ServicePostStatus,
};
