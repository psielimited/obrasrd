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
    pillClassName: "border-sky-700 bg-sky-950 text-sky-100",
    accentClassName: "text-sky-300",
    frameClassName: "border-sky-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  construccion: {
    family: "construccion",
    label: "Construccion",
    pillClassName: "border-amber-700 bg-amber-950 text-amber-100",
    accentClassName: "text-amber-300",
    frameClassName: "border-amber-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  ingenieria: {
    family: "ingenieria",
    label: "Ingenieria",
    pillClassName: "border-indigo-700 bg-indigo-950 text-indigo-100",
    accentClassName: "text-indigo-300",
    frameClassName: "border-indigo-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  terminaciones: {
    family: "terminaciones",
    label: "Terminaciones",
    pillClassName: "border-fuchsia-700 bg-fuchsia-950 text-fuchsia-100",
    accentClassName: "text-fuchsia-300",
    frameClassName: "border-fuchsia-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  instalaciones: {
    family: "instalaciones",
    label: "Instalaciones",
    pillClassName: "border-emerald-700 bg-emerald-950 text-emerald-100",
    accentClassName: "text-emerald-300",
    frameClassName: "border-emerald-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  materiales: {
    family: "materiales",
    label: "Materiales",
    pillClassName: "border-violet-700 bg-violet-950 text-violet-100",
    accentClassName: "text-violet-300",
    frameClassName: "border-violet-700/45 bg-slate-900/5 dark:bg-slate-900/30",
  },
  general: {
    family: "general",
    label: "Servicios",
    pillClassName: "border-slate-700 bg-slate-900 text-slate-100",
    accentClassName: "text-slate-200",
    frameClassName: "border-slate-600/45 bg-slate-900/5 dark:bg-slate-900/30",
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
