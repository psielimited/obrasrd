import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export type MediaEntityType = "provider_profile" | "project" | "lead_request";
export type MediaBucket = "provider-portfolio" | "project-media" | "request-media";

interface UploadImageAssetInput {
  file: File;
  entityType: MediaEntityType;
  entityId?: string | null;
}

interface UploadedImageAsset {
  id: string;
  bucketId: MediaBucket;
  objectPath: string;
  publicUrl: string | null;
}

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

const ENTITY_BUCKET_MAP: Record<MediaEntityType, MediaBucket> = {
  provider_profile: "provider-portfolio",
  project: "project-media",
  lead_request: "request-media",
};

const requireUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Usuario no autenticado");
  }

  return user.id;
};

const getFileExtension = (file: File) => {
  const source = file.name.trim().toLowerCase();
  const ext = source.includes(".") ? source.split(".").pop() : "";
  if (ext === "jpeg" || ext === "jpg") return "jpg";
  if (ext === "png") return "png";
  if (ext === "webp") return "webp";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

const isPublicBucket = (bucketId: MediaBucket) =>
  bucketId === "provider-portfolio" || bucketId === "project-media";

export const uploadImageAsset = async ({
  file,
  entityType,
  entityId,
}: UploadImageAssetInput): Promise<UploadedImageAsset> => {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("El archivo supera el limite de 8MB.");
  }

  const userId = await requireUserId();
  const bucketId = ENTITY_BUCKET_MAP[entityType];
  const ext = getFileExtension(file);
  const objectPath = `${userId}/${entityType}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(bucketId).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  const publicUrl = isPublicBucket(bucketId)
    ? supabase.storage.from(bucketId).getPublicUrl(objectPath).data.publicUrl
    : null;

  const insertPayload = {
    owner_user_id: userId,
    bucket_id: bucketId,
    object_path: objectPath,
    public_url: publicUrl,
    entity_type: entityType,
    entity_id: entityId ?? null,
    mime_type: file.type,
    file_size_bytes: file.size,
  } satisfies TablesInsert<"media_assets">;

  const { data: inserted, error: insertError } = await supabase
    .from("media_assets")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError || !inserted) {
    await supabase.storage.from(bucketId).remove([objectPath]);
    throw insertError ?? new Error("No se pudo registrar el archivo");
  }

  return {
    id: inserted.id,
    bucketId,
    objectPath,
    publicUrl,
  };
};

export const deleteProviderPortfolioImageByUrl = async (imageUrl: string): Promise<void> => {
  const marker = "/storage/v1/object/public/provider-portfolio/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const encodedPath = imageUrl.slice(markerIndex + marker.length);
  if (!encodedPath) return;
  const objectPath = decodeURIComponent(encodedPath);

  const { error: storageError } = await supabase.storage.from("provider-portfolio").remove([objectPath]);
  if (storageError) {
    throw storageError;
  }

  const { error: metadataError } = await supabase
    .from("media_assets")
    .delete()
    .eq("bucket_id", "provider-portfolio")
    .eq("object_path", objectPath);

  if (metadataError) {
    throw metadataError;
  }
};

export const linkMyProviderProfileMedia = async (providerId: string): Promise<void> => {
  const userId = await requireUserId();

  const { error } = await supabase
    .from("media_assets")
    .update({ entity_id: providerId })
    .eq("owner_user_id", userId)
    .eq("entity_type", "provider_profile")
    .is("entity_id", null);

  if (error) {
    throw error;
  }
};
