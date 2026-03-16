export type CategoryFamily =
  | "diseno"
  | "construccion"
  | "ingenieria"
  | "terminaciones"
  | "instalaciones"
  | "materiales"
  | "general";

export interface CategoryTheme {
  family: CategoryFamily;
  label: string;
  pillClassName: string;
  accentClassName: string;
  frameClassName: string;
}

const CATEGORY_GROUPS: Record<CategoryFamily, string[]> = {
  diseno: [
    "arquitectos",
    "disenadores-interiores",
    "agentes-inmobiliarios",
  ],
  construccion: [
    "contratistas-generales",
    "albaniles",
    "excavacion",
    "limpieza-terrenos",
    "movimiento-tierra",
    "concreto",
    "cimentacion",
    "paisajismo",
    "pavimentacion",
    "portones",
    "limpieza",
  ],
  ingenieria: [
    "ingenieros-estructurales",
    "ingenieros-mep",
    "ingenieros-civiles",
    "agrimensores",
    "consultores-ambientales",
    "inspectores",
    "abogados-inmobiliarios",
    "gestores-permisos",
  ],
  terminaciones: [
    "pintores",
    "instaladores-pisos",
    "carpinteria-interior",
    "gabinetes",
    "drywall",
    "vidrieros",
    "stucco",
    "acabados-exteriores",
    "carpinteros-estructura",
  ],
  instalaciones: [
    "electricistas",
    "plomeros",
    "hvac",
    "paneles-solares",
    "redes-cableado",
    "servicios-publicos",
    "contratistas-techos",
    "aislamiento",
  ],
  materiales: ["materiales"],
  general: [],
};

const FAMILY_THEME: Record<CategoryFamily, CategoryTheme> = {
  diseno: {
    family: "diseno",
    label: "Diseno",
    pillClassName: "border-blue-700 bg-blue-700 text-white",
    accentClassName: "text-blue-200",
    frameClassName: "border-blue-700/65 bg-blue-700/10",
  },
  construccion: {
    family: "construccion",
    label: "Construccion",
    pillClassName: "border-red-700 bg-red-700 text-white",
    accentClassName: "text-red-200",
    frameClassName: "border-red-700/65 bg-red-700/10",
  },
  ingenieria: {
    family: "ingenieria",
    label: "Ingenieria",
    pillClassName: "border-blue-900 bg-blue-900 text-white",
    accentClassName: "text-blue-200",
    frameClassName: "border-blue-900/65 bg-blue-900/10",
  },
  terminaciones: {
    family: "terminaciones",
    label: "Terminaciones",
    pillClassName: "border-yellow-600 bg-yellow-300 text-yellow-950",
    accentClassName: "text-yellow-200",
    frameClassName: "border-yellow-600/70 bg-yellow-500/10",
  },
  instalaciones: {
    family: "instalaciones",
    label: "Instalaciones",
    pillClassName: "border-red-800 bg-red-800 text-white",
    accentClassName: "text-red-200",
    frameClassName: "border-red-800/65 bg-red-800/10",
  },
  materiales: {
    family: "materiales",
    label: "Materiales",
    pillClassName: "border-yellow-600 bg-yellow-300 text-yellow-950",
    accentClassName: "text-yellow-200",
    frameClassName: "border-yellow-600/70 bg-yellow-500/10",
  },
  general: {
    family: "general",
    label: "Servicios",
    pillClassName: "border-blue-700 bg-blue-700 text-white",
    accentClassName: "text-blue-200",
    frameClassName: "border-blue-700/65 bg-blue-700/10",
  },
};

const CATEGORY_TO_FAMILY = Object.entries(CATEGORY_GROUPS).reduce<Record<string, CategoryFamily>>(
  (acc, [family, slugs]) => {
    for (const slug of slugs) {
      acc[slug] = family as CategoryFamily;
    }
    return acc;
  },
  {},
);

export const getCategoryTheme = (categorySlug?: string | null): CategoryTheme => {
  if (!categorySlug) return FAMILY_THEME.general;
  const family = CATEGORY_TO_FAMILY[categorySlug] ?? "general";
  return FAMILY_THEME[family];
};
