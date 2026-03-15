import type { Provider } from "@/data/marketplace";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

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

const requireUserId = async (): Promise<string> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw error ?? new Error("Usuario no autenticado");
  }

  return user.id;
};

export const getMySavedProviderIds = async (): Promise<string[]> => {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("saved_providers")
    .select("provider_id")
    .eq("user_id", userId);

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar los guardados");
  }

  return data.map((item) => item.provider_id);
};

export interface SavedProviderItem {
  id: number;
  provider: Provider;
  note?: string;
  isShortlisted: boolean;
  createdAt: string;
}

export const getMySavedProviders = async (): Promise<SavedProviderItem[]> => {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("saved_providers")
    .select("id,created_at,note,is_shortlisted, providers(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    throw error ?? new Error("No se pudieron cargar los proveedores guardados");
  }

  return data
    .map((item) => {
      const providerRow = item.providers as Tables<"providers"> | null;
      if (!providerRow) return null;
      return {
        id: item.id,
        provider: toProvider(providerRow),
        note: item.note ?? undefined,
        isShortlisted: item.is_shortlisted,
        createdAt: item.created_at,
      };
    })
    .filter((item): item is SavedProviderItem => item != null && Boolean(item.provider));
};

export const saveProvider = async (providerId: string): Promise<void> => {
  const userId = await requireUserId();

  const { error } = await supabase.from("saved_providers").upsert(
    {
      user_id: userId,
      provider_id: providerId,
    },
    { onConflict: "user_id,provider_id", ignoreDuplicates: true },
  );

  if (error) {
    throw error;
  }
};

export const unsaveProvider = async (providerId: string): Promise<void> => {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("saved_providers")
    .delete()
    .eq("user_id", userId)
    .eq("provider_id", providerId);

  if (error) {
    throw error;
  }
};

export const updateSavedProviderMeta = async (
  savedProviderId: number,
  payload: { note?: string; isShortlisted?: boolean },
): Promise<void> => {
  const updatePayload: TablesUpdate<"saved_providers"> = {};

  if (payload.note !== undefined) {
    updatePayload.note = payload.note.trim() ? payload.note.trim() : null;
  }

  if (payload.isShortlisted !== undefined) {
    updatePayload.is_shortlisted = payload.isShortlisted;
  }

  const { error } = await supabase
    .from("saved_providers")
    .update(updatePayload)
    .eq("id", savedProviderId);

  if (error) {
    throw error;
  }
};

export const toggleSavedProvider = async (providerId: string): Promise<boolean> => {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("saved_providers")
    .select("id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    await unsaveProvider(providerId);
    return false;
  }

  await saveProvider(providerId);
  return true;
};
