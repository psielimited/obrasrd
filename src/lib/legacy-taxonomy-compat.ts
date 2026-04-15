import {
  getTaxonomyDiscipline,
  getTaxonomyService,
  getTaxonomyStage,
  getTaxonomyWorkType,
  type CanonicalDisciplineSlug,
  type CanonicalServiceSlug,
  type CanonicalStageSlug,
  type CanonicalWorkTypeSlug,
} from "@/lib/taxonomy";

export type LegacyMappingStatus = "fully_mapped" | "ambiguous" | "unmapped";

export interface LegacyCategoryTaxonomyMapping {
  legacyCategorySlug: string;
  stageSlug?: CanonicalStageSlug;
  disciplineSlug?: CanonicalDisciplineSlug;
  serviceSlug?: CanonicalServiceSlug;
  workTypeSlug?: CanonicalWorkTypeSlug;
  confidence?: number;
  status: LegacyMappingStatus;
  ambiguityReason?: string;
}

const LEGACY_MAPPINGS: readonly LegacyCategoryTaxonomyMapping[] = [
  { legacyCategorySlug: "arquitectos", stageSlug: "planificacion", disciplineSlug: "arquitectura", serviceSlug: "anteproyecto_arquitectonico", status: "fully_mapped", confidence: 0.99 },
  { legacyCategorySlug: "ingenieros-estructurales", stageSlug: "planificacion", disciplineSlug: "ingenieria_civil", serviceSlug: "calculo_estructural", status: "fully_mapped", confidence: 0.99 },
  { legacyCategorySlug: "ingenieros-mep", stageSlug: "planificacion", disciplineSlug: "ingenieria_sanitaria", serviceSlug: "diseno_hidrosanitario", status: "ambiguous", confidence: 0.85, ambiguityReason: "MEP cubre varias disciplinas." },
  { legacyCategorySlug: "agrimensores", stageSlug: "planificacion", disciplineSlug: "topografia", serviceSlug: "levantamiento_topografico", status: "fully_mapped", confidence: 0.99 },
  { legacyCategorySlug: "consultores-ambientales", status: "unmapped" },
  { legacyCategorySlug: "abogados-inmobiliarios", status: "unmapped" },
  { legacyCategorySlug: "gestores-permisos", status: "unmapped" },
  { legacyCategorySlug: "agentes-inmobiliarios", status: "unmapped" },

  { legacyCategorySlug: "excavacion", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.8, ambiguityReason: "Categoria de movimiento de tierra sin servicio canonico dedicado." },
  { legacyCategorySlug: "limpieza-terrenos", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.78, ambiguityReason: "Categoria de preparacion de terreno sin servicio canonico dedicado." },
  { legacyCategorySlug: "movimiento-tierra", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.8, ambiguityReason: "Categoria de movimiento de tierra sin servicio canonico dedicado." },
  { legacyCategorySlug: "concreto", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.82, ambiguityReason: "No existe servicio canonico de obra gris/concreto." },
  { legacyCategorySlug: "cimentacion", stageSlug: "planificacion", disciplineSlug: "ingenieria_civil", serviceSlug: "calculo_estructural", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.84, ambiguityReason: "Categoria mezcla calculo y ejecucion." },
  { legacyCategorySlug: "ingenieros-civiles", stageSlug: "planificacion", disciplineSlug: "ingenieria_civil", serviceSlug: "calculo_estructural", status: "fully_mapped", confidence: 0.96 },
  { legacyCategorySlug: "servicios-publicos", stageSlug: "construccion", disciplineSlug: "ingenieria_electrica", serviceSlug: "instalacion_electrica", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.8, ambiguityReason: "Puede incluir electrico/sanitario/telecom." },

  { legacyCategorySlug: "contratistas-generales", stageSlug: "construccion", disciplineSlug: "supervision_gerencia", serviceSlug: "supervision_de_obra", status: "ambiguous", confidence: 0.9, ambiguityReason: "Puede abarcar supervision y ejecucion." },
  { legacyCategorySlug: "carpinteros-estructura", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.76, ambiguityReason: "No existe servicio canonico de carpinteria estructural." },
  { legacyCategorySlug: "contratistas-techos", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "fully_mapped", confidence: 0.9 },
  { legacyCategorySlug: "aislamiento", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.82, ambiguityReason: "Aislamiento tiene multiples variantes." },
  { legacyCategorySlug: "acabados-exteriores", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.8, ambiguityReason: "Acabados exteriores no tiene servicio canonico exacto." },
  { legacyCategorySlug: "stucco", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.86, ambiguityReason: "Stucco es una especialidad de acabado no explicita." },
  { legacyCategorySlug: "albaniles", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.78, ambiguityReason: "No existe servicio canonico de albanileria." },

  { legacyCategorySlug: "electricistas", stageSlug: "construccion", disciplineSlug: "ingenieria_electrica", serviceSlug: "instalacion_electrica", status: "fully_mapped", confidence: 0.99 },
  { legacyCategorySlug: "plomeros", stageSlug: "planificacion", disciplineSlug: "ingenieria_sanitaria", serviceSlug: "diseno_hidrosanitario", status: "ambiguous", confidence: 0.9, ambiguityReason: "Categoria de instalacion; servicio canonico disponible es de diseno." },
  { legacyCategorySlug: "hvac", stageSlug: "construccion", disciplineSlug: "ingenieria_electrica", serviceSlug: "instalacion_electrica", status: "ambiguous", confidence: 0.74, ambiguityReason: "HVAC no tiene servicio canonico dedicado." },
  { legacyCategorySlug: "paneles-solares", stageSlug: "construccion", disciplineSlug: "ingenieria_electrica", serviceSlug: "instalacion_electrica", workTypeSlug: "obra_exterior", status: "fully_mapped", confidence: 0.92 },
  { legacyCategorySlug: "redes-cableado", stageSlug: "construccion", disciplineSlug: "ingenieria_electrica", serviceSlug: "instalacion_electrica", status: "ambiguous", confidence: 0.83, ambiguityReason: "Cableado puede incluir voz/datos/electrico." },

  { legacyCategorySlug: "pintores", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "ambiguous", confidence: 0.84, ambiguityReason: "No existe servicio canonico de pintura." },
  { legacyCategorySlug: "instaladores-pisos", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "ambiguous", confidence: 0.82, ambiguityReason: "No existe servicio canonico de pisos." },
  { legacyCategorySlug: "carpinteria-interior", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "ambiguous", confidence: 0.86, ambiguityReason: "Categoria amplia de interiores." },
  { legacyCategorySlug: "gabinetes", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "fully_mapped", confidence: 0.9 },
  { legacyCategorySlug: "disenadores-interiores", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "fully_mapped", confidence: 0.9 },
  { legacyCategorySlug: "drywall", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "ambiguous", confidence: 0.82, ambiguityReason: "No existe servicio canonico de drywall." },
  { legacyCategorySlug: "vidrieros", stageSlug: "construccion", disciplineSlug: "diseno_interior", serviceSlug: "remodelacion_de_cocina", workTypeSlug: "remodelacion_interior", status: "ambiguous", confidence: 0.78, ambiguityReason: "No existe servicio canonico de vidrieria." },

  { legacyCategorySlug: "paisajismo", status: "unmapped" },
  { legacyCategorySlug: "pavimentacion", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.82, ambiguityReason: "No existe servicio canonico de pavimentacion." },
  { legacyCategorySlug: "portones", stageSlug: "construccion", disciplineSlug: "construccion_ejecucion", serviceSlug: "impermeabilizacion", workTypeSlug: "obra_exterior", status: "ambiguous", confidence: 0.78, ambiguityReason: "No existe servicio canonico de portones." },
  { legacyCategorySlug: "limpieza", stageSlug: "mantenimiento", disciplineSlug: "seguridad_salud", serviceSlug: "mantenimiento_preventivo", workTypeSlug: "mantenimiento_general", status: "ambiguous", confidence: 0.75, ambiguityReason: "Puede ser limpieza post-obra o mantenimiento." },
  { legacyCategorySlug: "inspectores", stageSlug: "mantenimiento", disciplineSlug: "seguridad_salud", serviceSlug: "diagnostico_de_filtraciones", workTypeSlug: "mantenimiento_general", status: "ambiguous", confidence: 0.72, ambiguityReason: "Inspeccion de construccion sin servicio canonico dedicado." },
] as const;

const mappingByLegacyCategory = new Map(
  LEGACY_MAPPINGS.map((mapping) => [mapping.legacyCategorySlug, mapping]),
);

export const getLegacyCategoryTaxonomyMapping = (legacyCategorySlug?: string | null) => {
  if (!legacyCategorySlug) return undefined;
  return mappingByLegacyCategory.get(legacyCategorySlug);
};

export const getLegacyCategoryMappingStatus = (legacyCategorySlug?: string | null): LegacyMappingStatus =>
  getLegacyCategoryTaxonomyMapping(legacyCategorySlug)?.status ?? "unmapped";

export const getLegacyTaxonomySearchTerms = (legacyCategorySlug?: string | null): string[] => {
  const mapping = getLegacyCategoryTaxonomyMapping(legacyCategorySlug);
  if (!mapping) return [];

  const stage = mapping.stageSlug ? getTaxonomyStage(mapping.stageSlug) : undefined;
  const discipline = mapping.disciplineSlug ? getTaxonomyDiscipline(mapping.disciplineSlug) : undefined;
  const service = mapping.serviceSlug ? getTaxonomyService(mapping.serviceSlug) : undefined;
  const workType = mapping.workTypeSlug ? getTaxonomyWorkType(mapping.workTypeSlug) : undefined;

  return [
    mapping.stageSlug,
    stage?.label,
    mapping.disciplineSlug,
    discipline?.label,
    mapping.serviceSlug,
    service?.label,
    mapping.workTypeSlug,
    workType?.label,
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());
};

export interface LegacyCategoryDisplayFallback {
  stageLabel?: string;
  disciplineLabel?: string;
  serviceLabel?: string;
  workTypeLabel?: string;
  status: LegacyMappingStatus;
  ambiguityReason?: string;
}

export const getLegacyCategoryDisplayFallback = (
  legacyCategorySlug?: string | null,
): LegacyCategoryDisplayFallback | undefined => {
  const mapping = getLegacyCategoryTaxonomyMapping(legacyCategorySlug);
  if (!mapping) return undefined;

  return {
    stageLabel: mapping.stageSlug ? getTaxonomyStage(mapping.stageSlug)?.label : undefined,
    disciplineLabel: mapping.disciplineSlug ? getTaxonomyDiscipline(mapping.disciplineSlug)?.label : undefined,
    serviceLabel: mapping.serviceSlug ? getTaxonomyService(mapping.serviceSlug)?.label : undefined,
    workTypeLabel: mapping.workTypeSlug ? getTaxonomyWorkType(mapping.workTypeSlug)?.label : undefined,
    status: mapping.status,
    ambiguityReason: mapping.ambiguityReason,
  };
};

export const LEGACY_CATEGORY_TAXONOMY_MAPPINGS = LEGACY_MAPPINGS;
