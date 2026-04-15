import type {
  CanonicalDisciplineSlug,
  CanonicalServiceSlug,
  CanonicalStageSlug,
  CanonicalWorkTypeSlug,
} from "@/lib/taxonomy";

export interface DominicanConstructionSynonym {
  id: string;
  patterns: string[];
  canonical: {
    stageSlugs?: CanonicalStageSlug[];
    disciplineSlugs?: CanonicalDisciplineSlug[];
    serviceSlugs?: CanonicalServiceSlug[];
    workTypeSlugs?: CanonicalWorkTypeSlug[];
  };
  expansionTerms: string[];
  legacyCategorySlugs?: string[];
}

export const DOMINICAN_CONSTRUCTION_SYNONYMS: readonly DominicanConstructionSynonym[] = [
  {
    id: "poner_piso",
    patterns: ["poner piso", "instalar piso", "poner los piso", "piso de ceramica"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["diseno_interior"],
      serviceSlugs: ["remodelacion_de_cocina"],
      workTypeSlugs: ["remodelacion_interior"],
    },
    expansionTerms: ["instalacion de pisos", "acabados interiores"],
    legacyCategorySlugs: ["instaladores-pisos"],
  },
  {
    id: "tirar_loza",
    patterns: ["tirar una loza", "tirar una losa", "tirar loza", "tirar losa", "hacer losa"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion", "ingenieria_civil"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["obra gris", "estructura de concreto"],
    legacyCategorySlugs: ["concreto", "albaniles"],
  },
  {
    id: "hacer_planos",
    patterns: ["hacer planos", "sacar planos", "planos para construir", "dibujar planos"],
    canonical: {
      stageSlugs: ["planificacion"],
      disciplineSlugs: ["arquitectura"],
      serviceSlugs: ["planos_constructivos", "anteproyecto_arquitectonico"],
    },
    expansionTerms: ["planificacion", "diseno arquitectonico"],
    legacyCategorySlugs: ["arquitectos"],
  },
  {
    id: "arreglar_filtracion",
    patterns: ["arreglar filtracion", "arreglar filtraciones", "resolver filtracion", "humedad en pared"],
    canonical: {
      stageSlugs: ["mantenimiento", "construccion"],
      disciplineSlugs: ["seguridad_salud", "construccion_ejecucion"],
      serviceSlugs: ["diagnostico_de_filtraciones", "impermeabilizacion"],
      workTypeSlugs: ["mantenimiento_general", "obra_exterior"],
    },
    expansionTerms: ["fuga de agua", "sellado de techo"],
    legacyCategorySlugs: ["inspectores", "contratistas-techos"],
  },
  {
    id: "levantar_pared",
    patterns: ["levantar una pared", "hacer una pared", "tumbar y levantar pared"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion"],
      workTypeSlugs: ["remodelacion_interior", "obra_exterior"],
    },
    expansionTerms: ["mamposteria", "bloques"],
    legacyCategorySlugs: ["albaniles"],
  },
  {
    id: "hacer_marquesina",
    patterns: ["hacer una marquesina", "construir marquesina", "techar marquesina"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["estructura exterior", "techo exterior"],
    legacyCategorySlugs: ["contratistas-techos", "concreto"],
  },
  {
    id: "tirar_corriente",
    patterns: ["tirar corriente", "poner corriente", "instalar corriente", "cableado electrico"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["ingenieria_electrica"],
      serviceSlugs: ["instalacion_electrica"],
    },
    expansionTerms: ["instalacion electrica", "circuitos"],
    legacyCategorySlugs: ["electricistas", "redes-cableado"],
  },
  {
    id: "reparar_techo",
    patterns: ["reparar techo", "arreglar techo", "techo con gotera", "filtracion en techo"],
    canonical: {
      stageSlugs: ["construccion", "mantenimiento"],
      disciplineSlugs: ["construccion_ejecucion", "seguridad_salud"],
      serviceSlugs: ["impermeabilizacion", "diagnostico_de_filtraciones"],
      workTypeSlugs: ["obra_exterior", "mantenimiento_general"],
    },
    expansionTerms: ["impermeabilizacion de techo", "revestimiento"],
    legacyCategorySlugs: ["contratistas-techos", "stucco"],
  },
  {
    id: "remodelar_bano",
    patterns: ["remodelar bano", "renovar bano", "arreglar bano"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["diseno_interior", "ingenieria_sanitaria"],
      serviceSlugs: ["remodelacion_de_cocina", "diseno_hidrosanitario"],
      workTypeSlugs: ["remodelacion_interior"],
    },
    expansionTerms: ["remodelacion interior", "instalaciones sanitarias"],
    legacyCategorySlugs: ["disenadores-interiores", "plomeros"],
  },
  {
    id: "frisar_pared",
    patterns: ["frisar pared", "frisar una pared", "dar fino", "poner fino", "panete de pared"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion"],
      workTypeSlugs: ["remodelacion_interior", "obra_exterior"],
    },
    expansionTerms: ["revestimiento de pared", "acabados de pared"],
    legacyCategorySlugs: ["stucco", "albaniles"],
  },
  {
    id: "bano_filtrando",
    patterns: ["bano filtrando", "bano con filtracion", "filtracion en bano", "bano botando agua"],
    canonical: {
      stageSlugs: ["mantenimiento", "construccion"],
      disciplineSlugs: ["seguridad_salud", "ingenieria_sanitaria"],
      serviceSlugs: ["diagnostico_de_filtraciones", "diseno_hidrosanitario"],
      workTypeSlugs: ["mantenimiento_general", "remodelacion_interior"],
    },
    expansionTerms: ["fuga hidrosanitaria", "mantenimiento sanitario"],
    legacyCategorySlugs: ["plomeros", "inspectores"],
  },
  {
    id: "echar_placa",
    patterns: ["echar placa", "vaciar placa", "colar placa", "hacer placa"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion", "ingenieria_civil"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["losa de concreto", "estructura de techo"],
    legacyCategorySlugs: ["concreto", "ingenieros-civiles"],
  },
  {
    id: "cambiar_tuberia",
    patterns: ["cambiar tuberia", "reparar tuberia", "tuberia rota", "arreglar tuberia"],
    canonical: {
      stageSlugs: ["mantenimiento", "construccion"],
      disciplineSlugs: ["ingenieria_sanitaria", "seguridad_salud"],
      serviceSlugs: ["diseno_hidrosanitario", "mantenimiento_preventivo"],
      workTypeSlugs: ["mantenimiento_general", "remodelacion_interior"],
    },
    expansionTerms: ["red hidrosanitaria", "mantenimiento de plomeria"],
    legacyCategorySlugs: ["plomeros"],
  },
  {
    id: "hacer_cisterna",
    patterns: ["hacer cisterna", "construir cisterna", "cisterna nueva", "tanque soterrado"],
    canonical: {
      stageSlugs: ["construccion", "planificacion"],
      disciplineSlugs: ["ingenieria_civil", "ingenieria_sanitaria"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["almacenamiento de agua", "obra hidraulica"],
    legacyCategorySlugs: ["ingenieros-civiles", "plomeros"],
  },
  {
    id: "cerramiento_perimetral",
    patterns: ["hacer verja", "levantar verja", "muro perimetral", "cerramiento perimetral"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["construccion_ejecucion"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["cerramiento", "mamposteria exterior"],
    legacyCategorySlugs: ["albaniles"],
  },
  {
    id: "instalar_paneles",
    patterns: ["poner paneles solares", "instalar paneles", "energia solar para casa", "panel solar"],
    canonical: {
      stageSlugs: ["construccion"],
      disciplineSlugs: ["ingenieria_electrica"],
      serviceSlugs: ["instalacion_electrica"],
      workTypeSlugs: ["obra_exterior"],
    },
    expansionTerms: ["fotovoltaico", "energia renovable"],
    legacyCategorySlugs: ["paneles-solares"],
  },
] as const;
