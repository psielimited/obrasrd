import type { Provider } from "@/data/marketplace";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { findAvailableSlug } from "@/lib/provider-slug";

export type UserRole = "buyer" | "provider";

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
  slug?: string | null;
  name: string;
  trade: string;
  categorySlug: string;
  phaseId: number;
  primaryDisciplineId?: number;
  primaryServiceId?: number;
  serviceIds?: number[];
  workTypeIds?: number[];
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
  slug: (row as any).slug ?? undefined,
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
});

const syncProviderTaxonomyRelations = async (
  providerId: string,
  payload: Pick<ProviderProfileInput, "primaryServiceId" | "serviceIds" | "workTypeIds">,
): Promise<void> => {
  const desiredServiceIds = Array.from(
    new Set([...(payload.serviceIds ?? []), ...(payload.primaryServiceId ? [payload.primaryServiceId] : [])]),
  ).filter((item) => Number.isFinite(item));

  const desiredWorkTypeIds = Array.from(new Set(payload.workTypeIds ?? [])).filter((item) =>
    Number.isFinite(item),
  );

  const providerServicesTable = (supabase.from as any)("provider_services");
  const providerWorkTypesTable = (supabase.from as any)("provider_work_types");

  const { data: existingServices, error: existingServicesError } = await providerServicesTable
    .select("service_id")
    .eq("provider_id", providerId);
  if (existingServicesError) throw existingServicesError;

  const existingServiceIds = new Set<number>((existingServices ?? []).map((item: any) => Number(item.service_id)));
  const desiredServiceSet = new Set<number>(desiredServiceIds);
  const serviceIdsToDelete = Array.from(existingServiceIds).filter((item) => !desiredServiceSet.has(item));

  if (serviceIdsToDelete.length > 0) {
    const { error } = await providerServicesTable
      .delete()
      .eq("provider_id", providerId)
      .in("service_id", serviceIdsToDelete);
    if (error) throw error;
  }

  if (desiredServiceIds.length > 0) {
    const rows = desiredServiceIds.map((serviceId) => ({
      provider_id: providerId,
      service_id: serviceId,
      is_primary: payload.primaryServiceId === serviceId,
    }));

    const { error } = await providerServicesTable.upsert(rows, {
      onConflict: "provider_id,service_id",
    });
    if (error) throw error;
  }

  const { data: existingWorkTypes, error: existingWorkTypesError } = await providerWorkTypesTable
    .select("work_type_id")
    .eq("provider_id", providerId);
  if (existingWorkTypesError) throw existingWorkTypesError;

  const existingWorkTypeIds = new Set<number>(
    (existingWorkTypes ?? []).map((item: any) => Number(item.work_type_id)),
  );
  const desiredWorkTypeSet = new Set<number>(desiredWorkTypeIds);
  const workTypeIdsToDelete = Array.from(existingWorkTypeIds).filter((item) => !desiredWorkTypeSet.has(item));

  if (workTypeIdsToDelete.length > 0) {
    const { error } = await providerWorkTypesTable
      .delete()
      .eq("provider_id", providerId)
      .in("work_type_id", workTypeIdsToDelete);
    if (error) throw error;
  }

  if (desiredWorkTypeIds.length > 0) {
    const rows = desiredWorkTypeIds.map((workTypeId) => ({
      provider_id: providerId,
      work_type_id: workTypeId,
    }));

    // `provider_work_types` rows are append-only for ownership purposes.
    // Use insert+ignoreDuplicates so writes stay on the INSERT policy path
    // and do not require an UPDATE RLS policy during conflict handling.
    const { error } = await providerWorkTypesTable.insert(rows, {
      onConflict: "provider_id,work_type_id",
      ignoreDuplicates: true,
    });
    if (error) throw error;
  }
};

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

  const provider = toProvider(data);
  const providerServicesTable = (supabase.from as any)("provider_services");
  const providerWorkTypesTable = (supabase.from as any)("provider_work_types");

  const [{ data: providerServices }, { data: providerWorkTypes }] = await Promise.all([
    providerServicesTable.select("service_id").eq("provider_id", provider.id),
    providerWorkTypesTable.select("work_type_id").eq("provider_id", provider.id),
  ]);

  return {
    ...provider,
    serviceIds: (providerServices ?? []).map((item: any) => Number(item.service_id)),
    workTypeIds: (providerWorkTypes ?? []).map((item: any) => Number(item.work_type_id)),
  };
};

export const upsertMyProviderProfile = async (payload: ProviderProfileInput): Promise<string> => {
  const userId = await requireUserId();

  // Resolve slug: explicit value wins; null means "clear"; undefined leaves untouched on update.
  // For new providers without a slug, auto-generate one from the display name so the link is shareable from day 1.
  let slugToPersist: string | null | undefined = payload.slug;
  if (slugToPersist === undefined && !payload.id) {
    slugToPersist = await findAvailableSlug(payload.name);
  }
  if (typeof slugToPersist === "string") {
    slugToPersist = slugToPersist.trim().toLowerCase();
    if (slugToPersist.length === 0) slugToPersist = null;
  }

  const editableFields: Omit<TablesUpdate<"providers">, "id"> = {
    owner_user_id: userId,
    name: payload.name,
    trade: payload.trade,
    category_slug: payload.categorySlug,
    phase_id: payload.phaseId,
    ...(slugToPersist !== undefined ? { slug: slugToPersist } : {}),
    ...(payload.primaryDisciplineId !== undefined
      ? { primary_discipline_id: payload.primaryDisciplineId }
      : {}),
    ...(payload.primaryServiceId !== undefined ? { primary_service_id: payload.primaryServiceId } : {}),
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
    const insertPayload = {
      ...editableFields,
      name: payload.name,
      trade: payload.trade,
      category_slug: payload.categorySlug,
      phase_id: payload.phaseId,
      location: payload.location,
      city: payload.city,
      description: payload.description,
      whatsapp: payload.whatsapp,
      rating: 0,
      review_count: 0,
      completed_projects: 0,
      verified: false,
    } satisfies TablesInsert<"providers">;
    const response = await supabase.from("providers").insert(insertPayload).select("id").single();
    data = response.data;
    error = response.error;
  }

  if (error || !data) {
    throw error ?? new Error("No se pudo guardar el perfil de proveedor");
  }

  await syncProviderTaxonomyRelations(data.id, {
    primaryServiceId: payload.primaryServiceId,
    serviceIds: payload.serviceIds,
    workTypeIds: payload.workTypeIds,
  });

  return data.id;
};
