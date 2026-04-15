export const CANONICAL_STAGE_SLUGS = [
  "planificacion",
  "construccion",
  "mantenimiento",
] as const;

export type CanonicalStageSlug = (typeof CANONICAL_STAGE_SLUGS)[number];

export const CANONICAL_DISCIPLINE_SLUGS = [
  "arquitectura",
  "ingenieria_civil",
  "ingenieria_electrica",
  "ingenieria_sanitaria",
  "topografia",
  "supervision_gerencia",
  "construccion_ejecucion",
  "diseno_interior",
  "paisajismo",
  "instalaciones_especiales",
  "seguridad_salud",
] as const;

export type CanonicalDisciplineSlug = (typeof CANONICAL_DISCIPLINE_SLUGS)[number];

export const CANONICAL_SERVICE_SLUGS = [
  "anteproyecto_arquitectonico",
  "planos_constructivos",
  "calculo_estructural",
  "levantamiento_topografico",
  "instalacion_electrica",
  "diseno_hidrosanitario",
  "supervision_de_obra",
  "impermeabilizacion",
  "remodelacion_de_cocina",
  "diagnostico_de_filtraciones",
  "mantenimiento_preventivo",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export const CANONICAL_WORK_TYPE_SLUGS = [
  "vivienda_unifamiliar",
  "edificio_multifamiliar",
  "local_comercial",
  "oficina",
  "nave_industrial",
  "remodelacion_interior",
  "obra_exterior",
  "mantenimiento_general",
] as const;

export type CanonicalWorkTypeSlug = (typeof CANONICAL_WORK_TYPE_SLUGS)[number];

export interface TaxonomyStage {
  slug: CanonicalStageSlug;
  label: string;
  description: string;
}

export interface TaxonomyDiscipline {
  slug: CanonicalDisciplineSlug;
  label: string;
  stageSlug: CanonicalStageSlug;
  description: string;
}

export interface TaxonomyService {
  slug: CanonicalServiceSlug;
  label: string;
  stageSlug: CanonicalStageSlug;
  disciplineSlug: CanonicalDisciplineSlug;
  description: string;
}

export interface TaxonomyWorkType {
  slug: CanonicalWorkTypeSlug;
  label: string;
  description: string;
}

export interface TaxonomyDisciplineNode {
  discipline: TaxonomyDiscipline;
  services: TaxonomyService[];
}

export interface TaxonomyStageNode {
  stage: TaxonomyStage;
  disciplines: TaxonomyDisciplineNode[];
}

export const CANONICAL_STAGES: readonly TaxonomyStage[] = [
  {
    slug: "planificacion",
    label: "Planificacion",
    description: "Estudios, diseno tecnico, alcance y permisos.",
  },
  {
    slug: "construccion",
    label: "Construccion",
    description: "Ejecucion de obra, instalaciones y terminaciones.",
  },
  {
    slug: "mantenimiento",
    label: "Mantenimiento",
    description: "Diagnostico, conservacion y mejora continua de activos.",
  },
] as const;

export const CANONICAL_DISCIPLINES: readonly TaxonomyDiscipline[] = [
  {
    slug: "arquitectura",
    label: "Arquitectura",
    stageSlug: "planificacion",
    description: "Diseno arquitectonico, anteproyecto y documentacion.",
  },
  {
    slug: "ingenieria_civil",
    label: "Ingenieria Civil",
    stageSlug: "planificacion",
    description: "Estructuras, suelos y soluciones civiles.",
  },
  {
    slug: "ingenieria_electrica",
    label: "Ingenieria Electrica",
    stageSlug: "construccion",
    description: "Sistemas electricos y energia en obra.",
  },
  {
    slug: "ingenieria_sanitaria",
    label: "Ingenieria Sanitaria",
    stageSlug: "planificacion",
    description: "Sistemas hidrosanitarios y drenajes.",
  },
  {
    slug: "topografia",
    label: "Topografia",
    stageSlug: "planificacion",
    description: "Levantamientos, replanteos y control de terreno.",
  },
  {
    slug: "supervision_gerencia",
    label: "Supervision y Gerencia",
    stageSlug: "construccion",
    description: "Direccion tecnica, control de calidad y cronograma.",
  },
  {
    slug: "construccion_ejecucion",
    label: "Construccion y Ejecucion",
    stageSlug: "construccion",
    description: "Ejecucion de obra gris y acabados tecnicos.",
  },
  {
    slug: "diseno_interior",
    label: "Diseno Interior",
    stageSlug: "construccion",
    description: "Espacios interiores funcionales y esteticos.",
  },
  {
    slug: "paisajismo",
    label: "Paisajismo",
    stageSlug: "construccion",
    description: "Intervenciones exteriores, vegetacion y entorno.",
  },
  {
    slug: "instalaciones_especiales",
    label: "Instalaciones Especiales",
    stageSlug: "construccion",
    description: "Sistemas especiales y equipamiento tecnico.",
  },
  {
    slug: "seguridad_salud",
    label: "Seguridad y Salud",
    stageSlug: "mantenimiento",
    description: "Prevencion, inspeccion y mantenimiento seguro.",
  },
] as const;

export const CANONICAL_SERVICES: readonly TaxonomyService[] = [
  {
    slug: "anteproyecto_arquitectonico",
    label: "Anteproyecto Arquitectonico",
    stageSlug: "planificacion",
    disciplineSlug: "arquitectura",
    description: "Conceptualizacion inicial de proyecto arquitectonico.",
  },
  {
    slug: "planos_constructivos",
    label: "Planos Constructivos",
    stageSlug: "planificacion",
    disciplineSlug: "arquitectura",
    description: "Documentacion tecnica para ejecucion y permisos.",
  },
  {
    slug: "calculo_estructural",
    label: "Calculo Estructural",
    stageSlug: "planificacion",
    disciplineSlug: "ingenieria_civil",
    description: "Memorias y calculos para estabilidad estructural.",
  },
  {
    slug: "levantamiento_topografico",
    label: "Levantamiento Topografico",
    stageSlug: "planificacion",
    disciplineSlug: "topografia",
    description: "Captura geometrica y altimetrica del terreno.",
  },
  {
    slug: "instalacion_electrica",
    label: "Instalacion Electrica",
    stageSlug: "construccion",
    disciplineSlug: "ingenieria_electrica",
    description: "Montaje y puesta en servicio de redes electricas.",
  },
  {
    slug: "diseno_hidrosanitario",
    label: "Diseno Hidrosanitario",
    stageSlug: "planificacion",
    disciplineSlug: "ingenieria_sanitaria",
    description: "Diseno de redes de agua potable y residual.",
  },
  {
    slug: "supervision_de_obra",
    label: "Supervision de Obra",
    stageSlug: "construccion",
    disciplineSlug: "supervision_gerencia",
    description: "Control tecnico de alcance, costo y calidad.",
  },
  {
    slug: "impermeabilizacion",
    label: "Impermeabilizacion",
    stageSlug: "construccion",
    disciplineSlug: "construccion_ejecucion",
    description: "Proteccion de elementos contra ingreso de humedad.",
  },
  {
    slug: "remodelacion_de_cocina",
    label: "Remodelacion de Cocina",
    stageSlug: "construccion",
    disciplineSlug: "diseno_interior",
    description: "Intervencion integral de cocina residencial o comercial.",
  },
  {
    slug: "diagnostico_de_filtraciones",
    label: "Diagnostico de Filtraciones",
    stageSlug: "mantenimiento",
    disciplineSlug: "seguridad_salud",
    description: "Inspeccion tecnica de origen y riesgos por filtracion.",
  },
  {
    slug: "mantenimiento_preventivo",
    label: "Mantenimiento Preventivo",
    stageSlug: "mantenimiento",
    disciplineSlug: "seguridad_salud",
    description: "Rutinas planificadas para reducir fallas futuras.",
  },
] as const;

export const CANONICAL_WORK_TYPES: readonly TaxonomyWorkType[] = [
  {
    slug: "vivienda_unifamiliar",
    label: "Vivienda Unifamiliar",
    description: "Casa individual para uso residencial.",
  },
  {
    slug: "edificio_multifamiliar",
    label: "Edificio Multifamiliar",
    description: "Edificaciones residenciales de varias unidades.",
  },
  {
    slug: "local_comercial",
    label: "Local Comercial",
    description: "Espacios para comercio y servicios.",
  },
  {
    slug: "oficina",
    label: "Oficina",
    description: "Espacios corporativos y administrativos.",
  },
  {
    slug: "nave_industrial",
    label: "Nave Industrial",
    description: "Infraestructura para produccion y logistica.",
  },
  {
    slug: "remodelacion_interior",
    label: "Remodelacion Interior",
    description: "Renovacion de espacios interiores existentes.",
  },
  {
    slug: "obra_exterior",
    label: "Obra Exterior",
    description: "Intervenciones exteriores y urbanizacion.",
  },
  {
    slug: "mantenimiento_general",
    label: "Mantenimiento General",
    description: "Servicios de mantenimiento integral.",
  },
] as const;

const stageBySlug = new Map(CANONICAL_STAGES.map((item) => [item.slug, item]));
const disciplineBySlug = new Map(CANONICAL_DISCIPLINES.map((item) => [item.slug, item]));
const serviceBySlug = new Map(CANONICAL_SERVICES.map((item) => [item.slug, item]));
const workTypeBySlug = new Map(CANONICAL_WORK_TYPES.map((item) => [item.slug, item]));

export const getTaxonomyStage = (slug: CanonicalStageSlug) => stageBySlug.get(slug);
export const getTaxonomyDiscipline = (slug: CanonicalDisciplineSlug) => disciplineBySlug.get(slug);
export const getTaxonomyService = (slug: CanonicalServiceSlug) => serviceBySlug.get(slug);
export const getTaxonomyWorkType = (slug: CanonicalWorkTypeSlug) => workTypeBySlug.get(slug);

export const listDisciplinesByStage = (stageSlug: CanonicalStageSlug): TaxonomyDiscipline[] =>
  CANONICAL_DISCIPLINES.filter((item) => item.stageSlug === stageSlug);

export const listServicesByStage = (stageSlug: CanonicalStageSlug): TaxonomyService[] =>
  CANONICAL_SERVICES.filter((item) => item.stageSlug === stageSlug);

export const listServicesByDiscipline = (disciplineSlug: CanonicalDisciplineSlug): TaxonomyService[] =>
  CANONICAL_SERVICES.filter((item) => item.disciplineSlug === disciplineSlug);

export const listServicesByStageAndDiscipline = (
  stageSlug: CanonicalStageSlug,
  disciplineSlug: CanonicalDisciplineSlug,
): TaxonomyService[] =>
  CANONICAL_SERVICES.filter(
    (item) => item.stageSlug === stageSlug && item.disciplineSlug === disciplineSlug,
  );

export const buildTaxonomyHierarchy = (): TaxonomyStageNode[] =>
  CANONICAL_STAGES.map((stage) => {
    const disciplines = listDisciplinesByStage(stage.slug).map((discipline) => ({
      discipline,
      services: listServicesByStageAndDiscipline(stage.slug, discipline.slug),
    }));

    return {
      stage,
      disciplines,
    };
  });

export const CANONICAL_TAXONOMY_HIERARCHY = buildTaxonomyHierarchy();

export const getSeoStagePath = (stageSlug: CanonicalStageSlug) => `/etapas/${stageSlug}`;

export const getSeoDisciplinePath = (
  stageSlug: CanonicalStageSlug,
  disciplineSlug: CanonicalDisciplineSlug,
) => `/etapas/${stageSlug}/disciplinas/${disciplineSlug}`;

export const getSeoServicePath = (
  stageSlug: CanonicalStageSlug,
  disciplineSlug: CanonicalDisciplineSlug,
  serviceSlug: CanonicalServiceSlug,
) => `/etapas/${stageSlug}/disciplinas/${disciplineSlug}/servicios/${serviceSlug}`;
