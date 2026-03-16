import type { Provider } from "@/data/marketplace";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type UserRole = "buyer" | "provider" | "admin";

export interface UserProfile {
  userId: string;
  displayName?: string;
  role: UserRole;
  phone?: string;
  notificationEmailEnabled: boolean;
  notificationWhatsappEnabled: boolean;
}

export interface ProviderProfileInput {
  id?: string;
  name: string;
  trade: string;
  categorySlug: string;
  phaseId: number;
  location: string;
  city: string;
  yearsExperience: number;
  description: string;
  whatsapp: string;
  startingPrice?: number;
  serviceAreas: string[];
  portfolioImages: string[];
  isFeatured: boolean;
}

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
  isFeatured: row.is_featured,
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
    throw new Error("Usuario no autenticado");
  }

  return user.id;
};

export const getMyProfile = async (): Promise<UserProfile | null> => {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,display_name,role,phone,notification_email_enabled,notification_whatsapp_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    userId: data.user_id,
    displayName: data.display_name ?? undefined,
    role: (data.role as UserRole) ?? "buyer",
    phone: data.phone ?? undefined,
    notificationEmailEnabled: data.notification_email_enabled ?? true,
    notificationWhatsappEnabled: data.notification_whatsapp_enabled ?? false,
  };
};

export const upsertMyProfile = async (payload: Omit<UserProfile, "userId">): Promise<void> => {
  const userId = await requireUserId();

  const { error } = await supabase.from("user_profiles").upsert({
    user_id: userId,
    display_name: payload.displayName ?? null,
    role: payload.role,
    phone: payload.phone ?? null,
    notification_email_enabled: payload.notificationEmailEnabled,
    notification_whatsapp_enabled: payload.notificationWhatsappEnabled,
  });

  if (error) {
    throw error;
  }
};

export const getMyProviderProfile = async (): Promise<Provider | null> => {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toProvider(data);
};

export const upsertMyProviderProfile = async (payload: ProviderProfileInput): Promise<string> => {
  const userId = await requireUserId();

  const editableFields: Omit<TablesUpdate<"providers">, "id"> = {
    owner_user_id: userId,
    name: payload.name,
    trade: payload.trade,
    category_slug: payload.categorySlug,
    phase_id: payload.phaseId,
    location: payload.location,
    city: payload.city,
    years_experience: payload.yearsExperience,
    description: payload.description,
    whatsapp: payload.whatsapp,
    starting_price: payload.startingPrice ?? null,
    service_areas: payload.serviceAreas,
    portfolio_images: payload.portfolioImages,
    is_featured: payload.isFeatured,
  };

  let data: { id: string } | null = null;
  let error: { message: string } | null = null;

  if (payload.id) {
    const response = await supabase
      .from("providers")
      .update(editableFields)
      .eq("id", payload.id)
      .eq("owner_user_id", userId)
      .select("id")
      .single();
    data = response.data;
    error = response.error;
  } else {
    const insertPayload: TablesInsert<"providers"> = {
      ...editableFields,
      rating: 0,
      review_count: 0,
      completed_projects: 0,
      verified: false,
    };
    const response = await supabase.from("providers").insert(insertPayload).select("id").single();
    data = response.data;
    error = response.error;
  }

  if (error || !data) {
    throw error ?? new Error("No se pudo guardar el perfil de proveedor");
  }

  return data.id;
};
