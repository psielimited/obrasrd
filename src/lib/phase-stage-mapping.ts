import type { CanonicalStageSlug } from "@/lib/taxonomy";
import { getStagePhoto, getStagePhotoAlt } from "@/lib/journey-photos";

/**
 * Maps the 6 detailed phases (used in `/fase/:slug`) to the 3 lifecycle stages
 * shown on the homepage and `/conocimiento`. This keeps numbering and imagery
 * consistent across all public surfaces.
 */
export interface LifecycleStageInfo {
  stageSlug: CanonicalStageSlug;
  stageNumber: "01" | "02" | "03";
  stageLabel: string;
  photo: string;
  photoAlt: string;
}

const STAGE_META: Record<CanonicalStageSlug, { number: "01" | "02" | "03"; label: string }> = {
  planificacion: { number: "01", label: "Planificación" },
  construccion: { number: "02", label: "Construcción" },
  mantenimiento: { number: "03", label: "Mantenimiento" },
};

const PHASE_TO_STAGE_MAP: Record<string, CanonicalStageSlug> = {
  "pre-construccion": "planificacion",
  "preparacion-cimentacion": "construccion",
  "construccion-estructural": "construccion",
  "instalacion-sistemas": "construccion",
  "acabados-interiores": "construccion",
  "trabajo-final": "mantenimiento",
};

export const getLifecycleStageForPhase = (phaseSlug: string | undefined): LifecycleStageInfo => {
  const stageSlug = (phaseSlug && PHASE_TO_STAGE_MAP[phaseSlug]) || "planificacion";
  const meta = STAGE_META[stageSlug];
  return {
    stageSlug,
    stageNumber: meta.number,
    stageLabel: meta.label,
    photo: getStagePhoto(stageSlug),
    photoAlt: getStagePhotoAlt(stageSlug),
  };
};
