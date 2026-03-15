import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MATERIALS, PHASES, POPULAR_CATEGORIES, PROVIDERS, Material, Phase, Provider } from "@/data/marketplace";

export interface PopularCategory {
  slug: string;
  name: string;
  count: number;
}

export interface PublishServiceInput {
  postType: string;
  title: string;
  location: string;
  description: string;
  estimatedBudget?: string;
  whatsapp: string;
}

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

const toProvider = (row: Tables<"providers">): Provider => ({
  id: row.id,
  name: row.name,
  trade: row.trade,
  categorySlug: row.category_slug,
  phaseId: row.phase_id,
  location: row.location,
  city: row.city,
  yearsExperience: row.years_experience,
  description: row.description,
  rating: Number(row.rating) || 0,
  reviewCount: row.review_count,
  completedProjects: row.completed_projects,
  verified: row.verified,
  whatsapp: row.whatsapp,
  startingPrice: row.starting_price ? Number(row.starting_price) : undefined,
  portfolioImages: row.portfolio_images ?? [],
  serviceAreas: row.service_areas ?? [],
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

export const fetchProviders = async (): Promise<Provider[]> => {
  if (!hasSupabaseConfig) {
    return PROVIDERS;
  }

  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("verified", { ascending: false })
    .order("rating", { ascending: false });

  if (error || !data?.length) {
    return PROVIDERS;
  }

  return data.map(toProvider);
};

export const fetchProviderById = async (id: string): Promise<Provider | null> => {
  if (!hasSupabaseConfig) {
    return PROVIDERS.find((provider) => provider.id === id) ?? null;
  }

  const { data, error } = await supabase.from("providers").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    return PROVIDERS.find((provider) => provider.id === id) ?? null;
  }

  return toProvider(data);
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

export const fetchPopularCategories = async (): Promise<PopularCategory[]> => {
  if (!hasSupabaseConfig) {
    return POPULAR_CATEGORIES.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.count,
    }));
  }

  const { data, error } = await supabase
    .from("categories")
    .select("slug,name,popularity_count")
    .order("popularity_count", { ascending: false })
    .limit(8);

  if (error || !data?.length) {
    return POPULAR_CATEGORIES.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: category.count,
    }));
  }

  return data.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: category.popularity_count,
  }));
};

export const createServicePost = async (payload: PublishServiceInput): Promise<void> => {
  if (!hasSupabaseConfig) {
    return;
  }

  const { error } = await supabase.from("service_posts").insert({
    post_type: payload.postType,
    title: payload.title,
    location: payload.location,
    description: payload.description,
    estimated_budget: payload.estimatedBudget?.trim() ? payload.estimatedBudget : null,
    whatsapp: payload.whatsapp,
  });

  if (error) {
    throw error;
  }
};
