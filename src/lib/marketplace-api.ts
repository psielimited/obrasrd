import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MATERIALS, PHASES, PROVIDERS, Material, Phase, Provider } from "@/data/marketplace";

export interface PublishServiceInput {
  postType: string;
  title: string;
  location: string;
  description: string;
  estimatedBudget?: string;
  whatsapp: string;
  requestedStageId?: number;
  requestedDisciplineId?: number;
  requestedServiceId?: number;
  requestedWorkTypeId?: number;
}

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

type TrustSignalsRow = {
  provider_id: string;
  provider_verified: boolean;
  identity_confirmed: boolean;
  portfolio_validated: boolean;
  project_registered: boolean;
  rapid_response: boolean;
  active_this_month: boolean;
};

type ProviderSummaryRow = {
  id: string;
  name: string;
  trade: string;
  category_slug: string;
  phase_id: number;
  primary_discipline_id: number | null;
  primary_service_id: number | null;
  location: string;
  city: string;
  years_experience: number;
  description: string;
  rating: number | string | null;
  review_count: number;
  completed_projects: number;
  verified: boolean;
  is_featured: boolean;
  whatsapp: string;
  starting_price: number | string | null;
  portfolio_images: string[] | null;
  service_areas: string[] | null;
  service_ids: Array<number | string> | null;
  work_type_ids: Array<number | string> | null;
  provider_verified: boolean | null;
  identity_confirmed: boolean | null;
  portfolio_validated: boolean | null;
  project_registered: boolean | null;
  rapid_response: boolean | null;
  active_this_month: boolean | null;
};

const getMonthWindowStartIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

const toPortfolioProject = (row: Tables<"portfolio_projects">) => ({
  id: row.id,
  title: row.title,
  summary: row.summary ?? undefined,
  location: row.location ?? undefined,
  status: row.status,
  primaryWorkTypeId: row.primary_work_type_id ?? undefined,
  completedOn: row.completed_on ?? undefined,
});

const toProvider = (
  row: Tables<"providers">,
  taxonomy?: { serviceIds?: number[]; workTypeIds?: number[] },
  trustSignals?: TrustSignalsRow,
  portfolioProjects?: Tables<"portfolio_projects">[],
): Provider => ({
  id: row.id,
  name: row.name,
  trade: row.trade,
  categorySlug: row.category_slug,
  phaseId: row.phase_id,
  primaryDisciplineId: (row as any).primary_discipline_id ?? undefined,
  primaryServiceId: (row as any).primary_service_id ?? undefined,
  location: row.location,
  city: row.city,
  yearsExperience: row.years_experience,
  description: row.description,
  rating: Number(row.rating) || 0,
  reviewCount: row.review_count,
  completedProjects: row.completed_projects,
  verified: row.verified,
  isFeatured: row.is_featured,
  whatsapp: row.whatsapp,
  startingPrice: row.starting_price ? Number(row.starting_price) : undefined,
  portfolioImages: row.portfolio_images ?? [],
  serviceAreas: row.service_areas ?? [],
  serviceIds: taxonomy?.serviceIds ?? [],
  workTypeIds: taxonomy?.workTypeIds ?? [],
  trustSnapshot: trustSignals
    ? {
        providerVerified: trustSignals.provider_verified,
        identityConfirmed: trustSignals.identity_confirmed,
        portfolioValidated: trustSignals.portfolio_validated,
        projectRegistered: trustSignals.project_registered,
        rapidResponse: trustSignals.rapid_response,
        activeThisMonth: trustSignals.active_this_month,
      }
    : {
        providerVerified: row.verified,
        identityConfirmed: false,
        portfolioValidated: false,
        projectRegistered: false,
        rapidResponse: false,
        activeThisMonth: Boolean(row.updated_at && row.updated_at >= getMonthWindowStartIso()),
      },
  portfolioProjects: (portfolioProjects ?? []).map(toPortfolioProject),
});

const toMaterial = (row: Tables<"materials">): Material => ({
  id: row.id,
  name: row.name,
  category: row.category,
  supplier: row.supplier,
  location: row.location,
  price: Number(row.price) || 0,
  unit: row.unit,
  bulkPrice: row.bulk_price ? Number(row.bulk_price) : undefined,
  bulkUnit: row.bulk_unit ?? undefined,
  delivery: row.delivery,
  whatsapp: row.whatsapp,
  description: row.description,
});

const mapProviderSummaryRow = (row: ProviderSummaryRow): Provider => ({
  id: row.id,
  name: row.name,
  trade: row.trade,
  categorySlug: row.category_slug,
  phaseId: row.phase_id,
  primaryDisciplineId: row.primary_discipline_id ?? undefined,
  primaryServiceId: row.primary_service_id ?? undefined,
  location: row.location,
  city: row.city,
  yearsExperience: row.years_experience,
  description: row.description,
  rating: Number(row.rating) || 0,
  reviewCount: row.review_count,
  completedProjects: row.completed_projects,
  verified: row.verified,
  isFeatured: row.is_featured,
  whatsapp: row.whatsapp,
  startingPrice: row.starting_price ? Number(row.starting_price) : undefined,
  portfolioImages: row.portfolio_images ?? [],
  serviceAreas: row.service_areas ?? [],
  serviceIds: (row.service_ids ?? []).map((item) => Number(item)),
  workTypeIds: (row.work_type_ids ?? []).map((item) => Number(item)),
  trustSnapshot: {
    providerVerified: row.provider_verified ?? row.verified,
    identityConfirmed: row.identity_confirmed ?? false,
    portfolioValidated: row.portfolio_validated ?? false,
    projectRegistered: row.project_registered ?? false,
    rapidResponse: row.rapid_response ?? false,
    activeThisMonth: row.active_this_month ?? false,
  },
});

export const fetchProviderSummaries = async (): Promise<Provider[]> => {
  if (!hasSupabaseConfig) {
    return PROVIDERS.map((provider) => ({
      ...provider,
      trustSnapshot: provider.trustSnapshot ?? {
        providerVerified: provider.verified,
        identityConfirmed: false,
        portfolioValidated: false,
        projectRegistered: provider.completedProjects > 0,
        rapidResponse: false,
        activeThisMonth: false,
      },
    }));
  }

  const { data, error } = await supabase
    .from("provider_summary_view" as any)
    .select(
      "id,name,trade,category_slug,phase_id,primary_discipline_id,primary_service_id,location,city,years_experience,description,rating,review_count,completed_projects,verified,is_featured,whatsapp,starting_price,portfolio_images,service_areas,service_ids,work_type_ids,provider_verified,identity_confirmed,portfolio_validated,project_registered,rapid_response,active_this_month",
    )
    .order("is_featured", { ascending: false })
    .order("verified", { ascending: false })
    .order("rating", { ascending: false });

  if (error || !data?.length) {
    return PROVIDERS.map((provider) => ({
      ...provider,
      trustSnapshot: provider.trustSnapshot ?? {
        providerVerified: provider.verified,
        identityConfirmed: false,
        portfolioValidated: false,
        projectRegistered: provider.completedProjects > 0,
        rapidResponse: false,
        activeThisMonth: false,
      },
    }));
  }

  return (data as unknown as ProviderSummaryRow[]).map(mapProviderSummaryRow);
};

export const fetchFeaturedProviders = async (limit = 4): Promise<Provider[]> => {
  if (!hasSupabaseConfig) {
    return PROVIDERS.filter((provider) => provider.isFeatured).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("provider_summary_view" as any)
    .select(
      "id,name,trade,category_slug,phase_id,primary_discipline_id,primary_service_id,location,city,years_experience,description,rating,review_count,completed_projects,verified,is_featured,whatsapp,starting_price,portfolio_images,service_areas,service_ids,work_type_ids,provider_verified,identity_confirmed,portfolio_validated,project_registered,rapid_response,active_this_month",
    )
    .eq("is_featured", true)
    .order("verified", { ascending: false })
    .order("rating", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return PROVIDERS.filter((provider) => provider.isFeatured).slice(0, limit);
  }

  return (data as ProviderSummaryRow[]).map(mapProviderSummaryRow);
};

export const fetchProviders = fetchProviderSummaries;

export const fetchProviderById = async (id: string): Promise<Provider | null> => {
  if (!hasSupabaseConfig) {
    const provider = PROVIDERS.find((item) => item.id === id);
    if (!provider) return null;
    return {
      ...provider,
      trustSnapshot: provider.trustSnapshot ?? {
        providerVerified: provider.verified,
        identityConfirmed: false,
        portfolioValidated: false,
        projectRegistered: provider.completedProjects > 0,
        rapidResponse: false,
        activeThisMonth: false,
      },
    };
  }

  const { data, error } = await supabase.from("providers").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return PROVIDERS.find((provider) => provider.id === id) ?? null;
  }

  const [{ data: providerServices }, { data: providerWorkTypes }] = await Promise.all([
    (supabase.from as any)("provider_services")
      .select("service_id")
      .eq("provider_id", data.id),
    (supabase.from as any)("provider_work_types")
      .select("work_type_id")
      .eq("provider_id", data.id),
  ]);

  const [{ data: trustSignalsRows }, { data: portfolioProjectRows }] = await Promise.all([
    (supabase.from as any)("provider_trust_signals")
      .select("provider_id,provider_verified,identity_confirmed,portfolio_validated,project_registered,rapid_response,active_this_month")
      .eq("provider_id", data.id)
      .limit(1),
    (supabase.from as any)("portfolio_projects")
      .select("id,title,summary,location,status,completed_on,primary_work_type_id")
      .eq("provider_id", data.id)
      .order("completed_on", { ascending: false }),
  ]);

  return toProvider(data, {
    serviceIds: (providerServices ?? []).map((item: any) => Number(item.service_id)),
    workTypeIds: (providerWorkTypes ?? []).map((item: any) => Number(item.work_type_id)),
  }, (trustSignalsRows?.[0] as TrustSignalsRow | undefined), portfolioProjectRows as Tables<"portfolio_projects">[] | undefined);
};

export const fetchMaterials = async (): Promise<Material[]> => {
  if (!hasSupabaseConfig) {
    return MATERIALS;
  }

  const { data, error } = await supabase.from("materials").select("*").order("name", { ascending: true });

  if (error || !data?.length) {
    return MATERIALS;
  }

  return data.map(toMaterial);
};

export const fetchPhases = async (): Promise<Phase[]> => {
  if (!hasSupabaseConfig) {
    return PHASES;
  }

  const [{ data: phasesData, error: phasesError }, { data: categoriesData, error: categoriesError }] =
    await Promise.all([
      supabase.from("phases").select("*").order("sort_order", { ascending: true }),
      supabase.from("categories").select("*").order("name", { ascending: true }),
    ]);

  if (phasesError || categoriesError || !phasesData?.length) {
    return PHASES;
  }

  return phasesData.map((phase) => ({
    id: phase.id,
    slug: phase.slug,
    name: phase.name,
    description: phase.description,
    categories: (categoriesData ?? [])
      .filter((category) => category.phase_id === phase.id)
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        icon: category.icon,
      })),
  }));
};

export const createServicePost = async (payload: PublishServiceInput): Promise<void> => {
  if (!hasSupabaseConfig) {
    return;
  }

  const { error } = await (supabase.from("service_posts") as any).insert({
    post_type: payload.postType,
    title: payload.title,
    location: payload.location,
    description: payload.description,
    estimated_budget: payload.estimatedBudget?.trim() ? payload.estimatedBudget : null,
    whatsapp: payload.whatsapp,
    ...(payload.requestedStageId !== undefined ? { requested_stage_id: payload.requestedStageId } : {}),
    ...(payload.requestedDisciplineId !== undefined
      ? { requested_discipline_id: payload.requestedDisciplineId }
      : {}),
    ...(payload.requestedServiceId !== undefined ? { requested_service_id: payload.requestedServiceId } : {}),
    ...(payload.requestedWorkTypeId !== undefined ? { requested_work_type_id: payload.requestedWorkTypeId } : {}),
  });

  if (error) {
    throw error;
  }
};
