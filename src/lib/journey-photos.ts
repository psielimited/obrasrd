import stagePlanning from "@/assets/photos/stage-planning.jpg";
import stageConstruction from "@/assets/photos/stage-construction.jpg";
import stageMaintenance from "@/assets/photos/stage-maintenance.jpg";
import conocimientoHero from "@/assets/photos/conocimiento-hero.jpg";
import intentHands from "@/assets/photos/intent-hands.jpg";
import type { CanonicalStageSlug } from "@/lib/taxonomy";

/**
 * Single source of truth mapping lifecycle stage slug → reusable B&W asset.
 * Reused across the homepage StageExplainerSection and /conocimiento surfaces
 * so repeat visitors pay zero extra bytes.
 */
const STAGE_PHOTO_MAP: Record<CanonicalStageSlug, string> = {
  planificacion: stagePlanning,
  construccion: stageConstruction,
  mantenimiento: stageMaintenance,
};

const STAGE_PHOTO_ALT: Record<CanonicalStageSlug, string> = {
  planificacion: "Equipo dominicano revisando planos en sitio",
  construccion: "Cuadrilla trabajando en estructura de hormigon",
  mantenimiento: "Tecnico realizando mantenimiento en obra terminada",
};

export const getStagePhoto = (stageSlug: CanonicalStageSlug): string =>
  STAGE_PHOTO_MAP[stageSlug] ?? stagePlanning;

export const getStagePhotoAlt = (stageSlug: CanonicalStageSlug): string =>
  STAGE_PHOTO_ALT[stageSlug] ?? "Profesionales de construccion en obra";

export const CONOCIMIENTO_HERO_PHOTO = conocimientoHero;
export const CONOCIMIENTO_HERO_ALT =
  "Arquitecto y contratista dominicanos revisando planos en obra";

export const RELATED_PROVIDERS_AVATAR = intentHands;
export const RELATED_PROVIDERS_AVATAR_ALT = "Manos de profesionales sobre planos";
