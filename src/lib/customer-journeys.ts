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
import { PUBLIC_ROUTES } from "@/lib/public-ia";

export const CUSTOMER_JOURNEY_SLUGS = [
  "construir-casa-desde-cero",
  "remodelar-cocina-bano",
  "resolver-filtracion",
  "planos-y-permisos",
  "supervision-de-obra",
  "mantenimiento-inmueble",
] as const;

export type CustomerJourneySlug = (typeof CUSTOMER_JOURNEY_SLUGS)[number];

export interface CustomerJourneyDefinition {
  slug: CustomerJourneySlug;
  title: string;
  summary: string;
  resourceType: "articulo_tecnico" | "guia_practica" | "conocimiento_practico";
  stageSlug: CanonicalStageSlug;
  workTypeSlug?: CanonicalWorkTypeSlug;
  disciplineSlugs: CanonicalDisciplineSlug[];
  serviceSlugs: CanonicalServiceSlug[];
  preparationChecklist: string[];
  dominicanContextNote: string;
  intakeIntent: string;
}

export const JOURNEY_RESOURCE_TYPE_LABELS: Record<CustomerJourneyDefinition["resourceType"], string> = {
  articulo_tecnico: "Articulo tecnico",
  guia_practica: "Guia practica",
  conocimiento_practico: "Conocimiento practico",
};

export const LIFECYCLE_STAGE_ORDER: readonly CanonicalStageSlug[] = [
  "planificacion",
  "construccion",
  "mantenimiento",
] as const;

export const CUSTOMER_JOURNEYS: readonly CustomerJourneyDefinition[] = [
  {
    slug: "construir-casa-desde-cero",
    title: "Quiero construir una casa desde cero",
    summary: "Ruta para arrancar vivienda unifamiliar con base tecnica, permisos y ejecucion ordenada.",
    resourceType: "guia_practica",
    stageSlug: "planificacion",
    workTypeSlug: "vivienda_unifamiliar",
    disciplineSlugs: ["arquitectura", "ingenieria_civil", "topografia"],
    serviceSlugs: [
      "anteproyecto_arquitectonico",
      "planos_constructivos",
      "calculo_estructural",
      "levantamiento_topografico",
    ],
    preparationChecklist: [
      "Tener ubicacion del solar y metraje aproximado.",
      "Definir presupuesto objetivo y margen de contingencia.",
      "Preparar necesidades de espacios (habitaciones, parqueos, niveles).",
      "Reunir documentos del terreno para permisos y diseno.",
    ],
    dominicanContextNote: "Considera normativas municipales y tiempos de permisos en ayuntamientos de RD antes de iniciar obra.",
    intakeIntent: "construir_casa",
  },
  {
    slug: "remodelar-cocina-bano",
    title: "Quiero remodelar cocina y bano",
    summary: "Ruta practica para renovar interiores sin perder control de costos, secuencia y acabados.",
    resourceType: "conocimiento_practico",
    stageSlug: "construccion",
    workTypeSlug: "remodelacion_interior",
    disciplineSlugs: ["diseno_interior", "ingenieria_sanitaria", "ingenieria_electrica"],
    serviceSlugs: [
      "remodelacion_de_cocina",
      "diseno_hidrosanitario",
      "instalacion_electrica",
    ],
    preparationChecklist: [
      "Definir si se mantiene o cambia distribucion de puntos de agua y luz.",
      "Tomar medidas basicas de cocina y bano con fotos actuales.",
      "Listar acabados deseados (pisos, topes, griferia, iluminacion).",
      "Definir rango de presupuesto y fecha limite de entrega.",
    ],
    dominicanContextNote: "Incluye materiales disponibles en ferreterias locales y tiempos reales de suplidores en Santo Domingo o Santiago.",
    intakeIntent: "remodelar_cocina_bano",
  },
  {
    slug: "resolver-filtracion",
    title: "Necesito resolver una filtracion",
    summary: "Ruta de diagnostico y correccion para detener humedad y evitar danos mayores.",
    resourceType: "articulo_tecnico",
    stageSlug: "mantenimiento",
    workTypeSlug: "mantenimiento_general",
    disciplineSlugs: ["seguridad_salud", "construccion_ejecucion"],
    serviceSlugs: ["diagnostico_de_filtraciones", "impermeabilizacion"],
    preparationChecklist: [
      "Identificar desde cuando aparece la humedad y en que zonas.",
      "Tomar fotos del dano en paredes, techos o plafones.",
      "Anotar si ocurre con lluvia, uso de tuberias o ambos casos.",
      "Tener acceso al area afectada para inspeccion tecnica.",
    ],
    dominicanContextNote: "En zonas costeras de RD, prioriza soluciones compatibles con alta salinidad y lluvias intensas.",
    intakeIntent: "filtracion",
  },
  {
    slug: "planos-y-permisos",
    title: "Necesito hacer planos y permisos",
    summary: "Ruta para estructurar documentacion tecnica y tramites antes de construir.",
    resourceType: "articulo_tecnico",
    stageSlug: "planificacion",
    workTypeSlug: "local_comercial",
    disciplineSlugs: ["arquitectura", "ingenieria_civil", "ingenieria_sanitaria"],
    serviceSlugs: ["anteproyecto_arquitectonico", "planos_constructivos", "calculo_estructural"],
    preparationChecklist: [
      "Definir uso del inmueble y area aproximada a intervenir.",
      "Reunir titulo, planos existentes y documentos del terreno.",
      "Validar restricciones locales o del condominio si aplica.",
      "Preparar cronograma deseado para tramites y arranque de obra.",
    ],
    dominicanContextNote: "Verifica requisitos segun municipio (Distrito Nacional, Santiago, Punta Cana) para evitar devoluciones de expediente.",
    intakeIntent: "planos_permisos",
  },
  {
    slug: "supervision-de-obra",
    title: "Necesito supervision de obra",
    summary: "Ruta para control tecnico de calidad, costos y avance durante ejecucion.",
    resourceType: "guia_practica",
    stageSlug: "construccion",
    workTypeSlug: "obra_exterior",
    disciplineSlugs: ["supervision_gerencia", "ingenieria_civil", "construccion_ejecucion"],
    serviceSlugs: ["supervision_de_obra", "calculo_estructural"],
    preparationChecklist: [
      "Tener contrato o alcance actual de contratistas involucrados.",
      "Preparar cronograma de obra y presupuesto vigente.",
      "Listar problemas actuales: retrasos, cambios, calidad o costos.",
      "Compartir planos y especificaciones tecnicas disponibles.",
    ],
    dominicanContextNote: "Incluye bitacora de obra y control de cubicaciones, practica comun en proyectos residenciales y comerciales en RD.",
    intakeIntent: "supervision_obra",
  },
  {
    slug: "mantenimiento-inmueble",
    title: "Necesito mantenimiento para un inmueble",
    summary: "Ruta para plan preventivo/correctivo que mantenga operativa la propiedad.",
    resourceType: "conocimiento_practico",
    stageSlug: "mantenimiento",
    workTypeSlug: "mantenimiento_general",
    disciplineSlugs: ["seguridad_salud", "instalaciones_especiales", "ingenieria_electrica"],
    serviceSlugs: ["mantenimiento_preventivo", "instalacion_electrica"],
    preparationChecklist: [
      "Listar equipos e instalaciones criticas (bombeo, tablero, techos, etc.).",
      "Definir frecuencia deseada de mantenimiento (mensual/trimestral).",
      "Registrar incidencias recurrentes y ultimas reparaciones.",
      "Alinear horario de acceso para visitas tecnicas y trabajos.",
    ],
    dominicanContextNote: "Prioriza mantenimiento de impermeabilizacion, bombeo y sistemas electricos por clima humedo y variaciones de voltaje en RD.",
    intakeIntent: "mantenimiento_inmueble",
  },
] as const;

const journeyBySlug = new Map(CUSTOMER_JOURNEYS.map((journey) => [journey.slug, journey]));

export const getCustomerJourneyBySlug = (slug?: string) => {
  if (!slug) return undefined;
  return journeyBySlug.get(slug as CustomerJourneySlug);
};

export interface JourneyFilterTarget {
  etapa: string;
  disciplina: string;
  servicio: string;
  tipoObra: string;
}

export const toJourneyFilterTarget = (journey: CustomerJourneyDefinition): JourneyFilterTarget => ({
  etapa: journey.stageSlug,
  disciplina: journey.disciplineSlugs[0] ?? "",
  servicio: journey.serviceSlugs[0] ?? "",
  tipoObra: journey.workTypeSlug ?? "",
});

export const toJourneySearchHref = (journey: CustomerJourneyDefinition) => {
  const params = new URLSearchParams();
  const target = toJourneyFilterTarget(journey);

  if (target.etapa) params.set("etapa", target.etapa);
  if (target.disciplina) params.set("disciplina", target.disciplina);
  if (target.servicio) params.set("servicio", target.servicio);
  if (target.tipoObra) params.set("tipo_obra", target.tipoObra);

  return `${PUBLIC_ROUTES.directorio}?${params.toString()}`;
};

export const toJourneyIntakeHref = (journey: CustomerJourneyDefinition) =>
  `/proyectos?intencion=${encodeURIComponent(journey.intakeIntent)}`;

export const getJourneyStageLabel = (journey: CustomerJourneyDefinition) =>
  getTaxonomyStage(journey.stageSlug)?.label ?? journey.stageSlug;

export const getJourneyWorkTypeLabel = (journey: CustomerJourneyDefinition) =>
  journey.workTypeSlug ? (getTaxonomyWorkType(journey.workTypeSlug)?.label ?? journey.workTypeSlug) : undefined;

export const getJourneyDisciplineLabels = (journey: CustomerJourneyDefinition) =>
  journey.disciplineSlugs.map((slug) => getTaxonomyDiscipline(slug)?.label ?? slug);

export const getJourneyServiceLabels = (journey: CustomerJourneyDefinition) =>
  journey.serviceSlugs.map((slug) => getTaxonomyService(slug)?.label ?? slug);

export const getJourneyResourceTypeLabel = (journey: CustomerJourneyDefinition) =>
  JOURNEY_RESOURCE_TYPE_LABELS[journey.resourceType];

export const groupJourneysByLifecycleStage = (journeys: readonly CustomerJourneyDefinition[]) =>
  LIFECYCLE_STAGE_ORDER.map((stageSlug) => ({
    stageSlug,
    stageLabel: getTaxonomyStage(stageSlug)?.label ?? stageSlug,
    stageDescription: getTaxonomyStage(stageSlug)?.description ?? "",
    journeys: journeys.filter((journey) => journey.stageSlug === stageSlug),
  }));
